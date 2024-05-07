import { db } from "@/db"
import { pinecone } from "@/lib/pinecone/core"
import { trpcServer } from '@/trpc/trpc-caller'

import { SendMessageValidator } from "@/lib/validators/SendMessageValidator"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextRequest } from "next/server"
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { openai } from "@/lib/openai"
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { ContextType } from '@prisma/client';
import { PLANS } from "@/config/stripe"
import { countMessageTokens, countTikTokens, countVectorStoreTokens } from "@/lib/tiktoken/core"


export const POST = async (req: NextRequest) => {

  // Parse the JSON body from the request
  const body = await req.json()

  // Get user session from Kinde authentication
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  ///////////////////////////////////////////////////////////////////
  // WE NEED AN IS SUBSCRIBED SO WE CAN DECIDE ON THE STRIPE PLAN! //
  ///////////////////////////////////////////////////////////////////


  // If no user ID is found, return an unauthorized response
  if (!user?.id) return new Response('Unauthorized', { status: 401 })
  const { id: userId } = user

  // Validate the incoming request body using Zod to ensure it contains the expected fields
  const { fileId, message: queryMessage } = SendMessageValidator.parse(body)

  // Now we use the fileId to find the pdf we are looking for
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      kindeId: userId,
    },
  })

  if (!file) {
    return new Response('Not found', { status: 404 })
  }

  // Which page of the pdf is most relevant to the question that the user is asking, retrieve that page for context and send it to the llm together
  await db.message.create({
    data: {
      text: queryMessage,
      isUserMessage: true,
      kindeId: userId,
      fileId,
    },
  })

  const gptModel = PLANS[1].gptModel
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY, })
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)

  // vector store the most relevant pdf page to this message
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      namespace: file.id,
    }
  )

  // Perform a similarity search in Pinecone to find relevant PDF pages
  const vectorStoreResults = await vectorStore.similaritySearch(
    queryMessage,
    PLANS[1].vectorStoreCap      // How many results, or pdf pages we want back. So this is the closest matches to our question.
  )

  /**
      MMR HERE! - Maximum Marginal Relevance? 
      https://medium.com/@onkarmishra/using-langchain-for-question-answering-on-own-data-3af0a82789ed
  
      The idea behind MMR is we first query the vector store and choose the “fetch_k” most similar responses. 
      Now, we work on this smaller set of “fetch_k” documents and optimize to achieve both relevance to the 
      query and diversity among the results. Finally, we choose the “k” most diverse response within these 
      “fetch_k” responses.
  
      Here, we were able to diverse results by using MMR search. Now, we can compare the results for 
      similarity search and maximum marginal relevance search results.
     */

  /**
    METADATA HERE!  
    
    Used to address specificity in the search. Earlier, we found that the answer to the query “What 
    did they say about regression in the third lecture?” returned results not just from the third 
    lecture but also from the first and second lectures. To address this, we will specify a metadata 
    filter to solve the above. So th epoint being is to provide context for each embedded chunk.
  */

  /**
    SELF QUERY HERE!  
    
    Self Query is an important tool when we want to infer metadata from the query itself. We can use 
    SelfQueryRetriever, which uses an LLM to extract:
      - The query string to use for vector search
      - A metadata filter to pass in as well
    
    This method is used when we have a query not solely about the content that we want to look up 
    semantically but also includes some metadata that we want to apply a filter on.
  */

  /**
    CONTEXTUAL COMPRESSION!  
    
    Since passing the full document through the application can lead to more expensive LLM calls and 
    poorer response, it is useful to pull out only the most relevant bits of the retrieved passages.

    With compression, we run all our documents through a language model and extract the most relevant 
    segments and then pass only the most relevant segments into a final language model call. This 
    comes at the cost of making more calls to the LM, but it’s also good to focus the final answer 
    on only the most important things. And so it’s a bit of a tradeoff.
*/

  // Retrieve previous messages related to the PROJECT
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: PLANS[1].prevMessagesCap
  })

  // Now send this to open ai to answer your questions, and open ai requires very specific formatting
  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const), // we use const because if we don't we will get a typescript error
    content: msg.text,
  }))

  // Create a QueryCost document so we can start adding various token counts to it
  const queryCost = await db.queryCost.create({
    data: {
      kindeId: userId,
      fileId: fileId
    }
  })

  // Create a completion request to OpenAI with the current and previous messages
  const response = await openai.chat.completions.create({
    model: gptModel.name,
    temperature: 0,
    stream: true,   // We plan to stream the responses back to the front end in real time
    // These msgs serve one purpose: we want the previous messages that were exchanged in this chat, so if you are referencing something from a couple messages ago, the ai will know what you mean
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
          if (message.role === 'user')
            return `User: ${message.content}\n`
          return `Assistant: ${message.content}\n`
        })}
  
  \n----------------\n
  
  CONTEXT:
  ${vectorStoreResults.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${queryMessage}`,
      },
    ],
  })


  // Stream OpenAI response and handle completion
  const stream = OpenAIStream(response, {

    async onStart() {

      // Calculate token counts for various contexts
      const queryMessageTokens = countTikTokens(queryMessage).length
      const vectorStoreTokens = countVectorStoreTokens([vectorStoreResults])
      const prevMessageTokens = countMessageTokens(formattedPrevMessages, gptModel.extraTokenCosts)

      // Context types and their respective token counts
      const contextTypes = [
        { type: ContextType.QUERY_MESSAGE, tokens: queryMessageTokens },
        { type: ContextType.PREV_MESSAGES, tokens: prevMessageTokens },
        { type: ContextType.VECTOR_STORES, tokens: vectorStoreTokens },
      ]

      // Add TokenCost documents to db 
      await Promise.all(
        contextTypes.map(({ type, tokens }) =>
          db.tokenCost.create({
            data: {
              kindeId: userId,
              contextType: type,
              gptModel: gptModel.name,
              totalTokens: tokens,
              queryCostId: queryCost.id
            }
          })
        )
      )
    },

    async onCompletion(completion) {

      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          kindeId: userId,
        },
      })

      // Calculate token counts for GPT completion
      const completionTokens = countTikTokens(completion).length
      // Add TokenCost document to Mongo 
      await db.tokenCost.create({
        data: {
          kindeId: userId,
          contextType: ContextType.GPT_COMPLETION,
          gptModel: gptModel.name,
          totalTokens: completionTokens,
          queryCostId: queryCost.id
        }
      })
    },
  })

  // Pass in the stream here so we can stream a response to the client in real time
  return new StreamingTextResponse(stream)

}