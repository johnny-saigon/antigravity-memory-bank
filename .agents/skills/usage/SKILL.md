---
name: usage
description: Analyze session token usage, active brain transcript growth, tool-turn efficiency, and model tier recommendations (/usage).
---

# Session Token & Model Usage Analyzer (`/usage`)

When the user invokes `/usage`:
1. Run the deterministic zero-token usage & session telemetry report in a single shell call:
   ```bash
   node scripts/lint-memory.mjs --usage
   ```
2. Present the usage breakdown to the user:
   - **Active Brain Session Telemetry**: Current conversation ID, active post-`/start` delta byte size and estimated per-turn token load, plus total preserved archive size on disk (`transcript.jsonl` 100% retained so zero history is ever lost).
   - **Active Effort Profile & Model Tiering**: Current `/effort` setting (`low` / `medium` / `high`), recommended model tier, and tool-turn budget (`≤ 8` turns/fix).
   - **Recommended Immediate Action**: Continue working normally when active delta is `< 25k` tokens, run `/start` after completing a sub-task to checkpoint state and reset the delta watermark, or run `/compact` if active delta overflows `> 25k` tokens mid-task.
