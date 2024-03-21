import { db } from "@/db"
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server"
import { NextRequest } from "next/server"

export const POST = async (req: NextRequest) => {
    // Endpoint for asking a question about the pdf file

    // 1st we need access to the body
    const body = await req.json() // this is how we get access to the data invnext13
    const { getUser } = getKindeServerSession()
    const user = getUser()

    const { id: userId } = user

    if (!userId) return new Response('Unauthorized', { status: 401 })

    // To make sure we always have the expected data coming to this api route, we use zot
    // We want to parse the body
    // And because we are running this through zod, when it is successfull we know the data types to be true!
    // Will automatically throw an error for us
    // the body can technically be anything, typescript knows that. So typescript says anyone can make a request 
    // with any data to this endpoint
    const { fileId, message } = SendMessageValidator.parse(body)


    // Now we use the fileId to find the pdf we are looking for
    const file = await db.file.findFirst({
        where: {
          id: fileId,
          kindeId: userId,
        },
      })
    
      if (!file)
        return new Response('Not found', { status: 404 })
    
    // If there is a file that the users owns that they want to add a message too:
      await db.message.create({
        data: {
          text: message,
          isUserMessage: true,
          kindeId: userId,
          fileId,
        },
      })

    // To answer the above message/question we are going to use a language model
    // when we index a pdf file, for each message that we want answered in the chat
    // we are going to index the entire pdf, first. And then based on the question,
    // we can find the parts of the pdf, in text, that are most relevent to the
    // message/question by their similarity. Cosine products calculates the closest 
    // vectors to one another

      // 1: vectorize message
    //   const embeddings = new OpenAIEmbeddings({
    //     openAIApiKey: process.env.OPENAI_API_KEY,
    //   })
    
    //   const pinecone = await getPineconeClient()
    //   const pineconeIndex = pinecone.Index('quill')
    
    //   const vectorStore = await PineconeStore.fromExistingIndex(
    //     embeddings,
    //     {
    //       pineconeIndex,
    //       namespace: file.id,
    //     }
    //   )
    
    //   const results = await vectorStore.similaritySearch(
    //     message,
    //     4
    //   )
    
    //   const prevMessages = await db.message.findMany({
    //     where: {
    //       fileId,
    //     },
    //     orderBy: {
    //       createdAt: 'asc',
    //     },
    //     take: 6,
    //   })
    
    //   const formattedPrevMessages = prevMessages.map((msg) => ({
    //     role: msg.isUserMessage
    //       ? ('user' as const)
    //       : ('assistant' as const),
    //     content: msg.text,
    //   }))
    
    //   const response = await openai.chat.completions.create({
    //     model: 'gpt-3.5-turbo',
    //     temperature: 0,
    //     stream: true,
    //     messages: [
    //       {
    //         role: 'system',
    //         content:
    //           'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
    //       },
    //       {
    //         role: 'user',
    //         content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
            
    //   \n----------------\n
      
    //   PREVIOUS CONVERSATION:
    //   ${formattedPrevMessages.map((message) => {
    //     if (message.role === 'user')
    //       return `User: ${message.content}\n`
    //     return `Assistant: ${message.content}\n`
    //   })}
      
    //   \n----------------\n
      
    //   CONTEXT:
    //   ${results.map((r) => r.pageContent).join('\n\n')}
      
    //   USER INPUT: ${message}`,
    //       },
    //     ],
    //   })
    
    //   const stream = OpenAIStream(response, {
    //     async onCompletion(completion) {
    //       await db.message.create({
    //         data: {
    //           text: completion,
    //           isUserMessage: false,
    //           fileId,
    //           userId,
    //         },
    //       })
    //     },
    //   })
    
    //   return new StreamingTextResponse(stream)
    
}