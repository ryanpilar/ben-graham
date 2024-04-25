// Project Imports
import { db } from '@/db'
import { PLANS } from '@/config/stripe'
import { absoluteUrl } from '@/lib/utils'
import { deletePineconeNamespace } from '@/lib/pinecone/core'
import { deleteUploadthingFile } from '@/lib/uploadthing/core'
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe'

// 3rd Party Imports
import {
    privateProcedure,
    publicProcedure,
    router,
} from './trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { countMessageTokens } from '@/lib/tiktoken/core'


import { PrismaClient, User, File, Project, Question, Message } from '@prisma/client';


/** ================================|| TRPC Routes ||=================================== **/

// NOTE: createCaller method exists on our API endpoint on the core wrapper around the appRouter 
// which means serverTrpc has access to all the same api endpoints that we can also call 
// from the client side


export const appRouter = router({
    // PUBLIC ROUTES
    authCallback: publicProcedure.query(async () => {
        // 1st find the user ID with kinde
        const { getUser } = getKindeServerSession()
        const kindeUser = await getUser()

        if (!kindeUser?.id || !kindeUser.email) {
            throw new TRPCError({ code: 'UNAUTHORIZED' })   // TRPCError is a utility that handles predefined errors for us
        }

        // Check if the user is in the db
        const mongoUser = await db.user.findFirst({
            where: {
                id: kindeUser.id
            }
        })

        if (!mongoUser) {
            // create user in db
            await db.user.create({
                data: {
                    id: kindeUser.id,                            // Note: this is the kinde id
                    email: kindeUser.email
                }
            })
        }
        return { success: true }

    }),

    // FILES, LINKED FILES & UNLINKED FILES
    getFile: privateProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { kindeId } = ctx
            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    kindeId,
                }
            })
            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })



            return file
        }),
    deleteFile: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const { kindeId } = ctx
            const fileId = input.id

            const file = await db.file.findFirst({
                where: {
                    id: fileId,                             // Automatically has the type we declare via zod above
                    kindeId,                                // Only search for files that are currently logged in with kindeId
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            // Delete Pinecone namespace, UploadThing file, and associated Mongo Messages
            await Promise.all([
                deletePineconeNamespace(fileId),
                deleteUploadthingFile(fileId),
                db.message.deleteMany({
                    where: { fileId: fileId },
                }),

            ])

            // Leaving the Mongo File for last...       
            await db.file.delete({
                where: {
                    id: fileId,
                },
            })

            return file
        }),
    getFiles: privateProcedure
        .input(z.object({ type: z.enum(['all', 'project', 'question']), key: z.string().optional() }))
        .query(async ({ input, ctx }) => {
            const { kindeId } = ctx;
            const { key, type } = input


            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            return await db.file.findMany({
                where: {
                    ...(type !== 'all' && {
                        [type === 'project' ? 'projectIds' : 'questionIds']: {
                            has: key,
                        },
                    }),
                    kindeId: kindeId,
                },
                select: {
                    id: true,
                    name: true,
                    projectIds: true,
                    questionIds: true,
                    createdAt: true,
                },
            })

        }),
    getUserFiles: privateProcedure
        .query(async ({ ctx }) => {
            const { user, kindeId } = ctx

            return await db.file.findMany({
                where: {
                    kindeId: kindeId
                }
            })
        }),
    getFileCount: privateProcedure
        .input(z.object({ type: z.enum(['all', 'project', 'question']), key: z.string().optional() }))
        .query(async ({ input, ctx }) => {

            const { kindeId } = ctx;
            const { key, type } = input


            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            // Count files filtered by type and key
            const count = await db.file.count({
                where: {
                    kindeId: kindeId,
                    ...(type !== 'all' && {
                        [type === 'project' ? 'projectIds' : 'questionIds']: {
                            has: key
                        }
                    })
                }
            });
            return count

        }),
    getNonLinkedFiles: privateProcedure
        .input(z.object({ type: z.enum(['all', 'project', 'question']), key: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { type, key } = input

            // Fetch files along with their related projects
            const filesWithProjects = await db.file.findMany({
                where: {
                    kindeId: kindeId,
                },
                include: {
                    projects: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    questions: {
                        select: {
                            id: true,
                            name: true,
                        },
                    }
                },
            });

            // Transform the data to match the data table structure
            const result = filesWithProjects.map(file => ({
                id: file.id,
                name: file.name,
                projects: file.projects.map((project) => { return { id: project.id ?? '', name: project.name ?? '' } }),
                questions: file.questions.map((question) => { return { id: question.id ?? '', name: question.name ?? '' } }),

            }));

            return result;
        }),
    removeLinkedFile: privateProcedure
        .input(z.object({ type: z.enum(['all', 'project', 'question']), key: z.string().optional(), fileId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const { kindeId } = ctx
            const { type, fileId, key } = input

            // Verify if the file exists
            const file = await db.file.findUnique({
                where: {
                    id: fileId,
                    kindeId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            if (type === 'project') {
                // Fetch the project and manually remove the fileId from its fileIds
                const project = await db.project.findUnique({
                    where: {
                        id: key,
                        kindeId,
                    },
                });

                if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

                const updatedFileIds = project.fileIds.filter(id => id !== fileId);
                await db.project.update({
                    where: { id: key },
                    data: { fileIds: updatedFileIds },
                });

                // Also, update the File to remove the projectId from its projectIds
                const updatedProjectIds = file.projectIds.filter(id => id !== key);
                await db.file.update({
                    where: { id: fileId },
                    data: { projectIds: updatedProjectIds },
                });
            } else if (type === 'question') {
                // Fetch the question and manually remove the fileId from its fileIds 
                const question = await db.question.findUnique({
                    where: {
                        id: key,
                        kindeId,
                    },
                });

                if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found' });

                const updatedFileIds = question.fileIds.filter(id => id !== fileId)
                await db.question.update({
                    where: { id: key },
                    data: { fileIds: updatedFileIds },
                });

                // Update the file to remove the questionId from its questionIds array
                const updatedQuestionIds = file.questionIds.filter(id => id !== key);
                await db.file.update({
                    where: { id: fileId },
                    data: { questionIds: updatedQuestionIds },
                });
            }

            return file;



            // return file;
        }),
    addLinkedFile: privateProcedure
        .input(z.object({
            fileId: z.string(),
            key: z.string(),
            type: z.enum(['all', 'project', 'question'])
        }))
        .mutation(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { fileId, key, type } = input;

            // Verify if the file exists
            const fileExists = await db.file.findFirst({
                where: {
                    id: fileId,
                    kindeId,
                },
            })

            if (!fileExists) throw new TRPCError({ code: 'NOT_FOUND', message: 'File cannot be found' });

            if (type === 'project') {

                // Ensure the project exists and belongs to the current kindeId
                const projectExists = await db.project.findUnique({
                    where: {
                        id: key,
                        kindeId,
                    },
                })

                if (!projectExists) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project cannot be found' });

                // Check if fileId is already linked to the project to avoid duplicates
                if (!projectExists.fileIds.includes(fileId)) {
                    await db.project.update({
                        where: { id: key },
                        data: {
                            fileIds: {
                                push: fileId,
                            },
                        },
                    });
                }

                // Similar approach for file.projectIds update, assuming similar structure
                const file = await db.file.findUnique({
                    where: { id: fileId },
                    select: { projectIds: true }, // Select only projectIds
                });

                if (file && !file.projectIds.includes(key)) {
                    await db.file.update({
                        where: { id: fileId },
                        data: {
                            projectIds: {
                                push: key,
                            },
                        },
                    });
                }

            } else if (type === 'question') {
                // Ensure the project exists and belongs to the current kindeId
                const questionExists = await db.question.findUnique({
                    where: {
                        id: key,
                        kindeId,
                    },
                })

                if (!questionExists) throw new TRPCError({ code: 'NOT_FOUND', message: 'Question cannot be found' });

                // Check if fileId is already linked to the project to avoid duplicates
                if (!questionExists.fileIds.includes(fileId)) {
                    await db.question.update({
                        where: { id: key },
                        data: {
                            fileIds: {
                                push: fileId,
                            },
                        },
                    });
                }

                // Similar approach for file.projectIds update, assuming similar structure
                const file = await db.file.findUnique({
                    where: { id: fileId },
                    select: { questionIds: true }, // Select only projectIds
                });

                if (file && !file.questionIds.includes(key)) {
                    await db.file.update({
                        where: { id: fileId },
                        data: {
                            questionIds: {
                                push: key,
                            },
                        },
                    });
                }

            }


        }),
    addLinkedFiles: privateProcedure
        .input(z.object({ type: z.enum(['all', 'project', 'question']), key: z.string(), fileIds: z.array(z.string()) }))
        .mutation(async ({ ctx, input }) => {

            const { kindeId } = ctx;
            const { fileIds, key, type } = input;



            if (type === 'project') {

                const project = await db.project.findUnique({
                    where: {
                        id: key,
                        kindeId,
                    },
                    select: { fileIds: true }, // Select existing fileIds to check against
                });

                if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project cannot be found' });

                const filteredFileIds = fileIds.filter(fileId => !project.fileIds.includes(fileId));

                // Verify each fileId exists and belongs to the current kindeId
                const files = await db.file.findMany({
                    where: {
                        id: { in: filteredFileIds },
                        kindeId,
                    },
                    select: { id: true, projectIds: true },
                });

                if (files.length !== filteredFileIds.length) throw new TRPCError({ code: 'NOT_FOUND' });

                await db.project.update({
                    where: { id: key },
                    data: {
                        fileIds: {
                            push: filteredFileIds,
                        },
                    },
                });

                // For each file, update its projectIds if the projectId is not already associated
                await Promise.all(files.map(async file => {
                    if (!file.projectIds.includes(key)) {
                        await db.file.update({
                            where: { id: file.id },
                            data: {
                                projectIds: {
                                    push: key,
                                },
                            },
                        });
                    }
                }))

            } else if (type === 'question') {
                const question = await db.question.findUnique({
                    where: {
                        id: key,
                        kindeId,
                    },
                    select: { fileIds: true },
                });

                if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: 'Question cannot be found' });

                const filteredFileIds = fileIds.filter(fileId => !question.fileIds.includes(fileId));

                // Verify each fileId exists and belongs to the current kindeId
                const files = await db.file.findMany({
                    where: {
                        id: { in: filteredFileIds },
                        kindeId,
                    },
                    select: { id: true, questionIds: true },
                });

                if (files.length !== filteredFileIds.length) throw new TRPCError({ code: 'NOT_FOUND' });

                await db.question.update({
                    where: { id: key },
                    data: {
                        fileIds: {
                            push: filteredFileIds,
                        },
                    },
                });

                // For each file, update its projectIds if the projectId is not already associated
                await Promise.all(files.map(async file => {
                    if (!file.questionIds.includes(key)) {
                        await db.file.update({
                            where: { id: file.id },
                            data: {
                                questionIds: {
                                    push: key,
                                },
                            },
                        });
                    }
                }));
            }
        }),
    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ input, ctx }) => {
            const file = await db.file.findFirst({
                where: {
                    id: input.fileId,
                    kindeId: ctx.kindeId,
                },
            })
            // Return as a 'constant', tells typescript that 'PENDING' is fine and a valid state to be in
            if (!file) return { status: 'PENDING' as const }

            return { status: file.uploadStatus }
        }),
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),                // In the infinite query, this determines what the next amount to be shown is
                fileId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {

            const { kindeId } = ctx
            const { fileId, cursor } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    kindeId: kindeId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            const messages = await db.message.findMany({
                // +1 helps us determine if we need to scroll up, from where we want to fetch the next messages
                take: limit + 1,
                // We take from the db, +1, because we use that +1 as the cursor. So when we scroll up, with the cursor in place, we now know the next messages we need to fetch
                where: {
                    fileId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                    isPinned: true
                },
            })
            // Determine the cursor, and pop() it
            let nextCursor: typeof cursor | undefined = undefined

            // If we also have additional messages in the database, lets grab more messages! But, grab that +1 that we intentionally brought in 
            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }
            return {
                messages,
                nextCursor,                                 // nextCursor tells us where to start fetching if we start scrolling through the messages
            }
        }),
    getProjectFiles: privateProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { projectId } = input;

            // Fetch files that are linked to the given projectId
            const files = await db.file.findMany({
                where: {
                    projectIds: {
                        hasSome: [projectId],
                    },
                    kindeId: kindeId,
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                }
            });

            if (!files || files.length === 0) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'No files found for the specified project' });
            }
            // Return only a list of fileIds
            // return files.map(file => file.id)
            return files

        }),

    // PROJECTS
    getProjectMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),                // In the infinite query, this determines what the next amount to be shown is
                projectId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {

            const { kindeId } = ctx
            const { projectId, cursor } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT

            const project = await db.project.findFirst({
                where: {
                    id: projectId,
                    kindeId: kindeId,
                },
            })

            if (!project) throw new TRPCError({ code: 'NOT_FOUND' })

            const messages = await db.message.findMany({
                // +1 helps us determine if we need to scroll up, from where we want to fetch the next messages
                take: limit + 1,
                // We take from the db, +1, because we use that +1 as the cursor. So when we scroll up, with the cursor in place, we now know the next messages we need to fetch
                where: {
                    projectId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                    isPinned: true,
                },
            })
            // Determine the cursor, and pop() it
            let nextCursor: typeof cursor | undefined = undefined

            // If we also have additional messages in the database, lets grab more messages! But, grab that +1 that we intentionally brought in 
            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }
            return {
                messages,
                nextCursor,                                 // nextCursor tells us where to start fetching if we start scrolling through the messages
            }
        }),
    addProject: privateProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            const project = await db.project.create({
                data: {
                    name: input.name,
                    kindeId,
                },
            });

            return project;
        }),
    getUserProjects: privateProcedure
        .query(async ({ ctx }) => {
            const { kindeId } = ctx;
            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            const projects = await db.project.findMany({
                where: { kindeId },
            });

            return projects;
        }),
    deleteProject: privateProcedure
        .input(z.object({ projectId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const { kindeId } = ctx;
            const { projectId } = input;

            // Verify the project belongs to the current user before deletion
            const project = await db.project.findFirst({
                where: {
                    id: projectId,
                    kindeId: kindeId, // Ensure the project belongs to the current user
                },
            })

            if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found or you do not have permission to delete this project.' });

            // Find all questions associated with the project
            const questions = await db.question.findMany({
                where: { projectId: projectId },
            });

            // Each question being deleted also needs its messages deleted
            for (const question of questions) {
                await db.message.deleteMany({
                    where: { questionId: question.id },
                });
            }

            // Now delete the question
            await db.question.deleteMany({
                where: { projectId: projectId },
            });

            // Delete all messages directly associated with the project
            await db.message.deleteMany({
                where: { projectId: projectId },
            });

            // Finally, delete the project itself
            await db.project.delete({
                where: { id: projectId },
            });

            return { success: true, message: 'Project and all associated data deleted successfully.' };

        }),
    getProject: privateProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { projectId } = input

            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            const project = await db.project.findUnique({
                where: {
                    id: projectId,
                    kindeId
                },
            });

            if (!project) throw new TRPCError({ code: 'NOT_FOUND' })

            return project;
        }),

    getResearchDetails: privateProcedure
        .input(z.object({ type: z.enum(['all', 'project', 'question']), key: z.string().optional() }))

        // .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { type, key } = input;

            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            // Handle case when type is 'project'
            if (type === 'project' && key) {
                const project = await db.project.findUnique({
                    where: {
                        id: key,
                        kindeId
                    },
                    select: {
                        name: true
                    }
                });
                if (!project) throw new TRPCError({ code: 'NOT_FOUND' });
                return project
            }

            // Handle when type is 'question'
            else if (type === 'question' && key) {
                const question = await db.question.findUnique({
                    where: {
                        id: key,
                        kindeId
                    },
                    select: {
                        name: true
                    }
                });

                if (!question) throw new TRPCError({ code: 'NOT_FOUND' });

                return question
            }

            // Handle when type is 'all'
            else if (type === 'all' && key) {
                console.log('Handle condition "all" not complete')
            }
        }),

    // QUESTIONS
    getUserQuestions: privateProcedure
        .query(async ({ ctx }) => {
            const { kindeId } = ctx;
            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            const questions = await db.question.findMany({
                where: { kindeId },
            });

            return questions;
        }),
    addQuestion: privateProcedure
        .input(z.object({
            name: z.string(),
            projectId: z.string().optional().nullable(),
            parentQuestionId: z.string().optional().nullable(),
        }).refine(data => data.projectId || data.parentQuestionId, {
            message: "Must specify either a projectId or a parentQuestionId",
        }))
        .mutation(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' })

            const question = await db.question.create({
                data: {
                    name: input.name,
                    kindeId: ctx.kindeId,
                    ...input.projectId && { projectId: input.projectId },
                    ...input.parentQuestionId && { parentQuestionId: input.parentQuestionId },
                },
            });

            return { question };
        }),
    getProjectQuestions: privateProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ input, ctx }) => {
            const { kindeId } = ctx;
            if (!kindeId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            const questions = await db.question.findMany({
                where: {
                    projectId: input.projectId,
                    kindeId: kindeId,
                }
            })
            if (!questions) throw new TRPCError({ code: 'NOT_FOUND' })

            return questions;
        }),
    deleteQuestion: privateProcedure
        .input(z.object({ questionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { questionId } = input;

            // Verify the question belongs to the current user before deletion
            const question = await db.question.findFirst({
                where: {
                    id: questionId,
                    kindeId: kindeId,
                },
            });

            if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found or you do not have permission to delete this question.' });

            await Promise.all([
                db.message.deleteMany({
                    where: { questionId: questionId },
                })
            ])
            // Delete the question and return the deleted question details
            return await db.question.delete({
                where: { id: questionId },
            });
        }),

    // MESSAGES
    deleteMessage: privateProcedure
        .input(z.object({ messageId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const { kindeId } = ctx;
            const { messageId } = input;
            const message = await db.message.findFirst({
                where: {
                    id: messageId,
                    kindeId: kindeId,
                },
            });

            if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found or you do not have permission to delete this message.' });

            await db.message.delete({
                where: { id: messageId }
            });

            // Update QueryCost entries associated with this message
            // THIS MAY BE ABLE TO BE REMOVED?!?
            await db.queryCost.updateMany({
                where: { messageId: messageId },
                data: { messageId: 'removed' }
            });
        }),

    toggleMessagePin: privateProcedure
        .input(z.object({ messageId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const { kindeId } = ctx;
            const { messageId } = input;
            const message = await db.message.findFirst({
                where: {
                    id: messageId,
                    kindeId: kindeId,
                },
            });

            if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found or you do not have permission to delete this message.' });

            await db.message.update({
                where: { id: messageId },
                data: { isPinned: !message.isPinned }
            });
        }),

    // STRIPE
    createStripeSession: privateProcedure.mutation(
        async ({ ctx }) => {

            const { kindeId } = ctx

            // Define the billing URL for redirecting users. 
            const billingUrl = absoluteUrl('/dashboard/billing')  // absoluteUrl() b/c we are server side, and not able to use relative urls

            // Ensure the user is authenticated
            if (!kindeId) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }

            const mongoUser = await db.user.findFirst({
                where: {
                    id: kindeId,
                },
            })

            if (!mongoUser) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }

            const subscriptionPlan = await getUserSubscriptionPlan()


            // Check if the user is subscribed and has a Stripe customer ID
            if (subscriptionPlan.isSubscribed && mongoUser.stripeCustomerId) {

                // Create a Stripe session for managing subscriptions
                const stripeSession =
                    await stripe.billingPortal.sessions.create({
                        customer: mongoUser.stripeCustomerId,
                        return_url: billingUrl,
                    })

                // Return the URL for the hosted billing portal
                return { url: stripeSession.url }
            }

            // Create a Stripe checkout session 
            const stripeSession =
                await stripe.checkout.sessions.create({
                    success_url: billingUrl,
                    cancel_url: billingUrl,
                    payment_method_types: ['card'],
                    mode: 'subscription',
                    billing_address_collection: 'auto',
                    line_items: [                                // List of items the user is about to pay for
                        {
                            price: PLANS.find(                   // The price that stripe expects comes from our plans that we have separately defined in our stripe config
                                (plan) => plan.name === 'Plus'
                            )?.price.priceIds.test,              // Change to 'production' when you are ready to go
                            quantity: 1,
                        },
                    ],
                    // This is sent over to our webhook, where the endgame is to update the Mongo document
                    metadata: {
                        kindeId: kindeId,
                    },
                })

            // We always redirect to the appropriate stripe session whether the user is or is not a stripe customer yet
            return { url: stripeSession.url }
        }
    ),

    // CONTEXT USAGE
    getContextUsage: privateProcedure
        .input(z.object({
            type: z.enum(['project', 'question']), key: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const { kindeId } = ctx;
            const { type, key } = input;

            // Make sure the user exists
            const user = await db.user.findUnique({
                where: {
                    id: kindeId,
                },
            })
            if (!user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found or you do not have permission to count TikTokens.' });

            // Retrieve the current user's subscription plan
            const subscription = await getUserSubscriptionPlan();

            // Depending on the subscription sub get proper plan details and usage caps
            let subscriptionDetails = subscription.isSubscribed ? PLANS[1] : PLANS[0]

            // Filter for the incoming type and key
            const fileFieldMapping = {
                project: 'projectIds',
                question: 'questionIds'
            };
            const fileField = fileFieldMapping[type]

            // Count files linked to the specified project or question
            const fileCount = await db.file.count({
                where: {
                    kindeId: kindeId,
                    [fileField]: {
                        has: key
                    }
                }
            })

            // Fetch the key's # of previous messages, but consider the the plan's usage cap
            const prevMessages = await db.message.findMany({
                where: { [`${type}Id`]: key },
                orderBy: { createdAt: 'asc' },
                take: subscription.prevMessagesCap
            });

            // Formatting is needed b/c it happens during prompt submission and adds tokens, so we do it here too
            const formattedPrevMessages = prevMessages.map(msg => ({
                role: msg.isUserMessage ? 'user' : 'assistant',
                content: msg.text,
            }))

            // Calculate tokens used for previous messages
            const prevMessageTokens = countMessageTokens(formattedPrevMessages, subscriptionDetails.gptModel.extraTokenCosts);

            const approxVectorStoreTokens = fileCount * 500     // Assuming 500 tokens per page/file
            const approxCompletionTokens = 4000;                // Another assumption that will change over time

            // Total tokens used
            const totalTokensUsed = prevMessageTokens + approxVectorStoreTokens + approxCompletionTokens

            // Compute the usage percentage relative to the context window
            const contextWindowCap = subscriptionDetails.gptModel.contextWindow
            const usagePercentage = Math.round((totalTokensUsed / contextWindowCap) * 100);

            const prevMessageUsage = Math.round((prevMessageTokens / contextWindowCap) * 100)
            const vectorStoreUsage = Math.round((approxVectorStoreTokens / contextWindowCap) * 100)
            const completionUsage = Math.round((approxCompletionTokens / contextWindowCap) * 100)

            return {
                usagePercentage,
                prevMessageUsage: prevMessageUsage,
                vectorStoreUsage: vectorStoreUsage,
                completionUsage: completionUsage,
            }
        })
})

export type AppRouter = typeof appRouter