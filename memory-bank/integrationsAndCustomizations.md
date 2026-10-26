# antigravity-memory-bank — Repo Paths, API Keys, MCP Auth & Customizations

> **Pre-Authenticated Access & Zero-Prompt Directive**: All MCP servers (`15/15` marked `✅ AUTHENTICATED`), host credential stores, CLI sessions, and customizations below are **already authenticated, active, and pre-authorized** (`AGENT_PERMISSION_PRESET_TURBO`). **NEVER redundantly ask the user for API keys, tokens, logins, or permission, and NEVER pause waiting for access—invoke `call_mcp_tool` or read the indexed credential paths directly.**

## 1. Repository Paths & Workspace Topology
- **Workspace Root**: `~/Documents/antigravity-memory-bank` · **Git Remote**: `https://github.com/johnny-saigon/antigravity-memory-bank.git` (`main`)
- **Directory Layout**: `lib/`, `bin/`, `scripts/`, `docs/`, `templates/`, `memory-bank/`, `.agents/`

## 2. Environment Files, API Keys & Host Auth Stores
- **Pre-Authenticated Host Token & CLI Stores**: `~/.github_token` (GitHub PAT ✅) · `~/.stripe_token` (Stripe API ✅) · `~/.stitch_token` (Google Stitch ✅) · `~/.ovh_credentials.json` (OVHcloud API ✅) · `~/.meta_credentials.json` (Meta Graph & App ✅) · `~/.meta_token` (Meta Business Token ✅) · `~/.azure/azureProfile.json` (Azure & Entra CLI ✅) · `~/.linkedin_mcp/account_identity.json` (LinkedIn Session ✅) · `~/Library/Application Support/mj/config.json` (Midjourney Profile ✅) · `~/.mcp-auth/mcp-remote-v1` (MCP OAuth2 Cache ✅)
- **Workspace `.env` Files**: None detected (uses pre-authenticated host stores & `~/.gemini/config/mcp_config.json`).

## 3. Pre-Authenticated MCP Servers (`~/.gemini/config/mcp_config.json`)
| MCP Server | Bridge / Package | Tools | Live Authentication Status & Identity (Pre-Authorized) |
| :--- | :--- | :---: | :--- |
| **`github`** | `@modelcontextprotocol/server-github` | 26 | ✅ AUTHENTICATED (`~/.github_token` PAT verified) |
| **`resend`** | `npx resend-mcp` | 136 | ✅ AUTHENTICATED (`RESEND_API_KEY` (`re_***` (configured)) ready) |
| **`cloudflare`** | `npx @cloudflare/mcp-server-cloudflare` (acct `aae01ca564...`) | 89 | ✅ AUTHENTICATED (`CLOUDFLARE_API_TOKEN` (configured (secret)) ready) |
| **`ovh`** | `~/.gemini/antigravity/bin/ovh_mcp.py` | 8 | ✅ AUTHENTICATED (`~/.ovh_credentials.json` · endpoint `ovh-eu` ready) |
| **`stripe`** | `~/.gemini/antigravity/bin/stripe_mcp_bridge.cjs` | 9 | ✅ AUTHENTICATED (`~/.stripe_token` API key verified) |
| **`apple`** | `~/.gemini/antigravity/bin/apple_mcp.cjs` | 13 | ✅ AUTHENTICATED (Key `Y9V6TK5R8A` · Issuer `c06bde3f...` · `credentials/AuthKey.p8` verified) |
| **`meta`** | `~/.gemini/antigravity/bin/meta_mcp.cjs` | 7 | ✅ AUTHENTICATED (`~/.meta_credentials.json` · App `2199060924286885` (BinaryDay) ready) |
| **`meta_business`** | `~/.gemini/antigravity/bin/meta_business_mcp.cjs` | 18 | ✅ AUTHENTICATED (`~/.meta_token` & `~/.meta_credentials.json` · Biz `1277193594593819` (Design Engineering) ready) |
| **`azure-mcp`** | `npx @azure/mcp@latest` | 71 | ✅ AUTHENTICATED (`~/.azure` CLI session · `snapcal.oauth@hotmail.com` · Tenant `3f3f912a...` ready) |
| **`entra`** | `~/.gemini/antigravity/bin/entra_mcp.cjs` | 4 | ✅ AUTHENTICATED (`az` Graph session `~/.azure` · `snapcal.oauth@hotmail.com` · Tenant `3f3f912a...` ready) |
| **`linkedin`** | `~/.local/bin/linkedin-mcp` | 29 | ✅ AUTHENTICATED (`~/.linkedin_mcp` · `jean-baptiste-bouquet` · browser session ready) |
| **`midjourney`** | `~/.gemini/antigravity/bin/midjourney_mcp.sh` | 25 | ✅ AUTHENTICATED (`~/Library/Application Support/mj` · Camoufox profile & `user_id` ready) |
| **`lucid`** | `npx mcp-remote` (`https://mcp.lucid.app/mcp`) | 34 | ✅ AUTHENTICATED (OAuth2 token cached in `~/.mcp-auth/mcp-remote-v1` ready) |
| **`stitch (jbouquet@gmail.com)`** | `https://stitch.googleapis.com/mcp` | 16 | ✅ AUTHENTICATED (Local stdio / CLI session ready) |
| **`stitch (jbb@avilo.capital)`** | `https://stitch.googleapis.com/mcp` | 16 | ✅ AUTHENTICATED (Local stdio / CLI session ready) |

## 4. Antigravity Customizations, Permissions & Lifecycle Hooks
- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`
- **Global Agent Policy (`~/.gemini/config/config.json`)**: Preset: `AGENT_PERMISSION_PRESET_TURBO` · Execution: `CASCADE_COMMANDS_AUTO_EXECUTION_EAGER` (✅ Pre-Authorized — Do Not Prompt User)
- **On-the-Fly Lifecycle Hooks**: Workspace `.agents/hooks.json`: `antigravity-memory-bank` (enabled: SessionStart, PostToolUse, Stop) · Git `.git/hooks/post-commit`: auto-sync enabled · Global `~/.gemini/config/hooks.json`: `antigravity-remote-bridge` (enabled: PreToolUse, PostToolUse, Stop)
- **Built-in Antigravity Skills (`~/.gemini/antigravity/builtin/skills/`)**: `agy-customizations`, `antigravity_guide`, `automation`, `generative_ui`, `migrate-workflows`, `permissioned-github`, `plugin`, `run-workflow`, `ui-plugin-navigation`
- **Workspace Rules (7)**:
  - `.agents/rules/brick-governance.md`: Apply whenever creating, installing, upgrading, or customizing Hexagonal Bricks in bricks/* or src/adapters/* 
  - `.agents/rules/docs-living-specs.md`: Apply whenever designing architecture, inspecting database/API schemas, implementing UI/UX screens or brand to
  - `.agents/rules/infra.md`: Tier 2 Shared Cluster Invariants for projects colocated on Vast.ai (85.10.218.46:44016) — Port allocations, Re
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
