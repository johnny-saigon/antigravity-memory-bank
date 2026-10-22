---
name: start
description: Context bootstrap workflow run on session start (/start) to load the Memory Bank.
---

# Session Bootstrap (`/start`)

When `/start` is executed or a new session begins:
1. Batch-read `memory-bank/activeContext.md`, `memory-bank/progress.md`, `memory-bank/integrationsAndCustomizations.md`, `memory-bank/systemPatterns.md`, `memory-bank/infrastructureInvariants.md`, `memory-bank/projectbrief.md`, and `memory-bank/productContext.md` in a single turn (note: in normal turns, these files are progressively disclosed via `.agents/rules/memory-*.md` with `trigger: model_decision` so root `AGENTS.md` stays `< 50 lines`).
2. Inspect `docs/backlog.json` to identify `in_progress` tickets, pending Action Items (`waitingOn`), and top `todo` priorities.
3. Check `git status -s` and the last 3 commit messages (`git log -n 3 --oneline`) to detect recent codebase updates.
4. If configured, run a non-invasive live health probe against the target service.
5. Output a concise 3-bullet status summary:
   - **Current Phase**
   - **Immediate Task**
   - **Proposed Next Step**
   *(Tip: Run `/context` anytime in Antigravity to verify active `model_decision` rule files in `.agents/rules/*.md` and inspect per-rule token consumption.)*
