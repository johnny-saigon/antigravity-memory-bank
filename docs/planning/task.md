# Task Checklist — FEAT-148: Native Antigravity Memory Bank MCP App Plugin (`SEP-1865`)

- [x] **[FEAT-148-ACT-1]** Package Antigravity Plugin Manifest (`plugin.json`, `mcp_config.json`, `assets/logo.svg`) & Zero-Runtime-Dep MCP Server (`mcp/src/server.mjs` -> `mcp/dist/server.mjs`, `esbuild`)
  - [x] Register strictly **2 model-visible entrypoint tools** (`memory_bank_dashboard` with `aux_pane` + `global` entrypoints, `memory_bank_inline_status`)
  - [x] Register **14 app-only tools** with `_meta: { ui: { visibility: ["app"] } }` (`0` model prompt bloat)
  - [x] Enforce `BUG-115` guards (`IN PROGRESS`/`DONE` must return to `TO DO` before PLAN/CODE; `planningLocked` unlock via `app_unlock_plan`)
- [x] **[FEAT-148-ACT-2]** Build Single-File CSP-Safe SEP-1865 Kanban UI (`mcp/src/ui/app.ts` -> `mcp/dist/app.html`) with Zero-Permission `app.sendMessage()` Dispatch
  - [x] Zero-permission `PLAN` & `CODE` prompt execution via `app.sendMessage()` + `🧵 Run in New Thread` toggle (`target: "new"`)
  - [x] `📎 Pin to Prompt` via `app.updateModelContext()`
  - [x] Multi-select Orchestrator modal, Voice Capture (`app_voice_transcribe`), `🔓 Unlock`, drag-and-drop reordering, and Antigravity theme/token syncing (`applyDocumentTheme`, `applyHostStyleVariables`)
- [x] **[FEAT-148-ACT-3]** Ship Full 5-Tab Control Plane (`Kanban`, `Memory & Rules`, `Credits & Usage`, `Fleet & Worktrees`, `Bricks & Docs`)
  - [x] Memory & Rules tab with `< 50`/`< 150` line-budget gauges, `.agents/rules/*.md` trigger inspector, `com.google.antigravity/toggle-aux-pane` file links, and Lint/Sync/Organize/Export controls
  - [x] Credits & Usage tab with live `compaction_watermark.json` delta gauge, Dual Quota-Pool ROI advisor, and 1-click `/start`
  - [x] Fleet & Worktrees tab (`17+` Main + Linked Worktrees, Upgrade One/All, Trickle-Up scan/accept)
  - [x] Bricks & Docs tab (`bricks/user-profile` installer/doctor + 10 Canonical Living Docs)
- [x] **[FEAT-148-ACT-4]** Add `node bin/cli.mjs plugin install|sync|status|uninstall`, `lint-memory.mjs` MCP bundle/CSP audit, E2E test `3n. FEAT-148`, live plugin installation, and fleet upgrade
  - [x] `npm run build:mcp` (`server.mjs` 1380.5 KB, `app.html` 705.3 KB < 10 MiB, zero external URLs)
  - [x] `npm test` — **26/26 tests passed (`0` failures, `16/16` template parity pairs, `0` lint violations)**
  - [x] Live install verified via `GetAllPlugins` & `RefreshMcpServers` (`memory-bank_memory-bank`)
