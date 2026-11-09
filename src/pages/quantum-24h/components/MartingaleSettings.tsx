import React from 'react';
import { observer } from 'mobx-react-lite';
import quantum24hAutoTraderStore from '../stores/Quantum24hAutoTraderStore';

const MartingaleSettings = observer(() => {
    const martingale_stages = [1.0, 1.5, 2.1, 3.1, 4.5, 6.5];

    return (
        <div className="martingale-settings glass-card">
            <h3 className="panel-title">📈 Martingale</h3>

            <div className="martingale-toggle">
                <label htmlFor="martingale-checkbox">Enable Martingale</label>
                <input
                    id="martingale-checkbox"
                    type="checkbox"
                    checked={quantum24hAutoTraderStore.martingale_enabled}
                    onChange={(e) => {
                        quantum24hAutoTraderStore.martingale_enabled = e.target.checked;
                    }}
                    className="toggle-checkbox"
                />
            </div>

            {quantum24hAutoTraderStore.martingale_enabled && (
                <>
                    <div className="multiplier-input">
                        <label>Base Multiplier</label>
                        <input
                            type="number"
                            value={quantum24hAutoTraderStore.martingale_multiplier}
                            onChange={(e) => {
                                quantum24hAutoTraderStore.martingale_multiplier = parseFloat(e.target.value);
                            }}
                            className="input-field"
                            step="0.1"
                            min="1.0"
                            max="5.0"
                        />
                    </div>

                    <div className="stages-display">
                        <span className="stages-label">Loss Stages</span>
                        <div className="stages-list">
                            {martingale_stages.map((stage, idx) => (
                                <div key={idx} className="stage-item">
                                    <span className="stage-number">L{idx + 1}</span>
                                    <span className="stage-multiplier">{stage.toFixed(1)}x</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="martingale-warning">
                ⚠️ High risk if using high multipliers
            </div>
        </div>
    );
});

MartingaleSettings.displayName = 'MartingaleSettings';
export default MartingaleSettings;
