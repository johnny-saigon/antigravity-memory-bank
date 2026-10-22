---
name: credits
description: Inspect per-turn token drain, session history cost, progressive disclosure savings, and Google One / Antigravity overage protection status (/credits).
---

# Credit Drain & Overage Protection Inspector (`/credits`)

When the user invokes `/credits`:
1. Run the deterministic zero-token credit & token drain analyzer in a single shell call:
   ```bash
   node scripts/lint-memory.mjs --credits
   ```
2. Present the report clearly to the user:
   - **Per-Turn Baseline vs. Progressive Disclosure Savings**: Tokens loaded unconditionally every turn (`GEMINI.md` + `AGENTS.md`) vs. tokens deferred on-demand via `trigger: model_decision` rules in `.agents/rules/*.md`.
   - **Current Conversation History Drain**: Estimated tokens/turn from the active session's `transcript.jsonl` size on disk and whether the session is in the **🟢 Optimal (`< 25k`)**, **🟡 Caution (`25k–75k`)**, or **🔴 Credit Bleed (`> 75k`)** zone.
   - **Overage Hard-Stop Checklist**: Verify that the **Google One / Antigravity "Toggle for overage"** is turned **OFF** so Antigravity stops at the 20x baseline limit instead of burning paid top-up credits.
