# Feature Spec: Canonical Living Documentation Hierarchy & Auto-Synthesizer (`FEAT-121`)

## 1. Goal Description
Upgrade `antigravity-memory-bank` so that every initialized (`init`), upgraded (`upgrade`), or organized (`organize`) repository automatically builds and maintains a **Standardized Living Documentation Hierarchy** inside `docs/`.
- **For Existing Projects (`SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`):** Automatically ingest, classify, and migrate existing scattered markdown specs (`DESIGN.md`, `UX_BRIEF.md`, `ARCHITECTURE.md`, `BUG_FIX_RECORDS.md`, etc.), database schemas, theme tokens, and test suites into the canonical hierarchy without losing a single line of context, rewriting all relative markdown links automatically.
- **For Greenfield Projects:** Scaffold structured, progressive living documents that automatically populate as features are planned (`/backlog-plan`) and executed (`/backlog-start`, `/update-memory`).

## 2. User Review Required & Mandates
> [!IMPORTANT]
> **Strict Separation Between `memory-bank/` and `docs/` (Mandate #4):**
> - `memory-bank/*.md` remains strictly a passive observer (`< 150 lines` per file) holding distilled architectural ground truth.
> - Detailed living specifications, full database/API schemas, brand token tables, bug root-cause logs, and test matrices live inside the new canonical `docs/{architecture,design,quality,operations}/` hierarchy.
> - Expose the canonical `docs/` hierarchy to the agent via `.agents/rules/docs-living-specs.md` with snake_case `trigger: model_decision` YAML frontmatter so it consumes **0 tokens** until relevant (`FEAT-118`).

> [!WARNING]
> **Non-Destructive Migration & Link Integrity:**
> - When consolidating legacy `docs/*.md` files on an existing repo, never delete custom content blindly. Merge legacy sections into the matching canonical document, move original superseded files to `docs/archive/<filename>` (or `git mv` when 1-to-1), and rewrite all markdown links across `README.md`, `AGENTS.md`, `memory-bank/*.md`, and `.agents/rules/*.md`.
> - Preserve the `<!-- antigravity-doc-sync -->` marker rule: if a developer manually edits a section of a canonical doc, incremental syncs append/update auto-generated tables without overwriting human prose.

## 3. Proposed Changes in `antigravity-memory-bank`

### 1. `[NEW] templates/docs/` (Canonical Document Templates)
Create structured templates with progressive-fill markers (`<!-- ag-section:... -->`) for:
- `docs/INDEX.md`: Master table of contents with real-time status badges (`🟢 Populated`, `🟡 Progressive Scaffold`, `🔄 Auto-Synced`) and link index.
- `docs/architecture/LOGICAL_ARCHITECTURE.md`: System context, domain entities, Mermaid sequence diagrams, and inter-brick event flows.
- `docs/architecture/TECHNICAL_ARCHITECTURE.md`: Stack matrix, directory archetype, API endpoint inventory, database schema summary, and port/health allocations.
- `docs/architecture/SECURITY_AND_COMPLIANCE.md`: Auth/OAuth providers, `.env` key contracts (masked), GDPR/App Store account deletion flows, and Tier 2 infrastructure boundaries.
- `docs/design/UX_BRIEF.md`: Core user journeys, screen/route inventory, platform target matrix (`Web`, `iOS`, `Android`), and interaction states.
- `docs/design/BRAND_BOOK.md`: Color palette tokens (Primary, Surface, Background, Text, Semantic), typography scales, border radii, dark/light mode rules, and UI slot overrides.
- `docs/quality/TEST_PLAN_AND_SUITES.md`: Unit, contract, and live E2E test suites, exact terminal verification commands, and Mandate #6 live E2E gates.
- `docs/quality/BUG_FIX_RECORDS.md`: Structured RCA log correlated with `BUG-*` tickets in `docs/backlog.json` and `fix:` git commits.
- `docs/operations/MIGRATION_AND_RELEASE_LOG.md`: Chronological log of DB migrations, shared brick versions (`antigravityBricks`), and production cutovers.

### 2. `[NEW] lib/docs-synthesizer.mjs` & `scripts/sync-living-docs.mjs`
Build the deterministic, 0-AI-token documentation synthesizer invoked during `init`, `upgrade`, `organize`, and `sync-memory-context.mjs`:
- **Existing Repo Classifier & Consolidator:**
  - Scans root and `docs/` for legacy files (`ARCHITECTURE.md`, `DESIGN.md`, `UX_BRIEF.md`, `BRAND_BOOK.md`, `NATIVE_UI_SPEC.md`, `NATIVE_SHARE_SETUP.md`, `TESTING_AGENT_SCENARIOS.md`, `MIGRATION_BOARD.md`, `BUG_FIX_RECORDS.md`).
  - Maps and merges their content into the canonical `docs/{architecture,design,quality,operations}/*.md` structure.
  - Extracts real codebase facts: routes/controllers → `TECHNICAL_ARCHITECTURE.md` & `UX_BRIEF.md`; CSS vars / Tailwind config / theme adapters → `BRAND_BOOK.md`; `tests/**/*.spec.*` → `TEST_PLAN_AND_SUITES.md`; `git log --grep="fix"` & `BUG-*` tickets → `BUG_FIX_RECORDS.md`.
- **Greenfield Progressive Updater:**
  - Hooks into `scripts/backlog.mjs` (`plan` and `done`) and `scripts/sync-memory-context.mjs`:
    - When a `FEAT-*` ticket is planned or completed, appends new routes/models to `LOGICAL_ARCHITECTURE.md` and `TECHNICAL_ARCHITECTURE.md`, UX flows to `UX_BRIEF.md`, and test files to `TEST_PLAN_AND_SUITES.md`.
    - When a `BUG-*` ticket is marked `done`, automatically appends the root cause, fix commit, and regression test to `docs/quality/BUG_FIX_RECORDS.md`.

### 3. `[MODIFY] bin/cli.mjs`, `package.json` & `.agents/`
- Extend `init`, `upgrade`, and `organize` in `bin/cli.mjs` to scaffold and synthesize the canonical `docs/` hierarchy automatically.
- Add `docs:sync` and `docs:lint` subcommands (`npm run docs:sync`, `npm run lint:memory` checks that all 10 canonical docs exist and have valid links).
- Add `.agents/rules/docs-living-specs.md` (`trigger: model_decision`) and update `.agents/skills/backlog-plan/SKILL.md` and `.agents/skills/backlog-start/SKILL.md` so the agent consults and updates the matching `docs/{architecture,design,quality}/` spec whenever planning or closing a ticket.

## 4. Verification Plan
1. `npm test` — Run unit tests verifying both **Greenfield Scaffolding** (progressive updates on `FEAT-101` / `BUG-101` completion) and **Existing Repo Consolidation** (migrating legacy `docs/*.md` files into the canonical hierarchy with 0 broken links and 0 data loss).
2. `node bin/cli.mjs organize --dry-run` — Verify canonical `docs/` path mapping and link rewriting.
3. `npm run lint:memory` — Verify `AGENTS.md` remains `< 50 lines`, all `memory-bank/*.md` files remain `< 150 lines`, `.agents/rules/docs-living-specs.md` has valid `trigger: model_decision` frontmatter, and `10/10` baseline checks pass.