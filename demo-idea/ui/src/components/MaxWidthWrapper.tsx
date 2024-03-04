import React, { ReactNode } from 'react'
// Project Imports
import { cn } from '@/lib/utils';

// 3rd Party Imports
// Styles

/** ================================|| Max Width Wrapper ||=================================== **/

const MaxWidthWrapper = ({ className, children }: { className?: string, children: ReactNode }) => {
    return (
        <div className={cn('mx-auto w-full mx-w-screen-xl px-2.5 md:mx-20', className)}>
            {children}
        </div>
    );
};

export default MaxWidthWrapper;
