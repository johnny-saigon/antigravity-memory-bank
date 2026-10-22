<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Correlated 3-Artifact Planning Mode & Automated E2E CLI Verification (`23/23` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Decoupled Zero-Token Backlog Engine, and Correlated 3-Artifact Planning Mode directly inside `antigravity-memory-bank` while keeping upstream templates 100% generic.
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-118] --id** (`P0` · Status: `done`): Eliminate the Silent Discard Trap, Broken Frontmatter Trap (snake_case trigger: model_decision), and Token Bloat Trap (<50-line root AGENTS.md/GEMINI.md without inline @-expansion bloat); bridge memory-bank/*.md via .agents/rules/memory-*.md and lint via scripts/lint-memory.mjs.
  - **[FEAT-117] AI-Native Repository & Root Reorganization Engine (organize)** (`HIGH` · Status: `done`): Automatically organize repository root entrypoints, relocate loose root specs/boards into docs/ with git mv and link rewriting, remove redundant CLAUDE.md stubs and clutter, harden .gitignore, and scaffold canonical AI-native directories on fresh and existing projects.
  - **[FEAT-116] Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill** (`HIGH` · Status: `done`): Integrate Antigravity Planning Mode (Explore -> Plan -> Review -> Execute) across all initialized and upgraded projects, correlating the 3-Artifact Lifecycle (task.md, implementation_plan.md, walkthrough.md) directly with docs/backlog.json and memory-bank/*.md and pre-populating artifacts for existing/advanced projects.
  - **[FEAT-115] Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start** (`HIGH` · Status: `done`): Upstreamed from SnapCal (commit 0f346ae): enforce non-negotiable Strict End-to-End Verification Before Closure in AGENTS.md and .agents/skills/backlog-start/SKILL.md (Rule 4 + Phase 3 guard) so tickets involving third-party integrations, OAuth providers, or external credentials can NEVER be marked done until live credentials are configured on the server and real provider HTTP requests pass.

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
### [FEAT-118] --id *(Completed & Verified Baseline)*
- **Specification**: Eliminate the Silent Discard Trap, Broken Frontmatter Trap (snake_case trigger: model_decision), and Token Bloat Trap (<50-line root AGENTS.md/GEMINI.md without inline @-expansion bloat); bridge memory-bank/*.md via .agents/rules/memory-*.md and lint via scripts/lint-memory.mjs.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)

### [FEAT-117] AI-Native Repository & Root Reorganization Engine (organize) *(Completed & Verified Baseline)*
- **Specification**: Automatically organize repository root entrypoints, relocate loose root specs/boards into docs/ with git mv and link rewriting, remove redundant CLAUDE.md stubs and clutter, harden .gitignore, and scaffold canonical AI-native directories on fresh and existing projects.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs) (`lib/repo-organizer.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs) (`lib/ingestion-checklist.mjs`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)
  - `[VERIFIED]` [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md) (`README.md`)

### [FEAT-116] Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill *(Completed & Verified Baseline)*
- **Specification**: Generate and synchronize task.md (4 task groups), implementation_plan.md (Goal Description, User Review Required, Proposed Changes, Verification Plan), and walkthrough.md in both docs/planning/ and session brain directories; add npm run backlog plan [ID], /api/plan bridge endpoint, and Plan button in backlog.html; install /backlog-plan skill and docs/PLANNING_GUIDE.md on init/upgrade; verify in Check #8 of lib/ingestion-checklist.mjs.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/PLANNING_GUIDE.md) (`templates/docs/PLANNING_GUIDE.md`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs) (`lib/ingestion-checklist.mjs`)
- **Acceptance Criteria**:
  - Automatically populates and syncs task.md, implementation_plan.md, and walkthrough.md in docs/planning/ and <brainDir>/ from existing backlog and memory-bank context.
  - Installs /backlog-plan skill (.agents/skills/backlog-plan/SKILL.md) and docs/PLANNING_GUIDE.md on init and upgrade.
  - Correlates backlog.html cards (📐 Plan button + /api/plan bridge) and /backlog-start with the 3 Planning Mode artifacts.

### [FEAT-115] Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start *(Completed & Verified Baseline)*
- **Specification**: Add Mandate 6 (Strict End-to-End Verification Before Closure) to AGENTS.md, templates/AGENTS.md.tpl, rules/AGENTS.md, and bin/cli.mjs upgradeMemory; add Rule 4 and Phase 3 closure guard to skills/backlog-start/SKILL.md; verify in Check #6 of lib/ingestion-checklist.mjs; and trickle down to all 5 installed Memory Bank repositories.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs) (`lib/ingestion-checklist.mjs`)
- **Acceptance Criteria**:
  - AGENTS.md and templates/AGENTS.md.tpl enforce Strict End-to-End Verification Before Closure.
  - skills/backlog-start/SKILL.md Rule 4 forbids running npm run backlog done on integration tickets without live server credentials and passing provider HTTP requests.
  - bin/cli.mjs upgradeMemory injects the mandate into all downstream AGENTS.md formats and passes 10/10 on the Mandatory Baseline Ingestion Checklist across all 5 repositories.

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
