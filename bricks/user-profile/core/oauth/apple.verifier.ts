/**
 * Apple OAuth & Identity Token Verification Service (`bricks/user-profile/core/oauth/apple.verifier.ts`)
 *
 * Extracted from `../SnapCal/server/src/services/apple-auth.js` and `../SnapCal/server/src/index.js`
 * with zero brand coupling and built-in App Store 5.1.1(v) token revocation.
 */

import crypto from 'node:crypto';

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_REVOKE_URL = 'https://appleid.apple.com/auth/revoke';

let jwksCache = null;
let jwksExpiry = 0;

export function resetAppleJwksCache() {
  jwksCache = null;
  jwksExpiry = 0;
}

export async function getAppleJwks(forceRefresh = false, fetchFn = globalThis.fetch) {
  const now = Date.now();
  if (!forceRefresh && jwksCache && now < jwksExpiry) {
    return jwksCache;
  }

  const res = await fetchFn(APPLE_JWKS_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Apple JWKS (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  if (!data?.keys || !Array.isArray(data.keys)) {
    throw new Error('Invalid Apple JWKS response structure.');
  }

  jwksCache = data.keys;
  jwksExpiry = now + 24 * 60 * 60 * 1000;
  return jwksCache;
}

export function buildAppleAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  scopes = ['name', 'email'],
  responseMode = 'form_post',
}) {
  if (!clientId) throw new Error('Apple clientId (Service ID) is required.');
  if (!redirectUri) throw new Error('Apple redirectUri is required.');

  const authUrl = new URL(APPLE_AUTHORIZE_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code id_token');
  authUrl.searchParams.set('response_mode', responseMode);
  authUrl.searchParams.set('scope', Array.isArray(scopes) ? scopes.join(' ') : scopes);
  if (state) authUrl.searchParams.set('state', state);
  return authUrl.toString();
}

export async function verifyAppleIdentityToken(
  token,
  {
    skipSignatureVerification = false,
    audience = undefined,
    fetchFn = globalThis.fetch,
  } = {}
) {
  if (!token || typeof token !== 'string') {
    throw new Error('Apple identity token is required.');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Apple identity token (expected 3 JWT segments).');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch (err) {
    throw new Error(`Failed to parse Apple token segments: ${err.message}`);
  }

  if (payload.iss !== APPLE_ISSUER) {
    throw new Error(`Invalid token issuer: expected "${APPLE_ISSUER}", got "${payload.iss}"`);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec - 60) {
    throw new Error(`Apple identity token expired at ${new Date(payload.exp * 1000).toISOString()}`);
  }

  if (audience) {
    const allowedAudiences = Array.isArray(audience) ? audience : [audience];
    if (!allowedAudiences.includes(payload.aud)) {
      throw new Error(`Audience mismatch: expected "${allowedAudiences.join(' | ')}", got "${payload.aud}"`);
    }
  }

  if (!payload.sub) {
    throw new Error('Apple token payload missing sub claim.');
  }

  if (!skipSignatureVerification) {
    if (!header.kid) {
      throw new Error('Apple token header missing kid (Key Identifier).');
    }

    let keys = await getAppleJwks(false, fetchFn);
    let matchingKey = keys.find((k) => k.kid === header.kid);
    if (!matchingKey) {
      keys = await getAppleJwks(true, fetchFn);
      matchingKey = keys.find((k) => k.kid === header.kid);
    }
    if (!matchingKey) {
      throw new Error(`No matching Apple public key found for kid "${header.kid}".`);
    }

    const publicKey = crypto.createPublicKey({ key: matchingKey, format: 'jwk' });
    const signingInput = `${headerB64}.${payloadB64}`;
    const signature = Buffer.from(signatureB64, 'base64url');
    const isSignatureValid = crypto.verify('RSA-SHA256', Buffer.from(signingInput), publicKey, signature);

    if (!isSignatureValid) {
      throw new Error('Apple identity token signature verification failed.');
    }
  }

  return payload;
}

/**
 * Normalizes Apple Sign-In payload + optional first-login `rawUser` JSON from Apple `form_post` or iOS `ASAuthorizationAppleIDCredential`.
 */
export async function authenticateAppleIdentity({
  idToken,
  rawUser,
  firstLoginUserHint,
  audience,
  skipSignatureVerification = false,
  fetchFn = globalThis.fetch,
}) {
  const applePayload = await verifyAppleIdentityToken(idToken, {
    audience,
    skipSignatureVerification,
    fetchFn,
  });

  let verifiedEmail = applePayload.email ? String(applePayload.email).trim().toLowerCase() : null;
  let firstName;
  let lastName;
  let fullName;

  const userObj = (() => {
    if (firstLoginUserHint) return firstLoginUserHint;
    if (!rawUser) return null;
    if (typeof rawUser === 'string') {
      try {
        return JSON.parse(rawUser);
      } catch {
        return null;
      }
    }
    return typeof rawUser === 'object' ? rawUser : null;
  })();

  if (userObj) {
    const f = userObj.firstName || userObj.name?.firstName || '';
    const l = userObj.lastName || userObj.name?.lastName || '';
    if (f) firstName = String(f).trim();
    if (l) lastName = String(l).trim();
    fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
    if (!verifiedEmail && userObj.email) {
      verifiedEmail = String(userObj.email).trim().toLowerCase();
    }
  }

  if (!verifiedEmail && applePayload.sub) {
    verifiedEmail = `${applePayload.sub}@privaterelay.appleid.com`.toLowerCase();
  }

  const isPrivateRelayEmail = Boolean(
    applePayload.is_private_email === true ||
    applePayload.is_private_email === 'true' ||
    (verifiedEmail && verifiedEmail.endsWith('@privaterelay.appleid.com'))
  );

  return {
    provider: 'apple',
    subjectId: String(applePayload.sub),
    email: verifiedEmail,
    emailVerified: applePayload.email_verified === true || applePayload.email_verified === 'true',
    isPrivateRelayEmail,
    firstName,
    lastName,
    fullName,
    idToken,
    raw: applePayload,
  };
}

/**
 * App Store Review Guideline 5.1.1(v) Compliance: Revoke Apple Sign-In token on account deletion.
 */
export async function revokeAppleToken({
  clientId,
  clientSecret,
  token,
  tokenTypeHint = 'refresh_token',
  fetchFn = globalThis.fetch,
}) {
  if (!clientId || !clientSecret || !token) {
    throw new Error('clientId, clientSecret, and token are required to revoke an Apple token.');
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    token,
    token_type_hint: tokenTypeHint,
  });
  const res = await fetchFn(APPLE_REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`Apple token revocation failed: HTTP ${res.status}`);
  }
  return { revoked: true };
}
