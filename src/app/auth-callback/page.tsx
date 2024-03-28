'use client'
import React, { useEffect } from 'react'
// Project Imports
import { trpc } from '../_trpc/client';
// 3rd Party Imports
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react';
// Styles

/** ================================|| AuthCallback ||=================================== 
    - sync the logged in user and make sure they are also in the database 
    - worse thing about trpc is the setup  **/

const AuthCallback = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')  // Format reminder: '/auth-callback?origin=dashboard'

    // this data is now type safe with trpc, isLoading helps us deal with undefined states 
    // we don't expect any data, like we don't expect something like a post request body,
    // this query runs on page load
    const { data, isLoading, error } = trpc.authCallback.useQuery(undefined, {
        retry: true,
        retryDelay: 500,
    })

    useEffect(() => {
        if (data?.success) {
            router.push(origin ? `/${origin}` : '/dashboard');
        } else if (error?.data?.code === "UNAUTHORIZED") {
            router.push('/sign-in');
        }
    }, [data, error, router, origin]);

    if (isLoading) {
        return (
            <div className='w-full mt-24 flex justify-center'>
                <div className='flex flex-col items-center gap-2'>
                    <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
                    <h3 className='font-semibold text-xl'>
                        Setting up your account...
                    </h3>
                    <p>You will be redirected automatically.</p>
                </div>
            </div>
        );
    }

    return null;
}

export default AuthCallback;
