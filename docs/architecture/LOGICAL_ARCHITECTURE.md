<!-- antigravity-doc-sync -->
# 🧩 antigravity-memory-bank — Logical Architecture (`docs/architecture/LOGICAL_ARCHITECTURE.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Memory Baseline**: [`memory-bank/projectbrief.md`](../../memory-bank/projectbrief.md)

## 1. System Context & Domain North Star
- **Project**: **antigravity-memory-bank** — Three-Tier Memory Bank brick and Antigravity plugin for autonomous agentic pair programming
- **Target Platforms**: Web, iOS, Android & API
- **Core Architectural Pattern**: Three-Tier Memory Bank + Decoupled Zero-Token Backlog + Hexagonal Domain/Adapter Isolation.

```mermaid
flowchart LR
  User["User / Client (Web, iOS, Android & API)"] --> UI["Presentation Layer (Headless + Themed UI)"]
  UI --> Core["Domain & Application Services"]
  Core --> Ports["Hexagonal Ports & Adapters"]
  Ports --> DB[("PostgreSQL 16")]
```

---

## 2. Core Domain Entities & Shared Hexagonal Bricks

<!-- ag-section:logical-entities:start -->
| Module / Brick | Responsibility | Status |
| :--- | :--- | :--- |
| `core` | Primary domain & application services | 🟢 Active |
| `bricks/user-profile` (`v1.0.0`) | Multi-Platform OAuth 2.0, User Profile & Pluggable Token/Slot UX Brick (google, facebook, apple, microsoft) | 🟢 Installed (web, ios, android) |
<!-- ag-section:logical-entities:end -->

---

## 3. Progressive Feature & Capability Map (`FEAT-*`)

<!-- ag-section:logical-features:start -->
| Feature ID | Capability / Title | Status | Target Components |
| :--- | :--- | :--- | :--- |
| **`FEAT-109`** | Automated Board & Bug Record Adapter During init / upgrade | 🟢 DONE | `lib/backlog-adapter.mjs`, `bin/cli.mjs` |
| **`FEAT-110`** | Dogfooding & Strict Upstream Package Isolation Architecture | 🟢 DONE | `package.json`, `bin/cli.mjs`, `.gitignore` |
| **`FEAT-111`** | Automated Zero-Dependency E2E CLI Test Suite (init, upgrade, sync, export, uninstall) | 🟢 DONE | `bin/cli.mjs`, `scripts/lint-memory.mjs` |
| **`FEAT-112`** | Automated Byte-Parity Check Between scripts/backlog.mjs and templates/scripts/backlog.mjs | 🟢 DONE | `scripts/lint-memory.mjs`, `scripts/backlog.mjs`, `templates/scripts/backlog.mjs` |
| **`FEAT-113`** | Automatic Context & UX/UI .zip Bundle Ingestion in /backlog-start & Backlog Engine | 🟢 DONE | `skills/backlog-start/SKILL.md`, `scripts/backlog.mjs`, `templates/scripts/backlog.mjs` |
| **`FEAT-114`** | On-the-Fly Lifecycle Hooks (.agents/hooks.json), Zero-Manual-Step Memory Registration & 10-Point Mandatory Ingestion Checklist | 🟢 DONE | `lib/ingestion-checklist.mjs`, `lib/customizations-scraper.mjs`, `scripts/sync-memory-context.mjs` |
| **`FEAT-115`** | Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start | 🟢 DONE | `AGENTS.md`, `templates/AGENTS.md.tpl`, `rules/AGENTS.md` |
| **`FEAT-116`** | Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill | 🟢 DONE | `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-plan/SKILL.md` |
| **`FEAT-117`** | AI-Native Repository & Root Reorganization Engine (organize) | 🟢 DONE | `lib/repo-organizer.mjs`, `bin/cli.mjs`, `lib/ingestion-checklist.mjs` |
| **`FEAT-118`** | Antigravity Native Rule Discovery & model_decision Progressive Disclosure | 🟢 DONE | `AGENTS.md`, `.agents/rules/`, `scripts/lint-memory.mjs` |
| **`FEAT-119`** | Stop the Credit Bleed Controls & Executable Slash-Command Skills (/context, /clear, /effort, /credits, /usage) | 🟢 DONE | `skills/`, `.agents/skills/`, `scripts/lint-memory.mjs` |
| **`FEAT-120`** | Phase 1: Extract SnapCal Multi-Platform OAuth, User Profile & Pluggable UX/UI Brick (bricks/user-profile/) | 🟢 DONE | `bricks/user-profile/brick.json`, `bricks/user-profile/core/`, `bricks/user-profile/platforms/web/` |
| **`FEAT-121`** | Canonical Living Documentation Hierarchy & Deep Universal Harvester (docs/INDEX.md + 4 Pillars) | 🟢 DONE | `lib/docs-synthesizer.mjs`, `scripts/sync-living-docs.mjs`, `templates/scripts/sync-living-docs.mjs` |
| **`FEAT-122`** | Mandatory Plan-to-Backlog Ticket Creation & Atomic Plan Decomposition (backlog split & plan --from-plan) | 🟢 DONE | `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-plan/SKILL.md` |
| **`FEAT-123`** | Auto-Execute /clear & /compact Pre-Flight on Every /start Workflow Across All Installed Memory Banks | 🟢 DONE | `skills/start/SKILL.md`, `.agents/skills/start/SKILL.md`, `scripts/lint-memory.mjs` |
| **`FEAT-124`** | Add per-column and global Sort (Oldest to Newest and vice versa) and manual drag-and-drop / up-down ticket reordering across all Backlog instances | 🟢 DONE | `scripts/backlog.mjs`, `templates/scripts/backlog.mjs` |
| **`FEAT-125`** | Verbose AGY Model Roster, Quota-Pool & Ticket Quality-to-Credit ROI Engine | 🟢 DONE | `scripts/lint-memory.mjs`, `tests/cli-e2e.test.mjs` |
| **`FEAT-126`** | Interactive Kanban Credit-Saving & AGY Model Advisor UI and CLI | 🟢 DONE | `scripts/backlog.mjs`, `templates/scripts/backlog.mjs` |
| **`FEAT-127`** | Verbose Credit-Saving Skills, Prescriptive Footer, Living Guides & Cross-Repo Rollout | 🟢 DONE | `skills/effort/SKILL.md`, `skills/credits/SKILL.md`, `skills/usage/SKILL.md` |
| **`FEAT-128`** | Add Credits CheatSheet (docs/CREDITS_CHEATSHEET.md) to Memory Bank & Deploy to All Projects | 🟢 DONE | `docs/CREDITS_CHEATSHEET.md`, `templates/docs/CREDITS_CHEATSHEET.md`, `bin/cli.mjs` |
<!-- ag-section:logical-features:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-logical:start -->
<!-- harvested-repo-context:start -->
### Harvested Repository & Memory-Bank Context

- **From [`memory-bank/projectbrief.md`](../../memory-bank/projectbrief.md) (Memory Bank Baseline)**:
  - **Product Name**: antigravity-memory-bank
  - **Tagline**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
  - **Core Value Proposition**: Prevents context drift, cross-project rule pollution, and token waste by separating global preferences (Tier 1), cluster invariants (Tier 2), and isolated domain memory (Tier 3) alongside a decoupled zero-token local backlog (`docs/backlog.json`).
  - **Platforms**: Node.js CLI (`npx github:johnny-saigon/antigravity-memory-bank`), Antigravity IDE Workspace Plugin & Skills (`/start`, `/backlog-start`, `/update-memory`), Git Hooks & GitHub Actions CI.
  - **Primary Audience**: Developers and autonomous AI coding agents working across single or colocated multi-project repositories.

- **From [`README.md`](../../README.md) (## 🔄 The Continuous Session Lifecycle)**:
  Unlike legacy memory systems that require stopping and manually restarting, this brick uses a **2-Phase Continuous Loop**:
  ### The Two-Phase Lifecycle Breakdown
  Whenever `/update-memory` is triggered (or when a major milestone completes):
  #### Phase 1: Milestone Closure & Git Synchronization
  1. **Git Diff & Status Review**: Inspects working tree changes (`git status -s` and `git diff --stat`) to verify what was modified.
  2. **Context & Progress Updates**: Marks finished acceptance criteria in `memory-bank/progress.md` (`[x]`) and records architectural decisions, schema migrations, and resolved bugs in `memory-bank/activeContext.md`.
  3. **Token Line Budget Audit**: Automatically verifies that every file in `memory-bank/*.md` remains strictly **`< 150 lines`** (via `scripts/lint-memory.mjs`). If a domain expands, it splits into a linked sub-file (`@[Topic](path.md)`).
  4. **Infrastructure Invariant Verification**: Checks that no Tier 2 cluster invariants (`.agents/rules/infra.md`), port allocations, or database boundaries were violated.

- **From [`README.md`](../../README.md) (## ⚡ Automated Self-Updating Architecture)**:
  Once installed, the system keeps itself continuously up-to-date across **two distinct dimensions**:
  ### 1. Context Auto-Updating (Codebase & Commit Synchronization)
  - **Git `post-commit` Hook**: Installed into `.git/hooks/post-commit`. Every `git commit` that introduces new features (`feat:`) or bug fixes (`fix:`) automatically triggers `scripts/sync-memory-context.mjs` in the background. It updates `progress.md` accomplishments and `activeContext.md` sprint state with zero manual typing.
  - **Agent Continuous Cycle (`/update-memory`)**: When pair-programming with Antigravity, the agent executes the 2-phase lifecycle upon task completion—synchronizing diffs, verifying line budgets (< 150 lines), committing to Git, and auto-bootstrapping the next cycle.
  - **CI Context Verification (GitHub Actions)**: `.github/workflows/memory-bank-sync.yml` runs on every PR and push to `main`, validating line budgets (`npm run lint:memory`) and ensuring master branch context is in lockstep with releases.
  ### 2. Tooling & System Auto-Updating (Upstream Brick Upgrades)
  - **Non-Destructive In-Place Upgrade**: Upstream enhancements, new skills, and prompt optimizations in `antigravity-memory-bank` can be pulled non-destructively:
    This updates `.agents/skills/`, `scripts/lint-memory.mjs`, and `.git/hooks/post-commit` while keeping all project-specific domain documents in `memory-bank/*.md` 100% intact.

- **From [`README.md`](../../README.md) (## 📐 5. Structured Planning Mode (`Explore → Plan → Execute`) & 3-Artifact Lifecycle)**:
  In Antigravity, **Planning Mode** transforms the agent from an immediate code generator into an autonomous software architect that explores your codebase, maps out dependencies, and aligns with you on an architectural blueprint *before* touching a single production file.
  Every project initialized (`init`) or updated (`upgrade`) with `antigravity-memory-bank` automatically installs all **Planning Mode** prerequisites (`/backlog-plan` skill, `docs/PLANNING_GUIDE.md`, `npm run backlog:plan`, and the `📐 Plan` Kanban actions) and correlates the **3-Artifact Lifecycle** 1-to-1 with your **Local Backlog (`docs/backlog.json`)** and **Three-Tier Memory Bank (`memory-bank/*.md`)**.
  ---
  ### 5.1 How the Planning Mode Workflow Operates
  When you trigger Planning Mode (by selecting **Planning** in the mode picker, pressing **`Cmd/Ctrl + .`** or **`Shift + Tab`**, typing **`/plan`**, or invoking **`/backlog-plan <TICKET_ID>`**), Antigravity moves through a structured **3-Artifact Lifecycle** stored inside its session brain (`~/.gemini/antigravity/brain/<session-id>/`) and mirrored in `docs/planning/`:
  1. **Context Discovery & `task.md` Creation (`docs/planning/task.md` & `<brainDir>/task.md`):**
     The agent searches your repository, reads your project rules (`GEMINI.md` and `AGENTS.md`), ingests `memory-bank/*.md` and `docs/backlog.json`, and updates **`task.md`**—a live checklist broken into 4 correlated task groups:
     - **1. Context Discovery & Architectural Baseline**

- **From [`README.md`](../../README.md) (## 🔒 7. Dogfooding & Upstream Package Isolation Architecture)**:
  `antigravity-memory-bank` dogfoods its own **Three-Tier Memory Bank** (`memory-bank/*.md`, `AGENTS.md`, `.agents/`) and **Decoupled Zero-Token Backlog Engine** (`docs/backlog.json`, `docs/BACKLOG.md`) directly inside this repository while guaranteeing **zero interference** with clean installations in downstream projects:
  1. **Strict `package.json` Distribution Whitelist (`"files"`)**:
     - The `"files"` array in [`package.json`](package.json) explicitly whitelists only the distributable engine directories (`bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, `install.sh`).
     - Internal dogfood state (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`, `.github/`) is excluded from packaged npm/`npx` tarballs.
  2. **Template-Only Downstream Generation**:
     - [`bin/cli.mjs`](bin/cli.mjs) scaffolds downstream projects exclusively from `templates/`, `skills/`, `rules/`, `lib/`, and `scripts/`. It never reads from the repository's root `memory-bank/`, `docs/`, `AGENTS.md`, or `.agents/`.
  3. **Self-Repository Guard (`isSelfRepo`)**:
     - `detectProjectContext()` in [`bin/cli.mjs`](bin/cli.mjs) detects when the CLI is invoked inside the upstream `antigravity-memory-bank` repository (`detected.isSelfRepo`).

- **From [`README.md`](../../README.md) (## 🛠️ 8. Repository Scripts)**:
  | Script | Command | Description |
  | :--- | :--- | :--- |
  | **Backlog Board** | `npm run backlog` | Lists tasks and provides zero-token backlog CLI controls |
  | **List Backlog** | `npm run backlog:list` | Displays backlog with status icons and priority tags |
  | **Add Task** | `npm run backlog:add "<title>"` | Captures a task offline into docs/backlog.json (0 tokens) |
  | **Plan Task** | `npm run backlog:plan [<id>]` | Generates/syncs 3-artifact Planning Mode (`task.md`, `implementation_plan.md`, `walkthrough.md`) |
  | **Start Task** | `npm run backlog:start <id>` | Marks task in-progress and outputs 1-line kickoff prompt |
  | **Complete Task** | `npm run backlog:done <id>` | Marks task completed and refreshes Review pane board |
<!-- harvested-repo-context:end -->

---

<!-- merged-source:docs/CREDITS_CHEATSHEET.md:start -->
### Consolidated from `docs/CREDITS_CHEATSHEET.md` (Archived at [`docs/archive/CREDITS_CHEATSHEET.md`](../archive/CREDITS_CHEATSHEET.md))

# 💰 Antigravity Credits CheatSheet — AGY 3-Family Model & Quality-to-Credit ROI Guide

> **Mission (Job-To-Be-Done):** Save Antigravity credits while maximizing your **Quality-to-Used-Credits Ratio (`Q/C ROI`)** on every ticket — synchronized with all **27 deployed AGY model/effort variants** across **Google Gemini**, **External Partner Models**, and **Google Orchestrators**.
>
> **Living Maintenance Rule:** Whenever Antigravity (AGY) deploys, renames, or retires models, update this **Credits CheatSheet** (`docs/CREDITS_CHEATSHEET.md` & `templates/docs/CREDITS_CHEATSHEET.md`), `scripts/lint-memory.mjs`, and `scripts/backlog.mjs`, then run `upgrade` to sync every installed Memory Bank project automatically.

---

## 🧭 1. 10-Second Decision Flowchart (Before You Type a Prompt)

```mermaid
flowchart LR
  A["New Task / Bug"] --> B["1. Capture Ticket Offline\n(0 AI Credits)\nbacklog.html or npm run backlog add"]
  B --> C{"Scope & Risk?"}

  C -- "1 file · Copy / CSS / Docs\nSimple CRUD" --> T1["⚡ Skip /plan (Saves ~50%)\n/effort low · /backlog-start\nGemini 3.8 Flash (Low/Med)\nor GPT-OSS 120B (Med)"]
  C -- "1–2 files · Clear Spec\nStandard Feature / Bug" --> T2["⚙️ Direct Ticket Sprint\n/effort medium · /backlog-start\nGemini 4 Neon (Med/High)\nor Claude Sonnet 5.5 (Med)"]
  C -- "3+ files · OAuth / Schema\nArchitecture / P0 Bug" --> T3["🧠 Two-Stage Split Routing\n(Saves 55%–80% Credits!)\nStage A: /backlog-plan on Argon/Opus\nStage B: Switch DOWN to Neon/Sonnet"]
  C -- "5+ Parallel Modules\nCross-Repo Swarm" --> T4["🎛️ Orchestrator Swarm\nOrchestrator (Neon/Carbon/Argon)\nPin workers to Flash/Neon\nSwitch BACK after swarm!"]

  T1 & T2 & T3 & T4 --> Z["🧹 Run /start After Ticket\n(0.0 KB active delta · 100% archive kept)"]
```

---

## ⚖️ 2. Full AGY 3-Family Model Reference & Dual Quota-Pool Balancing

> [!TIP]
> **Dual Quota-Pool Secret (Two Independent 4-Hour Reset Clocks):**
> - **Quota Pool 1 (Google):** All **Google Gemini** models + all **Google Orchestrators** share one quota clock.
> - **Quota Pool 2 (External):** **Claude Sonnet 5.5**, **Claude Opus 5.5**, and **GPT-OSS 120B** share a *separate* quota clock.
> - **Pro Move:** If Pool 1 drops below `30%`, shift daily work to **Claude Sonnet 5.5 (Med)** or **GPT-OSS 120B (Med)** instead of hitting a wall or enabling paid overage!

### 🔵 Family 1 — Google Gemini Models *(Quota Pool 1: Google)*

| Model & Effort Variants | Credit Burn | Sweet Spot & Best Tickets | Avoid Using For |
| :--- | :---: | :--- | :--- |
| **Gemini 3.8 Flash** *(Low / Medium / High)* | **`1.0x`** *(Baseline)* | Boilerplate UI, CSS, copy tweaks, docs formatting, unit test runs, and browser/research subagents | Complex multi-file architecture or P0 concurrency bugs |
| **Gemini 4 Hydrogen** *(Low / Medium / High / **XHigh**)* | **`1.3x–2.0x`** *(Agile)* | Agile Gemini 4 coding; **`XHigh`** gives deep reasoning bursts on single-module algorithms without full Argon cost | Large cross-repo migrations |
| **Gemini 4 Neon** *(Low / Medium / High / **XHigh**)* | **`2.0x–3.0x`** *(Best Daily ROI)* | **Premier daily-driver sweet spot for 80% of feature & bug tickets** and executing approved `/backlog-plan` sub-tickets | Trivial 1-line copy tweaks (use Flash) |
| **Gemini 4 Carbon** *(Low / Medium / High)* | **`3.5x–4.5x`** *(Deep Systems)* | Deep multi-file systems engineering, backend/DB adapters, OAuth flows, and complex state machines | Routine CSS/docs formatting |
| **Gemini 4 Argon** *(Low / Medium / High)* | **`5.0x–7.0x`** *(Frontier Architect)* | Heavyweight frontier architect — **reserve for 1–2 turn `/backlog-plan`**, cross-repo contracts, and P0 root-cause diagnosis | Leaving active for 10+ implementation/test-fix turns |

---

### 🟠 Family 2 — External Partner Models *(Quota Pool 2: Independent Reset Clock)*

| Model & Effort Variants | Credit Burn | Sweet Spot & Best Tickets | Avoid Using For |
| :--- | :---: | :--- | :--- |
| **GPT-OSS 120B** *(Medium)* | **`1.5x`** *(Open-Weight Offload)* | High-efficiency external offload for routine coding, scaffolding, boilerplate, or second-opinion reviews while preserving Google & Claude quota | Deep multi-file UI/UX design surgery |
| **Claude Sonnet 5.5** *(Low / Medium / High)* | **`2.5x–4.0x`** *(Surgical Code)* | Surgical TypeScript/React/UI component implementation and multi-file refactoring *(External Pool twin of Gemini 4 Neon / Carbon)* | Running bulk repetitive lint/docs commands |
| **Claude Opus 5.5** *(Low / Medium / High)* | **`6.0x–9.0x`** *(Heavyweight Frontier)* | Strictly for **1-turn `/backlog-plan` blueprints**, security audits, or stubborn P0 bugs | **Never** leave active for routine iterative test-fix loops! |

---

### 🟣 Family 3 — Google Orchestrators *(Quota Pool 1: Multi-Agent / Swarm Coordinators)*

| Orchestrator Variant | Model ID | Credit Multiplier | Best Use Case |
| :--- | :--- | :---: | :--- |
| **Orchestrator (Neon)** | `gemini-pro-orchestrator-neon` | **`3.0x–4.5x`** | Coordinator for lightweight `2–3` worker parallel tasks (`swarm` / `/teamwork`) |
| **Orchestrator (Carbon)** | `gemini-pro-orchestrator` | **`4.5x–6.5x`** | Coordinator for multi-module feature pipelines and cross-layer refactors |
| **Orchestrator (Argon)** | `gemini-pro-orchestrator-argon` | **`6.5x–10.0x`** | Frontier coordinator for large-scale repository migrations or multi-agent architectural audits |

> [!WARNING]
> **Explicit Orchestrator Credit Warning (`3x–6x` Fan-Out Multiplier):**
> Orchestrators spawn and coordinate multiple turns and subagent workers automatically. **NEVER leave an Orchestrator selected for single-agent ticket execution (1–3 file tasks)** — always switch back to **Gemini 4 Neon** or **Gemini 3.8 Flash** as soon as your swarm finishes!

---

## 🔀 3. Backlog-First & Two-Stage Split Routing (Save `55%–80%` Credits)

1. **Always Create a Backlog Ticket Offline First (`0 AI Tokens`)**:
   - Use the Review pane (`backlog.html` → **➕ Quick Capture Task**) or CLI (`npm run backlog add "<Title>" --components "<files>"`).
   - Pre-defining target files and `.zip`/spec attachments offline eliminates `2–4` exploratory chat turns (**`~15k–30k` tokens saved immediately**).
2. **Know When to Skip `/plan` vs. Spend Separate Planning Credits**:
   - **Skip Separate `/plan` (`1–2` files, low ambiguity)**: A formal planning turn (`~4k` tokens) costs as much as the fix itself. Jump straight to `/effort low /backlog-start <ID>` or `/effort medium /backlog-start <ID>`.
   - **Use Two-Stage Split Model Routing (`3+` files, OAuth/DB, P0 bugs)**:
     - **Stage A — Plan (`1–2` turns on Frontier):** Select **Gemini 4 Argon/Carbon (High)** or **Claude Opus 5.5 (Med/High)** and run `/effort high /backlog-plan <ID>` to lock `implementation_plan.md` and split atomic sub-tickets (`npm run backlog split`).
     - **Stage B — Execute (Switch Model DOWN):** Before clicking **Proceed**, switch to **Gemini 4 Neon (Medium)** or **Claude Sonnet 5.5 (Medium)** (or **Gemini 3.8 Flash** for simple sub-tickets) to execute each atomic ticket — delivering frontier architecture at workhorse credit cost!

---

## ⚡ 4. Quick-Reference Controls & Anti-Bleed Checklist

| Command / Control | What It Does | When to Run It |
| :--- | :--- | :--- |
| **`npm run backlog advise [ID]`** | Prints verbose ticket-specific AGY model & Q/C ROI prescription | Before starting any ticket |
| **`/start`** | Auto-runs `/clear` & `/compact` pre-flight (`0.0 KB` active delta, 100% archive kept) | Immediately after finishing **every** ticket |
| **`/effort [low\|medium\|high\|xhigh]`** | Sets reasoning depth, turn cap (`≤ 4/6/8`), and outputs model guide | Whenever task complexity shifts |
| **`/credits`** · **`/usage`** · **`/context`** | Audits per-turn token drain, progressive disclosure savings & quota tips | Weekly or if responses feel slow/heavy |
| **Overage Toggle = `OFF`** | Enforces a hard stop at your 20x baseline limit (zero surprise top-up burn) | Keep **OFF** in Google One / Antigravity Settings |
<!-- merged-source:docs/CREDITS_CHEATSHEET.md:end -->
<!-- ag-section:legacy-logical:end -->
