/**
 * Headless Connected Accounts & Account-Linking Controller (`bricks/user-profile/platforms/web/headless/useAccountLinking.ts`)
 *
 * Extracted from `../SnapCal/apps/web/src/components/settings/ConnectedAccounts.jsx`.
 * Derives connected state across Google, Apple, Facebook, and Microsoft and enforces lockout-safe disconnect.
 */

import { normalizeUserProfile } from '../../../core/oauth/account-linking.service.ts';

export function deriveConnectedProvidersMap(user, { syntheticEmailDomain = '@facebook.app.local' } = {}) {
  const normalized = normalizeUserProfile(user || {}, { syntheticEmailDomain });
  return {
    google: normalized.connectedProviders.google.label,
    apple: normalized.connectedProviders.apple.label,
    facebook: normalized.connectedProviders.facebook.label,
    microsoft: normalized.connectedProviders.microsoft.label,
    details: normalized.connectedProviders,
    canDisconnect(providerId) {
      const active = Object.entries(normalized.connectedProviders)
        .filter(([, v]) => v.connected)
        .map(([k]) => k);
      const remaining = active.filter((p) => p !== providerId);
      return normalized.hasPassword || remaining.length > 0;
    },
  };
}
