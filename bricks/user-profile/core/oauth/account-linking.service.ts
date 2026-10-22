/**
 * Social Account Linking, Normalization & Lockout-Safe Disconnection (`bricks/user-profile/core/oauth/account-linking.service.ts`)
 *
 * Extracted from `../SnapCal/server/src/index.js` (`normalizeUserProfile`) and
 * `../SnapCal/apps/web/src/components/settings/ConnectedAccounts.jsx` (`deriveConnectedProviders`).
 * De-branded: supports configurable `syntheticEmailDomain` instead of hardcoded `@facebook.snapcal.io`.
 */

const PROVIDERS = ['google', 'apple', 'facebook', 'microsoft'];

/**
 * Normalizes raw user & profile state into a canonical `NormalizedUserProfile`
 * without any hardcoded brand domain.
 */
export function normalizeUserProfile(
  userRecord = {},
  { syntheticEmailDomain = '@facebook.app.local' } = {}
) {
  const rawProfile = userRecord?.profile && typeof userRecord.profile === 'object'
    ? userRecord.profile
    : userRecord;
  const emailStr = String(userRecord?.email || rawProfile?.email || '').trim().toLowerCase();
  const normalizedSyntheticSuffix = syntheticEmailDomain.startsWith('@')
    ? syntheticEmailDomain.toLowerCase()
    : `@${syntheticEmailDomain.toLowerCase()}`;

  const isSyntheticFacebookEmail =
    Boolean(emailStr && emailStr.endsWith(normalizedSyntheticSuffix)) ||
    Boolean(emailStr && /^[^@]+@facebook\.[a-z0-9.-]+$/i.test(emailStr));
  const isSyntheticAppleEmail = Boolean(emailStr && emailStr.endsWith('@privaterelay.appleid.com'));
  const isSyntheticEmail = isSyntheticFacebookEmail || isSyntheticAppleEmail;

  const fullName = (
    rawProfile.fullName ||
    rawProfile.full_name ||
    rawProfile.name ||
    rawProfile.facebookName ||
    rawProfile.microsoftName ||
    rawProfile.googleName ||
    rawProfile.appleName ||
    [rawProfile.firstName, rawProfile.lastName].filter(Boolean).join(' ') ||
    ''
  ).trim();

  const nameParts = fullName ? fullName.split(/\s+/) : [];
  const firstName =
    rawProfile.firstName !== undefined && rawProfile.firstName !== null && String(rawProfile.firstName).trim() !== ''
      ? String(rawProfile.firstName).trim()
      : (nameParts[0] || '');
  const lastName =
    rawProfile.lastName !== undefined && rawProfile.lastName !== null && String(rawProfile.lastName).trim() !== ''
      ? String(rawProfile.lastName).trim()
      : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

  const avatarUrl = (
    rawProfile.avatarUrl ||
    rawProfile.facebookPicture ||
    rawProfile.googlePicture ||
    rawProfile.picture ||
    ''
  ).trim();

  const hasPassword = Boolean(userRecord?.passwordHash || rawProfile?.hasPassword === true);

  const facebookConnected = Boolean(
    rawProfile.facebookConnected !== false &&
      (rawProfile.facebookConnected || rawProfile.facebookSub || isSyntheticFacebookEmail)
  );
  const appleConnected = Boolean(
    rawProfile.appleConnected !== false &&
      (rawProfile.appleConnected || rawProfile.appleSub || isSyntheticAppleEmail)
  );
  const microsoftConnected = Boolean(
    rawProfile.microsoftConnected !== false &&
      (rawProfile.microsoftConnected || rawProfile.microsoftSub || rawProfile.microsoftEmail)
  );
  const googleConnected = Boolean(
    rawProfile.googleConnected !== false &&
      (rawProfile.googleConnected || rawProfile.googleSub || rawProfile.googleEmail || rawProfile.googleAccessToken)
  );

  const connectedProviders = {
    google: {
      connected: googleConnected,
      subjectId: rawProfile.googleSub || null,
      email: rawProfile.googleEmail || (!isSyntheticEmail && googleConnected ? emailStr : null),
      displayName: rawProfile.googleName || null,
      avatarUrl: rawProfile.googlePicture || null,
      label: googleConnected ? (rawProfile.googleEmail || (!isSyntheticEmail ? emailStr : '') || 'Connected via Google') : '',
    },
    apple: {
      connected: appleConnected,
      subjectId: rawProfile.appleSub || null,
      email: rawProfile.appleEmail || (isSyntheticAppleEmail ? emailStr : null),
      displayName: rawProfile.appleName || null,
      avatarUrl: null,
      label: appleConnected
        ? (rawProfile.appleEmail || rawProfile.appleName || (isSyntheticAppleEmail ? 'Apple ID (Private Relay)' : emailStr) || 'Connected via Apple')
        : '',
    },
    facebook: {
      connected: facebookConnected,
      subjectId: rawProfile.facebookSub || null,
      email: rawProfile.facebookEmail || null,
      displayName: rawProfile.facebookName || null,
      avatarUrl: rawProfile.facebookPicture || null,
      label: facebookConnected
        ? (rawProfile.facebookEmail || rawProfile.facebookName || (isSyntheticFacebookEmail ? 'Connected via Facebook' : emailStr) || 'Connected via Facebook')
        : '',
    },
    microsoft: {
      connected: microsoftConnected,
      subjectId: rawProfile.microsoftSub || null,
      email: rawProfile.microsoftEmail || (!isSyntheticEmail && microsoftConnected ? emailStr : null),
      displayName: rawProfile.microsoftName || null,
      avatarUrl: null,
      label: microsoftConnected
        ? (rawProfile.microsoftEmail || rawProfile.microsoftName || (!isSyntheticEmail ? emailStr : '') || 'Connected via Microsoft')
        : '',
    },
  };

  return {
    id: String(userRecord?.id || rawProfile?.id || ''),
    email: emailStr,
    firstName,
    lastName,
    fullName,
    avatarUrl,
    role: String(userRecord?.role || rawProfile?.role || 'user'),
    hasPassword,
    isSyntheticEmail,
    syntheticProvider: isSyntheticFacebookEmail ? 'facebook' : (isSyntheticAppleEmail ? 'apple' : null),
    connectedProviders,
    preferences: rawProfile.preferences || {},
    createdAt: userRecord?.createdAt,
    updatedAt: userRecord?.updatedAt,
  };
}

/**
 * Links or authenticates a verified `OAuthNormalizedIdentity` against `UserProfileStoragePort`.
 * Automatically upgrades synthetic `@facebook.*` emails when a verified real email is later provided.
 */
export async function authenticateOrLinkSocialAccount({
  identity,
  linkUserId = null,
  storagePort,
  lifecyclePort = null,
  platform = 'web',
  syntheticEmailDomain = '@facebook.app.local',
}) {
  if (!identity || !identity.provider || !identity.subjectId) {
    throw new Error('Valid OAuthNormalizedIdentity (provider + subjectId) is required.');
  }
  if (!storagePort) {
    throw new Error('UserProfileStoragePort is required.');
  }

  const provider = identity.provider;
  const domainSuffix = syntheticEmailDomain.startsWith('@')
    ? syntheticEmailDomain.toLowerCase()
    : `@${syntheticEmailDomain.toLowerCase()}`;

  let verifiedEmail = identity.email ? String(identity.email).trim().toLowerCase() : null;
  if (!verifiedEmail) {
    if (provider === 'apple') {
      verifiedEmail = `${identity.subjectId}@privaterelay.appleid.com`.toLowerCase();
    } else if (provider === 'facebook') {
      verifiedEmail = `${identity.subjectId}${domainSuffix}`.toLowerCase();
    }
  }

  let targetUser = null;
  if (linkUserId) {
    targetUser = await storagePort.findUserById(linkUserId);
  }
  if (!targetUser) {
    targetUser = await storagePort.findUserByProviderSubject(provider, identity.subjectId);
  }
  if (!targetUser && verifiedEmail) {
    targetUser = await storagePort.findUserByEmail(verifiedEmail);
  }

  const existingProfile = targetUser?.profile && typeof targetUser.profile === 'object'
    ? { ...targetUser.profile }
    : {};

  // Upgrade synthetic Facebook email if a real verified email is now available and unclaimed
  let finalEmail = targetUser ? targetUser.email : verifiedEmail;
  const isCurrentSyntheticFb =
    targetUser?.email &&
    (targetUser.email.endsWith(domainSuffix) || /^[^@]+@facebook\.[a-z0-9.-]+$/i.test(targetUser.email));
  const isIncomingRealEmail =
    verifiedEmail &&
    !verifiedEmail.endsWith(domainSuffix) &&
    !verifiedEmail.endsWith('@privaterelay.appleid.com');

  if (targetUser && isCurrentSyntheticFb && isIncomingRealEmail) {
    const emailOwner = await storagePort.findUserByEmail(verifiedEmail);
    if (!emailOwner || emailOwner.id === targetUser.id) {
      finalEmail = verifiedEmail;
    }
  }

  const providerPatch = {
    [`${provider}Sub`]: identity.subjectId,
    [`${provider}Connected`]: true,
    ...(verifiedEmail ? { [`${provider}Email`]: verifiedEmail } : {}),
    ...(identity.fullName ? { [`${provider}Name`]: identity.fullName } : {}),
    ...(identity.avatarUrl ? { [`${provider}Picture`]: identity.avatarUrl } : {}),
    ...(identity.accessToken ? { [`${provider}AccessToken`]: identity.accessToken } : {}),
    ...(identity.refreshToken ? { [`${provider}RefreshToken`]: identity.refreshToken } : {}),
  };

  const mergedProfile = {
    ...existingProfile,
    ...providerPatch,
    firstName: existingProfile.firstName || identity.firstName || '',
    lastName: existingProfile.lastName || identity.lastName || '',
    fullName: existingProfile.fullName || existingProfile.full_name || identity.fullName || '',
    full_name: existingProfile.full_name || existingProfile.fullName || identity.fullName || '',
    avatarUrl: existingProfile.avatarUrl || identity.avatarUrl || '',
  };

  let savedRecord;
  const isNewUser = !targetUser;
  if (targetUser) {
    savedRecord = await storagePort.updateUser(targetUser.id, {
      email: finalEmail,
      profile: mergedProfile,
    });
  } else {
    savedRecord = await storagePort.createUser({
      email: finalEmail,
      role: 'user',
      profile: mergedProfile,
    });
  }

  const normalizedUser = normalizeUserProfile(savedRecord, { syntheticEmailDomain });

  if (isNewUser && lifecyclePort?.onUserCreated) {
    await lifecyclePort.onUserCreated({ user: normalizedUser, provider });
  } else if (linkUserId && lifecyclePort?.onSocialAccountLinked) {
    await lifecyclePort.onSocialAccountLinked({ user: normalizedUser, provider });
  }
  if (lifecyclePort?.onUserLoggedIn) {
    await lifecyclePort.onUserLoggedIn({ user: normalizedUser, provider, platform });
  }

  return {
    user: normalizedUser,
    isNewUser,
    linkedProvider: provider,
  };
}

/**
 * Disconnects a social provider while preventing account lockout (user must retain at least 1 other connected provider or a password).
 */
export async function disconnectSocialAccount({
  userId,
  provider,
  storagePort,
  lifecyclePort = null,
  syntheticEmailDomain = '@facebook.app.local',
}) {
  if (!PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported social provider: ${provider}`);
  }
  const userRecord = await storagePort.findUserById(userId);
  if (!userRecord) {
    throw new Error('User not found.');
  }

  const current = normalizeUserProfile(userRecord, { syntheticEmailDomain });
  const activeProviders = PROVIDERS.filter((p) => current.connectedProviders[p]?.connected);
  const remainingProviders = activeProviders.filter((p) => p !== provider);

  if (!current.hasPassword && remainingProviders.length === 0) {
    throw new Error(
      `Cannot disconnect ${provider}: it is your only sign-in method and no password is set on your account.`
    );
  }

  const nextProfile = {
    ...(userRecord.profile || {}),
    [`${provider}Connected`]: false,
    [`${provider}Sub`]: null,
    [`${provider}AccessToken`]: null,
    [`${provider}RefreshToken`]: null,
  };

  const updatedRecord = await storagePort.updateUser(userId, { profile: nextProfile });
  const normalizedUser = normalizeUserProfile(updatedRecord, { syntheticEmailDomain });

  if (lifecyclePort?.onSocialAccountDisconnected) {
    await lifecyclePort.onSocialAccountDisconnected({ user: normalizedUser, provider });
  }

  return normalizedUser;
}
