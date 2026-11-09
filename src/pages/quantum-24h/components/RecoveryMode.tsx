import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const RecoveryMode = observer(() => {
    return (
        <div className="recovery-mode-alert glass-card alert-danger">
            <div className="alert-header">
                <h3 className="alert-title">🚨 Recovery Mode Activated</h3>
                <span className="close-btn" onClick={() => {
                    quantum24hAutoTraderStore.is_recovery_mode = false;
                }}>
                    ✕
                </span>
            </div>

            <p className="alert-message">
                {quantum24hAutoTraderStore.consecutive_losses} consecutive losses detected. 
                Switching to recovery strategy.
            </p>

            <div className="recovery-settings">
                <div className="setting-item">
                    <span className="setting-label">Recovery Market</span>
                    <span className="setting-value">{quantum24hAutoTraderStore.recovery_market}</span>
                </div>
                <div className="setting-item">
                    <span className="setting-label">Recovery Strategy</span>
                    <span className="setting-value">{quantum24hAutoTraderStore.recovery_strategy}</span>
                </div>
            </div>

            <div className="recovery-progress">
                <div className="recovery-bar">
                    <div
                        className="recovery-fill"
                        style={{
                            width: `${(quantum24hAutoTraderStore.consecutive_losses / quantum24hAutoTraderStore.max_consecutive_losses) * 100}%`
                        }}
                    />
                </div>
            </div>

            <button
                className="manual-recovery-btn"
                onClick={() => {
                    quantum24hAutoTraderStore.consecutive_losses = 0;
                    quantum24hAutoTraderStore.is_recovery_mode = false;
                }}
            >
                Disable Recovery (Manual)
            </button>
        </div>
    );
});

RecoveryMode.displayName = 'RecoveryMode';
export default RecoveryMode;
