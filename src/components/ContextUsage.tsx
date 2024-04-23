'use client'
import React from 'react'
// Project Imports
// 3rd Party Imports
import { CircularProgress } from "@nextui-org/progress";
import ContextUsagePopover from './ContextUsagePopover';
// import { trpc } from '@/app/_trpc/client';
import { trpcServer } from '@/trpc/trpc-caller';
import { trpc } from '@/app/_trpc/client';


/** ================================|| Context Usage ||=================================== **/


export interface ContextUsageProps {
    type: 'project' | 'question'
    usageKey: string
}
type ColorScheme = 'danger' | 'warning' | 'primary' | 'secondary' | 'default'

const ContextUsage =  ({ type, usageKey }: ContextUsageProps) => {

    // const { usagePercentage } = await trpcServer.getContextUsage({ type, key })
    const {data} = trpc.getContextUsage.useQuery({ type: type, key: usageKey })

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
        <>
            {data && (<ContextUsagePopover usageData={data} >
                <CircularProgress
                    size="lg"
                    value={data.usagePercentage}
                    color={getColor(data.usagePercentage)}
                    formatOptions={{ style: "unit", unit: "percent" }}
                    showValueLabel={true}
                />
            </ContextUsagePopover>)}



        </>
    );
};

export default ContextUsage;


