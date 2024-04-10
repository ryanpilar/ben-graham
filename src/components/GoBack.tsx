'use client'

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useContext } from 'react'
import { OriginContext } from './OriginProvider';
import { cn } from '@/lib/utils';

/** ================================|| Go Back ||=================================== 

    -   Give up on this and switch instead to Next Parallel Routing / Slots
    -   https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
    -   https://levelup.gitconnected.com/adapting-the-shadcn-ui-dialog-for-parallel-and-intercepting-routes-next-js-shorts-818d02f602d3

    -   Also check this out: https://www.pranavkhandelwal.com/blog/2024/3/31/toggling-modals-in-nextjs-with-react-server-components
    -   https://github.com/pnavk/nextjs-rsc-modal-dialog-example
    
    -   Make sure to clean up Providers and OriginProvider when the switchover happens

**/

interface GoBackProps {
    className?: 'string'
}

const GoBack = ({className}: GoBackProps) => {
    const router = useRouter();
    const isWithinPage = useContext(OriginContext);
  
    const handleClick = useCallback(() => {
      if (isWithinPage) router.back();
      else router.push('/');
    }, [isWithinPage, router]);

    return (
        <>
            <button className={cn('flex items-center text-secondary-foreground', className)} onClick={handleClick} ><ChevronLeft className='h-4 w-4'/>Back</button>
        </>
    );
};

export default GoBack;
