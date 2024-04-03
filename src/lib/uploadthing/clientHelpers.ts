import { generateReactHelpers } from "@uploadthing/react"; 
import type { OurFileRouter } from "@/app/api/uploadthing/core";

  /** ================================|| Uploadthing Client ||=================================== 
   
      Utilizes `generateReactHelpers` from `@uploadthing/react` to create `useUploadThing` hook, 
      enabling direct file uploads. Leverages `OurFileRouter` for type-safe integration with 
      UploadThing file routing.

  **/
  
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();


  
  

  