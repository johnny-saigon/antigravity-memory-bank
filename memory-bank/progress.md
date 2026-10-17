# antigravity-memory-bank — Progress Tracker & Acceptance Matrix

## 1. High-Level Milestone Tracking
- [x] Codify Three-Tier Memory Hierarchy and `< 150 lines` token budget linter (`scripts/lint-memory.mjs`)
- [x] Automatically scrape prior conversation transcripts, docs, and git history during initialization (`lib/context-scraper.mjs`)
- [x] Add post-commit hook, CI workflows, and incremental context synchronizer (`scripts/sync-memory-context.mjs`)
- [x] Add decoupled zero-token backlog engine (`scripts/backlog.mjs`), `/backlog-start` skill, and Review pane Kanban (`backlog.html`)
- [x] Adapt existing boards, docs, and bug records into `docs/backlog.json` during `init` and `upgrade` (`lib/backlog-adapter.mjs`)
- [x] Dogfood Three-Tier Memory Bank and Decoupled Backlog inside `antigravity-memory-bank` with strict upstream package isolation (`package.json` `"files"`, `isSelfRepo`, `.gitignore`)

## 2. Test Matrix & Verification Status
- **Test & Line Budget Audit**: `npm test` (`node scripts/lint-memory.mjs`) — 12/12 files passing (`< 150 lines`).
- **Package Whitelist Audit**: `npm pack --dry-run` — excludes `memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`, and `.github/`.
- **Backlog Renderer**: `npm run backlog:render` — synchronizes `docs/BACKLOG.md`, `docs/backlog.html`, and active brain `backlog.html`.

## 3. Active Development & Documentation
- **Active Development Board**: Operational tickets and feature backlogs are managed in `docs/backlog.json` and `docs/BACKLOG.md`.
- **Backlog Workflow Guide**: Documented in `docs/BACKLOG_GUIDE.md`.
