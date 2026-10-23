<!-- antigravity-doc-sync -->
# ⚙️ antigravity-memory-bank — Technical Architecture (`docs/architecture/TECHNICAL_ARCHITECTURE.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Memory Baseline**: [`memory-bank/systemPatterns.md`](../../memory-bank/systemPatterns.md) · [`memory-bank/infrastructureInvariants.md`](../../memory-bank/infrastructureInvariants.md)

## 1. Technology Stack & Runtime Matrix

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Frontend / Client** | React / Next.js | Target platforms: Web, iOS, Android & API |
| **Backend / Runtime** | Node.js | Port `3000` (`http://localhost:3000/health`) |
| **Database & Persistence** | PostgreSQL 16 | Isolated per project schema/database |

---

## 2. Repository Archetype, Entrypoints & Route Inventory

<!-- ag-section:api-endpoints:start -->
| Kind | Route / Binary | Source File |
| :--- | :--- | :--- |
| **CLI Binary** | `antigravity-memory` | `./bin/cli.mjs` |
| **CLI Binary** | `agy-memory` | `./bin/cli.mjs` |
<!-- ag-section:api-endpoints:end -->

---

## 3. Database & Schema Inventory

<!-- ag-section:db-schemas:start -->
| Schema / Model File | Path |
| :--- | :--- |
| **`index.ts`** | `bricks/user-profile/core/index.ts` |
| **`account-linking.service.ts (normalizeUserProfile)`** | `bricks/user-profile/core/oauth/account-linking.service.ts` |
| **`apple.verifier.ts`** | `bricks/user-profile/core/oauth/apple.verifier.ts` |
| **`facebook.verifier.ts`** | `bricks/user-profile/core/oauth/facebook.verifier.ts` |
| **`google.verifier.ts`** | `bricks/user-profile/core/oauth/google.verifier.ts` |
| **`microsoft.verifier.ts`** | `bricks/user-profile/core/oauth/microsoft.verifier.ts` |
| **`ports.ts (LinkedSocialAccount, NormalizedUserProfile, UserProfileStoragePort, OAuthProviderPort, SessionTokenPort)`** | `bricks/user-profile/core/ports.ts` |
| **`profile.service.ts`** | `bricks/user-profile/core/profile.service.ts` |
| **`schemas.ts (validateProfileUpdate, validateAndBuildThemeCssVars)`** | `bricks/user-profile/core/schemas.ts` |
| **`001_user_profile_oauth.sql (table users, table oauth_accounts, table sessions)`** | `bricks/user-profile/schemas/001_user_profile_oauth.sql` |
| **`user-profile.prisma (model User, model OAuthAccount, model Session)`** | `bricks/user-profile/schemas/user-profile.prisma` |
<!-- ag-section:db-schemas:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-technical:start -->
<!-- harvested-repo-context:start -->
### Harvested Repository & Memory-Bank Context

- **From [`memory-bank/systemPatterns.md`](../../memory-bank/systemPatterns.md) (Memory Bank Baseline)**:
  - **Runtime & Language**: Node.js (`>=18.0.0`) Pure ES Modules (`.mjs`) with zero external npm runtime dependencies.
  - **CLI Entrypoint**: `bin/cli.mjs` (`antigravity-memory`, `agy-memory`) supporting `init`, `upgrade`, `sync`, `export`, and `uninstall`.
  - **Core Libraries**:
  - **Scripts & Automation**: `scripts/backlog.mjs` (local CRUD + HTML/MD renderer + live HTTP bridge), `scripts/sync-memory-context.mjs`, and `scripts/lint-memory.mjs`.
  - **Native Progressive Disclosure (`< 50 Lines` Root & `model_decision` Rules)**: Root `AGENTS.md` and `~/.gemini/GEMINI.md` are kept strictly `< 50 lines` without `@[...]` inline bloat (defeating the **Token Bloat Trap**). All `.agents/rules/*.md` files (`infra.md`, `negative-constraints.md`, `memory-architecture.md`, `memory-integrations.md`, `memory-sprint-context.md`) sit at the top level of `.agents/rules/` (or are indexed in `.agents/rules.json`, defeating the **Silent Discard Trap**) and carry valid snake_case YAML frontmatter (`trigger: model_decision` + `description`, defeating the **Broken Frontmatter Trap**). Verify active rules and token budgets anytime via `/context`.

- **From [`memory-bank/infrastructureInvariants.md`](../../memory-bank/infrastructureInvariants.md) (Memory Bank Baseline)**:
  - **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
  - **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
  - **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.
  - **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).
  - **Self-Repository Guard (`isSelfRepo`)**: `bin/cli.mjs` detects when running inside `antigravity-memory-bank` itself to prevent self-overwriting or deleting upstream scripts in `scripts/`.

- **From [`README.md`](../../README.md) (## ⚡ 3. How to Use the Installer)**:
  ### A. On-the-Fly Installation in Existing Projects (Active Antigravity Window)
  If you are already working inside an active Antigravity session on an existing project (e.g. **`BinaryDay`**, **`RemoveBackGround`**, or any local repository connected to GitHub), you can activate the Memory Bank instantly with **zero IDE restart**:
  #### Why It Works on the Fly:
  Antigravity dynamically ingests workspace rules (`AGENTS.md`, `.agents/rules/`) and workspace skills (`.agents/skills/start`, `.agents/skills/update-memory`) as soon as they appear in the project root.
  - **Immediate in-chat activation**: Run the command in your terminal or prompt the agent to execute it, and you can invoke `/start` immediately in the same conversation!
  - **Non-destructive**: Preserves any existing custom `AGENTS.md` guidelines while injecting the Memory Bank links and rules.
  - **Git synchronization**: When `--commit` is passed, automatically stages and commits the memory baseline to Git, ready to `git push origin main` to GitHub.
  ---

- **From [`README.md`](../../README.md) (## 📦 4. Context Export & Clean Deinstallation)**:
  ### A. Exporting Project Memory & Context
  You can export the entire project memory bank at any time into a human-readable consolidated snapshot and a compressed raw backup archive:
  Outputs generated in `./memory-backups/`:
  1. **Consolidated Markdown** (`memory-bank-export-YYYYMMDD-HHmmss.md`): Single consolidated document containing a table of contents, timestamps, and full text of all memory-bank files, rules, and skills. Ideal for sharing with external models, code review, or pasting into team wikis.
  2. **Compressed Archive** (`memory-bank-backup-YYYYMMDD-HHmmss.tar.gz`): Bit-for-bit compressed tarball of `memory-bank/`, `AGENTS.md`, and `.agents/` for instant restoration anytime.
  ---
  ### B. Clean Deinstallation (Zero Context Loss)
  To completely remove the Memory Bank from a project while **guaranteeing that all project memory is preserved**:

- **From [`README.md`](../../README.md) (## 📄 License)**:
  MIT © [johnny-saigon](https://github.com/johnny-saigon)
<!-- harvested-repo-context:end -->
<!-- ag-section:legacy-technical:end -->
