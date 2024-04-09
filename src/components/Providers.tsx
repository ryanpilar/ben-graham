"use client"
import { PropsWithChildren, createContext, useState } from 'react'
// Project Imports
import { trpc } from '@/app/_trpc/client';
// 3rd Party Imports
import {
    QueryClient, QueryClientProvider
} from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client';
import { absoluteUrl } from '@/lib/utils';
import OriginTrackerProvider from './OriginProvider';
import { LoadingProvider } from './LoadingContext';
// Styles

/** ================================|| Providers ||=================================== 
 *
    -   trcp is a thin wrapper around react-query 
    -   first we make a trpc instance, _trpc (in the app folder) tells next that 
        its not navigable  **/


// Note: use PropsWithChildren when bring in props, theres a unique prop for it!
const Providers = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient())

    // Once we have a trpc client spun up (/src/trpc/trpc.ts & index.ts) we call createClient off that server instance
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                // url: 'http://localhost:3000/api/trpc'
                url: absoluteUrl('/api/trpc')
            })
        ]
    }))
    // Create a Origin client and set the state and value
    // const OriginTracker = createContext<boolean>(false)
    // const [isWithinPage, setIsWithinPage] = useState(false)

    // trpc is just a type safe wrapper around react-query. To use react-query independent we also include QueryClientProvider as another independent wrapper
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {/* <LoadingProvider> */}
                    <OriginTrackerProvider>
                        {children}
                    </OriginTrackerProvider>
                {/* </LoadingProvider> */}
            </QueryClientProvider>
        </trpc.Provider>
    );
};

export default Providers;
