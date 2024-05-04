import React from 'react'

// Project Imports
import { db } from '@/db';
import UserFiles from '@/components/file/UserFiles';
import { getUserSubscriptionPlan } from '@/lib/stripe'

// 3rd Party Imports
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";


/** ================================|| Files ||=================================== **/

const Files = async ({ params }: any ) => {

    // Fetch user data from Kinde auth
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Redirect users that are not logged in
    if (!user || !user.id) redirect('/auth-callback?origin=files') 

    // Fetch user data from Stripe:
    const subscriptionPlan = await getUserSubscriptionPlan()

    // Make sure a user Mongo record exists
    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })
    if (!dbUser) redirect('/auth-callback?origin=files')

    return (
        <>
            <UserFiles params={params} subscriptionPlan={subscriptionPlan} />
        </>
    );
};

export default Files;
