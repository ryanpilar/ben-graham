import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

/** ================================|| Middleware ||=================================== 

    This middleware ensures only authenticated users can access specified parts of 
    the application.

    Conditional application via the 'matcher' allows for targeted protection, 
    restricting access based on authentication status.

    Note: The 'matcher' configuration is a Next.js feature for specifying protected 
    routes.

**/

// Applies the withAuth middleware to incoming requests.
export default function middleware(req: any) {
    return withAuth(req);
}

export const config = {
    // Specifying which routes should be protected.
    matcher: ['/auth-callback', '/dashboard/:path*', '/files/:path*', '/research/project/:path*', '/research/question/:path*' ]
}