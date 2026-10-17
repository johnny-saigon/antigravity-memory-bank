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
3. **Session State Updates & Continuous Cycling**: Keep every `memory-bank/*.md` file strictly **under 150 lines** (split deep domains into linked sub-files using `@`). When a major milestone is completed or upon `/update-memory`, synchronize and close the completed cycle, commit to Git, and immediately auto-bootstrap the new session state with a fresh status banner without requiring manual `/start`.

## Context Links
- **North Star & Platform Scope**: @[Project Brief](memory-bank/projectbrief.md)
- **UX Brief, Tokens & Screen Flows**: @[Product Context](memory-bank/productContext.md)
- **Architecture, Schemas & Pipelines**: @[System Patterns](memory-bank/systemPatterns.md)
- **Host Boundaries & Port Allocations**: @[Infrastructure Invariants](memory-bank/infrastructureInvariants.md)
- **Active Sprint & Live Deployments**: @[Active Context](memory-bank/activeContext.md)
- **Acceptance Checklist & Test Matrix**: @[Progress Tracker](memory-bank/progress.md)
- **Workflows**: `@[/start](.agents/skills/start/SKILL.md)` · `@[/update-memory](.agents/skills/update-memory/SKILL.md)`
