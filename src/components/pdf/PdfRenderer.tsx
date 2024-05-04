"use client"
import { ChevronDown, ChevronLeft, ChevronUp, Expand, Loader2, RotateCcw, RotateCw, Search } from 'lucide-react';
import React, { useState } from 'react'
// Project Imports
import PDFFullscreen from './PDFFullscreen';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
// 3rd Party Imports
import SimpleBar from 'simplebar-react'
import { useForm } from 'react-hook-form'
import { Document, Page, pdfjs } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'
import { zodResolver } from '@hookform/resolvers/zod'
// Styles
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

import { useRouter } from 'next/navigation'
import GoBack from '../GoBack';


/** ================================|| Pdf Renderer ||=================================== **/

interface PdfRendererProps {
    url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {


    const [numPages, setNumPages] = useState<number>()
    const [currPage, setCurrPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1)
    const [rotation, setRotation] = useState<number>(0)
    const [renderedScale, setRenderedScale] = useState<number | null>(null)

    const isLoading = renderedScale !== scale

    const CustomPageValidator = z.object({
        page: z
            .string()
            .refine(
                (num) => Number(num) > 0 && Number(num) <= numPages!
            ),
    })

    type TCustomPageValidator = z.infer<
        typeof CustomPageValidator
    >

    const {
        register,                                   // Takes care of onChnages under the hood, just spread in ...register
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TCustomPageValidator>({
        resolver: zodResolver(CustomPageValidator),
        //  To link this form and the logic of the validation, 
        //  we need a resolver to link them together. At runtime, 
        //  CustomPageValidator  enforces types but not validation logic. 
        //  needs an extra step to link it to the form, hence the resolver
    })

    const handlePageSubmit = ({
        page,
    }: TCustomPageValidator) => {
        setCurrPage(Number(page))
        setValue('page', String(page))
    }

    const { toast } = useToast()
    //  Note the location where the 'ref' is assigned. Since you synced 
    //  the below div with this ref hook, we get the width saved inside 
    //  the width constant
    const { width, ref } = useResizeDetector()

    return (
        <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
            <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
                <div className='flex items-center gap-1.5'>

                    <Button
                        disabled={currPage <= 1}
                        onClick={() => {
                            setCurrPage((prev) =>
                                prev - 1 > 1 ? prev - 1 : 1
                            )
                            setValue('page', String(currPage - 1))
                        }}
                        variant='ghost'
                        aria-label='previous page'>
                        <ChevronDown className='h-4 w-4' />
                    </Button>

                    <div className='flex items-center gap-1.5'>
                        <Input
                            {...register('page')}   // With ...register you don't have to worry about value, and onChange
                            className={cn(
                                'w-12 h-8',
                                errors.page && 'focus-visible:ring-red-500'
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit(handlePageSubmit)()
                                }
                            }}
                        />
                        <p className='text-zinc-700 text-sm space-x-1'>
                            <span>/</span>
                            <span>{numPages ?? 'x'}</span>      {/* 'x' for ux loading state */}
                        </p>
                    </div>

                    <Button
                        disabled={
                            numPages === undefined ||
                            currPage === numPages
                        }
                        onClick={() => {
                            setCurrPage((prev) =>

                                prev + 1 > numPages! ? numPages! : prev + 1     //  typescript is worried about this undefined possibility, 
                                //  so we always know numPages will never be undefined, so we use '!'
                            )
                            setValue('page', String(currPage + 1))
                        }}
                        variant='ghost'
                        aria-label='next page'>
                        <ChevronUp className='h-4 w-4' />
                    </Button>
                </div>

                <div className='space-x-2'>
                    <DropdownMenu>
                        {/* A Trigger is by default a button, so you need to put 
                                                                                '   asChild' if you are wrapper a child button */}
                        <DropdownMenuTrigger asChild>
                            <Button
                                className='gap-1.5'
                                aria-label='zoom'
                                variant='ghost'>
                                <Search className='h-4 w-4' />
                                {scale * 100}%
                                <ChevronDown className='h-3 w-3 opacity-50' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onSelect={() => setScale(.75)}
                            >
                                75%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(1)}
                            >
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(1.5)}
                            >
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(2)}
                            >
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(2.5)}
                            >
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)} // doesn't like values that are 360+
                        variant='ghost'
                        aria-label='rotate 90 degrees clockwise'>
                        <RotateCw className='h-4 w-4' />
                    </Button>

                    {(numPages && numPages > 30) ?

                        <Button
                            variant='ghost'
                            className='gap-1.5'
                            aria-label='fullscreen'
                            onClick={() => {
                                toast({
                                    title: 'Error Full-Screening PDF',
                                    description: 'At this time, Full-Screen mode is limited to 30 page documents.',
                                    variant: 'destructive',
                                })

                            }}
                        >
                            <Expand className='h-4 w-4' />
                        </Button>
                        :
                        <PDFFullscreen fileUrl={url} />
                    }



                </div>
            </div>

            <div className='flex-1 w-full max-h-screen'>

                <SimpleBar
                    autoHide={false}
                    className='max-h-[calc(100vh-10rem)]'>

                    <div ref={ref}>
                        <Document
                            loading={
                                <div className='flex justify-center'>
                                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                                </div>
                            }
                            onLoadError={() => {
                                toast({
                                    title: 'Error loading PDF',
                                    description: 'Please try again later',
                                    variant: 'destructive',
                                })
                            }}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            file={url}
                            className='max-h-full'
                        >
                            {/* Conditional rendering is used here to avoid a ux flicker when zooming the document */}
                            {isLoading && renderedScale ? (
                                <Page
                                    width={width ? width : 1}
                                    pageNumber={currPage}
                                    scale={scale}
                                    rotate={rotation}
                                    key={'@' + renderedScale}
                                />
                            ) : null}

                            <Page
                                className={cn(isLoading ? 'hidden' : '')}
                                width={width ? width : 1}
                                pageNumber={currPage}
                                scale={scale}
                                rotate={rotation}
                                key={'@' + scale}
                                loading={
                                    <div className='flex justify-center'>
                                        <Loader2 className='my-24 h-6 w-6 animate-spin' />
                                    </div>
                                }
                                onRenderSuccess={() =>
                                    setRenderedScale(scale)
                                }
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </div>
        </div>
    );
};

export default PdfRenderer;
