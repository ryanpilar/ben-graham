'use client'
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useContext } from 'react'
import { OriginContext } from './OriginProvider';


/** ================================|| Go Back ||=================================== **/

const GoBack = () => {
    const router = useRouter();
    const isWithinPage = useContext(OriginContext);
  
    const handleClick = useCallback(() => {
      if (isWithinPage) router.back();
      else router.push('/');
    }, [isWithinPage, router]);

    return (
        <>
            <button className='flex w-full pb-3' onClick={handleClick} ><ChevronLeft />Go Back</button>

        </>
    );
};

export default GoBack;
