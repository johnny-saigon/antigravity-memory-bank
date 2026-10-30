---
name: start
description: Context bootstrap workflow run on session start (/start) that automatically executes /clear and /compact pre-flight first before loading the Memory Bank.
---

# Session Bootstrap (`/start` — Auto-Runs `/clear` & `/compact` First)

Whenever `/start` is executed or a new session begins, **always execute `/clear` (and `/compact` pre-flight checkpointing) FIRST** before bootstrapping the session:

0. **Mandatory Pre-Bootstrap `/clear` & `/compact` Pre-Flight (Run First)**:
   - In a single chained shell call, execute the `/clear` state-checkpoint, backlog render, transcript compaction audit (`--clear`), git status, and backlog check:
     ```bash
     node scripts/sync-memory-context.mjs --quiet && node scripts/backlog.mjs render && node scripts/lint-memory.mjs --clear && git status -s && git log -n 3 --oneline && npm run backlog list
     ```
   - Discard any stale in-thread assumptions from previous tasks so disk state (`memory-bank/*.md` and `docs/backlog.json`) acts as the clean zero-bloat baseline.
   - If `lint-memory.mjs --clear` reports accumulated uncompacted conversation history (`> 25k tokens/turn`), immediately flag **`⚠️ Thread History Detected — Run /compact now (or Cmd/Ctrl+N -> /start)`** at the top of your response (since `/compact` is a native Antigravity chat UI command).
1. **Batch-Read Memory Bank (`1` Turn)**: Batch-read `memory-bank/activeContext.md`, `memory-bank/progress.md`, `memory-bank/integrationsAndCustomizations.md`, `memory-bank/systemPatterns.md`, `memory-bank/infrastructureInvariants.md`, `memory-bank/projectbrief.md`, and `memory-bank/productContext.md` in a single turn (note: in normal turns, these files are progressively disclosed via `.agents/rules/memory-*.md` with `trigger: model_decision` so root `AGENTS.md` stays `< 50 lines`).
2. **Inspect Active Backlog**: Review `docs/backlog.json` to identify `in_progress` tickets, pending Action Items (`waitingOn`), and top `todo` priorities.
3. **Live Health Probe**: If configured, run a non-invasive live health probe against the target service.
4. **Output Concise Status Summary**:
   - **Pre-Start `/clear` & `/compact` Status** (confirm disk state synced & report current thread token footprint)
   - **Current Phase**
   - **Immediate Task**
   - **Proposed Next Step** (including recommended `/effort` level: `low`/`medium` for routine UI/CRUD vs `high` + `/plan` for complex multi-file architecture/bugs)
   - **Credit & Context Controls**: Remind the user to run `/compact` if thread history exceeds `25k` tokens, `/context` to inspect loaded files/rules, `/effort` to match reasoning depth, and `/credits` · `/usage` (with Google One / Antigravity **Overage Toggle disabled**).
