---
name: backlog-plan
description: Structured Antigravity Planning Mode workflow (/backlog-plan FEAT-101 or /backlog-plan) correlated with docs/backlog.json and the Memory Bank. Executes Explore -> Plan -> Review -> Execute across the 3-Artifact Lifecycle (task.md, implementation_plan.md, walkthrough.md).
---

# Backlog-Correlated Planning Mode (`/backlog-plan`)

Triggered when the user invokes `/backlog-plan [TICKET_IDS] [optional_attachments]` (e.g., `/backlog-plan FEAT-101`, `/backlog-plan FEAT-101 @ux-ui.zip`, or `/backlog-plan` in Planning Mode).

Transforms the agent into an autonomous software architect that explores the codebase, maps dependencies, and aligns with the user on a formal architectural blueprint (`task.md` + `implementation_plan.md`) **before** modifying production code, while keeping 100% correlation with `docs/backlog.json` and `memory-bank/*.md`.

---

## Phase 1: Context Discovery, Mandatory Ticket Creation/Splitting & `task.md` Synchronization

1. **Resolve, Create, or Split Target Backlog Ticket(s) & Attachments (Mandatory Transparency Rule)**:
   - **Every `/plan` or `implementation_plan.md` MUST Be Backed by Backlog Ticket(s)**:
     - Extract ticket ID(s) from the prompt. If the user invoked `/plan` or `/backlog-plan` for a new feature, bug fix, or follow-up enhancement that does not yet have an open ticket in `docs/backlog.json` (or if the referenced ticket is already `done`), **immediately create a new ticket** in `docs/backlog.json`:
       ```bash
       npm run backlog add "<Feature or Bug Title>" --type <feature|bug|refactor> --priority <high|medium|low> --desc "<Goal summary>" --components "<file1,file2>"
       ```
     - **Atomic Ticket Splitting (`split` / `--from-plan --split`)**: If the Implementation Plan covers multiple distinct deliverables, phases, or subsystems, **split it into atomic tickets** in `docs/backlog.json` so each deliverable is independently tracked and verifiable on the Review pane Kanban board (`backlog.html`):
       ```bash
       # Split a parent ticket into atomic child tickets:
       npm run backlog split <PARENT_ID> "<Phase 1 Title>" "<Phase 2 Title>"

       # Or auto-ingest & split tickets directly from implementation_plan.md:
       npm run backlog plan --from-plan --split
       ```
   - If any new context files (`.zip` UX/UI bundles, mockups, PDFs, specs) were passed inline, attach and unpack them:
     ```bash
     npm run backlog attach <TICKET_ID> <FILE_PATH>
     npm run backlog unpack <TICKET_ID>
     ```
   - Generate the baseline correlated planning artifacts for the target ticket(s):
     ```bash
     npm run backlog plan <TICKET_ID>
     ```
2. **Targeted Architectural Exploration (`Explore -> Plan`)**:
   - Ingest `AGENTS.md` and `memory-bank/*.md` (`projectbrief.md`, `systemPatterns.md`, `infrastructureInvariants.md`, `integrationsAndCustomizations.md`, `activeContext.md`).
   - Consult the Canonical Living Documentation Hierarchy (`docs/INDEX.md` and `docs/{architecture,design,quality,operations}/`) via `.agents/rules/docs-living-specs.md`.
   - Inspect all existing files listed in `ticket.components`, connected callers, shared schemas, and any unpacked UX/UI assets in `docs/attachments/<TICKET_ID>/extracted/`.
3. **Update `task.md` Live Checklist**:
   - Update `<brainDir>/task.md` and `docs/planning/task.md` with granular sub-tasks grouped into:
     - **1. Context Discovery & Memory Bank Baseline** (`[x]`)
     - **2. Active Sprint & Planning Focus** (`[/]` Research & Architecture Alignment, `[ ]` Component Implementation, `[ ]` Deterministic & Live E2E Verification)
     - **3. Queued Backlog & Next Implementation Wave** (`[ ]`)
     - **4. Completed & Verified Engineering Tasks** (`[x]`)

---

## Phase 2: Drafting `implementation_plan.md` (4-Section Canonical Anatomy)

Draft or refine `<brainDir>/implementation_plan.md` (with `RequestFeedback: true`, `UserFacing: true`) and mirror it to `docs/planning/implementation_plan.md` using the mandatory 4-section structure:

1. **`## 1. Goal Description`**:
   - Concise summary of the problem, user journey, background context from `memory-bank/`, and what the ticket(s) accomplish.
2. **`## 2. User Review Required`**:
   - Highlighted with `> [!IMPORTANT]` or `> [!WARNING]` alerts.
   - Explicitly flag breaking changes, architectural trade-offs, Tier 2 cluster/port/DB invariants, unverified assumptions, or **Live End-to-End Verification credentials** needed before ticket closure.
3. **`## 3. Proposed Changes`**:
   - Group files logically by component/module (dependencies first), correlated to `[<TICKET_ID>]`.
   - Mark every file with `[NEW]`, `[MODIFY]`, or `[DELETE]` using clickable `[filename](file:///absolute/path)` links, plus targeted interface/schema signatures or diffs.
   - Check against scope creep and verify all required config/manifest files (e.g., `package.json`, `Info.plist`, `.env.example`, schema migrations) are included.
4. **`## 4. Verification Plan`**:
   - Concrete, deterministic terminal commands (unit tests, typechecks, linters, build scripts, E2E suites) and live health probes (`curl`) that will be executed automatically during implementation.

---

## Phase 3: Interactive Review, Iteration & Handoff to `/backlog-start`

1. **Request Review & Inline Comment Alignment**:
   - Present the `implementation_plan.md` artifact to the user for review (supporting inline Google Docs-style comments or `/fork` for weighing alternative architectures).
   - If the user leaves inline comments or requests adjustments, re-research the affected constraints and update `implementation_plan.md` and `task.md` in place.
2. **Execution & `walkthrough.md` Closure**:
   - Once the user clicks **Proceed** or triggers `/backlog-start <TICKET_ID>`:
     - Execute the approved plan following [`.agents/skills/backlog-start/SKILL.md`](../backlog-start/SKILL.md).
     - Check off items in `task.md` (`[x]`) in real time as files are modified and verified.
     - Conclude by updating `<brainDir>/walkthrough.md` and `docs/planning/walkthrough.md` with a summary of all changes made and proof of verification, and mark the ticket `done` via `npm run backlog done <TICKET_ID>` (subject to Live End-to-End Verification Rule #4).
