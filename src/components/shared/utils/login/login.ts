import { website_name } from '@/utils/site-config';
import { generatePKCE, generateState, storePKCEState } from '@/utils/pkce';
import {
    domain_app_ids,
    getAppId,
    getCurrentProductionDomain,
    DERIV_OAUTH_CLIENT_ID,
    DERIV_OAUTH_AUTHORIZE_URL,
    getOAuthRedirectUri,
} from '../config/config';
import { CookieStorage, isStorageSupported, LocalStore } from '../storage/storage';
import { getStaticUrl, urlForCurrentDomain } from '../url';
import { deriv_urls } from '../url/constants';

/**
 * Builds the Deriv OIDC (auth.deriv.com) authorisation URL with PKCE.
 * The redirect_uri is always `<origin>/callback` — the exact value registered for the
 * OAuth client. Sending anything else (e.g. the current deep path) makes Deriv reject
 * the request, and sending no redirect_uri at all makes it fall back to the client's
 * default, landing the user on a different origin.
 */
export const oauthLoginUrl = async ({ language }: TLoginUrl) => {
    const { code_verifier, code_challenge } = await generatePKCE();
    const state = generateState();
    storePKCEState(code_verifier, state);

    const params = new URLSearchParams({
        app_id: DERIV_OAUTH_CLIENT_ID,
        l: language,
        brand: website_name.toLowerCase(),
        redirect_uri: getOAuthRedirectUri(),
        response_type: 'code',
        state,
        code_challenge,
        code_challenge_method: 'S256',
    });

    const url = `${DERIV_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
    console.log('[Login] OAuth authorize URL:', url);
    return url;
};

export const redirectToLogin = (is_logged_in: boolean, language: string, has_params = true, redirect_delay = 0) => {
    if (!is_logged_in && isStorageSupported(sessionStorage)) {
        const l = window.location;
        const redirect_url = has_params ? window.location.href : `${l.protocol}//${l.host}${l.pathname}`;
        sessionStorage.setItem('redirect_url', redirect_url);
        setTimeout(async () => {
            try {
                const new_href = DERIV_OAUTH_CLIENT_ID
                    ? await oauthLoginUrl({ language })
                    : loginUrl({ language });
                window.location.href = new_href;
            } catch (error) {
                console.error('[Login] Failed to start OAuth flow, falling back to legacy login:', error);
                window.location.href = loginUrl({ language });
            }
        }, redirect_delay);
    }
};

export const redirectToSignUp = () => {
    window.open(getStaticUrl('/signup/'));
};

type TLoginUrl = {
    language: string;
};

export const loginUrl = ({ language }: TLoginUrl) => {
    const server_url = LocalStore.get('config.server_url');
    const signup_device_cookie = new CookieStorage('signup_device');
    const signup_device = signup_device_cookie.get('signup_device');
    const date_first_contact_cookie = new CookieStorage('date_first_contact');
    const date_first_contact = date_first_contact_cookie.get('date_first_contact');
    const marketing_queries = `${signup_device ? `&signup_device=${signup_device}` : ''}${
        date_first_contact ? `&date_first_contact=${date_first_contact}` : ''
    }`;
    const getOAuthUrl = () => {
        // NOTE: the OIDC flow (auth.deriv.com) is handled by oauthLoginUrl() above.
        // oauth.deriv.com/oauth2/authorize now 301s to deriv.com and cannot complete a login.
        const current_domain = getCurrentProductionDomain();
        let oauth_domain = deriv_urls.DERIV_HOST_NAME;

        if (current_domain) {
            // Extract domain suffix (e.g., 'deriv.me' from 'dbot.deriv.me')
            const domain_suffix = current_domain.replace(/^[^.]+\./, '');

            // Only use custom oauth domain for known derivations, otherwise default to deriv.com
            // This prevents issues on vercel.app or other custom domains
            if (['deriv.me', 'deriv.be', 'deriv.com'].includes(domain_suffix)) {
                oauth_domain = domain_suffix;
            }
        }

        // Force redirect to current origin to avoid localhost default
        // Normalize: remove trailing slash from pathname if it's just '/'
        // Example: 'https://site.com/' -> 'https://site.com'
        const pathname = window.location.pathname === '/' ? '' : window.location.pathname;
        const redirect_uri = `${window.location.protocol}//${window.location.host}${pathname}`;
        const redirect_param = `&redirect_uri=${redirect_uri}`;

        const url = `https://oauth.${oauth_domain}/oauth2/authorize?app_id=${getAppId()}&l=${language}${marketing_queries}&brand=${website_name.toLowerCase()}${redirect_param}`;

        console.log('[Login] Redirect URI:', redirect_uri);
        console.log('[Login] App ID:', getAppId());

        return url;
    };

    if (server_url && /qa/.test(server_url)) {
        const redirect_param = `&redirect_uri=${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        return `https://${server_url}/oauth2/authorize?app_id=${getAppId()}&l=${language}${marketing_queries}&brand=${website_name.toLowerCase()}${redirect_param}`;
    }

    if (getAppId() === domain_app_ids[window.location.hostname as keyof typeof domain_app_ids]) {
        return getOAuthUrl();
    }
    return urlForCurrentDomain(getOAuthUrl());
};
