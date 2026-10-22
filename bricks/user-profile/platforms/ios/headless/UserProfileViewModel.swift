//
// UserProfileViewModel.swift
// bricks/user-profile/platforms/ios/headless
//
// Extracted from ../SnapCal/apps/mobile/app/(tabs)/settings/index.tsx and lib/auth-context.tsx.
// Headless ObservableObject view model for iOS user profile management, password updates,
// connected social accounts, and App Store 5.1.1(v) compliant account deletion.
//

import Combine
import Foundation

@MainActor
public final class UserProfileViewModel: ObservableObject {
    @Published public var firstName: String = ""
    @Published public var lastName: String = ""
    @Published public var email: String = ""
    @Published public var avatarUrl: String?
    @Published public var hasPassword: Bool = true
    @Published public var isSyntheticEmail: Bool = false
    @Published public var connectedProviders: Set<SocialProviderId> = []
    @Published public var isSaving: Bool = false
    @Published public var statusMessage: String?

    public init() {}

    public func canDisconnect(provider: SocialProviderId) -> Bool {
        let remaining = connectedProviders.subtracting([provider])
        return hasPassword || !remaining.isEmpty
    }
}
