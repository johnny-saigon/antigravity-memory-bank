# antigravity-memory-bank — API Keys, MCP Configs & Customizations

> **Agent Lookup Directive**: Raw secret literals are stored in the local git-ignored `.env*` and `~/.gemini/` files indexed below (never committed in plaintext to Git). Read the referenced source file or invoke the corresponding MCP server when executing tasks.

## 1. Environment Files, API Keys & Credentials Inventory
- **Workspace `.env` Files**: None detected (uses host environment & `~/.gemini/config/mcp_config.json`).

## 2. Active MCP Servers (`~/.gemini/config/mcp_config.json`)
- No MCP servers detected in `~/.gemini/config/mcp_config.json` or `.mcp.json`.

## 3. Antigravity Customizations (Rules, Skills, Hooks & Policies)
- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`
- **Workspace Rules (2)**:
  - `.agents/rules/infra.md`: Tier 2: Shared Cluster & Infrastructure Guardrails
  - `.agents/rules/negative-constraints.md`: Tier 2: Negative Constraints & Execution Deny-List
- **Workspace Skills (3)**:
  - `/backlog-start` (`.agents/skills/backlog-start/SKILL.md`): Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-1
  - `/start` (`.agents/skills/start/SKILL.md`): Context bootstrap workflow run on session start (/start) to load the Memory Bank.
  - `/update-memory` (`.agents/skills/update-memory/SKILL.md`): Memory synchronization workflow triggered via /update-memory or after major milestones.
