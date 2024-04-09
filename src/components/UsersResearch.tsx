"use client"

import React, { useState } from 'react'

// Project Imports
import { Button } from './ui/button';
import { trpc } from '@/app/_trpc/client';
import { getUserSubscriptionPlan } from '@/lib/stripe'

// 3rd Party Imports
import Link from 'next/link';
import { format } from 'date-fns'
import Skeleton from "react-loading-skeleton"
import { Ghost, Loader2, MessageSquare, Plus, Trash } from 'lucide-react';

/** ================================|| User Research ||=================================== **/

interface PageProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const UsersResearch = ({ subscriptionPlan }: PageProps) => {

    // We need to know exactly what file is currently being deleted
    const [currentlyDeletingProject, setCurrentlyDeletingProject] = useState<string | null>(null)

    // If we invalidate the data, we force an automatic refresh
    const utils = trpc.useUtils()

    // automatically gets queried on page load
    const { data: projects, isLoading } = trpc.getUserProjects.useQuery()

    const { mutate: deleteProject } = trpc.deleteProject.useMutation({
        onSuccess() {
            utils.getUserProjects.invalidate()
        },
        onMutate({ projectId }) {
            setCurrentlyDeletingProject(projectId)
        },
        onSettled() {
            // Whether there is an error or not, the loading state should stop
            setCurrentlyDeletingProject(null)
        }
    })

    return (
        <>
            {projects && projects?.length !== 0 ? (
                <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
                    {projects
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )
                        .map((project) => (
                            <li
                                key={project.id}
                                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                                <Link
                                    href={`/research/project/${project.id}`}
                                    className='flex flex-col gap-2'>
                                    <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                                        <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' />
                                        <div className='flex-1 truncate'>
                                            <div className='flex items-center space-x-3'>
                                                <h3 className='truncate text-lg font-medium text-zinc-900'>
                                                    {project.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                                    <div className='flex items-center gap-2'>
                                        <Plus className='h-4 w-4' />
                                        {format(
                                            new Date(project.createdAt),
                                            'MMM dd yyyy'
                                        )}
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <MessageSquare className='h-4 w-4' />
                                    </div>

                                    <Button
                                        onClick={() =>
                                            deleteProject({ projectId: project.id })
                                        }
                                        size='sm'
                                        className='w-full'
                                        variant='destructive'>
                                        {currentlyDeletingProject === project.id ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        ) : (
                                            <Trash className='h-4 w-4' />
                                        )}
                                    </Button>
                                </div>

                            </li>
                        ))}
                </ul>
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
                    <p>Let&apos;s create your first research project.</p>
                </div>
            )}

        </>
    );
};

export default UsersResearch;
