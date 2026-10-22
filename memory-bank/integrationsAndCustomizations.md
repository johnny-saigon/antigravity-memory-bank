# antigravity-memory-bank — Repo Paths, API Keys, MCP Auth & Customizations

> **Pre-Authenticated Access & Zero-Prompt Directive**: All MCP servers (`0/0` marked `✅ AUTHENTICATED`), host credential stores, CLI sessions, and customizations below are **already authenticated, active, and pre-authorized** (`AGENT_PERMISSION_PRESET_TURBO`). **NEVER redundantly ask the user for API keys, tokens, logins, or permission, and NEVER pause waiting for access—invoke `call_mcp_tool` or read the indexed credential paths directly.**

## 1. Repository Paths & Workspace Topology
- **Workspace Root**: `~/work/antigravity-memory-bank/antigravity-memory-bank` · **Git Remote**: `https://github.com/johnny-saigon/antigravity-memory-bank` (`main`)
- **Directory Layout**: `lib/`, `bin/`, `scripts/`, `docs/`, `templates/`, `memory-bank/`, `.agents/`

## 2. Environment Files, API Keys & Host Auth Stores
- **Workspace `.env` Files**: None detected (uses pre-authenticated host stores & `~/.gemini/config/mcp_config.json`).

## 3. Pre-Authenticated MCP Servers (`~/.gemini/config/mcp_config.json`)
- No MCP servers detected in `~/.gemini/config/mcp_config.json` or `.mcp.json`.

## 4. Antigravity Customizations, Permissions & Lifecycle Hooks
- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`
- **On-the-Fly Lifecycle Hooks**: Workspace `.agents/hooks.json`: `antigravity-memory-bank` (enabled: SessionStart, PostToolUse, Stop)
- **Workspace Rules (6)**:
  - `.agents/rules/brick-governance.md`: Apply whenever creating, installing, upgrading, or customizing Hexagonal Bricks in bricks/* or src/adapters/* 
  - `.agents/rules/infra.md`: Apply whenever configuring ports, databases, Redis caches, process daemons, supervisor/systemd workers, or dep
  - `.agents/rules/memory-architecture.md`: Apply when designing features, modifying system architecture, schemas, APIs, UX flows, or checking domain and 
  - `.agents/rules/memory-integrations.md`: Apply whenever calling MCP tools, checking pre-authenticated API keys, .env contracts, OAuth credentials, or w
  - `.agents/rules/memory-sprint-context.md`: Apply when checking active sprint state, recent commits, known pitfalls, backlog status, or milestone progress
  - `.agents/rules/negative-constraints.md`: Apply whenever executing shell commands, managing processes or Docker containers, querying databases, or enfor
- **Workspace Skills (9)**:
  - `/backlog-plan` (`.agents/skills/backlog-plan/SKILL.md`): Structured Antigravity Planning Mode workflow (/backlog-plan FEAT-101 or /backlog-plan) correlated with docs/b
  - `/backlog-start` (`.agents/skills/backlog-start/SKILL.md`): Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-1
  - `/clear` (`.agents/skills/clear/SKILL.md`): Persist current session state to memory-bank/*.md and docs/backlog.json and prepare a clean zero-bloat context
  - `/context` (`.agents/skills/context/SKILL.md`): Audit active Antigravity rules (.agents/rules/*.md), progressive disclosure status, loaded memory-bank files, 
  - `/credits` (`.agents/skills/credits/SKILL.md`): Inspect per-turn token drain, session history cost, progressive disclosure savings, and Google One / Antigravi
  - `/effort` (`.agents/skills/effort/SKILL.md`): Throttle or elevate reasoning effort (/effort low, /effort medium, /effort high) and tool-turn budget to match
  - `/start` (`.agents/skills/start/SKILL.md`): Context bootstrap workflow run on session start (/start) to load the Memory Bank.
  - `/update-memory` (`.agents/skills/update-memory/SKILL.md`): Memory synchronization workflow triggered via /update-memory or after major milestones.
  - `/usage` (`.agents/skills/usage/SKILL.md`): Analyze session token usage, active brain transcript growth, tool-turn efficiency, and model tier recommendati
