/**
 * Google OAuth 2.0 & Native RFC 8252 PKCE Verifier (`bricks/user-profile/core/oauth/google.verifier.ts`)
 *
 * Extracted from `../SnapCal/server/src/index.js` and `../SnapCal/apps/mobile/lib/google-auth.ts`
 * with zero hardcoded client IDs or domains.
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

/**
 * Computes the RFC 8252 reversed client ID scheme for iOS/Android native Google Sign-In
 * (`12345-abc.apps.googleusercontent.com` -> `com.googleusercontent.apps.12345-abc:/oauth2redirect`).
 */
export function buildGoogleReversedClientIdRedirectUri(iosOrAndroidClientId) {
  if (!iosOrAndroidClientId || typeof iosOrAndroidClientId !== 'string') {
    throw new Error('A valid Google iOS/Android Client ID is required to compute RFC 8252 redirect URI.');
  }
  const prefix = iosOrAndroidClientId.replace(/\.apps\.googleusercontent\.com$/i, '');
  return `com.googleusercontent.apps.${prefix}:/oauth2redirect`;
}

/**
 * Builds the Google OAuth 2.0 authorization URL.
 * Includes the non-regression guard for unverified sensitive scopes (`extraScopesVerified`).
 */
export function buildGoogleAuthUrl({
  clientId,
  redirectUri,
  state,
  extraScopes = [],
  extraScopesVerified = false,
  prompt = 'select_account',
  codeChallenge,
  codeChallengeMethod = 'S256',
}) {
  if (!clientId) throw new Error('Google clientId is required.');
  if (!redirectUri) throw new Error('Google redirectUri is required.');

  const baseScopes = ['openid', 'email', 'profile'];
  const effectiveScopes = extraScopesVerified && Array.isArray(extraScopes) && extraScopes.length > 0
    ? [...new Set([...baseScopes, ...extraScopes])]
    : baseScopes;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: effectiveScopes.join(' '),
    prompt: extraScopesVerified && extraScopes.length > 0 ? 'consent' : prompt,
  });

  if (state) params.set('state', state);
  if (extraScopesVerified && extraScopes.length > 0) {
    params.set('access_type', 'offline');
    params.set('include_granted_scopes', 'true');
  }
  if (codeChallenge) {
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', codeChallengeMethod);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
  codeVerifier,
  fetchFn = globalThis.fetch,
}) {
  if (!code) throw new Error('Google authorization code is required.');
  if (!clientId) throw new Error('Google clientId is required.');
  if (!redirectUri) throw new Error('Google redirectUri is required.');

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  if (clientSecret) params.set('client_secret', clientSecret);
  if (codeVerifier) params.set('code_verifier', codeVerifier);

  const res = await fetchFn(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok || (!data.access_token && !data.id_token)) {
    throw new Error(data.error_description || data.error || `Google token exchange failed: HTTP ${res.status}`);
  }
  return data;
}

export async function authenticateGoogleIdentity({
  code,
  accessToken,
  idToken,
  redirectUri,
  clientId,
  clientSecret,
  codeVerifier,
  fetchFn = globalThis.fetch,
}) {
  let tokenData = { access_token: accessToken, id_token: idToken };

  if (code) {
    tokenData = await exchangeGoogleCodeForTokens({
      code,
      clientId,
      clientSecret,
      redirectUri,
      codeVerifier,
      fetchFn,
    });
  }

  let profile = null;
  if (tokenData.access_token) {
    const res = await fetchFn(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (res.ok) {
      profile = await res.json();
    }
  }

  if (!profile && tokenData.id_token) {
    const parts = tokenData.id_token.split('.');
    if (parts.length === 3) {
      profile = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } else {
      const res = await fetchFn(`${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(tokenData.id_token)}`);
      if (res.ok) profile = await res.json();
    }
  }

  if (!profile || (!profile.sub && !profile.email)) {
    throw new Error('Could not verify Google user identity from token or authorization code.');
  }

  const email = profile.email ? String(profile.email).trim().toLowerCase() : null;
  const fullName = (profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(' ') || '').trim() || undefined;

  return {
    provider: 'google',
    subjectId: String(profile.sub || email),
    email,
    emailVerified: Boolean(profile.email_verified ?? true),
    firstName: profile.given_name,
    lastName: profile.family_name,
    fullName,
    avatarUrl: profile.picture || null,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    idToken: tokenData.id_token,
    expiresInSeconds: tokenData.expires_in ? Number(tokenData.expires_in) : undefined,
    scopes: tokenData.scope ? String(tokenData.scope).split(' ') : ['openid', 'email', 'profile'],
    raw: profile,
  };
}
