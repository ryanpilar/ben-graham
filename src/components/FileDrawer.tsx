'use client'

import React, { useState } from 'react'
// Project Imports
import AddFile from './AddFile';
import { Button } from './ui/button';
import { Button as NUIButton } from '@nextui-org/button';

import LinkedFiles from './LinkedFiles';
import { trpc } from '@/app/_trpc/client';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import FileDataTable from './FileDataTable';
// 3rd Party Imports
import { clsx } from "clsx";
import { Drawer } from "vaul";
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import GoBack from './GoBack';
import { DrawerClose, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import Link from 'next/link';
import { Expand } from 'lucide-react';

import BadgeFileCounter from './BadgeFileCounter';
import { Separator } from './ui/separator';

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

            <Drawer.Overlay className="fixed inset-0 bg-black/60 z-10" />

            <Drawer.Portal>

                <Drawer.Content className={`
                    fixed flex flex-col 
                    bg-white border border-gray-200 border-b-none rounded-t-[10px] 
                    bottom-0 left-0 right-0 
                    h-full max-h-[97%] 
                    max-w-6xl mx-auto
                    z-20
                    `}>

                    <div className='relative flex justify-between'>

                        {/* <GoBack className='pl-2 pt-4 text-foreground-400' /> */}

                        <div className="mx-auto w-12 h-[4.5px] flex-shrink-0 rounded-full bg-zinc-300 mt-5 mb-5" />

                        <div className='absolute flex w-full justify-between items-center gap-x-2  pt-1.5'>

                            <DrawerClose className='px-4'>
                                <X size={25} strokeWidth={1} absoluteStrokeWidth className='text-foreground-400' />
                            </DrawerClose>

                            {snap === 0.95 ?
                                <Button variant="none" aria-label="Minimize file drawer" onClick={() => setSnap(0.30)}>
                                    <Minimize2 size={25} strokeWidth={1} absoluteStrokeWidth className='text-foreground-400' />
                                </Button>
                                :
                                <Button variant="none" aria-label="Maximize file drawer" onClick={() => setSnap(0.95)}>
                                    <Maximize2 strokeWidth={1} absoluteStrokeWidth className='text-foreground-400' />
                                </Button>
                            }

                        </div>
                    </div>

                    <div className={clsx("flex flex-col max-w-4xl mx-auto w-full p-4 pt-3", {
                        "overflow-y-auto": snap === 1,
                        "overflow-hidden": snap !== 1,
                    })}
                    >
                        <DrawerHeader className='flex w-full justify-between items-end px-0'>
                            <DrawerTitle className='flex flex-wrap justify-start items-center'>

                                <span className='flex w-full capitalize text-3xl  items-center pb-2 z-10'>{type} <ChevronRight className='text-zinc-400 px-1' />
                                    {type === 'project' ? research?.name : type === 'question' ? research?.text : ''}
                                </span>

                                <BadgeFileCounter type={type}>
                                    <h3 className="text-left w-full text-xl font-medium mr-4">Currently Linked Files </h3>
                                </BadgeFileCounter>

                                <DrawerDescription className='w-full text-left font-normal'>
                                    Link a file, or several files, to a project, or multiple projects, or even questions.
                                </DrawerDescription>
                            </DrawerTitle>

                            <AddFile isSubscribed={isSubscribed} label='Upload File' skipUpload={false} type={type} />

                        </DrawerHeader>

                        <Separator className='mb-6 h-[1.5px]' />

                        <LinkedFiles type={type} />

                        <h3 className="text-xl mt-8 font-medium py-2">
                            <Link href='/dashboard'>
                                File Inventory
                            </Link>
                        </h3>

                        <Separator className='mb-2 h-[0.5px]' />

                        <FileDataTable type={type} />

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default FileDrawer;
