"use client";
import React, { Dispatch, ReactNode, SetStateAction, Suspense, useState } from 'react';
import { Progress } from './ui/progress';
import { useToast } from './ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { useUploadThing } from '@/lib/uploadthing/clientHelpers';
import Dropzone from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { FileCheck2, File, Loader2, Cloud } from 'lucide-react';
import ChooseFileContext from './ChooseFileContext';
import { trpcServer } from '@/trpc/trpc-caller';
import UploadFileDropzone from './UploadFileDropzone';
import Skeleton from 'react-loading-skeleton';

/** ================================|| Upload Dropzone Wrapper ||=================================== **/


export interface UploadFileUploadServer {
    isSubscribed: boolean
}

const UploadFileDropzoneServer = async ({ isSubscribed }: UploadFileUploadServer) => {

    const userProjects = await trpcServer.getUserProjects()
    // const userQuestions = await trpcServer.getUserQuestions()

    const userData = {
        userProjects,
        userQuestions: '',
    }


    console.log('useProjects', userProjects);

    return (
        <Suspense fallback={<Skeleton count={2} />}>
            <UploadFileDropzone isSubscribed={isSubscribed} userData={userData} />

        </Suspense>

    );
};

export default UploadFileDropzoneServer
