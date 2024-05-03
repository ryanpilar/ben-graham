import { useContext, useEffect, useRef } from 'react'

// Project Imports
import Message from './Message'
import { trpc } from '@/app/_trpc/client'
import { ChatContext } from './ChatContext'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
// 3rd Party Imports
import Skeleton from 'react-loading-skeleton'
import { useIntersection } from '@mantine/hooks'
import { Loader2, MessageSquare } from 'lucide-react'

interface MessagesProps {
  fileId: string
}

/** ==================================|| Messages ||===================================== 
 
    Get all the messages that we would like to display and render them out one by one
    inside the chat window 
    
    We pass only the fileId, and from that we can deduce the cursor and we can then
    tell the database where to begin its search.

    The way we decide to load new messages on top of the chat, is with our '+1' element
    when it is intersecting with our viewport. We attach a ref to the last element that
    is rendered on the screen. So we map and cross reference the index to make a 
    conditional check

**/

const Messages = ({ fileId }: MessagesProps) => {

  const { isLoading: isAiThinking } = useContext(ChatContext)  // Very much controls what message is going to be displayed!

  const { data, isLoading, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery( // Call our TRPC endpoint and destructure the data
    {
      fileId,
      limit: INFINITE_QUERY_LIMIT,
    },
    // By using getNextPageParam we get access to the 'lastPage'. And trpc knows where to start fetching
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      keepPreviousData: true,
    }
  )
  // We could use a regular 'map' for this, our returned type would be array array, or [][]. So we flatten the map to get one array
  const messages = data?.pages.flatMap((page) => page.messages)

  // Regarding format, this needs to match our other messages too
  // We want the loading state to be true for the AI, but not for the user
  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: 'loading-message',
    isUserMessage: false,
    text: (
      <span className='flex h-full items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </span>
    ),
    isPinned: false,
  }

  // We want to create a combined messages constant, so when we send a message later, we also want to display a loading state
  // This is going to combine the loading message to all the other messages in our chat
  const combinedMessages = [
    // Show the loading state only if the AI is thinking
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ]

  const lastMessageRef = useRef<HTMLDivElement>(null)

  // We pass a ref to keep track which message is the last one, and if its on the screen, we load more messages.
  // Mantine's useIntersection helps us deal with when the message is intersecting with the top of the viewport
  const { ref, entry } = useIntersection({
    root: lastMessageRef.current, // We are keeping track of this exact div, that we are passing as a prop
    threshold: 1,
  })
  

  useEffect(() => {
    // If the ref is intersecting, we need to load more messages!
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  return (
    <div className='
      flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 
      overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter 
      scrollbar-w-2 scrolling-touch'
    >
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {

          const isNextMessageSamePerson = combinedMessages[i - 1]?.isUserMessage === combinedMessages[i]?.isUserMessage // Edge case for message styling

          if (i === combinedMessages.length - 1) {

            return (
              <Message
                ref={ref}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            )

          } else
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            )
        })
      ) : isLoading ? (
        <div className='w-full flex flex-col gap-2'>
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
        </div>
      ) : (
        <div className='flex-1 flex flex-col items-center justify-center gap-2'>
          <MessageSquare className='h-8 w-8 text-blue-500' />
          <h3 className='font-semibold text-xl'>
            You&apos;re all set!
          </h3>
          <p className='text-zinc-500 text-sm'>
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default Messages