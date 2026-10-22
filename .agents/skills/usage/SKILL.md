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
   - **Active Brain Session Telemetry**: Current conversation ID, `transcript.jsonl` byte size, estimated per-turn token load, and artifact count.
   - **Active Effort Profile & Model Tiering**: Current `/effort` setting (`low` / `medium` / `high`), recommended model tier, and tool-turn budget (`≤ 8` turns/fix).
   - **Recommended Immediate Action**: Whether to continue, run `/compact`, or start a fresh thread + `/start`.
