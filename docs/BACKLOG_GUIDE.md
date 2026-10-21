# Zero-Token Decoupled Backlog Guide 📋

This guide explains how to maintain, capture, and execute your development backlog with **zero AI token consumption** and **zero quota drain**, while ensuring seamless execution when you decide to kick off a task with Google Antigravity.

---

## 1. Why Decouple Task Capture from Agent Execution?

In standard AI workflows, every interaction with an agent loads the complete prompt context:
- System prompts & agent directives (~2,000–5,000 tokens)
- Memory bank context & rule files (~1,500–10,000 tokens)
- Tool definitions & schemas (~3,000–8,000 tokens)
- Prior conversation history (~5,000–20,000+ tokens)

Capturing a simple task idea or updating a status via chat prompts costs **15,000 to 35,000 tokens** per message, rapidly draining your daily AI quota or API credits for work that should be instantaneous and offline.

### The Decoupled Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. OFFLINE CAPTURE (0 TOKENS)                   │
│                                                                        │
│   • Local CLI: npm run backlog add "New feature"                       │
│   • Direct File Edit: docs/backlog.json                                │
│   • In-Pane Review Form: Click "➕ Quick Capture Task"                  │
│                                                                        │
│   ──► Updates docs/backlog.json & docs/MIGRATION_BOARD.md              │
│   ──► Automatically regenerates Review Pane HTML & MD artifacts       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  2. ANTIGRAVITY REVIEW PANE VIEW                       │
│                                                                        │
│   • Standalone interactive Kanban board (backlog.html)                 │
│   • Live search, priority filters, component tags                      │
│   • 1-Click "Kickoff Prompt" copies ultra-frugal prompt to clipboard   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 3. FRUGAL AGENT EXECUTION (MINIMAL TOKENS)             │
│                                                                        │
│   • Slash Command: /backlog-start <TICKET_ID>                          │
│   • Agent reads local spec file directly (zero chat back-and-forth)    │
│   • Memory bank stays < 150 lines (passive observer)                   │
│   • Local unit tests verify implementation (zero LLM hallucinations)   │
│   • Automated closure, git commit, push & work recap                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Using the Local Backlog CLI (0 Tokens)

All commands execute locally in milliseconds on your machine without making any network requests or AI API calls.

### List All Backlog Tasks
```bash
npm run backlog:list
# Or filter by status or priority:
npm run backlog list todo
npm run backlog list in_progress
npm run backlog list high
```

### Add a New Task or Idea
```bash
# Basic task:
npm run backlog:add "Implement User Profile Settings"

# Detailed task with priority, target components, and UX/UI .zip attachment:
npm run backlog add "Push Notification Action Buttons" \
  --type feature \
  --priority high \
  --desc "Allow snoozing or completing reminders directly from iOS banner" \
  --components "src/notifications.ts,src/services/push.ts" \
  --attach "~/Downloads/ux-ui-export.zip"
```

### Attach UX/UI `.zip` Bundles, Mockups, or Specs to an Existing Ticket
```bash
# Copies the file into docs/attachments/<ID>/ and automatically unpacks .zip/.tar.gz archives:
npm run backlog attach FEAT-101 ~/Downloads/stitch-ux-ui.zip

# Re-unpack or inspect the categorized manifest of extracted design tokens, HTML/TSX markup & visual assets:
npm run backlog unpack FEAT-101
```

### Generate or Focus the 3-Artifact Planning Mode (`task.md`, `implementation_plan.md`, `walkthrough.md`)
```bash
# Synchronize all 3 Planning Mode artifacts in docs/planning/ and the Antigravity session brain (0 tokens):
npm run backlog:plan

# Focus implementation_plan.md and task.md on specific ticket(s) and copy /backlog-plan <ID> to clipboard:
npm run backlog plan FEAT-101
npm run backlog plan FEAT-101, BUG-102
```

### Update Status
```bash
npm run backlog:status FEAT-101 in_progress
npm run backlog:status FEAT-101 done
```

### Plan or Kick Off a Task with Antigravity
```bash
# 1. (Optional) Draft & review the 4-section architectural blueprint in Planning Mode first:
/backlog-plan FEAT-101

# 2. Execute the ticket via Slash Command in Antigravity chat (ingests implementation_plan.md + any attached .zip/files):
/backlog-start FEAT-101

# Or pass a UX/UI .zip or context file directly inline with the command:
/backlog-start FEAT-101 @ux-ui.zip

# Or for multiple tickets in one sprint:
/backlog-start FEAT-101, BUG-102
```

---

## 3. Reading and Updating in the Antigravity Review Pane

Antigravity provides an auxiliary side pane ("Review pane") that renders interactive HTML and Markdown artifacts.

Whenever you run any `npm run backlog` command or click **"Save Task Offline"** inside the Review pane:
1. `scripts/backlog.mjs` updates:
   - `docs/backlog.json` (canonical machine-readable data)
   - `docs/MIGRATION_BOARD.md` or `docs/BACKLOG.md` (human-readable board)
   - `docs/planning/{task.md, implementation_plan.md, walkthrough.md}` (workspace 3-Artifact Planning Mode mirror)
   - `backlog.html`, `backlog-board.md`, `task.md`, `implementation_plan.md`, and `walkthrough.md` in the active conversation brain folder
2. The Antigravity Review pane reflects these updates automatically.

### Features in the Review Pane Board:
- **3-Artifact Planning Lifecycle Bar**: Displays live links and status for `task.md`, `implementation_plan.md`, and `walkthrough.md`, plus a **`🔄 Sync 3 Planning Artifacts`** button.
- **Interactive Kanban Columns**: `To-Do / Backlog`, `In Progress / QA`, and `Completed (Done)`.
- **Live Search & Filter**: Filter instantly by priority (`High`, `Medium`, `Low`) or search keywords.
- **1-Click `📐 Plan` Action**: Tapping **"📐 Plan"** on any card focuses `implementation_plan.md` on that ticket via the local bridge (`127.0.0.1:4199`) and copies `/backlog-plan <ID>` straight to your clipboard.
- **1-Click `🤖 Kickoff Prompt`**: Tapping **"🤖 Kickoff Prompt"** on any card copies `/backlog-start <ID>` straight to your clipboard so you can paste it into Antigravity chat without typing.
- **Interactive `⏳ Action Items` Inspector on `In Progress` Tickets**: Click any **In Progress** ticket (or the **`⏳ Action Items`** button) in `backlog.html` to open the **Action Items & Blocker Inspector Modal**:
  - See at a glance what the ticket is **Waiting On** and which action items belong to **👤 You (User)** vs **🤖 Antigravity**.
  - Click **`🤖 Assign to AGY`** on any action item (or **"Assign All Pending to Antigravity"**) to delegate it and copy the targeted `/backlog-start <ID> — Execute action item: "..."` prompt to your clipboard.
  - Click **`✅ Done by Me`** (or **"I Completed My Actions → Resume in Chat"**) after completing a manual step (such as configuring an OAuth secret or testing a physical device) to check off the item and copy the continuation prompt for Antigravity.
  - Manage action items from the CLI at any time with `npm run backlog actions <ID> [--waiting "<summary>"] [--add "<item>" --owner <user|antigravity>] [--done <index>]`.
- **Quick Capture Form & `📎` File Attachment**: Click **"➕ Quick Capture Task"** at the top of the board to capture ideas directly from the pane, or click **`📎`** on any ticket card to attach UX/UI `.zip` bundles, mockups, or specs.

> See [`docs/PLANNING_GUIDE.md`](PLANNING_GUIDE.md) for the complete Planning Mode (`Explore → Plan → Review → Execute`) user guide.

---

## 4. Context-Frugal, Uncompromising-Quality Execution Protocol

> **Core Principle — Frugal on Context Re-Ingestion, Uncompromising on Engineering Quality**:
> Frugality applies strictly to eliminating redundant context re-ingestion, chat-based ticket management, and bloated memory files (`< 150 lines`). It **NEVER** sacrifices engineering rigor, root-cause analysis, edge-case coverage, or test verification during implementation.

When you are ready to have Antigravity implement a feature or fix a bug:

1. **Call the Slash Command**:
   ```text
   /backlog-start FEAT-101
   ```
2. **How this saves 90% of context overhead without compromising quality**:
   - The agent reads `docs/backlog.json` directly from the local filesystem instead of requiring multi-turn chat repetition.
   - The agent enters directly at the `components` listed in the ticket (avoiding blind full-repo sweeps) while thoroughly inspecting all connected callers, shared contracts, and edge cases.
   - The Memory Bank (`memory-bank/*.md`) remains strictly a passive observer under 150 lines, keeping baseline context lean (~1,500 tokens) so token budget is spent on deep reasoning and high-quality code.
3. **Closing the Cycle Automatically**:
   - The agent completes implementation, runs full verification and test suites, marks the ticket `done` in the local backlog, updates `memory-bank/progress.md`, audits line limits, commits to Git, pushes to origin, and prints a comprehensive Work Recap banner.

