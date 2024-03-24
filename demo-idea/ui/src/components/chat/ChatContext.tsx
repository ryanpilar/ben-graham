import { ReactNode, createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";

type StreamResponse = {
    addMessage: () => void
    message: string

    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void   // Whenever an event gets triggered in our chat input this comes out
    isLoading: boolean
}

// This is what we are going to consume in our components.
export const ChatContext = createContext<StreamResponse>({
    // With context we always need to define our fallback values
    addMessage: () => { },
    message: '',
    handleInputChange: () => { },
    isLoading: false,
})

interface Props {
    fileId: string
    children: ReactNode
}
// Wrap chat components in the provider
export const ChatContextProvider = ({ fileId, children }: Props) => {
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    // One of the only times when we are not going to use trpc in our app!
    // trpc is our type safe wrapper
    // We are not using trpc, because we want to stream back a response from the api to the client
    // trpc only works for json
    // so we use react-query:

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message,
                })
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }
            return response.body
        }
    })
    // This is what we use to send a message to the messages route.ts
    const addMessage = () => sendMessage({ message })
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

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