"use client"
import React, { ReactNode, useState } from 'react'
// Project Imports
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

/** =================================|| Upload File Dialog ||==================================== **/

interface UploadFileDialogProps {
    isSubscribed: boolean
    label: string
    children: ReactNode
}
const UploadFileDialog = ({ isSubscribed, label, children }: UploadFileDialogProps) => {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (

        <Dialog
            // modal={false}
            open={isOpen}
            onOpenChange={(visible) => {
                if (!visible) {
                    setIsOpen(visible)
                }
            }}>

            {/* Note:   We need to use 'asChild' if you want to use a custom button, 
                        b/c a DialogTrigger, if not changed with asChild, is a button by default */}
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
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

