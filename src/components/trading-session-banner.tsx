import React from 'react';

/**
 * Shown when the user is signed in but the session cannot place trades — e.g. after an
 * OAuth/OIDC login, which stores a Bearer token while the bot engine trades over the
 * legacy socket authorised by an API token. Without this the bot starts and silently
 * never trades.
 */
const TradingSessionBanner = () => (
    <div
        role='status'
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '10px 16px',
            background: '#3a1214',
            borderBottom: '1px solid #ff444f',
            color: '#ffd9db',
            fontSize: '13px',
            lineHeight: 1.4,
        }}
    >
        <span>
            <strong>Trading is disabled for this session.</strong> Your bot can read the market but
            cannot place trades until you log in with a Deriv API token.
        </span>
        <a
            href='/token'
            style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#ff444f',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap',
            }}
        >
            Log in with API token
        </a>
    </div>
);

export default TradingSessionBanner;
