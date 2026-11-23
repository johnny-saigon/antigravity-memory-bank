# Walkthrough — Save Credits & AGY 3-Family Model Quality-to-Credit ROI Evolution (`FEAT-125`..`FEAT-127`)

## 1. Summary of Changes

### [FEAT-125] Verbose AGY Model Roster, Quota-Pool & Ticket Quality-to-Credit ROI Engine
- Updated [scripts/lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs) with the full 27-variant deployed AGY model taxonomy across **3 Model Families** and **2 Independent Quota Pools**:
  1. **Google Gemini Models (Pool 1)**: `Gemini 3.8 Flash (Low/Med/High)`, `Gemini 4 Hydrogen (Low/Med/High/XHigh)`, `Gemini 4 Neon (Low/Med/High/XHigh)`, `Gemini 4 Carbon (Low/Med/High)`, `Gemini 4 Argon (Low/Med/High)`.
  2. **External Partner Models (Pool 2 — Independent Reset Clock)**: `GPT-OSS 120B (Medium)`, `Claude Sonnet 5.5 (Low/Med/High)`, `Claude Opus 5.5 (Low/Med/High)`.
  3. **Google Orchestrators (Pool 1 · Multi-Agent Swarm Coordinators)**: `Orchestrator (Neon)`, `Orchestrator (Carbon)`, `Orchestrator (Argon)` with explicit guardrails against using Orchestrators on 1–3 file tickets.
- Added `xhigh` effort support (`--effort low|medium|high|xhigh|auto`), `--advise [TICKET_ID]`, and verbose **Two-Stage Split Model Routing** & **Backlog-First / Separate-Planning Economics** output across `--effort`, `--credits`, and `--usage`.

### [FEAT-126] Interactive Kanban Credit-Saving & AGY Model Advisor UI + CLI
- Updated [scripts/backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) and mirrored byte-identically to [templates/scripts/backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`230,092` bytes):
  - Added a clickable **💡 Credit & Model ROI Strip** on every open Kanban card in `backlog.html`.
  - Added the **💰 Save Credits & Models** top header button and interactive verbose modal (`#creditAdvisorModal`) with per-ticket Stage A (Plan) vs. Stage B (Execute) model picks, 1-click prompt copy buttons, and the complete 3-Family AGY Model & Dual Quota-Pool matrix.
  - Added a live **Credit-Saving & AGY Model Preview** inside the `+ Quick Capture Task` drawer.
  - Added `npm run backlog advise [TICKET_ID]` and upgraded `npm run backlog prompt <TICKET_ID>` to emit optimal `/effort` prefixes and model recommendations.

### [FEAT-127] Verbose Credit-Saving Skills, Prescriptive Footer & Guides
- Upgraded [skills/effort/SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/effort/SKILL.md), [skills/credits/SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/credits/SKILL.md), [skills/usage/SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/usage/SKILL.md), [skills/start/SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/start/SKILL.md), [skills/backlog-plan/SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-plan/SKILL.md), and [skills/backlog-start/SKILL.md](file:///Users/jbb/Documents/antigravity-memory-bank/skills/backlog-start/SKILL.md) (synced 100% byte-identically to `.agents/skills/`).
- Upgraded [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [templates/AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [rules/AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md) (all strictly `31/50` lines), [docs/BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md), and [docs/PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md).

## 2. Verification Results
- **`npm test`**: Passed **`16/16`** E2E & Brick Contract tests, **`25/25`** memory/rule files, **`14/14`** byte-identical template parity pairs, **`10/10`** canonical living docs, and **`34/34`** backlog tickets (`0` violations).
- **CLI Verification**: Verified `node scripts/backlog.mjs advise FEAT-125` and `node scripts/lint-memory.mjs --effort xhigh` output the full 3-Family AGY model matrix, Dual Quota-Pool guidance, and Two-Stage Split Routing commands.
