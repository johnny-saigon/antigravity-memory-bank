/**
 * Token-Driven User Profile Settings & Connected Social Accounts View (`bricks/user-profile/platforms/web/themed-ui/UserProfileSettingsView.tsx`)
 *
 * Extracted from `../SnapCal/apps/web/src/components/settings/AccountSettings.jsx` and `ConnectedAccounts.jsx`.
 * 100% de-branded: consumes `--ag-profile-*` CSS Custom Properties (`ProfileBrandThemePort`) and `ProfileUISlotsPort`.
 */

import { deriveConnectedProvidersMap } from '../headless/useAccountLinking.ts';
import { computeAvatarInitial } from '../headless/useAvatarUploader.ts';

export function createUserProfileSettingsView(React, useProfileTheme) {
  return function UserProfileSettingsView({
    user,
    onUpdateProfile,
    onConnectProvider,
    onDisconnectProvider,
    onDeleteAccount,
    syntheticEmailDomain = '@facebook.app.local',
  }) {
    const { theme, slots, t } = useProfileTheme();
    const connectedMap = deriveConnectedProvidersMap(user, { syntheticEmailDomain });
    const initial = computeAvatarInitial(user?.fullName || user?.email, { syntheticEmailDomain });
    const HeaderSlot = slots?.ProfileHeaderBanner || null;
    const CardContainer = slots?.AuthCardContainer || 'section';

    const cardStyle = {
      borderRadius: 'var(--ag-profile-radius-card)',
      border: '1px solid var(--ag-profile-color-border)',
      backgroundColor: 'var(--ag-profile-color-surface)',
      boxShadow: 'var(--ag-profile-shadow-card)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    };

    return React.createElement(
      'div',
      { 'data-ag-component': 'user-profile-settings-view' },
      HeaderSlot ? React.createElement(HeaderSlot, { user, appName: theme.brandAssets.appName }) : null,
      React.createElement(
        CardContainer,
        { style: cardStyle, 'data-section': 'profile-management' },
        React.createElement(
          'h2',
          { style: { fontFamily: 'var(--ag-profile-font-display)', margin: 0 } },
          t('profileSectionTitle')
        ),
        React.createElement(
          'p',
          { style: { color: 'var(--ag-profile-color-text-muted)', marginTop: '0.25rem' } },
          t('profileSectionSubtitle')
        ),
        React.createElement(
          'div',
          {
            'data-avatar-badge': initial,
            style: {
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: 'var(--ag-profile-radius-avatar)',
              backgroundColor: 'var(--ag-profile-color-primary)',
              color: 'var(--ag-profile-color-primary-fg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              marginTop: '1rem',
            },
          },
          initial
        )
      ),
      React.createElement(
        CardContainer,
        { style: cardStyle, 'data-section': 'connected-accounts' },
        React.createElement(
          'h2',
          { style: { fontFamily: 'var(--ag-profile-font-display)', margin: 0 } },
          t('connectedAccountsTitle')
        ),
        ['google', 'apple', 'facebook', 'microsoft'].map((providerId) => {
          const isConnected = Boolean(connectedMap[providerId]);
          return React.createElement(
            'div',
            {
              key: providerId,
              'data-provider-row': providerId,
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--ag-profile-color-border)',
              },
            },
            React.createElement(
              'span',
              { style: { fontWeight: 600, textTransform: 'capitalize' } },
              `${providerId}: ${isConnected ? connectedMap[providerId] : 'Not connected'}`
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () =>
                  isConnected
                    ? onDisconnectProvider && onDisconnectProvider(providerId)
                    : onConnectProvider && onConnectProvider(providerId),
                style: {
                  borderRadius: 'var(--ag-profile-radius-button)',
                  border: '1px solid var(--ag-profile-color-border)',
                  padding: '0.375rem 0.75rem',
                },
              },
              isConnected ? t('disconnectButton') : t('connectButton')
            )
          );
        })
      )
    );
  };
}
