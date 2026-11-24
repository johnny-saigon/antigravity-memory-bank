<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-132] Update Credits CheatSheet, Guides, Skills, E2E Tests & Deploy 4-Column Kanban Across All 10 Projects** (`HIGH` · Status: `done`): Document the 4-column To-Do -> Ready -> In Progress -> Done credit-saving workflow across CheatSheet, guides, and skills, add E2E tests, verify 15/15 parity, and deploy to all 10 installed Memory Bank projects.
  - **[FEAT-131] Integrate To-Do -> Ready -> In Progress Lifecycle into Save Credits & AGY Model ROI Engine** (`HIGH` · Status: `done`): Add ready status validation in lint-memory.mjs, make Credit ROI advisor status-aware (Stage A frontier planning for unplanned todo vs Stage B workhorse model-downgrade trigger for ready tickets), and add 4-column workflow guide to Save Credits modal.
  - **[FEAT-130] Add 4th READY (Planned) Column to Backlog Kanban with Auto-Promotion on /backlog-plan & Split** (`HIGH` · Status: `done`): Evolve the Backlog Kanban into a 4-column board (To-Do / Backlog -> Ready (Planned) -> In Progress / QA -> Completed (Done)) with auto-promotion to status:ready on plan/split, drag-and-drop, per-column sort, filter pill, and CLI ready command.
  - **[FEAT-129] Enforce Identical Canonical Backlog Kanban Design Across All Projects & Harden backlog-adapter Schema Normalization** (`HIGH` · Status: `done`): Fix TypeError in lib/backlog-adapter.mjs when existing docs/backlog.json uses tickets[] or omits milestones[] (which aborted upgrade before rendering backlog.html in SnapMail and Design Engineering Website), unify SSR/client card ROI rendering in scripts/backlog.mjs, auto-prune duplicate non-canonical backlog_kanban.html/root backlog.html artifacts, and re-render identical Kanban boards across all 10 projects.

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [FEAT-132] Update Credits CheatSheet, Guides, Skills, E2E Tests & Deploy 4-Column Kanban Across All 10 Projects *(Completed & Verified Baseline)*
- **Specification**: Document the 4-column To-Do -> Ready -> In Progress -> Done credit-saving workflow across CheatSheet, guides, and skills, add E2E tests, verify 15/15 parity, and deploy to all 10 installed Memory Bank projects.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/CREDITS_CHEATSHEET.md) (`docs/CREDITS_CHEATSHEET.md`)
  - `[VERIFIED]` [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/CREDITS_CHEATSHEET.md) (`templates/docs/CREDITS_CHEATSHEET.md`)
  - `[VERIFIED]` [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md) (`docs/BACKLOG_GUIDE.md`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md) (`docs/PLANNING_GUIDE.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)

### [FEAT-131] Integrate To-Do -> Ready -> In Progress Lifecycle into Save Credits & AGY Model ROI Engine *(Completed & Verified Baseline)*
- **Specification**: Add ready status validation in lint-memory.mjs, make Credit ROI advisor status-aware (Stage A frontier planning for unplanned todo vs Stage B workhorse model-downgrade trigger for ready tickets), and add 4-column workflow guide to Save Credits modal.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)

### [FEAT-130] Add 4th READY (Planned) Column to Backlog Kanban with Auto-Promotion on /backlog-plan & Split *(Completed & Verified Baseline)*
- **Specification**: Evolve the Backlog Kanban into a 4-column board (To-Do / Backlog -> Ready (Planned) -> In Progress / QA -> Completed (Done)) with auto-promotion to status:ready on plan/split, drag-and-drop, per-column sort, filter pill, and CLI ready command.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)

### [FEAT-129] Enforce Identical Canonical Backlog Kanban Design Across All Projects & Harden backlog-adapter Schema Normalization *(Completed & Verified Baseline)*
- **Specification**: Fix TypeError in lib/backlog-adapter.mjs when existing docs/backlog.json uses tickets[] or omits milestones[] (which aborted upgrade before rendering backlog.html in SnapMail and Design Engineering Website), unify SSR/client card ROI rendering in scripts/backlog.mjs, auto-prune duplicate non-canonical backlog_kanban.html/root backlog.html artifacts, and re-render identical Kanban boards across all 10 projects.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog-adapter.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/backlog-adapter.mjs) (`lib/backlog-adapter.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)
  - `[VERIFIED]` [BUG_FIX_RECORDS.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/BUG_FIX_RECORDS.md) (`docs/quality/BUG_FIX_RECORDS.md`)

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
