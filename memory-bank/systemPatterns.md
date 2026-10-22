# antigravity-memory-bank — System Patterns & Technical Architecture

## 1. Technology Stack
- **Runtime & Language**: Node.js (`>=18.0.0`) Pure ES Modules (`.mjs`) with zero external npm runtime dependencies.
- **CLI Entrypoint**: `bin/cli.mjs` (`antigravity-memory`, `agy-memory`) supporting `init`, `upgrade`, `sync`, `export`, and `uninstall`.
- **Core Libraries**:
  - `lib/context-scraper.mjs`: Scrapes git commits, markdown docs, and Antigravity `transcript.jsonl` logs.
  - `lib/backlog-adapter.mjs`: Discovers and migrates existing markdown boards (`MIGRATION_BOARD.md`, `BACKLOG.md`, `BUG_FIX_RECORDS.md`) into `docs/backlog.json`.
- **Scripts & Automation**: `scripts/backlog.mjs` (local CRUD + HTML/MD renderer + live HTTP bridge), `scripts/sync-memory-context.mjs`, and `scripts/lint-memory.mjs`.

## 2. Key Architecture Patterns
- **Native Progressive Disclosure (`< 50 Lines` Root & `model_decision` Rules)**: Root `AGENTS.md` and `~/.gemini/GEMINI.md` are kept strictly `< 50 lines` without `@[...]` inline bloat (defeating the **Token Bloat Trap**). All `.agents/rules/*.md` files (`infra.md`, `negative-constraints.md`, `memory-architecture.md`, `memory-integrations.md`, `memory-sprint-context.md`) sit at the top level of `.agents/rules/` (or are indexed in `.agents/rules.json`, defeating the **Silent Discard Trap**) and carry valid snake_case YAML frontmatter (`trigger: model_decision` + `description`, defeating the **Broken Frontmatter Trap**). Verify active rules and token budgets anytime via `/context`.
- **Passive Observer Invariant**: `memory-bank/*.md` is strictly a passive context baseline; active ticket tracking lives in `docs/backlog.json` and `docs/BACKLOG.md`.
- **Dual-Sync Template Discipline**: Changes to `scripts/backlog.mjs` and `scripts/sync-memory-context.mjs` must stay byte-identical with `templates/scripts/` so downstream `init`/`upgrade` consumers receive identical capabilities.
- **Active Brain Discovery**: `findActiveBrainDir()` scores `<appDataDir>/brain/<cid>` directories by workspace path references and active `transcript.jsonl` mtime.
