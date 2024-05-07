import { AppRouter } from "@/trpc"
import { createTRPCReact } from "@trpc/react-query"

/** ================================|| TRPC Client Configuration ||=================================== 
 
    NOTE: By passing the main router type as a generic to the function createTRPCReact, 
    we ensure type safety throughout the application. This setup mimics declaring an API 
    route in Next.js 13, but with the added advantage of backend to frontend type consistency.

    So the below function expects the 'type' of our router. Without this type trpc will not 
    know what type to send from the backend to the frontend. That is why we need to pass this 
    'type' to createTRPCReact.
 **/

export const trpc = createTRPCReact<AppRouter>({})