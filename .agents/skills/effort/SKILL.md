---
name: effort
description: Throttle or elevate reasoning effort (/effort low, /effort medium, /effort high, /effort xhigh) and output a verbose Quality-to-Credit ROI & AGY Model Picker guide across Google Gemini, External Partner models, and Google Orchestrators.
---

# Reasoning Effort, AGY Model Roster & Quality-to-Credit ROI Controller (`/effort`)

Triggered when the user invokes `/effort [low|medium|high|xhigh|auto]` (or `/effort` with no arguments to auto-recommend based on the active backlog ticket).

1. Persist and inspect the effort profile and verbose Quality-to-Credit ROI matrix in a single command:
   ```bash
   node scripts/lint-memory.mjs --effort <low|medium|high|xhigh|auto>
   ```
2. **Always provide a verbose, educational Quality-to-Credit (`Q/C ROI`) breakdown** synchronized with AGY's 3 deployed model families and 2 separate quota pools:
   - **`low` (`≤ 4 Tool Turns` · Micro-Tasks, CSS/Copy, Config, Docs, Simple CRUD)**:
     - **Planning Economics**: **Skip separate `/plan`** (saves ~50% credits vs. burning a full planning turn on a 2-turn fix). Still capture a 0-token ticket in `backlog.html` if you want release tracking, then run `/backlog-start <ID>` directly.
     - **Best AGY Models**: Google Pool → **Gemini 3.8 Flash (Low/Med)** or **Gemini 4 Hydrogen (Low)** · External Pool → **GPT-OSS 120B (Medium)** or **Claude Sonnet 5.5 (Low)**.
     - **Orchestrator Guardrail**: 🚫 Never use Google Orchestrators here (fan-out wastes 4x–6x credits).
   - **`medium` (`≤ 6 Tool Turns` · Standard Features & Single-Component Bugs — Best Daily Q/C ROI)**:
     - **Planning Economics**: **Create a 0-token backlog ticket first** (`backlog.html` or `npm run backlog add --components ...`) to save ~15k–30k exploratory discovery tokens, then execute directly with `/backlog-start <ID>`.
     - **Best AGY Models**: Google Pool → **Gemini 4 Neon (Medium/High)** or **Gemini 4 Hydrogen (High)** · External Pool → **Claude Sonnet 5.5 (Medium)**.
   - **`high` (`≤ 8 Tool Turns` · Multi-File Features, Schema/OAuth/Infra & P0 Bugs — Two-Stage Split Routing)**:
     - **Planning Economics (Saves 55%–80% Credits)**: **NEVER jump straight into coding.** Spend 1–2 turns in `/backlog-plan <ID>` on a frontier architect model to lock `implementation_plan.md` and split into atomic sub-tickets (`npm run backlog split`), **THEN switch your model picker down** to a workhorse model for `/backlog-start <SUB_ID>`.
     - **Stage A (Plan) Models**: **Gemini 4 Argon (High)** · **Gemini 4 Carbon (High)** · **Claude Opus 5.5 (Med/High)**.
     - **Stage B (Execute) Models**: **Gemini 4 Neon (Med/High)** · **Gemini 4 Carbon (Med)** · **Claude Sonnet 5.5 (Medium)**.
   - **`xhigh` (Deep Single-Module Burst or Multi-Agent Swarm Orchestration)**:
     - **Single-Module Deep Math/State**: **Gemini 4 Neon (XHigh)** or **Gemini 4 Hydrogen (XHigh)**.
     - **Parallel Multi-Subsystem / Cross-Repo Swarms (`>= 5` modules)**: **Orchestrator (Neon / Carbon / Argon)** coordinating workers pinned to **Gemini 3.8 Flash** / **Gemini 4 Neon** — always switch back to Neon/Flash once the swarm completes!
3. **Always Motivate Backlog-First Capture**: If no active ticket exists in `docs/backlog.json`, explicitly encourage the user to capture a 0-token ticket first before coding so the model never wastes turns grepping for scope.
