# antigravity-memory-bank — Bug Fix & Upstream Trickle-Up Records

This document records root-cause analyses and resolutions for bugs discovered while installing, upgrading, and dogfooding `antigravity-memory-bank` across downstream projects and this upstream repository. Synchronized with [`docs/backlog.json`](backlog.json).

---

### BUG-101: Preserve Existing Curated Notes Non-Destructively in `sync-memory-context.mjs`
- **Status:** Completed (`DONE`) · **Commit:** `91dcb31`
- **Origin:** Trickled up from downstream project commit synchronization.
- **Component:** `scripts/sync-memory-context.mjs`
- **Root Cause:** Auto-syncing git commits overwrote manually curated notes inside `memory-bank/activeContext.md` and `memory-bank/progress.md`.
- **Resolution:** Updated `sync-memory-context.mjs` to prepend new `feat:` / `fix:` commits non-destructively above existing bullets while deduplicating by short commit hash.

---

### BUG-102: Bypass `post-commit` Hook During Git Rebase, Cherry-Pick & Merge
- **Status:** Completed (`DONE`) · **Commit:** `35cebe7`
- **Origin:** Trickled up during interactive git rebase across colocated repositories.
- **Component:** `templates/git/hooks/post-commit.tpl`
- **Root Cause:** `.git/hooks/post-commit` executed `sync-memory-context.mjs` during `git rebase`, modifying `memory-bank/*.md` mid-rebase and halting rebase progression.
- **Resolution:** Added guards in `post-commit.tpl` checking `.git/rebase-merge`, `.git/rebase-apply`, `.git/MERGE_HEAD`, and `.git/CHERRY_PICK_HEAD` to exit early during history rewrites.

---

### BUG-103: Fix Active Brain Directory Discovery & Always Render `docs/backlog.html`
- **Status:** Completed (`DONE`) · **Commit:** `4adb32c`
- **Origin:** Trickled up when `backlog.html` did not appear after running `npm run memory:upgrade` in downstream projects.
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`
- **Root Cause:** `findActiveBrainDir()` checked directory `stat.mtimeMs` (which does not update on macOS/Linux when `.system_generated/logs/transcript.jsonl` is appended to) and skipped brain directories that did not already contain `backlog.html` or `task.md`.
- **Resolution:** Updated `findActiveBrainDir()` to score brain directories by workspace path matches inside `transcript.jsonl`, use `transcript.jsonl` `mtimeMs` for recency, and always write `docs/backlog.html` in the workspace alongside `<brainDir>/backlog.html`.

---

### BUG-104: Remove Downstream Project Names & Private Host IPs from Upstream Templates
- **Status:** Completed (`DONE`) · **Commit:** `00ba072`
- **Origin:** Trickled up after upstreaming the backlog engine from a downstream project.
- **Components:** `scripts/backlog.mjs`, `templates/scripts/backlog.mjs`, `skills/backlog-start/SKILL.md`, `skills/update-memory/SKILL.md`, `rules/AGENTS.md`, `bin/cli.mjs`
- **Root Cause:** Hardcoded `SnapCal` titles, example component paths, and Vast.ai host IPs remained inside upstream templates and skills.
- **Resolution:** Replaced hardcoded project names with dynamic resolution from `docs/backlog.json` / `path.basename(ROOT)`, removed private host IPs from `bin/cli.mjs` and skills, and added upstream genericness rules to `rules/AGENTS.md`.

---

### BUG-105: Prevent `MILESTONE-*` Items from Being Re-Imported as Duplicate Feature Tasks
- **Status:** Completed (`DONE`) · **Commit:** `e312abc`
- **Origin:** Discovered while dogfooding `upgrade` inside `antigravity-memory-bank`.
- **Component:** `lib/backlog-adapter.mjs`
- **Root Cause:** `checklistItemRegex` in `lib/backlog-adapter.mjs` matched `- [x] **MILESTONE-1**: ...` in `docs/BACKLOG.md` and imported it as a feature task in addition to a milestone.
- **Resolution:** Excluded `MILESTONE-*` IDs and `existingMilestoneIds` from `sectionRegex` and `checklistItemRegex` task loops so repeated upgrades are 100% idempotent.
