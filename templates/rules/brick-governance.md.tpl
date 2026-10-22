---
trigger: model_decision
description: "Apply whenever creating, installing, upgrading, or customizing Hexagonal Bricks in bricks/* or src/adapters/* (such as bricks/user-profile)."
---
# Hexagonal Brick Governance & Pluggable UX/UI Invariants

1. **Strict Core vs. Adapter Separation**:
   - Shared bricks in `bricks/<name>/core/` and `bricks/<name>/platforms/` MUST remain 100% free of project-specific brand hex colors, logos, bundle IDs (`com.snapcal`, `com.binaryday`), or direct database client calls.
   - All project-specific database bindings (`user-profile.adapter.ts`), OAuth `.env` mappings (`oauth-config.adapter.ts`), and brand theme tokens/UI slots (`user-profile-theme.adapter.ts`) live exclusively in the consumer repository's `src/adapters/` directory.
2. **Headless + Design-Token/Slot Customization (`ProfileBrandThemePort` & `ProfileUISlotsPort`)**:
   - To customize UX/UI for a specific app (`SnapCal`, `BinaryDay`, `RemoveBackGround`, or any greenfield app), edit `src/adapters/user-profile-theme.adapter.ts` (mapped from `docs/BRAND_BOOK.md` and `docs/UX_BRIEF.md`) or bind bespoke components to `bricks/user-profile/platforms/<platform>/headless/` hooks.
   - Never mutate shared `bricks/user-profile/core/` files to implement single-app visual changes.
3. **Non-Destructive Upgrades & Sequential Rollouts**:
   - `brick upgrade <name>` updates `core/`, `testing/`, and the selected `platforms/*` (`--platforms web,ios,android` or `--platforms web`) while preserving existing `src/adapters/*` files intact.
   - Roll out brick updates sequentially (1 PR per repository, passing `npm test` and `brick doctor <name>` before moving to the next repository).
