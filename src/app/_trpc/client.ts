import { AppRouter } from "@/trpc"
import { createTRPCReact } from "@trpc/react-query"


// You need to pass the type of the main router in trpc as a generic into this function
// And it is what gives us type safety across our application
// So the below function expects the 'type' of our router
// Without this type trpc will not know what type to send from the backend to the frontend
// That is why we need to pass this 'type' to createTRPCReact

// This is pretty identicle to delcaring and api route like you would in next13, just with the added benefit of type safety for your backend
export const trpc = createTRPCReact<AppRouter>({})

export const trpcServer = createTRPCReact<AppRouter>({});