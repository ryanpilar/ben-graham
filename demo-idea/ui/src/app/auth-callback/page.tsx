import React from 'react'
// Project Imports
// 3rd Party Imports
import { useRouter, useSearchParams } from 'next/navigation'
// Styles

/** ================================|| AuthCallback ||=================================== 
        - sync the logged in user and make sure they are also in the database 
        - the api response is not type safe trpc helps us with api type safety
        - worse thing about trpc is the setup  **/

const AuthCallback = async () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')  // Format reminder: '/auth-callback?origin=dashboard'
    
    const apiResponse = await fetch('api/whatever')
    const data = await apiResponse.json()
    
    return (
        <div className=''>
        </div>
    );
};

export default AuthCallback;
