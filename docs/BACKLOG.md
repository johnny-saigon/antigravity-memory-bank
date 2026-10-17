# Antigravity Memory Bank — Development & Backlog Board

This board tracks active development tickets, feature backlogs, architecture initiatives, and sprint milestones for Antigravity Memory Bank.

---

## 1. Active Feature Backlog

### FEAT-101: Decoupled Zero-Token Backlog Engine & Review Pane Kanban
- **Status:** Completed (`DONE`)
- **Priority:** High
- **Components:** `scripts/backlog.mjs`, `lib/backlog-adapter.mjs`, `skills/backlog-start/SKILL.md`
- **Description:** Provide a local zero-token task store (docs/backlog.json) with automated migration of existing boards and interactive Kanban rendering (backlog.html) in the Antigravity Review pane.
- **Technical Specification:**
  Implement CRUD CLI commands, interactive dark-mode HTML Kanban board with live local save bridge, and /backlog-start autonomous sprint skill.
- **Acceptance Criteria:**
  - [x] Zero-token offline task capture and prioritization.
  - [x] Automatic migration of existing markdown boards during init/upgrade.
  - [x] Interactive backlog.html rendered to both active brain directory and docs/backlog.html.

---

### FEAT-102: Automated E2E CLI Test Suite for init / upgrade / export / uninstall
- **Status:** Backlog (`TODO`)
- **Priority:** Medium
- **Components:** `bin/cli.mjs`, `scripts/lint-memory.mjs`
- **Description:** Add an automated smoke test script that runs init, upgrade, sync, export, and uninstall inside a temporary directory and asserts file integrity.
- **Technical Specification:**
  Create a zero-dependency Node test script using node:test and node:assert that exercises all CLI subcommands against an isolated temp folder.
- **Acceptance Criteria:**
  - [ ] Tests init, upgrade, sync, export, and uninstall in an isolated temp directory.
  - [ ] Verifies custom memory-bank/*.md domain files are 100% preserved across upgrade.
  - [ ] Passes via npm test.

---

## 3. Completed Migration Milestones

- [x] **MILESTONE-1**: v1.4 Zero-Token Backlog Engine & Dogfooding

