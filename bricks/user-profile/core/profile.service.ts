/**
 * Hexagonal User Profile Domain Service (`bricks/user-profile/core/profile.service.ts`)
 *
 * Orchestrates profile CRUD, synthetic email claiming, password updates,
 * GDPR export, and App Store 5.1.1(v) compliant account deletion.
 */

import { evaluatePasswordStrength, validateProfileUpdate } from './schemas.ts';
import {
  normalizeUserProfile,
  authenticateOrLinkSocialAccount,
  disconnectSocialAccount,
} from './oauth/account-linking.service.ts';

export const DEFAULT_I18N_DICTIONARY = {
  profileSectionTitle: 'Profile Management',
  profileSectionSubtitle: 'Update your personal information and password.',
  firstNameLabel: 'First Name',
  lastNameLabel: 'Last Name',
  emailLabel: 'Email',
  syntheticEmailBanner: 'Your sign-in provider did not share an email address. Add your email to receive notifications and enable password login.',
  saveEmailButton: 'Save Email',
  passwordSectionTitle: 'Password',
  connectedAccountsTitle: 'Authentication',
  connectedAccountsSubtitle: 'Manage how you sign in to your account.',
  connectButton: 'Connect',
  disconnectButton: 'Disconnect',
  connectedBadge: 'Connected',
  deleteAccountTitle: 'Delete Account',
  deleteAccountConfirmMessage: 'This action is permanent and cannot be undone. All your account data and preferences will be permanently wiped.',
};

export class UserProfileService {
  constructor({
    storagePort,
    sessionPort = null,
    avatarPort = null,
    lifecyclePort = null,
    oauthProviders = {},
    syntheticEmailDomain = '@facebook.app.local',
  } = {}) {
    if (!storagePort) {
      throw new Error('UserProfileService requires a storagePort (UserProfileStoragePort).');
    }
    this.storagePort = storagePort;
    this.sessionPort = sessionPort;
    this.avatarPort = avatarPort;
    this.lifecyclePort = lifecyclePort;
    this.oauthProviders = oauthProviders;
    this.syntheticEmailDomain = syntheticEmailDomain;
  }

  async getProfile(userId) {
    const record = await this.storagePort.findUserById(userId);
    if (!record) return null;
    return normalizeUserProfile(record, { syntheticEmailDomain: this.syntheticEmailDomain });
  }

  async updateProfile(userId, patch = {}) {
    const validation = validateProfileUpdate(patch, {
      syntheticEmailDomain: this.syntheticEmailDomain,
    });
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    const existing = await this.storagePort.findUserById(userId);
    if (!existing) throw new Error('User not found.');

    const existingProfile = existing.profile && typeof existing.profile === 'object'
      ? { ...existing.profile }
      : {};

    const nextFirst = validation.data.firstName !== undefined ? validation.data.firstName : existingProfile.firstName;
    const nextLast = validation.data.lastName !== undefined ? validation.data.lastName : existingProfile.lastName;
    const nextFull = [nextFirst, nextLast].filter(Boolean).join(' ').trim() || existingProfile.fullName || '';

    const nextProfile = {
      ...existingProfile,
      ...(validation.data.firstName !== undefined ? { firstName: nextFirst } : {}),
      ...(validation.data.lastName !== undefined ? { lastName: nextLast } : {}),
      ...(nextFull ? { fullName: nextFull, full_name: nextFull, name: nextFull } : {}),
      ...(validation.data.avatarUrl !== undefined ? { avatarUrl: validation.data.avatarUrl } : {}),
      ...(validation.data.preferences ? { preferences: { ...(existingProfile.preferences || {}), ...validation.data.preferences } } : {}),
    };

    let nextEmail = existing.email;
    if (validation.data.email && validation.data.email !== existing.email) {
      const owner = await this.storagePort.findUserByEmail(validation.data.email);
      if (owner && owner.id !== userId) {
        throw new Error('That email address is already in use by another account.');
      }
      nextEmail = validation.data.email;
      nextProfile.facebookEmail = nextEmail;
    }

    const updatedRecord = await this.storagePort.updateUser(userId, {
      email: nextEmail,
      profile: nextProfile,
    });

    const normalized = normalizeUserProfile(updatedRecord, {
      syntheticEmailDomain: this.syntheticEmailDomain,
    });

    if (this.lifecyclePort?.onProfileUpdated) {
      await this.lifecyclePort.onProfileUpdated({
        user: normalized,
        updatedFields: Object.keys(validation.data),
      });
    }

    return normalized;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!this.sessionPort?.hashPassword || !this.sessionPort?.verifyPassword) {
      throw new Error('SessionTokenPort must implement hashPassword and verifyPassword.');
    }
    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      throw new Error('New password must be at least 8 characters and meet minimum complexity.');
    }

    const existing = await this.storagePort.findUserById(userId);
    if (!existing) throw new Error('User not found.');

    if (existing.passwordHash) {
      const ok = await this.sessionPort.verifyPassword(currentPassword || '', existing.passwordHash);
      if (!ok) throw new Error('Current password is incorrect.');
    }

    const newHash = await this.sessionPort.hashPassword(newPassword);
    const updatedRecord = await this.storagePort.updateUser(userId, {
      passwordHash: newHash,
      profile: { ...(existing.profile || {}), hasPassword: true },
    });

    return normalizeUserProfile(updatedRecord, {
      syntheticEmailDomain: this.syntheticEmailDomain,
    });
  }

  async authenticateSocial({ provider, identity, linkUserId = null, platform = 'web' }) {
    const result = await authenticateOrLinkSocialAccount({
      identity,
      linkUserId,
      storagePort: this.storagePort,
      lifecyclePort: this.lifecyclePort,
      platform,
      syntheticEmailDomain: this.syntheticEmailDomain,
    });

    const accessToken = this.sessionPort
      ? await this.sessionPort.signSessionToken({
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        })
      : null;

    return {
      ...result,
      accessToken,
    };
  }

  async disconnectProvider(userId, provider) {
    return disconnectSocialAccount({
      userId,
      provider,
      storagePort: this.storagePort,
      lifecyclePort: this.lifecyclePort,
      syntheticEmailDomain: this.syntheticEmailDomain,
    });
  }

  async exportUserData(userId) {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('User not found.');
    const extra = this.storagePort.exportUserData ? await this.storagePort.exportUserData(userId) : {};
    return {
      exportedAt: new Date().toISOString(),
      profile,
      ...extra,
    };
  }

  async deleteAccount(userId) {
    const existing = await this.storagePort.findUserById(userId);
    if (!existing) throw new Error('User not found.');

    // App Store 5.1.1(v): If an Apple refresh/access token is stored and Apple provider supports revokeToken, invoke it best-effort
    const appleToken = existing.profile?.appleRefreshToken || existing.profile?.appleAccessToken;
    if (appleToken && this.oauthProviders?.apple?.revokeToken) {
      try {
        await this.oauthProviders.apple.revokeToken(appleToken);
      } catch {}
    }

    await this.storagePort.deleteUser(userId);

    if (this.lifecyclePort?.onAccountDeleted) {
      await this.lifecyclePort.onAccountDeleted({
        userId,
        email: existing.email,
      });
    }

    return { deleted: true, userId };
  }
}
