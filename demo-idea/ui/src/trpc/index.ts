import {router} from './trpc'

const appRouter = router({

})

// Export type router type signiture,
// NOT the router itself.
export type AppRouter = typeof appRouter