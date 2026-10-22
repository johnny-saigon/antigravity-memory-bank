/**
 * Microsoft Entra ID & Microsoft Graph OAuth 2.0 Verifier (`bricks/user-profile/core/oauth/microsoft.verifier.ts`)
 *
 * Extracted from `../SnapCal/server/src/services/microsoft-auth.js` and `../SnapCal/server/src/index.js`
 * with zero hardcoded app schemes (`appScheme` parameter replaces `snapcal://`).
 */

import crypto from 'node:crypto';

const DEFAULT_SCOPES = ['openid', 'profile', 'email', 'User.Read', 'offline_access'];

let microsoftJwksCache = {
  keys: null,
  expiresAt: 0,
  tenantId: null,
};

export function resetMicrosoftJwksCache() {
  microsoftJwksCache = { keys: null, expiresAt: 0, tenantId: null };
}

/**
 * Unwraps Microsoft Entra external guest UPNs (`user_domain.com#EXT#@tenant.onmicrosoft.com` -> `user@domain.com`).
 */
export function normalizeMicrosoftGuestEmail(rawEmail = '') {
  let cleaned = String(rawEmail || '').trim();
  if (cleaned && cleaned.includes('#EXT#@')) {
    const prefix = cleaned.split('#EXT#@')[0];
    const lastUnderscore = prefix.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      cleaned = `${prefix.substring(0, lastUnderscore)}@${prefix.substring(lastUnderscore + 1)}`;
    }
  }
  return cleaned.toLowerCase();
}

export function resolveMicrosoftCredentials({
  platform,
  redirectUri,
  fromUrl,
  appScheme = 'app',
  env = process.env,
} = {}) {
  const customSchemePrefix = `${appScheme.replace(/:\/+$/, '')}://`;
  const isMobile =
    platform === 'mobile' ||
    platform === 'ios' ||
    platform === 'android' ||
    Boolean(redirectUri && (redirectUri.startsWith(customSchemePrefix) || redirectUri.startsWith('msauth.'))) ||
    Boolean(fromUrl && (fromUrl.startsWith(customSchemePrefix) || fromUrl.startsWith('msauth.')));

  const tenantId = env.MICROSOFT_TENANT_ID || 'common';

  if (isMobile) {
    const clientId = env.MICROSOFT_MOBILE_CLIENT_ID || env.MICROSOFT_CLIENT_ID || null;
    const clientSecret = env.MICROSOFT_MOBILE_CLIENT_SECRET || null;
    return {
      platform: 'mobile',
      isMobile: true,
      clientId,
      clientSecret,
      tenantId,
    };
  }

  const clientId = env.MICROSOFT_WEB_CLIENT_ID || env.MICROSOFT_CLIENT_ID || null;
  const clientSecret = env.MICROSOFT_WEB_CLIENT_SECRET || env.MICROSOFT_CLIENT_SECRET || null;
  return {
    platform: 'web',
    isMobile: false,
    clientId,
    clientSecret,
    tenantId,
  };
}

export function buildMicrosoftAuthUrl({
  clientId,
  redirectUri,
  state,
  tenantId = 'common',
  scopes = DEFAULT_SCOPES,
  prompt = 'select_account',
  codeChallenge,
  codeChallengeMethod = 'S256',
}) {
  if (!clientId) throw new Error('clientId is required to build Microsoft authorization URL');
  if (!redirectUri) throw new Error('redirectUri is required to build Microsoft authorization URL');

  const effectiveTenant = tenantId || 'common';
  const url = new URL(`https://login.microsoftonline.com/${effectiveTenant}/oauth2/v2.0/authorize`);

  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_mode', 'query');
  url.searchParams.set('scope', Array.isArray(scopes) ? scopes.join(' ') : scopes);

  if (state) url.searchParams.set('state', state);
  if (prompt) url.searchParams.set('prompt', prompt);
  if (codeChallenge) {
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', codeChallengeMethod);
  }

  return url.toString();
}

export async function exchangeMicrosoftCodeForTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
  tenantId = 'common',
  codeVerifier,
  scopes,
  fetchFn = globalThis.fetch,
}) {
  if (!code) throw new Error('Authorization code is required');
  if (!clientId) throw new Error('clientId is required');
  if (!redirectUri) throw new Error('redirectUri is required');

  const effectiveTenant = tenantId || 'common';
  const tokenEndpoint = `https://login.microsoftonline.com/${effectiveTenant}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });
  if (scopes) params.set('scope', Array.isArray(scopes) ? scopes.join(' ') : scopes);
  if (clientSecret) params.set('client_secret', clientSecret);
  if (codeVerifier) params.set('code_verifier', codeVerifier);

  const res = await fetchFn(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error_description || data.error || 'Microsoft token exchange failed');
    err.code = data.error;
    err.status = res.status;
    throw err;
  }

  return data;
}

export async function getMicrosoftUserProfile(accessToken, fetchFn = globalThis.fetch) {
  if (!accessToken) throw new Error('accessToken is required to fetch Microsoft user profile');

  const res = await fetchFn(
    'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,mail,userPrincipalName,otherMails',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error?.message || `Failed to fetch Microsoft Graph user profile: HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const otherMail = Array.isArray(data.otherMails) && data.otherMails.length > 0 ? data.otherMails[0] : null;
  const rawEmail = data.mail || otherMail || data.userPrincipalName || '';
  const email = normalizeMicrosoftGuestEmail(rawEmail);
  const name = data.displayName || [data.givenName, data.surname].filter(Boolean).join(' ') || undefined;

  return {
    id: String(data.id),
    email,
    displayName: data.displayName,
    givenName: data.givenName,
    surname: data.surname,
    name,
    raw: data,
  };
}

export async function getMicrosoftJwks(tenantId = 'common', forceRefresh = false, fetchFn = globalThis.fetch) {
  const now = Date.now();
  const effectiveTenant = tenantId || 'common';

  if (
    !forceRefresh &&
    microsoftJwksCache.keys &&
    microsoftJwksCache.tenantId === effectiveTenant &&
    microsoftJwksCache.expiresAt > now
  ) {
    return microsoftJwksCache.keys;
  }

  const jwksUri = `https://login.microsoftonline.com/${effectiveTenant}/discovery/v2.0/keys`;
  const res = await fetchFn(jwksUri);
  if (!res.ok) {
    throw new Error(`Failed to fetch Microsoft JWKS from ${jwksUri}: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.keys)) {
    throw new Error('Invalid Microsoft JWKS response: missing keys array');
  }

  microsoftJwksCache = {
    keys: data.keys,
    tenantId: effectiveTenant,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };

  return data.keys;
}

export async function verifyMicrosoftIdentityToken(
  idToken,
  {
    clientId,
    tenantId = 'common',
    skipSignatureVerification = false,
    fetchFn = globalThis.fetch,
  } = {}
) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Microsoft identity token is required');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Microsoft identity token: expected 3 dot-separated segments');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec - 60) {
    throw new Error(`Microsoft identity token has expired (exp: ${payload.exp}, now: ${nowSec})`);
  }

  if (clientId && payload.aud !== clientId) {
    throw new Error(`Microsoft token audience mismatch: expected ${clientId}, received ${payload.aud}`);
  }

  if (payload.iss) {
    const isLoginMicrosoft =
      payload.iss.includes('login.microsoftonline.com') ||
      payload.iss.includes('sts.windows.net');
    if (!isLoginMicrosoft) {
      throw new Error(`Invalid Microsoft token issuer: ${payload.iss}`);
    }
  }

  if (!skipSignatureVerification) {
    if (!header.kid) throw new Error('Microsoft token header is missing kid (Key ID)');
    const keys = await getMicrosoftJwks(tenantId, false, fetchFn);
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) throw new Error(`No matching Microsoft JWK found for kid: ${header.kid}`);

    const publicKey = crypto.createPublicKey({ format: 'jwk', key: jwk });
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    const isValid = verifier.verify(publicKey, Buffer.from(signatureB64, 'base64url'));
    if (!isValid) throw new Error('Microsoft identity token signature verification failed');
  }

  const rawEmail = payload.email || payload.preferred_username || payload.upn || payload.unique_name || '';
  const email = normalizeMicrosoftGuestEmail(rawEmail);

  return {
    sub: payload.sub,
    oid: payload.oid,
    tid: payload.tid,
    email,
    name: payload.name,
    aud: payload.aud,
    iss: payload.iss,
    rawPayload: payload,
  };
}

export async function authenticateMicrosoftIdentity({
  code,
  idToken,
  accessToken,
  redirectUri,
  codeVerifier,
  clientId,
  clientSecret,
  tenantId = 'common',
  skipSignatureVerification = false,
  fetchFn = globalThis.fetch,
}) {
  let tokenData = { access_token: accessToken, id_token: idToken };

  if (code) {
    tokenData = await exchangeMicrosoftCodeForTokens({
      code,
      clientId,
      clientSecret,
      redirectUri,
      tenantId,
      codeVerifier,
      fetchFn,
    });
  }

  let profile = null;
  if (tokenData.access_token) {
    try {
      profile = await getMicrosoftUserProfile(tokenData.access_token, fetchFn);
    } catch {}
  }

  let idTokenClaims = null;
  if (tokenData.id_token) {
    idTokenClaims = await verifyMicrosoftIdentityToken(tokenData.id_token, {
      clientId,
      tenantId,
      skipSignatureVerification,
      fetchFn,
    });
  }

  const email = profile?.email || idTokenClaims?.email || null;
  const subjectId = profile?.id || idTokenClaims?.oid || idTokenClaims?.sub;
  if (!subjectId) {
    throw new Error('Could not resolve Microsoft subject ID from Graph or ID token.');
  }

  return {
    provider: 'microsoft',
    subjectId: String(subjectId),
    email,
    emailVerified: Boolean(email),
    firstName: profile?.givenName,
    lastName: profile?.surname,
    fullName: profile?.name || idTokenClaims?.name,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    idToken: tokenData.id_token,
    expiresInSeconds: tokenData.expires_in,
    raw: profile?.raw || idTokenClaims?.rawPayload,
  };
}
