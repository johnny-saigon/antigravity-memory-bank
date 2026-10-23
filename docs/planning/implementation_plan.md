<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Canonical Living Documentation Hierarchy (`FEAT-121` & `FEAT-122`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`23/23` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical.
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-122] Deep Universal Documentation & Codebase Harvester for Canonical Living Docs** (`HIGH` · Status: `done`): Implement and verify according to project architecture invariants.
  - **[FEAT-121] Canonical Living Documentation Hierarchy & Auto-Synthesizer** (`P0` · Status: `done`): Upgrade antigravity-memory-bank so every initialized (init), upgraded (upgrade), or organized (organize) repository automatically builds and maintains a Standardized Living Documentation Hierarchy inside docs/{architecture,design,quality,operations}/ with zero-token auto-synthesis, progressive greenfield fill, legacy doc consolidation & link rewriting, and .agents/rules/docs-living-specs.md progressive disclosure.
  - **[FEAT-120] Phase 1: Extract SnapCal Multi-Platform OAuth, User Profile & Pluggable UX/UI Brick (bricks/user-profile/)** (`P0` · Status: `done`): Extract User Profile Management and 4-Provider Social Login (Google, Facebook, Apple, Microsoft) from ../SnapCal into bricks/user-profile/ as a shared, platform-adaptive Hexagonal Brick with a Headless + Design-Token/Slot Theming Engine (ProfileBrandThemePort & ProfileUISlotsPort) across Web, iOS, and Android.
  - **[FEAT-119] Stop the Credit Bleed Controls & Executable Slash-Command Skills (/context, /clear, /effort, /credits, /usage)** (`P0` · Status: `done`): Enforce pre-edit /plan gate on complex features/bugs, /effort reasoning tiering, aggressive /clear + /compact + /context pruning after every task, and Google One / Antigravity Overage Toggle disable + /credits & /usage monitoring across GEMINI.md, AGENTS.md, negative-constraints.md, and skills.

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

> [!WARNING]
> **Strict Live End-to-End Verification Before Closure (Mandate #6 / Rule #4)**:
> One or more planned tickets involve third-party integrations, OAuth providers, or external credentials. **NEVER mark these tickets as `done` (`npm run backlog done`) until live server credentials are configured and real end-to-end provider HTTP requests pass.** If external credentials are pending, keep the ticket `in_progress`.

## 3. Proposed Changes
### [FEAT-122] Deep Universal Documentation & Codebase Harvester for Canonical Living Docs *(Completed & Verified Baseline)*
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs) (`scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/sync-living-docs.mjs) (`templates/scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [e2e-cli.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/e2e-cli.test.mjs) (`tests/e2e-cli.test.mjs`)

### [FEAT-121] Canonical Living Documentation Hierarchy & Auto-Synthesizer *(Completed & Verified Baseline)*
- **Specification**: Upgrade antigravity-memory-bank so every initialized (init), upgraded (upgrade), or organized (organize) repository automatically builds and maintains a Standardized Living Documentation Hierarchy inside docs/{architecture,design,quality,operations}/ with zero-token auto-synthesis, progressive greenfield fill, legacy doc consolidation & link rewriting, and .agents/rules/docs-living-specs.md progressive disclosure.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [docs-synthesizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/docs-synthesizer.mjs) (`lib/docs-synthesizer.mjs`)
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs) (`scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs) (`lib/repo-organizer.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [docs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs) (`templates/docs/`)
  - `[VERIFIED]` [docs-living-specs.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/rules/docs-living-specs.md.tpl) (`templates/rules/docs-living-specs.md.tpl`)
- **Attached UX/UI & Context Bundles**:
  - 📎 [STANDARD_DOCS_HIERARCHY_SPEC.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/attachments/FEAT-121/STANDARD_DOCS_HIERARCHY_SPEC.md) (`docs/attachments/FEAT-121/STANDARD_DOCS_HIERARCHY_SPEC.md` → unpacked in `docs/attachments/FEAT-121/extracted/`)

### [FEAT-120] Phase 1: Extract SnapCal Multi-Platform OAuth, User Profile & Pluggable UX/UI Brick (bricks/user-profile/) *(Completed & Verified Baseline)*
- **Specification**: Implement bricks/user-profile/ (core ports, 4 OAuth verifiers, account linking, GDPR/App Store 5.1.1(v) revocation & Meta data-deletion, ProfileLifecycleEventPort, i18n dictionary, canonical SQL/Prisma schemas, Day-1 mock OAuth adapter, headless + themed-ui for Web/iOS/Android, contract.spec.ts) and add brick list/install/upgrade/doctor commands (--platforms web,ios,android | --platforms web, --with-schema) to bin/cli.mjs.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [brick.json](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/brick.json) (`bricks/user-profile/brick.json`)
  - `[VERIFIED]` [core](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/core) (`bricks/user-profile/core/`)
  - `[VERIFIED]` [web](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web) (`bricks/user-profile/platforms/web/`)
  - `[VERIFIED]` [ios](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/ios) (`bricks/user-profile/platforms/ios/`)
  - `[VERIFIED]` [android](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/android) (`bricks/user-profile/platforms/android/`)
  - `[VERIFIED]` [templates](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/adapters/templates) (`bricks/user-profile/adapters/templates/`)
  - `[VERIFIED]` [schemas](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/schemas) (`bricks/user-profile/schemas/`)
  - `[VERIFIED]` [contract.spec.ts](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/testing/contract.spec.ts) (`bricks/user-profile/testing/contract.spec.ts`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [package.json](file:///Users/jbb/Documents/antigravity-memory-bank/package.json) (`package.json`)
  - `[VERIFIED]` [brick-governance.md](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/rules/brick-governance.md) (`.agents/rules/brick-governance.md`)
- **Attached UX/UI & Context Bundles**:
  - 📎 [PHASE_1_EXTRACT_SNAPCAL_AUTH_PROFILE_BRICK.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PHASE_1_EXTRACT_SNAPCAL_AUTH_PROFILE_BRICK.md) (`docs/PHASE_1_EXTRACT_SNAPCAL_AUTH_PROFILE_BRICK.md` → unpacked in `docs/attachments/FEAT-120/extracted/`)
- **Acceptance Criteria**:
  - Zero hardcoded SnapCal brand styles, hex colors, logos, bundle IDs (com.snapcal), or DB calls inside bricks/user-profile/.
  - Complete separation of platforms/{web,ios,android}/headless/ and platforms/{web,ios,android}/themed-ui/ powered by ProfileBrandThemePort (--ag-profile-* tokens) and ProfileUISlotsPort.
  - bin/cli.mjs supports brick list, brick install user-profile [--platforms web,ios,android | --platforms web] [--with-schema], brick upgrade user-profile (preserving repo-local adapters), and brick doctor user-profile.
  - npm test passes contract.spec.ts for all 4 OAuth providers, profile CRUD, account linking, and theme token injection, and npm run lint:memory passes with 0 violations.

### [FEAT-119] Stop the Credit Bleed Controls & Executable Slash-Command Skills (/context, /clear, /effort, /credits, /usage) *(Completed & Verified Baseline)*
- **Specification**: Enforce pre-edit /plan gate on complex features/bugs, /effort reasoning tiering, aggressive /clear + /compact + /context pruning after every task, and Google One / Antigravity Overage Toggle disable + /credits & /usage monitoring across GEMINI.md, AGENTS.md, negative-constraints.md, and skills.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [skills](file:///Users/jbb/Documents/antigravity-memory-bank/skills) (`skills/`)
  - `[VERIFIED]` [skills](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/skills) (`.agents/skills/`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)

## 4. Verification Plan
### Automated & Deterministic Terminal Verification
```bash
npm run lint:memory
npm test
npm run test:e2e
```

### End-to-End & Sprint Closure Checklist
1. Execute all deterministic test, typecheck, and build commands above with `0` errors.
2. Verify `npm run lint:memory` passes with `< 150 lines` across all `memory-bank/*.md` files.
3. For integration/OAuth tickets, verify live end-to-end provider HTTP requests pass before running `npm run backlog done <ID>`.
4. Record verification proof in `walkthrough.md`, `memory-bank/activeContext.md`, and `memory-bank/progress.md`.
