import { ITick, IMarketAnalysis } from '../stores/TradingEngineStore';

export class MarketAnalyzer {
    /**
     * Analyzes market data to extract statistics
     */
    static analyzeMarket(ticks: ITick[], market_name: string): IMarketAnalysis {
        const digits = ticks.map((t) => t.tick % 10);
        const digit_distribution: { [key: number]: number } = {};

        // Count digit occurrences
        digits.forEach((digit) => {
            digit_distribution[digit] = (digit_distribution[digit] || 0) + 1;
        });

        // Calculate Over/Under (Over: 5-9, Under: 0-4)
        const over_digits = digits.filter((d) => d >= 5);
        const under_digits = digits.filter((d) => d < 5);

        const over_count = over_digits.length;
        const under_count = under_digits.length;
        const total = digits.length;

        const over_percentage = (over_count / total) * 100;
        const under_percentage = (under_count / total) * 100;

        // Find highest digit in each category
        let highest_digit_over = -1;
        let highest_digit_under = -1;
        let over_max_count = 0;
        let under_max_count = 0;

        Object.entries(digit_distribution).forEach(([digit, count]) => {
            const d = parseInt(digit);
            if (d >= 5 && count > over_max_count) {
                highest_digit_over = d;
                over_max_count = count;
            }
            if (d < 5 && count > under_max_count) {
                highest_digit_under = d;
                under_max_count = count;
            }
        });

        // Last 15 ticks trend
        const last_15_ticks = digits.slice(-15);
        const last_15_over = last_15_ticks.filter((d) => d >= 5).length;
        const last_15_under = last_15_ticks.filter((d) => d < 5).length;

        let last_ticks_trend: 'over' | 'under' | 'neutral' = 'neutral';
        if (last_15_over > last_15_under + 2) {
            last_ticks_trend = 'over';
        } else if (last_15_under > last_15_over + 2) {
            last_ticks_trend = 'under';
        }

        return {
            market_name,
            total_ticks: total,
            over_count,
            under_count,
            over_percentage,
            under_percentage,
            highest_digit_over,
            highest_digit_under,
            digit_distribution,
            last_15_ticks,
            last_ticks_trend,
        };
    }

    /**
     * Generate trade signals based on market analysis
     */
    static generateSignal(analysis: IMarketAnalysis): { signal: 'over' | 'under' | null; confidence: number; warning: string | null } {
        const { over_percentage, under_percentage, last_ticks_trend } = analysis;

        let signal: 'over' | 'under' | null = null;
        let confidence = 0;
        let warning: string | null = null;

        // Check if market is strong enough (>55%)
        if (over_percentage > 55) {
            signal = 'over';
            confidence = over_percentage;

            // Check for unstable conditions
            if (last_ticks_trend === 'under') {
                warning = 'Caution: Recent ticks favor Under. Verify entry point before trading.';
            }
        } else if (under_percentage > 55) {
            signal = 'under';
            confidence = under_percentage;

            // Check for unstable conditions
            if (last_ticks_trend === 'over') {
                warning = 'Caution: Recent ticks favor Over. Verify entry point before trading.';
            }
        }

        return { signal, confidence, warning };
    }

    /**
     * Analyze last N ticks to identify patterns and skip signals
     */
    static analyzeEntryPattern(ticks: ITick[], entry_digit: number, lookback_count: number = 5): { skip_ticks: number; reason: string } {
        const last_ticks = ticks.slice(-lookback_count).map((t) => t.tick % 10);

        let skip_ticks = 0;
        let reason = '';

        // Look for pattern where opposite direction appears
        const entry_is_over = entry_digit >= 5;
        const opposite_count = last_ticks.filter((d) => (entry_is_over ? d < 5 : d >= 5)).length;

        if (opposite_count > 0) {
            skip_ticks = Math.min(opposite_count, 5);
            reason = `Found ${opposite_count} opposite digits. Skip ${skip_ticks} ticks to avoid pattern loss.`;
        }

        return { skip_ticks, reason };
    }

    /**
     * Analyze high probability entry points
     */
    static findHighProbabilityEntry(analysis: IMarketAnalysis): { entry_digit: number; probability: number } {
        const { digit_distribution } = analysis;

        let best_digit = 0;
        let best_count = 0;

        Object.entries(digit_distribution).forEach(([digit, count]) => {
            if (count > best_count) {
                best_count = count;
                best_digit = parseInt(digit);
            }
        });

        const probability = (best_count / analysis.total_ticks) * 100;

        return { entry_digit: best_digit, probability };
    }

    /**
     * Detect recovery market signals
     */
    static shouldTriggerRecovery(consecutive_losses: number, threshold: number): boolean {
        return consecutive_losses >= threshold;
    }

    /**
     * Calculate safe recovery entry point
     */
    static getRecoveryEntry(last_signal: 'over' | 'under' | null): 'over_0' | 'even' {
        // Force safe entry on recovery: Over 0 or Even
        return 'over_0';
    }

    /**
     * Analyze multiple strategies
     */
    static analyzeStrategy(
        ticks: ITick[],
        strategy: 'over_under' | 'even_odd' | 'differs' | 'matches' | 'accumulators' | 'rise_fall' | 'high_low'
    ): {
        signal: string;
        confidence: number;
        distribution: { [key: string]: number };
    } {
        const digits = ticks.map((t) => t.tick % 10);

        switch (strategy) {
            case 'over_under': {
                const over = digits.filter((d) => d >= 5).length;
                const under = digits.filter((d) => d < 5).length;
                return {
                    signal: over > under ? 'over' : 'under',
                    confidence: (Math.max(over, under) / digits.length) * 100,
                    distribution: {
                        over,
                        under,
                    },
                };
            }

            case 'even_odd': {
                const even = digits.filter((d) => d % 2 === 0).length;
                const odd = digits.filter((d) => d % 2 !== 0).length;
                return {
                    signal: even > odd ? 'even' : 'odd',
                    confidence: (Math.max(even, odd) / digits.length) * 100,
                    distribution: {
                        even,
                        odd,
                    },
                };
            }

            case 'high_low': {
                const high = digits.filter((d) => d >= 5).length;
                const low = digits.filter((d) => d < 5).length;
                return {
                    signal: high > low ? 'high' : 'low',
                    confidence: (Math.max(high, low) / digits.length) * 100,
                    distribution: {
                        high,
                        low,
                    },
                };
            }

            default:
                return { signal: 'neutral', confidence: 0, distribution: {} };
        }
    }
}
