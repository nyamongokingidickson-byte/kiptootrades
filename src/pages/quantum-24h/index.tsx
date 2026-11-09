import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from './stores/Quantum24hAutoTraderStore';
import SessionConfigPanel from './components/SessionConfigPanel';
import MarketPowerBoard from './components/MarketPowerBoard';
import SafeZonesPanel from './components/SafeZonesPanel';
import DangerZonesPanel from './components/DangerZonesPanel';
import SignalEngine from './components/SignalEngine';
import HourlyTargetTracker from './components/HourlyTargetTracker';
import SessionTargetTracker from './components/SessionTargetTracker';
import AutoStakeCalculator from './components/AutoStakeCalculator';
import MartingaleSettings from './components/MartingaleSettings';
import LossProtectionPanel from './components/LossProtectionPanel';
import RecoveryMode from './components/RecoveryMode';
import LiveTradingConsole from './components/LiveTradingConsole';
import ActiveTradesPanel from './components/ActiveTradesPanel';
import PerformanceDashboard from './components/PerformanceDashboard';
import TransactionHistory from './components/TransactionHistory';
import AIInsightsPanel from './components/AIInsightsPanel';
import FooterStatusBar from './components/FooterStatusBar';
import './styles/quantum-24h.scss';

const Quantum24hAutoTrader = observer(() => {
    const [active_subtab, set_active_subtab] = useState('overview');

    useEffect(() => {
        const update_interval = setInterval(() => {
            quantum24hAutoTraderStore.updateHourlyProgress();
        }, 1000);

        return () => clearInterval(update_interval);
    }, []);

    useEffect(() => {
        const generate_markets = () => {
            const markets = quantum24hAutoTraderStore.available_markets.map((market, idx) => ({
                market_name: market,
                power_score: Math.random() * 100,
                confidence: Math.random(),
                signal_strength: Math.random() * 100,
                safety_rating: Math.random() * 10,
                status: (
                    ['BEST_MARKET', 'GOOD', 'WEAK', 'DANGER'] as const
                )[Math.floor(Math.random() * 4)],
            }));
            quantum24hAutoTraderStore.updateMarketPowers(markets.sort((a, b) => b.power_score - a.power_score));
        };

        const market_interval = setInterval(generate_markets, 5000);
        return () => clearInterval(market_interval);
    }, []);

    return (
        <div className="quantum-24h-container">
            <div className="quantum-24h-header">
                <h1 className="quantum-24h-title">🚀 Quantum 24H Auto Trader</h1>
                <p className="quantum-24h-subtitle">Institutional-Grade Automated Trading System</p>
            </div>

            <div className="quantum-24h-subtabs">
                <button
                    className={`subtab-button ${active_subtab === 'overview' ? 'active' : ''}`}
                    onClick={() => set_active_subtab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`subtab-button ${active_subtab === 'markets' ? 'active' : ''}`}
                    onClick={() => set_active_subtab('markets')}
                >
                    🎯 Market Power
                </button>
                <button
                    className={`subtab-button ${active_subtab === 'signals' ? 'active' : ''}`}
                    onClick={() => set_active_subtab('signals')}
                >
                    ⚡ Signals
                </button>
                <button
                    className={`subtab-button ${active_subtab === 'trading' ? 'active' : ''}`}
                    onClick={() => set_active_subtab('trading')}
                >
                    💹 Trading
                </button>
                <button
                    className={`subtab-button ${active_subtab === 'analytics' ? 'active' : ''}`}
                    onClick={() => set_active_subtab('analytics')}
                >
                    📈 Analytics
                </button>
            </div>

            {active_subtab === 'overview' && (
                <div className="quantum-24h-overview">
                    <div className="overview-top-row">
                        <SessionConfigPanel />
                        <HourlyTargetTracker />
                        <SessionTargetTracker />
                    </div>

                    <div className="overview-middle-row">
                        <AutoStakeCalculator />
                        <MartingaleSettings />
                        <LossProtectionPanel />
                    </div>

                    <div className="overview-bottom-row">
                        <MarketPowerBoard show_limited={true} />
                        <AIInsightsPanel />
                    </div>
                </div>
            )}

            {active_subtab === 'markets' && (
                <div className="quantum-24h-markets">
                    <MarketPowerBoard show_limited={false} />
                    <div className="markets-analysis-row">
                        <SafeZonesPanel />
                        <DangerZonesPanel />
                    </div>
                </div>
            )}

            {active_subtab === 'signals' && (
                <div className="quantum-24h-signals">
                    <SignalEngine />
                </div>
            )}

            {active_subtab === 'trading' && (
                <div className="quantum-24h-trading">
                    {quantum24hAutoTraderStore.is_recovery_mode && <RecoveryMode />}
                    <LiveTradingConsole />
                    <ActiveTradesPanel />
                </div>
            )}

            {active_subtab === 'analytics' && (
                <div className="quantum-24h-analytics">
                    <PerformanceDashboard />
                    <TransactionHistory />
                </div>
            )}

            <FooterStatusBar />
        </div>
    );
});

Quantum24hAutoTrader.displayName = 'Quantum24hAutoTrader';

export default Quantum24hAutoTrader;
