"use client"
import React from 'react'
// Project Imports
// 3rd Party Imports
import {
    QueryClient
} from '@tanstack/react-query'
// Styles

/** ================================|| Providers ||=================================== **/

const Providers = () => {
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <div className=''>
        </div>
    );
};

export default Providers;
