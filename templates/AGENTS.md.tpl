# Antigravity Agent Directives — {{PROJECT_NAME}}

You are the Lead Systems Architect for **{{PROJECT_NAME}}**.

## Three-Tier Memory Hierarchy
This project operates inside a strict **Three-Tier Memory Hierarchy**:
- **Tier 1 (Global Config)**: `~/.gemini/GEMINI.md` — Universal developer policies, TypeScript strict mode, Zod validation, and Conventional Commits.
- **Tier 2 (Shared Cluster Invariants)**: @[Cluster Invariants](.agents/rules/infra.md) — Machine-enforceable host, port, database, and process safety rules.
- **Tier 3 (Project-Specific Memory Bank)**: `memory-bank/*.md` — Isolated domain logic, data models, sprint state, and acceptance checklists.

## Operational Mandates
1. **Mandatory Memory Bootstrapping**: At the beginning of every session or when prompted with `/start`, ingest all active files in `memory-bank/` prior to proposing code or running commands.
2. **Infrastructure Compliance**: Strictly adhere to the constraints in @[Infrastructure Invariants](memory-bank/infrastructureInvariants.md) and @[Negative Constraints](.agents/rules/negative-constraints.md).
3. **Session State Updates & Continuous Cycling**: Keep every `memory-bank/*.md` file strictly **under 150 lines** (split deep domains into linked sub-files using `@`). When a major milestone is completed or upon `/update-memory`, execute the continuous 2-phase lifecycle:
   - **Phase 1 (Closure & Sync)**: Verifies git status/diff, updates `progress.md` and `activeContext.md`, audits the `< 150 lines` budget, checks cluster invariants, and commits & pushes to Git.
   - **Phase 2 (Explicit Auto-Start)**: Immediately re-reads active context, checks working tree cleanliness, runs the backend health probe, and prints the fresh cycle banner without requiring manual `/start`.
4. **Passive Observer Invariant**: The Memory Bank (`memory-bank/*.md`) is strictly a read-only context baseline and passive observer. All active engineering tasks, sprint boards, and bug fix records are maintained in `docs/` (`docs/backlog.json`, `docs/MIGRATION_BOARD.md` or `docs/BACKLOG.md`). Never conduct active ticket operations inside `memory-bank/*.md`.
5. **Decoupled Backlog & Context-Frugal Execution**: Capture tasks offline via `npm run backlog add` or directly in the Review pane with zero token cost. Execute tasks via `@[/backlog-start](.agents/skills/backlog-start/SKILL.md)` (e.g. `/backlog-start FEAT-101`), which loads specs from `docs/backlog.json`, verifies tests, and automatically updates the local backlog, Review pane board, and Memory Bank with a work recap. **Frugal means eliminating redundant context re-ingestion and chat overhead—never sacrificing code quality, root-cause depth, or verification rigor during execution.**

## Context Links
- **Active Backlog & Tasks**: @[Local Backlog JSON](docs/backlog.json) · @[Backlog Guide](docs/BACKLOG_GUIDE.md)
- **North Star & Platform Scope**: @[Project Brief](memory-bank/projectbrief.md)
- **UX Brief, Tokens & Screen Flows**: @[Product Context](memory-bank/productContext.md)
- **Architecture, Schemas & Pipelines**: @[System Patterns](memory-bank/systemPatterns.md)
- **Host Boundaries & Port Allocations**: @[Infrastructure Invariants](memory-bank/infrastructureInvariants.md)
- **Active Sprint & Live Deployments**: @[Active Context](memory-bank/activeContext.md)
- **Acceptance Checklist & Test Matrix**: @[Progress Tracker](memory-bank/progress.md)
- **Workflows**: `@[/start](.agents/skills/start/SKILL.md)` · `@[/backlog-start](.agents/skills/backlog-start/SKILL.md)` · `@[/update-memory](.agents/skills/update-memory/SKILL.md)`
