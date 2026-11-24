# antigravity-memory-bank — Repo Paths, API Keys, MCP Auth & Customizations

> **Pre-Authenticated Access & Zero-Prompt Directive**: All MCP servers (`1/1` marked `✅ AUTHENTICATED`), host credential stores, CLI sessions, and customizations below are **already authenticated, active, and pre-authorized** (`AGENT_PERMISSION_PRESET_TURBO`). **NEVER redundantly ask the user for API keys, tokens, logins, or permission, and NEVER pause waiting for access—invoke `call_mcp_tool` or read the indexed credential paths directly.**

## 1. Repository Paths & Workspace Topology
- **Workspace Root**: `~/work/antigravity-memory-bank/antigravity-memory-bank` · **Git Remote**: `https://github.com/johnny-saigon/antigravity-memory-bank` (`main`)
- **Directory Layout**: `lib/`, `bin/`, `scripts/`, `docs/`, `templates/`, `memory-bank/`, `.agents/`
- **Git Worktree Installations (3: 1 Main + 2 Linked)**: Main `[main]` (`~/Documents/antigravity-memory-bank`) · Worktree `[memory_bank_skills]` (`~/.gemini/antigravity/worktrees/antigravity-memory-bank/memory_bank_skills`) · Worktree `[memory_bank_video_plan]` (`~/.gemini/antigravity/worktrees/antigravity-memory-bank/memory_bank_video_plan`)

## 2. Environment Files, API Keys & Host Auth Stores
- **Workspace `.env` Files**: None detected (uses pre-authenticated host stores & `~/.gemini/config/mcp_config.json`).

## 3. Pre-Authenticated MCP Servers (`~/.gemini/config/mcp_config.json`)
| MCP Server | Bridge / Package | Tools | Live Authentication Status & Identity (Pre-Authorized) |
| :--- | :--- | :---: | :--- |
| **`memory-bank`** | `node` | — | ✅ AUTHENTICATED (Local stdio / CLI session ready) |

## 4. Antigravity Customizations, Permissions & Lifecycle Hooks
- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`
- **On-the-Fly Lifecycle Hooks**: Workspace `.agents/hooks.json`: `antigravity-memory-bank` (enabled: SessionStart, PostToolUse, Stop)
- **Workspace Rules (7)**:
  - `.agents/rules/brick-governance.md`: Apply whenever creating, installing, upgrading, or customizing Hexagonal Bricks in bricks/* or src/adapters/* 
  - `.agents/rules/docs-living-specs.md`: Apply whenever designing architecture, inspecting database/API schemas, implementing UI/UX screens or brand to
  - `.agents/rules/infra.md`: Tier 2 Shared Cluster Invariants for projects colocated on Vast.ai (85.10.218.46:44016) — Port allocations, Re
  - `.agents/rules/memory-architecture.md`: Apply when designing features, modifying system architecture, schemas, APIs, UX flows, or checking domain and 
  - `.agents/rules/memory-integrations.md`: Apply whenever calling MCP tools, checking pre-authenticated API keys, .env contracts, OAuth credentials, or w
  - `.agents/rules/memory-sprint-context.md`: Apply when checking active sprint state, recent commits, known pitfalls, backlog status, or milestone progress
  - `.agents/rules/negative-constraints.md`: Apply whenever executing shell commands, managing processes or Docker containers, querying databases, or enfor
- **Workspace Skills (10)**:
  - `/backlog-add` (`.agents/skills/backlog-add/SKILL.md`): Capture and auto-annotate a new backlog ticket strictly into the TO DO column (/backlog-add <idea>) with 0 pla
  - `/backlog-plan` (`.agents/skills/backlog-plan/SKILL.md`): Structured Antigravity Planning Mode workflow (/backlog-plan FEAT-101 or /backlog-plan) correlated with docs/b
  - `/backlog-start` (`.agents/skills/backlog-start/SKILL.md`): Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-1
  - `/clear` (`.agents/skills/clear/SKILL.md`): Persist current session state to memory-bank/*.md and docs/backlog.json and prepare a clean zero-bloat context
  - `/context` (`.agents/skills/context/SKILL.md`): Audit active Antigravity rules (.agents/rules/*.md), progressive disclosure status, loaded memory-bank files, 
  - `/credits` (`.agents/skills/credits/SKILL.md`): Verbose Quality-to-Credit ROI audit inspecting per-turn token drain, Dual Quota-Pool balancing (Google Gemini 
  - `/effort` (`.agents/skills/effort/SKILL.md`): Throttle or elevate reasoning effort (/effort low, /effort medium, /effort high, /effort xhigh) and output a v
  - `/start` (`.agents/skills/start/SKILL.md`): Context bootstrap workflow run on session start (/start) that automatically executes /clear and /compact pre-f
  - `/update-memory` (`.agents/skills/update-memory/SKILL.md`): Memory synchronization workflow triggered via /update-memory or after major milestones.
  - `/usage` (`.agents/skills/usage/SKILL.md`): Analyze session token usage, active brain transcript growth, tool-turn efficiency, Dual Quota-Pool strategy, a
