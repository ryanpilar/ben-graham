import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'

/** ================================|| Middleware ||=================================== 

    Any path under the dashboard as well as the auth-callback. Only logged in users 
    can visit them.

    Every route the goes into the below matcher, is now secured

    note: matcher is enforced by nextjs

**/


export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
}

export default authMiddleware