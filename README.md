# Antigravity Memory Bank 🧠

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/johnny-saigon/antigravity-memory-bank/actions/workflows/ci.yml/badge.svg)](https://github.com/johnny-saigon/antigravity-memory-bank/actions)

A production-tested **Three-Tier Memory Bank** brick and **Antigravity Plugin** for autonomous, context-aware AI pair programming.

Eliminates context drift, prevents cross-database contamination, enforces token limits (< 150 lines per document), and enables continuous session cycling without manual restarts.

---

## 🏛️ The Three-Tier Memory Architecture

```mermaid
flowchart TD
  subgraph T1["Tier 1: Global Developer Standard (~/.gemini/GEMINI.md)"]
    G1["Conventional Commits • TypeScript Strict Mode • Zod Contracts"]
  end

  subgraph T2["Tier 2: Cluster & Infrastructure Guardrails (.agents/rules/infra.md)"]
    G2["Port Isolation • Multi-Tenant DB Partitioning • GPU VRAM Exclusivity • Deny-Lists"]
  end

  subgraph T3["Tier 3: Project Domain Memory Bank (memory-bank/*.md)"]
    G3["projectbrief.md • productContext.md • systemPatterns.md • activeContext.md • progress.md"]
  end

  T1 --> T2 --> T3
```

---

## ⚡ Quick Start

### Option 1: Scaffold into any Project via `npx`
Run the interactive initializer inside your target project root:

```bash
npx https://github.com/johnny-saigon/antigravity-memory-bank init
```

Or with standard npm:
```bash
npx antigravity-memory-bank init
```

This automatically scaffolds:
- `memory-bank/*.md` (8 specialized context files)
- `AGENTS.md` (Top-level agent directives)
- `.agents/rules/` (Tier 2 cluster & negative constraints)
- `.agents/skills/` (`/start` and `/update-memory`)
- `scripts/lint-memory.mjs` (Automated line-budget enforcer)

---

### Option 2: Install as an Antigravity Plugin

Clone or install directly into your workspace's `.agents/plugins/` or global `~/.gemini/config/plugins/`:

```bash
mkdir -p .agents/plugins
git clone https://github.com/johnny-saigon/antigravity-memory-bank.git .agents/plugins/memory-bank
```

Antigravity will automatically detect the plugin manifest:
- **Manifest**: `plugin.json`
- **Bundled Skills**: `/start`, `/update-memory`
- **Bundled Directives**: `rules/AGENTS.md`

---

## 🔄 The Continuous Session Lifecycle

Unlike legacy memory systems that require stopping and manually restarting, this brick uses a **2-Phase Continuous Loop**:

```mermaid
sequenceDiagram
  autonumber
  actor Dev as Developer
  participant Agent as Antigravity Agent
  participant VCS as Git & Remote
  participant Health as Service Health Probe

  Dev->>Agent: /update-memory
  Note over Agent: Phase 1: Closure & Sync
  Agent->>Agent: Review git diff & update progress.md / activeContext.md
  Agent->>Agent: Audit <150 line budget (lint-memory.mjs)
  Agent->>VCS: git commit & push (sync session state)
  
  Note over Agent: Phase 2: Explicit Auto-Start
  Agent->>Agent: Re-anchor context from memory-bank/*.md
  Agent->>Health: Non-invasive curl probe
  Health-->>Agent: HTTP 200 OK
  Agent->>Dev: 🟢 New Session Initialized (Current Phase, Focus, Next Step)
```

---

## 📏 Token Efficiency & The 150-Line Budget

Large context dumps degrade LLM reasoning and balloon context consumption. Every document in `memory-bank/` must stay **under 150 lines**.

Run the built-in linter anytime:
```bash
npm run lint:memory
```

When a topic expands, split it into a linked sub-file:
```markdown
@[Vision Taxonomy](memory-bank/visionTaxonomy.md)
```

---

## 🛠️ Repository Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Lint Memory** | `npm run lint:memory` | Verifies all memory files adhere to the 150-line rule |
| **Test** | `npm test` | Runs validation on templates and manifests |
| **CLI Init** | `node bin/cli.mjs init` | Interactive project setup wizard |

---

## 📄 License
MIT © [johnny-saigon](https://github.com/johnny-saigon)
