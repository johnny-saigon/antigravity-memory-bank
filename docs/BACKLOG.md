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

