'use client'

import React, { useState } from 'react'
// Project Imports
import AddFile from './AddFile';
import { Button } from './ui/button';
import LinkedFiles from './LinkedFiles';
import { trpc } from '@/app/_trpc/client';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import FileDataTable from './FileDataTable';
// 3rd Party Imports
import { clsx } from "clsx";
import { Drawer } from "vaul";
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import GoBack from './GoBack';
import { DrawerClose, DrawerDescription, DrawerHeader, DrawerTitle } from './ui/drawer';
import Link from 'next/link';

/** ================================|| File Drawer ||=================================== **/

interface FileDrawerProps {
    isSubscribed: boolean
    type: "all" | "project" | "question"
}
const FileDrawer = ({ isSubscribed, type }: FileDrawerProps) => {

    const params = useParams()

    const [snap, setSnap] = useState<number | string | null>(0.95);
    const [open, setOpen] = useState(false);

    //////////////////////////////////////////////////////

    // New Experimental Code
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const isOpen = searchParams.has("file-drawer");

    const onOpenChange = (isOpen: boolean) => {
        const pathName = isOpen ? `${pathname}?file-drawer` : pathname;
        router.push(pathName);
    };

    //////////////////////////////////////////////////////

    const getKey = () => {

        if (type === 'project' && params.projectid) {
            return Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
        } else if (type === 'question' && params.questionid) {
            return Array.isArray(params.questionid) ? params.questionid[0] : params.questionid;
        }
        return '#';
    };

    const key = getKey()
    const { data: research, isLoading: isLoadingProject } = trpc.getResearchDetails.useQuery({ type: type, key: key })

    return (
        <Drawer.Root
            snapPoints={[0.3, 0.5, 0.7, 0.95]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            // open={open} onOpenChange={setOpen}
            open={isOpen} onOpenChange={onOpenChange}

        >
            <Drawer.Trigger asChild>
                <Button>Manage Files</Button>
            </Drawer.Trigger>

            <Drawer.Overlay className="fixed inset-0 bg-black/40" />

            <Drawer.Portal>

                <Drawer.Content className={`
                    fixed flex flex-col 
                    bg-white border border-gray-200 border-b-none rounded-t-[10px] 
                    bottom-0 left-0 right-0 
                    h-full max-h-[97%] 
                    max-w-5xl mx-auto
                    `}>

                    <div className={clsx("flex flex-col max-w-3xl mx-auto w-full p-4 pt-5", {
                        "overflow-y-auto": snap === 1,
                        "overflow-hidden": snap !== 1,
                    })}
                    >

                        <DrawerHeader className='m-0 p-0'>

                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-5" />

                            {/* <GoBack /> */}

                            <div className='flex w-full justify-between'>

                                <DrawerTitle className='flex flex-wrap justify-start items-center'>
                                    <h3 className="text-left w-full text-2xl font-medium">Currently Linked Files </h3>

                                    <h2 className='flex capitalize items-center'>{type} <ChevronRight className='text-zinc-400 px-1' />
                                        {type === 'project' ? research?.name : type === 'question' ? research?.text : ''}
                                    </h2>
                                </DrawerTitle>

                                <AddFile isSubscribed={isSubscribed} label='Upload File' skipUpload={false} onClose={setOpen} />

                            </div>

                            <DrawerDescription className='text-left mb-4'>
                                Link a file, or several files, to a project, or multiple projects, or even questions.
                            </DrawerDescription>

                        </DrawerHeader>

                        <LinkedFiles type={type} />

                        <Link href='/dashboard'>
                            <h3 className="text-2xl mt-8 font-medium">File Inventory</h3>
                        </Link>

                        <FileDataTable type={type} />

                    </div>
                </Drawer.Content>

            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default FileDrawer;
