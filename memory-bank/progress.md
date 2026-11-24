# antigravity-memory-bank — Progress Tracker & Acceptance Matrix

## 1. High-Level Milestone Tracking
- [x] **fix(backlog): auto-execute PLAN/CODE in Prompt Window & enforce TO DO return for IN PROGRESS/DONE re-plan (BUG-115)** (`85403fb`)
- [x] **feat(backlog): consistent -ACT-N child tickets, Proceed guard & locked READY planning UI (FEAT-147, BUG-113, BUG-114)** (`6b87730`)
- [x] **feat(backlog): AGY Record Audio SVG branding (FEAT-144), universal PLAN NOW / CODE NOW + High Effort & fleet/brain sync (FEAT-145), and multi-ticket Orchestrator batching (FEAT-146)** (`f95fd3d`)
- [x] **fix(backlog): implement PlayTask-parity Gemini/Whisper ASR & macOS host-mic bridge v1.8.0 (BUG-112)** (`c296aaf`)
- [x] **fix(backlog): implement PlayTask-parity Gemini/Whisper ASR & macOS host-mic bridge v1.8.0 (BUG-112)** (`2d78b4b`)
- [x] **docs: sync memory-bank context after BUG-111 resolution** (`7ee0802`)
- [x] **fix(backlog): harden voice capture in TO DO idea modal with dual-engine fallback (BUG-111)** (`cfd803c`)
- [x] **feat(backlog): add voice input dictation to isolated TO DO idea modal (FEAT-143)** (`b43d344`)
- [x] **feat(backlog): isolated TO DO column click-to-add idea modal without disturbing active turn (FEAT-143)** (`d405624`)
- [x] **feat(cli): worktree-aware fleet reporting (FEAT-141), trickle-up fix harvester (FEAT-142), sandbox brainDir fallback (BUG-110)** (`b77d120`)
- [x] **fix(worktree): prevent cross-worktree brain implementation_plan.md bleed and harden sandboxed worktree branch detection** (`1881828`)
- [x] **feat(backlog): retrieve children tickets of non-completed parent tickets across CLI, API, and Kanban** (`0f98f7a`)
- [x] **feat(backlog): worktree isolation & auto-upgrade (FEAT-137), READY plan examination modal (FEAT-138), residual children a/b/c (FEAT-139)** (`13d146e`)
- [x] **feat(backlog): auto-register ad-hoc /plan into READY on review display & move READY -> IN PROGRESS on Proceed (FEAT-136)** (`0c33828`)
- [x] **feat(kanban): add /backlog-add skill, autoAnnotateTicket, interactive PLAN/CODE model selectors & drag-and-drop triggers (FEAT-133..135) [skip ci]** (`11fcb37`)
- [x] **feat(kanban): add 4th READY (Planned) column & integrate Two-Stage Credit Savings workflow (FEAT-130..132) [skip ci]** (`3baa2d6`)
- [x] **fix(backlog): enforce identical canonical Backlog Kanban design across all projects & harden backlog-adapter (FEAT-129) [skip ci]** (`079e448`)
- [x] **fix(docs): whitelist docs/CREDITS_CHEATSHEET.md in living-docs organizer & index in docs/INDEX.md [skip ci]** (`b9706b7`)
- [x] **feat(docs): add UX-polished Credits CheatSheet (docs/CREDITS_CHEATSHEET.md) & wire into Memory Bank upgrade (FEAT-128) [skip ci]** (`5170bca`)
- [x] **feat(credits): evolve Save Credits paradigm for full AGY 3-family model roster & ticket Q/C ROI (FEAT-125..127) [skip ci]** (`d34c754`)
- [x] **fix(backlog): enforce exact repoRoot ownership in findTargetBrainDirs to prevent sibling repo collision** (`c9b5ee9`)
- [x] **feat(backlog): add per-column/global Oldest<->Newest sort and manual drag-and-drop reordering [skip ci]** (`7c2d83e`)
- [x] **feat(memory): add non-destructive compaction watermark delta tracking on /start and /clear [skip ci]** (`22e63f4`)
- [x] **feat(memory): add non-destructive compaction watermark delta tracking on /start and /clear [skip ci]** (`cddcc55`)
- [x] **feat(memory): add non-destructive compaction watermark delta tracking on /start and /clear [skip ci]** (`537feee`)
- [x] **feat(memory): add non-destructive compaction watermark delta tracking on /start and /clear [skip ci]** (`47159ab`)
- [x] **feat(memory): add non-destructive compaction watermark delta tracking on /start and /clear [skip ci]** (`9cff15e`)
- [x] **fix(skills): simplify Always-On Credit Tip to recommend /start directly (auto-runs /clear & /compact pre-flight)** (`f3e143e`)
- [x] **feat(skills): auto-execute /clear and /compact pre-flight on every /start workflow (FEAT-123) [skip ci]** (`80980f0`)
- [x] **feat(backlog): add UX ticket type support and Planning Mode Proceed button invariant** (`7387fb4`)
- [x] **fix(cli): use local bin/cli.mjs for memory:upgrade/export/uninstall in self-repo package.json [skip ci]** (`86d8f52`)
- [x] **feat(backlog): enforce mandatory /plan ticket creation and atomic splitting (FEAT-122) [skip ci]** (`a546499`)
- [x] **feat(docs): add canonical docs/design/DESIGN.md and cross-pillar design harvester to FEAT-121 [skip ci]** (`c12d723`)
- [x] **feat(docs): unify `FEAT-121` canonical living docs hierarchy and deep harvester + roll out across all 5 repositories** (`eea0dde`)
- [x] **test(user-profile): upstream `BUG-737` dark-mode & `BUG-738` mobile Yoga refresh UI regression tests** (`6743d31`)
- [x] **feat(bricks): extract `user-profile` Hexagonal Brick with 4-provider OAuth and Token/Slot UI (`FEAT-120`)** (`e5aa0c2`)
- [x] **feat(skills): implement executable `/context`, `/clear`, `/effort`, `/credits`, and `/usage` skills and CLI inspectors (`FEAT-120`)** (`bd13565`)
- [x] **feat(memory): enforce Always-On Credit & Token Optimization Footer Tip on every response** (`23bc2b6`)
- [x] **feat(memory): implement Stop-the-Credit-Bleed controls (`/plan` gate, `/effort`, `/clear`, overage hard-stop) (`FEAT-119`)** (`cc5f372`)
- [x] **feat(memory): implement native `model_decision` progressive disclosure and `< 50-line` root `AGENTS.md` (`FEAT-118`)** (`b25e2d6`)
- [x] **feat(backlog): add clickable In Progress Action Items inspector & assignment modal** (`dd5f758`)
- [x] **feat(frugality): enforce Strict Credit & Token Frugality mandate across `init` and `upgrade`** (`d0ea8fb`)
- [x] **feat(skills): add Mandatory Dual-Test Invariant for bug fixes to `backlog-start` skill** (`473b9f6`)
- [x] **feat(organize): implement `FEAT-117` AI-native repository & root reorganization engine (`lib/repo-organizer.mjs`)** (`d8f933d`)
- [x] **feat(customizations): verify and store pre-authenticated MCP & customization state to prevent redundant access prompts** (`825487f`)
- [x] **feat(planning): add correlated 3-artifact Planning Mode (`task.md`, `implementation_plan.md`, `walkthrough.md`) and `/backlog-plan` skill (`FEAT-116`)** (`511cdad`)
- [x] **feat(qa): implement `FEAT-112` template parity check and `FEAT-111` E2E CLI test suite** (`6e2a697`)
- [x] **feat(rules): enforce strict E2E verification before ticket closure in `AGENTS.md` and `/backlog-start` (`FEAT-115`)** (`b8f5d7f`)
- [x] **feat(hooks): implement `FEAT-114` on-the-fly lifecycle hooks, 10-point baseline checklist & `< 24 KB` rule shard balancer** (`21a8404`)
- [x] **fix(customizations): resolve `BUG-107` by pulling API keys, MCP configs & customizations into `memory-bank/`** (`6673fc2`)
- [x] **feat(backlog): implement `FEAT-113` automatic context attachment & UX/UI `.zip` bundle unpacking (`npm run backlog attach/unpack`)** (`9557d87`)
- [x] **fix(backlog): resolve `BUG-106` `_npx` cache auto-purge, workspace-dominance brain matching, and `127.0.0.1:4199` clipboard bridge** (`04218b1`)

## 2. Test Matrix & Verification Status
- **Test, Parity & Line Budget Audit**: `npm test` (`node scripts/lint-memory.mjs && node --test tests/cli-e2e.test.mjs bricks/user-profile/testing/contract.spec.ts`) — 25/25 memory & rule files (`< 150 lines`, `< 50 lines` `AGENTS.md`), 14/14 template parity pairs, 10/10 canonical living docs, and 15/15 E2E & contract tests passing (`0` violations).
- **Cross-Cluster Upgrade Rollout**: Verified `10/10` Mandatory Baseline Ingestion Checklist and `10/10` Canonical Living Docs (`0` broken links) across `antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, and `wiro`.
- **Package Whitelist Audit**: `npm pack --dry-run` — excludes `memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`, and `.github/`.

## 3. Active Development & Documentation
- **Living Documentation Hub**: Indexed in [`docs/INDEX.md`](../docs/INDEX.md) across `docs/{architecture,design,quality,operations}/`.
- **Active Development Board**: Operational tickets and feature backlogs are managed in [`docs/backlog.json`](../docs/backlog.json) and [`docs/BACKLOG.md`](../docs/BACKLOG.md) (`22/22` `DONE`, `0` pending).
