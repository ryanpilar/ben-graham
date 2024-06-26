"use client";
import React, { Suspense } from 'react';
import { trpcServer } from '@/trpc/trpc-caller';
import UploadFileDropzone from './UploadFileDropzone';
import Skeleton from 'react-loading-skeleton';

/** ================================|| Upload Dropzone Wrapper ||=================================== **/


export interface UploadFileUploadServer {
    isSubscribed: boolean
}

const UploadFileDropzoneServer = async ({ isSubscribed }: UploadFileUploadServer) => {

    const userProjects = await trpcServer.getUserProjects()

    return (
        <Suspense fallback={<Skeleton count={2} />}>
            <UploadFileDropzone isSubscribed={isSubscribed} />
        </Suspense>
    );
};

export default UploadFileDropzoneServer
