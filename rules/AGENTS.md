# Antigravity Memory Bank — Global Rules & Directives

This project operates within the **Three-Tier Memory Hierarchy**:
- **Tier 1 (Global Config)**: `~/.gemini/GEMINI.md` — Universal developer standards, TypeScript strict mode, and Conventional Commits.
- **Tier 2 (Shared Cluster / Infra Invariants)**: `.agents/rules/infra.md` — Machine-enforceable port isolation, database tenancy, and host guardrails.
- **Tier 3 (Project-Specific Memory Bank)**: `memory-bank/*.md` & `AGENTS.md` — Domain logic, architecture models, active sprint state, and acceptance checklists.

## Operational Mandates
1. **Mandatory Memory Bootstrapping**: At the beginning of every session or when prompted with `/start`, ingest all active files in `memory-bank/` before proposing code or running mutations.
2. **Infrastructure Compliance**: Always consult Tier 2 guardrails (`.agents/rules/infra.md`) before altering server bindings, databases, or daemon configurations.
3. **On-the-Fly Pertinent Context Registration & Continuous Cycling (`< 150 Lines`)**:
   - **Zero-Manual-Step On-the-Fly Registration**: Whenever the user provides pertinent architectural decisions, API keys/credentials, MCP configs, customizations, repo paths, or domain rules in a message—or whenever your ensuing work adds/modifies integrations, env keys, skills, rules, schemas, or endpoints—**immediately distill and register the pertinent structured facts** (never raw conversation logs) into the appropriate `memory-bank/*.md` file in the same turn without waiting for manual user commands.
   - **Real-Time Lifecycle Hooks**: `.agents/hooks.json` (`SessionStart`, `PostToolUse`, `Stop`) and `.git/hooks/post-commit` automatically run `node scripts/sync-memory-context.mjs --quiet` on the fly to keep `memory-bank/integrationsAndCustomizations.md`, `activeContext.md`, and `progress.md` synchronized.
   - **Line Budget & 2-Phase Cycling**: Keep every `memory-bank/*.md` file strictly **under 150 lines** (split deep domains into linked sub-files using `@`). When a major milestone completes or upon `/update-memory`, execute Phase 1 (Closure & Sync) followed immediately by Phase 2 (Explicit Auto-Start banner).
4. **Passive Observer Invariant**: The Memory Bank (`memory-bank/*.md`) is strictly a read-only context baseline and passive observer for operational tickets. All active engineering tasks, sprint boards, and bug fix records are maintained in `docs/` (`docs/backlog.json`, `docs/MIGRATION_BOARD.md` or `docs/BACKLOG.md`). Never conduct active ticket operations inside `memory-bank/*.md`.
5. **Decoupled Backlog & Context-Frugal Execution**: Capture tasks and attach context files (such as UX/UI `.zip` bundles, mockups, or specs) offline via `npm run backlog add` / `npm run backlog attach` or directly in the Review pane (`📎`) with zero token cost. Execute tasks via `[/backlog-start](.agents/skills/backlog-start/SKILL.md)` (e.g. `/backlog-start FEAT-101` or `/backlog-start FEAT-101 @ux-ui.zip`), which loads specs from `docs/backlog.json`, automatically unpacks and ingests any attached `.zip`/context files into `docs/attachments/<ID>/extracted/`, verifies tests, and automatically updates the local backlog, Review pane board, and Memory Bank with a work recap. **Frugal means eliminating redundant context re-ingestion and chat overhead—never sacrificing code quality, visual UX/UI fidelity, root-cause depth, or verification rigor during execution.**
6. **Strict End-to-End Verification Before Closure**: NEVER mark any ticket involving third-party integrations, OAuth providers, or external credentials as `done` until live credentials are configured on the server and a real end-to-end integration test passes. If credentials or external setup are pending, the ticket MUST remain `in_progress`.
7. **Structured Planning Mode (`Explore → Plan → Execute`) & 3-Artifact Backlog Correlation**: When Planning Mode is triggered (`/plan`, `Cmd/Ctrl + .`, `Shift + Tab`, or `[/backlog-plan](.agents/skills/backlog-plan/SKILL.md)`), operate through the correlated **3-Artifact Lifecycle** in `<brainDir>/` and `docs/planning/`: (1) `task.md` (live checklist grouped into Discovery, Active Sprint, Queued & Completed tasks synced 1-to-1 with `docs/backlog.json`), (2) `implementation_plan.md` (4-section blueprint: **Goal Description**, **User Review Required** with `IMPORTANT`/`WARNING` alerts, **Proposed Changes** marked `[NEW]`/`[MODIFY]`/`[DELETE]`, and concrete **Verification Plan** commands), and (3) `walkthrough.md` (post-execution summary & verification proof).

## Context Links
- **North Star & Platform Scope**: `memory-bank/projectbrief.md`
- **UX Brief, Tokens & Screen Flows**: `memory-bank/productContext.md`
- **Architecture, Schemas & Pipelines**: `memory-bank/systemPatterns.md`
- **Host Boundaries & Port Allocations**: `memory-bank/infrastructureInvariants.md`
- **Repo Paths, API Keys, MCP & Customizations**: `memory-bank/integrationsAndCustomizations.md`
- **Active Sprint & Live Deployments**: `memory-bank/activeContext.md`
- **Acceptance Checklist & Test Matrix**: `memory-bank/progress.md`
- **Active Backlog & Planning Artifacts**: `docs/backlog.json` · `docs/planning/implementation_plan.md` · `docs/planning/task.md` · `docs/planning/walkthrough.md` · `docs/PLANNING_GUIDE.md` · `docs/BACKLOG_GUIDE.md`
- **Workflows**: `[/start](.agents/skills/start/SKILL.md)` · `[/backlog-plan](.agents/skills/backlog-plan/SKILL.md)` · `[/backlog-start](.agents/skills/backlog-start/SKILL.md)` · `[/update-memory](.agents/skills/update-memory/SKILL.md)`
