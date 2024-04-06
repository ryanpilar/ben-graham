import React from 'react'
// Project Imports
import UploadFileDropzone from './UploadFileDropzone';
import ChooseFileContext from './ChooseFileContext';
import UploadFileDialog from './UploadFileDialog';

/** =================================|| Upload Button ||==================================== **/

const AddFileButton = ({ isSubscribed, }: { isSubscribed: boolean }) => {

    return (
        <>
            <UploadFileDialog isSubscribed={isSubscribed}>

                <UploadFileDropzone isSubscribed={isSubscribed} />

            </UploadFileDialog>
        </>
    );
};

export default AddFileButton;
