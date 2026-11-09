import React from 'react';
import { observer } from 'mobx-react-lite';
import { Text } from '@deriv-com/ui';
import tradingEngineStore from '../stores/TradingEngineStore';

const TransactionHistory: React.FC = observer(() => {
    const { history } = tradingEngineStore.transaction_history;
    const {
        total_runs,
        total_wins,
        total_loss,
        total_stake,
        total_profit,
        win_rate,
    } = tradingEngineStore.transaction_history;

    const profit_color = total_profit >= 0 ? 'success' : 'danger';
    const profit_sign = total_profit >= 0 ? '+' : '';

    return (
        <div className='transaction-history-section'>
            <Text size='md' weight='bold'>
                Transaction History
            </Text>

            <div className='history-stats'>
                <div className='stat-card'>
                    <Text size='xs'>Total Runs</Text>
                    <Text size='lg' weight='bold'>
                        {total_runs}
                    </Text>
                </div>

                <div className='stat-card'>
                    <Text size='xs'>Wins</Text>
                    <Text size='lg' weight='bold' className='text-success'>
                        {total_wins}
                    </Text>
                </div>

                <div className='stat-card'>
                    <Text size='xs'>Losses</Text>
                    <Text size='lg' weight='bold' className='text-danger'>
                        {total_loss}
                    </Text>
                </div>

                <div className='stat-card'>
                    <Text size='xs'>Win Rate</Text>
                    <Text size='lg' weight='bold'>
                        {win_rate.toFixed(2)}%
                    </Text>
                </div>

                <div className='stat-card'>
                    <Text size='xs'>Total Stake</Text>
                    <Text size='lg' weight='bold'>
                        ${total_stake.toFixed(2)}
                    </Text>
                </div>

                <div className={`stat-card profit-card ${profit_color}`}>
                    <Text size='xs'>Total Profit</Text>
                    <Text size='lg' weight='bold' className={`text-${profit_color}`}>
                        {profit_sign}${Math.abs(total_profit).toFixed(2)}
                    </Text>
                </div>
            </div>

            {/* Recent Trades */}
            {tradingEngineStore.active_orders.length > 0 && (
                <div className='recent-trades'>
                    <Text size='sm' weight='bold'>
                        Active Orders
                    </Text>
                    {tradingEngineStore.active_orders.map((order) => (
                        <div key={order.id} className='trade-item'>
                            <Text size='xs'>
                                {order.market} - {order.contract_type.toUpperCase()} - {order.status.toUpperCase()}
                            </Text>
                            <Text size='xs' weight='bold'>
                                Stake: ${order.stake}
                            </Text>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

TransactionHistory.displayName = 'TransactionHistory';

export default TransactionHistory;
