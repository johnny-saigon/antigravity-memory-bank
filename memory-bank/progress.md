# antigravity-memory-bank — Progress Tracker & Acceptance Matrix

## 1. High-Level Milestone Tracking
- [x] **fix(backlog): auto-render Review Pane artifacts in lifecycle hooks and add live /api/backlog auto-sync** (`9557d87`)
- [x] **feat(hooks): implement FEAT-114 on-the-fly lifecycle hooks, 10-point baseline checklist & <24KB rule shard balancer** (`21a8404`)
- [x] **feat(hooks): implement FEAT-114 on-the-fly lifecycle hooks, 10-point baseline checklist & <24KB rule shard balancer** (`3d46aaf`)
- [x] **fix(customizations): resolve BUG-107 by pulling API keys, MCP configs & customizations into memory-bank** (`6673fc2`)
- [x] Codify Three-Tier Memory Hierarchy and `< 150 lines` token budget linter (`scripts/lint-memory.mjs`)
- [x] Automatically scrape prior conversation transcripts, docs, and git history during initialization (`lib/context-scraper.mjs`)
- [x] Add post-commit hook, CI workflows, and incremental context synchronizer (`scripts/sync-memory-context.mjs`)
- [x] Add decoupled zero-token backlog engine (`scripts/backlog.mjs`), `/backlog-start` skill, and Review pane Kanban (`backlog.html`)
- [x] Adapt existing boards, docs, and bug records into `docs/backlog.json` during `init` and `upgrade` (`lib/backlog-adapter.mjs`)
- [x] Dogfood Three-Tier Memory Bank and Decoupled Backlog inside `antigravity-memory-bank` with strict upstream package isolation (`package.json` `"files"`, `isSelfRepo`, `.gitignore`)
- [x] Resolve `BUG-106`: `_npx` cache auto-purge, workspace-dominance brain matching across 5 colocated repos, and sandboxed Kickoff Prompt 4-layer clipboard + local `127.0.0.1:4199` `pbcopy` bridge
- [x] Implement `FEAT-113`: Automatic context attachment & UX/UI `.zip` bundle unpacking (`npm run backlog attach/unpack`, Review pane `📎` file upload, `/api/attach` bridge v1.2.0, and `/backlog-start` Phase 1 ingestion)
- [x] Resolve `BUG-107`: Auto-scrape and synchronize API keys (`.env*`, `eas.json`, `.p8`), MCP server configs (`~/.gemini/config/mcp_config.json`), and Antigravity customizations (`.agents/rules/*`, `.agents/skills/*`, hooks) into `memory-bank/integrationsAndCustomizations.md`
- [x] Implement `FEAT-114`: On-the-fly lifecycle hooks (`.agents/hooks.json` for `SessionStart`, `PostToolUse`, `Stop`), 10-Point Mandatory Baseline Ingestion Checklist (`lib/ingestion-checklist.mjs`), and `< 24 KB` rule shard balancer
- [x] Implement `FEAT-115`: Upstream Strict Live End-to-End Verification Before Ticket Closure rule (`AGENTS.md`, `templates/AGENTS.md.tpl`, `skills/backlog-start/SKILL.md` Rule 4, `bin/cli.mjs` upgrade propagation, and Check #6 verification) across all 5 repositories

## 2. Test Matrix & Verification Status
- **Test & Line Budget Audit**: `npm test` (`node scripts/lint-memory.mjs`) — 14/14 files passing (`< 150 lines`), 10/10 Mandatory Baseline Ingestion Checklist passing across all 5 repositories.
- **Package Whitelist Audit**: `npm pack --dry-run` — excludes `memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`, and `.github/`.
- **Backlog Renderer & Live Bridge**: `npm run backlog:render` + `http://127.0.0.1:4199/api/health` (v1.2.0) — synchronizes `docs/BACKLOG.md`, `docs/backlog.html`, and exact project `<brainDir>/backlog.html` with native OS clipboard copy and `.zip` attachment unpacking.

## 3. Active Development & Documentation
- **Active Development Board**: Operational tickets and feature backlogs are managed in `docs/backlog.json` and `docs/BACKLOG.md`.
- **Backlog Workflow Guide**: Documented in `docs/BACKLOG_GUIDE.md`.
