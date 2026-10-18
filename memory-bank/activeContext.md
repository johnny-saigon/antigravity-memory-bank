# antigravity-memory-bank — Active Context & Sprint State

## 1. Current Phase & Sprint Objective
- **Last Synchronized Commit**: `5c62ad9` — "fix(backlog): enforce strict 1-to-1 workspace dominance and home-relative path isolation in findTargetBrainDirs" (2026-10-18)
- **Current Phase**: v1.4 Release Hardening & Dogfooding.
- **Sprint Goal**: Dogfood the Three-Tier Memory Bank and Decoupled Zero-Token Backlog Engine directly inside `antigravity-memory-bank` while keeping upstream templates 100% generic.

## 2. Recent Technical Decisions & Accomplishments
1. **fix(backlog): resolve BUG-106 stale `_npx` cache, workspace-dominance brain matching (`findTargetBrainDirs`), server-side card pre-rendering, and 4-layer Kickoff Prompt clipboard + `127.0.0.1:4199` native `pbcopy` bridge**
2. **feat(isolation): implement dogfood isolation architecture (`package.json` `"files"` whitelist, `isSelfRepo` guard in `bin/cli.mjs`, and `.gitignore` ephemeral HTML policy)**
3. **fix(backlog): make backlog engine, review artifacts, and skills fully generic upstream (00ba072)**
4. **fix(backlog): fix findActiveBrainDir scoring/mtime and write docs/backlog.html alongside brain/backlog.html (4adb32c)**
5. **feat(memory): refine update-memory template in cli to reflect passive observer and backlog render (2965ee7)**
6. **feat(upgrade): adapt existing boards, docs, and bug records into decoupled backlog during upgrade (8944a5f)**

## 3. Operational Context & Active Backlog
- **Observer Status**: The Memory Bank acts strictly as a passive context listener and baseline reflector. Active ticket management and development execution are conducted in `docs/backlog.json` and `docs/BACKLOG.md`.
- **Current Focus**: Maintain parity between `scripts/backlog.mjs` and `templates/scripts/backlog.mjs`, and validate `init`/`upgrade` flows across colocated repositories.
