import React, { Suspense } from 'react'

// Project Imports
import { db } from '@/db';
import FileDrawer from '@/components/FileDrawer';
import ContextUsage from '@/components/ContextUsage';
import BadgeFileCounter from '@/components/BadgeFileCounter'
import ProjectQuestions from '@/components/ProjectQuestions';
import AddQuestionButton from '@/components/AddQuestionButton';
import ProjectChatWrapper from '@/components/chat/ProjectChatWrapper';
import { getUserSubscriptionPlan } from '@/lib/stripe';

// 3rd Party Imports
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

/** ================================|| Research Project ||=================================== **/

interface PageProps {
    params: {
        projectid: string
    }
}

const Project = async ({ params }: PageProps) => {

    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const { projectid } = params


    // Redirect users that are not logged in
    if (!user || !user.id) redirect(`/auth-callback?origin=research/project/${projectid}`)

    const subscriptionPlan = await getUserSubscriptionPlan()

    const project = await db.project.findFirst({
        where: {
            id: projectid,
            kindeId: user.id
        }
    })
    if (!project) notFound()

    return (
        <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
            <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>

                {/* LEFT SIDE */}
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        <div className='mx-auto max-w-7xl xl:p-10'>
                            <div className='lg:mt-4 flex flex-col flex-wrap xs:flex-nowrap items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>

                                <h1 className='mb-3 font-bold text-2xl lg:text-5xl text-gray-900'>
                                    Project: <span className='text-xl'>{project.name}</span>
                                </h1>

                                <div className='flex items-center gap-x-3'>
                                    <ContextUsage type='project' usageKey={projectid} />

                                    <BadgeFileCounter type={'project'} >
                                        <FileDrawer type={'project'} isSubscribed={subscriptionPlan.isSubscribed} />
                                    </BadgeFileCounter>

                                    <AddQuestionButton projectId={projectid} isSubscribed={subscriptionPlan.isSubscribed} />
                                </div>

                            </div>

                            <ProjectQuestions projectId={projectid} subscriptionPlan={subscriptionPlan} />

                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0 '>

                    <ProjectChatWrapper projectId={project.id} />

                </div>
            </div>
        </div>
    );
};

export default Project;
