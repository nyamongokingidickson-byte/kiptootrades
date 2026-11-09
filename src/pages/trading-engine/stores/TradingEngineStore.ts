import { makeObservable, observable, action, computed } from 'mobx';

export interface ITick {
    tick_time: number;
    tick: number;
}

export interface IMarketAnalysis {
    market_name: string;
    total_ticks: number;
    over_count: number;
    under_count: number;
    over_percentage: number;
    under_percentage: number;
    highest_digit_over: number;
    highest_digit_under: number;
    digit_distribution: { [key: number]: number };
    last_15_ticks: number[];
    last_ticks_trend: 'over' | 'under' | 'neutral';
}

export interface ITradeSignal {
    market_name: string;
    strategy: string;
    signal_type: 'over' | 'under' | 'even' | 'odd' | 'differs' | 'matches' | 'rise' | 'fall' | 'high' | 'low';
    confidence: number;
    entry_point: number;
    entry_digit: number;
    warning: string | null;
    skip_ticks: number;
    analysis_summary: string;
}

export interface ITradeOrder {
    id: string;
    market: string;
    trade_type: string;
    contract_type: string;
    ticks: number;
    entry_point: number;
    stake: number;
    martingale_enabled: boolean;
    martingale_multiplier: number;
    tp: number;
    sl: number;
    is_auto: boolean;
    status: 'pending' | 'active' | 'won' | 'lost' | 'cancelled';
    entry_time: number;
    exit_time?: number;
    profit_loss: number;
}

export interface ITransactionHistory {
    total_runs: number;
    total_wins: number;
    total_loss: number;
    total_stake: number;
    total_profit: number;
    consecutive_losses: number;
    win_rate: number;
}

class TradingEngineStore {
    // Markets & Ticks
    markets: string[] = [];
    selected_markets: string[] = [];
    auto_analyze_all_markets = true;
    current_ticks: { [market: string]: ITick[] } = {};
    market_analysis: { [market: string]: IMarketAnalysis } = {};

    // Strategy & Signals
    selected_strategy: string = 'over_under';
    trade_signals: { [market: string]: ITradeSignal } = {};
    all_strategies = [
        'over_under',
        'even_odd',
        'differs',
        'matches',
        'accumulators',
        'rise_fall',
        'high_low',
    ];

    // Trading
    active_orders: ITradeOrder[] = [];
    pending_orders: ITradeOrder[] = [];
    transaction_history: ITransactionHistory = {
        total_runs: 0,
        total_wins: 0,
        total_loss: 0,
        total_stake: 0,
        total_profit: 0,
        consecutive_losses: 0,
        win_rate: 0,
    };

    // Recovery & Auto-Switch
    auto_switch_enabled = false;
    consecutive_loss_threshold = 3;
    recovery_market: string | null = null;

    // High Probability Trades
    hp_trades_enabled = false;
    hp_trades_hours: { start: number; end: number } = { start: 0, end: 24 };
    hp_trades_target_per_hour: number = 3;
    hp_trades_risk_percentage: number = 2;
    hp_trades_stop_loss_count: number = 5;
    hp_trades_use_martingale = false;

    // UI State
    active_subtab: 'analysis' | 'trading_console' | 'hp_trades' = 'analysis';
    is_trading_active = false;

    constructor() {
        makeObservable(this, {
            // Markets & Ticks
            markets: observable,
            selected_markets: observable,
            auto_analyze_all_markets: observable,
            current_ticks: observable,
            market_analysis: observable,

            // Strategy
            selected_strategy: observable,
            trade_signals: observable,

            // Trading
            active_orders: observable,
            pending_orders: observable,
            transaction_history: observable,

            // Recovery
            auto_switch_enabled: observable,
            consecutive_loss_threshold: observable,
            recovery_market: observable,

            // HP Trades
            hp_trades_enabled: observable,
            hp_trades_hours: observable,
            hp_trades_target_per_hour: observable,
            hp_trades_risk_percentage: observable,
            hp_trades_stop_loss_count: observable,
            hp_trades_use_martingale: observable,

            // UI
            active_subtab: observable,
            is_trading_active: observable,

            // Actions
            setMarkets: action,
            updateMarketAnalysis: action,
            setStrategy: action,
            addTradeSignal: action,
            placeOrder: action,
            updateOrderStatus: action,
            updateTransactionHistory: action,
            setAutoSwitch: action,
            setHPTradesConfig: action,
            setActiveSubtab: action,

            // Computed
            primary_market: computed,
            best_signal: computed,
            profit_loss_color: computed,
        });
    }

    setMarkets = (markets: string[]) => {
        this.markets = markets;
    };

    updateMarketAnalysis = (market: string, analysis: IMarketAnalysis) => {
        this.market_analysis[market] = analysis;
    };

    setStrategy = (strategy: string) => {
        this.selected_strategy = strategy;
    };

    addTradeSignal = (market: string, signal: ITradeSignal) => {
        this.trade_signals[market] = signal;
    };

    placeOrder = (order: ITradeOrder) => {
        this.active_orders.push(order);
    };

    updateOrderStatus = (order_id: string, status: 'won' | 'lost' | 'cancelled', profit_loss: number) => {
        const order = this.active_orders.find((o) => o.id === order_id);
        if (order) {
            order.status = status;
            order.profit_loss = profit_loss;
            order.exit_time = Date.now();

            this.transaction_history.total_runs++;
            this.transaction_history.total_stake += order.stake;
            this.transaction_history.total_profit += profit_loss;

            if (status === 'won') {
                this.transaction_history.total_wins++;
                this.transaction_history.consecutive_losses = 0;
            } else if (status === 'lost') {
                this.transaction_history.total_loss++;
                this.transaction_history.consecutive_losses++;
            }

            this.transaction_history.win_rate =
                (this.transaction_history.total_wins / this.transaction_history.total_runs) * 100;

            this.active_orders = this.active_orders.filter((o) => o.id !== order_id);
        }
    };

    updateTransactionHistory = (data: Partial<ITransactionHistory>) => {
        this.transaction_history = { ...this.transaction_history, ...data };
    };

    setAutoSwitch = (enabled: boolean, threshold: number = 3, recovery_market: string | null = null) => {
        this.auto_switch_enabled = enabled;
        this.consecutive_loss_threshold = threshold;
        this.recovery_market = recovery_market;
    };

    setHPTradesConfig = (config: Partial<typeof this>) => {
        Object.assign(this, config);
    };

    setActiveSubtab = (subtab: 'analysis' | 'trading_console' | 'hp_trades') => {
        this.active_subtab = subtab;
    };

    get primary_market(): string {
        return this.selected_markets[0] || this.markets[0] || '';
    }

    get best_signal(): ITradeSignal | null {
        const signals = Object.values(this.trade_signals);
        if (signals.length === 0) return null;
        return signals.reduce((best, current) =>
            current.confidence > best.confidence ? current : best
        );
    }

    get profit_loss_color(): string {
        if (this.transaction_history.total_profit > 0) return 'success';
        if (this.transaction_history.total_profit < 0) return 'danger';
        return 'neutral';
    }
}

export const tradingEngineStore = new TradingEngineStore();
export default tradingEngineStore;
