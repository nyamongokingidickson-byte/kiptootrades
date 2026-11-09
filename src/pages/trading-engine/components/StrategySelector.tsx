import React from 'react';
import { Text } from '@deriv-com/ui';

interface IStrategySelectorProps {
    onStrategyChange: (strategy: string) => void;
}

const StrategySelector: React.FC<IStrategySelectorProps> = ({ onStrategyChange }) => {
    const strategies = [
        { value: 'over_under', label: 'Over/Under' },
        { value: 'even_odd', label: 'Even/Odd' },
        { value: 'differs', label: 'Differs' },
        { value: 'matches', label: 'Matches' },
        { value: 'accumulators', label: 'Accumulators' },
        { value: 'rise_fall', label: 'Rise and Fall' },
        { value: 'high_low', label: 'High and Low' },
    ];

    return (
        <div className='strategy-selector'>
            <Text size='sm' weight='bold'>
                Select Strategy:
            </Text>
            <select
                onChange={(e) => onStrategyChange(e.currentTarget.value)}
                defaultValue='over_under'
                className='strategy-select'
            >
                {strategies.map((strategy) => (
                    <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default StrategySelector;
