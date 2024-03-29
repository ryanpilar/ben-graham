"use client"
import React, { useState } from 'react'
// Project Imports
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
// 3rd Party Imports
import Dropzone from 'react-dropzone'
import { Cloud, File, Loader2 } from 'lucide-react'
import { Progress } from './ui/progress';
import { useUploadThing } from '@/lib/uploadthing';
import { useToast } from './ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { useRouter } from 'next/navigation';
// Styles

/** ================================|| Upload Button ||=================================== **/

const UploadDropzone = () => {

    const router = useRouter()

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)     // For the determinate progress bar

    const { toast } = useToast()
    const { startUpload } = useUploadThing("pdfUploader")

    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true, // retry indefinitely until we get our file
        retryDelay: 500
    })

    const startSimulateProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress((prevValue) => {
                if (prevValue >= 95) {
                    clearInterval(interval)
                    return prevValue
                }
                return prevValue + 5
            })
        }, 750)

        return interval
    }

    return (
        <Dropzone
            multiple={false}
            onDrop={async (acceptedFile) => {

                setIsUploading(true)
                const progressInterval = startSimulateProgress()

                // Handle the file uploading
                const response = await startUpload(acceptedFile)

                if (!response) {
                    return toast({
                        title: 'Something went wrong',
                        description: 'Please try again later',
                        variant: 'destructive',
                    })
                }

                const [fileResponse] = response

                // The 'key' is generated by uploadthing
                const key = fileResponse.key
                // ALWAYS make sure there is a key
                if (!key) {
                    return toast({
                        title: 'Something went wrong',
                        description: 'Please try again later',
                        variant: 'destructive',
                    })
                }


                // await new Promise((resolve) => setTimeout(resolve,6000))

                clearInterval(progressInterval)
                setUploadProgress(100)
                startPolling({ key })
            }}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (

                // getRootProps is what makes the dropzone work
                <div {...getRootProps()} className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
                    <div className='flex items-center justify-center h-full w-full'>

                        <label
                            htmlFor='dropzone-file'
                            className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
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
                                    {/* PDF (up to {isSubscribed ? "16" : "4"}MB) */}
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
                                        indicatorColor={
                                            uploadProgress === 100
                                                ? 'bg-green-500'
                                                : ''
                                        }
                                        value={uploadProgress}
                                        className='h-1 w-full bg-zinc-200'
                                    />
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
                                className='hidden'
                            />

                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}

const UploadButton = () => {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (

        // By default the dialog is not a control component, but we make it so with the use of isOpen useState and DialogTrigger
        <Dialog
            open={isOpen}
            onOpenChange={(visible) => {
                if (!visible) {
                    setIsOpen(visible)
                }
            }}>

            {/* Note:   need to use 'asChild' if you want to use a custom button, 
                        b/c a DialogTrigger if not changed with asChild, is a button */}
            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild>
                <Button>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>
                {/* <UploadDropzone isSubscribed={isSubscribed} /> */}
                <UploadDropzone />
            </DialogContent>



        </Dialog>
    );
};

export default UploadButton;
