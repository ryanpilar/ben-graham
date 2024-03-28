import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAIEmbeddings } from "@langchain/openai";


import { pinecone } from '@/lib/pinecone'
// import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PineconeStore } from "@langchain/pinecone";

import { HumanMessage } from 'langchain/schema';


import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
const f = createUploadthing();

/** ================================|| Core ||=================================== 
    -   the middleware will run when someone has requested to upload a file from the client
    -   onUploadComplete will run when the upload is successful 
    -   only authenticated user can upload files
**/

export const ourFileRouter = {

    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async () => {
            const { getUser } = getKindeServerSession()
            const user = await getUser()

            if (!user || !user.id) throw new Error('Unauthorized')

            // const subscriptionPlan = await getUserSubscriptionPlan()

            // return { subscriptionPlan, userId: user.id }
            return { kindeId: user.id } // whatever we return here, will end up below in metadata
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    id: file.key, // Note: this is the uploadthing key/id
                    key: file.key,
                    name: file.name,
                    kindeId: metadata.kindeId,
                    // Sometimes uploadthing file.url timesout. So there is a workaround via S3
                    // This is just as good as the upload thing url because its a wrapper over amazon
                    // url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
                    url: `https://utfs.io/f/${file.key}`,
                    uploadStatus: 'PROCESSING',
                }
            })
            // The basis to be able to answer a questions here, is before hand, indexing the entire pdf file, 
            // so now we can search for just the parts of the pdf file, so now we can just search for the parts
            // of the pdf file that are closest to the question or the message that the user has sent.
            // When we upload a file, right away we are going to index it, so when we ask a question later, it
            // is already indexed and we can then search for the parts that are most similar.
            // We are going to index using a vector database, Pinecone.

            // Pinecone - we create an index, where we are going to store our pdf vectors

            try {
                // Now we have the url in memory, and we can generate some pages that we want to
                // index in our vector store from them
                // first we need them as a blob object
                const response = await fetch(`https://utfs.io/f/${file.key}`)

                const blob = await response.blob()
                console.log('Create blob from uloadthingLink');

                // load the pdf into memory
                const loader = new PDFLoader(blob)

                // extract page level text
                const pageLevelDocs = await loader.load()
                // later we can check if you are on the pro or the free plan
                const pagesAmt = pageLevelDocs.length

                // vectorize and index entire document
                const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)
                console.log('Pinecone done indexing');


                // take the text and turn it into a vectors
                const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY, })
                console.log('OpenAi embeddings Done');

                //  In the latest versions of LangChain, the chat history should be passed as an array of 
                //  HumanMessage objects, not as an array of strings. The HumanMessage object is a class 
                //  in LangChain that represents a human message in a conversation.

                
                await PineconeStore.fromDocuments(
                    pageLevelDocs,
                    embeddings,                         //   OpenAi embedding tell langchain how to generate the vectors from the text
                    {
                        pineconeIndex,
                        namespace: createdFile.id,      //  We can save a vector to certain namespaces, in this case fileId, so when 
                        // maxConcurrency: 5,              // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
                        //  we query by file id we can get all the vectors for that certain file
                    }
                )
                console.log('Langchain Done vectorizing');

                // Update the database file to indicated a 'successful' upload state
                await db.file.update({
                    data: {
                        uploadStatus: 'SUCCESS'
                    },
                    where: {
                        id: createdFile.id,
                    }
                })
                console.log('MONGO FILE updatated', createdFile);
            } catch (error) {
            
                console.log('FAILED TO SOMETHING!', error);
            
                await db.file.update({
                    data: {
                        uploadStatus: 'FAILED'
                    },
                    where: {
                        id: createdFile.id,
                    }
                })
            }
        }),

} satisfies FileRouter;

// Uploadthing needs to know this type exported below. You can't just infer this type in the pkg.
// therefore it expects on you to write this hook, but uploadthing supplies the snippet
export type OurFileRouter = typeof ourFileRouter;