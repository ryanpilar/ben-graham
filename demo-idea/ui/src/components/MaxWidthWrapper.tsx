import React, { ReactNode } from 'react'
// Project Imports
import { cn } from '@/lib/utils';

/** ================================|| Max Width Wrapper ||=================================== **/

const MaxWidthWrapper = ({ className, children }: { className?: string, children: ReactNode }) => {
    return (
        <div className={cn('mx-auto w-full mx-w-screen-xl px-2.5', className)}>
            {children}
        </div>
    );
};

export default MaxWidthWrapper;
