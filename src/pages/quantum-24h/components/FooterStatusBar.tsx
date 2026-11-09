import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const FooterStatusBar = observer(() => {
    return (
        <div className="footer-status-bar">
            <div className="status-item">
                <span className="status-label">System Status</span>
                <span className="status-badge" style={{backgroundColor: quantum24hAutoTraderStore.system_status === 'ONLINE' ? '#00ff00' : '#ff4444'}}>
                    {quantum24hAutoTraderStore.system_status}
                </span>
            </div>

            <div className="status-item">
                <span className="status-label">Connected</span>
                <span className="status-badge" style={{backgroundColor: quantum24hAutoTraderStore.is_connected ? '#00ff00' : '#ff4444'}}>
                    {quantum24hAutoTraderStore.is_connected ? '✓ Connected' : '✗ Disconnected'}
                </span>
            </div>

            <div className="status-item">
                <span className="status-label">Session</span>
                <span className="status-badge" style={{backgroundColor: quantum24hAutoTraderStore.is_session_active ? '#00ff00' : '#666'}}>
                    {quantum24hAutoTraderStore.session_status}
                </span>
            </div>

            <div className="status-item">
                <span className="status-label">Current Market</span>
                <span className="status-value">{quantum24hAutoTraderStore.current_market}</span>
            </div>

            <div className="status-item">
                <span className="status-label">Strategy</span>
                <span className="status-value">{quantum24hAutoTraderStore.current_strategy}</span>
            </div>

            <div className="status-item">
                <span className="status-label">Active Trades</span>
                <span className="status-value">{quantum24hAutoTraderStore.active_trades.length}</span>
            </div>

            <div className="status-item">
                <span className="status-label">Profit</span>
                <span className="status-value" style={{color: quantum24hAutoTraderStore.performance_stats.total_profit > 0 ? '#00ff00' : '#ff4444'}}>
                    ${quantum24hAutoTraderStore.performance_stats.total_profit.toFixed(2)}
                </span>
            </div>

            <div className="status-divider"/>

            <div className="status-timestamp">
                {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
});

FooterStatusBar.displayName = 'FooterStatusBar';
export default FooterStatusBar;
