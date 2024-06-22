'use client'

import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

/** ================================|| Advanced Real-Time Widget Trading View ||=================================== **/

interface AdvancedRealTimeWidgetTWProps {
    symbol: string
    exchange: string
}
const AdvancedRealTimeWidgetTW = ({ symbol, exchange }: AdvancedRealTimeWidgetTWProps) => {

    return (
        <div className="flex flex-col justify-start w-full h-full min-h-[600px]">
            <div className="w-full h-full" id="tradingview_widget">
                <AdvancedRealTimeChart                
                    height={525}
                    width='100%'
                    style="3"
                    interval="D"
                    theme="light"
                    timezone="exchange"
                    container_id="tradingview_widget"
                    symbol={`${exchange}:${symbol}`}
                    save_image={false}
                    hide_legend={true}
                    hide_top_toolbar={false}
                    hide_side_toolbar={false}
                    allow_symbol_change={true}
                    details={true}
                    hotlist={false}
                />
            </div>
        </div>
    );
};

export default AdvancedRealTimeWidgetTW;
