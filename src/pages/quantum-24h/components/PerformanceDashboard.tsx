import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const PerformanceDashboard = observer(() => {
    const stats = quantum24hAutoTraderStore.performance_stats;
    const win_rate_color = stats.win_rate > 55 ? '#00ff00' : stats.win_rate > 45 ? '#ffaa00' : '#ff4444';

    return (
        <div className="performance-dashboard glass-card">
            <h3 className="panel-title">📈 Performance Dashboard</h3>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <span className="card-label">Total Trades</span>
                    <span className="card-value">{stats.trades_today}</span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">Wins</span>
                    <span className="card-value" style={{ color: '#00ff00' }}>
                        {stats.wins}
                    </span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">Losses</span>
                    <span className="card-value" style={{ color: '#ff4444' }}>
                        {stats.losses}
                    </span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">Win Rate</span>
                    <span className="card-value" style={{ color: win_rate_color }}>
                        {stats.win_rate.toFixed(1)}%
                    </span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">Best Streak</span>
                    <span className="card-value">{stats.best_streak}</span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">Current Streak</span>
                    <span className="card-value">{stats.current_streak}</span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">Total Profit</span>
                    <span className="card-value" style={{ color: stats.total_profit > 0 ? '#00ff00' : '#ff4444' }}>
                        ${stats.total_profit.toFixed(2)}
                    </span>
                </div>

                <div className="dashboard-card">
                    <span className="card-label">ROI</span>
                    <span className="card-value" style={{ color: stats.roi > 0 ? '#00ff00' : '#ff4444' }}>
                        {stats.roi.toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="dashboard-chart-placeholder">
                <p>Performance Chart</p>
                <div className="chart-bars">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="chart-bar"
                            style={{
                                height: `${Math.random() * 80 + 20}%`,
                                backgroundColor: Math.random() > 0.5 ? '#00ff00' : '#ff4444',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';
export default PerformanceDashboard;
