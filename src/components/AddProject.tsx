"use client"

import React from 'react'

// Project Imports
import { Button } from './ui/button'
import { PLANS } from '@/config/stripe'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import SearchTickers from './SearchTickers'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal"

// 3rd Party Imports
import { useRouter } from 'next/navigation'
import { FolderOpen } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { useForm } from 'react-hook-form'

/** =================================|| Add Project Button ||==================================== **/

const AddProjectButton = ({ isSubscribed, }: { isSubscribed: boolean }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Button onClick={onOpen}>Add Project</Button>
            <Modal
                backdrop="opaque"
                isOpen={isOpen}
                onClose={onClose}
                classNames={{
                    body: "pb-4",
                    backdrop: "bg-black bg-opacity-65",
                    // closeButton: "absolute top-4 right-4 m-0",
                    base: "max-w-xl rounded-lg bg-white dark:bg-gray-800",
                    header: "p-2",
                    footer: "bg-transparent py-6",
                }}
            >
                <ModalContent>
                    <>
                        <ModalHeader className="flex flex-col"></ModalHeader>
                        <ModalBody>
                            <AddProject isSubscribed={isSubscribed} onClose={onClose} />
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>
        </>
    )
};

/** ====================================|| Add Project ||======================================= **/

const AddProject = ({ isSubscribed, onClose }: { isSubscribed: boolean; onClose: () => void }) => {

    const projectSchema = z.object({
        name: z.string().min(1, "Project name is required"),
        symbol: z.string().min(1, "Project symbol is required"),
        exchange: z.string().min(1, "Project exchange is required")
    });
    type ProjectFormData = z.infer<typeof projectSchema>;

    const router = useRouter()
    const { toast } = useToast()
    const utils = trpc.useUtils()

    // Conditional logic based on user subscription status
    const renderPlanLimit = () => {
        const subscriptionStatus = isSubscribed ? "plus" : "free";
        const plan = PLANS.find((plan) => plan.slug === subscriptionStatus);

        return `add up to ${plan?.numProjects} more`;
    };

    // Hooks for handling the form
    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProjectFormData>({
        defaultValues: { name: "" },
        resolver: zodResolver(projectSchema),
    });

    const setProjectName = (name: string) => {
        setValue("name", name);
    }
    const setProjectSymbol = (symbol: string) => {
        setValue("symbol", symbol);
    }
    const setProjectExchange = (exchange: string) => {
        setValue("exchange", exchange);
    }

    // TRPC client side endpoints
    const { mutate: addProject } = trpc.addProject.useMutation({
        onSuccess: (project) => {
            toast({
                title: "Project added successfully",
                description: "You have added a new project.",
                variant: "default",
            });
            utils.getUserProjects.invalidate()
            router.push(`/research/project/${project.id}`);
            onClose();
        },
        onError: () => {
            toast({
                title: "Error adding project",
                description: "Please try again",
                variant: "destructive",
            });
        },
    });

    const handleProjectSubmit = (data: ProjectFormData) => addProject(data);

    return (

        <form onSubmit={handleSubmit(handleProjectSubmit)} className="border m-4 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center justify-center h-full w-full">
                <div className="flex flex-col items-center justify-center w-full h-full px-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FolderOpen className="h-6 w-6 text-zinc-500 mb-2" />
                        <p className="mb-2 text-sm text-zinc-700">
                            <span className="font-semibold">Add New Research Project</span>{" "}
                        </p>
                        <p className="text-xs text-zinc-500">Limit: {renderPlanLimit()}</p>
                    </div>

                    <SearchTickers setProjectName={setProjectName} setProjectSymbol={setProjectSymbol} setProjectExchange={setProjectExchange} />

                    {errors.name && <p className="text-red-500 text-xs pl-3.5 py-1">{errors.name.message}</p>}

                    <ModalFooter className='bg-transparent'>
                        <Button type='button' onClick={onClose}>Close</Button>
                        <Button type="submit">Add Project</Button>
                    </ModalFooter>

                </div>
            </div>
        </form>
    );
};

export default AddProjectButton;