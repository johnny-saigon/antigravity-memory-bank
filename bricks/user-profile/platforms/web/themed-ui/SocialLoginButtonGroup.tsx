/**
 * Token-Driven 4-Provider Social Login Button Group (`bricks/user-profile/platforms/web/themed-ui/SocialLoginButtonGroup.tsx`)
 *
 * Extracted from `../SnapCal/apps/web/src/components/SocialAuthButtons.jsx`.
 * Styled strictly via `--ag-profile-*` CSS Custom Properties (`ProfileBrandThemePort`)
 * and supports `slots.SocialButtonOverride` (`ProfileUISlotsPort`).
 */

import { SOCIAL_PROVIDERS_META } from '../headless/useSocialAuth.ts';

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
