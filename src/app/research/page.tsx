import React from 'react'

// Project Imports
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/stripe'

// 3rd Party Imports
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UsersResearch from '@/components/UsersResearch';
import AddProjectButton from '@/components/AddProjectButton';
import GoBack from '@/components/GoBack';

/** ================================|| Research Projects ||=================================== **/

const Research = async () => {

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Redirect users that are not logged in
    if (!user || !user.id) redirect('/auth-callback?origin=dashboard') // origin=dashboard so user can be redirected back to dashboard after auth

    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })
    if (!dbUser) redirect('/auth-callback?origin=dashboard')
    const subscriptionPlan = await getUserSubscriptionPlan()

    return (
        <>
            <main className='mx-auto max-w-7xl md:p-10'>

                <GoBack />

                <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                    <h1 className='mb-3 font-bold text-5xl text-gray-900'>
                        Research Projects
                    </h1>
                    <AddProjectButton isSubscribed={subscriptionPlan.isSubscribed} />
                </div>

                <UsersResearch subscriptionPlan={subscriptionPlan} />
            </main>
        </>
    );
};

export default Research;
