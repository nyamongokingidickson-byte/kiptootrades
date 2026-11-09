import React from 'react';
import { Text } from '@deriv-com/ui';
import { IMarketAnalysis } from '../stores/TradingEngineStore';
import { MarketAnalyzer } from '../utils/MarketAnalyzer';

interface IOverUnderAnalysisProps {
    analysis: IMarketAnalysis;
}

const OverUnderAnalysis: React.FC<IOverUnderAnalysisProps> = ({ analysis }) => {
    const { signal, confidence, warning } = MarketAnalyzer.generateSignal(analysis);
    const { entry_digit, probability } = MarketAnalyzer.findHighProbabilityEntry(analysis);
    const { skip_ticks, reason } = MarketAnalyzer.analyzeEntryPattern(
        analysis.last_15_ticks.map((tick, i) => ({ tick_time: i, tick })),
        entry_digit
    );

    const is_strong_signal = confidence >= 55;
    const is_very_strong_signal = confidence >= 60;

    return (
        <div className='over-under-analysis'>
            <Text size='sm' weight='bold'>
                Over/Under Analysis
            </Text>

            {/* Progress Bars */}
            <div className='progress-container'>
                <div className='progress-item'>
                    <Text size='xs'>Under (0-4)</Text>
                    <div className='progress-bar'>
                        <div
                            className={`progress-fill under ${analysis.under_percentage >= 55 ? 'glowing' : ''}`}
                            style={{ width: `${analysis.under_percentage}%` }}
                        />
                    </div>
                    <Text size='xs' weight='bold'>
                        {analysis.under_percentage.toFixed(1)}%
                    </Text>
                </div>

                <div className='progress-item'>
                    <Text size='xs'>Over (5-9)</Text>
                    <div className='progress-bar'>
                        <div
                            className={`progress-fill over ${analysis.over_percentage >= 55 ? 'glowing' : ''}`}
                            style={{ width: `${analysis.over_percentage}%` }}
                        />
                    </div>
                    <Text size='xs' weight='bold'>
                        {analysis.over_percentage.toFixed(1)}%
                    </Text>
                </div>
            </div>

            {/* Highest Digits */}
            <div className='highest-digits'>
                <div className='digit-card'>
                    <Text size='xs'>Highest Over</Text>
                    <Text size='lg' weight='bold' className='digit-value'>
                        {analysis.highest_digit_over}
                    </Text>
                </div>
                <div className='digit-card'>
                    <Text size='xs'>Highest Under</Text>
                    <Text size='lg' weight='bold' className='digit-value'>
                        {analysis.highest_digit_under}
                    </Text>
                </div>
            </div>

            {/* Signal Display */}
            {is_very_strong_signal && (
                <div className={`signal-box ${signal}`}>
                    <Text size='sm' weight='bold'>
                        🎯 SIGNAL: {signal?.toUpperCase()}
                    </Text>
                    <Text size='xs'>Confidence: {confidence.toFixed(1)}%</Text>
                    <Text size='xs' weight='bold'>
                        Entry Point: {entry_digit} (Probability: {probability.toFixed(1)}%)
                    </Text>
                </div>
            )}

            {/* Warnings */}
            {warning && (
                <div className='warning-box'>
                    <Text size='xs'>⚠️ {warning}</Text>
                </div>
            )}

            {/* Skip Ticks Info */}
            {skip_ticks > 0 && (
                <div className='skip-info-box'>
                    <Text size='xs' weight='bold'>
                        Skip {skip_ticks} Tick(s): {reason}
                    </Text>
                </div>
            )}
        </div>
    );
};

export default OverUnderAnalysis;
