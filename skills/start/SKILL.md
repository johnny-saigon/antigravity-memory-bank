---
name: start
description: Context bootstrap workflow run on session start (/start) to load the Memory Bank.
---

# Session Bootstrap (`/start`)

When `/start` is executed or a new session begins:
1. Ingest `memory-bank/projectbrief.md`, `memory-bank/productContext.md`, `memory-bank/systemPatterns.md`, `memory-bank/infrastructureInvariants.md`, and `memory-bank/integrationsAndCustomizations.md` to establish architectural, UX, API key, MCP server, and customization invariants.
2. Inspect `memory-bank/activeContext.md` to identify the current sprint stage, production endpoints, and recent decisions.
3. Read `memory-bank/progress.md` to confirm completed features, bug fixes, and outstanding backlog items.
4. Check `git status -s` and the last 3 commit messages (`git log -n 3 --oneline`) to detect recent codebase updates.
5. If configured, run a non-invasive live health probe against the target service.
6. Output a concise 3-bullet status summary:
   - **Current Phase**
   - **Immediate Task**
   - **Proposed Next Step**
