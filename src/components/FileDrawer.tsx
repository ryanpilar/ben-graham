'use client'
import React from 'react'
// Project Imports
// 3rd Party Imports
import { useState } from "react";
import { Drawer } from "vaul";
import { clsx } from "clsx";
import { Button } from './ui/button';
import FileDataTable from './FileDataTable';
import AddFile from './AddFile';
import { useParams } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import LinkedFiles from './LinkedFiles';
import { ChevronRight } from 'lucide-react';
// Styles

/** ================================|| File Drawer ||=================================== **/
interface FileDrawerProps {
    isSubscribed: boolean
    type: "all" | "project" | "question"
}
const FileDrawer = ({ isSubscribed, type }: FileDrawerProps) => {

    const params = useParams()

    const getKey = () => {
        console.log('params', params);


        if (type === 'project' && params.projectid) {
            return Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
        } else if (type === 'question' && params.questionId) {
            return Array.isArray(params.questionId) ? params.questionId[0] : params.questionId;
        }
        return '#';
    };

    const key = getKey()

    const [snap, setSnap] = useState<number | string | null>(0.95);
    const [open, setOpen] = useState(false);

    // We need to know exactly what file is currently being deleted
    const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)

    // If we invalidate the data, we force an automatic refresh
    const utils = trpc.useUtils()


    // MAYBE TURN INTO GET RESEARCH?
    const { data: research, isLoading: isLoadingProject } = trpc.getResearchDetails.useQuery({ type: type, key: key })

    console.log('research deets:', research, isLoadingProject);

    const { mutate: deleteFile } = trpc.deleteFile.useMutation({
        onSuccess() {
            utils.getUserFiles.invalidate()
        },
        onMutate({ id }) {    // Callback right away when the button is clicked
            setCurrentlyDeletingFile(id)
        },
        onSettled() {
            // Whether there is an error or not, the loading state should stop
            setCurrentlyDeletingFile(null)
        }
    })

    return (
        <Drawer.Root
            snapPoints={[0.3, 0.5, 0.7, 0.95]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            open={open} onOpenChange={setOpen}
        >
            <Drawer.Trigger asChild>
                <Button>Manage Files</Button>
            </Drawer.Trigger>

            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Portal>

                <Drawer.Content className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]">
                    <div
                        className={clsx("flex flex-col max-w-3xl mx-auto w-full p-4 pt-5", {
                            "overflow-y-auto": snap === 1,
                            "overflow-hidden": snap !== 1,
                        })}
                    >

                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
                        <div className='flex justify-between'>

                            <div >
                                <h2 className='flex items-center capitalize'>For {type} <ChevronRight className='text-zinc-400 px-1' /> {research?.name || research?.text}</h2>
                                <h3 className="text-2xl mt-2 mb-4 font-medium">Currently Linked Files </h3>
                            </div>

                            <AddFile isSubscribed={isSubscribed} label='Upload File' skipUpload={false} onClose={setOpen} />

                        </div>

                        {/* <LinkedFiles type='project' /> */}
                        <LinkedFiles type={type} />

                        <h3 className="text-2xl mt-8 font-medium">All Files</h3>

                        <FileDataTable />

                    </div>
                </Drawer.Content>

            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default FileDrawer;
