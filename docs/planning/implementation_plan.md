<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[BUG-109] ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH)** (`HIGH` · Status: `done`): ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH)
  - **[FEAT-140] ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH)** (`HIGH` · Status: `done`): ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH)
  - **[FEAT-139] ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)** (`HIGH` · Status: `done`): ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)
  - **[FEAT-138] ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)** (`HIGH` · Status: `done`): ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [BUG-109] ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH) *(Completed & Verified Baseline)*
- **Specification**: ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH)
  - Verify deterministic tests and lint checks for [BUG-109]

### [FEAT-140] ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH) *(Completed & Verified Baseline)*
- **Specification**: ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH)
  - Verify deterministic tests and lint checks for [FEAT-140]

### [FEAT-139] ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH) *(Completed & Verified Baseline)*
- **Specification**: ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)
  - Verify deterministic tests and lint checks for [FEAT-139]

### [FEAT-138] ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH) *(Completed & Verified Baseline)*
- **Specification**: ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx) (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md) (`docs/PLANNING_GUIDE.md`)
  - `[VERIFIED]` [implementation_plan.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/planning/implementation_plan.md) (`docs/planning/implementation_plan.md`)
  - `[VERIFIED]` [TEST_PLAN_AND_SUITES.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/TEST_PLAN_AND_SUITES.md) (`docs/quality/TEST_PLAN_AND_SUITES.md`)
- **Acceptance Criteria**:
  - Complete implementation and verification for ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)
  - Verify deterministic tests and lint checks for [FEAT-138]

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
