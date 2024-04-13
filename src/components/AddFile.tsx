import React from 'react'
// Project Imports
import UploadFileDropzone from './UploadFileDropzone';
import UploadFileDialog from './UploadFileDialog';

/** =================================|| Add File ||==================================== **/

interface AddFileProps {
    isSubscribed: boolean
    label: string
    skipUpload?: boolean
    type: 'all' | 'project' | 'question'
}

const AddFile = ({ isSubscribed, label, type }: AddFileProps) => {

    return (
        <>
            <UploadFileDialog isSubscribed={isSubscribed} label={label} type={type} >

                <UploadFileDropzone isSubscribed={isSubscribed} />

            </UploadFileDialog>
        </>
    );
};

export default AddFile;
