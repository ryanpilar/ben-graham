import React, { ReactNode } from 'react'
// Project Imports
import { cn } from '@/lib/utils';

/** ================================|| Max Width Wrapper ||=================================== **/

const MaxWidthWrapper = ({ className, children }: { className?: string, children: ReactNode }) => {
    return (
        <section className={cn('mx-auto w-full mx-w-screen-xl px-2.5 md:px-20', className)}>
            {children}
        </section>
    );
};

export default MaxWidthWrapper;
