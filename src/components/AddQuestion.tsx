"use client"
import React, { useState, Dispatch, SetStateAction } from 'react'
// Project Imports
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

// 3rd Party Imports
import { useRouter } from 'next/navigation';
import { FileQuestion, MessageCircleQuestion, File, Loader2 } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { PLANS } from '@/config/stripe';

/** =================================|| Add Question Button ||==================================== **/

interface AddQuestionButtonProps {
    isSubscribed: boolean
    projectId: string
}
const AddQuestionButton = ({ isSubscribed, projectId }: AddQuestionButtonProps) => {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (

        <Dialog
            open={isOpen}
            onOpenChange={(visible) => {
                if (!visible) {
                    setIsOpen(visible)
                }
            }}>

            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild>
                <Button>Add Question</Button>
            </DialogTrigger>

            <DialogContent>
                <AddQuestion setIsOpen={setIsOpen} projectId={projectId} isSubscribed={isSubscribed} />
            </DialogContent>

        </Dialog>
    );
};

/** ====================================|| Add Question ||======================================= **/

interface AddQuestionProps {
    isSubscribed: boolean
    projectId: string
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const AddQuestion = ({ isSubscribed, projectId, setIsOpen }: AddQuestionProps) => {

    const router = useRouter()

    const { toast } = useToast()

    const questionSchema = z.object({ name: z.string().min(1, "Project question is required"), })

    type QuestionFormData = z.infer<typeof questionSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<QuestionFormData>({
        defaultValues: { name: '', },
        resolver: zodResolver(questionSchema),
    });

    const utils = trpc.useUtils()

    const { mutate: addMongoQuestion } = trpc.addQuestion.useMutation({
        onSuccess: () => {
            toast({
                title: 'Question added successfully',
                variant: 'default',
            });

            utils.getProjectQuestions.invalidate()
            setIsOpen(false)

        },
        onError: () => {
            toast({
                title: 'Error adding question',
                description: 'Please try again',
                variant: 'destructive',
            });
        },
    });

    const handleQuestionSubmit = (data: QuestionFormData) => {

        addMongoQuestion({
            ...data,
            projectId: projectId
        })
    }

    const renderPlanLimit = () => {
        const subscriptionStatus = isSubscribed ? 'plus' : 'free'
        const plan = PLANS.find((plan) => plan.slug === subscriptionStatus)

        return `add up to ${plan?.numQuestions} more`
    }

    return (
        <form onSubmit={handleSubmit(handleQuestionSubmit)} className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
            <div className='flex items-center justify-center h-full w-full'>

                <div className='flex flex-col items-center justify-center w-full h-full px-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        {/* <FileQuestion className='h-6 w-6 text-zinc-500 mb-2' /> */}
                        <MessageCircleQuestion className='h-6 w-6 text-zinc-500 mb-2' />

                        <p className='mb-2 text-sm text-zinc-700'>
                            <span className='font-semibold'>
                                Add New Question
                            </span>{' '}
                        </p>
                        <p className='text-xs text-zinc-500'>
                            Limit: {renderPlanLimit()}
                        </p>
                    </div>

                    <div className='flex w-full justify-between gap-x-2 p-3 bg-white rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                        <div className='w-full h-full'>
                            <Input
                                {...register('name')}
                                placeholder='Your Unanswered Question...'
                                className={cn('', errors.name && 'focus-visible:ring-red-500')}
                            />
                            {errors.name && <p className='text-red-500 text-xs pl-3.5 py-1'>{errors.name.message}</p>}
                        </div>

                        <Button type="submit">Add Question</Button>

                    </div>
                </div>
            </div>
        </form>
    )
}
export default AddQuestionButton;