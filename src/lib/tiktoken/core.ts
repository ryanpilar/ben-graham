
import { get_encoding, TiktokenEncoding } from "tiktoken";

/** ================================|| TikToken Core - TRPC ||=================================== **/

export function countTikTokens(text: string) {

    try {
        const encoding = get_encoding("cl100k_base");
        const tokens = encoding.encode(text);

        // Free the encoder after it is done being used
        encoding.free()
        return tokens

    } catch (error) {
        console.error(`Failed to count tokens for the given text`, error);
        throw new Error(`Failed to count tokens for the given text`);
    }
}

export function countVectorStoreTokens(vectorStores) {
    try {

        const tokenLengths = vectorStores.map((store) => {
            try {
                // Iterate over every included store
                const pageContent = store.map((r) => r.pageContent).join('\n\n');
                const tokenIntegers = countTikTokens(pageContent);
                return tokenIntegers.length

            } catch (storeError) {
                console.error('Error processing vector store:', storeError);

                // Continue with other stores even if one fails
                return 0
            }
        })

        const totalTokens = tokenLengths.reduce((total, count) => total + count, 0);

        return totalTokens

    } catch (error) {
        console.error('An error occurred while processing tokens:', error);
    }
}

export function countMessageTokens(messages, tokenCost) {

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