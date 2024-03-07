import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { privateProcedure, publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'

export const appRouter = router({
    authCallback: publicProcedure.query( async () => {
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
    // Note: the destructuring of the context
    getUserFiles: privateProcedure.query( async ({ctx}) => {
        const {user, kindeUserId} = ctx

        return await db.file.findMany({
            where: {
                kindeId: kindeUserId
            }
        })
    })
})

export type AppRouter = typeof appRouter