import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const AIInsightsPanel = observer(() => {
    return (
        <div className="ai-insights-panel glass-card ai-card">
            <h3 className="panel-title">🤖 AI Insights</h3>

            <div className="insights-grid">
                <div className="insight-item">
                    <span className="insight-label">Best Market</span>
                    <span className="insight-value">{quantum24hAutoTraderStore.ai_best_market}</span>
                </div>

                <div className="insight-item">
                    <span className="insight-label">Safest Strategy</span>
                    <span className="insight-value">{quantum24hAutoTraderStore.ai_safest_strategy}</span>
                </div>

                <div className="insight-item">
                    <span className="insight-label">Top Signal</span>
                    <span className="insight-value">{quantum24hAutoTraderStore.ai_strongest_signal}</span>
                </div>

                <div className="insight-item">
                    <span className="insight-label">Expected Return</span>
                    <span className="insight-value">{quantum24hAutoTraderStore.ai_expected_hourly_return}%</span>
                </div>
            </div>

            <div className="recommendation-box">
                <span className="recommendation-label">Current Recommendation</span>
                <p className="recommendation-text">
                    {quantum24hAutoTraderStore.ai_recommendation}
                </p>
            </div>

            <div className="ai-status">
                <span className="status-indicator">● AI Active</span>
                <span className="status-time">Last Update: Just now</span>
            </div>
        </div>
    );
});

AIInsightsPanel.displayName = 'AIInsightsPanel';
export default AIInsightsPanel;
