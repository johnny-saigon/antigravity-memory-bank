/**
 * Headless User Profile Controller (`bricks/user-profile/platforms/web/headless/useUserProfile.ts`)
 *
 * Framework-friendly React/Web hook & state controller extracted from `../SnapCal/apps/web/src/components/settings/AccountSettings.jsx`.
 * Zero CSS, zero brand assets, zero hardcoded SDK calls.
 */

import { evaluatePasswordStrength, validateProfileUpdate } from '../../../core/schemas.ts';

export function createUserProfileController({
  initialUser = null,
  apiClient,
  syntheticEmailDomain = '@facebook.app.local',
  onToast = () => {},
} = {}) {
  if (!apiClient) {
    throw new Error('createUserProfileController requires an apiClient ({ updateMe, changePassword, resetPasswordRequest, deleteAccount }).');
  }

  const normalizedSuffix = syntheticEmailDomain.startsWith('@')
    ? syntheticEmailDomain.toLowerCase()
    : `@${syntheticEmailDomain.toLowerCase()}`;

  const deriveState = (user) => {
    const u = user || {};
    const full = (
      u.fullName ||
      u.full_name ||
      u.name ||
      u.facebookName ||
      u.microsoftName ||
      u.googleName ||
      [u.firstName, u.lastName].filter(Boolean).join(' ') ||
      ''
    ).trim();
    const parts = full ? full.split(/\s+/) : [];
    const firstName = u.firstName || parts[0] || '';
    const lastName = u.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '') || '';
    const avatarUrl = u.avatarUrl || u.facebookPicture || u.googlePicture || '';
    const email = String(u.email || '').trim();
    const isSyntheticFacebookEmail = Boolean(email && email.toLowerCase().endsWith(normalizedSuffix));
    const isSyntheticAppleEmail = Boolean(email && email.toLowerCase().endsWith('@privaterelay.appleid.com'));
    const isSyntheticEmail = isSyntheticFacebookEmail || isSyntheticAppleEmail;

    return {
      firstName,
      lastName,
      fullName: full,
      avatarUrl,
      email: isSyntheticFacebookEmail ? (u.facebookEmail || '') : email,
      rawEmail: email,
      hasPassword: u.hasPassword !== false,
      isSyntheticFacebookEmail,
      isSyntheticAppleEmail,
      isSyntheticEmail,
    };
  };

  return {
    deriveState,
    evaluatePasswordStrength,
    async saveProfileFields({ firstName, lastName }) {
      const check = validateProfileUpdate({ firstName, lastName }, { syntheticEmailDomain });
      if (!check.valid) throw new Error(check.errors.join(' '));
      const updated = await apiClient.updateMe(check.data);
      onToast({ type: 'success', title: 'Profile updated', description: 'Your changes have been saved.' });
      return updated;
    },
    async claimCustomEmail(emailInput) {
      const check = validateProfileUpdate({ email: emailInput }, { syntheticEmailDomain });
      if (!check.valid) throw new Error(check.errors.join(' '));
      const updated = await apiClient.updateMe({
        email: check.data.email,
        facebookEmail: check.data.email,
      });
      onToast({ type: 'success', title: 'Email updated', description: `Your account email is now ${check.data.email}.` });
      return updated;
    },
    async updatePassword({ userId, currentPassword, newPassword, confirmPassword }) {
      if (!currentPassword) throw new Error('Enter your current password.');
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match.');
      const strength = evaluatePasswordStrength(newPassword);
      if (!strength.isValid) throw new Error('Password must be at least 8 characters.');
      await apiClient.changePassword({ userId, currentPassword, newPassword });
      onToast({ type: 'success', title: 'Password updated successfully' });
    },
    async sendPasswordSetupEmail(targetEmail) {
      const check = validateProfileUpdate({ email: targetEmail }, { syntheticEmailDomain });
      if (!check.valid) throw new Error('Enter a valid non-synthetic email address first.');
      await apiClient.resetPasswordRequest(check.data.email);
      onToast({ type: 'success', title: 'Check your email', description: 'We sent a link to set your password.' });
    },
    async deleteAccount() {
      await apiClient.deleteAccount();
    },
  };
}

/**
 * React hook factory (`useUserProfile`) for Web applications.
 */
export function createUseUserProfileHook(React) {
  return function useUserProfile({ user, apiClient, syntheticEmailDomain = '@facebook.app.local', onToast }) {
    const controller = React.useMemo(
      () => createUserProfileController({ initialUser: user, apiClient, syntheticEmailDomain, onToast }),
      [apiClient, syntheticEmailDomain, onToast]
    );
    const derived = React.useMemo(() => controller.deriveState(user), [controller, user]);
    const [firstName, setFirstName] = React.useState(derived.firstName);
    const [lastName, setLastName] = React.useState(derived.lastName);
    const [emailInput, setEmailInput] = React.useState(derived.email);
    const [avatarUrl, setAvatarUrl] = React.useState(derived.avatarUrl);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      setFirstName(derived.firstName);
      setLastName(derived.lastName);
      setEmailInput(derived.email);
      setAvatarUrl(derived.avatarUrl);
    }, [derived]);

    const commitNameOnBlur = React.useCallback(async () => {
      if (firstName === derived.firstName && lastName === derived.lastName) return;
      setSaving(true);
      setError(null);
      try {
        await controller.saveProfileFields({ firstName, lastName });
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    }, [controller, firstName, lastName, derived.firstName, derived.lastName]);

    return {
      ...derived,
      firstName,
      setFirstName,
      lastName,
      setLastName,
      emailInput,
      setEmailInput,
      avatarUrl,
      setAvatarUrl,
      saving,
      error,
      commitNameOnBlur,
      claimCustomEmail: () => controller.claimCustomEmail(emailInput),
      updatePassword: controller.updatePassword,
      sendPasswordSetupEmail: () => controller.sendPasswordSetupEmail(emailInput || derived.rawEmail),
      deleteAccount: controller.deleteAccount,
      evaluatePasswordStrength: controller.evaluatePasswordStrength,
    };
  };
}

/**
 * Reconciles local profile form draft state when an external refresh occurs
 * (e.g. `connectedCalendar` or `notificationsEnabled` updated in background)
 * so clean fields stay in sync with `user` while dirty unsaved edits are preserved (`BUG-738`).
 */
export function reconcileProfileRefreshState(currentDraft = {}, nextDerived = {}) {
  const dirty = Boolean(currentDraft.dirty);
  return {
    firstName: dirty && currentDraft.firstName !== undefined ? currentDraft.firstName : (nextDerived.firstName ?? ''),
    lastName: dirty && currentDraft.lastName !== undefined ? currentDraft.lastName : (nextDerived.lastName ?? ''),
    email: dirty && currentDraft.email !== undefined ? currentDraft.email : (nextDerived.email ?? ''),
    avatarUrl: nextDerived.avatarUrl ?? currentDraft.avatarUrl ?? '',
    dirty,
  };
}

/**
 * Verifies that React Native / iOS profile form primitives (`Button`, `TextField`, `Switch`)
 * use deterministic Yoga layout containers (`Pressable`, `RNTextInput`, `RNSwitch`) instead of
 * `@expo/ui` `NativeHost` (`UIHostingController`), which collapses to 0pt height or shifts
 * text frames on parent ScrollView state refresh (`BUG-738`).
 */
export function verifyMobileYogaLayoutInvariants({
  buttonSource = '',
  textFieldSource = '',
  switchSource = '',
} = {}) {
  const errors = [];
  if (buttonSource.includes('<NativeHost') || buttonSource.includes('<ExpoButton')) {
    errors.push('Button must use Yoga-measured Pressable instead of @expo/ui NativeHost/ExpoButton.');
  }
  if (!buttonSource.includes('min-h-11')) {
    errors.push('Button must declare explicit min-h-11 Yoga height.');
  }
  if (textFieldSource.includes('<NativeHost') || textFieldSource.includes('<ExpoTextInput')) {
    errors.push('TextField must use RNTextInput inside TextFieldFrame instead of @expo/ui NativeHost/ExpoTextInput.');
  }
  if (switchSource.includes('<NativeHost') || switchSource.includes('<ExpoSwitch')) {
    errors.push('Switch must use RNSwitch inside a min-h-11 Yoga row instead of @expo/ui NativeHost/ExpoSwitch.');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
