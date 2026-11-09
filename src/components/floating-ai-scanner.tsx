import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { Activity, Brain, ChevronDown, ChevronUp, Loader2, RefreshCw, X, Zap } from 'lucide-react'
import AnalysisEngine from '@/lib/analysis-engine'
import { DerivWebSocketManager } from '@/lib/deriv-websocket-manager'
import { useStore } from '@/hooks/useStore'
import { FREE_BOTS_DATA } from '@/pages/free-bots/free-bots-data'
import { DBOT_TABS } from '@/constants/bot-contents'
import './floating-ai-scanner.scss'

type ScanResult = {
    symbol: string
    displayName: string
    strategy: string
    signal: 'TRADE NOW' | 'WAIT' | 'SKIP'
    direction: string
    entryCondition: string
    confidence: number
    targetDigit?: number
    ticksAnalyzed: number
    evenPct: number
    oddPct: number
    highPct: number
    lowPct: number
}

type ScanStrategyKey = 'even_odd' | 'over_under' | 'matches' | 'differs'

const STRATEGIES: { id: ScanStrategyKey; label: string; icon: string }[] = [
    { id: 'even_odd', label: 'Even/Odd', icon: '⚖️' },
    { id: 'over_under', label: 'Over/Under 4.5', icon: '📊' },
    { id: 'matches', label: 'Matches Digit', icon: '🎯' },
    { id: 'differs', label: 'Differs Digit', icon: '⚡' },
]

const STRATEGY_TO_SIGNAL_TYPE: Record<ScanStrategyKey, string> = {
    even_odd: 'Even/Odd',
    over_under: 'Over/Under 4.5',
    matches: 'Matches',
    differs: 'Differs',
}

const PIP_SIZES: Record<string, number> = {
    R_10: 3,
    R_25: 2,
    R_50: 4,
    R_75: 4,
    R_100: 2,
    '1HZ10V': 2,
    '1HZ15V': 4,
    '1HZ25V': 2,
    '1HZ30V': 4,
    '1HZ50V': 2,
    '1HZ75V': 2,
    '1HZ90V': 4,
    '1HZ100V': 2,
    '1HZ150V': 4,
    '1HZ200V': 3,
    '1HZ250V': 3,
    '1HZ300V': 3,
    '1HA100': 2,
    '1HA200': 2,
    JUMP10: 3,
    JUMP25: 3,
    JUMP50: 3,
    JUMP75: 3,
    JUMP100: 3,
    JD10: 3,
    JD25: 3,
    JD50: 3,
    JD75: 3,
    JD100: 3,
}

function getPipSize(symbol: string): number {
    return PIP_SIZES[symbol] ?? 2
}

function getSignalBadgeClass(signal: string): string {
    if (signal === 'TRADE NOW') return 'floating-ai-scanner__badge floating-ai-scanner__badge--trade-now'
    if (signal === 'WAIT') return 'floating-ai-scanner__badge floating-ai-scanner__badge--wait'
    return 'floating-ai-scanner__badge floating-ai-scanner__badge--skip'
}

function deriveDirection(signalType: string, analysis: any): string {
    switch (signalType) {
        case 'Even/Odd':
            return analysis.evenPercentage >= analysis.oddPercentage ? 'EVEN' : 'ODD'
        case 'Over/Under 4.5':
            return analysis.highPercentage >= analysis.lowPercentage ? 'OVER 4' : 'UNDER 5'
        case 'Matches':
            return `MATCHES ${analysis.powerIndex?.strongest ?? '—'}`
        case 'Differs':
            return `DIFFERS ${analysis.powerIndex?.weakest ?? '—'}`
        default:
            return '—'
    }
}

export default function FloatingAIScanner() {
    const store = useStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const [selectedStrategies, setSelectedStrategies] = useState<ScanStrategyKey[]>(['even_odd', 'over_under'])
    const [availableSymbols, setAvailableSymbols] = useState<any[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [progress, setProgress] = useState(0)
    const [progressLabel, setProgressLabel] = useState('')
    const [results, setResults] = useState<ScanResult[]>([])
    const [error, setError] = useState<string | null>(null)
    const [position, setPosition] = useState({ x: 100, y: 100 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const positionStart = useRef({ x: 0, y: 0 })
    const abortRef = useRef(false)

    const continuousSymbols = availableSymbols.filter((symbol: any) => {
        const id = String(symbol.symbol || '').toUpperCase()
        return /^(R_|1HZ|1HA|JUMP|JD)/.test(id)
    })

    useEffect(() => {
        if (typeof window === 'undefined') return
        setPosition({
            x: window.innerWidth - 440,
            y: window.innerHeight - 660,
        })
    }, [])

    useEffect(() => {
        if (!isOpen) return
        fetchAvailableSymbols()
    }, [isOpen])

    useEffect(() => {
        if (!isDragging) return
        const handleMove = (event: MouseEvent) => {
            const dx = event.clientX - dragStart.current.x
            const dy = event.clientY - dragStart.current.y
            setPosition({ x: positionStart.current.x + dx, y: positionStart.current.y + dy })
        }
        const handleUp = () => setIsDragging(false)
        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', handleUp)
        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mouseup', handleUp)
        }
    }, [isDragging])

    const fetchAvailableSymbols = async () => {
        setError(null)
        try {
            const manager = DerivWebSocketManager.getInstance()
            await manager.connect()
            const symbols = await manager.getActiveSymbols()
            setAvailableSymbols(symbols)
        } catch (err) {
            setError('Unable to load market list. Try again later.')
        }
    }

    const toggleMarket = (symbol: string) => {
        setSelected(prev => (prev.includes(symbol) ? prev.filter(item => item !== symbol) : [...prev, symbol]))
    }

    const toggleStrategy = (id: ScanStrategyKey) => {
        setSelectedStrategies(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
    }

    const handleScanAll = () => setSelected(continuousSymbols.map(item => item.symbol))
    const handleClear = () => setSelected([])

    const handleScan = useCallback(async () => {
        if (selected.length === 0) {
            setError('Select at least one market.')
            return
        }
        if (selectedStrategies.length === 0) {
            setError('Select at least one strategy.')
            return
        }

        setError(null)
        setIsScanning(true)
        setProgress(0)
        setProgressLabel('Preparing scan…')
        setResults([])
        abortRef.current = false

        const manager = DerivWebSocketManager.getInstance()
        try {
            await manager.connect()
        } catch {
            setError('Unable to connect to Deriv.')
            setIsScanning(false)
            return
        }

        const collected: ScanResult[] = []
        const total = selected.length

        for (let i = 0; i < total; i += 1) {
            if (abortRef.current) break
            const symbol = selected[i]
            const market = continuousSymbols.find(item => item.symbol === symbol)
            const displayName = market?.display_name || symbol
            setProgressLabel(`Scanning ${displayName}…`)
            setProgress(Math.round((i / total) * 100))

            try {
                const history = await manager.getTicksHistory(symbol, 200)
                const engine = new AnalysisEngine(200)
                history.forEach(tick => {
                    engine.addTick(tick.quote, tick.pip_size || getPipSize(symbol))
                })
                const analysis = engine.getAnalysis()
                const signals = engine.generateSignals()
                const requestedTypes = selectedStrategies.map(key => STRATEGY_TO_SIGNAL_TYPE[key])
                const matching = signals.filter(signal => requestedTypes.includes(signal.type))
                if (matching.length === 0) {
                    continue
                }
                const bestSignal = matching.reduce((best, next) => (next.probability > best.probability ? next : best), matching[0])
                const scanResult: ScanResult = {
                    symbol,
                    displayName,
                    strategy: bestSignal.type,
                    signal: bestSignal.status === 'TRADE NOW' ? 'TRADE NOW' : bestSignal.status === 'WAIT' ? 'WAIT' : 'SKIP',
                    direction: deriveDirection(bestSignal.type, analysis),
                    entryCondition: bestSignal.entryCondition,
                    confidence: Math.round(bestSignal.probability),
                    targetDigit: bestSignal.targetDigit,
                    ticksAnalyzed: history.length,
                    evenPct: Math.round(analysis.evenPercentage),
                    oddPct: Math.round(analysis.oddPercentage),
                    highPct: Math.round(analysis.highPercentage),
                    lowPct: Math.round(analysis.lowPercentage),
                }
                collected.push(scanResult)
            } catch {
                // skip markets that fail to fetch
            }
            await new Promise(resolve => setTimeout(resolve, 150))
        }

        collected.sort((a, b) => {
            const order = { 'TRADE NOW': 0, WAIT: 1, SKIP: 2 }
            return order[a.signal] - order[b.signal] || b.confidence - a.confidence
        })

        setResults(collected)
        setProgress(100)
        setProgressLabel(`Finished scanning ${collected.length} symbols`)
        setIsScanning(false)
    }, [selected, selectedStrategies, continuousSymbols])

    const handleStop = () => {
        abortRef.current = true
        setIsScanning(false)
        setProgressLabel('Scan stopped')
    }

    const findBotForResult = (result: ScanResult) => {
        const s = result.strategy.toLowerCase()
        if (s.includes('over')) {
            return FREE_BOTS_DATA.find(b => /Over_0_Bot|Over_1_Bot|Over_2_Bot|Over_3_Bot|Over_Under_Bot/i.test(b.xmlPath))
                || FREE_BOTS_DATA.find(b => /Over_Under/i.test(b.xmlPath))
        }
        if (s.includes('even') || s.includes('odd')) {
            return FREE_BOTS_DATA.find(b => /Even_Odd_Bot|Even_Odd_Auto_Switcher/i.test(b.xmlPath))
        }
        if (s.includes('differs')) {
            return FREE_BOTS_DATA.find(b => /Differs_Bot/i.test(b.xmlPath))
        }
        if (s.includes('matches')) {
            return FREE_BOTS_DATA.find(b => /Matches_Bot/i.test(b.xmlPath))
        }
        return FREE_BOTS_DATA.find(b => b.id === 'premium-speedbot' || /SPEED BOT updated/i.test(b.xmlPath))
            || FREE_BOTS_DATA[0]
    }

    const handleAutoLoadStart = async (result: ScanResult) => {
        try {
            const bot = findBotForResult(result)
            if (!bot) {
                alert('No matching bot found for this signal')
                return
            }

            // Fetch XML
            const response = await fetch(bot.xmlPath)
            if (!response.ok) throw new Error('Failed to fetch bot XML')
            const xmlString = await response.text()

            // Load into Bot Builder
            await store.load_modal.loadStrategyToBuilder({
                id: bot.id,
                name: bot.name,
                xml: xmlString,
                save_type: 'unsaved',
                timestamp: Date.now(),
            })

            // Switch to Bot Builder tab
            store.dashboard.setActiveTab(DBOT_TABS.BOT_BUILDER)

            // Small delay to ensure workspace updates, then start bot
            setTimeout(() => {
                try {
                    store.run_panel.onRunButtonClick()
                } catch (e) {
                    console.error('Failed to start bot:', e)
                }
            }, 600)
        } catch (e) {
            console.error(e)
            alert('Failed to load and start bot: ' + (e instanceof Error ? e.message : 'unknown'))
        }
    }

    const selectedCount = selected.length
    const totalCount = continuousSymbols.length

    return (
        <div
            className="floating-ai-scanner"
            style={
                {
                    '--scanner-left': isOpen ? `${position.x}px` : 'auto',
                    '--scanner-top': isOpen ? `${position.y}px` : 'auto',
                    '--scanner-right': !isOpen ? '88px' : 'auto',
                    '--scanner-bottom': !isOpen ? '24px' : 'auto',
                    '--scanner-progress': `${progress}%`,
                } as CSSProperties
            }
        >
            {!isOpen ? (
                <button
                    type="button"
                    className="floating-ai-scanner__toggle"
                    onClick={() => setIsOpen(true)}
                    title="Open AI Market Scanner"
                >
                    <Brain className="floating-ai-scanner__toggle-icon" />
                </button>
            ) : (
                <div className="floating-ai-scanner__card">
                    <div className="floating-ai-scanner__header" onMouseDown={event => {
                        if (event.button !== 0) return
                        const target = event.target as HTMLElement
                        if (target.closest('button') || target.closest('input')) return
                        setIsDragging(true)
                        dragStart.current = { x: event.clientX, y: event.clientY }
                        positionStart.current = { ...position }
                        event.preventDefault()
                    }}>
                        <div className="floating-ai-scanner__title-row">
                            <div className="floating-ai-scanner__title-icon"><Brain /></div>
                            <div>
                                <div className="floating-ai-scanner__title">AI Market Scanner</div>
                                <div className="floating-ai-scanner__subtitle">Floating signal scanner for Bot Builder</div>
                            </div>
                        </div>
                        <div className="floating-ai-scanner__header-actions">
                            <button type="button" className="floating-ai-scanner__icon-button" onClick={() => setIsMinimized(prev => !prev)} title={isMinimized ? 'Maximize scanner' : 'Minimize scanner'} aria-label={isMinimized ? 'Maximize scanner' : 'Minimize scanner'}>
                                {isMinimized ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            <button type="button" className="floating-ai-scanner__icon-button" onClick={() => { setIsOpen(false); setIsMinimized(false) }} title="Close scanner" aria-label="Close scanner">
                                <X />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <div className="floating-ai-scanner__body">
                            <div className="floating-ai-scanner__section">
                                <div className="floating-ai-scanner__section-header">
                                    <span>Strategies</span>
                                </div>
                                <div className="floating-ai-scanner__chips">
                                    {STRATEGIES.map(strategy => {
                                        const active = selectedStrategies.includes(strategy.id)
                                        return (
                                            <button
                                                key={strategy.id}
                                                type="button"
                                                className={`floating-ai-scanner__chip ${active ? 'floating-ai-scanner__chip--active' : ''}`}
                                                onClick={() => toggleStrategy(strategy.id)}
                                            >
                                                <span>{strategy.icon}</span> {strategy.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="floating-ai-scanner__section">
                                <div className="floating-ai-scanner__section-header floating-ai-scanner__section-header--spaced">
                                    <span>Markets</span>
                                    <div className="floating-ai-scanner__market-actions">
                                        <button type="button" className="floating-ai-scanner__link" onClick={handleScanAll}>All</button>
                                        {selectedCount > 0 && <button type="button" className="floating-ai-scanner__link" onClick={handleClear}>Clear</button>}
                                    </div>
                                </div>
                                <div className="floating-ai-scanner__market-count">{selectedCount}/{totalCount} selected</div>
                                <div className="floating-ai-scanner__market-grid">
                                    {continuousSymbols.map(symbol => {
                                        const active = selected.includes(symbol.symbol)
                                        return (
                                            <button
                                                key={symbol.symbol}
                                                type="button"
                                                className={`floating-ai-scanner__market-chip ${active ? 'floating-ai-scanner__market-chip--active' : ''}`}
                                                onClick={() => toggleMarket(symbol.symbol)}
                                                title={symbol.display_name || symbol.symbol}
                                            >
                                                {symbol.display_name || symbol.symbol}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {error && <div className="floating-ai-scanner__message floating-ai-scanner__message--error">{error}</div>}

                            {isScanning ? (
                                <div className="floating-ai-scanner__progress-card">
                                    <div className="floating-ai-scanner__progress-row">
                                        <Loader2 className="floating-ai-scanner__spinner" />
                                        <span>{progressLabel}</span>
                                    </div>
                                    <div className="floating-ai-scanner__progress-bar">
                                        <div className="floating-ai-scanner__progress-fill" />
                                    </div>
                                    <div className="floating-ai-scanner__progress-label">{progress}%</div>
                                    <button type="button" className="floating-ai-scanner__button floating-ai-scanner__button--secondary" onClick={handleStop}>Stop</button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="floating-ai-scanner__button floating-ai-scanner__button--primary"
                                    onClick={handleScan}
                                    disabled={selectedCount === 0 || selectedStrategies.length === 0}
                                >
                                    <span>{results.length > 0 ? <RefreshCw className="floating-ai-scanner__button-icon" /> : <Zap className="floating-ai-scanner__button-icon" />}</span>
                                    {results.length > 0 ? 'Re-Scan' : 'Scan Markets'}
                                </button>
                            )}

                            {results.length > 0 ? (
                                <div className="floating-ai-scanner__results">
                                    {results.map((result, index) => (
                                        <div key={`${result.symbol}-${index}`} className={`floating-ai-scanner__result floating-ai-scanner__result--${result.signal.toLowerCase().replace(' ', '-')}`}>
                                            <div className="floating-ai-scanner__result-top">
                                                <div className="floating-ai-scanner__result-icon" />
                                                <div>
                                                    <div className="floating-ai-scanner__result-symbol">{result.displayName}</div>
                                                    <div className="floating-ai-scanner__result-strategy">{result.strategy}</div>
                                                </div>
                                                <span className={getSignalBadgeClass(result.signal)}>{result.signal}</span>
                                            </div>
                                            <div className="floating-ai-scanner__result-meta">
                                                <span>{result.direction}</span>
                                                <span>{result.confidence}%</span>
                                                <span>{result.ticksAnalyzed} ticks</span>
                                            </div>
                                            <div className="floating-ai-scanner__result-entry">{result.entryCondition}</div>
                                            <div className="floating-ai-scanner__result-stats">
                                                <span>Even {result.evenPct}%</span>
                                                <span>Odd {result.oddPct}%</span>
                                                <span>High {result.highPct}%</span>
                                                <span>Low {result.lowPct}%</span>
                                            </div>
                                            <div className="floating-ai-scanner__result-actions">
                                                <button
                                                    type="button"
                                                    className="floating-ai-scanner__button floating-ai-scanner__button--secondary"
                                                    onClick={() => handleAutoLoadStart(result)}
                                                >
                                                    Load & Start Bot
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !isScanning && (
                                    <div className="floating-ai-scanner__empty-state">
                                        <Activity className="floating-ai-scanner__empty-icon" />
                                        <div>Select markets and scan for AI signals.</div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
