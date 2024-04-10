'use client'

import React, { useState } from 'react'
// Project Imports
import AddFile from './AddFile';
import { Button } from './ui/button';
import LinkedFiles from './LinkedFiles';
import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import FileDataTable from './FileDataTable';
// 3rd Party Imports
import { clsx } from "clsx";
import { Drawer } from "vaul";

/** ================================|| File Drawer ||=================================== **/

interface FileDrawerProps {
    isSubscribed: boolean
    type: "all" | "project" | "question"
}
const FileDrawer = ({ isSubscribed, type }: FileDrawerProps) => {

    const params = useParams()
    const getKey = () => {

        if (type === 'project' && params.projectid) {
            return Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
        } else if (type === 'question' && params.questionid) {
            return Array.isArray(params.questionid) ? params.questionid[0] : params.questionid;
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

    const { data: research, isLoading: isLoadingProject } = trpc.getResearchDetails.useQuery({ type: type, key: key })

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
                                <h2 className='flex items-center capitalize'>{type} <ChevronRight className='text-zinc-400 px-1' /> {type === 'project' ? research?.name : type === 'question' ? research?.text : ''}</h2>
                                <h3 className="text-2xl mt-2 mb-4 font-medium">Currently Linked Files </h3>
                            </div>

                            <AddFile isSubscribed={isSubscribed} label='Upload File' skipUpload={false} onClose={setOpen} />

                        </div>

                        <LinkedFiles type={type} />

                        <h3 className="text-2xl mt-8 font-medium">All Files</h3>

                        <FileDataTable type={type} />

                    </div>
                </Drawer.Content>

            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default FileDrawer;
