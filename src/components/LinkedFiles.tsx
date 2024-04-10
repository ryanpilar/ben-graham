"use client"

import React, { useState } from 'react'

// Project Imports
import { Button, buttonVariants } from './ui/button';
import { trpc } from '@/app/_trpc/client';

// 3rd Party Imports
import Link from 'next/link';
import { format } from 'date-fns'
import Skeleton from "react-loading-skeleton"
import { Ghost, Loader2, MessageSquare, Plus, Trash, X } from 'lucide-react';

import { useParams } from 'next/navigation';
import { Tag } from './Tag';
import { Badge, badgeVariants } from './ui/badge';
import { cn } from '@/lib/utils';

/** =================================|| Linked Files ||==================================== **/

interface FilesProps {
    type: "all" | "project" | "question"
}
const LinkedFiles = ({ type }: FilesProps) => {

    const params = useParams()  

    const getKey = () => {
        if (type === 'project' && params.projectid) {
            return Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
        } else if (type === 'question' && params.questionid) {
            return Array.isArray(params.questionid) ? params.questionid[0] : params.questionid;
        }
        return '#'
    };

    // We need to know exactly what file is currently being deleted
    const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)

    // If we invalidate the data, we force an automatic refresh
    const utils = trpc.useUtils()

    const { data: files, isLoading } = trpc.getFiles.useQuery({ type: type, key: getKey() })

    // One more useQuery to get all files
    const { mutate: removeLinkedFile } = trpc.removeLinkedFile.useMutation({
        onSuccess() {
            utils.getFiles.invalidate()
            utils.getNonLinkedFiles.invalidate()
        },
        onMutate({ fileId }) {    // Callback right away when the button is clicked
            setCurrentlyDeletingFile(fileId)
        },
        onSettled() {
            // Whether there is an error or not, the loading state should stop
            setCurrentlyDeletingFile(null)
        }
    })



    return (
        <>
            {files && files?.length !== 0 ? (
                <div className='flex flex-wrap gap-2'>
                    {files
                        .map((file) => (

                            <Badge variant='outline' className='flex gap-x-8 justify-between'>
                                <Link
                                    href={`/dashboard/${file.id}`}
                                    className={cn(buttonVariants({variant: 'none', size: 'sm'}),'ml-2 text-black/65 hover:text-black/90')}>
                                    {file.name}

                                </Link>
                                <Button
                                        onClick={() =>
                                            removeLinkedFile({ fileId: file.id, projectId: getKey() })
                                        }
                                        size='sm'
                                        className='w-full rounded-full bg-white'
                                        variant='destructive'>
                                        {currentlyDeletingFile === file.id ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        ) : (
                                            <Trash className='h-4 w-4' />
                                            // <X className='h-4 w-4' />
                                        )}
                                    </Button>
                            </Badge>

                        ))
                    }
                </div>
            ) : isLoading ? (
                // Loading state condition:
                <Skeleton height={100} className='my-2' count={3} />
            ) : (
                // Empty state condition:
                <div className='mt-16 flex flex-col items-center gap-2'>
                    <Ghost className='h-8 w-8 text-zinc-800' />
                    <h3 className='font-semibold text-xl'>
                        Pretty empty around here...
                    </h3>
                    <p>Let&apos;s link your first project file.</p>
                </div>
            )}
        </>
    );
};

export default LinkedFiles;
