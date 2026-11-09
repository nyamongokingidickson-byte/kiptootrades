import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Button, Input } from '@deriv-com/ui';
import tradingEngineStore, { ITradeOrder } from '../stores/TradingEngineStore';
import { v4 as uuidv4 } from 'uuid';

const TradingConsole: React.FC = observer(() => {
    const [market, setMarket] = useState(tradingEngineStore.primary_market);
    const [trade_type, setTradeType] = useState('over_under');
    const [contract_type, setContractType] = useState('over');
    const [ticks, setTicks] = useState('1');
    const [entry_point, setEntryPoint] = useState('0');
    const [stake, setStake] = useState('10');
    const [tp, setTp] = useState('100');
    const [sl, setSl] = useState('-50');
    const [martingale_enabled, setMartingaleEnabled] = useState(false);
    const [martingale_multiplier, setMartingaleMultiplier] = useState('2');
    const [is_auto_trading, setIsAutoTrading] = useState(false);

    const handlePlaceOrder = () => {
        const new_order: ITradeOrder = {
            id: uuidv4(),
            market,
            trade_type,
            contract_type,
            ticks: parseInt(ticks),
            entry_point: parseInt(entry_point),
            stake: parseFloat(stake),
            martingale_enabled,
            martingale_multiplier: parseFloat(martingale_multiplier),
            tp: parseFloat(tp),
            sl: parseFloat(sl),
            is_auto: is_auto_trading,
            status: 'pending',
            entry_time: Date.now(),
            profit_loss: 0,
        };

        tradingEngineStore.placeOrder(new_order);
    };

    return (
        <div className='trading-console'>
            <div className='console-grid'>
                {/* Market Selection */}
                <div className='console-item'>
                    <label>Market</label>
                    <select value={market} onChange={(e) => setMarket(e.currentTarget.value)}>
                        <option value='Volatility 10'>Volatility 10</option>
                        <option value='Volatility 25'>Volatility 25</option>
                        <option value='Volatility 50'>Volatility 50</option>
                        <option value='Volatility 75'>Volatility 75</option>
                        <option value='Volatility 100'>Volatility 100</option>
                    </select>
                </div>

                {/* Trade Type */}
                <div className='console-item'>
                    <label>Trade Type</label>
                    <select value={trade_type} onChange={(e) => setTradeType(e.currentTarget.value)}>
                        <option value='over_under'>Over/Under</option>
                        <option value='even_odd'>Even/Odd</option>
                        <option value='high_low'>High/Low</option>
                    </select>
                </div>

                {/* Contract Type */}
                <div className='console-item'>
                    <label>Contract Type</label>
                    <select value={contract_type} onChange={(e) => setContractType(e.currentTarget.value)}>
                        <option value='over'>Over</option>
                        <option value='under'>Under</option>
                    </select>
                </div>

                {/* Ticks */}
                <div className='console-item'>
                    <label>Ticks</label>
                    <input type='number' value={ticks} onChange={(e) => setTicks(e.currentTarget.value)} />
                </div>

                {/* Entry Point */}
                <div className='console-item'>
                    <label>Entry Point</label>
                    <input type='number' value={entry_point} onChange={(e) => setEntryPoint(e.currentTarget.value)} />
                </div>

                {/* Stake */}
                <div className='console-item'>
                    <label>Stake</label>
                    <input type='number' value={stake} onChange={(e) => setStake(e.currentTarget.value)} />
                </div>

                {/* TP */}
                <div className='console-item'>
                    <label>Take Profit</label>
                    <input type='number' value={tp} onChange={(e) => setTp(e.currentTarget.value)} />
                </div>

                {/* SL */}
                <div className='console-item'>
                    <label>Stop Loss</label>
                    <input type='number' value={sl} onChange={(e) => setSl(e.currentTarget.value)} />
                </div>

                {/* Martingale */}
                <div className='console-item'>
                    <label>Martingale</label>
                    <div className='martingale-controls'>
                        <input
                            type='checkbox'
                            checked={martingale_enabled}
                            onChange={(e) => setMartingaleEnabled(e.currentTarget.checked)}
                            className='toggle-checkbox'
                        />
                        {martingale_enabled && (
                            <input
                                type='number'
                                value={martingale_multiplier}
                                onChange={(e) => setMartingaleMultiplier(e.currentTarget.value)}
                                placeholder='Multiplier'
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Auto Trading Toggle */}
            <div className='auto-trading-section'>
                <div className='auto-trading-header'>
                    <Text weight='bold'>Auto Trading</Text>
                    <input
                        type='checkbox'
                        checked={is_auto_trading}
                        onChange={(e) => setIsAutoTrading(e.currentTarget.checked)}
                        className='toggle-checkbox'
                    />
                </div>
                {is_auto_trading && (
                    <Text size='xs' className='auto-trading-info'>
                        🤖 Auto trading enabled: Trades will continuously restart after each order until TP is hit.
                    </Text>
                )}
            </div>

            {/* Action Buttons */}
            <div className='console-buttons'>
                <button onClick={handlePlaceOrder} className='btn-outlined'>
                    🎯 Manual Trade
                </button>
                <button
                    onClick={() => {
                        tradingEngineStore.is_trading_active = !tradingEngineStore.is_trading_active;
                        handlePlaceOrder();
                    }}
                    disabled={!is_auto_trading}
                    className='btn-contained'
                >
                    {tradingEngineStore.is_trading_active ? '⏹️ Stop Auto Trading' : '▶️ Start Auto Trading'}
                </button>
            </div>
        </div>
    );
});

TradingConsole.displayName = 'TradingConsole';

export default TradingConsole;
