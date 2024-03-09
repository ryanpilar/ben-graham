import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

/** ================================|| Core ||=================================== 
    -   the middleware will run when someone has requested to upload a file from the client
    -   onUploadComplete will run when the upload is successful 
    -   only authenticated user can upload files
**/

export const ourFileRouter = {

    pdfUploader: f({ image: { maxFileSize: "4MB" } })
        .middleware(async () => {
            const { getUser } = getKindeServerSession()
            const user = await getUser()
          
            if (!user || !user.id) throw new Error('Unauthorized')
          
            // const subscriptionPlan = await getUserSubscriptionPlan()
          
            // return { subscriptionPlan, userId: user.id }
            return {kindeId: user.id} // whatever we return here, will end up below in metadata
          })
        .onUploadComplete(async ({ metadata, file }) => { }),

} satisfies FileRouter;

// Uploadthing needs to know this type exported below. You can't just infer this type in the pkg.
// therefore it expects on you to write this hook, but uploadthing supplies the snippet
export type OurFileRouter = typeof ourFileRouter;