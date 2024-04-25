import React from 'react'
// Project Imports
import XMsg from './chat/XMsg'
import PinMsg from './chat/PinMsg'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
// 3rd Party Imports
import { MoreHorizontal, MoreVerticalIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** ================================|| Msg More Popover ||=================================== **/

interface MsgMorePopoverProps {
    messageId: string
    isPinned: boolean
    isUserMessage: boolean
}

const MsgMorePopover = ({ messageId, isPinned, isUserMessage }: MsgMorePopoverProps) => {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <MoreHorizontal size={25} className={cn('cursor-pointer', isUserMessage ? 'text-blue-200' : 'text-zinc-500')} />
                {/* <MoreVerticalIcon className={isUserMessage ? 'text-blue-500' : 'text-zinc-500'} /> */}
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
