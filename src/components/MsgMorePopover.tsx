'use client'
import React from 'react'

// Project Imports
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import PinMsg from './chat/PinMsg'
import XMsg from './chat/XMsg'
import { MoreVerticalIcon } from 'lucide-react'


/** ================================|| Msg Ellipsis Popover ||=================================== **/

interface MsgMorePopoverProps {
    messageId: string
    isPinned: boolean
    isUserMessage: boolean
}

const MsgMorePopover = ({ messageId, isPinned, isUserMessage }: MsgMorePopoverProps) => {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <MoreVerticalIcon className={isUserMessage ? 'text-blue-500' : 'text-zinc-500'} />
            </PopoverTrigger>

            <PopoverContent className="w-25">
                <div className="flex flex-col gap-y-3 cursor-pointer">
                    {!isUserMessage ? <PinMsg isPinned={isPinned} messageId={messageId} />
                        : null}
                    <XMsg messageId={messageId} />
                </div>
            </PopoverContent>
        </Popover>
    );
};
export default MsgMorePopover;
