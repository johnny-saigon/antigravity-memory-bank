<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-146] Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution** (`HIGH` · Status: `done`): Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution
  - **[FEAT-145] Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync** (`HIGH` · Status: `done`): Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync
  - **[FEAT-144] AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI** (`HIGH` · Status: `done`): AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI
  - **[BUG-112] Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart** (`HIGH` · Status: `done`): Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart

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
### [FEAT-146] Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution *(Completed & Verified Baseline)*
- **Specification**: Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [google.verifier.ts](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/core/oauth/google.verifier.ts) (`bricks/user-profile/core/oauth/google.verifier.ts`)
- **Acceptance Criteria**:
  - Implement and verify Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution across bricks/user-profile/core/oauth/google.verifier.ts
  - Pass deterministic lint, typecheck, and automated test verification (npm test)

### [FEAT-145] Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync *(Completed & Verified Baseline)*
- **Specification**: Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs) (`scripts/sync-living-docs.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx) (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md) (`docs/PLANNING_GUIDE.md`)
- **Acceptance Criteria**:
  - Implement and verify Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync across scripts/sync-living-docs.mjs, scripts/sync-memory-context.mjs, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/PLANNING_GUIDE.md
  - Pass deterministic lint, typecheck, and automated test verification (npm test)

### [FEAT-144] AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI *(Completed & Verified Baseline)*
- **Specification**: AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [NativeSocialOAuthCoordinator.swift](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift) (`bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift`)
  - `[VERIFIED]` [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx) (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
  - `[VERIFIED]` [BUG_FIX_RECORDS.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/archive/BUG_FIX_RECORDS.md) (`docs/archive/BUG_FIX_RECORDS.md`)
  - `[VERIFIED]` [BUG_FIX_RECORDS.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/BUG_FIX_RECORDS.md) (`docs/quality/BUG_FIX_RECORDS.md`)
- **Acceptance Criteria**:
  - Implement and verify AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI across bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/archive/BUG_FIX_RECORDS.md, docs/quality/BUG_FIX_RECORDS.md
  - Pass deterministic lint, typecheck, and automated test verification (npm test)

### [BUG-112] Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart *(Completed & Verified Baseline)*
- **Specification**: Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [CredentialManagerOAuthBridge.kt](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt) (`bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt`)
  - `[VERIFIED]` [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx) (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
  - `[VERIFIED]` [task.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/planning/task.md) (`docs/planning/task.md`)
- **Acceptance Criteria**:
  - Implement and verify Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart across bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/planning/task.md
  - Add both a non-regression unit/component test and an E2E test verifying the fix

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
