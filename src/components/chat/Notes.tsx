"use client"

import React, { useState, SyntheticEvent } from 'react'

// Project Imports
import { trpc } from '@/app/_trpc/client';

// 3rd Party Imports

import Skeleton from "react-loading-skeleton"
import { Ghost } from 'lucide-react';
import NotesForm from './NotesForm';


/** ================================|| Notes ||=================================== **/

interface NotesProps {
    researchKey: string
    type: 'project' | 'question' | 'file'
}

const Notes = ({ researchKey, type }: NotesProps) => {

    const [content, setContent] = useState<string>();

    async function handleOnSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        return;
    }


    // If we invalidate the data, we force an automatic refresh
    const utils = trpc.useUtils()

    // automatically gets queried on page load
    // const { data: notes, isLoading } = trpc.getNotes.useQuery({ type: type, key: researchKey })
    const isLoading = false
    const notes = true

    // const { mutate: updateNotes } = trpc.updateNotes.useMutation({
    //     onSuccess() {
    //         utils.getProjectQuestions.invalidate()
    //     },
    //     onMutate() {

    //     },
    //     onSettled() {
    //         // Whether there is an error or not, the loading state should stop

    //     }
    // })

    return (
        <main className='mx-auto max-w-7xl md:p-10'>

            <div className={`
                flex flex-col items-start justify-between gap-4
                sm:flex-row sm:items-center sm:gap-0 
                mt-2 sm:mt-8                  
                pb-2 
                `}>
                <h1 className='mb-3 font-bold text-2xl lg:text-5xl text-gray-900'>
                    Notes
                </h1>
            </div>



            {true ? (

                <>
                    <NotesForm />
                </>

            ) : isLoading ? (
                // Loading state condition:
                <Skeleton height={100} className='my-2' count={3} />
            ) : (
                // Empty state condition:
                <div className='mt-16 flex flex-col items-center gap-2'>
                    <Ghost className='h-8 w-8 text-zinc-800' />
                    <h3 className='font-semibold text-xl'>
                        Pretty empty around here...
                    </h3>
                    <p> When you are ready, start jotting down your notes. </p>
                </div>
            )}

        </main>
    );
};

export default Notes;
