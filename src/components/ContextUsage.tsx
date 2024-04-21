import React from 'react'
// Project Imports
// 3rd Party Imports
import { CircularProgress } from "@nextui-org/progress";
// Styles

/** ================================|| Context Usage ||=================================== **/


interface ContextUsageProps {
    percentage: number
}
type ColorScheme = 'danger' | 'warning' | 'primary' | 'secondary' | 'default'

const ContextUsage = ({percentage}: ContextUsageProps) => {


    const value = percentage;  

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
            <CircularProgress
                label="Context Usage"
                size="lg"
                value={value}
                color={getColor(value)}
                formatOptions={{ style: "unit", unit: "percent" }}
                showValueLabel={true}
            />
        </>
    );
};

export default ContextUsage;


