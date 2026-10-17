# Antigravity Memory Bank — Global Rules & Directives

This project operates within the **Three-Tier Memory Hierarchy**:
- **Tier 1 (Global Config)**: `~/.gemini/GEMINI.md` — Universal developer standards, TypeScript strict mode, and Conventional Commits.
- **Tier 2 (Shared Cluster / Infra Invariants)**: `.agents/rules/infra.md` — Machine-enforceable port isolation, database tenancy, and host guardrails.
- **Tier 3 (Project-Specific Memory Bank)**: `memory-bank/*.md` & `AGENTS.md` — Domain logic, architecture models, active sprint state, and acceptance checklists.

## Operational Mandates
1. **Mandatory Memory Bootstrapping**: At the beginning of every session or when prompted with `/start`, ingest all active files in `memory-bank/` before proposing code or running mutations.
2. **Infrastructure Compliance**: Always consult Tier 2 guardrails (`.agents/rules/infra.md`) before altering server bindings, databases, or daemon configurations.
3. **Session State Updates & Continuous Cycling**: Keep every `memory-bank/*.md` file strictly **under 150 lines** (split deep domains into linked sub-files using `@`). When a major milestone completes or upon `/update-memory`, execute the continuous 2-phase lifecycle:
   - **Phase 1 (Closure & Sync)**: Verifies git status/diff, updates `progress.md` and `activeContext.md`, audits the `< 150 lines` budget, checks cluster invariants, and commits & pushes to Git.
   - **Phase 2 (Explicit Auto-Start)**: Immediately re-reads active context, checks working tree cleanliness, runs the backend health probe, and prints the fresh cycle banner without requiring manual `/start`.
4. **Passive Observer Invariant**: The Memory Bank (`memory-bank/*.md`) is strictly a read-only context baseline and passive observer. All active engineering tasks, sprint boards, and bug fix records are maintained in `docs/` (`docs/backlog.json`, `docs/MIGRATION_BOARD.md` or `docs/BACKLOG.md`). Never conduct active ticket operations inside `memory-bank/*.md`.
5. **Decoupled Backlog & Frugal Execution**: Capture tasks offline via `npm run backlog add` or directly in the Review pane with zero token cost. Execute tasks via `@[/backlog-start](.agents/skills/backlog-start/SKILL.md)` (e.g. `/backlog-start FEAT-101`), which loads specs from `docs/backlog.json`, verifies tests, and automatically updates the local backlog, Review pane board, and Memory Bank with a work recap.

## Context Links
- **Active Backlog & Tasks**: `docs/backlog.json` · `docs/BACKLOG_GUIDE.md`
- **North Star & Platform Scope**: `memory-bank/projectbrief.md`
- **UX Brief, Tokens & Screen Flows**: `memory-bank/productContext.md`
- **Architecture, Schemas & Pipelines**: `memory-bank/systemPatterns.md`
- **Host Boundaries & Port Allocations**: `memory-bank/infrastructureInvariants.md`
- **Active Sprint & Live Deployments**: `memory-bank/activeContext.md`
- **Acceptance Checklist & Test Matrix**: `memory-bank/progress.md`
- **Workflows**: `@[/start](.agents/skills/start/SKILL.md)` · `@[/backlog-start](.agents/skills/backlog-start/SKILL.md)` · `@[/update-memory](.agents/skills/update-memory/SKILL.md)`
