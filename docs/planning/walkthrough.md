# Walkthrough — FEAT-148: Native Antigravity Memory Bank MCP App Plugin (`SEP-1865`)

## What Was Built & Shipped

### 1. Zero-Runtime-Dependency MCP App Server (`FEAT-148-ACT-1`)
- **Plugin Manifest & Entrypoints**: [plugin.json](file:///Users/jbb/Documents/antigravity-memory-bank/plugin.json) (`v2.0.0`, `3` `suggestedPrompts`), [mcp_config.json](file:///Users/jbb/Documents/antigravity-memory-bank/mcp_config.json) (`${PLUGIN_ROOT}/mcp/dist/server.mjs`), and [logo.svg](file:///Users/jbb/Documents/antigravity-memory-bank/assets/logo.svg).
- **Zero Model-Context Bloat (`SEP-1865`)**: [server.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/server.mjs) exposes strictly **2 model-visible entrypoint tools**:
  - `memory_bank_dashboard` (`aux_pane: "Memory Bank"` + `global: "Memory Bank Fleet"`)
  - `memory_bank_inline_status` (compact inline chat status widget)
  - All **14 backend UI tools** carry `_meta: { ui: { visibility: ["app"] } }` so they add `0` tokens to the model's tool schema.
- **Bundler**: [build-mcp-plugin.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/build-mcp-plugin.mjs) compiles standalone `mcp/dist/server.mjs` (`1380.5 KB`, runs on stock Node without `node_modules/`) and single-file CSP-safe `mcp/dist/app.html` (`705.3 KB < 10 MiB`, zero external `<script>`/`<link>` tags).

### 2. Zero-Permission `app.sendMessage()` Kanban & 5-Tab Control Plane (`FEAT-148-ACT-2` & `ACT-3`)
- **UI Sources**: [app.ts](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/ui/app.ts), [tabs.ts](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/ui/tabs.ts), [types.ts](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/ui/types.ts), [styles.css](file:///Users/jbb/Documents/antigravity-memory-bank/mcp/src/ui/styles.css).
- **Zero macOS Accessibility Permissions Required**: `PLAN` (`TO DO → READY`) and `CODE` (`TO DO/READY → IN PROGRESS`) transitions execute directly in the Antigravity Prompt Window via native `app.sendMessage()` (with an optional `🧵 Run in New Thread` toggle passing `_meta["com.google.antigravity/message"].target = "new"`), while strictly enforcing `BUG-115` (`IN PROGRESS`/`DONE` must return to `TO DO` before re-planning/re-coding; locked `READY` tickets expose `🔓 Unlock`).
- **5 Native Tabs**:
  1. **Kanban**: Live sprint board, `📎 Pin to Prompt` (`app.updateModelContext()`), Multi-Select Orchestrator modal, Voice Capture (`app_voice_transcribe`), drag-and-drop sorting, and `BUG-115` guardrails.
  2. **Memory & Rules**: `AGENTS.md` (`< 50`) & `memory-bank/*.md` (`< 150`) budget bars, `.agents/rules/*.md` trigger health, native file-open via `com.google.antigravity/toggle-aux-pane`, and 1-click Lint / Sync / Organize / Export.
  3. **Credits & Usage**: Live `compaction_watermark.json` delta gauge, Dual Quota-Pool ROI matrix, and 1-click `/start`.
  4. **Fleet & Worktrees**: Discovers all Main & Linked Worktrees across the machine with Upgrade One / Upgrade All and Trickle-Up scan/accept.
  5. **Bricks & Docs**: `bricks/user-profile` installer/upgrade/doctor + 10 Canonical Living Docs viewer.

### 3. CLI Installer, Lint Audit & Automated Verification (`FEAT-148-ACT-4`)
- **CLI**: Added `node bin/cli.mjs plugin install | sync | status | uninstall` in [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs), plus automatic global plugin sync during `fleet upgrade`.
- **Linter**: Added MCP bundle & CSP `default-src 'none'` verification in [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs).
- **Tests**: Added `3n. FEAT-148` in [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) exercising isolated CLI install, spawning the installed standalone `server.mjs` from `os.tmpdir()` (zero `node_modules/`), verifying `tools/list` (`2` model + `14` app-only), `resources/read` (`text/html;profile=mcp-app`), `app_add_ticket_isolated`, `app_plan_tickets`, `app_unlock_plan`, `app_kickoff_tickets`, `BUG-115` rejection on `IN PROGRESS`, `app_run_memory_audit`, and `app_brick_manage`.

## Verification Results
- `npm run build:mcp`: **Passed** (`mcp/dist/server.mjs` 1380.5 KB, `mcp/dist/app.html` 705.3 KB).
- `npm test`: **26/26 passed (`0` failures, `16/16` template parity pairs, `0` lint violations)**.
- Live Antigravity discovery (`GetAllPlugins` + `RefreshMcpServers`): **Verified** — plugin `memory-bank` (`v2.0.0`, `10` skills, MCP server `memory-bank_memory-bank`) installed at `/Users/jbb/.gemini/config/plugins/memory-bank` and refreshed in the running Language Server.
