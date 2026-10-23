---
trigger: model_decision
description: "Apply whenever designing architecture, inspecting database/API schemas, implementing UI/UX screens or brand tokens, writing test suites, logging bug root causes (BUG-*), or recording migrations and releases."
---
# Canonical Living Documentation Hierarchy (`docs/`)

To keep `memory-bank/*.md` strictly `< 150 lines` per file (`Passive Observer Invariant`), all detailed specifications, API/schema inventories, brand design tokens, test suites, and bug RCA logs live in the canonical `docs/` hierarchy indexed by [`docs/INDEX.md`](../../docs/INDEX.md):

1. **Architecture (`docs/architecture/`)**:
   - [`docs/architecture/LOGICAL_ARCHITECTURE.md`](../../docs/architecture/LOGICAL_ARCHITECTURE.md): System context, domain entities, Mermaid flows, and `FEAT-*` capability map.
   - [`docs/architecture/TECHNICAL_ARCHITECTURE.md`](../../docs/architecture/TECHNICAL_ARCHITECTURE.md): Tech stack, repository archetype, API route/controller inventory, and database schemas.
   - [`docs/architecture/SECURITY_AND_COMPLIANCE.md`](../../docs/architecture/SECURITY_AND_COMPLIANCE.md): OAuth 2.0/OIDC providers, masked `.env` contracts, GDPR/App Store `5.1.1(v)` deletion flows, and Tier 2 boundaries.
2. **Design & Branding (`docs/design/`)**:
   - [`docs/design/DESIGN.md`](../../docs/design/DESIGN.md): Unified Design System & Stitch-ready specification synthesized from `BRAND_BOOK.md`, `UX_BRIEF.md`, codebase tokens/screens, and all harvested design docs.
   - [`docs/design/UX_BRIEF.md`](../../docs/design/UX_BRIEF.md): User journeys, screen/route inventory across Web/iOS/Android, and unpacked UX/UI `.zip` bundles.
   - [`docs/design/BRAND_BOOK.md`](../../docs/design/BRAND_BOOK.md): Color tokens (`--ag-profile-*`), typography, radii, dark/light mode rules, and `ProfileUISlotsPort` component slot overrides.
3. **Quality & Operations (`docs/quality/` & `docs/operations/`)**:
   - [`docs/quality/TEST_PLAN_AND_SUITES.md`](../../docs/quality/TEST_PLAN_AND_SUITES.md): Unit, contract, and live E2E suites + Dual-Test Invariant.
   - [`docs/quality/BUG_FIX_RECORDS.md`](../../docs/quality/BUG_FIX_RECORDS.md): Structured RCA, fix commit, non-regression test, and E2E test log for every `BUG-*` ticket.
   - [`docs/operations/MIGRATION_AND_RELEASE_LOG.md`](../../docs/operations/MIGRATION_AND_RELEASE_LOG.md): Milestones, DB schema migrations, and installed Hexagonal Bricks.
4. **Progressive Maintenance Rule**:
   - Run `npm run docs:sync` (or `node scripts/sync-living-docs.mjs`) after planning or completing features/bugs to auto-update `<!-- ag-section:... -->` blocks without overwriting human-authored prose outside those markers.
