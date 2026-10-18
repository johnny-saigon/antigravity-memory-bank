---
name: update-memory
description: Memory synchronization workflow triggered via /update-memory or after major milestones.
---

# antigravity-memory-bank Memory Synchronization & Continuous Cycle (`/update-memory`)

When `/update-memory` is triggered or a major milestone/task completes:

### Phase 1: Close & Synchronize Current Session
1. Auto-sync recent git commit history, repo paths, API keys, MCP configs & customizations into context:
   ```bash
   node scripts/sync-memory-context.mjs
   ```
2. Review all changes made in the working branch (`git status -s` and `git diff --stat`) and any active production or staging deployments.
3. Refresh the Review pane backlog artifacts:
   ```bash
   node scripts/backlog.mjs render
   ```
4. Update `memory-bank/progress.md` and `memory-bank/activeContext.md` as a **passive observer**:
   - Record high-level completed milestones and technical decisions made during this session.
   - Cross-reference active tickets in `docs/backlog.json` and resolved bugs in `docs/BUG_FIX_RECORDS.md`.
   - **Do NOT** conduct active ticket management or task tracking inside `memory-bank/*.md`.
5. Verify that every file in `memory-bank/*.md` remains strictly **under 150 lines** (per Operational Best Practice #3). If any file approaches 150 lines, split deeper domain sections into a dedicated `memory-bank/<topic>.md` file and link via `@[Topic](memory-bank/<topic>.md)`.
6. Verify that no Tier 2 infrastructure invariants (`.agents/rules/infra.md` and `memory-bank/infrastructureInvariants.md`) were violated or modified without cross-cluster alignment.
7. Commit and push memory updates to Git with a conventional commit message (e.g. `docs(memory-bank): sync session state and close milestone`).

### Phase 2: Explicit Auto-Start & New Session Initialization
Immediately after closing the previous session, initialize the new working cycle without requiring the user to invoke `/start` manually:
8. Re-anchor context by re-reading `memory-bank/activeContext.md` and `memory-bank/progress.md` to identify the next priority tasks.
9. Check working tree cleanliness (`git status -s`) and head commit (`git log -n 1 --oneline`).
10. Run a live non-invasive health check against the production backend:
   ```bash
   curl -s http://localhost:3000/health || true
   ```
11. Explicitly output the new active session status banner to the user:
    - 🟢 **New Session Cycle Initialized**
    - **Current Phase**: [Current project phase from activeContext.md]
    - **Immediate Focus**: [Top pending task / feature / bug in progress]
    - **Proposed Next Action**: [Concrete first step ready for execution]
