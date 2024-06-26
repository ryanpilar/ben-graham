'use client'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ListFilter, Table, File, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import AdvancedRealTimeWidgetTV from './trading-view/AdvancedRealTimeWidgetTV';
import Notes from './Notes';
import PinnedMessages from './chat/PinnedMessages';
import Questions from './Questions';
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

const CompanyDetails2 = ({ symbol, exchange, subscriptionPlan, researchKey, type }: CompanyDetailsProps) => {

    const [tab, setActiveTab] = useState("questions");
    const [visible, setVisible] = useState(true)


    return (
        <div className=''>
            <Tabs
                defaultValue="questions"
                value={tab}
                onValueChange={setActiveTab}
            >
                <div className="flex justify-end items-center">
                    <div className='flex w-full items-center'>

                        {!visible && (
                            <>
                                <Button size="icon" variant="outline" className='mr-2 rounded w-8 h-8 hover:text-primary' onClick={() => setVisible(!visible)}>
                                    <EyeOff className="h-4 w-4" />
                                    <span className="sr-only">Toggle Questions & Notes Visibility</span>
                                </Button>
                                <h3 className='font-semibold'>Questions & Notes</h3>
                            </>
                        )}

                    </div>
                </div>

                <div className="flex items-center pt-3">
                    
                    {visible && (
                        <Button size="icon" variant="none" className='rounded w-8 h-8 hover:text-primary' onClick={() => setVisible(!visible)}>
                            <Eye className="h-4 w-4 " />
                            <span className="sr-only">Toggle Questions & Notes Visibility</span>
                        </Button>
                    )}

                    <TabsList className={`bg-transparent ${visible ? '' : 'hidden'}`}>
                        <TabsTrigger className='rounded hover:text-primary' value="questions">Questions</TabsTrigger>
                        <TabsTrigger className='rounded hover:text-primary' value="pinned">Pinned</TabsTrigger>
                        <TabsTrigger className='rounded hover:text-primary' value="notes">Notes</TabsTrigger>
                    </TabsList>
                </div>

                {visible && (
                    <>
                        <TabsContent
                            forceMount={true}
                            hidden={"questions" !== tab}
                            value="questions"
                        >
                            <Card className='h-[492px]' x-chunk="dashboard-05-chunk-3">

                                <CardHeader className="px-7">
                                    <CardTitle>Project Questions</CardTitle>
                                    <CardDescription>
                                        The questions yo.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Questions type='project' researchKey={researchKey} subscriptionPlan={subscriptionPlan} />
                                </CardContent>

                            </Card>
                        </TabsContent>
                        <TabsContent
                            forceMount={true}
                            hidden={"pinned" !== tab} value="pinned"
                        >
                            <Card className='h-[492px] pt-2' x-chunk="dashboard-06-chunk-3">
                                <CardHeader className="px-7">
                                    <CardTitle>Pinned</CardTitle>
                                    <CardDescription>
                                        The Pinned yo.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PinnedMessages type={'project'} researchKey={researchKey} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent
                            forceMount={true}
                            hidden={"notes" !== tab}
                            value="notes"
                        >
                            <Card className='flex flex-col min-h-[492px] pt-2' x-chunk="dashboard-07-chunk-3">

                                {/* <CardHeader className="px-7">
                                    <CardTitle>Notes</CardTitle>
                                    <CardDescription>
                                        The Notes yo.
                                    </CardDescription>
                                </CardHeader> */}
                                <CardContent>
                                    <Notes type='project' researchKey={researchKey} />
                                </CardContent>

                            </Card>
                        </TabsContent>
                    </>)}

            </Tabs>
        </div>
    );
};

export default CompanyDetails2;
