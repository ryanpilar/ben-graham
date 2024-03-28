import { Send } from 'lucide-react'
import { Button } from '../ui/button'
import { useContext, useRef } from 'react'
import { Textarea } from '../ui/textarea'
import { ChatContext } from './ChatContext'

interface ChatInputProps {
    isDisabled?: boolean
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
    const {
        addMessage,
        handleInputChange,
        isLoading,
        message,
    } = useContext(ChatContext)

    const textareaRef = useRef<HTMLTextAreaElement>(null) // Used to make the keydown work

    return (
        <div className='absolute bottom-0 left-0 w-full'>

            <div className='mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl'>
                <div className='relative flex h-full flex-1 items-stretch md:flex-col'>
                    <div className='relative flex flex-col w-full flex-grow p-4'>
                        <div className='relative'>
                            <Textarea
                                rows={1}
                                ref={textareaRef}                               // We use ref in conjunction with the onKeyDown
                                maxRows={4}
                                autoFocus                                       // When you load the page, the cursor will be inside the input by default
                                onChange={handleInputChange}                    
                                value={message}

                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {     // b/c shift enter is an important shortkey! 
                                        e.preventDefault()
                                        addMessage()
                                        // Shift the focus back into the text area
                                        textareaRef.current?.focus()            // Current needs a question mark, b/c textareaRef could be null
                                    }
                                }}
                                placeholder='Enter your question...'
                                className='
                                    resize-none pr-12 text-base py-3 
                                    scrollbar-thumb-blue scrollbar-thumb-rounded 
                                    scrollbar-track-blue-lighter scrollbar-w-2 
                                    scrolling-touch'
                            />
                            {/* Block if the message is being sent to the api, or if the api is currently answering the question */}
                            <Button
                                disabled={isLoading || isDisabled}
                                className='absolute bottom-1.5 right-[8px]'
                                aria-label='send message'
                                type='submit'
                                onClick={() => {
                                    addMessage()
                                    textareaRef.current?.focus()                // Set where the cursor is positioned
                                }}
                            >
                                <Send className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInput