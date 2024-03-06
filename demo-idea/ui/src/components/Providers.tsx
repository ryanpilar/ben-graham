"use client"
import React from 'react'
// Project Imports
// 3rd Party Imports
import {
    QueryClient
} from '@tanstack/react-query'
// Styles

/** ================================|| Providers ||=================================== 
 *
        -   trcp is a thin wrapper around react-query 
        -   first we make a trpc instance, _trpc (in the app folder) tells next that 
            its not navigable  **/

const Providers = () => {
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <div className=''>
        </div>
    );
};

export default Providers;
