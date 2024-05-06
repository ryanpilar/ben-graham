import React, { Suspense } from 'react'

// Project Imports
import { db } from '@/db';
import FileDrawer from '@/components/file/FileDrawer';
import ContextUsage from '@/components/ContextUsage';
import BadgeFileCounter from '@/components/file/BadgeFileCounter'
import ProjectQuestions from '@/components/ProjectQuestions';
import AddQuestionButton from '@/components/AddQuestion';
import ProjectChatWrapper from '@/components/chat/ProjectChatWrapper';
import { getUserSubscriptionPlan } from '@/lib/stripe';

// 3rd Party Imports
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import PinnedMessages from '@/components/chat/PinnedMessages';
import Notes from '@/components/Notes';
import SplitLayout from '@/components/SplitLayout';
import Questions from '@/components/Questions';

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

    const ProjectContents = () => {
        return (<>
            <div className='lg:mt-4 flex flex-col flex-wrap xs:flex-nowrap items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                
                <h1 className='mb-3 font-bold text-2xl lg:text-5xl text-gray-900'>
                    Project: <span className='text-xl'>{project.name}</span>
                </h1>

                <div className='flex items-center gap-x-3'>
                    <ContextUsage type='project' usageKey={projectid} />
                    <BadgeFileCounter type={'project'} >
                        <FileDrawer type={'project'} isSubscribed={subscriptionPlan.isSubscribed} />
                    </BadgeFileCounter>
                    <AddQuestionButton type='project' researchKey={projectid}  isSubscribed={subscriptionPlan.isSubscribed} />
                </div>
            </div>

            {/* <ProjectQuestions projectId={projectid} subscriptionPlan={subscriptionPlan} /> */}
            <Questions type='project' researchKey={projectid} subscriptionPlan={subscriptionPlan} />
            <PinnedMessages type={'project'} researchKey={projectid} />
            {/* <Suspense fallback={<>Loading...</>}> */}
                <Notes type='project' researchKey={projectid} />
            {/* </Suspense> */}

        </>)
    }

    return (
        <SplitLayout
            leftChildren={<ProjectContents />}
            rightChildren={<ProjectChatWrapper projectId={project.id} />}
        />
    );
};

export default Project;


