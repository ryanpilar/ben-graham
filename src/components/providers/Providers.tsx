"use client"
import { PropsWithChildren, createContext, useState } from 'react'
// Project Imports
import { trpc } from '@/app/_trpc/client';
import { httpBatchLink } from '@trpc/client';
// import OriginTrackerProvider from './OriginProvider';
// import { LoadingProvider } from './LoadingContext';
// 3rd Party Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { NextUIProvider } from '@nextui-org/system'
import { absoluteUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';


// Styles

/** ================================|| Providers ||=================================== 
    -   trcp is a thin wrapper around react-query 
    -   first we make a trpc instance, _trpc (in the app folder) tells next that 
        its not navigable  **/


// Use PropsWithChildren when bringing in props
const Providers = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient())

    // Once we have a trpc client spun up (/src/trpc/trpc.ts & index.ts) we call createClient from that server instance
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: absoluteUrl('/api/trpc')
            })
        ]
    }))
    // Create a Origin client and set the state and value
    // const OriginTracker = createContext<boolean>(false)
    // const [isWithinPage, setIsWithinPage] = useState(false)


    const router = useRouter();



    // trpc is just a type safe wrapper around react-query. To use react-query independent we also include QueryClientProvider as another independent wrapper
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {/* <LoadingProvider> */}
                {/* <NextUIProvider navigate={router.push}> */}
                {/* <OriginTrackerProvider> */}

                {children}

                {/* </OriginTrackerProvider> */}
                {/* </NextUIProvider > */}
                {/* </LoadingProvider> */}
            </QueryClientProvider>
        </trpc.Provider>


    );
};

export default Providers;
