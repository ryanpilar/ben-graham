"use client";
import React, { Dispatch, ReactNode, SetStateAction, Suspense, useState } from 'react';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { useUploadThing } from '@/lib/uploadthing/clientHelpers';
import Dropzone from 'react-dropzone';
import { FileCheck2, File, Loader2, Cloud } from 'lucide-react';
import ChooseFileContext from './ChooseFileContext';
import Skeleton from "react-loading-skeleton"
import { useRouter } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation';
import { util } from 'zod';


/** ================================|| Upload Dropzone ||=================================== **/

export interface UploadedFileProps {
    fileName: string;
    path: string;
    id: string;
}

export interface UploadDropzoneProps {
    isSubscribed: boolean
    children?: ReactNode
    researchKey?: string
    type?: 'project' | 'question' | 'all'
}

const UploadFileDropzone = ({ isSubscribed, type, researchKey, children }: UploadDropzoneProps) => {

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    // const [isChoosingContext, setIsChoosingContext] = useState(false);

    const router = useRouter()
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { toast } = useToast();
    const utils = trpc.useUtils()

    const [uploadedFile, setUploadedFile] = useState<UploadedFileProps | {}>({})

    // Depending on if the user is on the free plan or the plus plan, choose the appropriate uploader
    const { startUpload } = useUploadThing(isSubscribed ? 'plusPlanUploader' : 'freePlanUploader');

    const { mutate: addLinkedFile } = trpc.addLinkedFile.useMutation({

        onSuccess: () => {
            // If the type of research is a 'project' or 'question', then also update the Mongo document
            utils.getFiles.invalidate()
            utils.getFileCount.invalidate()
        },

        onError: () => {
            toast({
                title: 'Oops...',
                description: 'File did not link.',
                variant: 'destructive',
            });
        },
    });

    const onOpenChange = (isOpen: boolean) => {

        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (isOpen) {
            // Add the "drop-doc" parameter, indicating the dialog should be open
            newSearchParams.set("drop-doc", "");
        } else {
            // Remove the "drop-doc" parameter when closing the dialog
            newSearchParams.delete("drop-doc");
        }
        const newPath = `${pathname}${newSearchParams.toString() ? `?${newSearchParams}` : ''}`;
        router.push(newPath);

    };

    const { mutate: startPolling } = trpc.getFile.useMutation({

        onSuccess: (file) => {

            // Now ask the user to choose what projects or questions they would like to add there file too
            setUploadedFile({
                fileName: file.name,
                path: `/files/${file.id}`,
                id: file.id
            })

            // If the type of research is a 'project' or 'question', then also update the Mongo document
            console.log('YOOOO', type, researchKey);

            researchKey && type && addLinkedFile({ type: type, key: researchKey, fileId: file.id })

            // Make sure other reliant components also update their state
            utils.getFiles.invalidate()
            utils.getNonLinkedFiles.invalidate()

            toast({
                title: 'File added successfully',
                // description: 'You have added a new file.',
                variant: 'default',
            })
            onOpenChange(false)
        },

        // Retry indefinitely until we get our file
        retry: true,
        retryDelay: 500
    });

    const startSimulateProgress = () => {
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prevValue) => {
                if (prevValue >= 95) {
                    clearInterval(interval);
                    return prevValue;
                }
                return prevValue + 5;
            });
        }, 1100);

        return interval;
    };
    return (
        <div className='flex items-center justify-center border min-h-64 m-4 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100'>

            {/* {!isChoosingContext ? ( */}
            <Dropzone
                multiple={false}
                onDrop={async (acceptedFile) => {

                    setIsUploading(true);
                    const progressInterval = startSimulateProgress();

                    // Handle the file uploading
                    const response = await startUpload(acceptedFile);

                    if (!response) {
                        return toast({
                            title: 'Something went wrong',
                            description: 'Please try again...',
                            variant: 'destructive',
                        });
                    }

                    const [fileResponse] = response;

                    // 'key' is generated by uploadthing
                    const key = fileResponse.key;

                    // ALWAYS make sure there is a key
                    if (!key) {
                        return toast({
                            title: 'Something went wrong',
                            description: 'For some reason there was no key generated by Uploadthing. Please try again...',
                            variant: 'destructive',
                        });
                    }

                    

                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    startPolling({ key });
                }}
            >
                {({ getRootProps, getInputProps, acceptedFiles }) => (

                    // getRootProps is what makes the dropzone work
                    <div {...getRootProps()} className=''>
                        <div className='flex items-center justify-center h-full w-full'>

                            <label
                                htmlFor='dropzone-file'
                                className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer '
                            >
                                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                    <Cloud className='h-6 w-6 text-zinc-500 mb-2' />
                                    <p className='mb-2 text-sm text-zinc-700'>
                                        <span className='font-semibold'>
                                            Click to upload
                                        </span>{' '}
                                        or drag and drop
                                    </p>
                                    <p className='text-xs text-zinc-500'>
                                        PDF (up to {isSubscribed ? "16" : "4"}MB)
                                        PDF up to 4mb
                                    </p>
                                </div>

                                {acceptedFiles && acceptedFiles[0] ? (
                                    <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                                        <div className='px-3 py-2 h-full grid place-items-center'>
                                            <File className='h-4 w-4 text-blue-500' />
                                        </div>
                                        <div className='px-3 py-2 h-full text-sm truncate'>
                                            {acceptedFiles[0].name}
                                        </div>
                                    </div>
                                ) : null}

                                {isUploading ? (
                                    <div className='w-full mt-4 max-w-xs mx-auto'>
                                        <Progress
                                            indicatorColor={uploadProgress === 100
                                                ? 'bg-green-500'
                                                : ''}
                                            value={uploadProgress}
                                            className='h-1 w-full bg-zinc-200' />
                                        {uploadProgress === 100 ? (
                                            <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                                <Loader2 className='h-3 w-3 animate-spin' />
                                                Redirecting...
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                {/* Invisible Input */}
                                <input
                                    {...getInputProps()}
                                    type='file'
                                    id='dropzone-file'
                                    className='hidden' />
                            </label>
                        </div>
                    </div>
                )}
            </Dropzone>
            {/* // ) : null} */}

            {/* {(isChoosingContext) ? (
                <>
                    <ChooseFileContext
                        uploadedFile={{
                            fileName: 'string',
                            path: 'string',
                            id: 'string'
                        }}
                    />
                </>
            ) : null} */}

        </div>
    );
};

export default UploadFileDropzone
