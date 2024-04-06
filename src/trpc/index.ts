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

/** ================================|| TRPC Routes ||=================================== **/

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

    // PROTECTED ROUTES
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
    getUserFiles: privateProcedure
        .query(async ({ ctx }) => {
            const { user, kindeId } = ctx

            return await db.file.findMany({
                where: {
                    kindeId: kindeId
                }
            })
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
                async () => (
                    await db.message.deleteMany({
                        where: { fileId: fileId },
                    })
                )
            ]);

            // Leaving the Mongo File for last...       
            await db.file.delete({
                where: {
                    id: fileId,
                },
            })

            return file
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
                    kindeId: kindeId,
                },
            });

            if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found or you do not have permission to delete this project.' });

            // Delete all messages associated with the project
            await db.message.deleteMany({
                where: { projectId: projectId },
            });

            // Finally, delete the project itself and return the deleted project details
            return await db.project.delete({
                where: { id: projectId },
            });
        }),
    addQuestion: privateProcedure
        .input(z.object({
            text: z.string(),
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
                    text: input.text,
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

            // Delete the question and return the deleted question details
            return await db.question.delete({
                where: { id: questionId },
            });
        }),
    getProjectFiles: privateProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { kindeId } = ctx

            const allFiles = await db.file.findMany({
                where: {
                    kindeId: kindeId,
                },
            })

            if (!allFiles) throw new TRPCError({ code: 'NOT_FOUND' })

            const filesWithProjectId = allFiles.filter(file => 
                file.projectIds && file.projectIds.includes(input.projectId)
            );
    
            if (!filesWithProjectId.length) throw new TRPCError({ code: 'NOT_FOUND' });
            return filesWithProjectId;
            
        }),

    // PROTECTED ROUTES - STRIPE
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
})

export type AppRouter = typeof appRouter