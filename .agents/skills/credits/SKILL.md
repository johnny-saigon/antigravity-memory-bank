---
name: credits
description: Verbose Quality-to-Credit ROI audit inspecting per-turn token drain, Dual Quota-Pool balancing (Google Gemini & Orchestrators vs. External Claude/GPT-OSS), Two-Stage Split Model Routing, and overage hard-stop status (/credits).
---

# Verbose Credit Drain, Dual Quota-Pool & AGY Model ROI Inspector (`/credits`)

When the user invokes `/credits`:
1. Run the deterministic zero-token credit & AGY model ROI analyzer in a single shell call:
   ```bash
   node scripts/lint-memory.mjs --credits
   ```
2. Present a **verbose, actionable Quality-to-Used-Credits report** to the user:
   - **Per-Turn Baseline vs. Progressive Disclosure Savings**: Tokens loaded unconditionally every turn (`GEMINI.md` + `AGENTS.md`) vs. tokens deferred on-demand via `trigger: model_decision` rules in `.agents/rules/*.md`.
   - **Active Delta Drain vs. Preserved Session Archive**: Estimated tokens/turn from the **active delta** accumulated since the last `/start` / `/clear` watermark (`🟢 Optimal < 25k`, `🟡 Caution 25k–75k`, or `🔴 Credit Bleed > 75k`), while confirming 100% of `transcript.jsonl` remains safely preserved on disk.
   - **Backlog-First & Separate Planning Credit Economics**: Explicitly tell the user whether creating a 0-token backlog ticket first and separating `/backlog-plan` (Stage A frontier model) from `/backlog-start` (Stage B workhorse model) will save `55%–80%` credits on their current work, or if their task is small enough (`1–2` files) to skip `/plan` and run directly on `Gemini 3.8 Flash` / `Gemini 4 Neon`.
   - **Dual Quota-Pool Balancing & Orchestrator Guardrails**:
     - **Pool 1 (Google Quota)**: `Gemini 3.8 Flash`, `Gemini 4 (Hydrogen / Neon / Carbon / Argon)`, and `Orchestrator (Neon / Carbon / Argon)`.
     - **Pool 2 (External Quota — Independent Reset Clock)**: `Claude Sonnet 5.5`, `Claude Opus 5.5`, and `GPT-OSS 120B (Medium)`.
     - Remind the user to balance between pools before hitting a reset limit, and **never** leave an Orchestrator or Opus 5.5 active for routine single-file edits.
   - **Overage Hard-Stop Checklist**: Verify that the **Google One / Antigravity "Toggle for overage"** is turned **OFF** so Antigravity stops at the 20x baseline limit instead of burning paid top-up credits.
