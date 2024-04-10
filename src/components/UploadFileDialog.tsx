"use client"
import React, { ReactNode, useState } from 'react'
// Project Imports
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

/** =================================|| Upload File Dialog ||==================================== **/

interface UploadFileDialogProps {
    isSubscribed: boolean
    label: string
    children: ReactNode
}
const UploadFileDialog = ({ isSubscribed, label, children }: UploadFileDialogProps) => {

    // const [isOpen, setIsOpen] = useState<boolean>(false)

    // New Experimental Code
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const isOpen = searchParams.has("drop-doc");

    const onOpenChange = (isOpen: boolean) => {

        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (isOpen) {
            // Add the "drop-doc" parameter, indicating the dialog should be open
            newSearchParams.set("drop-doc", "");
        } else {
            // Remove the "drop-doc" parameter when closing the dialog
            newSearchParams.delete("drop-doc");
        }
        const newPath = `${pathname}${newSearchParams.toString() ? `?${newSearchParams}` : ''}`;
        router.push(newPath);

    };

    return (

        <Dialog
            // modal={false}
            open={isOpen}
            onOpenChange={onOpenChange}
        // onOpenChange={(visible) => {
        //     if (!visible) {
        //         setIsOpen(visible)
        //     }
        // }}
        >

            {/* Note:   We need to use 'asChild' if you want to use a custom button, 
                        b/c a DialogTrigger, if not changed with asChild, is a button by default */}
            <DialogTrigger
                // onClick={() => setIsOpen(true)} 

                onClick={() => onOpenChange(true)}

                asChild>
                <Button>{label}</Button>
            </DialogTrigger>

            {/* Note:   Tooltip is focused on and opens when dialog renders. 
                        onOpenAutoFocus prevents that but makes tabbing slightly weird */}
            <DialogContent onOpenAutoFocus={(event) => { event.preventDefault() }}>
                {children}
            </DialogContent>

        </Dialog>
    );
};
export default UploadFileDialog;

