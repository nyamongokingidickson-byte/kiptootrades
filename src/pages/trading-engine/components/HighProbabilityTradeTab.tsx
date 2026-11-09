import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Input, Button } from '@deriv-com/ui';
import tradingEngineStore from '../stores/TradingEngineStore';

const HighProbabilityTradeTab: React.FC = observer(() => {
    const [account_balance] = useState(10000); // Mock account balance

    const handleConfigChange = (key: string, value: any) => {
        tradingEngineStore.setHPTradesConfig({
            [key]: value,
        });
    };

    const calculated_stake = (account_balance * tradingEngineStore.hp_trades_risk_percentage) / 100;

    return (
        <div className='hp-trades-tab'>
            <Text size='md' weight='bold'>
                🎯 High Probability Trades (1,2,3 Over / 6,7,8 Under)
            </Text>

            <div className='hp-config-grid'>
                {/* Enable HP Trades */}
                <div className='config-item'>
                    <Text size='sm'>Enable HP Trades</Text>
                    <input
                        type='checkbox'
                        checked={tradingEngineStore.hp_trades_enabled}
                        onChange={(e) => handleConfigChange('hp_trades_enabled', e.currentTarget.checked)}
                        className='toggle-checkbox'
                    />
                </div>

                {/* Trading Hours */}
                <div className='config-item'>
                    <label>
                        <Text size='sm'>Trading Hours</Text>
                    </label>
                    <div className='hours-input'>
                        <input
                            type='number'
                            min='0'
                            max='23'
                            value={tradingEngineStore.hp_trades_hours.start}
                            onChange={(e) =>
                                handleConfigChange('hp_trades_hours', {
                                    ...tradingEngineStore.hp_trades_hours,
                                    start: parseInt(e.currentTarget.value),
                                })
                            }
                            placeholder='Start'
                            disabled={!tradingEngineStore.hp_trades_enabled}
                        />
                        <Text size='xs'>to</Text>
                        <input
                            type='number'
                            min='0'
                            max='24'
                            value={tradingEngineStore.hp_trades_hours.end}
                            onChange={(e) =>
                                handleConfigChange('hp_trades_hours', {
                                    ...tradingEngineStore.hp_trades_hours,
                                    end: parseInt(e.currentTarget.value),
                                })
                            }
                            placeholder='End'
                            disabled={!tradingEngineStore.hp_trades_enabled}
                        />
                    </div>
                </div>

                {/* Target Per Hour */}
                <div className='config-item'>
                    <label>
                        <Text size='sm'>Target Trades Per Hour</Text>
                    </label>
                    <input
                        type='number'
                        min='1'
                        max='10'
                        value={tradingEngineStore.hp_trades_target_per_hour}
                        onChange={(e) => handleConfigChange('hp_trades_target_per_hour', parseInt(e.currentTarget.value))}
                        disabled={!tradingEngineStore.hp_trades_enabled}
                    />
                </div>

                {/* Risk Percentage */}
                <div className='config-item'>
                    <label>
                        <Text size='sm'>Risk % Per Trade</Text>
                    </label>
                    <div className='risk-selector'>
                        {[1, 2, 3, 4, 5].map((percentage) => (
                            <Button
                                key={percentage}
                                size='sm'
                                variant={
                                    tradingEngineStore.hp_trades_risk_percentage === percentage
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={() => handleConfigChange('hp_trades_risk_percentage', percentage)}
                                disabled={!tradingEngineStore.hp_trades_enabled}
                            >
                                {percentage}%
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Calculated Stake */}
                <div className='config-item'>
                    <Text size='sm'>Calculated Stake Per Trade</Text>
                    <Text size='lg' weight='bold' className='text-info'>
                        ${calculated_stake.toFixed(2)}
                    </Text>
                </div>

                {/* Stop Loss */}
                <div className='config-item'>
                    <Text size='sm'>Stop Loss (Consecutive Losses)</Text>
                    <select
                        value={tradingEngineStore.hp_trades_stop_loss_count}
                        onChange={(e) => handleConfigChange('hp_trades_stop_loss_count', parseInt(e.currentTarget.value))}
                        disabled={!tradingEngineStore.hp_trades_enabled}
                    >
                        <option value='3'>3 losses</option>
                        <option value='5'>5 losses</option>
                        <option value='7'>7 losses</option>
                        <option value='10'>10 losses</option>
                    </select>
                </div>

                {/* Martingale */}
                <div className='config-item'>
                    <Text size='sm'>Use Martingale</Text>
                    <input
                        type='checkbox'
                        checked={tradingEngineStore.hp_trades_use_martingale}
                        onChange={(e) => handleConfigChange('hp_trades_use_martingale', e.currentTarget.checked)}
                        disabled={!tradingEngineStore.hp_trades_enabled}
                        className='toggle-checkbox'
                    />
                </div>
            </div>

            {/* Martingale Configuration */}
            {tradingEngineStore.hp_trades_use_martingale && tradingEngineStore.hp_trades_enabled && (
                <div className='martingale-config'>
                    <Text size='sm' weight='bold'>
                        📊 Martingale Multipliers
                    </Text>
                    <div className='martingale-grid'>
                        <div className='martingale-item'>
                            <Text size='xs'>Over 3 / Under 6</Text>
                            <Text size='sm' weight='bold'>
                                1.5x
                            </Text>
                        </div>
                        <div className='martingale-item'>
                            <Text size='xs'>Over 2 / Under 7</Text>
                            <Text size='sm' weight='bold'>
                                2.1x
                            </Text>
                        </div>
                        <div className='martingale-item'>
                            <Text size='xs'>Over 1 / Under 8</Text>
                            <Text size='sm' weight='bold'>
                                3.1x
                            </Text>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Screen - Market Powers */}
            <div className='smart-screen'>
                <Text size='sm' weight='bold'>
                    🔍 Smart Screen - Market Powers
                </Text>
                <div className='market-zones'>
                    <div className='zone-card safe-zone'>
                        <Text size='xs' weight='bold'>
                            SAFE ZONE
                        </Text>
                        <Text size='xs'>High Probability Entries</Text>
                    </div>
                    <div className='zone-card warning-zone'>
                        <Text size='xs' weight='bold'>
                            WARNING ZONE
                        </Text>
                        <Text size='xs'>Medium Probability</Text>
                    </div>
                    <div className='zone-card bad-zone'>
                        <Text size='xs' weight='bold'>
                            BAD ZONE
                        </Text>
                        <Text size='xs'>Low Probability</Text>
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <div className='hp-trades-actions'>
                <Button
                    variant={tradingEngineStore.hp_trades_enabled ? 'contained' : 'outlined'}
                    onClick={() => handleConfigChange('hp_trades_enabled', !tradingEngineStore.hp_trades_enabled)}
                >
                    {tradingEngineStore.hp_trades_enabled ? '⏹️ Stop HP Trading' : '▶️ Start HP Trading'}
                </Button>
            </div>
        </div>
    );
});

HighProbabilityTradeTab.displayName = 'HighProbabilityTradeTab';

export default HighProbabilityTradeTab;
