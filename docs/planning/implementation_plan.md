<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-148-ACT-4] 4. [FEAT-148-ACT-4] CLI Plugin Installer, Template Sync & E2E Verification** (`MEDIUM` · Status: `done`): 4. [FEAT-148-ACT-4] CLI Plugin Installer, Template Sync & E2E Verification
  - **[FEAT-148-ACT-3] 3. [FEAT-148-ACT-3] Memory & Rules, Credits/Usage, Fleet Worktrees & Bricks Tabs** (`MEDIUM` · Status: `done`): 3. [FEAT-148-ACT-3] Memory & Rules, Credits/Usage, Fleet Worktrees & Bricks Tabs
  - **[FEAT-148-ACT-2] 2. [FEAT-148-ACT-2] Native Kanban Tab, app.sendMessage() & Context Pills** (`MEDIUM` · Status: `done`): 2. [FEAT-148-ACT-2] Native Kanban Tab, app.sendMessage() & Context Pills
  - **[FEAT-148-ACT-1] 1. [FEAT-148-ACT-1] Plugin Bundle, Build Pipeline & MCP Server Core** (`MEDIUM` · Status: `done`): 1. [FEAT-148-ACT-1] Plugin Bundle, Build Pipeline & MCP Server Core

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [FEAT-148-ACT-4] 4. [FEAT-148-ACT-4] CLI Plugin Installer, Template Sync & E2E Verification *(Completed & Verified Baseline)*
- **Specification**: 4. [FEAT-148-ACT-4] CLI Plugin Installer, Template Sync & E2E Verification
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs) (`scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [theme.adapter.template.ts](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/adapters/templates/theme.adapter.template.ts) (`bricks/user-profile/adapters/templates/theme.adapter.template.ts`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 4. [FEAT-148-ACT-4] CLI Plugin Installer, Template Sync & E2E Verification
  - Verify deterministic tests and lint checks for [FEAT-148-ACT-4]

### [FEAT-148-ACT-3] 3. [FEAT-148-ACT-3] Memory & Rules, Credits/Usage, Fleet Worktrees & Bricks Tabs *(Completed & Verified Baseline)*
- **Specification**: 3. [FEAT-148-ACT-3] Memory & Rules, Credits/Usage, Fleet Worktrees & Bricks Tabs
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [brick.json](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/brick.json) (`bricks/user-profile/brick.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 3. [FEAT-148-ACT-3] Memory & Rules, Credits/Usage, Fleet Worktrees & Bricks Tabs
  - Verify deterministic tests and lint checks for [FEAT-148-ACT-3]

### [FEAT-148-ACT-2] 2. [FEAT-148-ACT-2] Native Kanban Tab, app.sendMessage() & Context Pills *(Completed & Verified Baseline)*
- **Specification**: 2. [FEAT-148-ACT-2] Native Kanban Tab, app.sendMessage() & Context Pills
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [context-scraper.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/context-scraper.mjs) (`lib/context-scraper.mjs`)
  - `[VERIFIED]` [NativeSocialOAuthCoordinator.swift](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift) (`bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 2. [FEAT-148-ACT-2] Native Kanban Tab, app.sendMessage() & Context Pills
  - Verify deterministic tests and lint checks for [FEAT-148-ACT-2]

### [FEAT-148-ACT-1] 1. [FEAT-148-ACT-1] Plugin Bundle, Build Pipeline & MCP Server Core *(Completed & Verified Baseline)*
- **Specification**: 1. [FEAT-148-ACT-1] Plugin Bundle, Build Pipeline & MCP Server Core
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for 1. [FEAT-148-ACT-1] Plugin Bundle, Build Pipeline & MCP Server Core
  - Verify deterministic tests and lint checks for [FEAT-148-ACT-1]

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
