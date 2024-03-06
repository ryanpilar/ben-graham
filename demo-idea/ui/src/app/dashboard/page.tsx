import React from 'react'
// Project Imports
// 3rd Party Imports
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types';
import { redirect } from 'next/navigation'
// Styles

/** ================================|| Dashboard ||=================================== **/

const Dashboard = async () => {

    const { getUser } = getKindeServerSession()
    const user: KindeUser | null = await getUser()
    console.log('user', user)

    // Redirect signers that are not logged in
    if (!user || !user.id) redirect('/auth-callback?origin=dashboard') // origin=dashboard so user can be redirected back to dashboard after auth

    // Is the user synced to the database
    // We need a user in the db to assign files and chats
    


    return (
        <div className=''>
            {user.email}
        </div>
    );
};

export default Dashboard;
