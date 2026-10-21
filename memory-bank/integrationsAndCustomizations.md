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
- **Workspace Rules (3)**:
  - `.agents/rules/infra.md`: Tier 2: Shared Cluster & Infrastructure Guardrails
  - `.agents/rules/memory-context.md`: antigravity-memory-bank — Extended Memory Bank Context (Auto-Partitioned <24KB Rule Shard #1)
  - `.agents/rules/negative-constraints.md`: Tier 2: Negative Constraints & Execution Deny-List
- **Workspace Skills (4)**:
  - `/backlog-plan` (`.agents/skills/backlog-plan/SKILL.md`): Structured Antigravity Planning Mode workflow (/backlog-plan FEAT-101 or /backlog-plan) correlated with docs/b
  - `/backlog-start` (`.agents/skills/backlog-start/SKILL.md`): Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-1
  - `/start` (`.agents/skills/start/SKILL.md`): Context bootstrap workflow run on session start (/start) to load the Memory Bank.
  - `/update-memory` (`.agents/skills/update-memory/SKILL.md`): Memory synchronization workflow triggered via /update-memory or after major milestones.
