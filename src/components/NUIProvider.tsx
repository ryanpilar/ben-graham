'use client'

import React from 'react'
import { NextUIProvider } from '@nextui-org/system';
import { useRouter } from 'next/navigation';

/** ================================|| NUIProvider ||=================================== **/

export function NUIProvider({ children }: { children: React.ReactNode }) {

    const router = useRouter();



    return (
            <NextUIProvider navigate={router.push}>

        {/* <NextUIProvider> */}
            {children}
        </NextUIProvider>
    );
};

