'use client'

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useContext } from 'react'
import { OriginContext } from './OriginProvider';
import { cn } from '@/lib/utils';

import { Button as NUIButton } from '@nextui-org/button';

/** ================================|| Go Back ||=================================== 

    -   Give up on this and switch instead to Next Parallel Routing / Slots
    -   https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
    -   https://levelup.gitconnected.com/adapting-the-shadcn-ui-dialog-for-parallel-and-intercepting-routes-next-js-shorts-818d02f602d3

    -   Also check this out: https://www.pranavkhandelwal.com/blog/2024/3/31/toggling-modals-in-nextjs-with-react-server-components
    -   https://github.com/pnavk/nextjs-rsc-modal-dialog-example
    
    -   Make sure to clean up Providers and OriginProvider when the switchover happens

**/

interface GoBackProps {
    className?: string
}

const GoBack = ({ className }: GoBackProps) => {
    const router = useRouter();
    const isWithinPage = useContext(OriginContext);

    const handleClick = useCallback(() => {
        if (isWithinPage) router.back();
        else router.push('/');
    }, [isWithinPage, router]);

    return (
        <>
            <button
                className={cn('flex items-center text-foreground-400', className)}
                aria-label="Go back to previous view" onClick={handleClick}
            >
                <ChevronLeft className='h-5 w-5 mr-1' />
                Back
            </button>
        </>
    );
};

export default GoBack;
