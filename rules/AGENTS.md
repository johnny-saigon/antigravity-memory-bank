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
