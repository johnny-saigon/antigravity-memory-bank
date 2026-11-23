# Task Checklist — Evolve Save Credits Paradigm for AGY Model Roster & Ticket Quality-to-Credit ROI (`FEAT-125`..`FEAT-127`)

## 1. Context Discovery & Live AGY Model Catalog Audit
- [x] Inspect current Save Credits & Stop-the-Credit-Bleed implementation in [lint-memory.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/lint-memory.mjs), [backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs), and `.agents/skills/{effort,credits,usage,context,clear,start,backlog-plan,backlog-start}/SKILL.md`
- [x] Query live deployed Antigravity (AGY) model roster & quota pools (`27` model/effort variants across **Google Gemini 3.8/4**, **Google Orchestrators**, and **External Claude 5.5 / GPT-OSS 120B**)
- [x] Draft correlated 4-section architectural blueprint in [implementation_plan.md](file:///Users/jbb/.gemini/antigravity/brain/d222142b-b47b-4025-801b-a66363a5c9ab/implementation_plan.md) with atomic ticket decomposition (`FEAT-125`, `FEAT-126`, `FEAT-127`)

## 2. Completed Sprint Tasks (`FEAT-125`..`FEAT-127`)
- [x] **[FEAT-125] Verbose AGY Model Roster, Quota-Pool & Ticket Quality-to-Credit ROI Engine (`scripts/lint-memory.mjs`)**
  - [x] Added all 3 AGY Model Families (`Google Gemini 3.8/4`, `External Claude 5.5 / GPT-OSS 120B`, `Google Orchestrators`) + `xhigh` effort tier
  - [x] Implemented `analyzeTicketCreditStrategy()` with Two-Stage Split Model Routing, Dual Quota-Pool balancing, and Backlog-First / Separate-Planning economics
  - [x] Added `--advise [TICKET_ID]` and upgraded `--effort`, `--credits`, and `--usage`
- [x] **[FEAT-126] Interactive Kanban Credit-Saving & AGY Model Advisor UI + CLI (`scripts/backlog.mjs` & `templates/scripts/backlog.mjs`)**
  - [x] Added per-card AGY Model & Credit ROI strip, interactive `💰 Save Credits & Models` modal, Quick-Add live ROI preview, and `npm run backlog advise [ID]` CLI
  - [x] Synced byte-identical parity between [scripts/backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/scripts/backlog.mjs) and [templates/scripts/backlog.mjs](file:///Users/jbb/Documents/antigravity-memory-bank/templates/scripts/backlog.mjs) (`230,092` bytes)
- [x] **[FEAT-127] Verbose Credit-Saving Skills, Prescriptive Footer, Living Guides & Cross-Repo Rollout**
  - [x] Upgraded `skills/{effort,credits,usage,start,backlog-plan,backlog-start}/SKILL.md` (and `.agents/skills/` parity pairs), [AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/AGENTS.md), [templates/AGENTS.md.tpl](file:///Users/jbb/Documents/antigravity-memory-bank/templates/AGENTS.md.tpl), [rules/AGENTS.md](file:///Users/jbb/Documents/antigravity-memory-bank/rules/AGENTS.md), [docs/BACKLOG_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/BACKLOG_GUIDE.md), and [docs/PLANNING_GUIDE.md](file:///Users/jbb/Documents/antigravity-memory-bank/docs/PLANNING_GUIDE.md)
  - [x] Verified `npm test` (`16/16` tests, `25/25` memory/rule files, `14/14` template parity pairs, `0` violations) and rolled out `upgrade` across installed Memory Bank instances
