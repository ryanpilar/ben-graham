import React, { Suspense } from 'react'

// Project Imports
import AddFile from './file/AddFile';
import { getUserSubscriptionPlan } from '@/lib/stripe'

// 3rd Party Imports
import Skeleton from "react-loading-skeleton"
import Files from './file/Files';
import GoBack from './GoBack';



/** ================================|| User Dashboard ||=================================== **/

interface PageProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
    params: any
}

const UserDashboard = ({ subscriptionPlan, params }: PageProps) => {

    return (
        <div className='mx-auto max-w-7xl md:p-10'>

            <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                <h1 className='mb-3 font-bold text-5xl text-gray-900'>
                    My Files
                </h1>

                <Suspense fallback={<Skeleton count={1} />}>
                    <AddFile isSubscribed={subscriptionPlan.isSubscribed} label='Upload File' skipUpload={false} type={'all'} />
                </Suspense>

            </div>

            <GoBack />


            <Files type={'all'} />

        </div>
    );
};

export default UserDashboard;
