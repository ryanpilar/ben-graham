import React from 'react'

// Project Imports
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/stripe'

// 3rd Party Imports
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserResearch from '@/components/UserResearch';

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
            <UserResearch subscriptionPlan={subscriptionPlan} />
        </>
    );
};

export default Research;
