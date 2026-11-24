<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[BUG-115] Auto-execute /backlog-plan & /backlog-start in Prompt Window on PLAN/CODE transitions and enforce TO DO return for IN PROGRESS/DONE re-plan** (`HIGH` · Status: `done`): Implement and verify according to project architecture invariants.
  - **[BUG-114] Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning** (`HIGH` · Status: `done`): Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning
  - **[BUG-113] Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked)** (`HIGH` · Status: `done`): Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked)
  - **[FEAT-147] Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets** (`HIGH` · Status: `done`): Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [BUG-115] Auto-execute /backlog-plan & /backlog-start in Prompt Window on PLAN/CODE transitions and enforce TO DO return for IN PROGRESS/DONE re-plan *(Completed & Verified Baseline)*
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md) (`docs/BACKLOG.md`)
  - `[VERIFIED]` [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html) (`docs/backlog.html`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Implement and verify Auto-execute /backlog-plan & /backlog-start in Prompt Window on PLAN/CODE transitions and enforce TO DO return for IN PROGRESS/DONE re-plan across scripts/backlog.mjs, docs/BACKLOG.md, docs/backlog.html, docs/backlog.json
  - Add both a non-regression unit/component test and an E2E test verifying the fix

### [BUG-114] Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning *(Completed & Verified Baseline)*
- **Specification**: Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md) (`docs/PLANNING_GUIDE.md`)
- **Acceptance Criteria**:
  - Implement and verify Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning across docs/PLANNING_GUIDE.md
  - Add both a non-regression unit/component test and an E2E test verifying the fix

### [BUG-113] Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked) *(Completed & Verified Baseline)*
- **Specification**: Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Implement and verify Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked)
  - Add both a non-regression unit/component test and an E2E test verifying the fix

### [FEAT-147] Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets *(Completed & Verified Baseline)*
- **Specification**: Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Implement and verify Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets
  - Pass deterministic lint, typecheck, and automated test verification (npm test)

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
