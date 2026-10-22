/**
 * Token-Driven Web Theme & Component Factories (`bricks/user-profile/platforms/web/themed-ui/theme-tokens.ts`)
 *
 * Pure `.ts` module so both Node.js v24 native `--test` and Web bundlers (Vite/Next.js `.tsx`)
 * can execute and test `--ag-profile-*` CSS Custom Property generation and component factories.
 */

import { validateAndBuildThemeCssVars } from '../../../core/schemas.ts';
import { DEFAULT_I18N_DICTIONARY } from '../../../core/profile.service.ts';
import { SOCIAL_PROVIDERS_META } from '../headless/useSocialAuth.ts';
import { computeSourceCropRect, computeAvatarInitial } from '../headless/useAvatarUploader.ts';
import { deriveConnectedProvidersMap } from '../headless/useAccountLinking.ts';

export function buildProfileThemeStyleObject(theme) {
  const cssVars = validateAndBuildThemeCssVars(theme);
  return {
    ...cssVars,
    fontFamily: 'var(--ag-profile-font-body)',
    color: 'var(--ag-profile-color-text)',
    backgroundColor: 'var(--ag-profile-color-bg)',
  };
}

export function getSocialButtonStyles(variant = 'outline') {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    height: '3rem',
    padding: '0 1rem',
    fontFamily: 'var(--ag-profile-font-body)',
    fontSize: 'calc(0.875rem * var(--ag-profile-scale-body, 1))',
    fontWeight: 600,
    borderRadius: 'var(--ag-profile-radius-button)',
    boxShadow: 'var(--ag-profile-shadow-button)',
    cursor: 'pointer',
    transition: 'opacity 150ms ease, transform 100ms ease',
  };

  if (variant === 'filled') {
    return {
      ...base,
      backgroundColor: 'var(--ag-profile-color-primary)',
      color: 'var(--ag-profile-color-primary-fg)',
      border: '1px solid var(--ag-profile-color-primary)',
    };
  }
  if (variant === 'minimal') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: 'var(--ag-profile-color-text)',
      border: '1px solid transparent',
    };
  }
  return {
    ...base,
    backgroundColor: 'var(--ag-profile-color-surface)',
    color: 'var(--ag-profile-color-text)',
    border: '1px solid var(--ag-profile-color-border)',
  };
}

export function createProfileThemeProvider(React) {
  const ProfileThemeContext = React.createContext(null);

  function ProfileThemeProvider({ theme, slots = {}, i18n = {}, children }) {
    const styleObj = React.useMemo(() => buildProfileThemeStyleObject(theme), [theme]);
    const dictionary = React.useMemo(() => ({ ...DEFAULT_I18N_DICTIONARY, ...i18n }), [i18n]);
    const value = React.useMemo(
      () => ({
        theme,
        slots,
        cssVars: styleObj,
        t: (key) => dictionary[key] || key,
      }),
      [theme, slots, styleObj, dictionary]
    );

    return React.createElement(
      ProfileThemeContext.Provider,
      { value },
      React.createElement(
        'div',
        {
          'data-ag-brick': 'user-profile',
          'data-ag-theme-mode': theme.mode || 'system',
          style: styleObj,
        },
        children
      )
    );
  }

  function useProfileTheme() {
    const ctx = React.useContext(ProfileThemeContext);
    if (!ctx) throw new Error('useProfileTheme must be used inside a <ProfileThemeProvider>.');
    return ctx;
  }

  return { ProfileThemeProvider, useProfileTheme, ProfileThemeContext };
}

export function createSocialLoginButtonGroup(React, useProfileTheme) {
  return function SocialLoginButtonGroup({
    onSelectProvider,
    loadingProvider = null,
    disabled = false,
    providers = SOCIAL_PROVIDERS_META,
  }) {
    const { theme, slots } = useProfileTheme();
    const buttonStyle = getSocialButtonStyles(theme.socialButtonVariant);

    if (slots?.SocialButtonOverride) {
      const CustomButton = slots.SocialButtonOverride;
      return React.createElement(
        'div',
        {
          'data-ag-component': 'social-login-group',
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' },
        },
        providers.map((p) =>
          React.createElement(CustomButton, {
            key: p.id,
            provider: p.id,
            label: p.label,
            loading: loadingProvider === p.id,
            disabled: disabled || Boolean(loadingProvider),
            onClick: () => onSelectProvider(p.id),
          })
        )
      );
    }

    return React.createElement(
      'div',
      {
        'data-ag-component': 'social-login-group',
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' },
      },
      providers.map((p) =>
        React.createElement(
          'button',
          {
            key: p.id,
            type: 'button',
            'data-provider': p.id,
            disabled: disabled || Boolean(loadingProvider),
            onClick: () => onSelectProvider(p.id),
            style: buttonStyle,
          },
          loadingProvider === p.id ? `Connecting ${p.label}…` : p.label
        )
      )
    );
  };
}

export function createAvatarCropUploadModal(React, useProfileTheme) {
  return function AvatarCropUploadModal({ src, onConfirm, onCancel, outputSize = 512 }) {
    const [scale] = React.useState(1);
    const [minScale] = React.useState(1);
    const [offset] = React.useState({ x: 0, y: 0 });
    const [saving, setSaving] = React.useState(false);

    const applyCrop = async (imgWidth = 512, imgHeight = 512, frameSize = 320) => {
      setSaving(true);
      try {
        const rect = computeSourceCropRect({
          imgWidth,
          imgHeight,
          scale,
          offsetX: offset.x,
          offsetY: offset.y,
          frameSize,
          outputSize,
        });
        await onConfirm({ src, cropRect: rect, scale, minScale });
      } finally {
        setSaving(false);
      }
    };

    return React.createElement(
      'div',
      { 'data-ag-component': 'avatar-crop-modal' },
      React.createElement('button', { type: 'button', onClick: onCancel, disabled: saving }, 'Cancel'),
      React.createElement('button', { type: 'button', onClick: () => applyCrop(), disabled: saving }, 'Apply')
    );
  };
}

export function createUserProfileSettingsView(React, useProfileTheme) {
  return function UserProfileSettingsView({
    user,
    onConnectProvider,
    onDisconnectProvider,
    syntheticEmailDomain = '@facebook.app.local',
  }) {
    const { theme, slots, t } = useProfileTheme();
    const connectedMap = deriveConnectedProvidersMap(user, { syntheticEmailDomain });
    const initial = computeAvatarInitial(user?.fullName || user?.email, { syntheticEmailDomain });
    const HeaderSlot = slots?.ProfileHeaderBanner || null;
    const CardContainer = slots?.AuthCardContainer || 'section';

    return React.createElement(
      'div',
      { 'data-ag-component': 'user-profile-settings-view' },
      HeaderSlot ? React.createElement(HeaderSlot, { user, appName: theme.brandAssets.appName }) : null,
      React.createElement(CardContainer, { 'data-section': 'profile-management', 'data-avatar': initial }, t('profileSectionTitle')),
      React.createElement(
        CardContainer,
        { 'data-section': 'connected-accounts' },
        ['google', 'apple', 'facebook', 'microsoft'].map((providerId) => {
          const isConnected = Boolean(connectedMap[providerId]);
          return React.createElement(
            'button',
            {
              key: providerId,
              type: 'button',
              onClick: () =>
                isConnected
                  ? onDisconnectProvider && onDisconnectProvider(providerId)
                  : onConnectProvider && onConnectProvider(providerId),
            },
            isConnected ? t('disconnectButton') : t('connectButton')
          );
        })
      )
    );
  };
}
