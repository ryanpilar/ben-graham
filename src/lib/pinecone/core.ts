import { Pinecone } from '@pinecone-database/pinecone'

/** ================================|| Pinecone Core - TRPC ||=================================== 
    
    This Core file initializes a client between Pinecone and performs various getters and
    setters on its vector db.

    Pinecone is used as a memory database which stands between user input and GPT: User input is 
    converted into an embedding and is sent to Pinecone where it's compared to the memory database, 
    then the relevant data is sent to Openai API to produce a completion.    

**/

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,    
})

export async function deletePineconeNamespace(namespace: string) {
    try {
        const index = pinecone.index(process.env.PINECONE_INDEX!);
        const ns = index.namespace(namespace);

        await ns.deleteAll();

        console.log(`Successfully deleted all records from Pinecone namespace: ${namespace}`);

    } catch (error) {
        console.error(`Error deleting all records from Pinecone namespace: ${namespace}:`, error);
        throw new Error(`Failed to delete all records from Pinecone namespace: ${namespace}`);
    }
}