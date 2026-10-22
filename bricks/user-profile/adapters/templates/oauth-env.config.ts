/**
 * OAuth Environment Configuration Adapter Template (`bricks/user-profile/adapters/templates/oauth-env.config.ts`)
 *
 * Reads `.env` variables for Google, Facebook, Apple, and Microsoft across Web, iOS, and Android.
 * Scaffolded non-destructively to `src/adapters/oauth-config.adapter.ts` on `brick install`.
 */

export function createOAuthEnvConfig(env = process.env) {
  const publicUrl = (env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
  const appScheme = (env.APP_SCHEME || 'app').replace(/:\/+$/, '');
  const syntheticEmailDomain = env.SYNTHETIC_EMAIL_DOMAIN || `@facebook.${new URL(publicUrl).hostname}`;

  return {
    publicUrl,
    appScheme,
    syntheticEmailDomain,
    useMockOAuth: env.USE_MOCK_OAUTH === 'true' && env.NODE_ENV !== 'production',
    google: {
      webClientId: env.GOOGLE_CLIENT_ID || null,
      webClientSecret: env.GOOGLE_CLIENT_SECRET || null,
      iosClientId: env.GOOGLE_IOS_CLIENT_ID || null,
      androidClientId: env.GOOGLE_ANDROID_CLIENT_ID || null,
      extraScopesVerified: env.GOOGLE_EXTRA_SCOPES_VERIFIED === 'true',
      callbackUrl: `${publicUrl}/api/auth/google/callback`,
    },
    apple: {
      serviceId: env.APPLE_SERVICE_ID || env.APPLE_CLIENT_ID || null,
      bundleId: env.APPLE_BUNDLE_ID || null,
      teamId: env.APPLE_TEAM_ID || null,
      keyId: env.APPLE_KEY_ID || null,
      privateKey: env.APPLE_PRIVATE_KEY || null,
      callbackUrl: env.APPLE_REDIRECT_URI || `${publicUrl}/api/auth/apple/callback`,
    },
    facebook: {
      appId: env.META_APP_ID || env.FACEBOOK_APP_ID || null,
      appSecret: env.META_APP_SECRET || env.FACEBOOK_APP_SECRET || null,
      scopes: (env.META_OAUTH_SCOPES || 'public_profile,email')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      callbackUrl: `${publicUrl}/api/auth/facebook/callback`,
    },
    microsoft: {
      webClientId: env.MICROSOFT_WEB_CLIENT_ID || env.MICROSOFT_CLIENT_ID || null,
      webClientSecret: env.MICROSOFT_WEB_CLIENT_SECRET || env.MICROSOFT_CLIENT_SECRET || null,
      mobileClientId: env.MICROSOFT_MOBILE_CLIENT_ID || env.MICROSOFT_CLIENT_ID || null,
      tenantId: env.MICROSOFT_TENANT_ID || 'common',
      callbackUrl: `${publicUrl}/api/auth/microsoft/callback`,
    },
  };
}
