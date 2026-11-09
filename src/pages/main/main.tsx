import React, { lazy, Suspense, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import PageContentWrapper from '@/components/page-content-wrapper';
import { generateOAuthURL } from '@/components/shared';
import { getAppId } from '@/components/shared/utils/config/config';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import useTMB from '@/hooks/useTMB';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedLightbulbCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
    LabelPairedSignalCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import './main.scss';

const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));

// const Bots = lazy(() => import('../bots'));
const SignalsTab = lazy(() => import('../signals/signals-tab'));
const FreeBotsTab = lazy(() => import('../free-bots/free-bots-tab'));
const EasyTool = lazy(() => import('../easy-tool/index'));
const SmartAuto24 = lazy(() => import('../circles-analysis/index'));
const DigitCracker = lazy(() => import('../digit-cracker/index'));
const SignalCentrePage = lazy(() => import('../smart-trading/components/signal-centre-tab'));
const Marketkiller = lazy(() => import('../marketkiller'));
const OverUnderTab = lazy(() => import('../over-under'));
const RiskManagementTab = lazy(() => import('../risk-management'));
const MultiTraderTab = lazy(() => import('../multi-trader'));
const TradingEngineTab = lazy(() => import('../trading-engine'));
const Quantum24hAutoTraderTab = lazy(() => import('../quantum-24h'));
// const DTrader = lazy(() => import('../dtrader/index')); // Removed as per request

const DTraderIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M12 2L2 7L12 12L22 7L12 2Z' fill='url(#dtrader-gradient1)' />
        <path d='M2 17L12 22L22 17L12 12L2 17Z' fill='url(#dtrader-gradient2)' />
        <defs>
            <linearGradient id='dtrader-gradient1' x1='2' y1='2' x2='22' y2='12' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#667eea' />
                <stop offset='1' stopColor='#764ba2' />
            </linearGradient>
            <linearGradient id='dtrader-gradient2' x1='2' y1='17' x2='22' y2='22' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#43a8ff' />
                <stop offset='1' stopColor='#7b5cf7' />
            </linearGradient>
        </defs>
    </svg>
);

const Quantum24hAutoTraderIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='12' cy='12' r='10' fill='url(#quantum-gradient1)' />
        <path d='M12 5V19M5 12H19' stroke='url(#quantum-gradient2)' strokeWidth='2' strokeLinecap='round' />
        <circle cx='12' cy='12' r='3' fill='url(#quantum-gradient3)' />
        <defs>
            <radialGradient id='quantum-gradient1'>
                <stop stopColor='#00ff88' offset='0%' />
                <stop stopColor='#00ccff' offset='100%' />
            </radialGradient>
            <linearGradient id='quantum-gradient2' x1='0%' y1='0%' x2='100%' y2='100%'>
                <stop stopColor='#ff00ff' offset='0%' />
                <stop stopColor='#00ffff' offset='100%' />
            </linearGradient>
            <radialGradient id='quantum-gradient3'>
                <stop stopColor='#ffff00' />
                <stop stopColor='#ff00ff' offset='100%' />
            </radialGradient>
        </defs>
    </svg>
);

const TradingEngineIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' style={{ transition: 'fill 0.3s ease' }}>
        <g fill='url(#engine-gradient1)'>
            <rect x='2' y='2' width='8' height='8' rx='2' />
        </g>
        <g fill='url(#engine-gradient2)'>
            <rect x='14' y='2' width='8' height='8' rx='2' />
        </g>
        <g fill='url(#engine-gradient3)'>
            <rect x='2' y='14' width='8' height='8' rx='2' />
        </g>
        <g fill='url(#engine-gradient4)'>
            <rect x='14' y='14' width='8' height='8' rx='2' />
        </g>
        <defs>
            <linearGradient id='engine-gradient1' x1='2' y1='2' x2='10' y2='10' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#FF6B6B' />
                <stop offset='1' stopColor='#FF8E8E' />
            </linearGradient>
            <linearGradient id='engine-gradient2' x1='14' y1='2' x2='22' y2='10' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#4ECDC4' />
                <stop offset='1' stopColor='#6EE7DF' />
            </linearGradient>
            <linearGradient id='engine-gradient3' x1='2' y1='14' x2='10' y2='22' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#45B7D1' />
                <stop offset='1' stopColor='#6BC9E3' />
            </linearGradient>
            <linearGradient id='engine-gradient4' x1='14' y1='14' x2='22' y2='22' gradientUnits='userSpaceOnUse'>
                <stop stopColor='#F9CA24' />
                <stop offset='1' stopColor='#FDD835' />
            </linearGradient>
        </defs>
    </svg>
);

const DTraderTab = observer(() => {
    const { client } = useStore();

    const loginId = localStorage.getItem('active_loginid') || client.loginid || '';
    const accountsList = JSON.parse(localStorage.getItem('accountsList') || '{}');
    const token = localStorage.getItem('authToken') || accountsList[loginId] || '';

    let currency = 'USD';
    try {
        const activeAccountStr = localStorage.getItem('active_account');
        if (activeAccountStr) {
            const activeAccount = JSON.parse(activeAccountStr);
            currency = activeAccount?.currency || 'USD';
        }
    } catch (e) {
        // ignore invalid local storage
    }

    if (currency === 'USD') {
        currency = client.accounts?.[loginId]?.currency || 'USD';
    }

    const appId = getAppId();
    const iframeSrc = token
        ? `https://deriv-dtrader.vercel.app/dtrader?acct1=${loginId}&token1=${token}&cur1=${currency}&lang=EN&app_id=${appId}`
        : `https://deriv-dtrader.vercel.app/dtrader`;

    return (
        <iframe
            key={token || 'guest'}
            src={iframeSrc}
            title='DTrader'
            width='100%'
            height='100%'
            style={{
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
            scrolling='yes'
            allow='fullscreen; clipboard-write; payment'
        />
    );
});

const DTraderStyles = React.memo(() => (
    <style>{`
        .dtrader-fullscreen {
            position: relative;
            width: 100%;
            height: calc(100vh - 18rem);
            overflow: hidden;
            background: #ffffff;
            margin-top: 2rem;
            margin-bottom: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 768px) {
            .dtrader-fullscreen {
                height: calc(100vh - 14rem);
                margin-top: 1rem;
                margin-bottom: 1rem;
            }
        }
        .dtrader-fullscreen iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            border-radius: 12px;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 1;
            transform: scale(0.98);
            transform-origin: center center;
            transition: transform 0.3s ease;
        }
        .dtrader-fullscreen iframe:hover {
            transform: scale(1);
        }
        #id-dtrader .dc-tabs__content {
            padding: 0 !important;
            margin: 0 !important;
            position: relative;
            height: calc(100vh - 8rem);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        @media (max-width: 768px) {
            #id-dtrader .dc-tabs__content {
                height: calc(100vh - 6rem);
            }
        }
        #id-dtrader .dc-tabs__content > div {
            height: auto;
            min-height: 85%;
            max-height: 95%;
            width: 98%;
            margin: 0 auto;
            position: relative;
        }
        @media (min-width: 1024px) {
            .dtrader-fullscreen {
                height: calc(100vh - 16rem);
                max-width: 1400px;
                margin-left: auto;
                margin-right: auto;
            }
            #id-dtrader .dc-tabs__content > div {
                min-height: 90%;
                max-height: 98%;
                width: 95%;
            }
            .dtrader-fullscreen iframe {
                transform: scale(1);
            }
        }
        @media (min-width: 1600px) {
            .dtrader-fullscreen {
                height: calc(100vh - 14rem);
                max-width: 1600px;
            }
        }
    `}</style>
));

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const { active_tab, active_tour, setActiveTab, setWebSocketState, setActiveTour, setTourDialogVisibility } =
        dashboard;
    const { dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message, dismissable, is_closed_on_cancel } = dialog_options as {
        [key: string]: string;
    };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const [smart_tools_tab, setSmartToolsTab] = React.useState<'smart_auto' | 'digit_cracker'>('smart_auto');
    const hash = [
        'dashboard',
        'bot_builder',
        'chart',
        'easy_tool',
        'free_bots',
        'signals',
        'signal_centre',
        'pro_tool',
        'smart_auto',
        'marketkiller',
        'over_under',
        'risk_management',
        'multi_trader',
        'dtrader',
        'trading_engine',
        'quantum_24h',
    ];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const [left_tab_shadow, setLeftTabShadow] = useState<boolean>(false);
    const [right_tab_shadow, setRightTabShadow] = useState<boolean>(false);

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    const { onRenderTMBCheck, isTmbEnabled } = useTMB();

    const historyShim = {
        replace: (path: string) => navigate(path, { replace: true }),
        location,
    };

    React.useEffect(() => {
        const el_dashboard = document.getElementById('id-dbot-dashboard');
        const el_smart_auto = document.getElementById('id-smart-auto');

        const observer_dashboard = new window.IntersectionObserver(
            ([entry]) => {
                setLeftTabShadow(!entry.isIntersecting);
            },
            { threshold: 0.5 }
        );

        const observer_smart_auto = new window.IntersectionObserver(
            ([entry]) => {
                setRightTabShadow(!entry.isIntersecting);
            },
            { threshold: 0.5 }
        );

        if (el_dashboard) observer_dashboard.observe(el_dashboard);
        if (el_smart_auto) observer_smart_auto.observe(el_smart_auto);

        return () => {
            observer_dashboard.disconnect();
            observer_smart_auto.disconnect();
        };
    }, [setLeftTabShadow, setRightTabShadow]);

    React.useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    // Update tab shadows height to match bot builder height
    const updateTabShadowsHeight = () => {
        const botBuilderEl = document.getElementById('id-bot-builder');
        const leftShadow = document.querySelector('.tabs-shadow--left') as HTMLElement;
        const rightShadow = document.querySelector('.tabs-shadow--right') as HTMLElement;

        if (botBuilderEl && leftShadow && rightShadow) {
            const height = botBuilderEl.offsetHeight;
            leftShadow.style.height = `${height}px`;
            rightShadow.style.height = `${height}px`;
        }
    };

    React.useEffect(() => {
        // Run on mount and when active tab changes
        updateTabShadowsHeight();

        if (is_open) {
            setTourDialogVisibility(false);
        }

        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            navigate(`#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }

        // Prevent scrolling when tutorial tab is active (only on mobile)
        const mainElement = document.querySelector('.main__container');

        document.body.style.overflow = '';
        if (mainElement instanceof HTMLElement) {
            mainElement.classList.remove('no-scroll');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    React.useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (
                active_tab === BOT_BUILDER &&
                (
                    Blockly as typeof Blockly & {
                        derivWorkspace?: { trashcan?: { setTrashcanPosition: (x: number, y: number) => void } };
                    }
                )?.derivWorkspace?.trashcan
            ) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                (
                    Blockly as typeof Blockly & {
                        derivWorkspace?: { trashcan?: { setTrashcanPosition: (x: number, y: number) => void } };
                    }
                )?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id); // Clear the timeout on unmount
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            // Needed to pass this to the Callback Queue as on tab changes
            // document title getting override by 'Bot | Deriv' only
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 10);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active_tab]
    );

    const handleLoginGeneration = async () => {
        try {
            // Check TMB status first
            const tmbEnabled = await isTmbEnabled();
            if (tmbEnabled) {
                await onRenderTMBCheck();
            } else {
                window.location.assign(await generateOAuthURL());
            }
        } catch (error) {
            console.error('Login generation error:', error);
        }
    };
    return (
        <React.Fragment>
            <div
                className={classNames('main', {
                    'main--bot-builder': active_tab === BOT_BUILDER,
                })}
            >
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                        'main__container--bot-builder': active_tab === BOT_BUILDER,
                    })}
                >
                    <div>
                        {!isDesktop && left_tab_shadow && <span className='tabs-shadow tabs-shadow--left' />}{' '}
                        <Tabs
                            active_index={active_tab}
                            className='main__tabs'
                            onTabItemClick={handleTabChange}
                            top
                            history={historyShim as unknown as React.ComponentProps<typeof Tabs>['history']}
                            is_scrollable
                        >
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedObjectsColumnCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Dashboard' />
                                    </div>
                                }
                                id='id-dbot-dashboard'
                            >
                                <Dashboard handleTabChange={handleTabChange} />
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Bot Builder' />
                                    </div>
                                }
                                id='id-bot-builder'
                            >
                                <div id='dbot-workspace-placeholder' />
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedChartLineCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Charts' />
                                    </div>
                                }
                                id='id-charts'
                            >
                                <Suspense
                                    fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}
                                >
                                    <ChartWrapper show_digits_stats={false} />
                                </Suspense>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedLightbulbCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Easy Tool' />
                                    </div>
                                }
                                id='id-easy-tool'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Easy Tool...')} />}>
                                        <EasyTool />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedLightbulbCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Free Bots' />
                                    </div>
                                }
                                id='id-free-bots'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading...')} />}>
                                        <FreeBotsTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedSignalCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='AI Predictions' />
                                    </div>
                                }
                                id='id-signals'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Signals...')} />}>
                                        <SignalsTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedObjectsColumnCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Market Scanner' />
                                    </div>
                                }
                                id='id-signal-centre'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Signal Centre...')} />}>
                                        <SignalCentrePage />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>

                            {/* Smart Tools: SmartAuto + DigitCracker combined */}
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedLightbulbCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Smart Tools' />
                                    </div>
                                }
                                id='id-smart-auto'
                            >
                                <PageContentWrapper>
                                    {/* Smart Tools Sub-Tab Switcher */}
                                    <div className='smart-tools-nav'>
                                        <button
                                            className={`smart-tools-nav__btn smart-tools-nav__btn--auto ${smart_tools_tab === 'smart_auto' ? 'smart-tools-nav__btn--active' : ''}`}
                                            onClick={() => setSmartToolsTab('smart_auto')}
                                        >
                                            <span className='smart-tools-nav__icon'>⚡</span>
                                            <span className='smart-tools-nav__label'>Smart Auto</span>
                                        </button>
                                        <button
                                            className={`smart-tools-nav__btn smart-tools-nav__btn--cracker ${smart_tools_tab === 'digit_cracker' ? 'smart-tools-nav__btn--active' : ''}`}
                                            onClick={() => setSmartToolsTab('digit_cracker')}
                                        >
                                            <span className='smart-tools-nav__icon'>🔬</span>
                                            <span className='smart-tools-nav__label'>Digit Cracker</span>
                                        </button>
                                    </div>
                                    <div
                                        className={`smart-tools-content ${smart_tools_tab === 'smart_auto' ? 'smart-tools-content--visible' : 'smart-tools-content--hidden'}`}
                                    >
                                        <Suspense
                                            fallback={<ChunkLoader message={localize('Loading Smart Auto...')} />}
                                        >
                                            <SmartAuto24 />
                                        </Suspense>
                                    </div>
                                    <div
                                        className={`smart-tools-content ${smart_tools_tab === 'digit_cracker' ? 'smart-tools-content--visible' : 'smart-tools-content--hidden'}`}
                                    >
                                        <Suspense
                                            fallback={<ChunkLoader message={localize('Loading Digit Cracker...')} />}
                                        >
                                            <DigitCracker />
                                        </Suspense>
                                    </div>
                                </PageContentWrapper>
                            </div>
                            {/* Smart Tools: SmartAuto + DigitCracker combined */}

                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedLightbulbCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Marketkiller' />
                                    </div>
                                }
                                id='id-marketkiller'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Marketkiller...')} />}>
                                        <Marketkiller />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>

                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedLightbulbCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Over/Under Analysis' />
                                    </div>
                                }
                                id='id-over-under'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Over/Under Analysis...')} />}>
                                        <OverUnderTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>

                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedLightbulbCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Risk Management' />
                                    </div>
                                }
                                id='id-risk-management'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Risk Management...')} />}>
                                        <RiskManagementTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>

                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <LabelPairedObjectsColumnCaptionRegularIcon
                                            height='20px'
                                            width='20px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Multi Trader' />
                                    </div>
                                }
                                id='id-multi-trader'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Multi Trader...')} />}>
                                        <MultiTraderTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <DTraderIcon />
                                        <Localize i18n_default_text='DTrader' />
                                    </div>
                                }
                                id='id-dtrader'
                            >
                                <PageContentWrapper>
                                    <div className='dtrader-fullscreen'>
                                        <DTraderTab />
                                    </div>
                                </PageContentWrapper>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <TradingEngineIcon />
                                        <Localize i18n_default_text='Trading Engine' />
                                    </div>
                                }
                                id='id-trading-engine'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Trading Engine...')} />}>
                                        <TradingEngineTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>
                            <div
                                label={
                                    <div className='main__tabs-label'>
                                        <Quantum24hAutoTraderIcon />
                                        <Localize i18n_default_text='Quantum 24H' />
                                    </div>
                                }
                                id='id-quantum-24h'
                            >
                                <PageContentWrapper>
                                    <Suspense fallback={<ChunkLoader message={localize('Loading Quantum 24H Auto Trader...')} />}>
                                        <Quantum24hAutoTraderTab />
                                    </Suspense>
                                </PageContentWrapper>
                            </div>
                        </Tabs>
                        <DTraderStyles />
                        {!isDesktop && right_tab_shadow && <span className='tabs-shadow tabs-shadow--right' />}{' '}
                    </div>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick || undefined}
                onClose={onCloseDialog || undefined}
                onConfirm={onOkButtonClick || onCloseDialog || (() => {})}
                portal_element_id='modal_root'
                title={title}
                login={handleLoginGeneration}
                dismissable={!!dismissable} // Prevents closing on outside clicks
                is_closed_on_cancel={!!is_closed_on_cancel}
            >
                {message}
            </Dialog>
        </React.Fragment>
    );
});

export default AppWrapper;
