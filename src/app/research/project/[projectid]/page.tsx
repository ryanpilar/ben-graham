
import React from 'react'
// Project Imports
import { db } from '@/db';
import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import FileDrawer from '@/components/FileDrawer';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import ProjectQuestions from '@/components/ProjectQuestions';
import AddQuestionButton from '@/components/AddQuestionButton';
// 3rd Party Imports
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

/** ================================|| Research Project ||=================================== **/

interface PageProps {
    params: {
        projectid: string
    }
}

const Project = async ({ params }: PageProps) => {

    const { projectid } = params
    const { getUser } = getKindeServerSession()
    const user = await getUser()

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

                {/* Left sidebar & main wrapper */}
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>

                        <GoBack />
                        <main className='mx-auto max-w-7xl md:p-10'>
                            <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                                <h1 className='mb-3 font-bold text-5xl text-gray-900'>
                                    Project: <span className='text-xl'>{project.name}</span>
                                </h1>
                                <AddQuestionButton projectId={projectid} isSubscribed={subscriptionPlan.isSubscribed} />
                            </div>

                            <ProjectQuestions projectId={projectid} subscriptionPlan={subscriptionPlan} />

                            <FileDrawer type={'project'} isSubscribed={subscriptionPlan.isSubscribed} />
                            
                            
                        </main>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
                    OTHER AREA {project.kindeId}
                </div>
            </div>
        </div>
    );
};

export default Project;
