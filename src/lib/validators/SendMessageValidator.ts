import {z} from 'zod'

export const SendMessageValidator = z.object({
    fileId: z.string(),
    message: z.string()
})

export const SendProjectMessageValidator = z.object({
    projectId: z.string(),
    message: z.string()
})

export const SendQuestionMessageValidator = z.object({
    questionId: z.string(),
    message: z.string()
})