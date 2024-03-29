import React from 'react'
// Project Imports
import { db } from '@/db';
// 3rd Party Imports
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserDashboard from '@/components/UserDashboard';

/** ================================|| Dashboard ||=================================== **/

const Dashboard = async () => {

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
    
    return (
        <div className=''>
            <UserDashboard />
        </div>
    );
};

export default Dashboard;
