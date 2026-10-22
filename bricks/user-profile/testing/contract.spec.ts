/**
 * Automated Contract & De-Branding Test Suite for `bricks/user-profile` (`bricks/user-profile/testing/contract.spec.ts`)
 *
 * Verifies:
 * 1. All 4 OAuth verifiers (Google Web + iOS RFC 8252, Apple JWKS + Private Relay + first-login name + 5.1.1v revoke,
 *    Facebook Graph v20.0 + synthetic email upgrade + GDPR signed_request deletion, Microsoft Entra v2.0 Web + Mobile PKCE + #EXT#@ UPN).
 * 2. Account linking, duplicate email merge, and lockout protection when disconnecting the last login provider.
 * 3. UserProfileService CRUD, password strength scoring, and ProfileLifecycleEventPort event emission.
 * 4. ProfileBrandThemePort CSS Custom Property generation (`--ag-profile-*`) and zero hardcoded SnapCal references in `bricks/user-profile/`.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  evaluatePasswordStrength,
  validateProfileUpdate,
  validateAndBuildThemeCssVars,
  UserProfileService,
  buildAppleAuthorizationUrl,
  authenticateAppleIdentity,
  revokeAppleToken,
  buildFacebookAuthUrl,
  authenticateFacebookIdentity,
  parseFacebookDataDeletionSignedRequest,
  normalizeMicrosoftGuestEmail,
  resolveMicrosoftCredentials,
  authenticateMicrosoftIdentity,
  buildGoogleReversedClientIdRedirectUri,
  buildGoogleAuthUrl,
  authenticateGoogleIdentity,
  normalizeUserProfile,
  authenticateOrLinkSocialAccount,
  disconnectSocialAccount,
} from '../core/index.ts';

import {
  createUserProfileController,
  createSocialAuthController,
  computeAvatarInitial,
  computeMinCropScale,
  clampCropOffset,
  computeSourceCropRect,
  deriveConnectedProvidersMap,
} from '../platforms/web/headless/index.ts';

import {
  buildProfileThemeStyleObject,
  getSocialButtonStyles,
} from '../platforms/web/themed-ui/theme-tokens.ts';

import {
  createInMemoryUserProfileStorageAdapter,
  createMockOAuthProviderAdapter,
} from '../adapters/templates/dev-mock-oauth.adapter.ts';
import { userProfileBrandTheme } from '../adapters/templates/theme.adapter.template.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const brickRoot = path.resolve(__dirname, '..');

function makeUnsignedJwt(payload, header = { alg: 'RS256', kid: 'test-key-1' }) {
  const h = Buffer.from(JSON.stringify(header)).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${h}.${p}.fakesig`;
}

describe('Brick Contract Suite: bricks/user-profile (FEAT-120)', () => {
  test('1. Zero Hardcoded Brand/SnapCal Coupling inside bricks/user-profile/ source files', () => {
    const walk = (dir) => {
      let results = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'testing') results = results.concat(walk(full));
        } else if (/\.(ts|tsx|swift|kt|sql|prisma|json)$/.test(entry.name)) {
          results.push(full);
        }
      }
      return results;
    };

    const files = walk(brickRoot);
    assert.ok(files.length >= 18, `Expected at least 18 brick source files, found ${files.length}`);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      // Strip comments before checking runtime code for forbidden hardcoded brand strings
      const codeOnly = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      assert.ok(
        !/snapcal\.io|com\.snapcal|#CCFF00|BellLogo|base44/i.test(codeOnly),
        `Forbidden hardcoded brand coupling found in ${path.relative(brickRoot, file)}`
      );
    }
  });

  test('2. 4-Provider OAuth Verifiers (Google RFC 8252, Apple JWKS + 5.1.1v, Facebook Graph + GDPR, Microsoft PKCE + #EXT#@)', async () => {
    // 2a. Google Web & iOS RFC 8252
    const iosRedirect = buildGoogleReversedClientIdRedirectUri(
      '998877-customclient.apps.googleusercontent.com'
    );
    assert.equal(iosRedirect, 'com.googleusercontent.apps.998877-customclient:/oauth2redirect');

    const googleUrlUnverified = buildGoogleAuthUrl({
      clientId: 'google-web-id',
      redirectUri: 'https://example.com/api/auth/google/callback',
      extraScopes: ['https://www.googleapis.com/auth/calendar.events'],
      extraScopesVerified: false,
    });
    assert.ok(!googleUrlUnverified.includes('calendar.events'), 'Unverified extra scopes must be stripped');

    const googleIdentity = await authenticateGoogleIdentity({
      code: 'google-code-123',
      clientId: 'google-web-id',
      clientSecret: 'secret',
      redirectUri: 'https://example.com/cb',
      fetchFn: async (url) => {
        if (String(url).includes('oauth2.googleapis.com/token')) {
          return {
            ok: true,
            json: async () => ({ access_token: 'g-access-1', refresh_token: 'g-refresh-1', expires_in: 3600 }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            sub: 'google-sub-42',
            email: 'Alice@Example.com',
            given_name: 'Alice',
            family_name: 'Smith',
            picture: 'https://example.com/alice.jpg',
          }),
        };
      },
    });
    assert.equal(googleIdentity.provider, 'google');
    assert.equal(googleIdentity.subjectId, 'google-sub-42');
    assert.equal(googleIdentity.email, 'alice@example.com');
    assert.equal(googleIdentity.fullName, 'Alice Smith');

    // 2b. Apple Sign-In (Private Relay + First-Login Name Capture + App Store 5.1.1(v) Revocation)
    const appleUrl = buildAppleAuthorizationUrl({
      clientId: 'com.example.web',
      redirectUri: 'https://example.com/api/auth/apple/callback',
      state: 'st-1',
    });
    assert.ok(appleUrl.includes('response_mode=form_post'));

    const appleJwt = makeUnsignedJwt({
      iss: 'https://appleid.apple.com',
      aud: 'com.example.app',
      sub: 'apple-user-001',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const appleIdentity = await authenticateAppleIdentity({
      idToken: appleJwt,
      rawUser: JSON.stringify({ name: { firstName: 'Clara', lastName: 'Oswald' } }),
      audience: 'com.example.app',
      skipSignatureVerification: true,
    });
    assert.equal(appleIdentity.provider, 'apple');
    assert.equal(appleIdentity.email, 'apple-user-001@privaterelay.appleid.com');
    assert.equal(appleIdentity.isPrivateRelayEmail, true);
    assert.equal(appleIdentity.fullName, 'Clara Oswald');

    const revokeRes = await revokeAppleToken({
      clientId: 'com.example.app',
      clientSecret: 'apple-secret',
      token: 'apple-refresh-token',
      fetchFn: async () => ({ ok: true, status: 200 }),
    });
    assert.equal(revokeRes.revoked, true);

    // 2c. Facebook OAuth v20.0 (Synthetic Email Fallback + GDPR signed_request Data Deletion)
    const fbUrl = buildFacebookAuthUrl({
      clientId: 'fb-123',
      redirectUri: 'https://example.com/api/auth/facebook/callback',
      state: 'st-fb',
    });
    assert.ok(fbUrl.includes('facebook.com/v20.0/dialog/oauth'));

    const fbIdentity = await authenticateFacebookIdentity({
      accessToken: 'fb-token-1',
      syntheticEmailDomain: '@facebook.binaryday.app',
      fetchFn: async () => ({
        ok: true,
        json: async () => ({
          id: 'fb-999',
          first_name: 'Jean',
          last_name: 'Dupont',
          picture: { data: { url: 'https://example.com/fb.jpg' } },
        }),
      }),
    });
    assert.equal(fbIdentity.email, 'fb-999@facebook.binaryday.app');
    assert.equal(fbIdentity.isPrivateRelayEmail, true);

    const payloadB64 = Buffer.from(JSON.stringify({ user_id: 'fb-999', issued_at: 1700000000 })).toString('base64url');
    const sigB64 = crypto.createHmac('sha256', 'meta-secret').update(payloadB64).digest('base64url');
    const deletion = parseFacebookDataDeletionSignedRequest(`${sigB64}.${payloadB64}`, 'meta-secret');
    assert.equal(deletion.facebookUserId, 'fb-999');

    // 2d. Microsoft Entra ID v2.0 (Mobile PKCE + #EXT#@ Guest UPN Unwrapping)
    assert.equal(
      normalizeMicrosoftGuestEmail('john_outlook.com#EXT#@contoso.onmicrosoft.com'),
      'john@outlook.com'
    );
    const msMobileCreds = resolveMicrosoftCredentials({
      redirectUri: 'binaryday://auth/callback',
      appScheme: 'binaryday',
      env: { MICROSOFT_MOBILE_CLIENT_ID: 'ms-mobile-id' },
    });
    assert.equal(msMobileCreds.isMobile, true);
    assert.equal(msMobileCreds.clientId, 'ms-mobile-id');

    const msIdentity = await authenticateMicrosoftIdentity({
      accessToken: 'ms-access-token',
      skipSignatureVerification: true,
      fetchFn: async () => ({
        ok: true,
        json: async () => ({
          id: 'ms-oid-77',
          displayName: 'John Doe',
          givenName: 'John',
          surname: 'Doe',
          userPrincipalName: 'john_outlook.com#EXT#@contoso.onmicrosoft.com',
        }),
      }),
    });
    assert.equal(msIdentity.provider, 'microsoft');
    assert.equal(msIdentity.email, 'john@outlook.com');
  });

  test('3. Account Linking, Synthetic Email Upgrade, Lockout Prevention & Lifecycle Events', async () => {
    const storagePort = createInMemoryUserProfileStorageAdapter();
    const events = [];
    const lifecyclePort = {
      onUserCreated: (e) => events.push(['created', e.provider]),
      onUserLoggedIn: (e) => events.push(['login', e.provider]),
      onSocialAccountLinked: (e) => events.push(['linked', e.provider]),
      onSocialAccountDisconnected: (e) => events.push(['disconnected', e.provider]),
      onProfileUpdated: (e) => events.push(['updated', e.updatedFields]),
      onAccountDeleted: (e) => events.push(['deleted', e.userId]),
    };

    const service = new UserProfileService({
      storagePort,
      lifecyclePort,
      syntheticEmailDomain: '@facebook.myapp.io',
      oauthProviders: { apple: createMockOAuthProviderAdapter('apple') },
    });

    // Step 1: Sign in with Facebook without shared email -> creates synthetic email
    const fbAuth = await service.authenticateSocial({
      provider: 'facebook',
      identity: {
        provider: 'facebook',
        subjectId: 'fb-100',
        email: null,
        firstName: 'Marie',
        lastName: 'Curie',
        fullName: 'Marie Curie',
      },
    });
    assert.equal(fbAuth.isNewUser, true);
    assert.equal(fbAuth.user.email, 'fb-100@facebook.myapp.io');
    assert.equal(fbAuth.user.isSyntheticEmail, true);

    // Step 2: Prevent disconnecting the ONLY login provider when no password is set
    await assert.rejects(
      () => service.disconnectProvider(fbAuth.user.id, 'facebook'),
      /only sign-in method/
    );

    // Step 3: Link Google account with a verified real email -> upgrades synthetic email automatically!
    const googleLinked = await service.authenticateSocial({
      provider: 'google',
      linkUserId: fbAuth.user.id,
      identity: {
        provider: 'google',
        subjectId: 'google-200',
        email: 'marie.curie@sorbonne.fr',
        fullName: 'Marie Curie',
      },
    });
    assert.equal(googleLinked.user.email, 'marie.curie@sorbonne.fr');
    assert.equal(googleLinked.user.isSyntheticEmail, false);
    assert.equal(googleLinked.user.connectedProviders.facebook.connected, true);
    assert.equal(googleLinked.user.connectedProviders.google.connected, true);

    // Step 4: Now disconnecting Facebook succeeds because Google remains connected
    const afterDisconnect = await service.disconnectProvider(fbAuth.user.id, 'facebook');
    assert.equal(afterDisconnect.connectedProviders.facebook.connected, false);
    assert.equal(afterDisconnect.connectedProviders.google.connected, true);

    // Step 5: Profile update & GDPR account deletion
    const updated = await service.updateProfile(fbAuth.user.id, {
      firstName: 'Maria',
      lastName: 'Sklodowska-Curie',
    });
    assert.equal(updated.fullName, 'Maria Sklodowska-Curie');

    const delRes = await service.deleteAccount(fbAuth.user.id);
    assert.equal(delRes.deleted, true);
    assert.equal(await service.getProfile(fbAuth.user.id), null);
    assert.ok(events.some(([t]) => t === 'created'));
    assert.ok(events.some(([t]) => t === 'linked'));
    assert.ok(events.some(([t]) => t === 'disconnected'));
    assert.ok(events.some(([t]) => t === 'deleted'));
  });

  test('4. Headless Web Controllers & ProfileBrandThemePort (--ag-profile-*) Token Mapping', () => {
    const cssStyle = buildProfileThemeStyleObject(userProfileBrandTheme);
    assert.equal(cssStyle['--ag-profile-color-primary'], '#2563EB');
    assert.equal(cssStyle['--ag-profile-radius-card'], '16px');

    const filledBtn = getSocialButtonStyles('filled');
    assert.equal(filledBtn.backgroundColor, 'var(--ag-profile-color-primary)');

    assert.equal(computeAvatarInitial('fb-1@facebook.app.local'), 'U');
    assert.equal(computeAvatarInitial('Alice Smith'), 'A');
    assert.equal(computeMinCropScale(1000, 500, 250), 0.5);
    assert.deepEqual(
      clampCropOffset({ x: 999, y: -999, imgWidth: 1000, imgHeight: 500, scale: 0.5, frameSize: 250 }),
      { x: 125, y: 0 }
    );
    const cropRect = computeSourceCropRect({
      imgWidth: 1000,
      imgHeight: 1000,
      scale: 0.5,
      offsetX: 0,
      offsetY: 0,
      frameSize: 250,
      outputSize: 512,
    });
    assert.equal(cropRect.dWidth, 512);
    assert.equal(cropRect.sWidth, 500);

    const pwWeak = evaluatePasswordStrength('short');
    assert.equal(pwWeak.isValid, false);
    const pwStrong = evaluatePasswordStrength('Str0ng!Pass#2026');
    assert.equal(pwStrong.score, 4);
    assert.equal(pwStrong.isValid, true);
  });
});
