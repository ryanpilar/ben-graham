'use client'

// Project Imports
import { buttonVariants } from '../ui/button'
// import { ChatContextProvider } from './ChatContext'
// import { PLANS } from '@/config/stripe'
import { trpc } from '@/app/_trpc/client'

// 3rd Party Imports
import { ChevronLeft, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import ProjectChatInput from './ProjectChatInput'
import Messages from './Messages'
import { ProjectChatContextProvider } from './ProjectChatContext'
import ProjectMessages from './ProjectMessages'

/** ================================|| Chat Wrapper ||===================================  **/

interface ChatWrapperProps {
  projectId: string
  // isSubscribed: boolean
}

const ProjectChatWrapper = ({
  projectId,
  // isSubscribed,
}: ChatWrapperProps) => {
  // Anything we return back from the api will be available here in data
  // const { data, isLoading } = trpc.getProjectFiles.useQuery({ projectId })

  // if (isLoading)

  //   return (
  //     <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
  //       <div className='flex-1 flex justify-center items-center flex-col mb-28'>
  //         <div className='flex flex-col items-center gap-2'>
  //           <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
  //           <h3 className='font-semibold text-xl'>
  //             Loading...
  //           </h3>
  //           <p className='text-zinc-500 text-sm'>
  //             We&apos;re preparing your research info, please stay tuned.
  //           </p>
  //         </div>
  //       </div>

  //       <ChatInput isDisabled />
  //     </div>
  //   )

  // Ensure projectFiles is always an array
  // const projectFiles = data || [];

  return (
    <ProjectChatContextProvider projectId={projectId} >
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 justify-between flex flex-col mb-28'>
          <ProjectMessages projectId={projectId} />
        </div>

        <ProjectChatInput />
      </div>
    </ProjectChatContextProvider>
  )
}

export default ProjectChatWrapper
