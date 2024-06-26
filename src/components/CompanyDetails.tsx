'use client'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Eye, EyeOff, ListFilter, Table, File } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import AdvancedRealTimeWidgetTV from './trading-view/AdvancedRealTimeWidgetTV';
import CompanyProfileWidgetTV from './trading-view/CompanyProfileWidgetTV';
import { AffiliateExpandChart } from './trading-view/AffiliateLinkingTV';
// Project Imports
// 3rd Party Imports
// Styles

/** ================================|| Company Details ||=================================== **/

interface CompanyDetailsProps {
    symbol: string
    exchange: string
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
    researchKey: string
    type: 'project' | 'question'
}

const CompanyDetails = ({ symbol, exchange, subscriptionPlan, researchKey, type }: CompanyDetailsProps) => {

    const [tab, setActiveTab] = useState("chart");
    const [visible, setVisible] = useState(true)

    return (
        <div className='pt-2 pb-3'>
            <Tabs
                defaultValue="chart"
                value={tab}
                onValueChange={setActiveTab}
            >
                <div className="flex justify-end items-center">
                    <div className='flex w-full items-center'>

                        {!visible && (
                            <>
                                <Button size="icon" variant="outline" className='mr-2 rounded w-8 h-8 hover:text-primary' onClick={() => setVisible(!visible)}>
                                    <EyeOff className="h-4 w-4" />
                                    <span className="sr-only">Toggle Market Data Visibility</span>
                                </Button>
                                <h3 className='font-semibold'>Company Data</h3>
                            </>
                        )}

                    </div>
                </div>

                <div className="flex justify-end items-center">

                    {visible && (
                        <Button size="icon" variant="none" className='rounded w-8 h-8 hover:text-primary' onClick={() => setVisible(!visible)}>
                            <Eye className="h-4 w-4 " />
                            <span className="sr-only">Toggle Market Data Visibility</span>
                        </Button>
                    )}

                    <TabsList className={`${visible ? '' : 'hidden'} bg-transparent`}>
                        <TabsTrigger className='rounded hover:text-primary' value="chart">Chart</TabsTrigger>
                        <TabsTrigger className='rounded hover:text-primary' value="details">Details</TabsTrigger>
                        <TabsTrigger className='rounded hover:text-primary' value="metrics">Metrics</TabsTrigger>
                    </TabsList>
                    <div className='flex w-full justify-end items-center sm:-mb-4'>
                        {
                            visible && tab === 'chart' && (
                                <AffiliateExpandChart exchange={exchange} symbol={symbol} />
                            )
                        }
                    </div>
                </div>

                {visible && (
                    <>
                        <TabsContent
                            forceMount={true}
                            hidden={"chart" !== tab}
                            value="chart"
                        >
                            <Card className='h-[492px] border-none' x-chunk="dashboard-05-chunk-3">

                                {/* <CardHeader className="px-7"
                            <CardTitle>The Chart!</CardTitle>
                            <CardDescription>
                                The chart yo.
                            </CardDescription>
                        </CardHeader> */}
                                <CardContent className='p-0 m-0 h-full '>

                                    <AdvancedRealTimeWidgetTV symbol={symbol} exchange={exchange} />

                                </CardContent>

                            </Card>
                        </TabsContent>
                        <TabsContent
                            forceMount={true}
                            hidden={"details" !== tab} value="details" className=''>
                            <Card className='max-h-[492px] pt-5 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded 
                                    scrollbar-track-blue-lighter scrollbar-w-2 
                                    scrolling-touch' x-chunk="dashboard-06-chunk-3">
                                {/* <CardHeader className="px-7">
                                    <CardTitle>The Details!</CardTitle>
                                    <CardDescription>
                                        The details yo.
                                    </CardDescription>
                                </CardHeader> */}
                                <CardContent>
                                    <CompanyProfileWidgetTV symbol={symbol} exchange={exchange} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent
                            forceMount={true}
                            hidden={"metrics" !== tab}
                            value="metrics"
                        >
                            <Card className='h-[492px] pt-5' x-chunk="dashboard-07-chunk-3">

                                <CardHeader className="px-7">
                                    <CardTitle>The Metrics!</CardTitle>
                                    <CardDescription>
                                        The Mettrics yo.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>

                                    ha
                                </CardContent>

                            </Card>
                        </TabsContent>
                    </>
                )}

            </Tabs>



        </div>
    );
};

export default CompanyDetails;
