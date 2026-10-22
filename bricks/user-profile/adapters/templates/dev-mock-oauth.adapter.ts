/**
 * Day-1 Zero-Credential Local Development Mock OAuth Adapter (`bricks/user-profile/adapters/templates/dev-mock-oauth.adapter.ts`)
 *
 * Allows brand-new greenfield projects (`USE_MOCK_OAUTH=true` in `development` or `test`)
 * to simulate all 4 social login providers (Google, Facebook, Apple, Microsoft) and in-memory
 * user storage before live external OAuth apps are registered.
 * NOTE: Per Mandate #6, production tickets cannot be marked `done` until live provider credentials are verified.
 */

export function createInMemoryUserProfileStorageAdapter(initialUsers = []) {
  const users = new Map();
  let seq = 1;

  for (const u of initialUsers) {
    const id = u.id || `user-${seq++}`;
    users.set(id, {
      id,
      email: String(u.email).toLowerCase(),
      passwordHash: u.passwordHash || null,
      role: u.role || 'user',
      profile: { ...(u.profile || {}) },
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    async findUserById(userId) {
      return users.get(userId) || null;
    },
    async findUserByEmail(email) {
      const target = String(email || '').trim().toLowerCase();
      for (const u of users.values()) {
        if (u.email === target) return u;
      }
      return null;
    },
    async findUserByProviderSubject(provider, subjectId) {
      const key = `${provider}Sub`;
      for (const u of users.values()) {
        if (u.profile && String(u.profile[key]) === String(subjectId)) {
          return u;
        }
      }
      return null;
    },
    async createUser({ email, passwordHash = null, role = 'user', profile = {} }) {
      const id = `user-${seq++}`;
      const record = {
        id,
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role,
        profile: { ...profile },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.set(id, record);
      return record;
    },
    async updateUser(userId, patch = {}) {
      const current = users.get(userId);
      if (!current) throw new Error(`User ${userId} not found`);
      const next = {
        ...current,
        ...(patch.email !== undefined ? { email: String(patch.email).trim().toLowerCase() } : {}),
        ...(patch.passwordHash !== undefined ? { passwordHash: patch.passwordHash } : {}),
        ...(patch.profile !== undefined ? { profile: { ...patch.profile } } : {}),
        updatedAt: new Date().toISOString(),
      };
      users.set(userId, next);
      return next;
    },
    async deleteUser(userId) {
      users.delete(userId);
    },
    async exportUserData(userId) {
      return { rawRecord: users.get(userId) || null };
    },
  };
}

export function createMockOAuthProviderAdapter(provider) {
  return {
    provider,
    buildAuthorizationUrl({ redirectUri, state }) {
      return `${redirectUri}?code=mock_${provider}_code&state=${encodeURIComponent(state || '')}`;
    },
    async authenticate({ code, firstLoginUserHint } = {}) {
      const sub = `mock-${provider}-sub-${code || 'default'}`;
      return {
        provider,
        subjectId: sub,
        email: firstLoginUserHint?.email || `dev.${provider}@example.com`,
        emailVerified: true,
        firstName: firstLoginUserHint?.firstName || 'Dev',
        lastName: firstLoginUserHint?.lastName || provider.charAt(0).toUpperCase() + provider.slice(1),
        fullName: `Dev ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        avatarUrl: `https://example.com/avatars/${provider}.png`,
        accessToken: `mock-access-token-${provider}`,
        refreshToken: `mock-refresh-token-${provider}`,
      };
    },
    async revokeToken() {},
  };
}
