import { db } from "@/db"
import { openai } from "@/lib/openai"
import { PLANS } from "@/config/stripe"
// Project Imports
import { pinecone } from "@/lib/pinecone/core"
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator"
import { countMessageTokens, countTikTokens, countVectorStoreTokens } from "@/lib/tiktoken/core"
// 3rd Party Imports
import { NextRequest } from "next/server"
import { ContextType } from '@prisma/client';
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

/** ===================================|| ROUTE - /api/message/file ||======================================  
 
    When we index a pdf file, for each message that we want answered in the chat we are going to index the 
    entire pdf, first. And then based on the question, we can find the parts of the pdf, in text, that are 
    most relevant to the question by their similarity. Cosine products calculates the closest vectors to one 
    another.

    We made custom route here instead of a TRPC route because trpc can't handle streaming!

    Overview:
      -   Authenticating users and validating the incoming JSON payload against predefined schemas 
      -   Retrieves fileID from a server-side trpc call, verifying file existence before proceeding
      -   Messages are logged in MongoDB with relevant fileId and user identifiers
      -   Uses OpenAI's embeddings API and Pinecone's vector database to generate and search for text embeddings, 
          aiming to find content within question files that best matches the user's query.
      -   Formatting and combining previous messages and relevant document content, which is fed into OpenAI's 
          chat model
      -   Implements real-time response streaming back to the client, using OpenAI's streaming      

**/

export const POST = async (req: NextRequest) => {

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) return new Response('Unauthorized', { status: 401 })

  const { id: userId } = user

  const body = await req.json()                                 // Parse the JSON body from the incoming request
  const {
    fileId,
    message: queryMessage } = SendMessageValidator.parse(body)  // Validate the incoming request body with Zod 

  const file = await db.file.findFirst({                        // Use the fileId to find the pdf document
    where: {
      id: fileId,
      kindeId: userId,
    },
  })

  if (!file) {
    return new Response('Not found', { status: 404 })
  }

  await db.message.create({                                     // Take the queryMessage and create a new message document
    data: {
      text: queryMessage,
      isUserMessage: true,
      kindeId: userId,
      fileId: file.id,
    },
  })

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                             WE NEED AN IS SUBSCRIBED SO WE CAN DECIDE ON THE STRIPE PLAN! //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const gptModel = PLANS[1].gptModel
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY, })
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)

  const vectorStore = await PineconeStore.fromExistingIndex(     // Create a Pinecone Store for the message embeddings
    embeddings,
    {
      pineconeIndex,
      namespace: file.id,
    }
  )

  const vectorStoreResults = await vectorStore.similaritySearch( // Perform a similarity search to find relevant PDF pages
    queryMessage,
    PLANS[1].vectorStoreCap                                      // How many results, or pdf pages we want the search to return back. 
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

  const prevMessages = await db.message.findMany({            // Retrieve previous messages related to the file
    where: {
      fileId: file.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: PLANS[1].prevMessagesCap
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({  // Open ai requires very specific formatting for its messages
    role: msg.isUserMessage
      ? ('user' as const)                                     // We use const because if we don't we will get a typescript error
      : ('assistant' as const),
    content: msg.text,
  }))

  const queryCost = await db.queryCost.create({               // Create a QueryCost document so we can monitor query costs
    data: {
      kindeId: userId,
      fileId: file.id
    }
  })

  const response = await openai.chat.completions.create({     // Create a completion request to OpenAI 
    model: gptModel.name,
    temperature: 0,
    stream: true,                                             // Stream the responses back to the front end in real time   
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

  const stream = OpenAIStream(response, {                             // Stream OpenAI response and handle completion

    async onStart() {
      const queryMessageTokens = countTikTokens(queryMessage).length  // Calculate token counts for the included contexts
      const vectorStoreTokens = countVectorStoreTokens([vectorStoreResults])
      const prevMessageTokens = countMessageTokens(formattedPrevMessages, gptModel.extraTokenCosts)

      const contextTypes = [                                          // Context types and their respective token counts
        { type: ContextType.QUERY_MESSAGE, tokens: queryMessageTokens },
        { type: ContextType.PREV_MESSAGES, tokens: prevMessageTokens },
        { type: ContextType.VECTOR_STORES, tokens: vectorStoreTokens },
      ]

      await Promise.all(                                              // Add TokenCost documents to db 
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
      await db.message.create({                                       // Add a new message that includes the gpt completion text
        data: {
          text: completion,
          isUserMessage: false,
          fileId: file.id,
          kindeId: userId,
        },
      })

      const completionTokens = countTikTokens(completion).length      // Calculate token counts for GPT completion

      await db.tokenCost.create({                                     // Add TokenCost document to db 
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

  return new StreamingTextResponse(stream)                            // Pass in the stream here so we can stream a response to the client in real time

}