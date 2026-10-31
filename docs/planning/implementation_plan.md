<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-124] Add per-column and global Sort (Oldest to Newest and vice versa) and manual drag-and-drop / up-down ticket reordering across all Backlog instances** (`HIGH` · Status: `done`): Implement and verify according to project architecture invariants.
  - **[FEAT-123] Auto-Execute /clear & /compact Pre-Flight on Every /start Workflow Across All Installed Memory Banks** (`HIGH` · Status: `done`): Modify /start workflow (skills/start/SKILL.md, AGENTS.md, templates/AGENTS.md.tpl, rules/AGENTS.md, scripts/lint-memory.mjs, and bin/cli.mjs) so that every /start invocation automatically executes /clear and /compact pre-flight checkpointing first, and deploy across all installed Memory Banks.
  - **[FEAT-122] Mandatory Plan-to-Backlog Ticket Creation & Atomic Plan Decomposition (backlog split & plan --from-plan)** (`HIGH` · Status: `done`): Enforce that every /plan or implementation_plan.md creates and splits atomic backlog tickets in docs/backlog.json for transparent project management across all installed projects.
  - **[FEAT-121] Canonical Living Documentation Hierarchy & Deep Universal Harvester (docs/INDEX.md + 4 Pillars)** (`HIGH` · Status: `done`): Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester: every initialized (init), upgraded (upgrade), organized (organize), or synced (docs:sync) repository automatically scaffolds the 9-file living documentation hierarchy inside docs/{architecture,design,quality,operations}/, classifies and consolidates all existing docs/**/*.md specs across the 8 canonical pillars (archiving originals in docs/archive/ and rewriting links repo-wide), non-destructively harvests README.md, SECURITY.md, CHANGELOG.md, and memory-bank/*.md sections, extracts deep codebase routes/schemas/tokens/tests, and bridges deep specs on demand via .agents/rules/docs-living-specs.md (trigger: model_decision).

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
### [FEAT-124] Add per-column and global Sort (Oldest to Newest and vice versa) and manual drag-and-drop / up-down ticket reordering across all Backlog instances *(Completed & Verified Baseline)*
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)

### [FEAT-123] Auto-Execute /clear & /compact Pre-Flight on Every /start Workflow Across All Installed Memory Banks *(Completed & Verified Baseline)*
- **Specification**: Modify /start workflow (skills/start/SKILL.md, AGENTS.md, templates/AGENTS.md.tpl, rules/AGENTS.md, scripts/lint-memory.mjs, and bin/cli.mjs) so that every /start invocation automatically executes /clear and /compact pre-flight checkpointing first, and deploy across all installed Memory Banks.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md) (`skills/start/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/skills/start/SKILL.md) (`.agents/skills/start/SKILL.md`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)

### [FEAT-122] Mandatory Plan-to-Backlog Ticket Creation & Atomic Plan Decomposition (backlog split & plan --from-plan) *(Completed & Verified Baseline)*
- **Specification**: Enforce that every /plan or implementation_plan.md creates and splits atomic backlog tickets in docs/backlog.json for transparent project management across all installed projects.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md) (`docs/PLANNING_GUIDE.md`)
  - `[VERIFIED]` [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md) (`docs/BACKLOG_GUIDE.md`)

### [FEAT-121] Canonical Living Documentation Hierarchy & Deep Universal Harvester (docs/INDEX.md + 4 Pillars) *(Completed & Verified Baseline)*
- **Specification**: Implement scripts/sync-living-docs.mjs (and templates/scripts/sync-living-docs.mjs) combining 9 canonical living templates (docs/INDEX.md, LOGICAL_ARCHITECTURE.md, TECHNICAL_ARCHITECTURE.md, SECURITY_AND_COMPLIANCE.md, UX_BRIEF.md, BRAND_BOOK.md, TEST_PLAN_AND_SUITES.md, BUG_FIX_RECORDS.md, MIGRATION_AND_RELEASE_LOG.md) with the 8-pillar weighted Markdown classifier (classifyMarkdownDocument), non-destructive in-place repo/memory-bank harvester (harvestInPlaceRepoKnowledge), and deep codebase AST/regex harvesters (Next.js App Router route.ts, Pages API, Fastify/Express, Prisma models, SQL CREATE TABLE, Zod schemas, mobile Info.plist/AndroidManifest.xml OAuth schemes, masked .env* keys, CSS/Tailwind tokens, and test suites).
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [docs-synthesizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/docs-synthesizer.mjs) (`lib/docs-synthesizer.mjs`)
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs) (`scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/sync-living-docs.mjs) (`templates/scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs) (`lib/repo-organizer.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [docs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs) (`templates/docs/`)
  - `[VERIFIED]` [docs-living-specs.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/rules/docs-living-specs.md.tpl) (`templates/rules/docs-living-specs.md.tpl`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)
  - `[VERIFIED]` [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md) (`README.md`)
- **Attached UX/UI & Context Bundles**:
  - 📎 [STANDARD_DOCS_HIERARCHY_SPEC.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/attachments/FEAT-121/STANDARD_DOCS_HIERARCHY_SPEC.md) (`docs/attachments/FEAT-121/STANDARD_DOCS_HIERARCHY_SPEC.md` → unpacked in `docs/attachments/FEAT-121/extracted/`)
- **Acceptance Criteria**:
  - Scaffolds all 9 canonical living documents and .agents/rules/docs-living-specs.md (trigger: model_decision) on init, upgrade, organize, and docs:sync while keeping memory-bank/*.md < 150 lines.
  - Crawls and classifies all non-preserved docs/**/*.md files across the 8 pillars, merges content with zero loss, archives originals in docs/archive/, and rewrites relative and file:// links repo-wide.
  - Non-destructively harvests domain sections from README.md, SECURITY.md, CHANGELOG.md, and memory-bank/*.md with clickable provenance links.
  - Extracts deep codebase facts (Next.js app/**/route.ts methods, Prisma models, SQL CREATE TABLE, mobile OAuth schemes, masked .env* keys, brand tokens, and test suites) and passes 15/15 E2E & contract tests.

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
