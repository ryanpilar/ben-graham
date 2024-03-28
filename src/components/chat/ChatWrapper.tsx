'use client'

// Project Imports
import { buttonVariants } from '../ui/button'
// import { ChatContextProvider } from './ChatContext'
// import { PLANS } from '@/config/stripe'
import { trpc } from '@/app/_trpc/client'

// 3rd Party Imports
import { ChevronLeft, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import ChatInput from './ChatInput'
import Messages from './Messages'
import { ChatContextProvider } from './ChatContext'

/** ================================|| Chat Wrapper ||=================================== 
    Its really import for this chat wrapper to handle loading states.
    When we create a new file in uploadthing, we are creating it with a status of 'PROCESSING'.  
    This is essentially a loading state. In the onuploadComplete in /api/uploadthing will take
    a bit as its doing its thang as its indexing itself into a vector database. 
    
    FAILED -  tried to upload more pages than you are suppose to. Free users cannot upload more
              than 5 pages.
    **/

interface ChatWrapperProps {
  fileId: string
  // isSubscribed: boolean
}

const ChatWrapper = ({
  fileId,
  // isSubscribed,
}: ChatWrapperProps) => {
  // Anything we return back from the api will be available here in data
  const { data, isLoading } =           // isLoading is super important for our ChatWrapper loading states
    trpc.getFileUploadStatus.useQuery({ fileId, }, {

      // POLLING - This refetch interval passes in the data, so whatever we 
      // return from the api route will be accessible in the data, status in our case.
      refetchInterval: (data:any) =>
        data?.status === 'SUCCESS' ||
          data?.status === 'FAILED'
          ? false
          : 500,
    })

  if (isLoading)
  
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            <h3 className='font-semibold text-xl'>
              Loading...
            </h3>
            <p className='text-zinc-500 text-sm'>
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === 'PROCESSING')
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            <h3 className='font-semibold text-xl'>
              Processing PDF...
            </h3>
            <p className='text-zinc-500 text-sm'>
              This won&apos;t take long.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === 'FAILED')
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <XCircle className='h-8 w-8 text-red-500' />
            <h3 className='font-semibold text-xl'>
              Too many pages in PDF
            </h3>
            <p className='text-zinc-500 text-sm'>
              Your{' '}
              {/* <span className='font-medium'>
                {isSubscribed ? 'Pro' : 'Free'}
              </span>{' '} */}
              plan supports up to{' '}
              {/* {isSubscribed
                ? PLANS.find((p) => p.name === 'Pro')
                    ?.pagesPerPdf
                : PLANS.find((p) => p.name === 'Free')
                    ?.pagesPerPdf}{' '} */}
              pages per PDF.
            </p>
            <Link
              href='/dashboard'
              className={buttonVariants({
                variant: 'secondary',
                className: 'mt-4',
              })}>
              <ChevronLeft className='h-3 w-3 mr-1.5' />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  return (
    <ChatContextProvider fileId={fileId}>
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 justify-between flex flex-col mb-28'>
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper
