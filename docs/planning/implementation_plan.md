<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[BUG-112] Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart** (`HIGH` · Status: `done`): Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart
  - **[FEAT-143] Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn)** (`HIGH` · Status: `done`): Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn)
  - **[FEAT-142] Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors** (`HIGH` · Status: `done`): Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors
  - **[BUG-110] ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH)** (`HIGH` · Status: `done`): ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH)

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

## 3. Proposed Changes
### [BUG-112] Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart *(Completed & Verified Baseline)*
- **Specification**: Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [CredentialManagerOAuthBridge.kt](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt) (`bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt`)
  - `[VERIFIED]` [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx) (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
  - `[VERIFIED]` [task.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/planning/task.md) (`docs/planning/task.md`)
- **Acceptance Criteria**:
  - Implement and verify Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart across bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/planning/task.md
  - Add both a non-regression unit/component test and an E2E test verifying the fix

### [FEAT-143] Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn) *(Completed & Verified Baseline)*
- **Specification**: Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx) (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
  - `[VERIFIED]` [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md) (`docs/BACKLOG.md`)
  - `[VERIFIED]` [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html) (`docs/backlog.html`)
- **Acceptance Criteria**:
  - Implement and verify Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn) across scripts/backlog.mjs, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/BACKLOG.md, docs/backlog.html
  - Pass deterministic lint, typecheck, and automated test verification (npm test)

### [FEAT-142] Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors *(Completed & Verified Baseline)*
- **Specification**: Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [src](file:///Users/jbb/Documents/antigravity-memory-bank/src) (`src/`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Implement and verify Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors
  - Add both a non-regression unit/component test and an E2E test verifying the fix

### [BUG-110] ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH) *(Completed & Verified Baseline)*
- **Specification**: ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH)
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md) (`docs/BACKLOG.md`)
  - `[VERIFIED]` [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html) (`docs/backlog.html`)
  - `[VERIFIED]` [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json) (`docs/backlog.json`)
- **Acceptance Criteria**:
  - Complete implementation and verification for ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH)
  - Verify deterministic tests and lint checks for [BUG-110]

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
