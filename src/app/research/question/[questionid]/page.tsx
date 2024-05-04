
import React from 'react'
// Project Imports
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/stripe';

// 3rd Party Imports
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import FileDrawer from '@/components/file/FileDrawer';
import SplitLayout from '@/components/SplitLayout';
import AddQuestionButton from '@/components/AddQuestion';
import ContextUsage from '@/components/ContextUsage';
import BadgeFileCounter from '@/components/file/BadgeFileCounter';

/** ================================|| Research Question ||=================================== **/

interface PageProps {
    params: {
        questionid: string
    }
}

const Question = async ({ params }: PageProps) => {

    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const { questionid } = params

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

    const QuestionContents = () => {
        return (<>
            <div className='lg:mt-4 flex flex-col flex-wrap xs:flex-nowrap items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                <h1 className='mb-3 font-bold text-2xl lg:text-5xl text-gray-900'>
                    Question: <span className='text-xl'>{question.name}</span>
                </h1>

                <div className='flex items-center gap-x-3'>
                    <ContextUsage type='question' usageKey={questionid} />
                    <BadgeFileCounter type={'question'} >
                        <FileDrawer type={'question'} isSubscribed={subscriptionPlan.isSubscribed} />
                    </BadgeFileCounter>
                    {/* <AddQuestionButton questionid={questionid} isSubscribed={subscriptionPlan.isSubscribed} /> */}
                </div>

            </div>





        </>)
    }

    return (
        <SplitLayout
            leftChildren={<QuestionContents />}
            rightChildren={<>'waaaaaaa'</>}
        />
    );
};

export default Question;
