# Phase 1 Spec: Extract SnapCal Multi-Platform OAuth, User Profile & Pluggable UX/UI Brick (`FEAT-120`)

## 1. Goal Description
Extract the User Profile Management and 4-Provider Social Login architecture (`Google`, `Facebook`, `Apple`, `Microsoft`) from `../SnapCal` into `antigravity-memory-bank/bricks/user-profile/` as a shared, platform-adaptive Hexagonal Brick with a **Headless + Design-Token Theming Engine** so each sister repo (`SnapCal`, `BinaryDay`, `RemoveBackGround`) can plug in its own branding, UX/UI mockups, and `docs/BRAND_BOOK.md` styling without modifying core brick files.

## 2. User Review Required & Mandates
> [!IMPORTANT]
> **Explicit One-Time Exemption to Mandate #8 (Sibling Repo Read):**
> For this ticket ONLY, you are explicitly authorized to inspect `../SnapCal` to read its User Profile, OAuth (`Google`, `Facebook`, `Apple`, `Microsoft`), and UI components across Web, iOS, and Android. Batch all reads into 1–2 tool turns to respect the `≤ 8 Tool Turns` budget.

> [!WARNING]
> **Strict Isolation, Multi-Platform & Pluggable UX/UI Guardrails:**
> - **Zero Hardcoded Brand Styles in Shared UI:** Strip all hardcoded `SnapCal` hex colors, brand logos, fonts, bundle IDs (`com.snapcal`), and DB calls from `bricks/user-profile/`.
> - **Headless + Token/Slot UI Separation:** Separate all UI into:
>   1. `headless/` hooks/controllers (state, validation, OAuth triggers, avatar upload—0 styling).
>   2. `themed-ui/` components driven strictly by `ProfileBrandThemePort` (design tokens: colors, typography, radii, shadows, dark/light mode, brand logo) and `ProfileUISlotsPort` (injectable layout wrappers, custom buttons, or modal shells).
> - **Platform-Conditional Installation (`--platforms`):** `bin/cli.mjs brick install user-profile` must support `--platforms web,ios,android` (`SnapCal`, `BinaryDay`) and `--platforms web` (`RemoveBackGround`), excluding mobile native SDKs when `--platforms web` is used.
> - **NPM Distribution Whitelist:** Add `"bricks/"` to `"files"` in `package.json` while keeping `isSelfRepo` dogfood isolation intact.

## 3. Proposed Architecture in `antigravity-memory-bank`

### 1. `[NEW] bricks/user-profile/`
- `brick.json`: Manifest (`version: "1.0.0"`, `providers: ["google", "facebook", "apple", "microsoft"]`, `platforms: ["web", "ios", "android"]`, `theming: "tokens+slots+headless"`).
- `core/` (Domain, OAuth & Ports):
  - `ports.ts`:
    - `UserProfileStoragePort`: CRUD for profiles, linked `oauth_accounts`, account merging, GDPR export/delete.
    - `OAuthProviderPort`: Token verification & normalization for `Google`, `Facebook`, `Apple`, and `Microsoft` across Web, iOS, and Android.
    - `SessionTokenPort` & `AvatarStoragePort`.
    - `ProfileBrandThemePort`: Cross-platform design token contract (`colors: { primary, surface, background, text, border, danger }`, `typography: { fontFamily, headingScale, bodyScale }`, `radii: { card, button, avatar, input }`, `socialButtonVariant: "filled" | "outline" | "minimal"`, `brandAssets: { logoUrl, appName }`).
    - `ProfileUISlotsPort`: Optional component overrides (`AuthCardContainer`, `ProfileHeaderBanner`, `SocialButtonOverride`, `AvatarBadge`, `LoadingSpinner`) so any repo can drop in bespoke UX/UI components while keeping 100% of the underlying brick wiring.
  - `oauth/`: Verifiers for `Google`, `Facebook`, `Apple` (with relay email & first-login name capture), and `Microsoft`, plus `account-linking.service.ts`.
  - `profile.service.ts` & `schemas.ts`.
- `platforms/` (Headless Hooks + Token-Driven UI per Platform):
  - `platforms/web/`:
    - `headless/`: `useUserProfile()`, `useSocialAuth()`, `useAvatarUploader()`, `useAccountLinking()`.
    - `themed-ui/`: `<ProfileThemeProvider>`, `<SocialLoginButtonGroup>`, `<UserProfileSettingsView>`, `<AvatarCropUploadModal>` styled via CSS Custom Properties (`--ag-profile-*`) mapped from `ProfileBrandThemePort` + `slots` support.
  - `platforms/ios/`:
    - `headless/`: Swift view models & native Apple/Google/Facebook/Microsoft OAuth coordinators.
    - `themed-ui/`: SwiftUI views consuming a `ProfileThemeConfiguration` struct + `@ViewBuilder` slot overrides.
  - `platforms/android/`:
    - `headless/`: Kotlin view models & Credential Manager / OAuth intent bridges.
    - `themed-ui/`: Jetpack Compose / native UI views consuming `ProfileThemeTokens` + Composable slot lambdas.
- `adapters/templates/`:
  - `postgres-prisma.adapter.ts`, `oauth-env.config.ts`, `mock.adapter.ts`.
  - `theme.adapter.template.ts`: Starter brand theme & UI slot file mapped to the host repo's `docs/BRAND_BOOK.md` and `docs/UX_BRIEF.md`.
- `testing/contract.spec.ts`: Automated contract tests for profile CRUD, 4 OAuth providers, account linking, and theme token validation.

### 2. `[MODIFY] bin/cli.mjs` & `package.json`
- Add `"bricks/"` to `package.json` `"files"`.
- Add `brick install <name> [--platforms web,ios,android | --platforms web] [-y] [--commit]` and `brick upgrade <name>`:
  - Copies `core/`, `testing/`, and the selected `platforms/*` into the consumer repo.
  - Non-destructively scaffolds `src/adapters/user-profile.adapter.ts`, `src/adapters/oauth-config.adapter.ts`, and `src/adapters/user-profile-theme.adapter.ts` ONLY if missing (so `brick upgrade` never overwrites a repo's custom branding or UX/UI overrides!).
  - Installs `.agents/rules/brick-user-profile.md` (`trigger: model_decision`) instructing the agent to customize branding/UX strictly via `user-profile-theme.adapter.ts` or headless hooks—never by mutating shared brick `core/`.

### 3. `[NEW] .agents/rules/brick-governance.md`
- Snake_case `trigger: model_decision` frontmatter enforcing sequential PRs and separating core brick upgrades from repo-specific UX/UI branding.

## 4. Verification Plan
1. `npm test` — Verify `contract.spec.ts` passes all 4 OAuth provider flows, profile CRUD, and `ProfileBrandThemePort` token injection tests.
2. `node bin/cli.mjs brick list` — Verify `user-profile@1.0.0` metadata.
3. `npm run lint:memory` — Verify `< 50 lines` on `AGENTS.md`, `< 150 lines` on `memory-bank/*.md`, and valid `trigger: model_decision` frontmatter.

## 5. Universal Greenfield & Multi-Brick Extensibility Requirements
To ensure `bricks/user-profile/` and the Brick Engine work seamlessly for any brand-new future project (not just existing sister repos) and compose cleanly with future bricks:

1. **Canonical Greenfield Schema Generators (`bricks/user-profile/schemas/`)**:
   - Include `001_user_profile_oauth.sql` (PostgreSQL 16) and `user-profile.prisma` so running `brick install user-profile --with-schema` in any greenfield repo provisions the `users`, `oauth_accounts`, and `sessions` tables automatically.
2. **Inter-Brick Lifecycle Event Port (`ProfileLifecycleEventPort` in `core/ports.ts`)**:
   - Emit typed domain events (`onUserCreated`, `onUserLoggedIn`, `onSocialAccountLinked`, `onProfileUpdated`, `onAccountDeleted`) so future bricks (e.g., Billing/Stripe, Credits, Notifications, Analytics) can subscribe to user lifecycle events with zero circular dependencies.
3. **Day-1 Local Mock OAuth Mode (`adapters/templates/dev-mock-oauth.adapter.ts`)**:
   - Provide a zero-credential local development OAuth simulator (`USE_MOCK_OAUTH=true` in `development`) so brand-new projects can test all 4 login flows (Google, Facebook, Apple, Microsoft) and UI states before external OAuth apps are registered, while keeping Mandate #6 enforced for production closure.
4. **Interactive `init` Integration & Auto-Env Sync (`bin/cli.mjs`)**:
   - Update `npx github:johnny-saigon/antigravity-memory-bank init` to prompt which shared bricks to install on new projects, automatically passing the selected target platforms (`--platforms`) and appending required OAuth keys from `brick.json` to `.env.example` and `memory-bank/integrationsAndCustomizations.md` via `scripts/sync-memory-context.mjs`.
5. **App Store / GDPR Compliance & Native Doctor (`brick doctor`)**:
   - Bake Apple Sign-In token revocation (`5.1.1(v)`), Meta data-deletion callbacks, and an `i18n` copy dictionary port into `core/`.
   - Add `brick doctor user-profile` to `bin/cli.mjs` to validate `.env` keys, iOS `Info.plist` / Associated Domains, and Android `AndroidManifest.xml` intent schemes.