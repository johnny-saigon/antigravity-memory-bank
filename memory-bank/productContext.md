# antigravity-memory-bank — Product Context & User Experience

## 1. User Personas & Core Journeys
- **Primary Persona**: AI-native engineer using Antigravity IDE across multiple repositories who wants persistent architectural context and zero-token task management.
- **Core Flows**:
  1. **Bootstrap / Upgrade**: Run `npx github:johnny-saigon/antigravity-memory-bank init` (or `upgrade`) to scrape git history, docs, and transcripts into `memory-bank/` and adapt existing boards into `docs/backlog.json`.
  2. **Zero-Token Task Capture**: Add/prioritize tickets via `npm run backlog` or the interactive `backlog.html` Kanban board in the Antigravity Review pane.
  3. **Frugal Execution**: Trigger `/backlog-start <ID>` to execute a ticket, run tests, and auto-sync both `docs/backlog.json` and `memory-bank/`.
  4. **Continuous Session Cycling**: Run `/update-memory` to close the current milestone and immediately auto-bootstrap the next session banner.

## 2. Design Tokens & Visual Hierarchy (`backlog.html`)
- **Theme**: Dark glassmorphic Kanban board (`#0b0f19` background, `#111827` cards) rendered into both `<appDataDir>/brain/<cid>/backlog.html` and `docs/backlog.html`.
- **Feedback Loops**: Instant search/filter, one-click `/backlog-start <ID>` prompt copy, and inline modal task creation with WebSocket/FileSystem Access API persistence.
