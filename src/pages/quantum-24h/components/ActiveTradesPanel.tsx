import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const ActiveTradesPanel = observer(() => {
    return (
        <div className="active-trades-panel glass-card">
            <h3 className="panel-title">📊 Active Trades</h3>

            {quantum24hAutoTraderStore.active_trades.length > 0 ? (
                <div className="trades-list">
                    {quantum24hAutoTraderStore.active_trades.map((trade) => (
                        <div
                            key={trade.id}
                            className={`trade-item ${trade.status.toLowerCase()}`}
                        >
                            <div className="trade-market">{trade.market}</div>
                            <div className="trade-strategy">{trade.strategy}</div>
                            <div className="trade-entry">Entry: {trade.entry}</div>
                            <div className="trade-stake">${trade.stake}</div>
                            <div className="trade-status">{trade.status}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-message">No active trades</div>
            )}

            <div className="trades-summary">
                <span className="summary-label">Active Orders</span>
                <span className="summary-value">{quantum24hAutoTraderStore.active_trades.length}</span>
            </div>
        </div>
    );
});

ActiveTradesPanel.displayName = 'ActiveTradesPanel';
export default ActiveTradesPanel;
