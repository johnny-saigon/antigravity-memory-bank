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
- **Schema / Migration**: `bricks/user-profile/core/schemas.ts`
- **Schema / Migration**: `bricks/user-profile/schemas/001_user_profile_oauth.sql`
- **Schema / Migration**: `bricks/user-profile/schemas/user-profile.prisma`
<!-- ag-section:db-migrations:end -->

---

## 3. Consolidated Historical Migration Boards

<!-- ag-section:legacy-migrations:start -->
_No legacy migration board documents merged yet._
<!-- ag-section:legacy-migrations:end -->
