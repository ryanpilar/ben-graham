import { Pinecone } from '@pinecone-database/pinecone'

/** ================================|| Pinecone ||=================================== **/

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,    
})