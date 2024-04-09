"use client"
import React, { useState } from 'react'
// Project Imports
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

// 3rd Party Imports
import { useRouter } from 'next/navigation';
import { FolderOpenDot, FolderOpen, File, Loader2 } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { PLANS } from '@/config/stripe';

/** =================================|| Add Project Button ||==================================== **/

const AddProjectButton = ({ isSubscribed, }: { isSubscribed: boolean }) => {

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
                <Button>Add Project</Button>
            </DialogTrigger>

            <DialogContent>
                <AddProject isSubscribed={isSubscribed} />
            </DialogContent>

        </Dialog>
    );
};

/** ====================================|| Add Project ||======================================= **/

const AddProject = ({ isSubscribed, }: { isSubscribed: boolean }) => {

    const router = useRouter()

    const { toast } = useToast()    

    const projectSchema = z.object({ name: z.string().min(1, "Project name is required"), })
    
    type ProjectFormData = z.infer<typeof projectSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectFormData>({
        defaultValues: { name: '', },
        resolver: zodResolver(projectSchema),
    });

    const { mutate: addMongoProject } = trpc.addProject.useMutation({
        onSuccess: (project) => {

            toast({
                title: 'Project added successfully',
                description: 'You have added a new project.',
                variant: 'default',
            });
            router.push(`/research/project/${project.id}`)
                        
        },
        onError: () => {
            toast({
                title: 'Error adding project',
                description: 'Please try again',
                variant: 'destructive',
            });
        },
    });

    const handleProjectSubmit = (data: ProjectFormData) => {

        console.log('handleProjectSubmit, data:', data);

        addMongoProject(data)
    }

    const renderPlanLimit = () => {
        const subscriptionStatus = isSubscribed ? 'plus' : 'free'
        const plan = PLANS.find((plan) => plan.slug === subscriptionStatus)

        return `add up to ${plan?.numProjects} more`
    }

    return (
        <form onSubmit={handleSubmit(handleProjectSubmit)} className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
            <div className='flex items-center justify-center h-full w-full'>

                <div className='flex flex-col items-center justify-center w-full h-full px-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <FolderOpen className='h-6 w-6 text-zinc-500 mb-2' />
                        <p className='mb-2 text-sm text-zinc-700'>
                            <span className='font-semibold'>
                                Add New Research Project
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
                                placeholder='Project Name'
                                className={cn(
                                    '',
                                    errors.name && 'focus-visible:ring-red-500'
                                )}
                            />
                            {errors.name && <p className='text-red-500 text-xs pl-3.5 py-1'>{errors.name.message}</p>}


                        </div>
                        <Button type="submit">Add Project</Button>

                    </div>



                </div>
            </div>
        </form>
    )
}


export default AddProjectButton;
