# Antigravity Planning Mode & Backlog Correlation Guide

In Antigravity, **Planning Mode** transforms the agent from an immediate code generator into an autonomous software architect that explores your codebase, maps out dependencies, and aligns with you on an architectural blueprint *before* touching a single production file.

Every project initialized or upgraded with `antigravity-memory-bank` automatically correlates **Planning Mode** with your **Local Backlog (`docs/backlog.json`)** and **Three-Tier Memory Bank (`memory-bank/*.md`)**.

---

## 1. How the Planning Mode Workflow Operates

When you trigger Planning Mode (by selecting **Planning** in the mode picker, pressing **`Cmd/Ctrl + .`** or **`Shift + Tab`**, typing **`/plan`**, or invoking **`/backlog-plan <TICKET_ID>`**), Antigravity moves through a structured **3-Artifact Lifecycle** stored inside its session brain (`~/.gemini/antigravity/brain/<session-id>/`) and mirrored in `docs/planning/`:

1. **Context Discovery & `task.md` Creation:**
   The agent reads your project rules (`GEMINI.md` and `AGENTS.md`), ingests `memory-bank/*.md` and `docs/backlog.json`, and updates **`task.md`**—a live checklist broken into task groups (Discovery, Active Sprint Execution, Queued Backlog, and Completed Tasks) correlated 1-to-1 with your backlog ticket IDs.
2. **Drafting `implementation_plan.md`:**
   Instead of writing code right away, the agent compiles its findings into a formal design document (`implementation_plan.md`). When Artifact Review Policy is set to **Request Review** (or `RequestFeedback: true`), the agent pauses execution and presents the plan with a **Proceed** button.
3. **Interactive Review & Iteration:**
   You review the plan, highlight specific lines to leave **Google Docs-style inline comments**, or reply in chat. The agent re-enters Planning Mode, researches any new constraints you pointed out, and updates `implementation_plan.md`.
4. **Execution & `walkthrough.md`:**
   Once you click **Proceed** (or run `/backlog-start <TICKET_ID>`), the agent switches to Execution Mode, checks off items in `task.md` in real time as it modifies files, runs verification tests, updates `docs/backlog.json`, and concludes by updating **`walkthrough.md`**—a summary of all changes made and proof of verification.

---

## 2. Anatomy of an `implementation_plan.md`

| Section | What the Agent Puts Here | What You Should Check |
| :--- | :--- | :--- |
| **1. Goal Description** | A concise summary of the problem, background context from `memory-bank/`, and what the backlog ticket(s) accomplish. | Verify the agent understood your core user journey and architectural constraints. |
| **2. User Review Required** | Highlighted with `IMPORTANT` or `WARNING` callouts. Lists breaking changes, Tier 2 cluster invariants, live E2E credential requirements, or open questions. | **Read this first.** If the agent had to guess on an App Group name, API payload format, or third-party credential, it flags it here. |
| **3. Proposed Changes** | Files grouped logically by component/module (dependencies first), marked with `[NEW]`, `[MODIFY]`, or `[DELETE]`, correlated to backlog ticket IDs (`[FEAT-xxx]`). | Check for scope creep (files the agent shouldn't touch) or missing edge cases (e.g., `Info.plist`, entitlements, `.env.example`). |
| **4. Verification Plan** | Concrete terminal commands (unit tests, build scripts, health probes) and manual/live E2E testing steps the agent will run after coding. | Ensure the build/test commands match your actual local and production environment. |

---

## 3. Correlated Backlog & Planning CLI Commands

All planning artifacts are pre-populated and kept synchronized with `docs/backlog.json` at **0 AI token cost**:

```bash
# Focus implementation_plan.md and task.md on a specific backlog ticket (and copy /backlog-plan <ID>)
npm run backlog plan FEAT-101

# Refresh all Review pane Kanban & 3 Planning Mode artifacts (task.md, implementation_plan.md, walkthrough.md)
npm run backlog render
```

You can also click **"📐 Plan"** directly on any ticket card inside the **`backlog.html` Review Pane Kanban Board** to focus `implementation_plan.md` on that ticket and copy `/backlog-plan <ID>`.

---

## 4. Best Practices for Planning Mode

1. **Separate Exploration from Planning on Unfamiliar Code (`Explore → Plan → Execute`)**:
   - **Step 1 (Explore)**: *"Explain how image uploads and deep links are currently routed in `@src/`."*
   - **Step 2 (Plan)**: Run `/plan` or `/backlog-plan <ID>`. The resulting `implementation_plan.md` will be grounded in your actual architecture.
2. **Anchor Context with `@`-Mentions, Visuals & `.zip` Bundles**:
   - Use `@file` or `@directory` in your prompt or attach UX/UI `.zip` bundles via `npm run backlog attach <ID> <path>` (or the `📎` button in `backlog.html`).
3. **Use Inline Artifact Comments Instead of Long Chat Replies**:
   - Open `implementation_plan.md` (`Ctrl+R` or click in the Review panel), highlight the exact file path or function signature, and attach an inline comment.
4. **Enforce a Strict Verification Loop in the Plan**:
   - Verify Section 4 (`Verification Plan`) contains concrete terminal commands (`npm test`, `pytest`, `xcodebuild`, live `curl` probes) and enforces **Strict End-to-End Verification Before Closure** for any external integration or OAuth ticket.
5. **Bake Recurring Constraints into `GEMINI.md` or `AGENTS.md`**:
   - Persistent architectural or domain rules belong in `AGENTS.md` and `memory-bank/*.md` so every future `implementation_plan.md` honours them automatically.
6. **Use `/fork` When Weighing Two Architectural Approaches**:
   - Run `/fork` from your approved baseline thread to test an alternative implementation without polluting your main session, and `/resume` to return if needed.
