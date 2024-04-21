import assert from "node:assert";
import { getEncoding } from "js-tiktoken";
// import { get_encoding } from "tiktoken";

/** ================================|| TikToken Core - TRPC ||=================================== **/

type Store = PageContent[];  // This changes if 'store' is used directly as an array.

interface PageContent {
    pageContent: string;
}

interface Message {
    [key: string]: string;  // Ensure keys will have string values for token counting.
}

interface TokenCost {
    tokensPerMessage: number;
    tokensPerName: number;
}

export function countTikTokens(text: string) {

    try {
        const encoding = getEncoding('cl100k_base')
        const tokens = encoding.encode(text);
        
        console.log('tokens', tokens);      


        // Free the encoder after it is done being used
        return tokens

    } catch (error) {
        console.error(`Failed to count tokens for the given text`, error);
        throw new Error(`Failed to count tokens for the given text`);
    }
}



export function countVectorStoreTokens(vectorStores: Store[]) {
    try {
        const tokenLengths = vectorStores.map( (store: Store) => {
            try {
                // Iterate over every included store
                const pageContent = store.map( (r: PageContent) => r.pageContent).join('\n\n');
                const tokenIntegers = countTikTokens(pageContent);
                return tokenIntegers.length

            } catch (storeError) {
                console.error('Error processing vector store:', storeError);

                // Continue with other stores even if one fails
                return 0
            }
        })

        const totalTokens = tokenLengths.reduce( (total: number, count: number) => total + count, 0);

        return totalTokens

    } catch (error) {
        console.error('An error occurred while processing tokens:', error);
        return 0
    }
}

export function countMessageTokens(messages: Message[], tokenCost: TokenCost) {

    const { tokensPerMessage, tokensPerName } = tokenCost
    let totalTokens = 0;

    // Process each message to calculate tokens
    messages.forEach(message => {

        totalTokens += tokensPerMessage;   // Base token cost per message

        // Count tokens for each key-value pair in the message
        Object.entries(message).forEach(([key, value]) => {
            totalTokens += countTikTokens(value).length;
            if (key === "name") {
                totalTokens += tokensPerName;
            }
        });

        totalTokens += 3;  // Add tokens for the assistant's priming in each reply
    });

    return totalTokens;
}