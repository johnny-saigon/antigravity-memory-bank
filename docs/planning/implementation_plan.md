<!-- antigravity-planning-sync -->
# Implementation Plan — Antigravity Memory Bank: Verified Architecture Baseline & Next Sprint Readiness

## 1. Goal Description
- **Project North Star**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Current Phase**: v1.5 Correlated 3-Artifact Planning Mode & Automated E2E CLI Verification (`23/23` backlog tickets `DONE`).
- **Sprint Objective**: Dogfood the Three-Tier Memory Bank, Decoupled Zero-Token Backlog Engine, and Correlated 3-Artifact Planning Mode directly inside `antigravity-memory-bank` while keeping upstream templates 100% generic.
- **Planning Scope (`BASELINE`)**:
  - **[FEAT-116] Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill** (`HIGH` · Status: `done`): Integrate Antigravity Planning Mode (Explore -> Plan -> Review -> Execute) across all initialized and upgraded projects, correlating the 3-Artifact Lifecycle (task.md, implementation_plan.md, walkthrough.md) directly with docs/backlog.json and memory-bank/*.md and pre-populating artifacts for existing/advanced projects.
  - **[FEAT-115] Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start** (`HIGH` · Status: `done`): Upstreamed from SnapCal (commit 0f346ae): enforce non-negotiable Strict End-to-End Verification Before Closure in AGENTS.md and .agents/skills/backlog-start/SKILL.md (Rule 4 + Phase 3 guard) so tickets involving third-party integrations, OAuth providers, or external credentials can NEVER be marked done until live credentials are configured on the server and real provider HTTP requests pass.
  - **[FEAT-114] On-the-Fly Lifecycle Hooks (.agents/hooks.json), Zero-Manual-Step Memory Registration & 10-Point Mandatory Ingestion Checklist** (`HIGH` · Status: `done`): Eliminate manual memory:sync / memory:upgrade actions when new API keys, MCP servers, skills, rules, repo paths, or architectural decisions are added. Enforce a 10-Point Mandatory Baseline Ingestion Checklist on every init and upgrade, auto-partition AGENTS.md @[...] includes under the 24KB per-rule cap, and wire .agents/hooks.json (SessionStart, PostToolUse, Stop) for real-time on-the-fly synchronization.
  - **[BUG-107] Pull API Keys, Env Contracts, MCP Server Configs & Customizations into Memory Bank on Init/Upgrade/Sync** (`HIGH` · Status: `done`): API keys (.env*, eas.json, credentials/*.p8, host token files), MCP server configs (~/.gemini/config/mcp_config.json, .mcp.json), and Antigravity customizations (.agents/rules/*, .agents/skills/*, .agents/workflows/*, ~/.gemini/config/hooks.json, ~/.gemini/config/config.json) were not pulled into memory-bank during init, upgrade, or sync. Additionally, bin/cli.mjs ignored positional directory arguments.

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
### [FEAT-116] Correlated 3-Artifact Antigravity Planning Mode (task.md, implementation_plan.md, walkthrough.md) & /backlog-plan Skill *(Completed & Verified Baseline)*
- **Specification**: Generate and synchronize task.md (4 task groups), implementation_plan.md (Goal Description, User Review Required, Proposed Changes, Verification Plan), and walkthrough.md in both docs/planning/ and session brain directories; add npm run backlog plan [ID], /api/plan bridge endpoint, and Plan button in backlog.html; install /backlog-plan skill and docs/PLANNING_GUIDE.md on init/upgrade; verify in Check #8 of lib/ingestion-checklist.mjs.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) (`scripts/backlog.mjs`)
  - `[VERIFIED]` [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`templates/scripts/backlog.mjs`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md) (`skills/backlog-plan/SKILL.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/templates/docs/PLANNING_GUIDE.md) (`templates/docs/PLANNING_GUIDE.md`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs) (`lib/ingestion-checklist.mjs`)
- **Acceptance Criteria**:
  - Automatically populates and syncs task.md, implementation_plan.md, and walkthrough.md in docs/planning/ and <brainDir>/ from existing backlog and memory-bank context.
  - Installs /backlog-plan skill (.agents/skills/backlog-plan/SKILL.md) and docs/PLANNING_GUIDE.md on init and upgrade.
  - Correlates backlog.html cards (📐 Plan button + /api/plan bridge) and /backlog-start with the 3 Planning Mode artifacts.

### [FEAT-115] Enforce Strict Live End-to-End Verification Before Ticket Closure Across AGENTS.md & /backlog-start *(Completed & Verified Baseline)*
- **Specification**: Add Mandate 6 (Strict End-to-End Verification Before Closure) to AGENTS.md, templates/AGENTS.md.tpl, rules/AGENTS.md, and bin/cli.mjs upgradeMemory; add Rule 4 and Phase 3 closure guard to skills/backlog-start/SKILL.md; verify in Check #6 of lib/ingestion-checklist.mjs; and trickle down to all 5 installed Memory Bank repositories.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md) (`AGENTS.md`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (`skills/backlog-start/SKILL.md`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs) (`lib/ingestion-checklist.mjs`)
- **Acceptance Criteria**:
  - AGENTS.md and templates/AGENTS.md.tpl enforce Strict End-to-End Verification Before Closure.
  - skills/backlog-start/SKILL.md Rule 4 forbids running npm run backlog done on integration tickets without live server credentials and passing provider HTTP requests.
  - bin/cli.mjs upgradeMemory injects the mandate into all downstream AGENTS.md formats and passes 10/10 on the Mandatory Baseline Ingestion Checklist across all 5 repositories.

### [FEAT-114] On-the-Fly Lifecycle Hooks (.agents/hooks.json), Zero-Manual-Step Memory Registration & 10-Point Mandatory Ingestion Checklist *(Completed & Verified Baseline)*
- **Specification**: Create lib/ingestion-checklist.mjs to verify all 10 baseline pillars at init/upgrade time, install .agents/hooks.json (SessionStart, PostToolUse, Stop -> scripts/sync-memory-context.mjs --quiet --hook), update AGENTS.md Mandate #3 for immediate on-the-fly registration of pertinent facts, and balance @[...] includes across AGENTS.md and .agents/rules/memory-context.md (<24KB).
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [ingestion-checklist.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/ingestion-checklist.mjs) (`lib/ingestion-checklist.mjs`)
  - `[VERIFIED]` [customizations-scraper.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/customizations-scraper.mjs) (`lib/customizations-scraper.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (`rules/AGENTS.md`)
- **Acceptance Criteria**:
  - Zero manual steps required when adding API keys, MCP servers, skills, rules, or repo paths (.agents/hooks.json auto-syncs on SessionStart, PostToolUse, and Stop).
  - 10-Point Mandatory Baseline Ingestion Checklist runs and passes 10/10 across all installed repositories on init and upgrade.
  - Automatic <24KB rule shard balancer ensures 100% of memory-bank/*.md files load into Antigravity rules without truncation.

### [BUG-107] Pull API Keys, Env Contracts, MCP Server Configs & Customizations into Memory Bank on Init/Upgrade/Sync *(Completed & Verified Baseline)*
- **Specification**: Create lib/customizations-scraper.mjs and embed standalone sync in scripts/sync-memory-context.mjs to generate memory-bank/integrationsAndCustomizations.md (<150 lines, masking raw secret literals while preserving key names, file paths, non-secret IDs, MCP tools, rules, skills, and hooks), wire into init/upgrade/sync in bin/cli.mjs, support positional targetDir, and redeploy across all installed instances.
- **Component Modifications (Dependencies First)**:
  - `[VERIFIED]` [customizations-scraper.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/lib/customizations-scraper.mjs) (`lib/customizations-scraper.mjs`)
  - `[VERIFIED]` [cli.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/bin/cli.mjs) (`bin/cli.mjs`)
  - `[VERIFIED]` [sync-memory-context.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/sync-memory-context.mjs) (`scripts/sync-memory-context.mjs`)
  - `[VERIFIED]` [integrationsAndCustomizations.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/memory-bank/integrationsAndCustomizations.md.tpl) (`templates/memory-bank/integrationsAndCustomizations.md.tpl`)
  - `[VERIFIED]` [AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl) (`templates/AGENTS.md.tpl`)
  - `[VERIFIED]` [SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md) (`skills/start/SKILL.md`)
- **Acceptance Criteria**:
  - Automatically indexes all .env* keys, eas.json credentials, host tokens, MCP servers, rules, skills, and hooks into memory-bank/integrationsAndCustomizations.md.
  - Never commits raw secret literals to Git while giving agents 100% visibility into key names and file paths.
  - bin/cli.mjs supports positional target directory and upgrades all installed repositories cleanly under <150 lines.

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
