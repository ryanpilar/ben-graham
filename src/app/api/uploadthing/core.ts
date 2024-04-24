import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { OpenAIEmbeddings } from "@langchain/openai";
import { pinecone } from '@/lib/pinecone/core'
import { PineconeStore } from "@langchain/pinecone";
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

/** ======================================|| Core ||========================================= 
 
    -   the middleware will run when someone has requested to upload a file from the client
    -   onUploadComplete will run when the upload is successful 
    -   only authenticated user can upload files

    We can pass Kinde and Stripe data along as metadata to other functions like onUploadComplete 
    and now we, inside those functions, we can see if the user has paid or not     

**/

// Initialize upload handler
const f = createUploadthing();

// Middleware to ensure only authenticated users can upload files
const middleware = async () => {
    
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) throw new Error('Unauthorized')

    const subscriptionPlan = await getUserSubscriptionPlan()

    // Pass user and subscription plan info as metadata
    return { subscriptionPlan, kindeId: user.id }
}

// Handles post-upload processing, including file indexing and status updates
const onUploadComplete = async ({ metadata, file }: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string
        name: string
        url: string
    }
}) => {
    // Create a file record in the database
    const createdFile = await db.file.create({
        data: {
            id: file.key,                       // Note: this is the uploadthing key/id
            key: file.key,
            name: file.name,
            kindeId: metadata.kindeId,

            url: `https://utfs.io/f/${file.key}`,
            uploadStatus: 'PROCESSING',
        }
    })

    try {
        // Fetch the uploaded file
        const response = await fetch(`https://utfs.io/f/${file.key}`)
        const blob = await response.blob()

        // Load the pdf into memory
        const loader = new PDFLoader(blob)

        // Extract page level text
        const pageLevelDocs = await loader.load()
        const pagesAmt = pageLevelDocs.length

        /**
            Should I be TEXT SPLITTING using RecursiveCharacterTextSplitting here? 
            -   Chunksize has been recommended at 1000
            -   What about overlap?

            Should I be cleaning the data? Like map over chunks and get rid of new lines and replace with spaces?
         */

        // Check if the user's upload exceeds their plan limits
        const { subscriptionPlan } = metadata
        const { isSubscribed } = subscriptionPlan
        const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Plus')!.pagesPerPdf
        const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Free')!.pagesPerPdf

        // Is the user subscribed or not?
        if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
            await db.file.update({
                data: {
                    uploadStatus: 'FAILED',
                },
                where: {
                    id: createdFile.id,
                },
            })
        }

        // Vectorize and index the document
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)
        const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY, })

        await PineconeStore.fromDocuments(
            pageLevelDocs,
            embeddings,                         //   OpenAi embedding tell langchain how to generate the vectors from the text
            {
                pineconeIndex,
                namespace: createdFile.id,      //  We can save a vector to certain namespaces, in this case fileId 
            }
        )

        // Update upload status to 'SUCCESS'
        await db.file.update({
            data: {
                uploadStatus: 'SUCCESS'
            },
            where: {
                id: createdFile.id,
            }
        })

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
}
// Define routers for different plan uploaders
export const ourFileRouter = {

    freePlanUploader: f({ pdf: { maxFileSize: PLANS.find( plan=> plan.slug === 'free')!.pdfCap } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    plusPlanUploader: f({ pdf: { maxFileSize: PLANS.find( plan=> plan.slug === 'plus')!.pdfCap } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;