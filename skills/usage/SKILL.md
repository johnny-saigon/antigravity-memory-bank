---
name: usage
description: Analyze session token usage, active brain transcript growth, tool-turn efficiency, Dual Quota-Pool strategy, and verbose AGY model tier recommendations (/usage).
---

# Session Token, Quota-Pool & AGY Model Usage Analyzer (`/usage`)

When the user invokes `/usage`:
1. Run the deterministic zero-token usage & AGY model ROI telemetry report in a single shell call:
   ```bash
   node scripts/lint-memory.mjs --usage
   ```
2. Present the verbose usage & Quality-to-Credit breakdown to the user:
   - **Active Brain Session Telemetry**: Current conversation ID, active post-`/start` delta byte size and estimated per-turn token load, plus total preserved archive size on disk (`transcript.jsonl` 100% retained so zero history is ever lost).
   - **Active Effort Profile & 3-Family AGY Model Prescription**: Current `/effort` setting (`low` / `medium` / `high` / `xhigh`), tool-turn budget (`≤ 4 / 6 / 8` turns), exact Google Gemini vs. External Partner vs. Google Orchestrator fit for the active backlog ticket, and whether **Two-Stage Split Model Routing** (`/backlog-plan` -> switch model down -> `/backlog-start`) applies.
   - **Backlog-First Check**: If no ticket is active, motivate the user to capture a 0-token backlog ticket in `backlog.html` or `npm run backlog add` before coding.
   - **Recommended Immediate Action**: Continue working normally when active delta is `< 25k` tokens, run `/start` after completing a sub-task to checkpoint state and reset the delta watermark, or run `/compact` if active delta overflows `> 25k` tokens mid-task.
