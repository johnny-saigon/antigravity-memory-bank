<!-- antigravity-doc-sync -->
# 🐛 antigravity-memory-bank — Bug Fix & Root-Cause Analysis Records (`docs/quality/BUG_FIX_RECORDS.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Test Suites**: [`docs/quality/TEST_PLAN_AND_SUITES.md`](TEST_PLAN_AND_SUITES.md)

## 1. Structured Bug Resolution & Dual-Test Log (`BUG-*` & `fix:` Commits)

<!-- ag-section:bug-records:start -->
| Bug / Commit ID | Title & Root-Cause Summary | Status | Target Components |
| :--- | :--- | :--- | :--- |
| **`BUG-101`** | Preserve Existing Curated Notes Non-Destructively in sync-memory-context.mjs — Trickled up from downstream commit sync: sync-memory-context.mjs previously overwrote manually curated accomplishments in activeContext.md a | DONE | `scripts/sync-memory-context.mjs` |
| **`BUG-102`** | Bypass post-commit Hook During Git Rebase, Cherry-Pick & Merge — Trickled up during branch rebasing: post-commit hook triggered sync-memory-context.mjs mid-rebase, dirtying the working tree and interruptin | DONE | `templates/git/hooks/post-commit.tpl` |
| **`BUG-103`** | Fix Active Brain Directory Discovery & Always Render docs/backlog.html — Trickled up when backlog.html was not created in the active session after npm run memory:upgrade: findActiveBrainDir() relied on directory s | DONE | `scripts/backlog.mjs, templates/scripts/backlog.mjs` |
| **`BUG-104`** | Remove Downstream Project Names & Private Host IPs from Upstream Templates — Trickled up after upstreaming the backlog engine from a downstream repo: hardcoded SnapCal references and Vast.ai host IPs leaked into upstr | DONE | `scripts/backlog.mjs, templates/scripts/backlog.mjs, skills/backlog-start/SKILL.md, skills/update-memory/SKILL.md, rules/AGENTS.md, bin/cli.mjs` |
| **`BUG-105`** | Prevent MILESTONE-* Items from Being Re-Imported as Duplicate Feature Tasks — Discovered while dogfooding upgrade inside antigravity-memory-bank: checklistItemRegex in lib/backlog-adapter.mjs matched - [x] **MILESTONE- | DONE | `lib/backlog-adapter.mjs` |
| **`BUG-106`** | Fix Stale _npx Cache, Workspace-Dominance Brain Matching & Sandboxed Kickoff Prompt Clipboard/Bridge — Resolved 3 root causes preventing 100% reliable backlog.html generation on upgrade/init and blocking Kickoff Prompt clipboard copy in sandbo | DONE | `scripts/backlog.mjs, templates/scripts/backlog.mjs, bin/cli.mjs` |
| **`BUG-107`** | Pull API Keys, Env Contracts, MCP Server Configs & Customizations into Memory Bank on Init/Upgrade/Sync — API keys (.env*, eas.json, credentials/*.p8, host token files), MCP server configs (~/.gemini/config/mcp_config.json, .mcp.json), and Antigr | DONE | `lib/customizations-scraper.mjs, bin/cli.mjs, scripts/sync-memory-context.mjs, templates/memory-bank/integrationsAndCustomizations.md.tpl, templates/AGENTS.md.tpl, skills/start/SKILL.md` |
| **`COMMIT-86d8f52`** | fix(cli): use local bin/cli.mjs for memory:upgrade/export/uninstall in self-repo package.json [skip ci] — Git fix commit `86d8f52` | DONE | `git history` |
| **`COMMIT-04218b1`** | fix(cli): untrack docs/backlog.html from git index during commit [skip ci] — Git fix commit `04218b1` | DONE | `git history` |
| **`COMMIT-611658d`** | fix(customizations): ensure <24KB rule shard balance and pre-auth mandate across all repos [skip ci] — Git fix commit `611658d` | DONE | `git history` |
| **`COMMIT-9557d87`** | fix(backlog): auto-render Review Pane artifacts in lifecycle hooks and add live /api/backlog auto-sync — Git fix commit `9557d87` | DONE | `git history` |
| **`COMMIT-6673fc2`** | fix(customizations): resolve BUG-107 by pulling API keys, MCP configs & customizations into memory-bank — Git fix commit `6673fc2` | DONE | `git history` |
| **`COMMIT-5c62ad9`** | fix(backlog): enforce strict 1-to-1 workspace dominance and home-relative path isolation in findTargetBrainDirs — Git fix commit `5c62ad9` | DONE | `git history` |
| **`COMMIT-3796852`** | fix(backlog): guard brain directory fallback against cross-workspace pollution — Git fix commit `3796852` | DONE | `git history` |
| **`COMMIT-f8339bf`** | fix(backlog): resolve BUG-106 stale _npx cache, workspace-dominance brain matching, and sandboxed Kickoff Prompt clipboard bridge — Git fix commit `f8339bf` | DONE | `git history` |
| **`COMMIT-00ba072`** | fix(backlog): make backlog engine, review artifacts, and skills fully generic upstream — Git fix commit `00ba072` | DONE | `git history` |
| **`COMMIT-4adb32c`** | fix(backlog): fix findActiveBrainDir scoring/mtime and write docs/backlog.html alongside brain/backlog.html — Git fix commit `4adb32c` | DONE | `git history` |
<!-- ag-section:bug-records:end -->

---

## 2. Consolidated Historical Bug Records

<!-- ag-section:legacy-bugs:start -->
<!-- merged-source:docs/BUG_FIX_RECORDS.md:start -->
### Consolidated from `docs/BUG_FIX_RECORDS.md` (Archived at [`docs/archive/BUG_FIX_RECORDS.md`](../archive/BUG_FIX_RECORDS.md))

# antigravity-memory-bank — Bug Fix & Upstream Trickle-Up Records

This document records root-cause analyses and resolutions for bugs discovered while installing, upgrading, and dogfooding `antigravity-memory-bank` across downstream projects and this upstream repository. Synchronized with [`docs/backlog.json`](backlog.json).

---

### BUG-101: Preserve Existing Curated Notes Non-Destructively in `sync-memory-context.mjs`
- **Status:** Completed (`DONE`) · **Commit:** `91dcb31`
- **Origin:** Trickled up from downstream project commit synchronization.
- **Component:** `scripts/sync-memory-context.mjs`
- **Root Cause:** Auto-syncing git commits overwrote manually curated notes inside `memory-bank/activeContext.md` and `memory-bank/progress.md`.
- **Resolution:** Updated `sync-memory-context.mjs` to prepend new `feat:` / `fix:` commits non-destructively above existing bullets while deduplicating by short commit hash.

---

### BUG-102: Bypass `post-commit` Hook During Git Rebase, Cherry-Pick & Merge
- **Status:** Completed (`DONE`) · **Commit:** `35cebe7`
- **Origin:** Trickled up during interactive git rebase across colocated repositories.
- **Component:** `templates/git/hooks/post-commit.tpl`
- **Root Cause:** `.git/hooks/post-commit` executed `sync-memory-context.mjs` during `git rebase`, modifying `memory-bank/*.md` mid-rebase and halting rebase progression.
- **Resolution:** Added guards in `post-commit.tpl` checking `.git/rebase-merge`, `.git/rebase-apply`, `.git/MERGE_HEAD`, and `.git/CHERRY_PICK_HEAD` to exit early during history rewrites.

---

### BUG-103: Fix Active Brain Directory Discovery & Always Render `docs/backlog.html`
- **Status:** Completed (`DONE`) · **Commit:** `4adb32c`
- **Origin:** Trickled up when `backlog.html` did not appear after running `npm run memory:upgrade` in downstream projects.
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`
- **Root Cause:** `findActiveBrainDir()` checked directory `stat.mtimeMs` (which does not update on macOS/Linux when `.system_generated/logs/transcript.jsonl` is appended to) and skipped brain directories that did not already contain `backlog.html` or `task.md`.
- **Resolution:** Updated `findActiveBrainDir()` to score brain directories by workspace path matches inside `transcript.jsonl`, use `transcript.jsonl` `mtimeMs` for recency, and always write `docs/backlog.html` in the workspace alongside `<brainDir>/backlog.html`.

---

### BUG-104: Remove Downstream Project Names & Private Host IPs from Upstream Templates
- **Status:** Completed (`DONE`) · **Commit:** `00ba072`
- **Origin:** Trickled up after upstreaming the backlog engine from a downstream project.
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-start/SKILL.md`, `skills/update-memory/SKILL.md`, `rules/AGENTS.md`, `bin/cli.mjs`
- **Root Cause:** Hardcoded `SnapCal` titles, example component paths, and Vast.ai host IPs remained inside upstream templates and skills.
- **Resolution:** Replaced hardcoded project names with dynamic resolution from `docs/backlog.json` / `path.basename(ROOT)`, removed private host IPs from `bin/cli.mjs` and skills, and added upstream genericness rules to `rules/AGENTS.md`.

---

### BUG-105: Prevent `MILESTONE-*` Items from Being Re-Imported as Duplicate Feature Tasks
- **Status:** Completed (`DONE`) · **Commit:** `e312abc`
- **Origin:** Discovered while dogfooding `upgrade` inside `antigravity-memory-bank`.
- **Component:** `lib/backlog-adapter.mjs`
- **Root Cause:** `checklistItemRegex` in `lib/backlog-adapter.mjs` matched `- [x] **MILESTONE-1**: ...` in `docs/BACKLOG.md` and imported it as a feature task in addition to a milestone.
- **Resolution:** Excluded `MILESTONE-*` IDs and `existingMilestoneIds` from `sectionRegex` and `checklistItemRegex` task loops so repeated upgrades are 100% idempotent.

---

### BUG-106: Fix Stale `_npx` Cache, Workspace-Dominance Brain Matching & Sandboxed Kickoff Prompt Clipboard/Bridge
- **Status:** Completed (`DONE`)
- **Origin:** Trickled up when testing `upgrade`/`init` across `Binaryday`, `RemoveBackGround`, and `SnapCal`, and testing the **🤖 Kickoff Prompt** button in the Review pane.
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `bin/cli.mjs`
- **Root Causes:**
  1. **Stale `~/.npm/_npx` Cache:** `npx github:johnny-saigon/antigravity-memory-bank upgrade` cached git tarballs in `~/.npm/_npx/<hash>/node_modules/antigravity-memory-bank` and re-ran older cached builds instead of pulling new commits from GitHub.
  2. **Cross-Project Brain Collisions:** `findActiveBrainDir()` awarded a flat `+200` score if `transcript.jsonl` mentioned `REPO_ROOT`, causing multi-project conversations that listed sibling directories (`ls`) to tie and steal `backlog.html` writes from `Binaryday` and `RemoveBackGround`.
  3. **Kickoff Prompt Quote & Sandbox Failure:** `onclick="copyPrompt('${task.id}', '${task.title.replace(/'/g, "\\'")}')" ` broke with a `SyntaxError` whenever `task.title` contained double quotes (`"`), and `navigator.clipboard.writeText()` failed inside Antigravity's sandboxed Review pane iframe (`NotAllowedError`) with no synchronous fallback.
- **Resolution:**
  1. Added automatic `_npx` self-cleanup on exit in `bin/cli.mjs` and cache-busting `memory:upgrade` / `memory:export` / `memory:uninstall` scripts in `package.json`.
  2. Replaced `findActiveBrainDir()` with workspace-dominance scoring (`findTargetBrainDirs()`) comparing path mention counts against sibling repositories, verified at 100% accuracy across all 5 colocated projects.
  3. Pre-rendered Kanban cards server-side with quote-safe `onclick="kickoffTask('${safeIdAttr}')"`, implemented 4-layer synchronous `document.execCommand('copy')` + auto-selected top `#kickoffBanner` input + `window.parent.postMessage`, and added a zero-dependency local native HTTP bridge (`127.0.0.1:4199`) that executes native OS `pbcopy` and persists task state to `docs/backlog.json`.

---

### BUG-107: Pull API Keys, Env Contracts, MCP Server Configs & Customizations into Memory Bank on Init/Upgrade/Sync
- **Status:** Completed (`DONE`)
- **Origin:** Discovered across installed Memory Bank instances (`RemoveBackGround`, `Binaryday`, `SnapCal`, `AntigravityRemote`, `antigravity-memory-bank`) where `.env*` keys, `eas.json` credentials, MCP servers, and `.agents/` skills/rules/hooks were missing from `memory-bank/*.md`.
- **Components:** `lib/customizations-scraper.mjs`, `bin/cli.mjs`, `scripts/sync-memory-context.mjs`, `templates/memory-bank/integrationsAndCustomizations.md.tpl`, `templates/AGENTS.md.tpl`, `skills/start/SKILL.md`
- **Root Causes:**
  1. `lib/context-scraper.mjs` only scraped `git log`, `docs/*.md`, and `transcript.jsonl`, ignoring `.env*`, `eas.json`, `credentials/*.p8`, `~/.gemini/config/mcp_config.json`, `~/.gemini/antigravity/mcp/*`, `~/.gemini/config/hooks.json`, `.agents/rules/*.md`, and `.agents/skills/*/SKILL.md`.
  2. `upgradeMemory()` in `bin/cli.mjs` skipped `memory-bank/` completely on existing installations and never synchronized API key/MCP/customization inventories.
  3. `parseCliArgs()` in `bin/cli.mjs` ignored positional target directory arguments (`node bin/cli.mjs upgrade /path/to/repo`).
- **Resolution:**
  1. Created `lib/customizations-scraper.mjs` and embedded standalone sync inside `scripts/sync-memory-context.mjs` to auto-generate and refresh `memory-bank/integrationsAndCustomizations.md` (`< 125 lines`), safely masking raw secret literals (`sk_live_***`, `re_***`) while indexing all variable names, file paths, non-secret IDs, MCP server tool counts, rules, skills, and hooks.
  2. Wired `syncCustomizationsToMemoryBank` into `init`, `upgrade`, and `sync` in `bin/cli.mjs` and linked `memory-bank/integrationsAndCustomizations.md` in `AGENTS.md` and `.agents/skills/start/SKILL.md`.
  3. Updated `parseCliArgs()` in `bin/cli.mjs` to accept positional directory arguments and `--dir <path>`.
<!-- merged-source:docs/BUG_FIX_RECORDS.md:end -->
<!-- ag-section:legacy-bugs:end -->
