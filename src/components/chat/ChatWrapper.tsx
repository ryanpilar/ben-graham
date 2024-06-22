'use client'

// 3rd Party Imports
import ChatInput from './ChatInput'
import Messages from './Messages'
import { ChatContextProvider } from './ChatContext'

/** ================================|| Project Chat Wrapper ||===================================  **/

interface ChatWrapperProps {
  researchKey: string
  type: 'file' | 'project' | 'question'
  // isSubscribed: boolean
}

const ProjectChatWrapper = ({
  researchKey,
  type,
  // isSubscribed,
}: ChatWrapperProps) => {

  return (
    <ChatContextProvider type={type} researchKey={researchKey}>
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col gap-2'>
        <div className='flex-1 justify-between flex flex-col mb-28 lg:mb-[6.69rem]'>
          <Messages type={type} researchKey={researchKey} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ProjectChatWrapper