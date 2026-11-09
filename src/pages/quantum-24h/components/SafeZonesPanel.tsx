import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const SafeZonesPanel = observer(() => {
    return (
        <div className="safe-zones-panel glass-card safe-zone">
            <h3 className="panel-title">✅ Safe Zones</h3>

            {quantum24hAutoTraderStore.safe_zones.length > 0 ? (
                <div className="zones-list">
                    {quantum24hAutoTraderStore.safe_zones.map((zone, idx) => (
                        <div key={idx} className="zone-item">
                            <div className="zone-name">{zone.market_name}</div>
                            <div className="zone-details">
                                <span className="zone-confidence">
                                    📊 {(zone.confidence * 100).toFixed(0)}%
                                </span>
                                <span className="zone-power">
                                    ⚡ {zone.power_score.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-message">No safe zones detected yet</div>
            )}

            <div className="zone-stats">
                <span className="stats-label">Safe Markets</span>
                <span className="stats-value">{quantum24hAutoTraderStore.safe_zones.length}</span>
            </div>
        </div>
    );
});

SafeZonesPanel.displayName = 'SafeZonesPanel';
export default SafeZonesPanel;
