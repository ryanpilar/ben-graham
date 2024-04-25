import { HTMLAttributes, forwardRef } from 'react'

// Project Imports
import { Icons } from '../Icons'
import { cn } from '@/lib/utils'
// 3rd Party Imports
import { format } from 'date-fns'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import { ExtendedMessage } from '@/types/message'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
// Code Block Styles
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MsgMorePopover from '../MsgMorePopover'
// import { grayscale } from 'react-syntax-highlighter/dist/esm/styles/hljs'
// import { nnfxDark, nnfx } from 'react-syntax-highlighter/dist/esm/styles/hljs'
// import { isblEditorLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
// import { coyWithoutShadows } from 'react-syntax-highlighter/dist/esm/styles/prism'
// import { atomDark, coyWithoutShadows, nightOwl, oneLight, zTouch, androidstudio } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

interface MessageProps {
    message: ExtendedMessage  // Advanced typescript magic inferring types
    isNextMessageSamePerson: boolean
}

const Message = forwardRef<HTMLDivElement, MessageProps>( ({ message, isNextMessageSamePerson }, ref) => {

        type CodeBlockProps = HTMLAttributes<HTMLModElement>

        // Adjusting the type to match expected HTML attributes for a code element
        function renderCodeBlock({ children, className, ...props }: CodeBlockProps) {
            const match = /language-(\w+)/.exec(className || '')
            if (match) {
                const language = match[1];
                return (
                    <SyntaxHighlighter
                        {...props} // Pass all other HTML attributes to SyntaxHighlighter
                        PreTag="div"
                        language={language}
                        style={oneLight}  // Ensure 'dark' is correctly imported and defined
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                );
            } else {
                return <code {...props} className={className}>{children}</code>
            }
        }

        return (
            <div
                ref={ref}
                className={cn('relative flex items-end', { 'justify-end': message.isUserMessage, })}
            >

                <div className={cn(
                    'relative flex h-6 w-6 aspect-square items-center justify-center', {
                    'order-3 bg-blue-500 rounded-xl': message.isUserMessage,
                    'order-1 bg-zinc-500 rounded-xl': !message.isUserMessage,
                    invisible: isNextMessageSamePerson, // Edge case for when there are two user messages back to back
                })}>
                    {message.isUserMessage ? (
                        <Icons.user className='fill-zinc-200 text-zinc-200 h-4/6 w-4/6' />
                    ) : (
                        <Icons.logo className='fill-zinc-300 h-3/4 w-3/4' />
                    )}
                </div>

                <div className={cn(
                    'flex flex-col space-y-2 text-base max-w-2xl mx-2',
                    {
                        'order-1 items-end': message.isUserMessage,
                        'order-3 items-start': !message.isUserMessage,
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
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <table style={{ border: '' }} {...props} />
                                    ),
                                    ul: ({ className, ...props }) => (
                                        <ul
                                            className={cn('ml-3 pl-5 list-disc', className)}
                                            {...props}
                                        />
                                    ),
                                    ol: ({ className, ...props }) => (
                                        <ol
                                            className={cn('list-decimal pl-6', className)}
                                            {...props}
                                        />
                                    ),
                                    p: ({ className, ...props }) => (
                                        <p
                                            className={cn('pt-4 pb-1', className)}
                                            {...props}
                                        />
                                    ),
                                    code: renderCodeBlock,

                                }}
                                className={cn('prose', {
                                    'text-zinc-50': message.isUserMessage,
                                })}>
                                {message.text}
                            </ReactMarkdown>
                        ) : (
                            message.text
                        )}
                        {message.id !== 'loading-message' ? (
                            <div className='flex justify-between items-center gap-x-3 mt-2'>

                                <MsgMorePopover messageId={message.id} isPinned={message.isPinned!} isUserMessage={message.isUserMessage} />

                                <div
                                    className={cn(
                                        'text-xs select-none ',
                                        {
                                            'text-zinc-500': !message.isUserMessage,
                                            'text-blue-300': message.isUserMessage,
                                        }
                                    )}>

                                    {format(
                                        new Date(message.createdAt),
                                        'd/M/y - HH:mm'
                                    )}
                                    
                                </div>
                            </ div>
                        ) : null}
                    </div>
                </div>
            </div>
        )
    }
)
// B/c we declared it as a forward ref:
Message.displayName = 'Message'

export default Message