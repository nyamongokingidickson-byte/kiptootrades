import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const TransactionHistory = observer(() => {
    const stats = quantum24hAutoTraderStore.performance_stats;

    return (
        <div className="transaction-history glass-card">
            <h3 className="panel-title">📋 Transaction Summary</h3>

            <div className="history-cards">
                <div className="history-card">
                    <span className="history-label">Total Runs</span>
                    <span className="history-value">{stats.trades_today}</span>
                </div>

                <div className="history-card win">
                    <span className="history-label">Wins</span>
                    <span className="history-value" style={{ color: '#00ff00' }}>
                        {stats.wins}
                    </span>
                </div>

                <div className="history-card loss">
                    <span className="history-label">Losses</span>
                    <span className="history-value" style={{ color: '#ff4444' }}>
                        {stats.losses}
                    </span>
                </div>

                <div className="history-card">
                    <span className="history-label">Win %</span>
                    <span className="history-value" style={{
                        color: stats.win_rate > 55 ? '#00ff00' : stats.win_rate > 45 ? '#ffaa00' : '#ff4444'
                    }}>
                        {stats.win_rate.toFixed(1)}%
                    </span>
                </div>

                <div className="history-card">
                    <span className="history-label">Streak</span>
                    <span className="history-value">{stats.current_streak}</span>
                </div>

                <div className="history-card">
                    <span className="history-label">Profit</span>
                    <span className="history-value" style={{
                        color: stats.total_profit > 0 ? '#00ff00' : stats.total_profit < 0 ? '#ff4444' : '#666'
                    }}>
                        ${stats.total_profit.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="history-breakdown">
                <div className="breakdown-item">
                    <span className="item-label">Best Win Streak</span>
                    <span className="item-value">{stats.best_streak}</span>
                </div>

                <div className="breakdown-item">
                    <span className="item-label">Account ROI</span>
                    <span className="item-value" style={{
                        color: stats.roi > 0 ? '#00ff00' : '#ff4444'
                    }}>
                        {stats.roi.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
});

TransactionHistory.displayName = 'TransactionHistory';
export default TransactionHistory;
