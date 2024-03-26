// Project Imports
// 3rd Party Imports
// Styles
import { cn } from '@/lib/utils'
import { ExtendedMessage } from '@/types/message'
import { Icons } from '../Icons'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { forwardRef } from 'react'

interface MessageProps {
    message: ExtendedMessage  // Advanced typescript magic inferring types
    isNextMessageSamePerson: boolean
}

/** ================================|| Message ||=================================== 

    We have two messages we need to render, and this component helps with managing
    when to display what message style. We have: 
        - User messages
        - AI messages


    ReactMarkdown can only accept a literal string, but the text could also be a 
    JSX element, which cannot be rendered in markdown.

    When a message is in loading state we don't want to show the date

    In normal react, you cannot pass a ref like a prop like we are trying to do.
    There is a trick though to achieve this...
    How we pass refs in react is using forwardRef. And with that ref it allows us to 
    check if its intersecting with the screen, if its already visible.

**/



const Message = forwardRef<HTMLDivElement, MessageProps>(
    ({ message, isNextMessageSamePerson }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('flex items-end', { 'justify-end': message.isUserMessage, })}
            >
                <div
                    className={cn(
                        'relative flex h-6 w-6 aspect-square items-center justify-center', {
                        'order-2 bg-blue-500 rounded-xl': message.isUserMessage,
                        'order-1 bg-zinc-500 rounded-xl': !message.isUserMessage,
                        invisible: isNextMessageSamePerson, // Edge case for when there are two user messages back to back
                    }
                    )}>
                    {message.isUserMessage ? (
                        <Icons.user className='fill-zinc-200 text-zinc-200 h-3/4 w-3/4' />
                    ) : (
                        <Icons.logo className='fill-zinc-300 h-3/4 w-3/4' />
                    )}
                </div>

                <div className={cn(
                    'flex flex-col space-y-2 text-base max-w-md mx-2',
                    {
                        'order-1 items-end': message.isUserMessage,
                        'order-2 items-start': !message.isUserMessage,
                    }
                )}>
                    <div
                        className={cn('px-4 py-2 rounded-xl inline-block', {
                            'bg-blue-600 text-white': message.isUserMessage,
                            'bg-gray-200 text-gray-900': !message.isUserMessage,
                            'rounded-br-none': !isNextMessageSamePerson && message.isUserMessage,
                            'rounded-bl-none': !isNextMessageSamePerson && !message.isUserMessage,
                        }
                        )}>
                        {typeof message.text === 'string' ? (
                            <ReactMarkdown
                                className={cn('prose', {
                                    'text-zinc-50': message.isUserMessage,
                                })}>
                                {message.text}
                            </ReactMarkdown>
                        ) : (
                            message.text
                        )}
                        {message.id !== 'loading-message' ? (
                            <div
                                className={cn(
                                    'text-xs select-none mt-2 w-full text-right',
                                    {
                                        'text-zinc-500': !message.isUserMessage,
                                        'text-blue-300': message.isUserMessage,
                                    }
                                )}>
                                {format(
                                    new Date(message.createdAt),
                                    'HH:mm'
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        )
    }
)

Message.displayName = 'Message'

export default Message