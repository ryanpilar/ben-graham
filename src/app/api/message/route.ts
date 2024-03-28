import { db } from "@/db"
import { pinecone } from "@/lib/pinecone"
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextRequest } from "next/server"
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { openai } from "@/lib/openai"


import { OpenAIStream, StreamingTextResponse } from 'ai'
import { log } from "console"


export const POST = async (req: NextRequest) => {
  // Endpoint for asking a question about the pdf file
  console.log('ENTERING THE MESSAGE API')

  // 1st we need access to the body
  const body = await req.json() // this is how we get access to the data invnext13
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  // const { id: userId } = user
  // if (!userId) return new Response('Unauthorized', { status: 401 })
  if (!user?.id) return new Response('Unauthorized', { status: 401 })

  const { id: userId } = user

  console.log('USER EXITS')

  // To make sure we always have the expected data coming to this api route, we use zot
  // We want to parse the body
  // And because we are running this through zod, when it is successfull we know the data types to be true!
  // Will automatically throw an error for us
  // the body can technically be anything, typescript knows that. So typescript says anyone can make a request 
  // with any data to this endpoint
  const { fileId, message } = SendMessageValidator.parse(body)

  console.log('MESSAGE VALIDATED', fileId, message)

  // Now we use the fileId to find the pdf we are looking for
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      kindeId: userId,
    },
  })

  if (!file) {
    console.log('FILE DOESNT EXIST IN MONGO!')
    return new Response('Not found', { status: 404 })
  }
  // Which page of the pdf is most relevent to the question that the user is asking, retrieve that page for context and send it to the large language model together
  // If there is a file that the users owns that they want to add a message too:
  const createdDocument = await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      kindeId: userId,
      fileId,
    },
  })
  console.log('MONGO DOC CREATED!', createdDocument.id)


  // To answer the above message/question we are going to use a language model
  // when we index a pdf file, for each message that we want answered in the chat
  // we are going to index the entire pdf, first. And then based on the question,
  // we can find the parts of the pdf, in text, that are most relevent to the
  // message/question by their similarity. Cosine products calculates the closest 
  // vectors to one another

  // 1: vectorize/embedding message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  console.log('LANGCHAIN EMBEDDINGS CREATED')


  // const pinecone = await getPineconeClient()
  // const pineconeIndex = pinecone.Index('quill')

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)

  // vector store the most relevant pdf page to this message
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      namespace: file.id,
    }
  )

  console.log('EMBEDDINGS STORED IN PINECONE')


  // get the results from pinecone
  const results = await vectorStore.similaritySearch(
    message,
    // How many results, or pdf pages we want back. So this is the 4 closest matches to our question
    // In later stages we can add more pages for paying users for better contextual results.
    4
  )

  console.log('VECTOR STORE SIMILARITY SEARCH DONE')


  // to pass these messages into the large language model itself would be good
  // But what also makes a lot of sense is a chat history. We want to see the previous messages of the user
  // This is the way we can search for previous messages:
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6
  })

  console.log('FIND ALL MESSAGES TO FILE')


  // Now send this to open ai to answer your questions, and open ai requires very specific formatting
  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const), // we use const because if we don't we will get a typescript error
    content: msg.text,
  }))

  console.log('FORMAT MESSAGE TO PREP FOR OPENAI')


  const response = await openai.chat.completions.create({
    // model: 'gpt-3.5-turbo',
    // model: 'gpt-4',
    // model: 'gpt-4-0613',
    // model: 'gpt-4-32k',
    model: 'gpt-4-0125-preview',

    temperature: 0,
    stream: true,               // We plan to stream the responses back to the front end in real time
    // These msgs serve one purpose: we want the previous messages that were exchanged
    // in this chat, so if you are referencing something from a couple messages ago,
    // the ai will know what you mean
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
  ${results.map((r) => r.pageContent).join('\n\n')}
  
  USER INPUT: ${message}`,
      },
    ],
  })


  console.log('ABOUT TO ENTER STREAM')


  // Here is the main reason we had to make that custom route earier, beacuse trpc can't handle streaming!
  // vercel ai sdk: making streaming results in real time a lot easier
  // when the stream is complete we get an onCompletion callback, which we use to create that new message and put it in our database
  // It takes the fully done thing from the response, 'completion'
  // Its essentially one long message string that we will want to put into our database 
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      console.log('OPENAI STREAM COMPLETE');
      
      const createdDoc = await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          kindeId: userId,
        },
      })
      console.log('createdMessage', createdDoc);

    },
  })

  console.log('ABOUT TO RETURN STREAM')

  // Pass in the stream here so we can stream a response to the client in real time
  return new StreamingTextResponse(stream)

}