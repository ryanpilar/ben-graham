'use client'
import { Loader2, Pin, X } from 'lucide-react';
import React, { useState } from 'react'
import { LoadingButton } from '../ui/loading-button';
import { trpc } from '@/app/_trpc/client';
// Project Imports
// 3rd Party Imports
// Styles

/** ================================|| X Msg ||=================================== **/

interface XMsgProps {
    messageId: string
}
const XMsg = ({ messageId }: XMsgProps) => {

    trpc.deleteMessage.useMutation()

    const [isRemoving, setIsRemoving] = useState(false)
    const [currentlyRemovingMsg, setCurrentlyRemovingMsg] = useState(false)
    return (
        <>

            <LoadingButton
                // onClick={() => xMessage({ messageId: messageId})}
                size='icon'
                className='rounded-lg'
                variant='secondary'
                disabled={isRemoving}
            >

                {currentlyRemovingMsg ? (

                    <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                    <X strokeWidth={2} className='h-4 w-4' />
                )}

            </LoadingButton>



        </>
    );
};

export default XMsg;
