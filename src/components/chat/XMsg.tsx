'use client'

import React, { useState } from 'react'
// Project Imports
import { toast } from '../ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { LoadingButton } from '../ui/loading-button';
// 3rd Party Imports
import { Loader2, Trash, X } from 'lucide-react';

/** ================================|| X Msg ||=================================== **/

interface XMsgProps {
    messageId: string
}
const XMsg = ({ messageId }: XMsgProps) => {

    const utils = trpc.useUtils()
    const { mutate: deleteMessage, isLoading } = trpc.deleteMessage.useMutation({

        onSuccess: () => {
            toast({
                title: 'Message successfully Removed',
                variant: 'default',
            })
            utils.getProjectMessages.invalidate()
            utils.getFileMessages.invalidate()
            setCurrentlyRemovingMsg(false)
        },
        onError: () => {
            toast({
                title: 'Error removing message',
                description: 'Please try again',
                variant: 'destructive',
            });
            setCurrentlyRemovingMsg(false)
        },
        onSettled() {
            // Whether there is an error or not, the loading state should stop
            setCurrentlyRemovingMsg(false)
        }
    })

    const [currentlyRemovingMsg, setCurrentlyRemovingMsg] = useState(false)

    const handleDelete = () => {

        setCurrentlyRemovingMsg(true);
        deleteMessage({ messageId: messageId });
    }
        return (
            <>
                <LoadingButton
                    onClick={handleDelete}
                    size='icon'
                    className='rounded-lg'
                    variant='secondary'
                    disabled={currentlyRemovingMsg}
                >
                    {isLoading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <Trash strokeWidth={2} className='h-4 w-4' />
                    )}
                </LoadingButton>
            </>
        );    
    }
    export default XMsg;
