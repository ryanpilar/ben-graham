import { TRPCError, initTRPC } from '@trpc/server'

// Initialization should only be done once per backend!
const t = initTRPC.create();

// Router & procedure helpers that can be used throughout the router
export const router = t.router
export const publicProcedure = t.procedure