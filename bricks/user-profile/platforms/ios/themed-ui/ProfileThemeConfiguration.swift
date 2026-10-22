//
// ProfileThemeConfiguration.swift
// bricks/user-profile/platforms/ios/themed-ui
//
// SwiftUI equivalent of `ProfileBrandThemePort` & `ProfileUISlotsPort`.
// Zero hardcoded SnapCal colors or fonts—each host app injects its own brand tokens.
//

import SwiftUI

public enum SocialButtonStyleVariant: String, Sendable {
    case filled
    case outline
    case minimal
}

public struct ProfileThemeConfiguration: Sendable {
    public let appName: String
    public let primaryHex: String
    public let primaryForegroundHex: String
    public let surfaceHex: String
    public let backgroundHex: String
    public let textHex: String
    public let textMutedHex: String
    public let borderHex: String
    public let dangerHex: String
    public let cardCornerRadius: CGFloat
    public let buttonCornerRadius: CGFloat
    public let socialButtonVariant: SocialButtonStyleVariant

    public init(
        appName: String,
        primaryHex: String,
        primaryForegroundHex: String,
        surfaceHex: String,
        backgroundHex: String,
        textHex: String,
        textMutedHex: String,
        borderHex: String,
        dangerHex: String,
        cardCornerRadius: CGFloat = 16,
        buttonCornerRadius: CGFloat = 12,
        socialButtonVariant: SocialButtonStyleVariant = .outline
    ) {
        self.appName = appName
        self.primaryHex = primaryHex
        self.primaryForegroundHex = primaryForegroundHex
        self.surfaceHex = surfaceHex
        self.backgroundHex = backgroundHex
        self.textHex = textHex
        self.textMutedHex = textMutedHex
        self.borderHex = borderHex
        self.dangerHex = dangerHex
        self.cardCornerRadius = cardCornerRadius
        self.buttonCornerRadius = buttonCornerRadius
        self.socialButtonVariant = socialButtonVariant
    }
}

public struct SocialLoginButtonGroupView<HeaderSlot: View>: View {
    public let theme: ProfileThemeConfiguration
    public let onSelectProvider: (SocialProviderId) -> Void
    public let headerSlot: HeaderSlot

    public init(
        theme: ProfileThemeConfiguration,
        onSelectProvider: @escaping (SocialProviderId) -> Void,
        @ViewBuilder headerSlot: () -> HeaderSlot
    ) {
        self.theme = theme
        self.onSelectProvider = onSelectProvider
        self.headerSlot = headerSlot()
    }

    public var body: some View {
        VStack(spacing: 12) {
            headerSlot
            ForEach(SocialProviderId.allCases, id: \.rawValue) { provider in
                Button(action: { onSelectProvider(provider) }) {
                    Text(provider.rawValue.capitalized)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .cornerRadius(theme.buttonCornerRadius)
            }
        }
    }
}
