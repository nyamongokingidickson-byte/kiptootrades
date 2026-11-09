import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const AutoStakeCalculator = observer(() => {
    return (
        <div className="auto-stake-calculator glass-card">
            <h3 className="panel-title">💰 Auto Stake</h3>

            <div className="stake-display">
                <div className="stake-info">
                    <span className="info-label">Account Balance</span>
                    <span className="info-value">${quantum24hAutoTraderStore.account_balance}</span>
                </div>
                <div className="stake-info">
                    <span className="info-label">Risk %</span>
                    <span className="info-value">{quantum24hAutoTraderStore.session_config.risk_percentage}%</span>
                </div>
            </div>

            <div className="recommended-stake">
                <span className="stake-label">Recommended Stake</span>
                <span className="stake-amount">${quantum24hAutoTraderStore.recommended_stake}</span>
            </div>

            <div className="current-stake-input">
                <label>Manual Stake Override</label>
                <input
                    type="number"
                    value={quantum24hAutoTraderStore.current_stake}
                    onChange={(e) => {
                        quantum24hAutoTraderStore.current_stake = parseFloat(e.target.value);
                    }}
                    className="stake-input"
                    step="1"
                    min="1"
                />
            </div>

            <div className="max-exposure-warning">
                <span className="warning-label">Max Daily Exposure</span>
                <span className="warning-value">${quantum24hAutoTraderStore.max_exposure}</span>
            </div>
        </div>
    );
});

AutoStakeCalculator.displayName = 'AutoStakeCalculator';
export default AutoStakeCalculator;
