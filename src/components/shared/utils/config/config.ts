import { isStaging } from '../url/helpers';

export const DERIV_NEW_AUTH_URL = 'https://auth.deriv.com/oauth2/auth';
export const DERIV_OAUTH_AUTHORIZE_URL = 'https://auth.deriv.com/oauth2/authorize';
export const DERIV_NEW_TOKEN_URL = 'https://auth.deriv.com/oauth2/token';
export const API_MODE: 'legacy' | 'new' = 'legacy';

/**
 * Which API stack the session can actually use.
 *
 * The bot engine trades over the legacy Deriv WebSocket, which is authorised with an
 * API token stored in `authToken`. The OAuth/OIDC login stores a Bearer token in
 * `new_api_access_token` instead. Picking the stack from the stored credentials (rather
 * than the constant above) is what stops a logged-in user from running a bot that has
 * no trading permission: previously the build was pinned to 'legacy', so an OIDC session
 * produced ticks but every buy was rejected.
 */
export const getApiMode = (): 'legacy' | 'new' => {
    try {
        const stored = window.localStorage.getItem('API_MODE');
        const has_legacy_token = !!window.localStorage.getItem('authToken');
        const has_new_token = !!window.localStorage.getItem('new_api_access_token');

        if (has_legacy_token && !has_new_token) return 'legacy';
        if (has_new_token && !has_legacy_token) return 'new';
        if (has_legacy_token && has_new_token) return stored === 'new' ? 'new' : 'legacy';
        return stored === 'new' ? 'new' : API_MODE;
    } catch {
        return API_MODE;
    }
};

/** True when a session exists but the trading socket has no permission to place trades. */
export const hasTradingCredentials = () => {
    try {
        return !!window.localStorage.getItem('authToken') || !!window.localStorage.getItem('new_api_access_token');
    } catch {
        return false;
    }
};

/**
 * OAuth2 client used for the Deriv OIDC login flow (auth.deriv.com).
 * Overridable per-deployment with VITE_DERIV_OAUTH_CLIENT_ID.
 * The redirect URI registered for this client must be `<origin>/callback`,
 * which is what `getOAuthRedirectUri()` produces.
 */
export const DERIV_OAUTH_CLIENT_ID = process.env.VITE_DERIV_OAUTH_CLIENT_ID || '343L8uHEkfWwA0GctDOSC';

export const OAUTH_REDIRECT_PATH = '/callback';

/** The redirect_uri sent to Deriv — must match the value registered for the OAuth client. */
export const getOAuthRedirectUri = () => `${window.location.origin}${OAUTH_REDIRECT_PATH}`;

export const APP_IDS = {
    LOCALHOST: 36300,
    TMP_STAGING: 121856,
    STAGING: 121856,
    STAGING_BE: 121856,
    STAGING_ME: 121856,
    PRODUCTION: 121856,
    PRODUCTION_BE: 121856,
    PRODUCTION_ME: 121856,
    VERCEL: 121856,
};

export const livechat_license_id = 12049137;
export const livechat_client_id = '66aa088aad5a414484c1fd1fa8a5ace7';

export const domain_app_ids = {
    'master.bot-standalone.pages.dev': APP_IDS.TMP_STAGING,
    'staging-dbot.deriv.com': APP_IDS.STAGING,
    'staging-dbot.deriv.be': APP_IDS.STAGING_BE,
    'staging-dbot.deriv.me': APP_IDS.STAGING_ME,
    'dbot.deriv.com': APP_IDS.PRODUCTION,
    'dbot.deriv.be': APP_IDS.PRODUCTION_BE,
    'dbot.deriv.me': APP_IDS.PRODUCTION_ME,
    '22-dec.vercel.app': APP_IDS.VERCEL,
    'dylantrades.vercel.app': APP_IDS.VERCEL,
    'dylantrades.site': APP_IDS.PRODUCTION,
};

export const getCurrentProductionDomain = () =>
    !/^staging\./.test(window.location.hostname) &&
    Object.keys(domain_app_ids).find(domain => window.location.hostname === domain);

export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = () => {
    return (
        window.location.origin?.includes('.binary.sx') ||
        window.location.origin?.includes('bot-65f.pages.dev') ||
        isLocal()
    );
};

export const isLocal = () =>
    /localhost(:\d+)?$|127\.0\.0\.1(:\d+)?$|0\.0\.0\.0(:\d+)?$/i.test(window.location.hostname);

const getDefaultServerURL = () => {
    return 'ws.derivws.com';
};

export const getDefaultAppIdAndUrl = () => {
    const server_url = getDefaultServerURL();

    if (isTestLink()) {
        return { app_id: APP_IDS.LOCALHOST, server_url };
    }

    const current_domain = getCurrentProductionDomain() ?? '';
    const app_id = domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;

    return { app_id, server_url };
};

export const getAppId = () => {
    // 1. Priority: Environment Variable (Deployment)
    const env_app_id =
        process.env.VITE_APP_ID ||
        (import.meta as unknown as { env: { VITE_APP_ID: string } }).env?.VITE_APP_ID ||
        process.env.REACT_APP_Deriv_APP_ID;

    if (env_app_id) {
        console.log('[Config] Using App ID from environment variable:', env_app_id);
        return String(env_app_id);
    }

    let app_id = null;
    const config_app_id = window.localStorage.getItem('config.app_id');
    const current_domain = getCurrentProductionDomain() ?? '';

    // 2. Priority: LocalStorage Override (Endpoint Page)
    if (config_app_id) {
        app_id = config_app_id;
    }
    // 3. Priority: Staging/Test Environments
    else if (isStaging()) {
        app_id = APP_IDS.STAGING;
    } else if (isTestLink()) {
        app_id = APP_IDS.LOCALHOST;
    }
    // 4. Priority: Production / Default
    else {
        app_id = domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;
    }

    return app_id;
};

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    const server_url = getDefaultServerURL();

    return server_url;
};

export const checkAndSetEndpointFromUrl = () => {
    if (isTestLink()) {
        const url_params = new URLSearchParams(location.search.slice(1));

        if (url_params.has('qa_server') && url_params.has('app_id')) {
            const qa_server = url_params.get('qa_server') || '';
            const app_id = url_params.get('app_id') || '';

            url_params.delete('qa_server');
            url_params.delete('app_id');

            if (/^(^(www\.)?qa[0-9]{1,4}\.deriv.dev|(.*)\.derivws\.com)$/.test(qa_server) && /^[0-9]+$/.test(app_id)) {
                localStorage.setItem('config.app_id', app_id);
                localStorage.setItem('config.server_url', qa_server.replace(/"/g, ''));
            }

            const params = url_params.toString();
            const hash = location.hash;

            location.href = `${location.protocol}//${location.hostname}${location.pathname}${params ? `?${params}` : ''
                }${hash || ''}`;

            return true;
        }
    }

    return false;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};

const legacyGenerateOAuthURL = () => {
    const is_local = isLocal();
    const app_id = is_local ? APP_IDS.LOCALHOST : '121856';
    const login_url = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&brand=deriv&redirect=home&state=`;
 
    console.log('[Config] Generated Legacy OAuth URL:', login_url);
    return login_url;
};

export const generateOAuthURL = async () => {
    // Force legacy regardless of requested mode
    return legacyGenerateOAuthURL();
};
