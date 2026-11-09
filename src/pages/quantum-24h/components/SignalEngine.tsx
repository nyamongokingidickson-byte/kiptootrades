import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const SignalEngine = observer(() => {
    const [signals, set_signals] = useState<any[]>([]);

    useEffect(() => {
        const generate_signals = () => {
            const strategies = ['Over 1', 'Over 2', 'Over 3', 'Under 6', 'Under 7', 'Under 8', 'Even', 'Odd'];
            const new_signals = quantum24hAutoTraderStore.market_powers.slice(0, 3).map((market, idx) => ({
                market: market.market_name,
                strategy: strategies[idx % strategies.length],
                signal_strength: Math.random() * 100,
                confidence: Math.random() * 100,
                entry_trigger: Math.random() > 0.5 ? 'Digit Pattern' : 'Trend Signal',
                recommended_action: Math.random() > 0.5 ? 'BUY' : 'WAIT',
                expected_return: (Math.random() * 5 + 2).toFixed(1),
            }));
            set_signals(new_signals);
        };

        generate_signals();
        const interval = setInterval(generate_signals, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="signal-engine glass-card">
            <h3 className="panel-title">⚡ Active Signals</h3>

            <div className="signals-container">
                {signals.map((signal, idx) => (
                    <div key={idx} className="signal-card" style={{borderLeft: `4px solid ${signal.recommended_action === 'BUY' ? '#00ff00' : '#666'}`}}>
                        <div className="signal-header">
                            <span className="signal-market">{signal.market}</span>
                            <span className="signal-strategy">{signal.strategy}</span>
                        </div>

                        <div className="signal-metrics">
                            <div className="metric">
                                <span className="metric-label">Confidence</span>
                                <span className="metric-value">{signal.confidence.toFixed(1)}%</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Signal Strength</span>
                                <span className="metric-value">{signal.signal_strength.toFixed(1)}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Expected Return</span>
                                <span className="metric-value">{signal.expected_return}%</span>
                            </div>
                        </div>

                        <div className="signal-action">
                            <span className="action-type" style={{backgroundColor: signal.recommended_action === 'BUY' ? '#00ff00' : '#666'}}>
                                {signal.recommended_action}
                            </span>
                            <span className="trigger-type">{signal.entry_trigger}</span>
                        </div>

                        <button className="execute-signal-btn" onClick={() => {
                            quantum24hAutoTraderStore.placeQuickTrade(signal.market, signal.strategy, quantum24hAutoTraderStore.current_stake);
                        }}>
                            Execute Trade
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

SignalEngine.displayName = 'SignalEngine';
export default SignalEngine;
