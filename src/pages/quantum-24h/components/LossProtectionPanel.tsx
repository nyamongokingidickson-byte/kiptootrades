import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const LossProtectionPanel = observer(() => {
    return (
        <div className="loss-protection-panel glass-card">
            <h3 className="panel-title">🛡️ Loss Protection</h3>

            <div className="loss-stats">
                <div className="stat-card">
                    <span className="stat-label">Consecutive Losses</span>
                    <span className="stat-value" style={{color: quantum24hAutoTraderStore.consecutive_losses > 3 ? '#ff4444' : '#ffaa00'}}>
                        {quantum24hAutoTraderStore.consecutive_losses}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Max Threshold</span>
                    <span className="stat-value">{quantum24hAutoTraderStore.max_consecutive_losses}</span>
                </div>
            </div>

            <div className="loss-threshold-input">
                <label>Max Consecutive Losses</label>
                <input
                    type="number"
                    value={quantum24hAutoTraderStore.max_consecutive_losses}
                    onChange={(e) => {
                        quantum24hAutoTraderStore.max_consecutive_losses = parseInt(e.target.value);
                    }}
                    className="input-field"
                    min="1"
                    max="10"
                />
            </div>

            <div className="loss-progress-bar">
                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${(quantum24hAutoTraderStore.consecutive_losses / quantum24hAutoTraderStore.max_consecutive_losses) * 100}%`,
                            backgroundColor: quantum24hAutoTraderStore.consecutive_losses >= quantum24hAutoTraderStore.max_consecutive_losses ? '#ff4444' : '#ffaa00'
                        }}
                    />
                </div>
            </div>

            <div className="protection-status" style={{backgroundColor: quantum24hAutoTraderStore.is_recovery_mode ? '#ff4444' : '#00cc00'}}>
                {quantum24hAutoTraderStore.is_recovery_mode ? '⚠️ RECOVERY MODE ACTIVE' : '✅ Protection Ready'}
            </div>
        </div>
    );
});

LossProtectionPanel.displayName = 'LossProtectionPanel';
export default LossProtectionPanel;
