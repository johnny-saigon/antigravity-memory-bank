//
// CredentialManagerOAuthBridge.kt
// bricks/user-profile/platforms/android/headless
//
// Headless Android Credential Manager + Custom Tabs PKCE OAuth bridge
// for Google, Apple, Microsoft, and Facebook. Zero hardcoded brand assets or applicationId.
//

package com.antigravity.bricks.userprofile.headless

enum class SocialProviderId(val id: String) {
    GOOGLE("google"),
    APPLE("apple"),
    MICROSOFT("microsoft"),
    FACEBOOK("facebook")
}

data class AndroidOAuthConfig(
    val apiBaseUrl: String,
    val appScheme: String,
    val googleWebClientId: String,
    val microsoftMobileClientId: String? = null,
    val facebookAppId: String? = null
) {
    val callbackUri: String
        get() = "$appScheme://auth/callback"
}

class UserProfileViewModel {
    var firstName: String = ""
    var lastName: String = ""
    var email: String = ""
    var avatarUrl: String? = null
    var hasPassword: Boolean = true
    val connectedProviders: MutableSet<SocialProviderId> = mutableSetOf()

    fun canDisconnect(provider: SocialProviderId): Boolean {
        val remaining = connectedProviders.filter { it != provider }
        return hasPassword || remaining.isNotEmpty()
    }
}
