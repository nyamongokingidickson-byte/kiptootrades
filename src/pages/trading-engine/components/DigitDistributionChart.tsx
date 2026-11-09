import React from 'react';
import { Text } from '@deriv-com/ui';
import { IMarketAnalysis } from '../stores/TradingEngineStore';

interface IDigitDistributionChartProps {
    analysis: IMarketAnalysis;
}

const DigitDistributionChart: React.FC<IDigitDistributionChartProps> = ({ analysis }) => {
    const max_count = Math.max(...Object.values(analysis.digit_distribution));

    const colors = [
        '#E74C3C', // 0 - Red
        '#3498DB', // 1 - Blue
        '#2ECC71', // 2 - Green
        '#F39C12', // 3 - Orange
        '#9B59B6', // 4 - Purple
        '#1ABC9C', // 5 - Turquoise
        '#E67E22', // 6 - Dark Orange
        '#C0392B', // 7 - Dark Red
        '#27AE60', // 8 - Dark Green
        '#2980B9', // 9 - Dark Blue
    ];

    return (
        <div className='digit-distribution-chart'>
            <div className='digits-container'>
                {Array.from({ length: 10 }).map((_, i) => {
                    const count = analysis.digit_distribution[i] || 0;
                    const height = (count / max_count) * 100;

                    return (
                        <div key={i} className='digit-bar-wrapper'>
                            <div
                                className='digit-bar'
                                style={{
                                    height: `${height}%`,
                                    backgroundColor: colors[i],
                                    minHeight: '30px',
                                }}
                                title={`Digit ${i}: ${count}`}
                            />
                            <Text size='xs' weight='bold'>
                                {i}
                            </Text>
                        </div>
                    );
                })}
            </div>

            {/* Last 7 Digits Cards */}
            <div className='last-digits-cards'>
                <Text size='xs' weight='bold'>
                    Last 7 Digits:
                </Text>
                <div className='digit-cards'>
                    {analysis.last_15_ticks.slice(-7).map((digit, index) => (
                        <div
                            key={index}
                            className='digit-card-item'
                            style={{
                                backgroundColor: colors[digit],
                            }}
                        >
                            <Text size='sm' weight='bold' color='white'>
                                {digit}
                            </Text>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DigitDistributionChart;
