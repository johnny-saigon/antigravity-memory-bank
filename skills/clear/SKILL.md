---
name: clear
description: Persist current session state to memory-bank/*.md and docs/backlog.json and prepare a clean zero-bloat context reset (/clear). Also executed automatically as Step 0 whenever /start is invoked.
---

# Session State Checkpoint & Context Reset (`/clear`)

When the user invokes `/clear` (or automatically as **Step 0** whenever `/start` is executed):
1. In a single chained shell call, synchronize all latest git commits, session accomplishments, and backlog artifacts into `memory-bank/*.md` and `docs/backlog.json`, and advance the non-destructive delta watermark (`compaction_watermark.json`) while preserving 100% of `transcript.jsonl` on disk:
   ```bash
   node scripts/sync-memory-context.mjs --quiet && node scripts/backlog.mjs render && node scripts/lint-memory.mjs --clear
   ```
2. Output a concise **🧹 Session Checkpointed & Context Delta Reset** banner:
   - **Zero Context or History Lost**: Confirm `memory-bank/activeContext.md`, `memory-bank/progress.md`, and `docs/backlog.json` are 100% synchronized on disk, and 100% of the raw session archive (`transcript.jsonl`) remains intact on disk.
   - **Active Delta Watermark Reset**: Confirm the active post-reset delta counter is reset to `0.0 KB` (`🟢 OPTIMAL < 25k tokens/turn`).
   - **Optional Host UI Compression (Only If Needed)**: Remind the user that running **`/start`** automatically runs this checkpoint and resets the delta watermark, and if mid-task active delta ever overflows `> 25k tokens/turn`, they can type **`/compact`** in the chat UI or open a **New Conversation** (`Cmd/Ctrl + N` -> **`/start`**).
