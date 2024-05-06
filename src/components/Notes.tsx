'use client'
import React, { useEffect } from 'react'

// 3rd Party Imports
import NotesForm from './NotesForm';
// import { trpcServer } from '@/trpc/trpc-caller';
import { trpc } from '@/app/_trpc/client';
import Skeleton from 'react-loading-skeleton';
import { Ghost } from 'lucide-react';

/** ================================|| Notes ||=================================== **/

interface NotesProps {
    researchKey: string
    type: 'project' | 'question' | 'file'
}

const Notes =  ({ researchKey, type }: NotesProps) => {

    // const notes = await trpcServer.getNotes({ type: type, key: researchKey })
    // const mainNote = notes.find(note => note.name === 'main note') || { id: 'someUUID', name: 'Blank Note', content: 'Nothing noted yet...' }
    const utils = trpc.useUtils()
    const { data: notes, isLoading } = trpc.getNotes.useQuery({ type: type, key: researchKey }, {
        // Setting the staleTime to 0 will ensure data is not considered fresh immediately after fetching.
        staleTime: 0,
        // Setting the cacheTime to 0 ensures the data does not remain in the cache after unmount.
        cacheTime: 0,
        // Using 'network-only' to always fetch data directly from the server and bypass cache.
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always'
    })
    const mainNote = notes?.find(note => note.name === 'main note')

    return (
        <main className='mx-auto max-w-7xl'>

            <div className={`
                flex flex-col items-start justify-between gap-4
                sm:flex-row sm:items-center sm:gap-0 
                mt-2 sm:mt-8                  
                pb-2`}
            >
                <h1 className='mb-3 font-bold text-2xl lg:text-3xl text-gray-900'>
                    Notes
                </h1>
            </div>

            {/* <NotesForm researchKey={researchKey} type={type} notes={mainNote} /> */}

            {notes && mainNote ? (
                <NotesForm researchKey={researchKey} type={type} notes={mainNote} />
            ) : isLoading ? (
                // Loading state condition:
                <Skeleton height={100} className='my-2' count={2} />
            ) : (
                // Empty state condition:
                <div className='mt-16 flex flex-col items-center gap-2'>
                    <Ghost className='h-8 w-8 text-zinc-800' />
                    <h3 className='font-semibold text-xl'>
                        Pretty empty around here...
                    </h3>
                </div>
            )}

        </main>
    );
};

export default Notes;