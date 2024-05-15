"use client"

import React, { useState } from 'react'

// Project Imports
import PinMsg from './PinMsg';
import { trpc } from '@/app/_trpc/client';

// 3rd Party Imports
import { Ghost } from 'lucide-react';
import Skeleton from "react-loading-skeleton"

/** ================================|| Pinned Messages ||=================================== **/

interface PinnedMessagesProps {
    researchKey: string
    type: 'project' | 'question' | 'file'
}

const PinnedMessages = ({ researchKey, type }: PinnedMessagesProps) => {

    // We need to know exactly what file is currently being deleted
    const [currentlyPinningMessage, setCurrentlyPinningMessage] = useState<string | null>(null)

    // If we invalidate the data, we force an automatic refresh
    const utils = trpc.useUtils()
   
    const { data: messages, isLoading } = trpc.getPinnedMessages.useQuery({ type: type, key: researchKey })  // Automatically gets queried on page load

    return (
        <div className='mx-auto max-w-7xl'>

            <div className='mt-2 sm:mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                <h1 className='mb-3 font-bold text-2xl lg:text-3xl text-gray-900'>
                    Pinned Messages
                </h1>
            </div>

            {/* Display all research projects */}
            {messages && messages?.length !== 0 ? (

                <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
                    {messages.map((msg, index) => (
                        <li
                            key={index}
                            className='text-red-500 col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'
                        >
                            <h2>{msg.id}</h2>
                            <PinMsg isPinned={msg.isPinned} messageId={msg.id} />
                        </li>
                    ))
                    }
                </ul>

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
                    <p>When you are ready, pin an important message from the chat.</p>
                </div>
            )}

        </div>
    );
};

export default PinnedMessages;
