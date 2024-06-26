'use client'

import React from 'react'

import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/sidebar";
import { useStore } from "@/hooks/useStore";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { SheetMenu } from "@/components/SheetMenu";
import { cn } from '@/lib/utils';

/** ================================|| Split Layout ||=================================== **/

interface SplitLayoutProps {
    leftChildren: React.ReactNode
    rightChildren: React.ReactNode
}
const SplitLayout = ({ leftChildren, rightChildren }: SplitLayoutProps) => {

    const sidebar = useStore(useSidebarToggle, (state) => state);

    return (
        // <div className='flex-1 justify-between flex flex-col h-full'>
        // <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>

        //     <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>

        //         {/* LEFT SIDE */}
        //         <div className='flex-1 xl:flex'>
        //             <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
        //                 <div className='mx-auto max-w-7xl xl:p-10'>

        //                     {leftChildren}

        //                 </div>
        //             </div>
        //         </div>

        //         {/* RIGHT SIDE */}
        //         <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0 '>

        //             {rightChildren}

        //         </div>
        //     </div>
        // </div>

        <>

            <div className={cn(
                "min-h-[calc(100vh_-_56px)] transition-[margin-right] ease-in-out duration-300 w-full",
                sidebar?.isOpen === false ? "lg:mr-[0px]" : "lg:w-[50%]")}
            >
                {/* <div className="mx-4 sm:mx-8 flex justify-end  items-center">
                    <div className="flex items-center space-x-4 lg:space-x-0">
                        <SheetMenu chatComponents={rightChildren} />
                    </div>
                </div> */}
                <div className="container pt-2 pb-8 px-4 sm:px-8 ">
                    {leftChildren}
                </div>
            </div>

            <Sidebar chatComponents={rightChildren} />

            {/* <footer className={cn(
                "transition-[margin-right] ease-in-out duration-300",
                sidebar?.isOpen === false ? "lg:mr-[0px]" : "lg:w-[50%]")}
            >
                <Footer />
            </footer> */}

        </>

    );
};

export default SplitLayout;
