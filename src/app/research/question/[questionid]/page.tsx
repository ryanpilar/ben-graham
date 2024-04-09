
import React from 'react'
// Project Imports
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/stripe';

// 3rd Party Imports
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import FileDrawer from '@/components/FileDrawer';

/** ================================|| Research Project ||=================================== **/

interface PageProps {
    params: {
        questionid: string
    }
}

const Question = async ({ params }: PageProps) => {

    const { questionid } = params
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Redirect users that are not logged in
    if (!user || !user.id) redirect(`/auth-callback?origin=research/question/${questionid}`)
    
    const subscriptionPlan = await getUserSubscriptionPlan()   
    
    
    const question = await db.question.findFirst({
        where: {
            id: questionid,
            kindeId: user.id
        }
    })

    if (!question) notFound()

    return (
        <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
            <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>

                {/* Left sidebar & main wrapper */}
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>

                        <main className='mx-auto max-w-7xl md:p-10'>
                            <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                                <h1 className='mb-3 font-bold text-5xl text-gray-900'>
                                    Question: {question.text}
                                </h1>

                            </div>

                            {/* Display all research questions */}
                            <FileDrawer isSubscribed={subscriptionPlan.isSubscribed}  type={'question'} />

                        </main>
                    </div>
                </div>

                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
                    OTHER AREA {question.kindeId}

                </div>
            </div>
        </div>
    );
};

export default Question;
