import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

/** ================================|| Middleware ||=================================== 

    Middleware Configuration for Next.js

    Utilizes @kinde-oss/kinde-auth-nextjs/middleware's withAuth for securing routes. 
    This middleware ensures only authenticated users can access specified parts of 
    the application, particularly under '/dashboard' and '/auth-callback'.

    Conditional application via the 'matcher' allows for targeted protection, enhancing 
    security by restricting access based on authentication status.

    Note: The 'matcher' configuration is a Next.js feature for specifying protected routes.

**/

// Applies the withAuth middleware to incoming requests.
export default function middleware(req:any) {
    return withAuth(req);
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth-callback']   // Specifying which routes should be protected.
};








// import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'

// export const config = {
//   matcher: ['/dashboard/:path*', '/auth-callback'],
// }

// export default authMiddleware



// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(req: NextRequest) {
//   const { isAuthenticated } = getKindeServerSession();
//   const isAuth = isAuthenticated();
//   if (!isAuthenticated()) {
//     const pathname = req.nextUrl.pathname; // relative pathname

//     const isApiRoute = req.nextUrl.pathname.startsWith("/api");
//     const unprotectedRoutes = ["/api/auth/login", "/api/auth/register", "/"];

//     if (!isAuth && !unprotectedRoutes.includes(pathname) && !isApiRoute) {
//       return NextResponse.redirect(new URL(`/api/auth/login`, req.url));
//     }
//   }
// }
// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/auth-callback",
//     "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
//   ],
// };