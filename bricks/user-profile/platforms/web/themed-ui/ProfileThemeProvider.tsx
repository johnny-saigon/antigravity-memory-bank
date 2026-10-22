/**
 * Token-Driven Web Theme & Slot Provider (`bricks/user-profile/platforms/web/themed-ui/ProfileThemeProvider.tsx`)
 *
 * Maps `ProfileBrandThemePort` design tokens to scoped `--ag-profile-*` CSS Custom Properties
 * and exposes `ProfileUISlotsPort` + `ProfileI18nPort` to all themed child components.
 * Zero hardcoded brand hex colors or fonts.
 */

import { validateAndBuildThemeCssVars } from '../../../core/schemas.ts';
import { DEFAULT_I18N_DICTIONARY } from '../../../core/profile.service.ts';

export function buildProfileThemeStyleObject(theme) {
  const cssVars = validateAndBuildThemeCssVars(theme);
  return {
    ...cssVars,
    fontFamily: 'var(--ag-profile-font-body)',
    color: 'var(--ag-profile-color-text)',
    backgroundColor: 'var(--ag-profile-color-bg)',
  };
}

export function createProfileThemeProvider(React) {
  const ProfileThemeContext = React.createContext(null);

  function ProfileThemeProvider({ theme, slots = {}, i18n = {}, children }) {
    const styleObj = React.useMemo(() => buildProfileThemeStyleObject(theme), [theme]);
    const dictionary = React.useMemo(
      () => ({ ...DEFAULT_I18N_DICTIONARY, ...i18n }),
      [i18n]
    );
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
    if (!ctx) {
      throw new Error('useProfileTheme must be used inside a <ProfileThemeProvider>.');
    }
    return ctx;
  }

  return { ProfileThemeProvider, useProfileTheme, ProfileThemeContext };
}
