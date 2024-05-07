import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";


/** ================================|| Chat Context ||===================================

    This is where we process or messages, where we handle loading and error states

    onMutate: 
        Gets sent as soon as we send the message, and is where the optimistic update 
        happens.
**/

type StreamResponse = {
    addMessage: () => void
    message: string
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void   // Whenever an event gets triggered in our chat input this comes out
    isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
    // With context we always need to define our fallback values
    addMessage: () => { },
    message: '',
    handleInputChange: () => { },
    isLoading: false,
})

interface Props {
    type: 'file' | 'project' | 'question'
    researchKey: string
    children: ReactNode
}
// Wrap chat components in the provider
export const ChatContextProvider = ({ type, researchKey, children }: Props) => {
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // 1st we need access to the TRPC utils, where we can gain access to all the api routes, and with this we can create the optimistic updates
    const utils = trpc.useContext()

    const { toast } = useToast()

    const backupMessage = useRef('') // Used in the optimistic update to prevent rerenders

    // One of the only times when we are not going to use trpc in our app!
    // trpc is our type safe wrapper
    // We are not using trpc, because we want to stream back a response from the api to the client
    // trpc only works for json
    // so we use react-query:



    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {

            const chooseEndpointAndPost = async () => {
                switch (type) {
                    case ('file'):
                        return await fetch('/api/message/file', {
                            method: 'POST',
                            body: JSON.stringify({
                                fileId: researchKey,
                                message,
                            })
                        })
                    case ('project'):
                        return await fetch('/api/message/project', {
                            method: 'POST',
                            body: JSON.stringify({
                                projectId: researchKey,
                                message,
                            })
                        })
                    case ('question'):
                        return await fetch('/api/message/question', {
                            method: 'POST',
                            body: JSON.stringify({
                                questionId: researchKey,
                                message,
                            })
                        })
                }
            }

            const response = await chooseEndpointAndPost()

            if (!response?.ok) {
                throw new Error('Failed to send message')
            }
            return response.body
        },
        // If anything goes wrong after the optimistic update, we want to roll it back and put i back into the input
        // B/c we are going to remove it as soon as the message is sent for immediate feedback
        // And we keep track of that message through a ref, so we don't force a rerender
        //
        onMutate: async ({ message }) => {
            // Save the msg inside the ref incase something goes wrong
            // The message that we are backing up here, is a global state.
            backupMessage.current = message
            setMessage('')

            // Step 1 - cancel any outgoing re-fetches so that they don't overwrite or optimistic update
            await utils.getMessages.cancel()

            // Step 2 - snapshot the previous value we have. This is an api call to get the data we need. So we can revert it later if we need to
            const previousMessages = utils.getMessages.getInfiniteData()

            // Step 3 - optimistically insert the new value. This is the endpoint we want to optimistically change the data for
            utils.getMessages.setInfiniteData(
                { type: type, key: researchKey, limit: INFINITE_QUERY_LIMIT },
                // Receive old data in this callback, and then add the new optimistic message to it
                (old) => {
                    if (!old) {
                        // react-query handles infinite queries always with a pages and a pageParam, and we need to comply with this
                        return {
                            pages: [],
                            pageParams: [],
                        }
                    }
                    // Clone old pages by spreading them in
                    let newPages = [...old.pages]
                    // Contains the latest messages and not the ones above it in the interval that we set. 
                    // So for example, i fhte INFINITE_QUERY_LIMIT is 10 then the latest page is going to contain th latest 10 msgs in our chat
                    let latestPage = newPages[0]! // tell stypscript it will always be there by, !.

                    // Directly mutate. We want to incert the optimistic msg, so we insert it right here
                    latestPage.messages = [
                        {
                            createdAt: new Date().toISOString(),
                            id: crypto.randomUUID(),    // A global utility
                            text: message,
                            isUserMessage: true,
                            isPinned: true,
                        },
                        ...latestPage.messages,
                    ]
                    // So the cloned data that we just optimistically updated will be set now as page [0]
                    newPages[0] = latestPage
                    // Need to also pass the old page, because if the optimistic msg doesn't go through we need to revert the page to the original
                    return {
                        ...old,
                        pages: newPages,
                    }
                }
            )

            setIsLoading(true) // We want to add the loading state AFTER adding the user message

            // Be sure to use flatmap so we don't get array array
            return {
                previousMessages: previousMessages?.pages.flatMap(
                    (page) => page.messages
                ) ?? [],
            }
        },
        // When we get a response back from the api, it will be a readable stream that we can put into the 
        // message as we get it, to be real time
        onSuccess: async (stream) => {
            setIsLoading(false)

            if (!stream) { // This stream could be null!
                return toast({
                    title: 'There was a problem sending this message',
                    description:
                        'Please refresh this page and try again',
                    variant: 'destructive', // To inform the user that a bad thing has happened
                })
            }

            const reader = stream.getReader()  // Read the contents
            const decoder = new TextDecoder()  // 'reader' will be encoded, so it needs to be decoded
            let done = false

            // Accumulated Response
            // We want to add text to the accumlated response as we get it
            let accResponse = ''

            // Read the contents from the stream that we got back from our api in real time
            // Keep on going until we are done
            while (!done) {
                // First we read the stream
                const { value, done: doneReading } = await reader.read()
                done = doneReading                          // If we are done we don't need to execute any further code
                const chunkValue = decoder.decode(value)    // THE ACTUAL STRING THAT THE AI GIVES BACK that we now want to add to the message and to make it show in real time

                accResponse += chunkValue                   // Add the chunked value to the accumulated response

                // Append chunk to the actual message as the data is streamed in
                // This is complex but needed! Its similar to what we did with onMutate
                // We want to add the data that we can see in the chat window
                // For things to be streamed in and updated in real time, we need to create a new reference each time we update this infinite data 
                // with the chunked value for react to know to display it. If it was the same reference react wouldn't no any difference
                utils.getMessages.setInfiniteData(
                    { type: type, key: researchKey, limit: INFINITE_QUERY_LIMIT },
                    // Receive the old data
                    (old) => {
                        if (!old) return { pages: [], pageParams: [] }

                        let isAiResponseCreated = old.pages.some(
                            // We are HARD CODING this response. We want to know if any page in any message... 
                            // Is there already a message that has an ID of ai-response. Which will be the very last one at the bottom of the page. 
                            // If there is an AI response we are not going to add a new one
                            // When enter is pressed in the chat input, when we send that response, the AI response will also be added to the screen
                            // We don't want to add to this multiple times too. Thats why we check for each chunk that we add to it
                            // We do all these nooks and crannies so there is always a message that is displayed.
                            (page) => page.messages.some((message) => message.id === 'ai-response')
                        )

                        // Lets maps over the old data pages first.
                        let updatedPages = old.pages.map((page) => {
                            // The first page, [0], contains the last message, which is the one we care about 
                            if (page === old.pages[0]) {
                                let updatedMessages

                                // If it is not there, then we are going to create it once.
                                // We need to pay attention so this is all immutable. We want to create basically new references for each entry
                                // so when we stream in chunks, this happens really fast and for the react diffing algorithm to see that we want 
                                // to re-render for each chunk else it would look really weird.

                                if (!isAiResponseCreated) {
                                    // So we create a new reference. This is a really important for React to pick up
                                    // the change later, so we can actually see it on the screen
                                    // So we create a new message! and insert it before the rest of the message spread
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: 'ai-response',                   // Note that this is the hardcoded response from above
                                            text: accResponse,                   // So we always show the latest data
                                            isUserMessage: false,
                                            isPinned: true,
                                        },
                                        ...page.messages,
                                    ]

                                    // If there is already am AI response, then we just want to add to the existing response, or the existing chunk
                                } else {
                                    updatedMessages = page.messages.map((message) => {
                                        // Return the message properties that were there before, and then change the text to be accResponse
                                        if (message.id === 'ai-response') {
                                            return {
                                                ...message,
                                                text: accResponse,
                                            }
                                        }
                                        return message
                                    }
                                    )
                                }
                                // If its not the AI response, just return the message unchanged
                                // So we keep all other properties, and only overwrite the messages
                                return {
                                    ...page,
                                    messages: updatedMessages,
                                }
                            }

                            return page // so the other pages are going to stay exactly as they are, only the first page
                        })

                        return { ...old, pages: updatedPages }  // Override the pages to be the most updated pages
                    }
                )
            }

            utils.getContextUsage.invalidate()

        },
        // THe only thing that we want to receive here, is not the first argument, not even the second, we just want the context
        onError: (_, __, context) => {
            // We want to put in the text that we already optimistically put in the chat window, back into the text box.
            setMessage(backupMessage.current)   //  We strategically saved this backup message in a previous step
            utils.getMessages.setData(      //  Rollback to previous messages
                { type: type, key: researchKey },
                { messages: context?.previousMessages ?? [] }
            )
        },
        // If we are either successful or not, we refresh the entire data, so we always get the most accurate data after a message 
        // has been sent. We send the message, we get an answer and then we restore the integrity of the entire page
        onSettled: async () => {
            setIsLoading(false)

            await utils.getMessages.invalidate({ type: type, key: researchKey })
        },
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }
    // This is what we use to send a message to the messages route.ts
    const addMessage = () => sendMessage({ message })

    return (
        <ChatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading,
        }}>
            {children}
        </ChatContext.Provider>
    )

}