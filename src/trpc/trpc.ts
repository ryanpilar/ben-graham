import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server'

// Initialization should only be done once per backend!
const t = initTRPC.create();
const middleware = t.middleware

// Custom authentication middleware
const isAuth = middleware(async (options) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Verify user
    if (!user || !user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    // Allows us to pass any value from the middleware directly into our api route that uses this private procedure
    // We can get access to it in any api route that now uses this middleware
    return options.next({
        ctx: {
            kindeId: user.id,
            user
        }
    })
})

// Router & procedure helpers that can be used throughout the router
export const router = t.router
// This allows us to create an api endpoint that anyone regardless of their authentication can call, its public
export const publicProcedure = t.procedure

// Ensures privateProcedure routes are accessible only after successful authentication, passing user context.
export const privateProcedure = t.procedure.use(isAuth)