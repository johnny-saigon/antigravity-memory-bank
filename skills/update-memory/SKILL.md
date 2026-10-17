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
3. Update `memory-bank/progress.md` by marking finished acceptance criteria as complete (`[x]`).
4. Update `memory-bank/activeContext.md` with:
   - Technical decisions made during this session.
   - Any modifications to endpoints, database schemas, or client screens.
   - Resolved bugs and closed sprint items.
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
    - **Proposed Next Action**: [Concrete first step ready for execution]
