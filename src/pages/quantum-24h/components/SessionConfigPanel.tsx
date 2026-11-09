import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const SessionConfigPanel = observer(() => {
    return (
        <div className="session-config-panel glass-card">
            <h3 className="panel-title">⚙️ Session Config</h3>

            <div className="config-grid">
                <div className="config-item">
                    <label>Duration (Hours)</label>
                    <input
                        type="number"
                        value={quantum24hAutoTraderStore.session_config.duration_hours}
                        onChange={(e) =>
                            quantum24hAutoTraderStore.updateSessionConfig({
                                duration_hours: parseFloat(e.target.value),
                            })
                        }
                        className="config-input"
                        disabled={quantum24hAutoTraderStore.is_session_active}
                    />
                </div>

                <div className="config-item">
                    <label>Hourly Target ($)</label>
                    <input
                        type="number"
                        value={quantum24hAutoTraderStore.session_config.hourly_profit_target}
                        onChange={(e) =>
                            quantum24hAutoTraderStore.updateSessionConfig({
                                hourly_profit_target: parseFloat(e.target.value),
                            })
                        }
                        className="config-input"
                        disabled={quantum24hAutoTraderStore.is_session_active}
                    />
                </div>

                <div className="config-item">
                    <label>Risk %</label>
                    <input
                        type="number"
                        value={quantum24hAutoTraderStore.session_config.risk_percentage}
                        onChange={(e) =>
                            quantum24hAutoTraderStore.updateSessionConfig({
                                risk_percentage: parseFloat(e.target.value),
                            })
                        }
                        className="config-input"
                        step="0.5"
                        min="0.5"
                        max="10"
                        disabled={quantum24hAutoTraderStore.is_session_active}
                    />
                </div>
            </div>

            <div className="session-controls">
                {!quantum24hAutoTraderStore.is_session_active ? (
                    <button
                        className="btn btn-start"
                        onClick={() => quantum24hAutoTraderStore.startSession()}
                    >
                        ▶️ Start Session
                    </button>
                ) : (
                    <>
                        <button
                            className="btn btn-pause"
                            onClick={() => quantum24hAutoTraderStore.pauseSession()}
                        >
                            ⏸️ Pause
                        </button>
                        <button
                            className="btn btn-stop"
                            onClick={() => quantum24hAutoTraderStore.stopSession()}
                        >
                            ⏹️ Stop
                        </button>
                    </>
                )}
            </div>

            <div className="session-status">
                <div className="status-badge" style={{backgroundColor: quantum24hAutoTraderStore.is_session_active ? '#00ff00' : '#666'}}>
                    {quantum24hAutoTraderStore.session_status}
                </div>
                <span className="status-text">
                    {quantum24hAutoTraderStore.remaining_session_time_hours > 0
                        ? `${quantum24hAutoTraderStore.remaining_session_time_hours.toFixed(1)}h remaining`
                        : 'Session ended'}
                </span>
            </div>
        </div>
    );
});

SessionConfigPanel.displayName = 'SessionConfigPanel';
export default SessionConfigPanel;
