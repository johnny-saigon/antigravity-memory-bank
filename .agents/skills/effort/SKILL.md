---
name: effort
description: Throttle or elevate reasoning effort (/effort low, /effort medium, /effort high) and tool-turn budget to match task complexity and save credits.
---

# Reasoning Effort & Turn-Budget Controller (`/effort`)

Triggered when the user invokes `/effort [low|medium|high]` (or `/effort` with no arguments to auto-recommend based on the active backlog ticket).

1. Persist and inspect the effort profile in a single command:
   ```bash
   node scripts/lint-memory.mjs --effort <low|medium|high|auto>
   ```
2. Strictly enforce the selected effort tier for all subsequent turns in the session:
   - **`low` (`≤ 4 Tool Turns` · Boilerplate UI, Copy, CSS, Simple CRUD)**:
     - Zero subagent spawning; batch all reads into 1 turn and edits into 1 turn; keep responses ultra-concise.
     - Recommend selecting **Gemini Flash** in the Antigravity model picker for minimum credit burn.
   - **`medium` (`≤ 6 Tool Turns` · Standard Feature Tickets & Single-Component Bugs)**:
     - Standard Memory-First lookup (`activeContext.md` + `docs/backlog.json`), targeted component edits, and deterministic unit test verification.
   - **`high` (`≤ 8 Tool Turns` · Complex State, Concurrency, Multi-Service Architecture & P0 Bugs)**:
     - Mandatory `/plan` (`/backlog-plan`) gate before modifying production files, full root-cause analysis, and end-to-end verification.
     - Recommend **Gemini Pro / Claude Sonnet** in the Antigravity model picker.
