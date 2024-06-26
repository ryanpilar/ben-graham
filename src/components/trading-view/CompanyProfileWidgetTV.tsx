'use client'

import React from 'react';
import { CompanyProfile } from 'react-ts-tradingview-widgets';

/** ================================|| Advanced Real-Time Widget Trading View ||=================================== **/

interface CompanyProfileWidgetProps {
    symbol: string
    exchange: string
}
const CompanyProfileWidgetTV = ({ symbol, exchange }: CompanyProfileWidgetProps) => {

    return (
        <div className="flex flex-col justify-start w-full h-full min-h-[600px]">
            <div className="w-full h-full" id="tradingview_company_profile_widget">
                <CompanyProfile                
                    height={525}
                    width='100%'
                    colorTheme="light"
                    symbol={`${exchange}:${symbol}`}
                    isTransparent={true}  
                    largeChartUrl='true'
                    // autosize={true}               
                />
            </div>
        </div>
    );
};

export default CompanyProfileWidgetTV;
