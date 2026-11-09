import React from 'react';
import { observer } from 'mobx-react-lite';
import { v4 as uuidv4 } from 'uuid';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const LiveTradingConsole = observer(() => {
    const [trade_type, set_trade_type] = React.useState('over_under');
    const [contract_type, set_contract_type] = React.useState('over');
    const [ticks, set_ticks] = React.useState(5);

    const place_trade = () => {
        quantum24hAutoTraderStore.placeQuickTrade(
            quantum24hAutoTraderStore.current_market,
            quantum24hAutoTraderStore.current_strategy,
            quantum24hAutoTraderStore.current_stake
        );
    };

    return (
        <div className="live-trading-console glass-card">
            <h3 className="panel-title">💹 Live Trading Console</h3>

            <div className="console-grid">
                <div className="console-section">
                    <label>Market</label>
                    <select
                        value={quantum24hAutoTraderStore.current_market}
                        onChange={(e) => {
                            quantum24hAutoTraderStore.current_market = e.target.value;
                        }}
                        className="console-select"
                    >
                        {quantum24hAutoTraderStore.available_markets.map((market) => (
                            <option key={market} value={market}>
                                {market}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="console-section">
                    <label>Strategy</label>
                    <select
                        value={quantum24hAutoTraderStore.current_strategy}
                        onChange={(e) => {
                            quantum24hAutoTraderStore.current_strategy = e.target.value;
                        }}
                        className="console-select"
                    >
                        {quantum24hAutoTraderStore.session_config.selected_strategies.map((strat) => (
                            <option key={strat} value={strat}>
                                {strat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="console-section">
                    <label>Trade Type</label>
                    <select
                        value={trade_type}
                        onChange={(e) => set_trade_type(e.target.value)}
                        className="console-select"
                    >
                        <option value="over_under">Over/Under</option>
                        <option value="even_odd">Even/Odd</option>
                        <option value="high_low">High/Low</option>
                    </select>
                </div>

                <div className="console-section">
                    <label>Contract</label>
                    <select
                        value={contract_type}
                        onChange={(e) => set_contract_type(e.target.value)}
                        className="console-select"
                    >
                        <option value="over">Over</option>
                        <option value="under">Under</option>
                    </select>
                </div>

                <div className="console-section">
                    <label>Ticks</label>
                    <input
                        type="number"
                        value={ticks}
                        onChange={(e) => set_ticks(parseInt(e.target.value))}
                        className="console-input"
                        min="1"
                        max="100"
                    />
                </div>

                <div className="console-section">
                    <label>Stake</label>
                    <input
                        type="number"
                        value={quantum24hAutoTraderStore.current_stake}
                        onChange={(e) => {
                            quantum24hAutoTraderStore.current_stake = parseFloat(e.target.value);
                        }}
                        className="console-input"
                        step="1"
                        min="1"
                    />
                </div>
            </div>

            <button className="execute-trade-btn" onClick={place_trade}>
                📊 Place Trade
            </button>
        </div>
    );
});

LiveTradingConsole.displayName = 'LiveTradingConsole';
export default LiveTradingConsole;
