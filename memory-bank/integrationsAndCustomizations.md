# antigravity-memory-bank — API Keys, MCP Configs & Customizations

> **Agent Lookup Directive**: Raw secret literals are stored in the local git-ignored `.env*` and `~/.gemini/` files indexed below (never committed in plaintext to Git). Read the referenced source file or invoke the corresponding MCP server when executing tasks.

## 1. Environment Files, API Keys & Credentials Inventory
- **Host Token Files**: `~/.github_token` (GitHub PAT File) · `~/.stripe_token` (Stripe API Token File) · `~/.stitch_token` (Google Stitch Token File) · `~/.ovh_credentials.json` (OVHcloud API Credentials)
- **Workspace `.env` Files**: None detected (uses host environment & `~/.gemini/config/mcp_config.json`).

## 2. Active MCP Servers (`~/.gemini/config/mcp_config.json`)
| MCP Server | Bridge / Package | Tools | Auth & Credential Source |
| :--- | :--- | :---: | :--- |
| **`github`** | `@modelcontextprotocol/server-github` | 26 | `GITHUB_TOKEN_PATH` -> `~/.github_token` |
| **`stitch`** | `~/.gemini/antigravity/bin/stitch_mcp_bridge.cjs` | 15 | `STITCH_TOKEN_PATH` -> `~/.stitch_token` |
| **`resend`** | `npx resend-mcp` | 136 | `RESEND_API_KEY` (`re_***` (configured)) |
| **`cloudflare`** | `npx @cloudflare/mcp-server-cloudflare` (acct `aae01ca564...`) | 89 | `CLOUDFLARE_API_TOKEN` (configured (secret)) |
| **`ovh`** | `~/.gemini/antigravity/bin/ovh_mcp.py` | 8 | `OVH_CREDENTIALS_PATH` -> `~/.ovh_credentials.json` |
| **`stripe`** | `~/.gemini/antigravity/bin/stripe_mcp_bridge.cjs` | 9 | `STRIPE_TOKEN_PATH` -> `~/.stripe_token` |
| **`StitchMCP`** | `npx mcp-remote` (`https://stitch.googleapis.com/mcp`) | 15 | Header `X-Goog-Api-Key` (configured) |
| **`apple`** | `~/.gemini/antigravity/bin/apple_mcp.cjs` | 9 | `ASC_KEY_ID`=`Y9V6TK5R8A`, `ASC_ISSUER_ID`=`c06bde3f-875e-492e-a1fc-235a6f305e3e`, `ASC_PRIVATE_KEY_PATH` -> `credentials/AuthKey_Y9V6TK5R8A.p8` |
| **`meta`** | `~/.gemini/antigravity/bin/meta_mcp.cjs` | 7 | `META_CREDENTIALS_PATH` -> `~/.meta_credentials.json` |

## 3. Antigravity Customizations (Rules, Skills, Hooks & Policies)
- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`
- **Global Agent Policy (`~/.gemini/config/config.json`)**: Preset: `AGENT_PERMISSION_PRESET_TURBO` · Execution: `CASCADE_COMMANDS_AUTO_EXECUTION_EAGER`
- **Global Lifecycle Hooks (`~/.gemini/config/hooks.json`)**: `antigravity-remote-bridge` (enabled: PreToolUse, PostToolUse, Stop)
- **Workspace Rules (2)**:
  - `.agents/rules/infra.md`: Tier 2: Shared Cluster & Infrastructure Guardrails
  - `.agents/rules/negative-constraints.md`: Tier 2: Negative Constraints & Execution Deny-List
- **Workspace Skills (3)**:
  - `/backlog-start` (`.agents/skills/backlog-start/SKILL.md`): Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-1
  - `/start` (`.agents/skills/start/SKILL.md`): Context bootstrap workflow run on session start (/start) to load the Memory Bank.
  - `/update-memory` (`.agents/skills/update-memory/SKILL.md`): Memory synchronization workflow triggered via /update-memory or after major milestones.
