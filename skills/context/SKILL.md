---
name: context
description: Audit active Antigravity rules (.agents/rules/*.md), progressive disclosure status, loaded memory-bank files, skills, MCP servers, and per-turn token footprint (/context).
---

# Active Context & Token Footprint Inspector (`/context`)

When the user invokes `/context`:
1. Run the deterministic zero-token context & rule discovery inspector in a single shell call:
   ```bash
   node scripts/lint-memory.mjs --context
   ```
2. Present the output table clearly to the user, highlighting:
   - **Always-On Root Rules (`~/.gemini/GEMINI.md` & `AGENTS.md`)**: Line counts (`< 50` line cap) and per-turn token footprint.
   - **Progressive Disclosure Rules (`.agents/rules/*.md`)**: Each rule file, its `trigger` mode (`model_decision` vs `always_on`), and estimated tokens saved per turn when not triggered.
   - **Memory Bank Files (`memory-bank/*.md`)**: Line counts (`< 150` line cap) and token sizes.
   - **Active Conversation History Footprint**: Estimated per-turn token cost from the current session's `transcript.jsonl` size on disk (without reading the transcript into LLM context) and whether `/compact` or `/clear` is recommended.
