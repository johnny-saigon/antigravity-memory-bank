/**
 * Meta (Facebook) OAuth 2.0 & Graph API v20.0 Verifier (`bricks/user-profile/core/oauth/facebook.verifier.ts`)
 *
 * Extracted from `../SnapCal/server/src/services/facebook-auth.js` and `../SnapCal/server/src/index.js`
 * with configurable synthetic email domain (`@facebook.<appDomain>`) and GDPR `signed_request`
 * data-deletion callback verification.
 */

import crypto from 'node:crypto';

const DEFAULT_SCOPES = ['public_profile', 'email'];

export function resolveFacebookCredentials({ env = process.env } = {}) {
  const appId = env.META_APP_ID || env.FACEBOOK_APP_ID || null;
  const appSecret = env.META_APP_SECRET || env.FACEBOOK_APP_SECRET || null;
  const scopes = (env.META_OAUTH_SCOPES || DEFAULT_SCOPES.join(','))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { appId, appSecret, scopes };
}

export function buildFacebookAuthUrl({
  clientId,
  redirectUri,
  state,
  scopes = DEFAULT_SCOPES,
  display,
  authType,
}) {
  if (!clientId) throw new Error('clientId is required to build Facebook authorization URL');
  if (!redirectUri) throw new Error('redirectUri is required to build Facebook authorization URL');

  const url = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', Array.isArray(scopes) ? scopes.join(',') : scopes);

  if (state) url.searchParams.set('state', state);
  if (display) url.searchParams.set('display', display);
  if (authType) url.searchParams.set('auth_type', authType);

  return url.toString();
}

export async function exchangeFacebookCodeForToken({
  code,
  clientId,
  clientSecret,
  redirectUri,
  fetchFn = globalThis.fetch,
}) {
  if (!code) throw new Error('Authorization code is required');
  if (!clientId) throw new Error('clientId is required');
  if (!clientSecret) throw new Error('clientSecret is required');
  if (!redirectUri) throw new Error('redirectUri is required');

  const tokenEndpoint = 'https://graph.facebook.com/v20.0/oauth/access_token';
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetchFn(`${tokenEndpoint}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const err = new Error(data.error?.message || `Facebook token exchange failed: HTTP ${res.status}`);
    err.code = data.error?.code;
    err.status = res.status;
    throw err;
  }

  return data;
}

export async function getFacebookUserProfile(
  accessToken,
  {
    fields = 'id,name,first_name,last_name,email,picture.type(large)',
    fetchFn = globalThis.fetch,
  } = {}
) {
  if (!accessToken) throw new Error('accessToken is required to fetch Facebook user profile');

  const url = `https://graph.facebook.com/v20.0/me?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetchFn(url, {
    headers: { Accept: 'application/json' },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const err = new Error(data.error?.message || `Failed to fetch Facebook user profile: HTTP ${res.status}`);
    err.code = data.error?.code;
    err.status = res.status;
    throw err;
  }

  const email = data.email ? data.email.trim().toLowerCase() : null;
  const pictureUrl = data.picture?.data?.url || null;
  const fullName = (data.name || [data.first_name, data.last_name].filter(Boolean).join(' ')).trim() || undefined;
  const nameParts = fullName ? fullName.split(/\s+/) : [];
  const firstName = (data.first_name || nameParts[0] || '').trim() || undefined;
  const lastName = (data.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '') || '').trim() || undefined;

  return {
    id: String(data.id),
    name: fullName,
    firstName,
    lastName,
    email,
    picture: pictureUrl,
    raw: data,
  };
}

export async function inspectFacebookToken({
  inputToken,
  clientId,
  clientSecret,
  fetchFn = globalThis.fetch,
}) {
  if (!inputToken) throw new Error('inputToken is required');
  if (!clientId || !clientSecret) throw new Error('clientId and clientSecret are required');

  const appAccessToken = `${clientId}|${clientSecret}`;
  const url = `https://graph.facebook.com/v20.0/debug_token?input_token=${encodeURIComponent(inputToken)}&access_token=${encodeURIComponent(appAccessToken)}`;
  const res = await fetchFn(url, { headers: { Accept: 'application/json' } });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Failed to inspect Facebook token: HTTP ${res.status}`);
  }
  return data.data || data;
}

/**
 * High-level Facebook authenticator supporting code exchange or direct access token
 * with configurable synthetic email fallback (`${fbId}${syntheticEmailDomain}`).
 */
export async function authenticateFacebookIdentity({
  code,
  accessToken,
  redirectUri,
  clientId,
  clientSecret,
  syntheticEmailDomain = '@facebook.app.local',
  fetchFn = globalThis.fetch,
}) {
  let token = accessToken;
  let expiresInSeconds;

  if (code) {
    const exchanged = await exchangeFacebookCodeForToken({
      code,
      clientId,
      clientSecret,
      redirectUri,
      fetchFn,
    });
    token = exchanged.access_token;
    expiresInSeconds = exchanged.expires_in;
  }

  const profile = await getFacebookUserProfile(token, { fetchFn });
  const domainSuffix = syntheticEmailDomain.startsWith('@') ? syntheticEmailDomain : `@${syntheticEmailDomain}`;
  const effectiveEmail = profile.email || `${profile.id}${domainSuffix}`.toLowerCase();

  return {
    provider: 'facebook',
    subjectId: profile.id,
    email: effectiveEmail,
    emailVerified: Boolean(profile.email),
    isPrivateRelayEmail: !profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.name,
    avatarUrl: profile.picture,
    accessToken: token,
    expiresInSeconds,
    raw: profile.raw,
  };
}

/**
 * Meta Platform GDPR Compliance: Verifies and decodes a Facebook `signed_request`
 * sent to the Data Deletion Request Callback endpoint.
 */
export function parseFacebookDataDeletionSignedRequest(signedRequest, appSecret) {
  if (!signedRequest || typeof signedRequest !== 'string' || !signedRequest.includes('.')) {
    throw new Error('Invalid Facebook signed_request parameter.');
  }
  if (!appSecret) {
    throw new Error('appSecret is required to verify Facebook signed_request.');
  }

  const [encodedSig, payloadB64] = signedRequest.split('.', 2);
  const sig = Buffer.from(encodedSig, 'base64url');
  const expectedSig = crypto.createHmac('sha256', appSecret).update(payloadB64).digest();

  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error('Facebook signed_request HMAC-SHA256 signature mismatch.');
  }

  const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  if (!data.user_id) {
    throw new Error('Facebook signed_request payload missing user_id.');
  }

  return {
    facebookUserId: String(data.user_id),
    algorithm: data.algorithm || 'HMAC-SHA256',
    issuedAt: data.issued_at,
  };
}
