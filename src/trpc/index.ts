import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import {
    privateProcedure,
    publicProcedure,
    router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { PLANS } from '@/config/stripe'
import { absoluteUrl } from '@/lib/utils'
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe'

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        // 1st find the user ID with kinde
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user.id || !user.email) {
            throw new TRPCError({ code: 'UNAUTHORIZED' })   // TRPCError is a utility that handles predefined errors for us
        }
        console.log('About to hit db')

        // Check if the user is in the db
        const mongoUser = await db.user.findFirst({
            where: {
                id: user.id
            }
        })

        console.log('mongoUser', mongoUser)

        if (!mongoUser) {
            // create user in db
            console.log('making document!')

            await db.user.create({
                data: {
                    id: user.id,                            // Note: this is the kinde id
                    email: user.email
                }
            })

            console.log('document created!')

        }
        return { success: true }

    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
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

            const file = await db.file.findFirst({
                where: {
                    id: input.id,                          // Automatically has the type we declare with zod above
                    kindeId,                               // We are only searching for files that are currently logged in with kindeId
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            await db.file.delete({
                where: {
                    id: input.id,
                },
            })

            return file
        }),
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
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),                           // this determines in the infinite query what the next amount to be shown is
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
                take: limit + 1,                            // +1 helps us determine if we need to scroll up, from where we want to fetch the next messages
                // we take from the db, +1, because we use that +1 as the cursor. So when we scroll up, with the cursor in place, we now know we next messages we need to fetch
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
            // Determine the cursor, and pop it
            let nextCursor: typeof cursor | undefined = undefined
            if (messages.length > limit) {                  // If we also have additional messages in the database, lets grab more messages! But, 
                // grab that +1 that we intentionally brought in 
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }
            return {
                messages,
                nextCursor,                                 // nextCursor tells us where to start fetching if we start scrolling through the messages
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
            if (!file) return { status: 'PENDING' as const } // Return as a constant, telling typescript that PENDING is fine and a valid state to be in

            return { status: file.uploadStatus }
        }),
    createStripeSession: privateProcedure.mutation(
        async ({ ctx }) => {
            const { kindeId } = ctx

            const billingUrl = absoluteUrl('/dashboard/billing')  // B/c we are server side right now, we are not able to use relative urls, and this is a helper function for that

            if (!kindeId)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            const mongoUser = await db.user.findFirst({
                where: {
                    id: kindeId,
                },
            })


            if (!mongoUser)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            // If the user clicked the btn and they are already a user, it should take them to a manage your subscription page
            // To retrieve the current subscription status
            const subscriptionPlan = await getUserSubscriptionPlan()

            // Is the user on a Plus plan or not?
            // If this fails, that means the user is not subscribed
            if (subscriptionPlan.isSubscribed && mongoUser.stripeCustomerId) {
                const stripeSession =                            // Insert Stripe config obj:
                    await stripe.billingPortal.sessions.create({
                        customer: mongoUser.stripeCustomerId,
                        return_url: billingUrl,
                    })

                return { url: stripeSession.url }                // Hosted page the stripe provides to us
            }

            const stripeSession =                                // Insert Stripe config obj:
                await stripe.checkout.sessions.create({
                    success_url: billingUrl,
                    cancel_url: billingUrl,
                    payment_method_types: ['card'],
                    mode: 'subscription',
                    billing_address_collection: 'auto',
                    line_items: [                                // What the user is about to pay for
                        {
                            price: PLANS.find(                   // THe price that stripe expects comes from our plans that we have defined in our stripe config
                                (plan) => plan.name === 'Plus'
                            )?.price.priceIds.test,              // Change to 'production when you are ready to go'
                            quantity: 1,
                        },
                    ],
                    metadata: {
                        kindeId: kindeId,                        // This is sent over to our webhook so we can make sure that we update this data for the correct user and enable their plan
                    },
                })

            return { url: stripeSession.url }                    // We always redirect to the appropriate stripe session whether the user is or is not a stripe customer yet
        }
    ),


})

export type AppRouter = typeof appRouter