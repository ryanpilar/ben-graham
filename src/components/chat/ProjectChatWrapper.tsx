'use client'

// 3rd Party Imports
import ProjectMessages from './ProjectMessages'
import ProjectChatInput from './ProjectChatInput'
import { ProjectChatContextProvider } from './ProjectChatContext'

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