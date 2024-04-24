'use client'
import { Loader2, Pin, PinOff } from 'lucide-react';
import React, { useState } from 'react'
import { LoadingButton } from '../ui/loading-button';
// Project Imports
// 3rd Party Imports
// Styles

/** ================================|| Pin Msg ||=================================== **/

interface PinMsgProps {
    isPinned: boolean
    messageId: string

}
const PinMsg = ({ isPinned }: PinMsgProps) => {

    const [isPinning, setIsPinning] = useState(false)
    const [currentlyPinningMsg, setCurrentlyPinningMsg] = useState(false)
    return (
        <>

            {isPinned ? (
                <LoadingButton
                    // onClick={() => unPinMessage({ messageId: messageId})}
                    size='icon'
                    className=''
                    variant='secondary'
                    disabled={isPinning}
                >
                    {currentlyPinningMsg ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <PinOff strokeWidth={2} className='h-4 w-4' />)}

                </LoadingButton>
            ) : (
                <LoadingButton
                    // onClick={() => pinMessage({ messageId: messageId})}
                    size='icon'
                    className=''
                    variant='secondary'
                    disabled={isPinning}
                >

                    {currentlyPinningMsg ? (

                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <Pin strokeWidth={2} className='h-4 w-4' />)}

                </LoadingButton>
            )}
        </>
    );
};

export default PinMsg;
