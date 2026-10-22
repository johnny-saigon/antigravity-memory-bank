/**
 * Headless 4-Provider Social OAuth Controller (`bricks/user-profile/platforms/web/headless/useSocialAuth.ts`)
 *
 * Extracted from `../SnapCal/apps/web/src/components/SocialAuthButtons.jsx` and `AuthContext.jsx`.
 * Zero styling—provides provider metadata, redirect/popup triggers, and callback parsing.
 */

export const SOCIAL_PROVIDERS_META = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'microsoft', label: 'Microsoft' },
  { id: 'facebook', label: 'Facebook' },
];

export function parseOAuthCallbackUrl(urlOrSearch = '') {
  if (!urlOrSearch || typeof urlOrSearch !== 'string') {
    return { accessToken: null, error: null, userId: null, email: null };
  }
  const queryString = urlOrSearch.includes('?') ? urlOrSearch.split('?')[1] : urlOrSearch.replace(/^\?/, '');
  const params = new URLSearchParams(queryString);
  return {
    accessToken: params.get('access_token') || params.get('token') || null,
    error: params.get('error_description') || params.get('error') || null,
    userId: params.get('user_id') || null,
    email: params.get('email') || null,
    isNewUser: params.get('is_new_user') === '1' || params.get('is_new_user') === 'true',
  };
}

export function createSocialAuthController({ apiBaseUrl = '', onAuthSuccess, onAuthError } = {}) {
  return {
    providers: SOCIAL_PROVIDERS_META,
    buildStartUrl(provider, { returnTo = '/auth/callback', linkToken = null, popup = false } = {}) {
      if (!['google', 'apple', 'microsoft', 'facebook'].includes(provider)) {
        throw new Error(`Unsupported social OAuth provider: ${provider}`);
      }
      const params = new URLSearchParams({ from_url: returnTo });
      if (linkToken) params.set('link_token', linkToken);
      if (popup) params.set('popup', '1');
      return `${apiBaseUrl.replace(/\/$/, '')}/api/auth/${provider}?${params.toString()}`;
    },
    parseOAuthCallbackUrl,
    async handleCallback(urlOrSearch) {
      const parsed = parseOAuthCallbackUrl(urlOrSearch);
      if (parsed.error) {
        if (onAuthError) onAuthError(new Error(parsed.error));
        return parsed;
      }
      if (parsed.accessToken && onAuthSuccess) {
        await onAuthSuccess(parsed);
      }
      return parsed;
    },
  };
}

export function createUseSocialAuthHook(React) {
  return function useSocialAuth({ apiBaseUrl = '', returnTo = '/auth/callback', onAuthSuccess, onAuthError } = {}) {
    const [activeProvider, setActiveProvider] = React.useState(null);
    const [error, setError] = React.useState(null);
    const controller = React.useMemo(
      () => createSocialAuthController({ apiBaseUrl, onAuthSuccess, onAuthError }),
      [apiBaseUrl, onAuthSuccess, onAuthError]
    );

    const startSocialLogin = React.useCallback(
      (provider, options = {}) => {
        setError(null);
        setActiveProvider(provider);
        const url = controller.buildStartUrl(provider, { returnTo, ...options });
        if (typeof window !== 'undefined' && window.location) {
          window.location.assign(url);
        }
        return url;
      },
      [controller, returnTo]
    );

    return {
      providers: controller.providers,
      activeProvider,
      error,
      startSocialLogin,
      parseOAuthCallbackUrl: controller.parseOAuthCallbackUrl,
    };
  };
}
