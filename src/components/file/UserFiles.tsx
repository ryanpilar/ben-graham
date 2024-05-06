import React from 'react'

// Project Imports
import AddFile from './AddFile';
import { getUserSubscriptionPlan } from '@/lib/stripe'
// 3rd Party Imports
import Files from './Files';
import GoBack from '../GoBack';
import BadgeFileCounter from './BadgeFileCounter';

/** ================================|| User Files ||=================================== **/

interface UserFiles {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
    params: any
}

const UserFiles = ({ subscriptionPlan }: UserFiles) => {

    return (

        <div className='mx-auto max-w-7xl px-3 md:p-10'>

            <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>

                <BadgeFileCounter type={'all'} >
                    <h1 className='mb-3 pr-3.5 font-bold text-5xl text-gray-900'>
                        My Files
                    </h1>
                </BadgeFileCounter>

                <AddFile isSubscribed={subscriptionPlan.isSubscribed} label='Upload File' skipUpload={false} type={'all'} />

            </div>

            <Files type={'all'} />

        </div>
    );
};

export default UserFiles;
