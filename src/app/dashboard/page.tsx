import React from 'react'

// Project Imports
import { db } from '@/db';
import { getUserSubscriptionPlan } from '@/lib/stripe'
import UserDashboard from '@/components/UserDashboard';

// 3rd Party Imports
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";


/** ================================|| Dashboard Page ||=================================== **/

const Dashboard = async ({ params }: any ) => {

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Redirect users that are not logged in
    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')  

    const subscriptionPlan = await getUserSubscriptionPlan()

    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })

    if (!dbUser) redirect('/auth-callback?origin=dashboard')

    return (
        <>
            <UserDashboard params={params} subscriptionPlan={subscriptionPlan} />
        </>
    );
};

export default Dashboard;
