<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-136] Automatic Ad-Hoc /plan → READY (After Design Review Display) & READY → IN PROGRESS (On Proceed)** (`MEDIUM` · Status: `done`): Enable seamless Kanban tracking for **ad-hoc `/plan` questions or changes** without breaking Antigravity's native blue **Proceed** button:
  - **[FEAT-135] Add Chat-Side Model Switching (swarm model + ask_question), Update CheatSheet & Roll Out Across All 10 Projects** (`HIGH` · Status: `done`): Support --model switching via swarm(action:'model') and ask_question fallback in /backlog-plan and /backlog-start, document all 5 workflows in CREDITS_CHEATSHEET.md and BACKLOG_GUIDE.md, add E2E tests, and deploy to all 10 projects.
  - **[FEAT-134] Add Interactive PLAN (TO DO -> READY) & CODE (READY -> IN PROGRESS) Model-Selector Modals + Symmetric Drag-and-Drop Triggers** (`HIGH` · Status: `done`): Add PLAN button on TO DO cards and CODE button on READY cards, build #modelSelectorModal ranking credit-optimal AGY models, and wire symmetric drag-and-drop triggers (TO DO -> READY opens PLAN model selector; READY -> IN PROGRESS opens CODE model selector) committing status transitions only after model selection.
  - **[FEAT-133] Add /backlog-add Skill (TO DO Auto-Annotation Only) & Direct-to-READY /backlog-plan Invariant** (`HIGH` · Status: `done`): Create /backlog-add skill strictly for TO DO auto-annotation (0 plan/code credits), add autoAnnotateTicket() in scripts/backlog.mjs, and enforce that /backlog-plan creates/plans directly into READY and never auto-jumps to IN PROGRESS.

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [FEAT-136] Automatic Ad-Hoc /plan → READY (After Design Review Display) & READY → IN PROGRESS (On Proceed) *(Completed & Verified Baseline)*
- **Specification**: Enable seamless Kanban tracking for **ad-hoc `/plan` questions or changes** without breaking Antigravity's native blue **Proceed** button:
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/sync-memory-context.mjs) (`templates/scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/skills/backlog-plan/SKILL.md) (`.agents/skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)
- **Acceptance Criteria**:
  - Complete implementation and verification for Automatic Ad-Hoc /plan → READY (After Design Review Display) & READY → IN PROGRESS (On Proceed)
  - Verify deterministic tests and lint checks for [FEAT-136]

### [FEAT-135] Add Chat-Side Model Switching (swarm model + ask_question), Update CheatSheet & Roll Out Across All 10 Projects *(Completed & Verified Baseline)*
- **Specification**: Support --model switching via swarm(action:'model') and ask_question fallback in /backlog-plan and /backlog-start, document all 5 workflows in CREDITS_CHEATSHEET.md and BACKLOG_GUIDE.md, add E2E tests, and deploy to all 10 projects.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/CREDITS_CHEATSHEET.md) (`docs/CREDITS_CHEATSHEET.md`)
  - `[VERIFIED]` [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md) (`docs/BACKLOG_GUIDE.md`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)

### [FEAT-134] Add Interactive PLAN (TO DO -> READY) & CODE (READY -> IN PROGRESS) Model-Selector Modals + Symmetric Drag-and-Drop Triggers *(Completed & Verified Baseline)*
- **Specification**: Add PLAN button on TO DO cards and CODE button on READY cards, build #modelSelectorModal ranking credit-optimal AGY models, and wire symmetric drag-and-drop triggers (TO DO -> READY opens PLAN model selector; READY -> IN PROGRESS opens CODE model selector) committing status transitions only after model selection.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)

### [FEAT-133] Add /backlog-add Skill (TO DO Auto-Annotation Only) & Direct-to-READY /backlog-plan Invariant *(Completed & Verified Baseline)*
- **Specification**: Create /backlog-add skill strictly for TO DO auto-annotation (0 plan/code credits), add autoAnnotateTicket() in scripts/backlog.mjs, and enforce that /backlog-plan creates/plans directly into READY and never auto-jumps to IN PROGRESS.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-add/SKILL.md) (`skills/backlog-add/SKILL.md`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)

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
