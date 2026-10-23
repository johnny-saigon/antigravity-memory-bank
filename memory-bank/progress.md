# antigravity-memory-bank — Progress Tracker & Acceptance Matrix

## 1. High-Level Milestone Tracking
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
- **Test, Parity & Line Budget Audit**: `npm test` (`node scripts/lint-memory.mjs && node --test tests/cli-e2e.test.mjs bricks/user-profile/testing/contract.spec.ts`) — 25/25 memory & rule files (`< 150 lines`, `< 50 lines` `AGENTS.md`), 14/14 template parity pairs, 9/9 canonical living docs, and 15/15 E2E & contract tests passing (`0` violations).
- **Cross-Cluster Upgrade Rollout**: Verified `10/10` Mandatory Baseline Ingestion Checklist and `9/9` Canonical Living Docs (`0` broken links) across `antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, and `AntigravityRemote`.
- **Package Whitelist Audit**: `npm pack --dry-run` — excludes `memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`, and `.github/`.

## 3. Active Development & Documentation
- **Living Documentation Hub**: Indexed in [`docs/INDEX.md`](../docs/INDEX.md) across `docs/{architecture,design,quality,operations}/`.
- **Active Development Board**: Operational tickets and feature backlogs are managed in [`docs/backlog.json`](../docs/backlog.json) and [`docs/BACKLOG.md`](../docs/BACKLOG.md) (`22/22` `DONE`, `0` pending).
