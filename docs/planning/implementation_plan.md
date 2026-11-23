<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Unified Canonical Living Documentation Hierarchy & Deep Universal Harvester (`FEAT-121`), Hexagonal `user-profile` Brick (`FEAT-120`), & Correlated 3-Artifact Planning Mode (`22/22` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Canonical Living Documentation Hierarchy & Deep Universal Harvester (`docs/INDEX.md` + 4 Pillars), Pluggable Hexagonal Bricks (`bricks/user-profile`), and Decoupled Zero-Token Backlog Engine while keeping upstream templates 100% byte-identical and synchronized across all 5 repositories (`antigravity-memory-bank`, `SnapCal`, `BinaryDay`, `RemoveBackGround`, `wiro`).
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-128] Add Credits CheatSheet (docs/CREDITS_CHEATSHEET.md) to Memory Bank & Deploy to All Projects** (`HIGH` · Status: `done`): Create a well-designed, UX-polished Credits CheatSheet covering AGY's 3 deployed model families (Google Gemini, External Partner, Google Orchestrators), Dual Quota-Pool balancing, Two-Stage Split Routing, and Backlog-First economics; wire into init/upgrade and deploy to all installed Memory Bank projects.
  - **[FEAT-127] Verbose Credit-Saving Skills, Prescriptive Footer, Living Guides & Cross-Repo Rollout** (`HIGH` · Status: `done`): Upgrade all credit/planning skills, AGENTS directives (<50 lines), living guides, and README with verbose AGY model routing and ticket-first motivation, then deploy upgrade across all installed Memory Bank repos.
  - **[FEAT-126] Interactive Kanban Credit-Saving & AGY Model Advisor UI and CLI** (`HIGH` · Status: `done`): Add per-card AGY Model & Quality-to-Credit ROI pills, interactive Save Credits & AGY Model Advisor modal, Quick-Add live ROI banner, and npm run backlog advise CLI across scripts/backlog.mjs and templates/scripts/backlog.mjs.
  - **[FEAT-125] Verbose AGY Model Roster, Quota-Pool & Ticket Quality-to-Credit ROI Engine** (`HIGH` · Status: `done`): Evolve scripts/lint-memory.mjs (--effort, --credits, --usage, --context, --advise) with all 27 deployed AGY models (Google Gemini 3.8/4, Google Orchestrators, External Claude 5.5 / GPT-OSS 120B), xhigh effort tier, Two-Stage Split Model Routing, Dual Quota-Pool balancing, and Backlog-First planning economics.

## 2. User Review Required
> [!IMPORTANT]
> **Architectural Guardrails & Pre-Execution Alignment**:
> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.
> - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
> - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
> - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
> - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).

> [!WARNING]
> **Strict Live End-to-End Verification Before Closure (Mandate #6 / Rule #4)**:
> One or more planned tickets involve third-party integrations, OAuth providers, or external credentials. **NEVER mark these tickets as `done` (`npm run backlog done`) until live server credentials are configured and real end-to-end provider HTTP requests pass.** If external credentials are pending, keep the ticket `in_progress`.

## 3. Proposed Changes
### [FEAT-128] Add Credits CheatSheet (docs/CREDITS_CHEATSHEET.md) to Memory Bank & Deploy to All Projects *(Completed & Verified Baseline)*
- **Specification**: Create a well-designed, UX-polished Credits CheatSheet covering AGY's 3 deployed model families (Google Gemini, External Partner, Google Orchestrators), Dual Quota-Pool balancing, Two-Stage Split Routing, and Backlog-First economics; wire into init/upgrade and deploy to all installed Memory Bank projects.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/CREDITS_CHEATSHEET.md) (`docs/CREDITS_CHEATSHEET.md`)
  - `[VERIFIED]` [CREDITS_CHEATSHEET.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/CREDITS_CHEATSHEET.md) (`templates/docs/CREDITS_CHEATSHEET.md`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)

### [FEAT-127] Verbose Credit-Saving Skills, Prescriptive Footer, Living Guides & Cross-Repo Rollout *(Completed & Verified Baseline)*
- **Specification**: Upgrade all credit/planning skills, AGENTS directives (<50 lines), living guides, and README with verbose AGY model routing and ticket-first motivation, then deploy upgrade across all installed Memory Bank repos.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/effort/SKILL.md) (`skills/effort/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/credits/SKILL.md) (`skills/credits/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/usage/SKILL.md) (`skills/usage/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md) (`skills/start/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)
  - `[VERIFIED]` [BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md) (`docs/BACKLOG_GUIDE.md`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md) (`docs/PLANNING_GUIDE.md`)
  - `[VERIFIED]` [README.md](file:///Users/jbb/Documents/antigravity-memory-bank/README.md) (`README.md`)

### [FEAT-126] Interactive Kanban Credit-Saving & AGY Model Advisor UI and CLI *(Completed & Verified Baseline)*
- **Specification**: Add per-card AGY Model & Quality-to-Credit ROI pills, interactive Save Credits & AGY Model Advisor modal, Quick-Add live ROI banner, and npm run backlog advise CLI across scripts/backlog.mjs and templates/scripts/backlog.mjs.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)

### [FEAT-125] Verbose AGY Model Roster, Quota-Pool & Ticket Quality-to-Credit ROI Engine *(Completed & Verified Baseline)*
- **Specification**: Evolve scripts/lint-memory.mjs (--effort, --credits, --usage, --context, --advise) with all 27 deployed AGY models (Google Gemini 3.8/4, Google Orchestrators, External Claude 5.5 / GPT-OSS 120B), xhigh effort tier, Two-Stage Split Model Routing, Dual Quota-Pool balancing, and Backlog-First planning economics.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) (`scripts/lint-memory.mjs`)
  - `[VERIFIED]` [cli-e2e.test.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/tests/cli-e2e.test.mjs) (`tests/cli-e2e.test.mjs`)

## 4. Verification Plan
### Automated & Deterministic Terminal Verification
```bash
npm run lint:memory
npm test
npm run test:e2e
```

### End-to-End & Sprint Closure Checklist
1. Execute all deterministic test, typecheck, and build commands above with `0` errors.
2. Verify `npm run lint:memory` passes with `< 150 lines` across all `memory-bank/*.md` files.
3. For integration/OAuth tickets, verify live end-to-end provider HTTP requests pass before running `npm run backlog done <ID>`.
4. Record verification proof in `walkthrough.md`, `memory-bank/activeContext.md`, and `memory-bank/progress.md`.
