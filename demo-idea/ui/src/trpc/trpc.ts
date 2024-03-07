import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server'

// Initialization should only be done once per backend!
const t = initTRPC.create();
const middleware = t.middleware

// Custom middleware: 
const isAuth = middleware( async (options)=> {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED'})
    }

    // takes a context which allows us to pass any value from the middleware directly into our api route 
    // that uses this private procedure
    // with the following context, we can get access to it in any api route that now uses this middleware
    return options.next({ 
        ctx: {
            kindeUserId: user.id,
            user
        }
    })

})

// Router & procedure helpers that can be used throughout the router
export const router = t.router
// This allows us to create an api endpoint that anyone regardless of their authentication can call, its public
export const publicProcedure = t.procedure

// Run isAuth logic privateProcedure is called, to make sure to run through the isAuth middleware before the api andpoint is called
// This allows us to destructure the context in our api routes
export const privateProcedure = t.procedure.use(isAuth)