/**
 * Runtime Validation Schemas & Theme Token Helpers (`bricks/user-profile/core/schemas.ts`)
 *
 * Pure ES Module / TypeScript validators with zero hardcoded brand values.
 */

export const PASSWORD_STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/**
 * Evaluates password strength on a 0..4 scale (extracted from SnapCal AccountSettings).
 */
export function evaluatePasswordStrength(password = '') {
  if (!password || typeof password !== 'string') {
    return { score: 0, label: PASSWORD_STRENGTH_LABELS[0], isValid: false };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  const clamped = Math.min(score, 4);
  return {
    score: clamped,
    label: PASSWORD_STRENGTH_LABELS[clamped],
    isValid: password.length >= 8 && clamped >= 1,
  };
}

/**
 * Validates and sanitizes profile update input.
 */
export function validateProfileUpdate(input = {}, { syntheticEmailDomain = '@facebook.app.local' } = {}) {
  const errors = [];
  const sanitized = {};

  if (input.firstName !== undefined) {
    const first = String(input.firstName ?? '').trim();
    if (first.length > 100) errors.push('firstName must be 100 characters or fewer.');
    sanitized.firstName = first;
  }

  if (input.lastName !== undefined) {
    const last = String(input.lastName ?? '').trim();
    if (last.length > 100) errors.push('lastName must be 100 characters or fewer.');
    sanitized.lastName = last;
  }

  if (input.avatarUrl !== undefined) {
    const url = String(input.avatarUrl ?? '').trim();
    if (url && !/^https?:\/\/|^data:image\/|^\//i.test(url)) {
      errors.push('avatarUrl must be a valid HTTP(S), relative, or data URL.');
    }
    sanitized.avatarUrl = url;
  }

  if (input.email !== undefined) {
    const email = String(input.email ?? '').trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isSynthetic =
      email.endsWith(syntheticEmailDomain.toLowerCase()) ||
      email.endsWith('@privaterelay.appleid.com');
    if (!isValidEmail || isSynthetic) {
      errors.push('Please provide a valid non-synthetic email address.');
    } else {
      sanitized.email = email;
    }
  }

  if (input.preferences !== undefined && typeof input.preferences === 'object' && input.preferences !== null) {
    sanitized.preferences = { ...input.preferences };
  }

  return {
    valid: errors.length === 0,
    errors,
    data: sanitized,
  };
}

/**
 * Validates a `ProfileBrandThemePort` configuration and maps it to `--ag-profile-*` CSS Custom Properties.
 */
export function validateAndBuildThemeCssVars(theme) {
  if (!theme || typeof theme !== 'object') {
    throw new Error('ProfileBrandThemePort configuration object is required.');
  }
  const requiredColors = ['primary', 'primaryForeground', 'surface', 'background', 'text', 'textMuted', 'border', 'danger', 'success'];
  for (const key of requiredColors) {
    if (!theme.colors || typeof theme.colors[key] !== 'string' || !theme.colors[key].trim()) {
      throw new Error(`ProfileBrandThemePort missing required color token: colors.${key}`);
    }
  }
  if (!theme.typography || typeof theme.typography.fontFamily !== 'string') {
    throw new Error('ProfileBrandThemePort missing typography.fontFamily');
  }
  if (!theme.radii || typeof theme.radii.card !== 'string' || typeof theme.radii.button !== 'string') {
    throw new Error('ProfileBrandThemePort missing radii tokens');
  }
  if (!['filled', 'outline', 'minimal'].includes(theme.socialButtonVariant)) {
    throw new Error('ProfileBrandThemePort.socialButtonVariant must be "filled", "outline", or "minimal"');
  }
  if (!theme.brandAssets || typeof theme.brandAssets.appName !== 'string' || !theme.brandAssets.appName.trim()) {
    throw new Error('ProfileBrandThemePort.brandAssets.appName is required');
  }

  return {
    '--ag-profile-color-primary': theme.colors.primary,
    '--ag-profile-color-primary-fg': theme.colors.primaryForeground,
    '--ag-profile-color-surface': theme.colors.surface,
    '--ag-profile-color-bg': theme.colors.background,
    '--ag-profile-color-text': theme.colors.text,
    '--ag-profile-color-text-muted': theme.colors.textMuted,
    '--ag-profile-color-border': theme.colors.border,
    '--ag-profile-color-danger': theme.colors.danger,
    '--ag-profile-color-success': theme.colors.success,
    '--ag-profile-font-body': theme.typography.fontFamily,
    '--ag-profile-font-display': theme.typography.displayFontFamily || theme.typography.fontFamily,
    '--ag-profile-scale-heading': String(theme.typography.headingScale ?? 1),
    '--ag-profile-scale-body': String(theme.typography.bodyScale ?? 1),
    '--ag-profile-radius-card': theme.radii.card,
    '--ag-profile-radius-button': theme.radii.button,
    '--ag-profile-radius-avatar': theme.radii.avatar || '9999px',
    '--ag-profile-radius-input': theme.radii.input || theme.radii.button,
    '--ag-profile-shadow-card': theme.shadows?.card || '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
    '--ag-profile-shadow-button': theme.shadows?.button || 'none',
  };
}
