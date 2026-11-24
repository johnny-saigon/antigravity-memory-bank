<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-139] ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)** (`HIGH` · Status: `done`): ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)
  - **[FEAT-138] ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)** (`HIGH` · Status: `done`): ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)
  - **[FEAT-137] Repackage antigravity-memory-bank into 11 Standalone Cross-Agent Skills (Agensi.io)** (`MEDIUM` · Status: `done`): Repackage the **antigravity-memory-bank** project into **11 cohesive, self-contained, `m*`-prefixed Agent Skills** (`minit`, `mstart`, `msync`, `mclear`, `mcontext`, `mbacklog`, `mplan`, `msprint`, `mdocs`, `morganize`, `mbrick`) conforming to the open **Agent Skills (`agentskills.io`)** and **`npx skills` / Agensi.io** specification so each skill can be lis
  - **[FEAT-136] Automatic Ad-Hoc /plan → READY (After Design Review Display) & READY → IN PROGRESS (On Proceed)** (`MEDIUM` · Status: `done`): Enable seamless Kanban tracking for **ad-hoc `/plan` questions or changes** without breaking Antigravity's native blue **Proceed** button:

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
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

### [FEAT-137] Repackage antigravity-memory-bank into 11 Standalone Cross-Agent Skills (Agensi.io) *(Completed & Verified Baseline)*
- **Specification**: Repackage the **antigravity-memory-bank** project into **11 cohesive, self-contained, `m*`-prefixed Agent Skills** (`minit`, `mstart`, `msync`, `mclear`, `mcontext`, `mbacklog`, `mplan`, `msprint`, `mdocs`, `morganize`, `mbrick`) conforming to the open **Agent Skills (`agentskills.io`)** and **`npx skills` / Agensi.io** specification so each skill can be lis
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs) (`scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [<name>](file:///Users/jbb/Documents/antigravity-memory-bank/skills/<name>) (`skills/<name>/`)
  - `[VERIFIED]` [*.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/*.mjs) (`scripts/*.mjs`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/*/SKILL.md) (`skills/*/SKILL.md`)
  - `[VERIFIED]` [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs) (`lib/repo-organizer.mjs`)
  - `[VERIFIED]` [m*](file:///Users/jbb/Documents/antigravity-memory-bank/skills/m*) (`skills/m*/`)
  - `[VERIFIED]` [minit.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/minit.mjs) (`scripts/minit.mjs`)
  - `[VERIFIED]` [mstart.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/mstart.mjs) (`scripts/mstart.mjs`)
  - `[VERIFIED]` [msync.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/msync.mjs) (`scripts/msync.mjs`)
  - `[VERIFIED]` [mclear.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/mclear.mjs) (`scripts/mclear.mjs`)
  - `[VERIFIED]` [mcontext.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/mcontext.mjs) (`scripts/mcontext.mjs`)
- **Acceptance Criteria**:
  - Complete implementation and verification for Repackage antigravity-memory-bank into 11 Standalone Cross-Agent Skills (Agensi.io)
  - Verify deterministic tests and lint checks for [FEAT-137]

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
