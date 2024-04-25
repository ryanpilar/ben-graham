'use client'
import React from 'react'
// Project Imports
// 3rd Party Imports
import { CircularProgress } from "@nextui-org/progress";

import { trpc } from '@/app/_trpc/client';
import Skeleton from 'react-loading-skeleton';
import ContextUsagePopover from './ContextUsagePopover';


/** ================================|| Context Usage ||=================================== **/


export interface ContextUsageProps {
    type: 'project' | 'question'
    usageKey: string
}
type ColorScheme = 'danger' | 'warning' | 'primary' | 'secondary' | 'default'

const ContextUsage = ({ type, usageKey }: ContextUsageProps) => {

    // const { usagePercentage } = await trpcServer.getContextUsage({ type, key })
    const { data, isLoading } = trpc.getContextUsage.useQuery({ type: type, key: usageKey })

    const getColor = (value: number): ColorScheme => {
        switch (true) {
            case (value > 85):
                return 'danger';
            case (value > 55):
                return 'warning';
            case (value > 35):
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <div className='flex justify-center items-center'>
            {
                (data && !isLoading) ? 
                    <ContextUsagePopover usageData={data} >
                        <CircularProgress
                            size="lg"
                            value={data.usagePercentage}
                            color={getColor(data.usagePercentage)}
                            formatOptions={{ style: "unit", unit: "percent"}}
                            showValueLabel={true}
                            aria-label={`Loading ${type} context usage`}
                        />
                    </ContextUsagePopover>
                    :
                    <Skeleton height={40} width={40} circle className='py-2 px-1' count={1} />
            }

            {/* {data && (<ContextUsagePopover usageData={data} >
                <CircularProgress
                    size="lg"
                    value={data.usagePercentage}
                    color={getColor(data.usagePercentage)}
                    formatOptions={{ style: "unit", unit: "percent" }}
                    showValueLabel={true}
                />
            </ContextUsagePopover>)} */}
        </ div>
    );
};

export default ContextUsage;


