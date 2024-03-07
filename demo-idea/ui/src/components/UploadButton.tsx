"use client"
import React, { useState } from 'react'
// Project Imports
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
// 3rd Party Imports
// Styles

/** ================================|| Upload Button ||=================================== **/

const UploadButton = () => {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (

        // By default the dialog is not a control component, but we make it so with the use of isOpen useState and DialogTrigger
        <Dialog
            open={isOpen}
            onOpenChange={(visible) => {
                if (!visible) {
                    setIsOpen(visible)
                }
            }}>

            {/* Note:   need to use 'asChild' if you want to use a custom button, 
                        b/c a DialogTrigger if not changed with asChild, is a button */}
            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild>
                <Button>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>
                {/* <UploadDropzone isSubscribed={isSubscribed} /> */}
                Hello test test
            </DialogContent>



        </Dialog>
    );
};

export default UploadButton;
