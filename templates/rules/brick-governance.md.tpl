---
trigger: model_decision
description: "Apply whenever creating, installing, upgrading, or customizing Hexagonal Bricks in bricks/* or src/adapters/* (such as bricks/user-profile)."
---
# Hexagonal Brick Governance & 3-Tier Pluggable UX/UI Architecture

1. **Three Decoupled Presentation Tiers Across Web, iOS & Android**:
   - **Tier A — Headless State & Behavior Hooks (`bricks/<name>/platforms/*/headless/`)**: 100% shared across all repos. Handles form validation, loading/error states, OAuth redirect/popup triggers (`useSocialAuth()`), optimistic avatar cropping/upload (`useAvatarUploader()`), and account-linking confirmation modals (`useUserProfile()` / `useAccountLinking()`). Zero CSS, zero colors, zero fonts.
   - **Tier B — Token-Driven Default Shell (`bricks/<name>/platforms/*/themed-ui/`)**: Shared layout primitives consuming `<ProfileThemeProvider slots={customSlots} theme={hostTheme}>`. Reads every color, border radius, typography scale, spacing unit, app logo, and social button variant (`pill`, `outline`, `icon-only`, `dark`/`light`) from `ProfileBrandThemePort`. Supports **Component Slots (`ProfileUISlotsPort`)** (e.g., `slots={{ CardWrapper: MyCustomCard }}`) without touching brick source code.
   - **Tier C — Host Brand Adapter (`src/adapters/user-profile-theme.adapter.ts`)**: 100% isolated per sister repository (`SnapCal`, `BinaryDay`, `RemoveBackGround`, or greenfield). Reads `docs/BRAND_BOOK.md` / `docs/UX_BRIEF.md` (or Tailwind / iOS `ColorAssets` / Android `MaterialTheme`) and feeds tokens/slots into the brick.
2. **Strict Core vs. Adapter Separation**:
   - Never hardcode project-specific hex colors, logos, bundle IDs, or direct DB calls inside `bricks/<name>/core/` or `bricks/<name>/platforms/`.
   - For future UX/UI redesigns (e.g., from Figma/Stitch `.zip` bundles attached via `npm run backlog attach <ID> <zip>` and planned with `/backlog-plan <ID>`), update **only** `src/adapters/user-profile-theme.adapter.ts` or `slots={{ ... }}`, leaving 100% of OAuth logins, security logic, and DB adapters untouched.
3. **Non-Destructive Upgrades & Sequential Rollouts**:
   - `brick upgrade <name>` updates `core/`, `testing/`, and selected `platforms/*` while preserving `src/adapters/*`. See [Brick & UX/UI Guide](docs/BRICK_ARCHITECTURE_GUIDE.md).
