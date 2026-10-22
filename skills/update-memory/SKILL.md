---
name: update-memory
description: Memory synchronization workflow triggered via /update-memory or after major milestones.
---

# Memory Synchronization & Continuous Cycle (`/update-memory`)

When `/update-memory` is triggered or a major milestone/task completes:

### Phase 1: Close & Synchronize Current Session
1. Automatically sync recent git commit history into context drafts:
   ```bash
   node scripts/sync-memory-context.mjs
   ```
2. Review all working branch changes (`git status -s` and `git diff --stat`).
3. Refresh the Review pane backlog artifacts:
   ```bash
   node scripts/backlog.mjs render
   ```
4. Update `memory-bank/progress.md` and `memory-bank/activeContext.md` as a **passive observer**:
   - Record high-level completed milestones and technical decisions made during this session.
   - Cross-reference active tickets in `docs/backlog.json` and resolved bugs in `docs/BUG_FIX_RECORDS.md` (or `docs/MIGRATION_BOARD.md` / `docs/BACKLOG.md`).
   - **Do NOT** conduct active ticket management or task tracking inside `memory-bank/*.md`.
5. Verify that every file in `memory-bank/*.md` remains strictly **under 150 lines**:
   ```bash
   node scripts/lint-memory.mjs
   ```
   If any file approaches 150 lines, split deeper domain sections into a dedicated `memory-bank/<topic>.md` file and link via `@[Topic](memory-bank/<topic>.md)`.
6. Verify that no Tier 2 infrastructure invariants (`.agents/rules/infra.md`) were violated.
7. Commit and push memory updates to Git with a conventional commit message (e.g. `docs(memory-bank): sync session state and close milestone`).

### Phase 2: Explicit Auto-Start & New Session Initialization
Immediately after closing the previous session, initialize the new working cycle without requiring the user to invoke `/start` manually:
8. Re-anchor context by re-reading `memory-bank/activeContext.md` and `memory-bank/progress.md` to identify the next priority tasks.
9. Check working tree cleanliness (`git status -s`) and head commit (`git log -n 1 --oneline`).
10. Run a live non-invasive health check if a health endpoint is configured.
11. Explicitly output the new active session status banner to the user:
    - 🟢 **New Session Cycle Initialized**
    - **Current Phase**: [Current project phase from activeContext.md]
    - **Immediate Focus**: [Top pending task / feature / bug in progress]
    - **Proposed Next Action**: [Concrete first step ready for execution + recommended `/effort` tier & `/plan` gate]
    - **💡 Credit Hygiene**: Run `/clear` (or `/compact`) now to prune completed session history, `/context` to inspect active rules, `/effort` to throttle reasoning on routine tasks, and `/credits` · `/usage` (with the Google One / Antigravity **Overage Toggle disabled**).
