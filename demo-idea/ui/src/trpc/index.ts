import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { privateProcedure, publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { z } from 'zod'

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        // 1st find the user ID with kinde
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        // const {getUser} = getKindeServerSession()
        // const user:any = getUser()

        if (!user.id || !user.email) {
            throw new TRPCError({ code: 'UNAUTHORIZED' }) // TRPCError is a utility that handles predefined errors for us
        }
        console.log('About to hit db')

        // Check if the user is in the db
        const dbUser = await db.user.findFirst({
            where: {
                id: user.id
            }
        })

        console.log('dbUser', dbUser)

        if (!dbUser) {
            // create user in db
            console.log('making document!')

            await db.user.create({
                data: {
                    id: user.id, // Note: this is the kinde id
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
        .input(z.object({ id: z.string() }))        // 1st, validate with zod
        .mutation(async ({ ctx, input }) => {       // 2nd, carry out api logic
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

})

export type AppRouter = typeof appRouter