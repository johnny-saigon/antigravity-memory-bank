//
// ProfileThemeTokens.kt
// bricks/user-profile/platforms/android/themed-ui
//
// Jetpack Compose design tokens (`ProfileBrandThemePort`) and `@Composable` slot lambdas (`ProfileUISlotsPort`).
// Zero hardcoded SnapCal brand colors or typography.
//

package com.antigravity.bricks.userprofile.themedui

data class ProfileThemeTokens(
    val appName: String,
    val primaryHex: String,
    val primaryForegroundHex: String,
    val surfaceHex: String,
    val backgroundHex: String,
    val textHex: String,
    val textMutedHex: String,
    val borderHex: String,
    val dangerHex: String,
    val cardRadiusDp: Int = 16,
    val buttonRadiusDp: Int = 12,
    val socialButtonVariant: String = "outline"
)
