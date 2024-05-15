'use client'

import { trpc } from "@/app/_trpc/client";
import React from "react"

export type Ticker = {
    label: string;
    value: string;
}

export type UseTickerProps = {
    fetchDelay?: number                                 // Delay to wait before fetching more items 
    query: string                                       // The search query used to fetch tickers
}

export function useTickerSearch({ fetchDelay = 0, query }: UseTickerProps) {
    const [items, setItems] = React.useState<Ticker[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const limit = 10                                    // Number of items per page, adjust as necessary
    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY
    console.log('apiKey', apiKey);
    

    const loadTickers = async () => {

        const controller = new AbortController()        // Create an instance of AbortController
        const { signal } = controller                   // Extract the 'signal' from the controller

        try {
            setIsLoading(true);

            // Optionally add a delay to simulate network latency or debounce rapid requests
            if (fetchDelay > 0) {
                await new Promise((resolve) => setTimeout(resolve, fetchDelay));
            }

            // Construct the URL with the search query and API key
            let res = await fetch(
                `https://financialmodelingprep.com/api/v3/search-ticker?query=${query}&limit=${limit}&apikey=${apiKey}`,
                { signal },
            );

            if (!res.ok) {
                throw new Error("Network response was not ok");
            }

            let json = await res.json();

            // Update the items state by mapping the API response to the expected format
            setItems((prevItems) => [
                ...prevItems,
                ...json.map((item: { name: string; symbol: string; }) => ({ label: item.name, value: item.symbol }))
            ]);

        } catch (error: unknown) {                      // Explicitly specifying that error is of type unknown
            if (error instanceof Error) {               // Type guard to check if error is an instance of Error
                if (error.name === "AbortError") {
                    console.log("Fetch aborted");
                } else {
                    console.error("There was an error with the fetch operation:", error.message); 
                }
            } else {
                // Handle cases where the error is not an instance of Error
                console.error("An unexpected error occurred:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (query.trim() !== '') {                      // Only perform the fetch if there is a non-empty query
            loadTickers();
        }
    }, [query]);                                        // Re-run the effect whenever the query changes

    return {
        items,
        isLoading,
    };
}


