# antigravity-memory-bank — Active Context & Sprint State

## 1. Current Phase & Sprint Objective
- **Last Synchronized Commit**: `cebb8d5` — "feat(rules): enforce strict E2E verification before ticket closure in AGENTS.md and /backlog-start (FEAT-115)" (2026-10-18)
- **Current Phase**: v1.4 Release Hardening & Dogfooding.
- **Sprint Goal**: Dogfood the Three-Tier Memory Bank and Decoupled Zero-Token Backlog Engine directly inside `antigravity-memory-bank` while keeping upstream templates 100% generic.

## 2. Recent Technical Decisions & Accomplishments
1. **feat(rules): implement FEAT-115 (upstreamed from SnapCal `0f346ae`) enforcing Strict End-to-End Verification Before Closure in `AGENTS.md`, `templates/AGENTS.md.tpl`, `skills/backlog-start/SKILL.md` (Rule 4), `bin/cli.mjs`, and `lib/ingestion-checklist.mjs`**
2. **feat(hooks): implement FEAT-114 on-the-fly lifecycle hooks (`.agents/hooks.json` on `SessionStart`, `PostToolUse`, `Stop`), 10-Point Mandatory Baseline Ingestion Checklist (`lib/ingestion-checklist.mjs`), and automatic `< 24 KB` rule shard balancer**
3. **fix(customizations): resolve BUG-107 by auto-scraping and syncing API keys (`.env*`, `eas.json`, `.p8`, host tokens), MCP server configs (`~/.gemini/config/mcp_config.json`), and Antigravity customizations (`.agents/rules/*`, `.agents/skills/*`, hooks) into `memory-bank/integrationsAndCustomizations.md` on `init`/`upgrade`/`sync`**
4. **feat(backlog): implement FEAT-113 automatic context file & UX/UI `.zip` bundle attachment and unpacking (`npm run backlog attach/unpack`, `backlog.html` `📎` upload + `/api/attach` bridge, and Phase 1 auto-unpacking in `/backlog-start`)**
5. **fix(backlog): resolve BUG-106 stale `_npx` cache, workspace-dominance brain matching (`findTargetBrainDirs`), server-side card pre-rendering, and 4-layer Kickoff Prompt clipboard + `127.0.0.1:4199` native `pbcopy` bridge**
6. **feat(isolation): implement dogfood isolation architecture (`package.json` `"files"` whitelist, `isSelfRepo` guard in `bin/cli.mjs`, and `.gitignore` ephemeral HTML policy)**

## 3. Operational Context & Active Backlog
- **Observer Status**: The Memory Bank acts strictly as a passive context listener and baseline reflector. Active ticket management and development execution are conducted in `docs/backlog.json` and `docs/BACKLOG.md`.
- **Current Focus**: Maintain parity between `scripts/backlog.mjs` and `templates/scripts/backlog.mjs`, and validate `init`/`upgrade` flows across colocated repositories.
