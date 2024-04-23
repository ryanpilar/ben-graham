'use client'
import React, { ReactNode } from 'react'
// Project Imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

/** ================================|| Context Usage Popover ||=================================== **/

interface ContextUsagePopoverProps {
    children: ReactNode;
    usageData: {
        usagePercentage: number;
        prevMessageUsage: number;
        vectorStoreUsage: number;
        completionUsage: number;
    }
    // usagePercentage: number
}
const ContextUsagePopover = ({children, usageData }: ContextUsagePopoverProps) => {

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Context Usage</h4>
                        <p className="text-sm text-muted-foreground">
                            Monitor the size of your context.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Previous Messages</Label>
                            {usageData.prevMessageUsage} %
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxWidth">Files Added</Label>
                            {usageData.vectorStoreUsage} %
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="height">GPT Responses</Label>
                            {usageData.completionUsage} %
                        </div>


                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ContextUsagePopover;
