"use client"

import React, { useState } from 'react'

// Project Imports
import { Button } from './ui/button';
import AddFile from './AddFile';
import { trpc } from '@/app/_trpc/client';
import { getUserSubscriptionPlan } from '@/lib/stripe'

// 3rd Party Imports
import Link from 'next/link';
import { format } from 'date-fns'
import Skeleton from "react-loading-skeleton"
import { Ghost, Loader2, MessageSquare, Plus, Trash } from 'lucide-react';
import AddProjectButton from './AddProjectButton';

/** ================================|| Project Questions ||=================================== **/

interface QuestionProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
    projectId: string
  }
  
const ProjectQuestions = ({subscriptionPlan, projectId}: QuestionProps) => {

    // We need to know exactly what file is currently being deleted
    const [currentlyDeletingQuestion, setCurrentlyDeletingQuestion] = useState<string | null>(null)

    // If we invalidate the data, we force an automatic refresh
    const utils = trpc.useUtils()          

    // automatically gets queried on page load
    const { data: questions, isLoading } = trpc.getProjectQuestions.useQuery({ projectId })     

    const { mutate: deleteQuestion } = trpc.deleteQuestion.useMutation({       
        onSuccess() {
            utils.getProjectQuestions.invalidate()
        },
        onMutate({ questionId }) {    
            setCurrentlyDeletingQuestion(questionId)
        },
        onSettled() {
            // Whether there is an error or not, the loading state should stop
            setCurrentlyDeletingQuestion(null) 
        }
    })

    return (
        <main className='mx-auto max-w-7xl md:p-10'>
            <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
                <h1 className='mb-3 font-bold text-5xl text-gray-900'>
                    Research Questions
                </h1>
            </div>

            {/* Display all research projects */}
            {questions && questions?.length !== 0 ? (
                <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
                    {questions                        
                        .map((question) => (
                            <li
                                key={question.id}
                                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                                <Link
                                    href={`/research/question/${question.id}`}
                                    className='flex flex-col gap-2'>
                                    <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                                        <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' />
                                        <div className='flex-1 truncate'>
                                            <div className='flex items-center space-x-3'>
                                                <h3 className='truncate text-lg font-medium text-zinc-900'>
                                                    {question.text}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                                    <div className='flex items-center gap-2'>
                                        <Plus className='h-4 w-4' />
                                        {format(
                                            new Date(question.createdAt),
                                            'MMM dd yyyy'
                                        )}
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <MessageSquare className='h-4 w-4' />
                                    </div>

                                    <Button
                                        onClick={() =>
                                            deleteQuestion({ questionId: question.id })
                                        }
                                        size='sm'
                                        className='w-full'
                                        variant='destructive'>
                                        {currentlyDeletingQuestion === question.id ? (
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
                    <p>Let&apos;s create your first question.</p>
                </div>
            )}

        </main>
    );
};

export default ProjectQuestions;
