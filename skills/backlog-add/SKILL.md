---
name: backlog-add
description: Capture and auto-annotate a new backlog ticket strictly into the TO DO column (/backlog-add <idea>) with 0 planning or coding credits burned (<= 2 tool turns, never moves to READY or IN PROGRESS).
---

# Backlog Capture & Auto-Annotation (`/backlog-add` — Strictly `TO DO` Only)

Triggered when the user invokes `/backlog-add <title or idea description>` (or asks to add/capture a new ticket into `TO DO` and only annotate it).

> **Strict State-Machine Invariant (`TO DO` Annotate-Only · `≤ 2` Tool Turns)**:
> - `/backlog-add` **ONLY** creates and annotates the ticket inside the **`TO DO / Backlog`** column (`status: "todo"`).
> - **NEVER** enter Planning Mode (`/plan`), **NEVER** move the ticket to `READY` or `IN PROGRESS`, and **NEVER** modify production source code files during `/backlog-add`.
> - (To create or plan a ticket directly into the **`READY`** column, the user invokes `/backlog-plan` instead; to execute a `READY` ticket into **`IN PROGRESS`**, the user invokes `/backlog-start` or clicks **`💻 Code`** on the Kanban board.)

## Execution Steps (`1–2` Tool Turns Total)

1. **Create & Auto-Annotate the Ticket in `docs/backlog.json` (`status: "todo"`)**:
   - Infer a concise, actionable `title`, normalized `type` (`feature | bug | ux | qa | refactor`), `priority` (`high | medium | low`), any obvious target `components`, and a clear technical `description` from the user's prompt.
   - Run a single shell command to add and auto-annotate the ticket (which automatically runs `autoAnnotateTicket()` to infer codebase `components`, verifiable `acceptanceCriteria`, and `annotations` Credit-ROI metadata, and refreshes `backlog.html`):
     ```bash
     node scripts/backlog.mjs add "<Title>" --type <feature|bug|ux|qa|refactor> --priority <high|medium|low> --desc "<Annotated technical summary>" --components "<comma_separated_files_if_known>" && node scripts/backlog.mjs advise <NEW_ID_OR_AUTO>
     ```
2. **Output Concise `TO DO` Annotation Card & Stop Immediately**:
   - Present a brief summary confirming:
     - 📋 **Captured & Annotated in `TO DO`**: `[<TICKET_ID>] <Title>` (`status: "todo"`, `🏷️ Annotated`)
     - **Inferred Target Components & Acceptance Criteria**: List the auto-annotated files and criteria persisted in [docs/backlog.json](docs/backlog.json).
     - **Credit-Optimal Next Step (When Ready to Plan)**:
       - Click **`📐 Plan`** on `[<TICKET_ID>]` in `backlog.html` (or drag it from **`TO DO` → `READY`**, or type `/backlog-plan <TICKET_ID>`) to pick the best AGY Planning Model (`Gemini 4 Argon/Carbon` or `Claude Opus 5.5` for `3+` file architecture, or `Gemini 4 Neon` for `1–2` file tasks) and promote it to **`READY`**.
