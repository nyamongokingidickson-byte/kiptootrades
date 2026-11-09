import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Button, Input } from '@deriv-com/ui';
import tradingEngineStore from './stores/TradingEngineStore';
import MarketAnalysisPanel from './components/MarketAnalysisPanel';
import StrategySelector from './components/StrategySelector';
import TradingConsole from './components/TradingConsole';
import TransactionHistory from './components/TransactionHistory';
import HighProbabilityTradeTab from './components/HighProbabilityTradeTab';
import RecoveryPanel from './components/RecoveryPanel';
import './styles/trading-engine.scss';

const TradingEngine: React.FC = observer(() => {
    const [markets_list] = useState(['Volatility 10', 'Volatility 25', 'Volatility 50', 'Volatility 75', 'Volatility 100']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialize markets
        tradingEngineStore.setMarkets(markets_list);
        tradingEngineStore.selected_markets = markets_list.slice(0, 1);
    }, []);

    const handleMarketToggle = (checked: boolean) => {
        tradingEngineStore.auto_analyze_all_markets = checked;
        if (checked) {
            tradingEngineStore.selected_markets = markets_list;
        }
    };

    const handleStrategyChange = (strategy: string) => {
        tradingEngineStore.setStrategy(strategy);
    };

    const handleSubtabChange = (value: string) => {
        tradingEngineStore.setActiveSubtab(value as 'analysis' | 'trading_console' | 'hp_trades');
    };

    return (
        <div className='trading-engine-container'>
            {/* Header Section */}
            <div className='trading-engine-header'>
                <div className='header-top'>
                    <Text weight='bold' size='lg'>
                        Trading Engine
                    </Text>
                    <div className='header-controls'>
                        <div className='market-toggle'>
                            <Text size='sm'>Auto Analyze All Markets</Text>
                            <input
                                type='checkbox'
                                checked={tradingEngineStore.auto_analyze_all_markets}
                                onChange={(e) => handleMarketToggle(e.currentTarget.checked)}
                                className='toggle-checkbox'
                            />
                        </div>
                    </div>
                </div>

                {/* Strategy Selector */}
                <StrategySelector onStrategyChange={handleStrategyChange} />
            </div>

            {/* Main Content Tabs */}
            <div className='tabs-container'>
                <div className='tabs-header'>
                    <button
                        className={`tab-button ${tradingEngineStore.active_subtab === 'analysis' ? 'active' : ''}`}
                        onClick={() => handleSubtabChange('analysis')}
                    >
                        Market Analysis
                    </button>
                    <button
                        className={`tab-button ${tradingEngineStore.active_subtab === 'trading_console' ? 'active' : ''}`}
                        onClick={() => handleSubtabChange('trading_console')}
                    >
                        Trading Console
                    </button>
                    <button
                        className={`tab-button ${tradingEngineStore.active_subtab === 'hp_trades' ? 'active' : ''}`}
                        onClick={() => handleSubtabChange('hp_trades')}
                    >
                        High Probability Trades
                    </button>
                </div>

                <div className='tab-content'>
                    {tradingEngineStore.active_subtab === 'analysis' && (
                        <div>
                            <MarketAnalysisPanel />
                            <RecoveryPanel />
                        </div>
                    )}
                    {tradingEngineStore.active_subtab === 'trading_console' && <TradingConsole />}
                    {tradingEngineStore.active_subtab === 'hp_trades' && <HighProbabilityTradeTab />}
                </div>
            </div>

            {/* Transaction History */}
            <TransactionHistory />
        </div>
    );
});

TradingEngine.displayName = 'TradingEngine';

export default TradingEngine;
