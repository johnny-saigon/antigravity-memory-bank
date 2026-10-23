# Antigravity Memory Bank — Development & Backlog Board

This board tracks active development tickets, feature backlogs, architecture initiatives, and sprint milestones for Antigravity Memory Bank.

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

### FEAT-114: On-the-Fly Lifecycle Hooks (.agents/hooks.json), Zero-Manual-Step Memory Registration & 10-Point Mandatory Ingestion Checklist
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `lib/ingestion-checklist.mjs`, `lib/customizations-scraper.mjs`, `scripts/sync-memory-context.mjs`, `bin/cli.mjs`, `templates/AGENTS.md.tpl`, `rules/AGENTS.md`
- **Description:** Eliminate manual memory:sync / memory:upgrade actions when new API keys, MCP servers, skills, rules, repo paths, or architectural decisions are added. Enforce a 10-Point Mandatory Baseline Ingestion Checklist on every init and upgrade, auto-partition AGENTS.md @[...] includes under the 24KB per-rule cap, and wire .agents/hooks.json (SessionStart, PostToolUse, Stop) for real-time on-the-fly synchronization.
- **Technical Specification:**
  Create lib/ingestion-checklist.mjs to verify all 10 baseline pillars at init/upgrade time, install .agents/hooks.json (SessionStart, PostToolUse, Stop -> scripts/sync-memory-context.mjs --quiet --hook), update AGENTS.md Mandate #3 for immediate on-the-fly registration of pertinent facts, and balance @[...] includes across AGENTS.md and .agents/rules/memory-context.md (<24KB).
- **Acceptance Criteria:**
  - [x] Zero manual steps required when adding API keys, MCP servers, skills, rules, or repo paths (.agents/hooks.json auto-syncs on SessionStart, PostToolUse, and Stop).
  - [x] 10-Point Mandatory Baseline Ingestion Checklist runs and passes 10/10 across all installed repositories on init and upgrade.
  - [x] Automatic <24KB rule shard balancer ensures 100% of memory-bank/*.md files load into Antigravity rules without truncation.

---

### FEAT-115: Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `AGENTS.md`, `templates/AGENTS.md.tpl`, `rules/AGENTS.md`, `skills/backlog-start/SKILL.md`, `bin/cli.mjs`, `lib/ingestion-checklist.mjs`
- **Description:** Upstreamed from SnapCal (commit 0f346ae): enforce non-negotiable Strict End-to-End Verification Before Closure in AGENTS.md and .agents/skills/backlog-start/SKILL.md (Rule 4 + Phase 3 guard) so tickets involving third-party integrations, OAuth providers, or external credentials can NEVER be marked done until live credentials are configured on the server and real provider HTTP requests pass.
- **Technical Specification:**
  Add Mandate 6 (Strict End-to-End Verification Before Closure) to AGENTS.md, templates/AGENTS.md.tpl, rules/AGENTS.md, and bin/cli.mjs upgradeMemory; add Rule 4 and Phase 3 closure guard to skills/backlog-start/SKILL.md; verify in Check #6 of lib/ingestion-checklist.mjs; and trickle down to all 5 installed Memory Bank repositories.
- **Acceptance Criteria:**
  - [x] AGENTS.md and templates/AGENTS.md.tpl enforce Strict End-to-End Verification Before Closure.
  - [x] skills/backlog-start/SKILL.md Rule 4 forbids running npm run backlog done on integration tickets without live server credentials and passing provider HTTP requests.
  - [x] bin/cli.mjs upgradeMemory injects the mandate into all downstream AGENTS.md formats and passes 10/10 on the Mandatory Baseline Ingestion Checklist across all 5 repositories.

---

### FEAT-116: Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-plan/SKILL.md`, `skills/backlog-start/SKILL.md`, `templates/docs/PLANNING_GUIDE.md`, `bin/cli.mjs`, `lib/ingestion-checklist.mjs`
- **Description:** Integrate Antigravity Planning Mode (Explore -> Plan -> Review -> Execute) across all initialized and upgraded projects, correlating the 3-Artifact Lifecycle (task.md, implementation_plan.md, walkthrough.md) directly with docs/backlog.json and memory-bank/*.md and pre-populating artifacts for existing/advanced projects.
- **Technical Specification:**
  Generate and synchronize task.md (4 task groups), implementation_plan.md (Goal Description, User Review Required, Proposed Changes, Verification Plan), and walkthrough.md in both docs/planning/ and session brain directories; add npm run backlog plan [ID], /api/plan bridge endpoint, and Plan button in backlog.html; install /backlog-plan skill and docs/PLANNING_GUIDE.md on init/upgrade; verify in Check #8 of lib/ingestion-checklist.mjs.
- **Acceptance Criteria:**
  - [x] Automatically populates and syncs task.md, implementation_plan.md, and walkthrough.md in docs/planning/ and <brainDir>/ from existing backlog and memory-bank context.
  - [x] Installs /backlog-plan skill (.agents/skills/backlog-plan/SKILL.md) and docs/PLANNING_GUIDE.md on init and upgrade.
  - [x] Correlates backlog.html cards (📐 Plan button + /api/plan bridge) and /backlog-start with the 3 Planning Mode artifacts.

---

### FEAT-117: AI-Native Repository & Root Reorganization Engine (organize)
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `lib/repo-organizer.mjs`, `bin/cli.mjs`, `lib/ingestion-checklist.mjs`, `tests/cli-e2e.test.mjs`, `README.md`
- **Description:** Automatically organize repository root entrypoints, relocate loose root specs/boards into docs/ with git mv and link rewriting, remove redundant CLAUDE.md stubs and clutter, harden .gitignore, and scaffold canonical AI-native directories on fresh and existing projects.
- **Technical Specification:**
  Automatically organize repository root entrypoints, relocate loose root specs/boards into docs/ with git mv and link rewriting, remove redundant CLAUDE.md stubs and clutter, harden .gitignore, and scaffold canonical AI-native directories on fresh and existing projects.

---

### FEAT-118: Antigravity Native Rule Discovery & model_decision Progressive Disclosure
- **Status:** Completed (`DONE`)
- **Priority:** P0
- **Components:** `AGENTS.md`, `.agents/rules/`, `scripts/lint-memory.mjs`, `bin/cli.mjs`
- **Description:** Eliminate the Silent Discard Trap, Broken Frontmatter Trap (snake_case trigger: model_decision), and Token Bloat Trap (<50-line root AGENTS.md/GEMINI.md without inline @-expansion bloat); bridge memory-bank/*.md via .agents/rules/memory-*.md and lint via scripts/lint-memory.mjs.
- **Technical Specification:**
  Eliminate the Silent Discard Trap, Broken Frontmatter Trap (snake_case trigger: model_decision), and Token Bloat Trap (<50-line root AGENTS.md/GEMINI.md without inline @-expansion bloat); bridge memory-bank/*.md via .agents/rules/memory-*.md and lint via scripts/lint-memory.mjs.

---

### FEAT-119: Stop the Credit Bleed Controls & Executable Slash-Command Skills (/context, /clear, /effort, /credits, /usage)
- **Status:** Completed (`DONE`)
- **Priority:** P0
- **Components:** `skills/`, `.agents/skills/`, `scripts/lint-memory.mjs`, `bin/cli.mjs`
- **Description:** Enforce pre-edit /plan gate on complex features/bugs, /effort reasoning tiering, aggressive /clear + /compact + /context pruning after every task, and Google One / Antigravity Overage Toggle disable + /credits & /usage monitoring across GEMINI.md, AGENTS.md, negative-constraints.md, and skills.
- **Technical Specification:**
  Enforce pre-edit /plan gate on complex features/bugs, /effort reasoning tiering, aggressive /clear + /compact + /context pruning after every task, and Google One / Antigravity Overage Toggle disable + /credits & /usage monitoring across GEMINI.md, AGENTS.md, negative-constraints.md, and skills.

---

### FEAT-120: Phase 1: Extract SnapCal Multi-Platform OAuth, User Profile & Pluggable UX/UI Brick (bricks/user-profile/)
- **Status:** Completed (`DONE`)
- **Priority:** P0
- **Components:** `bricks/user-profile/brick.json`, `bricks/user-profile/core/`, `bricks/user-profile/platforms/web/`, `bricks/user-profile/platforms/ios/`, `bricks/user-profile/platforms/android/`, `bricks/user-profile/adapters/templates/`, `bricks/user-profile/schemas/`, `bricks/user-profile/testing/contract.spec.ts`, `bin/cli.mjs`, `package.json`, `.agents/rules/brick-governance.md`
- **Attachments:** `docs/PHASE_1_EXTRACT_SNAPCAL_AUTH_PROFILE_BRICK.md`
- **Description:** Extract User Profile Management and 4-Provider Social Login (Google, Facebook, Apple, Microsoft) from ../SnapCal into bricks/user-profile/ as a shared, platform-adaptive Hexagonal Brick with a Headless + Design-Token/Slot Theming Engine (ProfileBrandThemePort & ProfileUISlotsPort) across Web, iOS, and Android.
- **Technical Specification:**
  Implement bricks/user-profile/ (core ports, 4 OAuth verifiers, account linking, GDPR/App Store 5.1.1(v) revocation & Meta data-deletion, ProfileLifecycleEventPort, i18n dictionary, canonical SQL/Prisma schemas, Day-1 mock OAuth adapter, headless + themed-ui for Web/iOS/Android, contract.spec.ts) and add brick list/install/upgrade/doctor commands (--platforms web,ios,android | --platforms web, --with-schema) to bin/cli.mjs.
- **Acceptance Criteria:**
  - [x] Zero hardcoded SnapCal brand styles, hex colors, logos, bundle IDs (com.snapcal), or DB calls inside bricks/user-profile/.
  - [x] Complete separation of platforms/{web,ios,android}/headless/ and platforms/{web,ios,android}/themed-ui/ powered by ProfileBrandThemePort (--ag-profile-* tokens) and ProfileUISlotsPort.
  - [x] bin/cli.mjs supports brick list, brick install user-profile [--platforms web,ios,android | --platforms web] [--with-schema], brick upgrade user-profile (preserving repo-local adapters), and brick doctor user-profile.
  - [x] npm test passes contract.spec.ts for all 4 OAuth providers, profile CRUD, account linking, and theme token injection, and npm run lint:memory passes with 0 violations.

---

### FEAT-121: Canonical Living Documentation Hierarchy & Auto-Synthesizer
- **Status:** Completed (`DONE`)
- **Priority:** P0
- **Components:** `lib/docs-synthesizer.mjs`, `scripts/sync-living-docs.mjs`, `lib/repo-organizer.mjs`, `bin/cli.mjs`, `scripts/backlog.mjs`, `scripts/sync-memory-context.mjs`, `scripts/lint-memory.mjs`, `templates/docs/`, `templates/rules/docs-living-specs.md.tpl`
- **Attachments:** `docs/attachments/FEAT-121/STANDARD_DOCS_HIERARCHY_SPEC.md`
- **Description:** Upgrade antigravity-memory-bank so every initialized (init), upgraded (upgrade), or organized (organize) repository automatically builds and maintains a Standardized Living Documentation Hierarchy inside docs/{architecture,design,quality,operations}/ with zero-token auto-synthesis, progressive greenfield fill, legacy doc consolidation & link rewriting, and .agents/rules/docs-living-specs.md progressive disclosure.
- **Technical Specification:**
  Upgrade antigravity-memory-bank so every initialized (init), upgraded (upgrade), or organized (organize) repository automatically builds and maintains a Standardized Living Documentation Hierarchy inside docs/{architecture,design,quality,operations}/ with zero-token auto-synthesis, progressive greenfield fill, legacy doc consolidation & link rewriting, and .agents/rules/docs-living-specs.md progressive disclosure.

---

### FEAT-122: Deep Universal Documentation & Codebase Harvester for Canonical Living Docs
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/sync-living-docs.mjs`, `templates/scripts/sync-living-docs.mjs`, `tests/e2e-cli.test.mjs`

---

## 2. Active Quality Assurance & Release Validation

### FEAT-111: Automated Zero-Dependency E2E CLI Test Suite (init, upgrade, sync, export, uninstall)
- **Status:** Completed (`DONE`)
- **Platform:** bin/cli.mjs, scripts/lint-memory.mjs
- **Scope:**
  Add an automated smoke test script using node:test and node:assert that exercises init, upgrade, sync, export, and uninstall inside an isolated temporary directory.
- **Acceptance Criteria:**
  - [x] Tests init, upgrade, sync, export, and uninstall in an isolated temp directory.
  - [x] Verifies custom memory-bank/*.md domain files are 100% preserved across upgrade.
  - [x] Passes via npm test.

---

### FEAT-112: Automated Byte-Parity Check Between scripts/backlog.mjs and templates/scripts/backlog.mjs
- **Status:** Completed (`DONE`)
- **Platform:** scripts/lint-memory.mjs, scripts/backlog.mjs, templates/scripts/backlog.mjs
- **Scope:**
  Ensure upstream bug fixes to scripts/backlog.mjs never drift from templates/scripts/backlog.mjs distributed to downstream projects.
- **Acceptance Criteria:**
  - [x] npm test fails if scripts/backlog.mjs and templates/scripts/backlog.mjs diverge.

---

## 3. Completed Migration Milestones

- [x] **MILESTONE-1**: v1.0–v1.3 Three-Tier Memory Bank, Auto-Scraper, Git Hooks & In-Place Upgrade
- [x] **MILESTONE-2**: v1.4 Zero-Token Backlog Engine, Review Pane Kanban & Isolated Dogfooding
- [x] **MILESTONE-3**: v1.5 Automated E2E CLI Verification & Template Parity Suite

