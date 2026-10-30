---
name: start
description: Context bootstrap workflow run on session start (/start) that automatically executes /clear and /compact pre-flight first before loading the Memory Bank.
---

# Session Bootstrap (`/start` — Auto-Runs `/clear` & `/compact` First)

Whenever `/start` is executed or a new session begins, **always execute `/clear` (and `/compact` pre-flight checkpointing) FIRST** before bootstrapping the session:

0. **Mandatory Pre-Bootstrap `/clear` & `/compact` Pre-Flight (Run First — Zero Context or History Lost)**:
   - In a single chained shell call, execute the `/clear` state-checkpoint (`sync-memory-context.mjs`), backlog render, non-destructive delta watermark reset (`lint-memory.mjs --clear`), git status, and backlog check:
     ```bash
     node scripts/sync-memory-context.mjs --quiet && node scripts/backlog.mjs render && node scripts/lint-memory.mjs --clear && git status -s && git log -n 3 --oneline && npm run backlog list
     ```
   - All commits, architectural decisions, and ticket updates are persisted into `memory-bank/*.md` and `docs/backlog.json` while keeping 100% of `.system_generated/logs/transcript.jsonl` untouched on disk (zero history is ever deleted or lost) and advancing `compaction_watermark.json` so only post-`/start` delta tokens are measured.
   - If `lint-memory.mjs --clear` reports accumulated uncompacted conversation history (`> 25k tokens/turn`), immediately flag **`⚠️ Thread History Detected — Run /compact now (or Cmd/Ctrl+N -> /start)`** at the top of your response (since `/compact` is a native Antigravity chat UI command).
1. **Batch-Read Memory Bank (`1` Turn)**: Batch-read `memory-bank/activeContext.md`, `memory-bank/progress.md`, `memory-bank/integrationsAndCustomizations.md`, `memory-bank/systemPatterns.md`, `memory-bank/infrastructureInvariants.md`, `memory-bank/projectbrief.md`, and `memory-bank/productContext.md` in a single turn (note: in normal turns, these files are progressively disclosed via `.agents/rules/memory-*.md` with `trigger: model_decision` so root `AGENTS.md` stays `< 50 lines`).
2. **Inspect Active Backlog**: Review `docs/backlog.json` to identify `in_progress` tickets, pending Action Items (`waitingOn`), and top `todo` priorities.
3. **Live Health Probe**: If configured, run a non-invasive live health probe against the target service.
4. **Output Concise Status Summary**:
   - **Pre-Start `/clear` & `/compact` Status** (confirm disk state synced, 100% of session archive preserved on disk, and active post-reset delta watermark at `0 KB`)
   - **Current Phase**
   - **Immediate Task**
   - **Proposed Next Step** (including recommended `/effort` level: `low`/`medium` for routine UI/CRUD vs `high` + `/plan` for complex multi-file architecture/bugs)
   - **Credit & Context Controls**: Remind the user that `/start` automatically checkpoints state and resets the active delta watermark (with `/compact` available if mid-task delta ever overflows `25k` tokens), `/context` inspects loaded files/rules, `/effort` matches reasoning depth, and `/credits` · `/usage` monitor token economics (with Google One / Antigravity **Overage Toggle disabled**).
