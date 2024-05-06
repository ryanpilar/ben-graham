'use client'

// 3rd Party Imports
import ChatInput from './ChatInput'
import Messages from './Messages'
import { ChatContextProvider } from './ChatContext'

/** ================================|| Project Chat Wrapper ||===================================  **/

interface ChatWrapperProps {
  projectId: string
  // isSubscribed: boolean
}

const ProjectChatWrapper = ({
  projectId,
  // isSubscribed,
}: ChatWrapperProps) => {

  return (
    <ChatContextProvider type='project' researchKey={projectId}>

      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 justify-between flex flex-col mb-28'>
          <Messages type='project' researchKey={projectId} />
        </div>
        <ChatInput />
      </div>

    </ChatContextProvider>

  )
}

export default ProjectChatWrapper