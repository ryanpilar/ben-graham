"use client"

import React, { useState } from 'react'

// Project Imports
import { Button, buttonVariants } from '../ui/button';
import { trpc } from '@/app/_trpc/client';

// 3rd Party Imports
import Link from 'next/link';
import Skeleton from "react-loading-skeleton"
import { CheckCheckIcon, Ghost, Loader2, MessageSquare, Plus, Trash, X } from 'lucide-react';

import { useParams } from 'next/navigation';
import { Badge, badgeVariants } from '../ui/badge';
import { cn, truncateText } from '@/lib/utils';

import { Chip } from '@nextui-org/chip';
import { CheckCircle } from 'lucide-react';

import { Tooltip as NUITooltip } from "@nextui-org/tooltip"


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

    const key = getKey()
    const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)

    const utils = trpc.useUtils()
    const { data: files, isLoading } = trpc.getFiles.useQuery({ type: type, key: key })

    const { mutate: removeLinkedFile } = trpc.removeLinkedFile.useMutation({
        onSuccess() {
            utils.getFiles.invalidate({ type: type, key: key })
            utils.getNonLinkedFiles.invalidate()
            utils.getFileCount.invalidate()
            utils.getContextUsage.invalidate()

        },
        onMutate({ fileId }) {
            setCurrentlyDeletingFile(fileId)
        },
        onSettled() {
            // Whether there is an error or not, the loading state should stop
            setCurrentlyDeletingFile(null)
        }
    })

    return (
        <div className="rounded-md w-full ">

            {files && files?.length !== 0 ? (
                <div className='flex flex-wrap gap-2'>

                    {files.map((file, index) => {
                        const { truncatedText, isTruncated } = truncateText(file.name, 35);  // Assume max length of 30

                        return isTruncated ? (
                            // Wrap with tooltip only when truncation happens
                            <NUITooltip
                                key={`file-chip-tooltip-${index}`}
                                content={file.name}
                                placement="top-start"
                                radius="sm"
                                showArrow
                            >
                                <Chip
                                    variant="shadow"
                                    color="secondary"
                                    size='lg'
                                    radius='sm'
                                    className='text-foreground-500'
                                    onClose={() => removeLinkedFile({ fileId: file.id, key: key, type: type })}
                                    startContent={<>{index + 1}.</>}
                                    endContent={currentlyDeletingFile === file.id ? (
                                        <Loader2 className='h-4 w-4  ml-3 animate-spin' />
                                    ) : (
                                        <X strokeWidth={2} className='h-4 w-4 ml-4 ' />
                                    )}
                                >
                                    <Link href={`/files/${file.id}`} className='ml-1'>{truncatedText}</Link>
                                </Chip>
                            </NUITooltip>
                        ) : (
                            // Render without tooltip if no truncation is necessary
                            <Chip
                                key={`file-chip-${index}`}
                                variant="shadow"
                                color="secondary"
                                size='lg'
                                radius='sm'
                                className='text-foreground-500'
                                onClose={() => removeLinkedFile({ fileId: file.id, key: key, type: type })}
                                startContent={<>{index + 1}.</>}
                                endContent={currentlyDeletingFile === file.id ? (
                                    <Loader2 className='h-4 w-4  ml-3 animate-spin' />
                                ) : (
                                    <X strokeWidth={2} className='h-4 w-4 ml-4 ' />
                                )}
                            >
                                <Link href={`/files/${file.id}`} className='ml-1'>{file.name}</Link>
                            </Chip>
                        );
                    })}

                </div>
            ) : isLoading ? (
                // Loading state condition:
                <Skeleton height={40} className='my-2' count={3} />
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
        </div>
    );
};

export default LinkedFiles;
