<!-- antigravity-doc-sync -->
# 🚀 antigravity-memory-bank — Migration, Brick & Release Log (`docs/operations/MIGRATION_AND_RELEASE_LOG.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Memory Progress**: [`memory-bank/progress.md`](../../memory-bank/progress.md)

## 1. Completed Milestones & Release Cutovers

<!-- ag-section:release-milestones:start -->
| Milestone ID | Title | Status |
| :--- | :--- | :--- |
| **`MILESTONE-1`** | v1.0–v1.3 Three-Tier Memory Bank, Auto-Scraper, Git Hooks & In-Place Upgrade | DONE |
| **`MILESTONE-2`** | v1.4 Zero-Token Backlog Engine, Review Pane Kanban & Isolated Dogfooding | DONE |
| **`MILESTONE-3`** | v1.5 Automated E2E CLI Verification & Template Parity Suite | DONE |
<!-- ag-section:release-milestones:end -->

---

## 2. Database Migrations & Installed Hexagonal Bricks

<!-- ag-section:db-migrations:start -->
- **Hexagonal Brick**: `bricks/user-profile@1.0.0` — Multi-Platform OAuth 2.0, User Profile & Pluggable Token/Slot UX Brick (Platforms: `web, ios, android`)
- **Schema / Migration**: `bricks/user-profile/core/index.ts` — index.ts
- **Schema / Migration**: `bricks/user-profile/core/oauth/account-linking.service.ts` — account-linking.service.ts (normalizeUserProfile)
- **Schema / Migration**: `bricks/user-profile/core/oauth/apple.verifier.ts` — apple.verifier.ts
- **Schema / Migration**: `bricks/user-profile/core/oauth/facebook.verifier.ts` — facebook.verifier.ts
- **Schema / Migration**: `bricks/user-profile/core/oauth/google.verifier.ts` — google.verifier.ts
- **Schema / Migration**: `bricks/user-profile/core/oauth/microsoft.verifier.ts` — microsoft.verifier.ts
- **Schema / Migration**: `bricks/user-profile/core/ports.ts` — ports.ts (LinkedSocialAccount, NormalizedUserProfile, UserProfileStoragePort, OAuthProviderPort, SessionTokenPort)
- **Schema / Migration**: `bricks/user-profile/core/profile.service.ts` — profile.service.ts
- **Schema / Migration**: `bricks/user-profile/core/schemas.ts` — schemas.ts (validateProfileUpdate, validateAndBuildThemeCssVars)
- **Schema / Migration**: `bricks/user-profile/schemas/001_user_profile_oauth.sql` — 001_user_profile_oauth.sql (table users, table oauth_accounts, table sessions)
- **Schema / Migration**: `bricks/user-profile/schemas/user-profile.prisma` — user-profile.prisma (model User, model OAuthAccount, model Session)
<!-- ag-section:db-migrations:end -->

---

## 3. Consolidated Historical Migration Boards

<!-- ag-section:legacy-migrations:start -->
<!-- harvested-repo-context:start -->
### Harvested Repository & Memory-Bank Context

- **From [`memory-bank/progress.md`](../../memory-bank/progress.md) (Memory Bank Baseline)**:
  - **Test, Parity & Line Budget Audit**: `npm test` (`node scripts/lint-memory.mjs && node --test tests/cli-e2e.test.mjs bricks/user-profile/testing/contract.spec.ts`) — 25/25 memory & rule files (`< 150 lines`, `< 50 lines` `AGENTS.md`), 14/14 template parity pairs, 10/10 canonical living docs, and 15/15 E2E & contract tests passing (`0` violations).
  - **Cross-Cluster Upgrade Rollout**: Verified `10/10` Mandatory Baseline Ingestion Checklist and `10/10` Canonical Living Docs (`0` broken links) across `antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, and `wiro`.
  - **Package Whitelist Audit**: `npm pack --dry-run` — excludes `memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`, and `.github/`.
  - **Living Documentation Hub**: Indexed in [`docs/INDEX.md`](../docs/INDEX.md) across `docs/{architecture,design,quality,operations}/`.
  - **Active Development Board**: Operational tickets and feature backlogs are managed in [`docs/backlog.json`](../docs/backlog.json) and [`docs/BACKLOG.md`](../docs/BACKLOG.md) (`22/22` `DONE`, `0` pending).

- **From [`README.md`](../../README.md) (## 🛡️ Core Invariant: Passive Observer & Listener Only)**:
  A foundational separation of concerns governs the Three-Tier Memory Bank:
  > **The Memory Bank (`memory-bank/*.md`) is strictly a passive context baseline and observer. It is NOT an operational backlog, issue tracker, or work surface.**
  1. **Independent Reference Baseline**: The Memory Bank exists purely to provide immutable architectural ground truth, domain taxonomies, and high-level milestones when an Antigravity agent boots a session (`/start`).
  2. **Separation of Dev Operations**: Active engineering tasks, sprint boards, migration checklists, and bug fix logs belong in the project's documentation directory (`docs/MIGRATION_BOARD.md`, `docs/BUG_FIX_RECORDS.md`, `docs/BACKLOG.md`), **never** inside `memory-bank/`.
  3. **Passive Reflection**: When code is committed or `/update-memory` runs, the memory system passively observes Git commits and `docs/` records, reflecting high-level summaries and verification stamps into `memory-bank/*.md`. It never conducts active ticket operations.
  ---
<!-- harvested-repo-context:end -->
<!-- ag-section:legacy-migrations:end -->
