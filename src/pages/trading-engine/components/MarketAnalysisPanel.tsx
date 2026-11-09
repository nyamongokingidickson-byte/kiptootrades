import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Button } from '@deriv-com/ui';
import tradingEngineStore, { IMarketAnalysis } from '../stores/TradingEngineStore';
import { MarketAnalyzer } from '../utils/MarketAnalyzer';
import DigitDistributionChart from './DigitDistributionChart';
import OverUnderAnalysis from './OverUnderAnalysis';

const MarketAnalysisPanel: React.FC = observer(() => {
    const [market_to_analyze, setMarketToAnalyze] = useState(tradingEngineStore.primary_market);
    const [analysis, setAnalysis] = useState<IMarketAnalysis | null>(null);

    // Update market when primary market changes
    useEffect(() => {
        setMarketToAnalyze(tradingEngineStore.primary_market);
    }, [tradingEngineStore.primary_market]);

    // Analyze market when it changes OR when strategy changes
    useEffect(() => {
        const simulateMarketAnalysis = () => {
            // In production, this would fetch real ticks from the API
            const mock_ticks = Array.from({ length: 100 }, (_, i) => ({
                tick_time: Date.now() - (100 - i) * 1000,
                tick: Math.floor(Math.random() * 100),
            }));

            const market_analysis = MarketAnalyzer.analyzeMarket(mock_ticks, market_to_analyze);
            tradingEngineStore.updateMarketAnalysis(market_to_analyze, market_analysis);
            setAnalysis(market_analysis);
        };

        simulateMarketAnalysis();
        const interval = setInterval(simulateMarketAnalysis, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [market_to_analyze, tradingEngineStore.current_strategy]);

    if (!analysis) {
        return <Text>Loading market analysis...</Text>;
    }

    return (
        <div className='market-analysis-panel'>
            <div className='market-analysis-header'>
                <Text size='md' weight='bold'>
                    {market_to_analyze} - Analysis
                </Text>
                <Text size='sm'>Total Ticks: {analysis.total_ticks}</Text>
            </div>

            {/* Digit Distribution */}
            <div className='analysis-section'>
                <Text size='sm' weight='bold'>
                    Digit Distribution
                </Text>
                <DigitDistributionChart analysis={analysis} />
            </div>

            {/* Over/Under Analysis */}
            <div className='analysis-section'>
                <OverUnderAnalysis analysis={analysis} />
            </div>

            {/* Additional Stats */}
            <div className='analysis-stats'>
                <div className='stat-item'>
                    <Text size='xs'>Last 15 Ticks Trend</Text>
                    <Text size='sm' weight='bold' className={`trend-${analysis.last_ticks_trend}`}>
                        {analysis.last_ticks_trend.toUpperCase()}
                    </Text>
                </div>
                <div className='stat-item'>
                    <Text size='xs'>Highest Digit (Over)</Text>
                    <Text size='sm' weight='bold'>
                        {analysis.highest_digit_over}
                    </Text>
                </div>
                <div className='stat-item'>
                    <Text size='xs'>Highest Digit (Under)</Text>
                    <Text size='sm' weight='bold'>
                        {analysis.highest_digit_under}
                    </Text>
                </div>
            </div>
        </div>
    );
});

MarketAnalysisPanel.displayName = 'MarketAnalysisPanel';

export default MarketAnalysisPanel;
