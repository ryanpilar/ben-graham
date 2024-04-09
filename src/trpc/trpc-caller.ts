import 'server-only'

import {appRouter} from '@/trpc'


// Pass two things for the context to work, but not super important, its mock data
export const trpcServer = appRouter.createCaller({
   eventServer: { trigger: async () => {  }} ,
   sessions: { user: null },
})