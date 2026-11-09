import React from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Input, Button } from '@deriv-com/ui';
import tradingEngineStore from '../stores/TradingEngineStore';

const RecoveryPanel: React.FC = observer(() => {
    const handleToggleAutoSwitch = (checked: boolean) => {
        tradingEngineStore.setAutoSwitch(
            checked,
            tradingEngineStore.consecutive_loss_threshold,
            tradingEngineStore.recovery_market
        );
    };

    const handleThresholdChange = (value: string) => {
        const threshold = parseInt(value);
        tradingEngineStore.setAutoSwitch(
            tradingEngineStore.auto_switch_enabled,
            threshold,
            tradingEngineStore.recovery_market
        );
    };

    const handleRecoveryMarketChange = (market: string) => {
        tradingEngineStore.setAutoSwitch(
            tradingEngineStore.auto_switch_enabled,
            tradingEngineStore.consecutive_loss_threshold,
            market
        );
    };

    const should_trigger_recovery = tradingEngineStore.transaction_history.consecutive_losses >=
        tradingEngineStore.consecutive_loss_threshold;

    return (
        <div className='recovery-panel'>
            <Text size='md' weight='bold'>
                🛡️ Recovery & Auto-Switch
            </Text>

            <div className='recovery-controls'>
                {/* Auto Switch Toggle */}
                <div className='control-item'>
                    <Text size='sm'>Enable Auto Market Switch</Text>
                    <input
                        type='checkbox'
                        checked={tradingEngineStore.auto_switch_enabled}
                        onChange={(e) => handleToggleAutoSwitch(e.currentTarget.checked)}
                        className='toggle-checkbox'
                    />
                </div>

                {/* Consecutive Loss Threshold */}
                <div className='control-item'>
                    <label>
                        <Text size='sm'>Trigger Recovery After X Losses:</Text>
                    </label>
                    <input
                        type='number'
                        min='1'
                        max='10'
                        value={tradingEngineStore.consecutive_loss_threshold}
                        onChange={(e) => handleThresholdChange(e.currentTarget.value)}
                        disabled={!tradingEngineStore.auto_switch_enabled}
                    />
                </div>

                {/* Recovery Market Selection */}
                <div className='control-item'>
                    <label>
                        <Text size='sm'>Recovery Market:</Text>
                    </label>
                    <select
                        value={tradingEngineStore.recovery_market || 'Volatility 10'}
                        onChange={(e) => handleRecoveryMarketChange(e.currentTarget.value)}
                        disabled={!tradingEngineStore.auto_switch_enabled}
                    >
                        <option value='Volatility 10'>Volatility 10</option>
                        <option value='Volatility 25'>Volatility 25</option>
                        <option value='Volatility 50'>Volatility 50</option>
                        <option value='Volatility 75'>Volatility 75</option>
                        <option value='Volatility 100'>Volatility 100</option>
                    </select>
                </div>
            </div>

            {/* Status */}
            <div className='recovery-status'>
                <Text size='sm'>
                    Current Consecutive Losses: <strong>{tradingEngineStore.transaction_history.consecutive_losses}</strong>
                </Text>

                {should_trigger_recovery && (
                    <div className='recovery-alert'>
                        <Text size='sm' weight='bold' className='text-warning'>
                            ⚠️ Recovery triggered! Switching to {tradingEngineStore.recovery_market} with Safe entry.
                        </Text>
                    </div>
                )}

                {tradingEngineStore.auto_switch_enabled && !should_trigger_recovery && (
                    <Text size='xs' className='text-success'>
                        ✓ Auto-Switch Ready
                    </Text>
                )}
            </div>
        </div>
    );
});

RecoveryPanel.displayName = 'RecoveryPanel';

export default RecoveryPanel;
