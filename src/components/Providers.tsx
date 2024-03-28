"use client"
import { PropsWithChildren, useState } from 'react'
// Project Imports
import { trpc } from '@/app/_trpc/client';
// 3rd Party Imports
import {
    QueryClient, QueryClientProvider
} from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client';
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
                url: 'http://localhost:3000/api/trpc'
            })
        ]
    }))

    // trpc is just a type safe wrapper around react-query. To use react-query independent we also include QueryClientProvider as another independent wrapper
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
};

export default Providers;
