/**
 * Host Repository Brand Theme & UI Slot Adapter Template (`bricks/user-profile/adapters/templates/theme.adapter.template.ts`)
 *
 * Scaffolded non-destructively to `src/adapters/user-profile-theme.adapter.ts` on `brick install`.
 * Customize these tokens to match your repository's `docs/BRAND_BOOK.md` and `docs/UX_BRIEF.md`.
 * NEVER modify `bricks/user-profile/core/` to change colors, typography, or layout shells.
 */

export const userProfileBrandTheme = {
  colors: {
    primary: '#2563EB',
    primaryForeground: '#FFFFFF',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    danger: '#EF4444',
    success: '#10B981',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    displayFontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
    headingScale: 1,
    bodyScale: 1,
  },
  radii: {
    card: '16px',
    button: '12px',
    avatar: '9999px',
    input: '12px',
  },
  shadows: {
    card: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
    button: 'none',
  },
  mode: 'system',
  socialButtonVariant: 'outline',
  brandAssets: {
    appName: 'MyApp',
    logoUrl: '/logo.svg',
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms',
  },
};

/**
 * Optional UI Component Slot Overrides (`ProfileUISlotsPort`).
 * Provide custom React/SwiftUI/Compose wrappers here while keeping 100% of the brick's OAuth & profile wiring.
 */
export const userProfileUISlots = {
  AuthCardContainer: undefined,
  ProfileHeaderBanner: undefined,
  SocialButtonOverride: undefined,
  AvatarBadge: undefined,
  LoadingSpinner: undefined,
};
