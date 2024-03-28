import {z} from 'zod'

// WHen you call this api, in the POST request body we are expecting:
export const SendMessageValidator = z.object({
    fileId: z.string(),
    message: z.string()
})
