# antigravity-memory-bank — Active Context & Sprint State

## 1. Current Phase & Sprint Objective
- **Last Synchronized Commit**: `9557d87` — "fix(backlog): auto-render Review Pane artifacts in lifecycle hooks and add live /api/backlog auto-sync" (2026-10-18)
- **Current Phase**: v1.4 Release Hardening & Dogfooding.
- **Sprint Goal**: Dogfood the Three-Tier Memory Bank and Decoupled Zero-Token Backlog Engine directly inside `antigravity-memory-bank` while keeping upstream templates 100% generic.

## 2. Recent Technical Decisions & Accomplishments
1. **feat(hooks): implement FEAT-114 on-the-fly lifecycle hooks (`.agents/hooks.json` on `SessionStart`, `PostToolUse`, `Stop`), 10-Point Mandatory Baseline Ingestion Checklist (`lib/ingestion-checklist.mjs`), and automatic `< 24 KB` rule shard balancer**
2. **fix(customizations): resolve BUG-107 by auto-scraping and syncing API keys (`.env*`, `eas.json`, `.p8`, host tokens), MCP server configs (`~/.gemini/config/mcp_config.json`), and Antigravity customizations (`.agents/rules/*`, `.agents/skills/*`, hooks) into `memory-bank/integrationsAndCustomizations.md` on `init`/`upgrade`/`sync`**
3. **feat(backlog): implement FEAT-113 automatic context file & UX/UI `.zip` bundle attachment and unpacking (`npm run backlog attach/unpack`, `backlog.html` `📎` upload + `/api/attach` bridge, and Phase 1 auto-unpacking in `/backlog-start`)**
4. **fix(backlog): resolve BUG-106 stale `_npx` cache, workspace-dominance brain matching (`findTargetBrainDirs`), server-side card pre-rendering, and 4-layer Kickoff Prompt clipboard + `127.0.0.1:4199` native `pbcopy` bridge**
5. **feat(isolation): implement dogfood isolation architecture (`package.json` `"files"` whitelist, `isSelfRepo` guard in `bin/cli.mjs`, and `.gitignore` ephemeral HTML policy)**
6. **fix(backlog): make backlog engine, review artifacts, and skills fully generic upstream (00ba072)**

## 3. Operational Context & Active Backlog
- **Observer Status**: The Memory Bank acts strictly as a passive context listener and baseline reflector. Active ticket management and development execution are conducted in `docs/backlog.json` and `docs/BACKLOG.md`.
- **Current Focus**: Maintain parity between `scripts/backlog.mjs` and `templates/scripts/backlog.mjs`, and validate `init`/`upgrade` flows across colocated repositories.
