import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

interface Props {
    show_limited?: boolean;
}

const MarketPowerBoard = observer(({ show_limited = true }: Props) => {
    const markets_to_display = show_limited ? quantum24hAutoTraderStore.market_powers.slice(0, 5) : quantum24hAutoTraderStore.market_powers;

    return (
        <div className="market-power-board glass-card">
            <h3 className="panel-title">🎯 Market Power Ranking</h3>

            <div className="market-table">
                <div className="table-header">
                    <span className="col-market">Market</span>
                    <span className="col-power">Power</span>
                    <span className="col-confidence">Confidence</span>
                    <span className="col-signal">Signal</span>
                    <span className="col-status">Status</span>
                </div>

                {markets_to_display.map((market, idx) => (
                    <div
                        key={idx}
                        className={`table-row ${market.status.toLowerCase()}`}
                        onClick={() => {
                            quantum24hAutoTraderStore.current_market = market.market_name;
                        }}
                    >
                        <span className="col-market">{market.market_name}</span>
                        <span className="col-power">{market.power_score.toFixed(1)}</span>
                        <span className="col-confidence">{(market.confidence * 100).toFixed(0)}%</span>
                        <span className="col-signal">{market.signal_strength.toFixed(1)}</span>
                        <span className="col-status badge" style={{backgroundColor: getStatusColor(market.status)}}>
                            {market.status}
                        </span>
                    </div>
                ))}
            </div>

            <div className="current-market-display">
                <span className="current-label">Currently Selected</span>
                <span className="current-market">{quantum24hAutoTraderStore.current_market}</span>
            </div>
        </div>
    );
});

function getStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
        'BEST_MARKET': '#00ff00',
        'GOOD': '#00cc00',
        'WEAK': '#ffaa00',
        'DANGER': '#ff4444',
    };
    return colors[status] || '#666';
}

MarketPowerBoard.displayName = 'MarketPowerBoard';
export default MarketPowerBoard;
