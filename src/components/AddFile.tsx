import React, { Dispatch, SetStateAction } from 'react'
// Project Imports
import UploadFileDropzone from './UploadFileDropzone';
import UploadFileDialog from './UploadFileDialog';

/** =================================|| Upload Button ||==================================== **/

interface AddFileProps {
    isSubscribed: boolean
    label: string
    skipUpload?: boolean
    onClose: Dispatch<SetStateAction<boolean>>
}

const AddFile = ({ isSubscribed, label, skipUpload, onClose }: AddFileProps) => {

    return (
        <>
            <UploadFileDialog isSubscribed={isSubscribed} label={label} >

                <UploadFileDropzone isSubscribed={isSubscribed} />

            </UploadFileDialog>
        </>
    );
};

export default AddFile;
