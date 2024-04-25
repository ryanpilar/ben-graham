'use client'

import React, { useState } from 'react'

// Project Imports
import { toast } from '../ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { LoadingButton } from '../ui/loading-button';

// 3rd Party Imports
import { Loader2, Pin, PinOff } from 'lucide-react';

/** ================================|| Pin Msg ||=================================== **/

interface PinMsgProps {
    isPinned: boolean
    messageId: string

}
const PinMsg = ({ isPinned, messageId }: PinMsgProps) => {

    const [isPinning, setIsPinning] = useState(false);
    const utils = trpc.useUtils();

    const { mutate: togglePin, isLoading } = trpc.toggleMessagePin.useMutation({
        onMutate: () => {
            setIsPinning(true);
        },
        onSuccess: () => {
            toast({
                title: `Message successfully ${isPinned ? 'Unpinned' : 'Pinned'}`,
                variant: 'default',
            });

            // Invalidate relevant queries to refetch data
            utils.getProjectMessages.invalidate()
            utils.getFileMessages.invalidate()
            setIsPinning(false);
        },
        onError: () => {
            toast({
                title: 'Error updating pin status',
                description: 'Please try again',
                variant: 'destructive',
            });
            setIsPinning(false);
        }
    });

    const handleTogglePin = () => {
        console.log(isPinned, messageId);
        
        togglePin({ messageId: messageId });
    }

    return (
        <>
            <LoadingButton
                size="icon"
                className="rounded-lg"
                variant="secondary"
                onClick={handleTogglePin}
                disabled={isPinning || isLoading}
            >
                {isPinning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPinned ? (
                    <PinOff strokeWidth={2} className="h-4 w-4" />
                ) : (
                    <Pin strokeWidth={2} className="h-4 w-4" />
                )}
            </LoadingButton>
        </>
    );
};

export default PinMsg;
