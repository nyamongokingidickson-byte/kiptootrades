import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const HourlyTargetTracker = observer(() => {
    const percentage = Math.min(100, quantum24hAutoTraderStore.hourly_targets.percentage_achieved);
    
    return (
        <div className="hourly-target-tracker glass-card">
            <h3 className="panel-title">⏰ Hourly Target</h3>

            <div className="circular-progress">
                <svg viewBox="0 0 120 120" className="progress-circle">
                    <circle
                        cx="60"
                        cy="60"
                        r="55"
                        fill="none"
                        stroke="#333"
                        strokeWidth="8"
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r="55"
                        fill="none"
                        stroke="#00ff00"
                        strokeWidth="8"
                        strokeDasharray={`${(percentage / 100) * 345.6} 345.6`}
                        className="progress-fill"
                    />
                </svg>
                <div className="progress-text">
                    <div className="progress-value">${quantum24hAutoTraderStore.hourly_targets.current_profit.toFixed(2)}</div>
                    <div className="progress-target">/${quantum24hAutoTraderStore.hourly_targets.target_amount}</div>
                </div>
            </div>

            <div className="tracker-stats">
                <div className="stat-item">
                    <span className="stat-label">Remaining</span>
                    <span className="stat-value">${quantum24hAutoTraderStore.hourly_targets.remaining.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Time Left</span>
                    <span className="stat-value">{quantum24hAutoTraderStore.hourly_targets.time_remaining_minutes}m</span>
                </div>
            </div>

            <div className="achievement-badge" style={{opacity: quantum24hAutoTraderStore.is_hourly_target_reached ? 1 : 0.3}}>
                ✅ Target Reached
            </div>
        </div>
    );
});

HourlyTargetTracker.displayName = 'HourlyTargetTracker';
export default HourlyTargetTracker;
