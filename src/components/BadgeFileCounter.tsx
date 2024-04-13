'use client'

import React, { ReactNode, forwardRef } from 'react'
// Project Imports
import { trpc } from '@/app/_trpc/client';
import { Badge, BadgeProps } from "@nextui-org/badge";
// 3rd Party Imports
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

/** ================================|| Badge File Counter ||=================================== **/

interface BadgeFileCounterProps extends BadgeProps {
    type: 'all' | 'project' | 'question'
    className?: string    
}

const BadgeFileCounter = forwardRef<HTMLDivElement, BadgeFileCounterProps>(({ type, children, className, ...badgeProps }, ref) => {

    const params = useParams()

    const getKey = () => {

        if (type === 'project' && params.projectid) {
            return Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
        } else if (type === 'question' && params.questionid) {
            return Array.isArray(params.questionid) ? params.questionid[0] : params.questionid;
        }
        return '#'
    };
    
    const key = getKey()
    const { data: fileCount, isLoading: isLoadingFileCount } = trpc.getFileCount.useQuery({ type: type, key: getKey() })

    return (
        <Badge ref={ref} content={fileCount} size='lg' placement='top-right' shape="rectangle" color="danger" className={cn('bg-red-100 text-red-700 -z-0', className)}>
            {children}
        </Badge>
    )
});

export default BadgeFileCounter;

