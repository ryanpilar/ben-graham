import React from 'react'

// Project Imports
import { db } from '@/db';
import AddQuestion from '@/components/AddQuestion';
import SplitLayout from '@/components/SplitLayout';
import ContextUsage from '@/components/ContextUsage';
import FileDrawer from '@/components/file/FileDrawer';
import BadgeFileCounter from '@/components/file/BadgeFileCounter'
import ChatWrapper from '@/components/chat/ChatWrapper';

import { getUserSubscriptionPlan } from '@/lib/stripe';

// 3rd Party Imports
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { SheetMenu } from '@/components/SheetMenu';
import CompanyDetails from '@/components/CompanyDetails';
import CompanyDetails2 from '@/components/CompanyDetails2';


/** ================================|| Research Project - Page ||=================================== **/

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
            <div className='
                flex flex-col flex-wrap xs:flex-nowrap items-start justify-between gap-4 
                sm:flex-row sm:items-center sm:gap-0 sm:pt-3
                '
            >
                <h1 className='mb-3 font-bold text-2xl lg:text-5xl text-gray-900'>
                    Project: <span className='text-xl'>{project.name}</span>
                </h1>
                <div className='flex items-center gap-x-3'>
                    <ContextUsage type='project' usageKey={projectid} />
                    <BadgeFileCounter type={'project'} >
                        <FileDrawer type={'project'} isSubscribed={subscriptionPlan.isSubscribed} />
                    </BadgeFileCounter>
                    <AddQuestion type='project' researchKey={projectid} isSubscribed={subscriptionPlan.isSubscribed} />
                    <SheetMenu chatComponents={<ChatWrapper type='project' researchKey={project.id} />} />
                </div>
            </div>

            <CompanyDetails researchKey={projectid} subscriptionPlan={subscriptionPlan} symbol={project.symbol} exchange={project.exchange} type={'project'} />
            <CompanyDetails2 researchKey={projectid} subscriptionPlan={subscriptionPlan} symbol={project.symbol} exchange={project.exchange} type={'project'} />

        </>)
    }

    return (
        <SplitLayout
            leftChildren={<ProjectContents />}
            rightChildren={<ChatWrapper type='project' researchKey={project.id} />}
        />
    );
};

export default Project;


