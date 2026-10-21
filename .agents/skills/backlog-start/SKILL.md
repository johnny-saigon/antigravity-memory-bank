---
name: backlog-start
description: Automated, frugal execution of backlog tickets (e.g. /backlog-start FEAT-101 or /backlog-start FEAT-101, BUG-102). Ingests specifications and any attached context files (such as UX/UI .zip bundles, mockups, or specs) from docs/backlog.json or the chat prompt, executes targeted changes, verifies tests, and automatically updates the local backlog, Review pane board, and Memory Bank with a complete work recap.
---

# Backlog Sprint Execution (`/backlog-start`)

Triggered when the user invokes `/backlog-start <TICKET_IDS> [optional_attachments]` (e.g., `/backlog-start FEAT-101`, `/backlog-start FEAT-101 @ux-ui.zip`, or `/backlog-start FEAT-101, BUG-102`).

Execute the following 3 phases autonomously:

---

## Phase 1: Ingestion, Attachment Unpacking & Task Activation (0 Token Waste)

1. **Parse Ticket IDs & Inline Attachments**:
   - Extract the ticket ID(s) from the command argument (e.g. `FEAT-101`, `BUG-102`).
   - Detect any files attached directly in the user's message (`@[...]` mentions, uploaded media/files in the prompt, or file paths such as `~/Downloads/ux-ui.zip` passed alongside the command).
   - If any new file paths were passed inline in the prompt, attach them to the ticket so they are tracked and unpacked:
     ```bash
     npm run backlog attach <TICKET_ID> <FILE_PATH>
     ```
   - If no ticket ID is provided, read `docs/backlog.json`, list the top pending `todo` tickets, and prompt the user to choose.
2. **Ingest Specification & Unpack Attached Context (`.zip` UX/UI Bundles, Images, Specs)**:
   - Read `docs/backlog.json` to retrieve the task `title`, `description`, `spec`, `components`, `acceptanceCriteria`, and `attachments`.
   - If the ticket has `attachments` in `docs/backlog.json`, files in `docs/attachments/<TICKET_ID>/`, or files attached in the conversation prompt:
     - Run the automated unpacker to extract any `.zip`, `.tar.gz`, or `.tgz` archives (such as Stitch/Figma UX/UI exports, HTML/Tailwind prototypes, or asset bundles) into `docs/attachments/<TICKET_ID>/extracted/`:
       ```bash
       npm run backlog unpack <TICKET_ID>
       ```
     - Inspect all extracted and attached files before writing code:
       - **UX/UI `.zip` Bundles**: Read extracted design tokens (`DESIGN.md`, `tokens.json`, `tailwind.config.*`, CSS variables), HTML/JSX/TSX markup, and SVG/image assets. View reference screenshots using `view_file` so layout, spacing, typography, states, and color tokens are implemented with 100% visual and structural fidelity.
       - **Direct Attachments (Images, PDFs, Markdown/JSON Specs)**: Read or view each attached file via `view_file` to incorporate all visual and technical requirements.
   - Do **NOT** ask the user to re-explain the task; trust the specification in `docs/backlog.json` and the ingested attachments.
3. **Activate Task Locally & Correlate Planning Artifacts (`task.md` & `implementation_plan.md`)**:
   - Mark the ticket(s) as `in_progress` and synchronize the correlated 3-Artifact Planning Mode files (`task.md`, `implementation_plan.md`, `walkthrough.md`):
     ```bash
     npm run backlog status <TICKET_ID> in_progress
     ```
   - If an approved `implementation_plan.md` exists in `<brainDir>/implementation_plan.md` or `docs/planning/implementation_plan.md`, ingest its **Proposed Changes**, **User Review Required** notes, and **Verification Plan** as the authoritative blueprint.
   - This automatically refreshes the Antigravity Review pane Kanban board (`backlog.html`) and marks `<TICKET_ID>` as `[/]` in `task.md`.
4. **Output Activation Banner**:
   - Output a brief acknowledgment:
     - 🚀 **Backlog Sprint Active**: `[TICKET_ID]: Title`
     - **Target Components**: Files to be modified.
     - **Attached Context**: Any `.zip` UX/UI bundles unpacked or reference files ingested (if present).

---

## Phase 2: Context-Frugal, Uncompromising-Quality Implementation & Verification

> **Core Principle — Frugal on Context, Uncompromising on Quality**:
> Token frugality means eliminating redundant context re-ingestion, multi-turn task repetition, and bloated memory files (`< 150 lines`). It **NEVER** means cutting corners on engineering quality, visual UX/UI fidelity, root-cause analysis, edge-case coverage, type safety, or verification rigor.
> - **Memory-First Lookup**: Always check `memory-bank/activeContext.md` and `docs/backlog.json` before running any diagnostic commands. Never re-investigate what is already recorded in `activeContext.md` or `backlog.json`.
> - **Never Read `transcript.jsonl` or Sibling Repos**: Strictly forbid reading `.system_generated/logs/transcript*.jsonl` or grepping sibling repos (`BinaryDay`, `SnapCal`, `RemoveBackGround`, `AntigravityRemote`) unless explicitly requested for transcript recovery.
> - **Hard Turn Budget (`≤ 8 Tool Turns per Fix`)**: Batch all file reads into 1 turn, all edits into 1–2 turns, and all verification/deployment commands into 1–2 chained shell calls.

1. **Targeted Entry, UX/UI Fidelity & Thorough Dependency Inspection**:
   - Start directly from the `components` listed in the ticket specification (and any unpacked UX/UI reference files in `docs/attachments/<TICKET_ID>/extracted/`) to avoid blind exploratory sweeps across unrelated directories.
   - When a UX/UI archive or mockup is attached, translate its structure, design tokens, responsive layout, and interactive states faithfully into the project's component architecture and styling system.
   - Thoroughly inspect all connected callers, shared schemas, and edge cases needed to ensure a complete, production-grade implementation.
2. **Strict Invariant & Architectural Compliance**:
   - Maintain Tier 2 infrastructure invariants (`.agents/rules/infra.md` and negative constraint deny-lists).
   - Adhere to project architectural standards defined in `memory-bank/systemPatterns.md`.
3. **Rigorous Deterministic Verification**:
   - Run full relevant test suites, linters, and compiler checks to verify all acceptance criteria:
     ```bash
     npm test
     ```
   - Run live health probes against the target service if backend endpoints were touched.
4. **Live End-to-End Verification Before Closure (Non-Negotiable)**:
   - For ANY ticket involving external services, OAuth providers, APIs, or credentials (e.g. Apple, Google, Microsoft, Meta, Resend, Stripe, S3):
     - **NEVER mark the ticket as `done` (`npm run backlog done`) if required credentials, API keys, or provider configurations are missing, unpopulated, or placeholder on the server.**
     - The live end-to-end integration flow and provider HTTP requests must be tested and proven working (e.g. live OAuth authorization redirect reaches the provider with a registered client ID without an error page, and callback/API request executes successfully).
     - If provider credentials or third-party portal setup are required, keep the ticket in `in_progress`, record the exact pending action items (`owner: "user"` vs `owner: "antigravity"`) in `docs/backlog.json` via `npm run backlog actions <TICKET_ID> --waiting "<summary>" --add "<action_item>" --owner user`, provide the user with the exact configuration specifications, and wait for working end-to-end verification before marking `done`.
5. **Mandatory Dual-Test Invariant for Every Bug Fix (`BUG-*`) (Non-Negotiable)**:
   - For ANY bug ticket (`type: "bug"` or `BUG-*`):
     - You MUST create or update **both**:
       1. A **Non-Regression Unit/Component Test** specifically asserting the fixed function, state transition, or UI behavior so the exact regression can never recur silently.
       2. An **End-to-End (E2E) Test** integrating the fix into the live API / full-stack / browser / mobile E2E suite.
     - Record the root cause, fix, Non-Regression test path, and E2E test path in `docs/BUG_FIX_RECORDS.md` (if present) or `docs/backlog.json` before marking the ticket `done`.

---

## Phase 3: Automated Dual-Sync, Git Push & Work Recap

1. **Complete Local Backlog & Synchronize `task.md` / `walkthrough.md` (Only After Live Verification Passes)**:
   - **Guard**: For integration/OAuth/credential tickets, verify Phase 2 Rule 4 is satisfied (live server credentials configured and provider HTTP requests passing) before running `backlog done`. If external credentials are still pending, keep the ticket in `in_progress` and skip `backlog done`.
   - Mark the ticket(s) as completed:
     ```bash
     npm run backlog done <TICKET_ID>
     ```
   - This automatically updates `docs/backlog.json`, project migration boards, the Review pane Kanban board (`backlog.html`), and the correlated Planning Mode artifacts (`task.md` checked off `[x]`, `implementation_plan.md`, and `walkthrough.md` verification summary).
2. **Update Passive Memory Bank**:
   - In `memory-bank/progress.md`, record the completed ticket and update test counts.
   - In `memory-bank/activeContext.md`, add a bullet under accomplishments summarizing the implementation.
   - Run line-budget verification:
     ```bash
     npm run lint:memory
     ```
   - Ensure every file in `memory-bank/*.md` remains strictly **under 150 lines**.
3. **Commit & Push**:
   - Stage and commit with Conventional Commits:
     ```bash
     git add -A && git commit -m "feat(<scope>): implement <TICKET_ID> <brief_title>"
     git push origin main
     ```
4. **User-Friendly Work Recap Banner**:
   - Present a clear, human-readable recap to the user:
     - 🎉 **Sprint Complete**: `[TICKET_ID]: Title`
     - **Key Changes**: 2–3 concise bullet points with clickable file links.
     - **Verification**: Test pass count and status.
     - **Board Status**: Review pane Kanban board updated to `DONE`.
     - **Next Up**: List the next recommended ticket from `docs/backlog.json`.
