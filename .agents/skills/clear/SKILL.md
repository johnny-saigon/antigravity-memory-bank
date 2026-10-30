---
name: clear
description: Persist current session state to memory-bank/*.md and docs/backlog.json and prepare a clean zero-bloat context reset (/clear). Also executed automatically as Step 0 whenever /start is invoked.
---

# Session State Checkpoint & Context Reset (`/clear`)

When the user invokes `/clear` (or automatically as **Step 0** whenever `/start` is executed):
1. In a single chained shell call, synchronize all latest git commits, session accomplishments, and backlog artifacts into `memory-bank/*.md` and `docs/backlog.json`, and run the context footprint check:
   ```bash
   node scripts/sync-memory-context.mjs --quiet && node scripts/backlog.mjs render && node scripts/lint-memory.mjs --clear
   ```
2. Output a concise **🧹 Session Checkpointed & Ready for Context Reset** banner:
   - **Saved State**: Confirm `memory-bank/activeContext.md`, `memory-bank/progress.md`, and `docs/backlog.json` are 100% up to date on disk.
   - **Immediate Action to Prune Chat History**:
     1. **In-Place Compression**: Type **`/compact`** (built-in Antigravity chat command) to compress this thread's history immediately, **OR**
     2. **Fresh Zero-Bloat Thread (`~95%` token reduction)**: Click **New Conversation** (`Cmd/Ctrl + N`) in the left sidebar and type **`/start`** (which automatically runs `/clear` & `/compact` pre-flight first) to resume from the ~8k-token Memory Bank baseline.
