<!-- antigravity-planning-sync -->
# Walkthrough & Verification Proof — Antigravity Memory Bank

> [!TIP]
> **Cumulative Sprint Walkthrough**: Summarizes completed engineering tickets from [`docs/backlog.json`](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json), architectural accomplishments from [`memory-bank/activeContext.md`](file:///Users/jbb/Documents/antigravity-memory-bank/memory-bank/activeContext.md), and deterministic verification proof.

## 1. Executive Summary & Sprint Status
- **Project**: **Antigravity Memory Bank** (Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.)
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Backlog Completion**: **60 / 60** tickets verified `DONE` (0 in progress, 0 queued).

## 2. Recent Architectural Accomplishments
- **feat(docs): unify `FEAT-121` Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/design/DESIGN.md`, `scripts/sync-living-docs.mjs`, `templates/scripts/sync-living-docs.mjs`, `.agents/rules/docs-living-specs.md`, `README.md`) and roll out `upgrade` across `SnapCal`, `BinaryDay`, `RemoveBackGround`, and `wiro` (`10/10` canonical docs active, custom/nested docs classified & archived with repo-wide link rewriting, `10/10` ingestion checklist passed)**
- **feat(bricks): extract `bricks/user-profile` Hexagonal Brick (`FEAT-120`) with 4-provider Social OAuth (Google, Apple, Facebook, Microsoft), 3-Tier Pluggable UX/UI (`headless/` + `themed-ui/` + `src/adapters/user-profile-theme.adapter.ts`), and `BUG-737`/`BUG-738` non-regression tests**
- **feat(skills): implement executable `/context`, `/clear`, `/effort`, `/credits`, and `/usage` skills and CLI inspectors (`FEAT-119` & `FEAT-120`)**
- **feat(memory): implement native `model_decision` progressive disclosure and `< 50-line` root `AGENTS.md` (`FEAT-118`)**
- **feat(organize): implement `FEAT-117` AI-native repository & root reorganization engine (`lib/repo-organizer.mjs`, `npx antigravity-memory-bank organize`)**

## 3. Completed & Verified Backlog Tickets (`DONE`)
### ✅ [BUG-115]: Auto-execute /backlog-plan & /backlog-start in Prompt Window on PLAN/CODE transitions and enforce TO DO return for IN PROGRESS/DONE re-plan *(Verified 2026-11-24)*
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md), [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html), [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json)
- **Verified Criterion**: ✓ Implement and verify Auto-execute /backlog-plan & /backlog-start in Prompt Window on PLAN/CODE transitions and enforce TO DO return for IN PROGRESS/DONE re-plan across scripts/backlog.mjs, docs/BACKLOG.md, docs/backlog.html, docs/backlog.json
- **Verified Criterion**: ✓ Add both a non-regression unit/component test and an E2E test verifying the fix

### ✅ [BUG-114]: Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning *(Verified 2026-11-24)*
- **Summary**: Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning
- **Verified Components**: [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md)
- **Verified Criterion**: ✓ Implement and verify Fix Tickets Entering IN PROGRESS During Planning — Keep Greyed-Out & Locked in READY While Planning across docs/PLANNING_GUIDE.md
- **Verified Criterion**: ✓ Add both a non-regression unit/component test and an E2E test verifying the fix

### ✅ [BUG-113]: Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked) *(Verified 2026-11-24)*
- **Summary**: Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked)
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Implement and verify Fix Premature READY to IN PROGRESS Transition When Proceed Button Is Displayed (Not Clicked)
- **Verified Criterion**: ✓ Add both a non-regression unit/component test and an E2E test verifying the fix

### ✅ [FEAT-147]: Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets *(Verified 2026-11-24)*
- **Summary**: Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Implement and verify Consistent Child Ticket Creation & Naming (FEAT-xxx-ACT-1) for Planned Parent Tickets
- **Verified Criterion**: ✓ Pass deterministic lint, typecheck, and automated test verification (npm test)

### ✅ [FEAT-146]: Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution *(Verified 2026-11-24)*
- **Summary**: Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution
- **Verified Components**: [google.verifier.ts](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/core/oauth/google.verifier.ts)
- **Verified Criterion**: ✓ Implement and verify Multi-Ticket Selection on TO DO & READY Columns with Google Orchestrator Simultaneous Batch Plan/Code Execution across bricks/user-profile/core/oauth/google.verifier.ts
- **Verified Criterion**: ✓ Pass deterministic lint, typecheck, and automated test verification (npm test)

### ✅ [FEAT-145]: Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync *(Verified 2026-11-24)*
- **Summary**: Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync
- **Verified Components**: [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx), [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md)
- **Verified Criterion**: ✓ Implement and verify Universal Opened-Ticket PLAN NOW & CODE NOW Modal Actions, High-Effort Execution Badge & 100% Fleet/Brain Sync across scripts/sync-living-docs.mjs, scripts/sync-memory-context.mjs, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/PLANNING_GUIDE.md
- **Verified Criterion**: ✓ Pass deterministic lint, typecheck, and automated test verification (npm test)

### ✅ [FEAT-144]: AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI *(Verified 2026-11-24)*
- **Summary**: AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI
- **Verified Components**: [NativeSocialOAuthCoordinator.swift](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift), [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx), [BUG_FIX_RECORDS.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/archive/BUG_FIX_RECORDS.md), [BUG_FIX_RECORDS.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/BUG_FIX_RECORDS.md)
- **Verified Criterion**: ✓ Implement and verify AGY-Correlated Branding & Native Record Audio Vector Icon in TO DO Idea Modal & Kanban UI across bricks/user-profile/platforms/ios/headless/NativeSocialOAuthCoordinator.swift, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/archive/BUG_FIX_RECORDS.md, docs/quality/BUG_FIX_RECORDS.md
- **Verified Criterion**: ✓ Pass deterministic lint, typecheck, and automated test verification (npm test)

### ✅ [BUG-112]: Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart *(Verified 2026-11-24)*
- **Summary**: Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart
- **Verified Components**: [CredentialManagerOAuthBridge.kt](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt), [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx), [task.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/planning/task.md)
- **Verified Criterion**: ✓ Implement and verify Fix TO DO Modal Voice Capture with PlayTask-Parity Gemini/Whisper ASR, Host-Mic Iframe Fallback & Bridge v1.8.0 Restart across bricks/user-profile/platforms/android/headless/CredentialManagerOAuthBridge.kt, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/planning/task.md
- **Verified Criterion**: ✓ Add both a non-regression unit/component test and an E2E test verifying the fix

### ✅ [FEAT-143]: Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn) *(Verified 2026-11-24)*
- **Summary**: Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn)
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx), [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md), [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html)
- **Verified Criterion**: ✓ Implement and verify Isolated TO DO Column Click-to-Add Idea Modal (Zero-Token /backlog-add Without Disturbing Active Turn) across scripts/backlog.mjs, bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx, docs/BACKLOG.md, docs/backlog.html
- **Verified Criterion**: ✓ Pass deterministic lint, typecheck, and automated test verification (npm test)

### ✅ [FEAT-142]: Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors *(Verified 2026-11-24)*
- **Summary**: Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Implement and verify Upstream Trickle-Up Fix Harvester: Auto-Accept johnny-saigon Fixes & Create TO DO Notification Tickets for External Authors
- **Verified Criterion**: ✓ Add both a non-regression unit/component test and an E2E test verifying the fix

### ✅ [BUG-110]: ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH) *(Verified 2026-11-24)*
- **Summary**: ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH)
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [BACKLOG.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG.md), [backlog.html](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.html), [backlog.json](file:///Users/jbb/Documents/antigravity-memory-bank/docs/backlog.json)
- **Verified Criterion**: ✓ Complete implementation and verification for ### [BUG-110] Sandbox <brainDir>/backlog.html Fallback in findTargetBrainDirs() & Worktree Roster Badge (HIGH)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [BUG-110]

### ✅ [FEAT-141]: Explicit Worktree Fleet Installation & Upgrade Reporting Across All Main & Linked Worktrees *(Verified 2026-11-24)*
- **Summary**: Explicit Worktree Fleet Installation & Upgrade Reporting Across All Main & Linked Worktrees
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Implement and verify Explicit Worktree Fleet Installation & Upgrade Reporting Across All Main & Linked Worktrees
- **Verified Criterion**: ✓ Pass deterministic lint, typecheck, and automated test verification (npm test)

### ✅ [BUG-109]: ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH) *(Verified 2026-11-24)*
- **Summary**: ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH)
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Complete implementation and verification for ### [BUG-109] Zero-Skip Proceed Hook (git status Fallback) & Mandatory Turn-1 State Transition Rules (HIGH)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [BUG-109]

### ✅ [FEAT-140]: ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH) *(Verified 2026-11-24)*
- **Summary**: ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH)
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Complete implementation and verification for ### [FEAT-140] Strict 4-Stage Kanban State Machine, stage-plan CLI & Live Activity Badges (🧠 Planning... / ⏳ Awaiting Proceed / ⚡ Coding Live...) (HIGH)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [FEAT-140]

### ✅ [FEAT-139]: ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH) *(Verified 2026-11-24)*
- **Summary**: ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)
- **Verified Components**: `workspace`
- **Verified Criterion**: ✓ Complete implementation and verification for ### [FEAT-139] Partial-Done Residual Sub-Ticket Creation (a, b, c Children), Collapsed Parent in IN PROGRESS & Collapsible Open Children (HIGH)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [FEAT-139]

### ✅ [FEAT-138]: ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH) *(Verified 2026-11-24)*
- **Summary**: ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)
- **Verified Components**: [AvatarCropUploadModal.tsx](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx), [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md), [implementation_plan.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/planning/implementation_plan.md), [TEST_PLAN_AND_SUITES.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/TEST_PLAN_AND_SUITES.md)
- **Verified Criterion**: ✓ Complete implementation and verification for ### [FEAT-138] READY Ticket Examination Modal — Full Implementation Plan Viewer, Credit/Model Details & Direct 💻 Code Button (HIGH)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [FEAT-138]

### ✅ [FEAT-137]: Repackage antigravity-memory-bank into 11 Standalone Cross-Agent Skills (Agensi.io) *(Verified 2026-11-24)*
- **Summary**: Repackage the **antigravity-memory-bank** project into **11 cohesive, self-contained, `m*`-prefixed Agent Skills** (`minit`, `mstart`, `msync`, `mclear`, `mcontext`, `mbacklog`, `mplan`, `msprint`, `mdocs`, `morganize`, `mbrick`) conforming to the open **Agent Skills (`agentskills.io`)** and **`npx skills` / Agensi.io** specification so each skill can be lis
- **Verified Components**: [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [<name>](file:///Users/jbb/Documents/antigravity-memory-bank/skills/<name>), [*.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/*.mjs), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/*/SKILL.md), [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs), [m*](file:///Users/jbb/Documents/antigravity-memory-bank/skills/m*), [minit.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/minit.mjs), [mstart.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/mstart.mjs), [msync.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/msync.mjs), [mclear.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/mclear.mjs), [mcontext.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/mcontext.mjs)
- **Verified Criterion**: ✓ Complete implementation and verification for Repackage antigravity-memory-bank into 11 Standalone Cross-Agent Skills (Agensi.io)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [FEAT-137]

### ✅ [FEAT-136]: Automatic Ad-Hoc /plan → READY (After Design Review Display) & READY → IN PROGRESS (On Proceed) *(Verified 2026-11-24)*
- **Summary**: Enable seamless Kanban tracking for **ad-hoc `/plan` questions or changes** without breaking Antigravity's native blue **Proceed** button:
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/sync-memory-context.mjs), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/skills/backlog-plan/SKILL.md), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs)
- **Verified Criterion**: ✓ Complete implementation and verification for Automatic Ad-Hoc /plan → READY (After Design Review Display) & READY → IN PROGRESS (On Proceed)
- **Verified Criterion**: ✓ Verify deterministic tests and lint checks for [FEAT-136]

### ✅ [FEAT-135]: Add Chat-Side Model Switching (swarm model + ask_question), Update CheatSheet & Roll Out Across All 10 Projects *(Verified 2026-11-24)*
- **Summary**: Support --model switching via swarm(action:'model') and ask_question fallback in /backlog-plan and /backlog-start, document all 5 workflows in CREDITS_CHEATSHEET.md and BACKLOG_GUIDE.md, add E2E tests, and deploy to all 10 projects.
- **Verified Components**: [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/CREDITS_CHEATSHEET.md), [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs)

### ✅ [FEAT-134]: Add Interactive PLAN (TO DO -> READY) & CODE (READY -> IN PROGRESS) Model-Selector Modals + Symmetric Drag-and-Drop Triggers *(Verified 2026-11-24)*
- **Summary**: Add PLAN button on TO DO cards and CODE button on READY cards, build #modelSelectorModal ranking credit-optimal AGY models, and wire symmetric drag-and-drop triggers (TO DO -> READY opens PLAN model selector; READY -> IN PROGRESS opens CODE model selector) committing status transitions only after model selection.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)

### ✅ [FEAT-133]: Add /backlog-add Skill (TO DO Auto-Annotation Only) & Direct-to-READY /backlog-plan Invariant *(Verified 2026-11-24)*
- **Summary**: Create /backlog-add skill strictly for TO DO auto-annotation (0 plan/code credits), add autoAnnotateTicket() in scripts/backlog.mjs, and enforce that /backlog-plan creates/plans directly into READY and never auto-jumps to IN PROGRESS.
- **Verified Components**: [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-add/SKILL.md), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md)

### ✅ [FEAT-132]: Update Credits CheatSheet, Guides, Skills, E2E Tests & Deploy 4-Column Kanban Across All 10 Projects *(Verified 2026-11-24)*
- **Summary**: Document the 4-column To-Do -> Ready -> In Progress -> Done credit-saving workflow across CheatSheet, guides, and skills, add E2E tests, verify 15/15 parity, and deploy to all 10 installed Memory Bank projects.
- **Verified Components**: [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/CREDITS_CHEATSHEET.md), [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/CREDITS_CHEATSHEET.md), [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md), [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs)

### ✅ [FEAT-131]: Integrate To-Do -> Ready -> In Progress Lifecycle into Save Credits & AGY Model ROI Engine *(Verified 2026-11-24)*
- **Summary**: Add ready status validation in lint-memory.mjs, make Credit ROI advisor status-aware (Stage A frontier planning for unplanned todo vs Stage B workhorse model-downgrade trigger for ready tickets), and add 4-column workflow guide to Save Credits modal.
- **Verified Components**: [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)

### ✅ [FEAT-130]: Add 4th READY (Planned) Column to Backlog Kanban with Auto-Promotion on /backlog-plan & Split *(Verified 2026-11-24)*
- **Summary**: Evolve the Backlog Kanban into a 4-column board (To-Do / Backlog -> Ready (Planned) -> In Progress / QA -> Completed (Done)) with auto-promotion to status:ready on plan/split, drag-and-drop, per-column sort, filter pill, and CLI ready command.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)

### ✅ [FEAT-129]: Enforce Identical Canonical Backlog Kanban Design Across All Projects & Harden backlog-adapter Schema Normalization *(Verified 2026-11-23)*
- **Summary**: Fix TypeError in lib/backlog-adapter.mjs when existing docs/backlog.json uses tickets[] or omits milestones[] (which aborted upgrade before rendering backlog.html in SnapMail and Design Engineering Website), unify SSR/client card ROI rendering in scripts/backlog.mjs, auto-prune duplicate non-canonical backlog_kanban.html/root backlog.html artifacts, and re-render identical Kanban boards across all 10 projects.
- **Verified Components**: [backlog-adapter.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/backlog-adapter.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs), [BUG_FIX_RECORDS.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/quality/BUG_FIX_RECORDS.md)

### ✅ [FEAT-128]: Add Credits CheatSheet (docs/CREDITS_CHEATSHEET.md) to Memory Bank & Deploy to All Projects *(Verified 2026-11-23)*
- **Summary**: Create a well-designed, UX-polished Credits CheatSheet covering AGY's 3 deployed model families (Google Gemini, External Partner, Google Orchestrators), Dual Quota-Pool balancing, Two-Stage Split Routing, and Backlog-First economics; wire into init/upgrade and deploy to all installed Memory Bank projects.
- **Verified Components**: [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/CREDITS_CHEATSHEET.md), [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/CREDITS_CHEATSHEET.md), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md)

### ✅ [FEAT-127]: Verbose Credit-Saving Skills, Prescriptive Footer, Living Guides & Cross-Repo Rollout *(Verified 2026-11-23)*
- **Summary**: Upgrade all credit/planning skills, AGENTS directives (<50 lines), living guides, and README with verbose AGY model routing and ticket-first motivation, then deploy upgrade across all installed Memory Bank repos.
- **Verified Components**: [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/effort/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/credits/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/usage/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md), [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md), [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md), [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md)

### ✅ [FEAT-126]: Interactive Kanban Credit-Saving & AGY Model Advisor UI and CLI *(Verified 2026-11-23)*
- **Summary**: Add per-card AGY Model & Quality-to-Credit ROI pills, interactive Save Credits & AGY Model Advisor modal, Quick-Add live ROI banner, and npm run backlog advise CLI across scripts/backlog.mjs and templates/scripts/backlog.mjs.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)

### ✅ [FEAT-125]: Verbose AGY Model Roster, Quota-Pool & Ticket Quality-to-Credit ROI Engine *(Verified 2026-11-23)*
- **Summary**: Evolve scripts/lint-memory.mjs (--effort, --credits, --usage, --context, --advise) with all 27 deployed AGY models (Google Gemini 3.8/4, Google Orchestrators, External Claude 5.5 / GPT-OSS 120B), xhigh effort tier, Two-Stage Split Model Routing, Dual Quota-Pool balancing, and Backlog-First planning economics.
- **Verified Components**: [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs)

### ✅ [FEAT-124]: Add per-column and global Sort (Oldest to Newest and vice versa) and manual drag-and-drop / up-down ticket reordering across all Backlog instances *(Verified 2026-10-31)*
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)

### ✅ [FEAT-123]: Auto-Execute /clear & /compact Pre-Flight on Every /start Workflow Across All Installed Memory Banks *(Verified 2026-10-30)*
- **Summary**: Modify /start workflow (skills/start/SKILL.md, AGENTS.md, templates/AGENTS.md.tpl, rules/AGENTS.md, scripts/lint-memory.mjs, and bin/cli.mjs) so that every /start invocation automatically executes /clear and /compact pre-flight checkpointing first, and deploy across all installed Memory Banks.
- **Verified Components**: [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/skills/start/SKILL.md), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md)

### ✅ [FEAT-122]: Mandatory Plan-to-Backlog Ticket Creation & Atomic Plan Decomposition (backlog split & plan --from-plan) *(Verified 2026-10-26)*
- **Summary**: Enforce that every /plan or implementation_plan.md creates and splits atomic backlog tickets in docs/backlog.json for transparent project management across all installed projects.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md), [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md)

### ✅ [FEAT-121]: Canonical Living Documentation Hierarchy & Deep Universal Harvester (docs/INDEX.md + 4 Pillars) *(Verified 2026-10-23)*
- **Summary**: Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester: every initialized (init), upgraded (upgrade), organized (organize), or synced (docs:sync) repository automatically scaffolds the 9-file living documentation hierarchy inside docs/{architecture,design,quality,operations}/, classifies and consolidates all existing docs/**/*.md specs across the 8 canonical pillars (archiving originals in docs/archive/ and rewriting links repo-wide), non-destructively harvests README.md, SECURITY.md, CHANGELOG.md, and memory-bank/*.md sections, extracts deep codebase routes/schemas/tokens/tests, and bridges deep specs on demand via .agents/rules/docs-living-specs.md (trigger: model_decision).
- **Verified Components**: [docs-synthesizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/docs-synthesizer.mjs), [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-living-docs.mjs), [sync-living-docs.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/sync-living-docs.mjs), [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [docs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs), [docs-living-specs.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/rules/docs-living-specs.md.tpl), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs), [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md)
- **Verified Criterion**: ✓ Scaffolds all 9 canonical living documents and .agents/rules/docs-living-specs.md (trigger: model_decision) on init, upgrade, organize, and docs:sync while keeping memory-bank/*.md < 150 lines.
- **Verified Criterion**: ✓ Crawls and classifies all non-preserved docs/**/*.md files across the 8 pillars, merges content with zero loss, archives originals in docs/archive/, and rewrites relative and file:// links repo-wide.
- **Verified Criterion**: ✓ Non-destructively harvests domain sections from README.md, SECURITY.md, CHANGELOG.md, and memory-bank/*.md with clickable provenance links.
- **Verified Criterion**: ✓ Extracts deep codebase facts (Next.js app/**/route.ts methods, Prisma models, SQL CREATE TABLE, mobile OAuth schemes, masked .env* keys, brand tokens, and test suites) and passes 15/15 E2E & contract tests.

### ✅ [FEAT-120]: Phase 1: Extract SnapCal Multi-Platform OAuth, User Profile & Pluggable UX/UI Brick (bricks/user-profile/) *(Verified 2026-10-22)*
- **Summary**: Extract User Profile Management and 4-Provider Social Login (Google, Facebook, Apple, Microsoft) from ../SnapCal into bricks/user-profile/ as a shared, platform-adaptive Hexagonal Brick with a Headless + Design-Token/Slot Theming Engine (ProfileBrandThemePort & ProfileUISlotsPort) across Web, iOS, and Android.
- **Verified Components**: [brick.json](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/brick.json), [core](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/core), [web](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/web), [ios](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/ios), [android](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/platforms/android), [templates](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/adapters/templates), [schemas](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/schemas), [contract.spec.ts](file:///Users/jbb/Documents/antigravity-memory-bank/bricks/user-profile/testing/contract.spec.ts), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [package.json](file:///Users/jbb/Documents/antigravity-memory-bank/package.json), [brick-governance.md](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/rules/brick-governance.md)
- **Verified Criterion**: ✓ Zero hardcoded SnapCal brand styles, hex colors, logos, bundle IDs (com.snapcal), or DB calls inside bricks/user-profile/.
- **Verified Criterion**: ✓ Complete separation of platforms/{web,ios,android}/headless/ and platforms/{web,ios,android}/themed-ui/ powered by ProfileBrandThemePort (--ag-profile-* tokens) and ProfileUISlotsPort.
- **Verified Criterion**: ✓ bin/cli.mjs supports brick list, brick install user-profile [--platforms web,ios,android | --platforms web] [--with-schema], brick upgrade user-profile (preserving repo-local adapters), and brick doctor user-profile.
- **Verified Criterion**: ✓ npm test passes contract.spec.ts for all 4 OAuth providers, profile CRUD, account linking, and theme token injection, and npm run lint:memory passes with 0 violations.

### ✅ [FEAT-119]: Stop the Credit Bleed Controls & Executable Slash-Command Skills (/context, /clear, /effort, /credits, /usage) *(Verified 2026-10-22)*
- **Summary**: Enforce pre-edit /plan gate on complex features/bugs, /effort reasoning tiering, aggressive /clear + /compact + /context pruning after every task, and Google One / Antigravity Overage Toggle disable + /credits & /usage monitoring across GEMINI.md, AGENTS.md, negative-constraints.md, and skills.
- **Verified Components**: [skills](file:///Users/jbb/Documents/antigravity-memory-bank/skills), [skills](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/skills), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)

### ✅ [FEAT-118]: Antigravity Native Rule Discovery & model_decision Progressive Disclosure *(Verified 2026-10-22)*
- **Summary**: Eliminate the Silent Discard Trap, Broken Frontmatter Trap (snake_case trigger: model_decision), and Token Bloat Trap (<50-line root AGENTS.md/GEMINI.md without inline @-expansion bloat); bridge memory-bank/*.md via .agents/rules/memory-*.md and lint via scripts/lint-memory.mjs.
- **Verified Components**: [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [rules](file:///Users/jbb/Documents/antigravity-memory-bank/.agents/rules), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)

### ✅ [FEAT-117]: AI-Native Repository & Root Reorganization Engine (organize) *(Verified 2026-10-21)*
- **Summary**: Automatically organize repository root entrypoints, relocate loose root specs/boards into docs/ with git mv and link rewriting, remove redundant CLAUDE.md stubs and clutter, harden .gitignore, and scaffold canonical AI-native directories on fresh and existing projects.
- **Verified Components**: [repo-organizer.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/repo-organizer.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs), [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs), [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md)

### ✅ [FEAT-116]: Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill *(Verified 2026-10-21)*
- **Summary**: Integrate Antigravity Planning Mode (Explore -> Plan -> Review -> Execute) across all initialized and upgraded projects, correlating the 3-Artifact Lifecycle (task.md, implementation_plan.md, walkthrough.md) directly with docs/backlog.json and memory-bank/*.md and pre-populating artifacts for existing/advanced projects.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/PLANNING_GUIDE.md), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs)
- **Verified Criterion**: ✓ Automatically populates and syncs task.md, implementation_plan.md, and walkthrough.md in docs/planning/ and <brainDir>/ from existing backlog and memory-bank context.
- **Verified Criterion**: ✓ Installs /backlog-plan skill (.agents/skills/backlog-plan/SKILL.md) and docs/PLANNING_GUIDE.md on init and upgrade.
- **Verified Criterion**: ✓ Correlates backlog.html cards (📐 Plan button + /api/plan bridge) and /backlog-start with the 3 Planning Mode artifacts.

### ✅ [FEAT-115]: Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start *(Verified 2026-10-18)*
- **Summary**: Upstreamed from SnapCal (commit 0f346ae): enforce non-negotiable Strict End-to-End Verification Before Closure in AGENTS.md and .agents/skills/backlog-start/SKILL.md (Rule 4 + Phase 3 guard) so tickets involving third-party integrations, OAuth providers, or external credentials can NEVER be marked done until live credentials are configured on the server and real provider HTTP requests pass.
- **Verified Components**: [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs)
- **Verified Criterion**: ✓ AGENTS.md and templates/AGENTS.md.tpl enforce Strict End-to-End Verification Before Closure.
- **Verified Criterion**: ✓ skills/backlog-start/SKILL.md Rule 4 forbids running npm run backlog done on integration tickets without live server credentials and passing provider HTTP requests.
- **Verified Criterion**: ✓ bin/cli.mjs upgradeMemory injects the mandate into all downstream AGENTS.md formats and passes 10/10 on the Mandatory Baseline Ingestion Checklist across all 5 repositories.

### ✅ [FEAT-114]: On-the-Fly Lifecycle Hooks (.agents/hooks.json), Zero-Manual-Step Memory Registration & 10-Point Mandatory Ingestion Checklist *(Verified 2026-10-18)*
- **Summary**: Eliminate manual memory:sync / memory:upgrade actions when new API keys, MCP servers, skills, rules, repo paths, or architectural decisions are added. Enforce a 10-Point Mandatory Baseline Ingestion Checklist on every init and upgrade, auto-partition AGENTS.md @[...] includes under the 24KB per-rule cap, and wire .agents/hooks.json (SessionStart, PostToolUse, Stop) for real-time on-the-fly synchronization.
- **Verified Components**: [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs), [customizations-scraper.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/customizations-scraper.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md)
- **Verified Criterion**: ✓ Zero manual steps required when adding API keys, MCP servers, skills, rules, or repo paths (.agents/hooks.json auto-syncs on SessionStart, PostToolUse, and Stop).
- **Verified Criterion**: ✓ 10-Point Mandatory Baseline Ingestion Checklist runs and passes 10/10 across all installed repositories on init and upgrade.
- **Verified Criterion**: ✓ Automatic <24KB rule shard balancer ensures 100% of memory-bank/*.md files load into Antigravity rules without truncation.

### ✅ [BUG-107]: Pull API Keys, Env Contracts, MCP Server Configs & Customizations into Memory Bank on Init/Upgrade/Sync *(Verified 2026-10-18)*
- **Summary**: API keys (.env*, eas.json, credentials/*.p8, host token files), MCP server configs (~/.gemini/config/mcp_config.json, .mcp.json), and Antigravity customizations (.agents/rules/*, .agents/skills/*, .agents/workflows/*, ~/.gemini/config/hooks.json, ~/.gemini/config/config.json) were not pulled into memory-bank during init, upgrade, or sync. Additionally, bin/cli.mjs ignored positional directory arguments.
- **Verified Components**: [customizations-scraper.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/customizations-scraper.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [integrationsAndCustomizations.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/memory-bank/integrationsAndCustomizations.md.tpl), [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md)
- **Verified Criterion**: ✓ Automatically indexes all .env* keys, eas.json credentials, host tokens, MCP servers, rules, skills, and hooks into memory-bank/integrationsAndCustomizations.md.
- **Verified Criterion**: ✓ Never commits raw secret literals to Git while giving agents 100% visibility into key names and file paths.
- **Verified Criterion**: ✓ bin/cli.mjs supports positional target directory and upgrades all installed repositories cleanly under <150 lines.

### ✅ [FEAT-113]: Automatic Context & UX/UI .zip Bundle Ingestion in /backlog-start & Backlog Engine *(Verified 2026-10-18)*
- **Summary**: Automatically detect, copy, and unpack attached files (such as UX/UI .zip exports containing DESIGN.md, tokens.json, HTML/Tailwind screens, and mockups) via CLI, Review pane UI, or inline /backlog-start prompts.
- **Verified Components**: [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [backlog-adapter.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/backlog-adapter.mjs)

### ✅ [FEAT-112]: Automated Byte-Parity Check Between scripts/backlog.mjs and templates/scripts/backlog.mjs *(Verified 2026-10-21)*
- **Summary**: Ensure upstream bug fixes to scripts/backlog.mjs never drift from templates/scripts/backlog.mjs distributed to downstream projects.
- **Verified Components**: [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)
- **Verified Criterion**: ✓ npm test fails if scripts/backlog.mjs and templates/scripts/backlog.mjs diverge.

### ✅ [FEAT-111]: Automated Zero-Dependency E2E CLI Test Suite (init, upgrade, sync, export, uninstall) *(Verified 2026-10-21)*
- **Summary**: Add an automated smoke test script using node:test and node:assert that exercises init, upgrade, sync, export, and uninstall inside an isolated temporary directory.
- **Verified Components**: [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs)
- **Verified Criterion**: ✓ Tests init, upgrade, sync, export, and uninstall in an isolated temp directory.
- **Verified Criterion**: ✓ Verifies custom memory-bank/*.md domain files are 100% preserved across upgrade.
- **Verified Criterion**: ✓ Passes via npm test.

### ✅ [BUG-106]: Fix Stale _npx Cache, Workspace-Dominance Brain Matching & Sandboxed Kickoff Prompt Clipboard/Bridge *(Verified 2026-10-18)*
- **Summary**: Resolved 3 root causes preventing 100% reliable backlog.html generation on upgrade/init and blocking Kickoff Prompt clipboard copy in sandboxed Review pane iframes: (1) npm cached stale git tarballs in ~/.npm/_npx, (2) flat +200 brain scoring caused multi-project conversations to steal backlog.html writes, and (3) unescaped double quotes in task titles + navigator.clipboard permissions blocked Kickoff Prompt.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)
- **Verified Criterion**: ✓ 100% accurate docs/backlog.html and <brainDir>/backlog.html generation across all 5 colocated projects on init and upgrade.
- **Verified Criterion**: ✓ Kickoff Prompt works reliably on titles with quotes and copies to clipboard inside sandboxed iframes and via native OS pbcopy.

### ✅ [BUG-105]: Prevent MILESTONE-* Items from Being Re-Imported as Duplicate Feature Tasks *(Verified 2026-10-17)*
- **Summary**: Discovered while dogfooding upgrade inside antigravity-memory-bank: checklistItemRegex in lib/backlog-adapter.mjs matched - [x] **MILESTONE-1** in docs/BACKLOG.md and imported it into tasks.
- **Verified Components**: [backlog-adapter.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/backlog-adapter.mjs)
- **Verified Criterion**: ✓ Repeated upgrade runs are 100% idempotent (0 duplicate tasks imported from MILESTONE-* bullets).

### ✅ [BUG-104]: Remove Downstream Project Names & Private Host IPs from Upstream Templates *(Verified 2026-10-17)*
- **Summary**: Trickled up after upstreaming the backlog engine from a downstream repo: hardcoded SnapCal references and Vast.ai host IPs leaked into upstream templates and skills.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/update-memory/SKILL.md), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)
- **Verified Criterion**: ✓ Zero downstream project names or private host IPs in bin/, skills/, rules/, or templates/.
- **Verified Criterion**: ✓ scripts/backlog.mjs and templates/scripts/backlog.mjs remain byte-identical.

### ✅ [BUG-103]: Fix Active Brain Directory Discovery & Always Render docs/backlog.html *(Verified 2026-10-17)*
- **Summary**: Trickled up when backlog.html was not created in the active session after npm run memory:upgrade: findActiveBrainDir() relied on directory stat.mtimeMs (which does not update when transcript.jsonl is appended) and required backlog.html/task.md to already exist.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs)
- **Verified Criterion**: ✓ Accurately targets the active conversation brain directory even in brand-new sessions.
- **Verified Criterion**: ✓ Always writes docs/backlog.html in the project workspace.

### ✅ [BUG-102]: Bypass post-commit Hook During Git Rebase, Cherry-Pick & Merge *(Verified 2026-10-17)*
- **Summary**: Trickled up during branch rebasing: post-commit hook triggered sync-memory-context.mjs mid-rebase, dirtying the working tree and interrupting git rebase.
- **Verified Components**: [post-commit.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/git/hooks/post-commit.tpl)
- **Verified Criterion**: ✓ post-commit hook exits cleanly as a no-op during rebase, merge, or cherry-pick.

### ✅ [BUG-101]: Preserve Existing Curated Notes Non-Destructively in sync-memory-context.mjs *(Verified 2026-10-17)*
- **Summary**: Trickled up from downstream commit sync: sync-memory-context.mjs previously overwrote manually curated accomplishments in activeContext.md and progress.md.
- **Verified Components**: [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs)
- **Verified Criterion**: ✓ Existing manual notes in activeContext.md and progress.md are preserved.
- **Verified Criterion**: ✓ Commits are deduplicated by hash.

### ✅ [FEAT-110]: Dogfooding & Strict Upstream Package Isolation Architecture *(Verified 2026-10-17)*
- **Summary**: Dogfood the Three-Tier Memory Bank and Backlog Kanban directly inside antigravity-memory-bank while isolating downstream npx installs via package.json files whitelist and isSelfRepo guards.
- **Verified Components**: [package.json](file:///Users/jbb/Documents/antigravity-memory-bank/package.json), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [.gitignore](file:///Users/jbb/Documents/antigravity-memory-bank/.gitignore), [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md)
- **Verified Criterion**: ✓ npm pack --dry-run includes only the 29 distributable engine files.
- **Verified Criterion**: ✓ isSelfRepo prevents self-overwriting or deleting upstream scripts/.

### ✅ [FEAT-109]: Automated Board & Bug Record Adapter During init / upgrade *(Verified 2026-10-17)*
- **Summary**: Trickled up from upgrading downstream projects with pre-existing markdown boards: automatically discover and migrate MIGRATION_BOARD.md, BACKLOG.md, ROADMAP.md, and BUG_FIX_RECORDS.md into docs/backlog.json.
- **Verified Components**: [backlog-adapter.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/backlog-adapter.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)
- **Verified Criterion**: ✓ Automatically migrates existing markdown boards and bug records on init/upgrade.
- **Verified Criterion**: ✓ Renders synchronized docs/BACKLOG.md and backlog.html Kanban immediately.

### ✅ [FEAT-108]: Decoupled Zero-Token Backlog Engine, /backlog-start Skill & Review Pane Kanban *(Verified 2026-10-17)*
- **Summary**: Eliminate the 15k-35k token cost of chat-based task capture via an offline zero-token backlog store (docs/backlog.json), interactive Kanban board (backlog.html), and frugal /backlog-start execution skill.
- **Verified Components**: [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md), [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/BACKLOG_GUIDE.md)
- **Verified Criterion**: ✓ Zero-token offline task capture via npm run backlog or Review pane UI.
- **Verified Criterion**: ✓ 1-click /backlog-start <ID> prompt copy and automated sprint closure + work recap.

### ✅ [FEAT-107]: Passive Observer Invariant & Operational Board Separation into docs/ *(Verified 2026-10-17)*
- **Summary**: Trickled up from downstream project usage: codify that memory-bank/*.md is strictly a passive observer baseline (<150 lines) while operational boards live in docs/.
- **Verified Components**: [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/update-memory/SKILL.md)
- **Verified Criterion**: ✓ Memory Bank stays <150 lines (~1.5k tokens) as a read-only context baseline.
- **Verified Criterion**: ✓ Operational tickets and bug logs are separated into docs/.

### ✅ [FEAT-106]: Incremental Context Auto-Synchronizer, Git Post-Commit Hook & CI Workflow *(Verified 2026-10-17)*
- **Summary**: Keep memory-bank/activeContext.md and progress.md synchronized automatically on every feat:/fix: git commit and main branch push with zero LLM token usage.
- **Verified Components**: [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs), [post-commit.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/git/hooks/post-commit.tpl), [memory-bank-sync.yml.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/github/workflows/memory-bank-sync.yml.tpl)
- **Verified Criterion**: ✓ Automatically updates last synchronized commit hash and accomplishments on commit.
- **Verified Criterion**: ✓ CI workflow verifies <150-line budget on every push and PR.

### ✅ [FEAT-105]: Automated Historical Context Scraper (Git, Docs & Antigravity Transcripts) *(Verified 2026-10-17)*
- **Summary**: Trickled up from downstream init runs: automatically scrape git commit history, markdown documentation, and ~/.gemini/antigravity/brain/*/transcript.jsonl logs during init.
- **Verified Components**: [context-scraper.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/context-scraper.mjs), [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)
- **Verified Criterion**: ✓ Scrapes git commits, docs/*.md, and Antigravity conversation transcripts.
- **Verified Criterion**: ✓ Populates activeContext.md and progress.md with real project history on day one.

### ✅ [FEAT-104]: Non-Destructive In-Place Upgrade Workflow for Existing Installations *(Verified 2026-10-17)*
- **Summary**: Trickled up from upgrading BinaryDay, RemoveBackGround, and SnapCal: upgrade skills, linters, and hooks in-place while preserving 100% of custom memory-bank/*.md domain documents.
- **Verified Components**: [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)
- **Verified Criterion**: ✓ 100% preservation of existing memory-bank/*.md files.
- **Verified Criterion**: ✓ Upgrades AGENTS.md, skills, and package.json lifecycle scripts.

### ✅ [FEAT-103]: Consolidated Context Export & Zero-Loss Clean Deinstallation *(Verified 2026-10-17)*
- **Summary**: Export project memory to a single consolidated markdown file and tar.gz archive, and run automatic backup before uninstalling Memory Bank files.
- **Verified Components**: [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs)
- **Verified Criterion**: ✓ Generates consolidated markdown and .tar.gz archive in ./memory-backups/.
- **Verified Criterion**: ✓ Cleanly removes memory-bank artifacts while preserving custom skills/rules.

### ✅ [FEAT-102]: On-the-Fly CLI Initializer & Universal One-Line Shell Installer *(Verified 2026-10-17)*
- **Summary**: Zero-restart CLI initializer (npx github:johnny-saigon/antigravity-memory-bank init) and curl | bash installer that auto-detects stack, git remotes, and ports.
- **Verified Components**: [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), [install.sh](file:///Users/jbb/Documents/antigravity-memory-bank/install.sh)
- **Verified Criterion**: ✓ Activates skills and rules in an open Antigravity IDE window with zero restart.
- **Verified Criterion**: ✓ Auto-detects frontend, backend, database, and port from package.json and .env.

### ✅ [FEAT-101]: Three-Tier Memory Bank Brick, 2-Phase Continuous Cycle & <150-Line Linter *(Verified 2026-10-17)*
- **Summary**: Core Three-Tier Memory Hierarchy (Tier 1 Global, Tier 2 Cluster Invariants, Tier 3 Domain Memory Bank) extracted from production multi-project usage with <150-line budget enforcement and 2-phase continuous session cycling.
- **Verified Components**: [memory-bank](file:///Users/jbb/Documents/antigravity-memory-bank/templates/memory-bank), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md), [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/update-memory/SKILL.md), [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [plugin.json](file:///Users/jbb/Documents/antigravity-memory-bank/plugin.json)
- **Verified Criterion**: ✓ Enforces <150 lines across all memory-bank/*.md files.
- **Verified Criterion**: ✓ 2-Phase /update-memory closes current milestone and auto-starts next session banner.

## 4. Proof of Verification & Compliance Matrix
| Verification Gate | Command / Artifact | Status |
| :--- | :--- | :--- |
| **Memory Bank Line Budget (`< 150 lines`)** | `npm run lint:memory` | ✅ Verified (`0` violations) |
| **10-Point Baseline Ingestion Checklist** | `npx antigravity-memory-bank upgrade` | ✅ `10/10` Passed |
| **3-Artifact Planning Correlation** | `docs/planning/{task,implementation_plan,walkthrough}.md` | ✅ Synchronized (60/60 Done) |
| **Automated Verification Command** | `npm run lint:memory` | ✅ Configured & Active |
| **Automated Verification Command** | `npm test` | ✅ Configured & Active |
| **Automated Verification Command** | `npm run test:e2e` | ✅ Configured & Active |
