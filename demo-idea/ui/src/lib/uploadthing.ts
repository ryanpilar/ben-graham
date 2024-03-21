import { generateReactHelpers } from "@uploadthing/react"; 
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import React from 'react'
// Project Imports
// 3rd Party Imports
// Styles
 
export const { useUploadThing } =

/** The generateReactHelpers function is used to generate the useUploadThing hook 
    and the uploadFiles functions you use to interact with UploadThing in custom 
    components. It takes your File Router as a generic. **/
  generateReactHelpers<OurFileRouter>();