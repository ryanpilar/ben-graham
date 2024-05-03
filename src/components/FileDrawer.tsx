'use client'

import React, { useState } from 'react'
// Project Imports
import AddFile from './AddFile';
import { Button } from './ui/button';
import LinkedFiles from './LinkedFiles';
import { Separator } from './ui/separator';
import FileDataTable from './FileDataTable';
import BadgeFileCounter from './BadgeFileCounter';
import { trpc } from '@/app/_trpc/client';
import { DrawerClose, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';

// 3rd Party Imports
import { clsx } from "clsx";
import { Drawer } from "vaul";
import Link from 'next/link';
import { ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea } from './ui/scroll-area';


/** ================================|| File Drawer ||=================================== **/

interface FileDrawerProps {
    isSubscribed: boolean
    type: "all" | "project" | "question"
}
const FileDrawer = ({ isSubscribed, type }: FileDrawerProps) => {

    const params = useParams()
    const [snap, setSnap] = useState<number | string | null>(0.95);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const isOpen = searchParams.has("file-drawer");

    const onOpenChange = (isOpen: boolean) => {
        const pathName = isOpen ? `${pathname}?file-drawer` : pathname;
        router.push(pathName);
    };

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
            snapPoints={[0.3, 0.95]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            open={isOpen} onOpenChange={onOpenChange}
        >
            <Drawer.Trigger asChild>
                <Button variant='default' className='inline-block' aria-label="Manage Files">Manage Files</Button>
            </Drawer.Trigger>

            <Drawer.Overlay className="fixed inset-0 bg-black/60 z-10" aria-hidden="true"/>

            <Drawer.Portal>

                <Drawer.Content className={`
                    fixed flex flex-col 
                    bg-white border border-gray-200 border-b-none rounded-t-[10px] 
                    bottom-0 left-0 right-0 
                    h-full 
                    max-w-6xl mx-auto 
                    z-30
                    `}>

                    <div className="w-full mx-auto flex flex-col overflow-auto">
                        <div className='relative flex justify-between pb-150'>

                            <div className="mx-auto w-12 h-[4.5px] flex-shrink-0 rounded-full bg-zinc-300 mt-5 mb-5" />

                            <div className='absolute flex w-full justify-between items-center gap-x-2  pt-1.5'>

                                <DrawerClose className='px-4' aria-label="Close drawer" >
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

                        <div className={clsx("flex flex-col max-w-4xl mx-auto w-full px-4", {
                            "overflow-y-auto": snap === 1,
                            "overflow-hidden": snap !== 1,
                        })}
                        >
                            <DrawerHeader className='flex w-full justify-between items-end px-0 pb-2'>

                                <DrawerTitle className='flex flex-wrap justify-start items-center'>

                                    <span className='flex w-full capitalize text-3xl  items-center z-10'>
                                        <BadgeFileCounter type={type} className='-mr-2.5 mt-1'>{type} Files</BadgeFileCounter> <ChevronRight strokeWidth={1} className='text-zinc-400 ml-2 mr-0.5' />
                                        {type === 'project' ? research?.name : type === 'question' ? research?.name : ''}
                                    </span>

                                    {/* <DrawerDescription className='w-full text-left font-normal'>
                                    Link a file, or several files, to a project, or multiple projects, or even questions.
                                </DrawerDescription> */}

                                </DrawerTitle>

                                <AddFile researchKey={key} isSubscribed={isSubscribed} skipUpload={false} type={type} label='Upload File'  />

                            </DrawerHeader>

                            <Separator className='h-[1.5px] bg-slate-200' />

                            <ScrollArea className="rounded-md">

                                <div className='flex justify-start pt-4 pb-2 px-1'>
                                    <h3 className="text-left w-full text-xl font-medium">Linked Files </h3>
                                </div>

                                <LinkedFiles type={type} />

                                <h3 className="text-xl mt-4 font-medium pt-2 px-1">
                                    <Link href='/files'>
                                        All Files
                                    </Link>
                                </h3>

                                <FileDataTable type={type} />

                            </ScrollArea>

                        </div>
                    </div>

                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default FileDrawer;
