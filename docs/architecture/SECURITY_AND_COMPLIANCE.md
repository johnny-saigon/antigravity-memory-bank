<!-- antigravity-doc-sync -->
# 🔐 antigravity-memory-bank — Security, Auth & Compliance (`docs/architecture/SECURITY_AND_COMPLIANCE.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Memory Baseline**: [`memory-bank/integrationsAndCustomizations.md`](../../memory-bank/integrationsAndCustomizations.md) · [`.agents/rules/negative-constraints.md`](../../.agents/rules/negative-constraints.md)

## 1. Authentication, OAuth 2.0 / OIDC & Session Security
- **Secret Hygiene**: Raw `.env*` secrets, private keys (`*.p8`, `*.pem`), and bearer tokens MUST NEVER be committed to Git.
- **External Boundary Validation**: All external API payloads and OAuth callbacks must be validated before persistence.
- **Account Deletion & Privacy Compliance**:
  - **Apple App Store Guideline `5.1.1(v)`**: Revoke Apple OAuth tokens via `https://appleid.apple.com/auth/revoke` upon account deletion.
  - **Meta / Facebook GDPR Compliance**: Verify `signed_request` HMAC-SHA256 payloads on the data-deletion callback endpoint.

---

## 2. Environment Variable & Credential Contract (Secrets Masked)

<!-- ag-section:security-env:start -->
_Progressive scaffold: automatically synchronized from `.env*` and brick contracts with secret literals redacted._
<!-- ag-section:security-env:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-security:start -->
<!-- harvested-repo-context:start -->
### Harvested Repository & Memory-Bank Context

- **From [`memory-bank/integrationsAndCustomizations.md`](../../memory-bank/integrationsAndCustomizations.md) (Memory Bank Baseline)**:
  - **Workspace Root**: `~/Documents/antigravity-memory-bank` · **Git Remote**: `https://github.com/johnny-saigon/antigravity-memory-bank.git` (`main`)
  - **Directory Layout**: `lib/`, `bin/`, `scripts/`, `docs/`, `templates/`, `memory-bank/`, `.agents/`
  - **Pre-Authenticated Host Token & CLI Stores**: `~/.github_token` (GitHub PAT ✅) · `~/.stripe_token` (Stripe API ✅) · `~/.stitch_token` (Google Stitch ✅) · `~/.ovh_credentials.json` (OVHcloud API ✅) · `~/.meta_credentials.json` (Meta Graph & App ✅) · `~/.meta_token` (Meta Business Token ✅) · `~/.azure/azureProfile.json` (Azure & Entra CLI ✅) · `~/.linkedin_mcp/account_identity.json` (LinkedIn Session ✅) · `~/Library/Application Support/mj/config.json` (Midjourney Profile ✅) · `~/.mcp-auth/mcp-remote-v1` (MCP OAuth2 Cache ✅)
  - **Workspace `.env` Files**: None detected (uses pre-authenticated host stores & `~/.gemini/config/mcp_config.json`).
  - **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`

- **From [`README.md`](../../README.md) (## 📏 Token Efficiency & The 150-Line Budget)**:
  Large context dumps degrade LLM reasoning and balloon context consumption. Every document in `memory-bank/` must stay **under 150 lines**.
  Run the built-in linter anytime:
  ```bash
  npm run lint:memory
  ```
  When a topic expands, split it into a linked sub-file:
  ```markdown
  @[Vision Taxonomy](memory-bank/visionTaxonomy.md)

- **From [`README.md`](../../README.md) (## 📋 4. Decoupled Zero-Token Backlog Engine & Review Pane Integration)**:
  Capturing backlog ideas, organizing sprints, or updating task statuses through conversational LLM prompts consumes **15,000 to 35,000 prompt tokens** per interaction (due to system instructions, memory files, tool definitions, and chat history).
  The **Antigravity Memory Bank** decouples **task capture** from **agent execution**, saving up to **90% of AI credits**:
  ```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                        1. OFFLINE CAPTURE (0 TOKENS)                   │
  │                                                                        │
  │   • Local CLI: npm run backlog add "..."                               │
  │   • Direct Edit: docs/backlog.json                                     │
<!-- harvested-repo-context:end -->
<!-- ag-section:legacy-security:end -->
