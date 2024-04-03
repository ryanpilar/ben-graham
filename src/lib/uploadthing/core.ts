import { UTApi } from "uploadthing/server";

/** ================================|| Uploadthing Core - TRPC ||=================================== **/

export const utapi = new UTApi({
    apiKey: process.env.UPLOADTHING_SECRET,
});

export async function deleteUploadthingFile(fileId: string) {
    try {
        await utapi.deleteFiles(fileId);
        console.log(`File ${fileId} deleted successfully from UploadThing.`);
    } catch (error) {
        console.error(`Failed to delete file ${fileId} from UploadThing:`, error);
        throw new Error(`Deletion failed for file ${fileId} in UploadThing.`);
    }
}

