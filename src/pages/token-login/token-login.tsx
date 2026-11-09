import React, { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';

/**
 * API-token login.
 *
 * The bot engine places trades over Deriv's legacy WebSocket, which authorises with an
 * API token (`authToken`). The OAuth/OIDC flow stores a Bearer token instead, so a user
 * who logs in that way can see their account but has no permission to trade — clicking
 * Run produces no trades. This page gives a direct, working trading session:
 * paste a token from app.deriv.com/account/api-token (scopes: read + trade) and the bot
 * is authorised immediately.
 *
 * Also accepts `/token?token=a1-xxx` for a one-click link.
 */
const TokenLogin = () => {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [is_busy, setIsBusy] = useState(false);

    const persistSession = useCallback(
        (value: string, authorize: Record<string, any>) => {
            const loginid = authorize.loginid as string;
            const currency = (authorize.currency as string) || '';

            localStorage.setItem('authToken', value);
            localStorage.setItem('active_loginid', loginid);
            localStorage.setItem('accountsList', JSON.stringify({ [loginid]: value }));
            localStorage.setItem(
                'clientAccounts',
                JSON.stringify({ [loginid]: { loginid, token: value, currency } })
            );
            if (authorize.account_list) {
                localStorage.setItem('client_account_details', JSON.stringify(authorize.account_list));
            }
            if (authorize.country) localStorage.setItem('client.country', authorize.country);

            // Force the engine onto the stack this session can actually trade with.
            localStorage.setItem('API_MODE', 'legacy');
            Cookies.set('logged_state', 'true', { expires: 30, path: '/' });
        },
        []
    );

    const login = useCallback(
        async (raw_token: string) => {
            const value = raw_token.trim();
            if (!value) {
                setError('Paste your Deriv API token to continue.');
                return;
            }

            setIsBusy(true);
            setError('');
            const api = generateDerivApiInstance();

            try {
                const { authorize, error: auth_error } = await api.authorize(value);

                if (auth_error || !authorize) {
                    setError(
                        (auth_error as { message?: string })?.message ||
                            'That token was rejected. Create a new one with read + trade scopes.'
                    );
                    return;
                }

                persistSession(value, authorize);
                window.location.assign('/');
            } catch (e) {
                setError((e as Error).message || 'Login failed. Check the token and your connection.');
            } finally {
                setIsBusy(false);
                try {
                    api.disconnect();
                } catch {
                    /* noop */
                }
            }
        },
        [persistSession]
    );

    useEffect(() => {
        const from_url = new URLSearchParams(window.location.search).get('token');
        if (from_url) {
            setToken(from_url);
            login(from_url);
        }
    }, [login]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0e0e0e',
                color: '#fff',
                padding: '24px',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            <form
                onSubmit={e => {
                    e.preventDefault();
                    login(token);
                }}
                style={{
                    width: '100%',
                    maxWidth: '460px',
                    background: '#1b1b1b',
                    border: '1px solid #2c2c2c',
                    borderRadius: '12px',
                    padding: '28px',
                }}
            >
                <h1 style={{ fontSize: '20px', margin: '0 0 8px' }}>Log in with an API token</h1>
                <p style={{ fontSize: '14px', color: '#a8a8a8', margin: '0 0 20px', lineHeight: 1.5 }}>
                    Bots place trades with an API token. Create one at{' '}
                    <a
                        href='https://app.deriv.com/account/api-token'
                        target='_blank'
                        rel='noreferrer'
                        style={{ color: '#ff444f' }}
                    >
                        app.deriv.com/account/api-token
                    </a>{' '}
                    with <strong>Read</strong> and <strong>Trade</strong> permissions, then paste it below.
                </p>

                <label htmlFor='deriv-api-token' style={{ fontSize: '13px', color: '#a8a8a8' }}>
                    API token
                </label>
                <input
                    id='deriv-api-token'
                    type='password'
                    autoComplete='off'
                    spellCheck={false}
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder='a1-xxxxxxxxxxxxxxxxxxxxxxxxx'
                    style={{
                        width: '100%',
                        margin: '6px 0 16px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #3a3a3a',
                        background: '#111',
                        color: '#fff',
                        fontFamily: 'monospace',
                    }}
                />

                {error && (
                    <p role='alert' style={{ color: '#ff6b6b', fontSize: '13px', margin: '0 0 12px' }}>
                        {error}
                    </p>
                )}

                <button
                    type='submit'
                    disabled={is_busy}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: is_busy ? '#5a1a1e' : '#ff444f',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: is_busy ? 'progress' : 'pointer',
                    }}
                >
                    {is_busy ? 'Authorising…' : 'Log in and start trading'}
                </button>

                <p style={{ fontSize: '12px', color: '#777', margin: '16px 0 0', lineHeight: 1.5 }}>
                    The token is kept in this browser only. Prefer a demo (virtual) account token
                    while you test your bot.
                </p>
            </form>
        </div>
    );
};

export default TokenLogin;
