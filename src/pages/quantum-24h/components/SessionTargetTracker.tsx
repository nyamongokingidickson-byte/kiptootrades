import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const SessionTargetTracker = observer(() => {
    const progress = quantum24hAutoTraderStore.session_target_progress;
    
    return (
        <div className="session-target-tracker glass-card">
            <h3 className="panel-title">🎯 Session Target</h3>

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
                        stroke="#00aaff"
                        strokeWidth="8"
                        strokeDasharray={`${(Math.min(100, progress) / 100) * 345.6} 345.6`}
                        className="progress-fill"
                    />
                </svg>
                <div className="progress-text">
                    <div className="progress-value">${quantum24hAutoTraderStore.performance_stats.total_profit.toFixed(2)}</div>
                    <div className="progress-target">/${quantum24hAutoTraderStore.total_session_target}</div>
                </div>
            </div>

            <div className="tracker-stats">
                <div className="stat-item">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">{Math.min(100, progress).toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Session Time</span>
                    <span className="stat-value">{quantum24hAutoTraderStore.session_progress_percentage.toFixed(1)}%</span>
                </div>
            </div>

            <div className="session-info">
                <span className="info-text">
                    Duration: {quantum24hAutoTraderStore.session_config.duration_hours}h
                </span>
            </div>
        </div>
    );
});

SessionTargetTracker.displayName = 'SessionTargetTracker';
export default SessionTargetTracker;
