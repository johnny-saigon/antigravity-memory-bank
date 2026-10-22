//
// NativeSocialOAuthCoordinator.swift
// bricks/user-profile/platforms/ios/headless
//
// Extracted from ../SnapCal/apps/mobile/app/(auth)/login.tsx and lib/google-auth.ts.
// Pure headless iOS coordinator for Apple (ASAuthorizationAppleIDProvider),
// Google (RFC 8252 reversed client ID scheme), Microsoft (Entra PKCE), and Facebook.
// Zero hardcoded bundle IDs or brand styles.
//

import AuthenticationServices
import Foundation

public enum SocialProviderId: String, CaseIterable, Sendable {
    case google
    case apple
    case microsoft
    case facebook
}

public struct IOSOAuthConfiguration: Sendable {
    public let apiBaseUrl: URL
    public let appScheme: String
    public let googleIosClientId: String

    public init(apiBaseUrl: URL, appScheme: String, googleIosClientId: String) {
        self.apiBaseUrl = apiBaseUrl
        self.appScheme = appScheme
        self.googleIosClientId = googleIosClientId
    }

    /// Computes RFC 8252 reversed client ID scheme (`com.googleusercontent.apps.<ID>:/oauth2redirect`)
    public var googleReversedRedirectUri: String {
        let prefix = googleIosClientId.replacingOccurrences(of: ".apps.googleusercontent.com", with: "")
        return "com.googleusercontent.apps.\(prefix):/oauth2redirect"
    }

    public var defaultCallbackUri: String {
        return "\(appScheme)://auth/callback"
    }
}

public struct NativeSocialAuthPayload: Sendable {
    public let provider: SocialProviderId
    public let identityToken: String?
    public let authorizationCode: String?
    public let redirectUri: String?
    public let email: String?
    public let fullName: String?
}
