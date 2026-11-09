import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const DangerZonesPanel = observer(() => {
    return (
        <div className="danger-zones-panel glass-card danger-zone">
            <h3 className="panel-title">⚠️ Danger Zones</h3>

            {quantum24hAutoTraderStore.danger_zones.length > 0 ? (
                <div className="zones-list">
                    {quantum24hAutoTraderStore.danger_zones.map((zone, idx) => (
                        <div key={idx} className="zone-item danger">
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
                <div className="empty-message">No danger zones detected</div>
            )}

            <div className="zone-stats">
                <span className="stats-label">Risky Markets</span>
                <span className="stats-value">{quantum24hAutoTraderStore.danger_zones.length}</span>
            </div>
        </div>
    );
});

DangerZonesPanel.displayName = 'DangerZonesPanel';
export default DangerZonesPanel;
