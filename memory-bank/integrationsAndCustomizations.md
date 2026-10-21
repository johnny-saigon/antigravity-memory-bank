# antigravity-memory-bank — Repo Paths, API Keys, MCP Configs & Customizations

> **On-the-Fly Lookup & Sync Directive**: Auto-synchronized via `.agents/hooks.json` (`SessionStart`, `PostToolUse`, `Stop`) and `.git/hooks/post-commit`. Raw secret literals stay in git-ignored `.env*` / `~/.gemini/` files; read the indexed paths or invoke the MCP servers below when executing tasks.

## 1. Repository Paths & Workspace Topology
- **Workspace Root**: `~/Documents/antigravity-memory-bank` · **Git Remote**: `https://github.com/johnny-saigon/antigravity-memory-bank.git` (`main`)
- **Directory Layout**: `lib/`, `bin/`, `scripts/`, `docs/`, `templates/`, `memory-bank/`, `.agents/`

## 2. Environment Files, API Keys & Credentials Inventory
- **Host Token Files**: `~/.github_token` (GitHub PAT) · `~/.stripe_token` (Stripe API Token) · `~/.stitch_token` (Google Stitch Token) · `~/.ovh_credentials.json` (OVHcloud API) · `~/.meta_credentials.json` (Meta Graph API)
- **Workspace `.env` Files**: None detected (uses host environment & `~/.gemini/config/mcp_config.json`).

## 3. Active MCP Servers (`~/.gemini/config/mcp_config.json`)
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
| **`meta_business`** | `~/.gemini/antigravity/bin/meta_business_mcp.cjs` | 18 | Default / CLI auth |
| **`azure-mcp`** | `npx @azure/mcp@latest` | 69 | Default / CLI auth |
| **`entra`** | `~/.gemini/antigravity/bin/entra_mcp.cjs` | 4 | `ENTRA_CREDENTIALS_PATH` -> `~/.entra_credentials.json` |
| **`linkedin`** | `~/.local/bin/linkedin-mcp` | 29 | `LINKEDIN_MCP_DATA_DIR` -> `~/.linkedin_mcp`, `LINKEDIN_BROWSER_EXECUTABLE_PATH` -> `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser` |
| **`midjourney`** | `~/.gemini/antigravity/bin/midjourney_mcp.sh` | 25 | Default / CLI auth |

## 4. Antigravity Customizations & Lifecycle Hooks
- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`
- **Global Agent Policy (`~/.gemini/config/config.json`)**: Preset: `AGENT_PERMISSION_PRESET_TURBO` · Execution: `CASCADE_COMMANDS_AUTO_EXECUTION_EAGER`
- **On-the-Fly Lifecycle Hooks**: Workspace `.agents/hooks.json`: `antigravity-memory-bank` (enabled: SessionStart, PostToolUse, Stop) · Git `.git/hooks/post-commit`: auto-sync enabled · Global `~/.gemini/config/hooks.json`: `antigravity-remote-bridge` (enabled: PreToolUse, PostToolUse, Stop)
- **Workspace Rules (3)**:
  - `.agents/rules/infra.md`: Tier 2: Shared Cluster & Infrastructure Guardrails
  - `.agents/rules/memory-context.md`: antigravity-memory-bank — Extended Memory Bank Context (Auto-Partitioned <24KB Rule Shard)
  - `.agents/rules/negative-constraints.md`: Tier 2: Negative Constraints & Execution Deny-List
- **Workspace Skills (4)**:
  - `/backlog-plan` (`.agents/skills/backlog-plan/SKILL.md`): Structured Antigravity Planning Mode workflow (/backlog-plan FEAT-101 or /backlog-plan) correlated with docs/b
  - `/backlog-start` (`.agents/skills/backlog-start/SKILL.md`): Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-1
  - `/start` (`.agents/skills/start/SKILL.md`): Context bootstrap workflow run on session start (/start) to load the Memory Bank.
  - `/update-memory` (`.agents/skills/update-memory/SKILL.md`): Memory synchronization workflow triggered via /update-memory or after major milestones.
