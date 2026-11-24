<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-152] Fix wrong workspace displayed in Memory Bank Side Pane (fleet upgrade backlog.html mtime clobber)** (`HIGH` · Status: `done`): Implement and verify according to project architecture invariants.
  - **[FEAT-151-ACT-3] 3. [FEAT-151-ACT-3] Bundle Rebuild, E2E Test (3p. FEAT-151) & Rollout** (`MEDIUM` · Status: `done`): 3. [FEAT-151-ACT-3] Bundle Rebuild, E2E Test (3p. FEAT-151) & Rollout
  - **[FEAT-151-ACT-2] 2. [FEAT-151-ACT-2] Remove Cross-Repo/Cross-Branch Controls from Side Pane UI & backlog.html** (`MEDIUM` · Status: `done`): 2. [FEAT-151-ACT-2] Remove Cross-Repo/Cross-Branch Controls from Side Pane UI & backlog.html
  - **[FEAT-151-ACT-1] 1. [FEAT-151-ACT-1] Strict Single-Branch Filtering in MCP Server** (`MEDIUM` · Status: `done`): 1. [FEAT-151-ACT-1] Strict Single-Branch Filtering in MCP Server

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [FEAT-152] Fix wrong workspace displayed in Memory Bank Side Pane (fleet upgrade backlog.html mtime clobber) *(Completed & Verified Baseline)*
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [server.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/server.mjs) (`mcp/src/server.mjs`)
  - `[VERIFIED]` [app.ts](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/ui/app.ts) (`mcp/src/ui/app.ts`)
  - `[VERIFIED]` [types.ts](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/ui/types.ts) (`mcp/src/ui/types.ts`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)
- **Acceptance Criteria**:
  - Implement and verify Fix wrong workspace displayed in Memory Bank Side Pane (fleet upgrade backlog.html mtime clobber) across mcp/src/server.mjs, mcp/src/ui/app.ts, mcp/src/ui/types.ts, scripts/backlog.mjs, bin/cli.mjs, tests/cli-e2e.test.mjs
  - Add both a non-regression unit/component test and an E2E test verifying the fix

### [FEAT-151-ACT-3] 3. [FEAT-151-ACT-3] Bundle Rebuild, E2E Test (3p. FEAT-151) & Rollout *(Completed & Verified Baseline)*
- **Specification**: 3. [FEAT-151-ACT-3] Bundle Rebuild, E2E Test (3p. FEAT-151) & Rollout
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [TEST_PLAN_AND_SUITES.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/TEST_PLAN_AND_SUITES.md) (`docs/quality/TEST_PLAN_AND_SUITES.md`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 3. [FEAT-151-ACT-3] Bundle Rebuild, E2E Test (3p. FEAT-151) & Rollout
  - Verify deterministic tests and lint checks for [FEAT-151-ACT-3]

### [FEAT-151-ACT-2] 2. [FEAT-151-ACT-2] Remove Cross-Repo/Cross-Branch Controls from Side Pane UI & backlog.html *(Completed & Verified Baseline)*
- **Specification**: 2. [FEAT-151-ACT-2] Remove Cross-Repo/Cross-Branch Controls from Side Pane UI & backlog.html
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md) (`docs/BACKLOG.md`)
  - `[VERIFIED]` [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html) (`docs/backlog.html`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 2. [FEAT-151-ACT-2] Remove Cross-Repo/Cross-Branch Controls from Side Pane UI & backlog.html
  - Verify deterministic tests and lint checks for [FEAT-151-ACT-2]

### [FEAT-151-ACT-1] 1. [FEAT-151-ACT-1] Strict Single-Branch Filtering in MCP Server *(Completed & Verified Baseline)*
- **Specification**: 1. [FEAT-151-ACT-1] Strict Single-Branch Filtering in MCP Server
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 1. [FEAT-151-ACT-1] Strict Single-Branch Filtering in MCP Server
  - Verify deterministic tests and lint checks for [FEAT-151-ACT-1]

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
