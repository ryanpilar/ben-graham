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
    researchKey?: string
}

const AddFile = ({ isSubscribed, label, type, researchKey }: AddFileProps) => {

    return (
        <>
            <UploadFileDialog isSubscribed={isSubscribed} label={label} type={type} >

                <UploadFileDropzone researchKey={researchKey} type={type} isSubscribed={isSubscribed} />

            </UploadFileDialog>
        </>
    );
};

export default AddFile;
