import { makeObservable, observable, action, computed } from 'mobx';

export interface ISessionConfig {
    duration_hours: number;
    hourly_profit_target: number;
    risk_percentage: number;
    selected_strategies: string[];
}

export interface IMarketPower {
    market_name: string;
    power_score: number;
    confidence: number;
    signal_strength: number;
    safety_rating: number;
    status: 'BEST_MARKET' | 'GOOD' | 'WEAK' | 'DANGER';
}

export interface ISignal {
    market: string;
    strategy: string;
    signal_strength: number;
    confidence: number;
    entry_trigger: string;
    recommended_action: string;
    expected_return: number;
}

export interface IActiveQuickTrade {
    id: string;
    market: string;
    strategy: string;
    entry: number;
    stake: number;
    profit_loss: number;
    status: 'PENDING' | 'ACTIVE' | 'WIN' | 'LOSS';
    entry_time: number;
}

export interface IPerformanceStats {
    trades_today: number;
    wins: number;
    losses: number;
    win_rate: number;
    current_streak: number;
    best_streak: number;
    total_profit: number;
    roi: number;
}

export interface IHourlyTarget {
    target_amount: number;
    current_profit: number;
    remaining: number;
    time_remaining_minutes: number;
    percentage_achieved: number;
}

class Quantum24hAutoTraderStore {
    // Session Configuration
    session_config: ISessionConfig = {
        duration_hours: 12,
        hourly_profit_target: 10,
        risk_percentage: 2,
        selected_strategies: ['Over 1', 'Over 2', 'Over 3', 'Under 6', 'Under 7', 'Under 8'],
    };

    session_start_time: number | null = null;
    is_session_active = false;
    session_status: 'ACTIVE' | 'PAUSED' | 'STOPPED' = 'STOPPED';

    // Account Settings
    account_balance = 10000;
    current_stake = 10;
    max_exposure = 200;

    // Market Data
    market_powers: IMarketPower[] = [];
    best_market: IMarketPower | null = null;
    safe_zones: IMarketPower[] = [];
    danger_zones: IMarketPower[] = [];

    // Trading Data
    active_signals: ISignal[] = [];
    active_trades: IActiveQuickTrade[] = [];
    current_market = 'Volatility 50';
    current_strategy = 'Over 1';

    // Performance Metrics
    performance_stats: IPerformanceStats = {
        trades_today: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        current_streak: 0,
        best_streak: 0,
        total_profit: 0,
        roi: 0,
    };

    // Hourly Tracking
    hourly_targets: IHourlyTarget = {
        target_amount: 10,
        current_profit: 0,
        remaining: 10,
        time_remaining_minutes: 60,
        percentage_achieved: 0,
    };

    session_target_progress = 0;

    // Loss Protection
    consecutive_losses = 0;
    max_consecutive_losses = 5;
    is_recovery_mode = false;
    recovery_market = 'Volatility 10';
    recovery_strategy = 'Even';

    // Martingale Settings
    martingale_enabled = false;
    martingale_multiplier = 1.5;

    // Auto Market Selection
    auto_market_selection = true;
    available_markets = [
        'Volatility 10',
        'Volatility 25',
        'Volatility 50',
        'Volatility 75',
        'Volatility 100',
        'Volatility 1s',
    ];

    // AI Insights
    ai_best_market = 'Volatility 50';
    ai_safest_strategy = 'Even';
    ai_strongest_signal = 'Over 1';
    ai_expected_hourly_return = 8.5;
    ai_recommendation = 'Current conditions favor Over strategies with 82% confidence';

    // Connection Status
    is_connected = true;
    system_status: 'ONLINE' | 'OFFLINE' | 'ERROR' = 'ONLINE';

    constructor() {
        makeObservable(this, {
            // Session Config
            session_config: observable,
            session_start_time: observable,
            is_session_active: observable,
            session_status: observable,

            // Account
            account_balance: observable,
            current_stake: observable,
            max_exposure: observable,

            // Market
            market_powers: observable,
            best_market: observable,
            safe_zones: observable,
            danger_zones: observable,

            // Trading
            active_signals: observable,
            active_trades: observable,
            current_market: observable,
            current_strategy: observable,

            // Performance
            performance_stats: observable,
            hourly_targets: observable,
            session_target_progress: observable,

            // Loss Protection
            consecutive_losses: observable,
            is_recovery_mode: observable,

            // Auto Selection
            auto_market_selection: observable,

            // AI
            ai_best_market: observable,
            ai_recommendation: observable,

            // Status
            is_connected: observable,
            system_status: observable,

            // Actions
            startSession: action,
            pauseSession: action,
            stopSession: action,
            updateSessionConfig: action,
            updateMarketPowers: action,
            updatePerformanceStats: action,
            updateHourlyProgress: action,
            placeQuickTrade: action,
            updateTradeStatus: action,
            triggerRecoveryMode: action,
            updateAIInsights: action,

            // Computed
            total_session_target: computed,
            remaining_session_time_hours: computed,
            session_progress_percentage: computed,
            is_hourly_target_reached: computed,
            recommended_stake: computed,
            account_roi: computed,
        });
    }

    startSession = () => {
        this.is_session_active = true;
        this.session_status = 'ACTIVE';
        this.session_start_time = Date.now();
        this.consecutive_losses = 0;
        this.performance_stats = {
            trades_today: 0,
            wins: 0,
            losses: 0,
            win_rate: 0,
            current_streak: 0,
            best_streak: 0,
            total_profit: 0,
            roi: 0,
        };
    };

    pauseSession = () => {
        this.session_status = 'PAUSED';
    };

    stopSession = () => {
        this.is_session_active = false;
        this.session_status = 'STOPPED';
        this.session_start_time = null;
    };

    updateSessionConfig = (config: Partial<ISessionConfig>) => {
        this.session_config = { ...this.session_config, ...config };
        this.hourly_targets.target_amount = config.hourly_profit_target || this.hourly_targets.target_amount;
    };

    updateMarketPowers = (markets: IMarketPower[]) => {
        this.market_powers = markets;
        this.best_market = markets.length > 0 ? markets[0] : null;
        this.safe_zones = markets.filter((m) => m.confidence > 0.75);
        this.danger_zones = markets.filter((m) => m.confidence < 0.55);

        if (this.auto_market_selection && this.best_market) {
            this.current_market = this.best_market.market_name;
        }
    };

    updatePerformanceStats = (trade_result: 'WIN' | 'LOSS', profit: number) => {
        this.performance_stats.trades_today += 1;

        if (trade_result === 'WIN') {
            this.performance_stats.wins += 1;
            this.performance_stats.current_streak += 1;
            this.performance_stats.total_profit += profit;
            this.hourly_targets.current_profit += profit;
            this.consecutive_losses = 0;
            this.is_recovery_mode = false;
        } else {
            this.performance_stats.losses += 1;
            this.performance_stats.current_streak = 0;
            this.performance_stats.total_profit -= profit;
            this.consecutive_losses += 1;

            if (this.consecutive_losses >= 3 && !this.is_recovery_mode) {
                this.triggerRecoveryMode();
            }
        }

        if (this.performance_stats.current_streak > this.performance_stats.best_streak) {
            this.performance_stats.best_streak = this.performance_stats.current_streak;
        }

        this.performance_stats.win_rate =
            this.performance_stats.trades_today > 0
                ? (this.performance_stats.wins / this.performance_stats.trades_today) * 100
                : 0;

        this.performance_stats.roi =
            this.account_balance > 0
                ? ((this.performance_stats.total_profit / this.account_balance) * 100).toFixed(2) as any
                : 0;
    };

    updateHourlyProgress = () => {
        if (!this.session_start_time) return;

        const now = Date.now();
        const elapsed_ms = now - this.session_start_time;
        const elapsed_hours = elapsed_ms / (1000 * 60 * 60);
        const remaining_hours = Math.max(0, this.session_config.duration_hours - elapsed_hours);
        const remaining_minutes = remaining_hours * 60;

        this.hourly_targets.remaining = Math.max(
            0,
            this.hourly_targets.target_amount - this.hourly_targets.current_profit
        );
        this.hourly_targets.time_remaining_minutes = Math.round(remaining_minutes);
        this.hourly_targets.percentage_achieved =
            (this.hourly_targets.current_profit / this.hourly_targets.target_amount) * 100;

        this.session_target_progress =
            (elapsed_hours / this.session_config.duration_hours) * 100 + this.hourly_targets.percentage_achieved * 0.5;
    };

    placeQuickTrade = (market: string, strategy: string, stake: number) => {
        const trade: IActiveQuickTrade = {
            id: `trade-${Date.now()}`,
            market,
            strategy,
            entry: Math.floor(Math.random() * 100),
            stake,
            profit_loss: 0,
            status: 'PENDING',
            entry_time: Date.now(),
        };
        this.active_trades.push(trade);
    };

    updateTradeStatus = (trade_id: string, status: 'WIN' | 'LOSS', profit: number) => {
        const trade = this.active_trades.find((t) => t.id === trade_id);
        if (trade) {
            trade.status = status;
            trade.profit_loss = profit;
            this.updatePerformanceStats(status, profit);
            this.active_trades = this.active_trades.filter((t) => t.id !== trade_id);
        }
    };

    triggerRecoveryMode = () => {
        this.is_recovery_mode = true;
        this.current_market = this.recovery_market;
        this.current_strategy = this.recovery_strategy;
    };

    updateAIInsights = () => {
        if (this.market_powers.length > 0) {
            this.ai_best_market = this.market_powers[0].market_name;
            this.ai_expected_hourly_return = (Math.random() * 15 + 5).toFixed(1) as any;
        }
    };

    // Computed Properties
    get total_session_target() {
        return this.session_config.duration_hours * this.session_config.hourly_profit_target;
    }

    get remaining_session_time_hours() {
        if (!this.session_start_time) return this.session_config.duration_hours;
        const elapsed_ms = Date.now() - this.session_start_time;
        const elapsed_hours = elapsed_ms / (1000 * 60 * 60);
        return Math.max(0, this.session_config.duration_hours - elapsed_hours);
    }

    get session_progress_percentage() {
        return (
            ((this.session_config.duration_hours - this.remaining_session_time_hours) /
                this.session_config.duration_hours) *
            100
        );
    }

    get is_hourly_target_reached() {
        return this.hourly_targets.current_profit >= this.hourly_targets.target_amount;
    }

    get recommended_stake() {
        return (this.account_balance * (this.session_config.risk_percentage / 100)).toFixed(2) as any;
    }

    get account_roi() {
        if (this.account_balance <= 0) return 0;
        return ((this.performance_stats.total_profit / this.account_balance) * 100).toFixed(2) as any;
    }
}

const quantum24hAutoTraderStore = new Quantum24hAutoTraderStore();
export default quantum24hAutoTraderStore;
