'use client'
import Link from 'next/link';
import React, { useEffect } from 'react'
import { buttonVariants } from '../ui/button';
import { ExpandIcon } from 'lucide-react';
// Project Imports
// 3rd Party Imports
// Styles

/** ================================|| TV Affiliate Linking ||=================================== **/

const config = {
    affiliateId: '140234',
}

interface AffiliateDataCoverageProps {
    label: string
}

export const AffiliateFeatures = ({ label }: AffiliateDataCoverageProps) => {

    return (
        <Link
            href={`https://www.tradingview.com/features/?aff_id=${config.affiliateId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
                variant: 'link',
                size: 'sm',
            })}
        >
            {label}
        </Link>
    )
}

interface ExpandChartProps {
    exchange: string
    symbol: string
}

export const AffiliateExpandChart = ({ exchange, symbol }: ExpandChartProps) => {

    return (
        <Link
        href={`https://www.tradingview.com/chart/?symbol=${exchange}:${symbol}&aff_id=${config.affiliateId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={'flex pr-1 hover:text-primary'}
        >
            <span className='text-xs uppercase mr-1.5'>expand chart</span><ExpandIcon size='15' />
        </Link>
    )
}

interface AffiliateDataCoverageProps {
    label: string
}

export const AffiliateDataCoverage = ({ label }: AffiliateDataCoverageProps) => {

    return (
        <Link
            href={`https://www.tradingview.com/data-coverage/?aff_id=${config.affiliateId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
                variant: 'link',
                size: 'sm',
            })}
        >
            {label}
        </Link>
    )
}


