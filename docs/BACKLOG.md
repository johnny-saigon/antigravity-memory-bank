# Antigravity Memory Bank — Development & Backlog Board

This board tracks active development tickets, feature backlogs, architecture initiatives, and sprint milestones for Antigravity Memory Bank. For historical bug fixes and root-cause analyses, refer to [`docs/BUG_FIX_RECORDS.md`](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BUG_FIX_RECORDS.md).

---

## 1. Active Feature Backlog

### FEAT-101: Three-Tier Memory Bank Brick, 2-Phase Continuous Cycle & <150-Line Linter
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `templates/memory-bank/`, `skills/start/SKILL.md`, `skills/update-memory/SKILL.md`, `scripts/lint-memory.mjs`, `plugin.json`
- **Description:** Core Three-Tier Memory Hierarchy (Tier 1 Global, Tier 2 Cluster Invariants, Tier 3 Domain Memory Bank) extracted from production multi-project usage with <150-line budget enforcement and 2-phase continuous session cycling.
- **Technical Specification:**
  Provide 6 modular memory templates, /start and /update-memory skills, and automated line-budget linter.
- **Acceptance Criteria:**
  - [x] Enforces <150 lines across all memory-bank/*.md files.
  - [x] 2-Phase /update-memory closes current milestone and auto-starts next session banner.

---

### FEAT-102: On-the-Fly CLI Initializer & Universal One-Line Shell Installer
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `bin/cli.mjs`, `install.sh`
- **Description:** Zero-restart CLI initializer (npx github:johnny-saigon/antigravity-memory-bank init) and curl | bash installer that auto-detects stack, git remotes, and ports.
- **Technical Specification:**
  Support interactive and headless (-y --commit) initialization and plugin mode (--as-plugin).
- **Acceptance Criteria:**
  - [x] Activates skills and rules in an open Antigravity IDE window with zero restart.
  - [x] Auto-detects frontend, backend, database, and port from package.json and .env.

---

### FEAT-103: Consolidated Context Export & Zero-Loss Clean Deinstallation
- **Status:** Completed (`DONE`)
- **Priority:** Medium
- **Components:** `bin/cli.mjs`
- **Description:** Export project memory to a single consolidated markdown file and tar.gz archive, and run automatic backup before uninstalling Memory Bank files.
- **Technical Specification:**
  Implement export and uninstall commands in bin/cli.mjs with ./memory-backups/ archival.
- **Acceptance Criteria:**
  - [x] Generates consolidated markdown and .tar.gz archive in ./memory-backups/.
  - [x] Cleanly removes memory-bank artifacts while preserving custom skills/rules.

---

### FEAT-104: Non-Destructive In-Place Upgrade Workflow for Existing Installations
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `bin/cli.mjs`
- **Description:** Trickled up from upgrading BinaryDay, RemoveBackGround, and SnapCal: upgrade skills, linters, and hooks in-place while preserving 100% of custom memory-bank/*.md domain documents.
- **Technical Specification:**
  Implement upgrade command in bin/cli.mjs that detects existing project title and health probes without overwriting memory-bank/*.md.
- **Acceptance Criteria:**
  - [x] 100% preservation of existing memory-bank/*.md files.
  - [x] Upgrades AGENTS.md, skills, and package.json lifecycle scripts.

---

### FEAT-105: Automated Historical Context Scraper (Git, Docs & Antigravity Transcripts)
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `lib/context-scraper.mjs`, `bin/cli.mjs`
- **Description:** Trickled up from downstream init runs: automatically scrape git commit history, markdown documentation, and ~/.gemini/antigravity/brain/*/transcript.jsonl logs during init.
- **Technical Specification:**
  Extract recent accomplishments, completed milestones, and pending tasks from git, docs, and brain transcripts to populate initial memory-bank/*.md files.
- **Acceptance Criteria:**
  - [x] Scrapes git commits, docs/*.md, and Antigravity conversation transcripts.
  - [x] Populates activeContext.md and progress.md with real project history on day one.

---

### FEAT-106: Incremental Context Auto-Synchronizer, Git Post-Commit Hook & CI Workflow
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/sync-memory-context.mjs`, `templates/git/hooks/post-commit.tpl`, `templates/github/workflows/memory-bank-sync.yml.tpl`
- **Description:** Keep memory-bank/activeContext.md and progress.md synchronized automatically on every feat:/fix: git commit and main branch push with zero LLM token usage.
- **Technical Specification:**
  Install post-commit git hook, incremental sync script, and GitHub Actions workflow.
- **Acceptance Criteria:**
  - [x] Automatically updates last synchronized commit hash and accomplishments on commit.
  - [x] CI workflow verifies <150-line budget on every push and PR.

---

### FEAT-107: Passive Observer Invariant & Operational Board Separation into docs/
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `templates/AGENTS.md.tpl`, `rules/AGENTS.md`, `skills/update-memory/SKILL.md`
- **Description:** Trickled up from downstream project usage: codify that memory-bank/*.md is strictly a passive observer baseline (<150 lines) while operational boards live in docs/.
- **Technical Specification:**
  Update agent directives and skills to prohibit active ticket management inside memory-bank/*.md.
- **Acceptance Criteria:**
  - [x] Memory Bank stays <150 lines (~1.5k tokens) as a read-only context baseline.
  - [x] Operational tickets and bug logs are separated into docs/.

---

### FEAT-108: Decoupled Zero-Token Backlog Engine, /backlog-start Skill & Review Pane Kanban
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-start/SKILL.md`, `templates/docs/BACKLOG_GUIDE.md`
- **Description:** Eliminate the 15k-35k token cost of chat-based task capture via an offline zero-token backlog store (docs/backlog.json), interactive Kanban board (backlog.html), and frugal /backlog-start execution skill.
- **Technical Specification:**
  Implement CRUD CLI commands, interactive dark-mode HTML Kanban board with live local HTTP save bridge, and 3-phase /backlog-start skill.
- **Acceptance Criteria:**
  - [x] Zero-token offline task capture via npm run backlog or Review pane UI.
  - [x] 1-click /backlog-start <ID> prompt copy and automated sprint closure + work recap.

---

### FEAT-109: Automated Board & Bug Record Adapter During init / upgrade
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `lib/backlog-adapter.mjs`, `bin/cli.mjs`
- **Description:** Trickled up from upgrading downstream projects with pre-existing markdown boards: automatically discover and migrate MIGRATION_BOARD.md, BACKLOG.md, ROADMAP.md, and BUG_FIX_RECORDS.md into docs/backlog.json.
- **Technical Specification:**
  Parse markdown task headers, checklists, and milestones into structured docs/backlog.json entries without duplicates.
- **Acceptance Criteria:**
  - [x] Automatically migrates existing markdown boards and bug records on init/upgrade.
  - [x] Renders synchronized docs/BACKLOG.md and backlog.html Kanban immediately.

---

### FEAT-110: Dogfooding & Strict Upstream Package Isolation Architecture
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `package.json`, `bin/cli.mjs`, `.gitignore`, `README.md`
- **Description:** Dogfood the Three-Tier Memory Bank and Backlog Kanban directly inside antigravity-memory-bank while isolating downstream npx installs via package.json files whitelist and isSelfRepo guards.
- **Technical Specification:**
  Add files whitelist to package.json, detect isSelfRepo in bin/cli.mjs, and git-ignore ephemeral docs/backlog.html.
- **Acceptance Criteria:**
  - [x] npm pack --dry-run includes only the 29 distributable engine files.
  - [x] isSelfRepo prevents self-overwriting or deleting upstream scripts/.

---

### BUG-101: Preserve Existing Curated Notes Non-Destructively in sync-memory-context.mjs
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/sync-memory-context.mjs`
- **Description:** Trickled up from downstream commit sync: sync-memory-context.mjs previously overwrote manually curated accomplishments in activeContext.md and progress.md.
- **Technical Specification:**
  Prepend newly detected git commits above existing bullets and deduplicate by short commit hash.
- **Acceptance Criteria:**
  - [x] Existing manual notes in activeContext.md and progress.md are preserved.
  - [x] Commits are deduplicated by hash.

---

### BUG-102: Bypass post-commit Hook During Git Rebase, Cherry-Pick & Merge
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `templates/git/hooks/post-commit.tpl`
- **Description:** Trickled up during branch rebasing: post-commit hook triggered sync-memory-context.mjs mid-rebase, dirtying the working tree and interrupting git rebase.
- **Technical Specification:**
  Check for rebase-merge, rebase-apply, MERGE_HEAD, and CHERRY_PICK_HEAD in .git/ before executing post-commit memory sync.
- **Acceptance Criteria:**
  - [x] post-commit hook exits cleanly as a no-op during rebase, merge, or cherry-pick.

---

### BUG-103: Fix Active Brain Directory Discovery & Always Render docs/backlog.html
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`
- **Description:** Trickled up when backlog.html was not created in the active session after npm run memory:upgrade: findActiveBrainDir() relied on directory stat.mtimeMs (which does not update when transcript.jsonl is appended) and required backlog.html/task.md to already exist.
- **Technical Specification:**
  Score brain directories by workspace path references inside .system_generated/logs/transcript.jsonl, use transcript.jsonl mtimeMs for recency, and always write docs/backlog.html alongside <brainDir>/backlog.html.
- **Acceptance Criteria:**
  - [x] Accurately targets the active conversation brain directory even in brand-new sessions.
  - [x] Always writes docs/backlog.html in the project workspace.

---

### BUG-104: Remove Downstream Project Names & Private Host IPs from Upstream Templates
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-start/SKILL.md`, `skills/update-memory/SKILL.md`, `rules/AGENTS.md`, `bin/cli.mjs`
- **Description:** Trickled up after upstreaming the backlog engine from a downstream repo: hardcoded SnapCal references and Vast.ai host IPs leaked into upstream templates and skills.
- **Technical Specification:**
  Resolve project title dynamically from docs/backlog.json or path.basename(ROOT) and codify generic upstream template rules in rules/AGENTS.md.
- **Acceptance Criteria:**
  - [x] Zero downstream project names or private host IPs in bin/, skills/, rules/, or templates/.
  - [x] scripts/backlog.mjs and templates/scripts/backlog.mjs remain byte-identical.

---

### BUG-105: Prevent MILESTONE-* Items from Being Re-Imported as Duplicate Feature Tasks
- **Status:** Completed (`DONE`)
- **Priority:** Medium
- **Components:** `lib/backlog-adapter.mjs`
- **Description:** Discovered while dogfooding upgrade inside antigravity-memory-bank: checklistItemRegex in lib/backlog-adapter.mjs matched - [x] **MILESTONE-1** in docs/BACKLOG.md and imported it into tasks.
- **Technical Specification:**
  Filter out MILESTONE-* IDs and existingMilestoneIds in sectionRegex and checklistItemRegex loops in lib/backlog-adapter.mjs.
- **Acceptance Criteria:**
  - [x] Repeated upgrade runs are 100% idempotent (0 duplicate tasks imported from MILESTONE-* bullets).

---

### BUG-106: Fix Stale _npx Cache, Workspace-Dominance Brain Matching & Sandboxed Kickoff Prompt Clipboard/Bridge
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `bin/cli.mjs`
- **Description:** Resolved 3 root causes preventing 100% reliable backlog.html generation on upgrade/init and blocking Kickoff Prompt clipboard copy in sandboxed Review pane iframes: (1) npm cached stale git tarballs in ~/.npm/_npx, (2) flat +200 brain scoring caused multi-project conversations to steal backlog.html writes, and (3) unescaped double quotes in task titles + navigator.clipboard permissions blocked Kickoff Prompt.
- **Technical Specification:**
  Auto-clean _npx cache on exit and in package.json scripts, use workspace-dominance scoring in findTargetBrainDirs(), pre-render cards server-side with quote-safe kickoffTask(id), and implement 4-layer synchronous execCommand('copy') + top auto-selected prompt bar + local native pbcopy bridge on 127.0.0.1:4199.
- **Acceptance Criteria:**
  - [x] 100% accurate docs/backlog.html and <brainDir>/backlog.html generation across all 5 colocated projects on init and upgrade.
  - [x] Kickoff Prompt works reliably on titles with quotes and copies to clipboard inside sandboxed iframes and via native OS pbcopy.

---

### FEAT-113: Automatic Context & UX/UI .zip Bundle Ingestion in /backlog-start & Backlog Engine
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `skills/backlog-start/SKILL.md`, `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `lib/backlog-adapter.mjs`
- **Description:** Automatically detect, copy, and unpack attached files (such as UX/UI .zip exports containing DESIGN.md, tokens.json, HTML/Tailwind screens, and mockups) via CLI, Review pane UI, or inline /backlog-start prompts.
- **Technical Specification:**
  Automatically detect, copy, and unpack attached files (such as UX/UI .zip exports containing DESIGN.md, tokens.json, HTML/Tailwind screens, and mockups) via CLI, Review pane UI, or inline /backlog-start prompts.

---

### BUG-107: Pull API Keys, Env Contracts, MCP Server Configs & Customizations into Memory Bank on Init/Upgrade/Sync
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `lib/customizations-scraper.mjs`, `bin/cli.mjs`, `scripts/sync-memory-context.mjs`, `templates/memory-bank/integrationsAndCustomizations.md.tpl`, `templates/AGENTS.md.tpl`, `skills/start/SKILL.md`
- **Description:** API keys (.env*, eas.json, credentials/*.p8, host token files), MCP server configs (~/.gemini/config/mcp_config.json, .mcp.json), and Antigravity customizations (.agents/rules/*, .agents/skills/*, .agents/workflows/*, ~/.gemini/config/hooks.json, ~/.gemini/config/config.json) were not pulled into memory-bank during init, upgrade, or sync. Additionally, bin/cli.mjs ignored positional directory arguments.
- **Technical Specification:**
  Create lib/customizations-scraper.mjs and embed standalone sync in scripts/sync-memory-context.mjs to generate memory-bank/integrationsAndCustomizations.md (<150 lines, masking raw secret literals while preserving key names, file paths, non-secret IDs, MCP tools, rules, skills, and hooks), wire into init/upgrade/sync in bin/cli.mjs, support positional targetDir, and redeploy across all installed instances.
- **Acceptance Criteria:**
  - [x] Automatically indexes all .env* keys, eas.json credentials, host tokens, MCP servers, rules, skills, and hooks into memory-bank/integrationsAndCustomizations.md.
  - [x] Never commits raw secret literals to Git while giving agents 100% visibility into key names and file paths.
  - [x] bin/cli.mjs supports positional target directory and upgrades all installed repositories cleanly under <150 lines.

---

## 2. Active Quality Assurance & Release Validation

### FEAT-111: Automated Zero-Dependency E2E CLI Test Suite (init, upgrade, sync, export, uninstall)
- **Status:** Backlog (`TODO`)
- **Platform:** bin/cli.mjs, scripts/lint-memory.mjs
- **Scope:**
  Add an automated smoke test script using node:test and node:assert that exercises init, upgrade, sync, export, and uninstall inside an isolated temporary directory.
- **Acceptance Criteria:**
  - [ ] Tests init, upgrade, sync, export, and uninstall in an isolated temp directory.
  - [ ] Verifies custom memory-bank/*.md domain files are 100% preserved across upgrade.
  - [ ] Passes via npm test.

---

### FEAT-112: Automated Byte-Parity Check Between scripts/backlog.mjs and templates/scripts/backlog.mjs
- **Status:** Backlog (`TODO`)
- **Platform:** scripts/lint-memory.mjs, scripts/backlog.mjs, templates/scripts/backlog.mjs
- **Scope:**
  Ensure upstream bug fixes to scripts/backlog.mjs never drift from templates/scripts/backlog.mjs distributed to downstream projects.
- **Acceptance Criteria:**
  - [ ] npm test fails if scripts/backlog.mjs and templates/scripts/backlog.mjs diverge.

---

## 3. Completed Migration Milestones

- [x] **MILESTONE-1**: v1.0–v1.3 Three-Tier Memory Bank, Auto-Scraper, Git Hooks & In-Place Upgrade
- [x] **MILESTONE-2**: v1.4 Zero-Token Backlog Engine, Review Pane Kanban & Isolated Dogfooding
- [ ] **MILESTONE-3**: v1.5 Automated E2E CLI Verification & Template Parity Suite

