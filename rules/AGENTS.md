# Antigravity Memory Bank — Global Rules & Directives

This project operates within the **Three-Tier Memory Hierarchy** (`< 50 lines` root `AGENTS.md` + `trigger: model_decision` progressive disclosure in `.agents/rules/*.md`):
- **Tier 1 (Global Config)**: `~/.gemini/GEMINI.md` (`< 50 lines`) — Universal developer standards, TypeScript strict mode, and Conventional Commits.
- **Tier 2 (Shared Cluster / Infra Invariants)**: `.agents/rules/infra.md` & `negative-constraints.md` (`trigger: model_decision`).
- **Tier 3 (Project-Specific Memory Bank)**: `memory-bank/*.md` (`< 150 lines` each) bridged on-demand via `.agents/rules/memory-*.md`.

## Operational Mandates
1. **Native Progressive Disclosure & `/context` Verification (`< 50 Lines` Root)**: Keep `AGENTS.md` strictly `< 50 lines` with standard markdown links (never `@[...]` inline expansion in `AGENTS.md`, avoiding the Token Bloat Trap). Every `.agents/rules/*.md` file must carry valid snake_case YAML frontmatter (`trigger: model_decision` + `description`, avoiding the Broken Frontmatter & Silent Discard Traps). Run `/context` to inspect active rules and token usage; convert repetitive procedures into Skills (`.agents/skills/`).
2. **Mandatory Memory Bootstrapping & Infrastructure Compliance**: On `/start`, ingest `memory-bank/*.md` and consult `.agents/rules/infra.md` & `.agents/rules/negative-constraints.md`.
3. **On-the-Fly Pertinent Context Registration, Pre-Authenticated Access & Continuous Cycling (`< 150 Lines`)**:
   - **Pre-Authenticated MCP & Customizations Access (Zero Redundant Prompts)**: All MCP servers, host token files (`~/.github_token`, `~/.stripe_token`, `~/.stitch_token`, `~/.ovh_credentials.json`, `~/.meta_credentials.json`, `~/.meta_token`), CLI/OAuth sessions (`~/.azure/`, `~/.linkedin_mcp/`, `~/Library/Application Support/mj/`, `~/.mcp-auth/`), and `.env*` keys marked `✅ AUTHENTICATED` in `memory-bank/integrationsAndCustomizations.md` are pre-authorized (`AGENT_PERMISSION_PRESET_TURBO`). **NEVER redundantly ask the user for API keys, tokens, logins, or permission—invoke `call_mcp_tool` or read indexed credential paths directly.**
   - **Zero-Manual-Step Registration & Lifecycle Hooks**: Immediately distill pertinent architectural decisions, keys, MCPs, or domain rules into `memory-bank/*.md` (`< 150 lines` each). `.agents/hooks.json` (`SessionStart`, `PostToolUse`, `Stop`) and `.git/hooks/post-commit` auto-run `node scripts/sync-memory-context.mjs --quiet`. Upon `/update-memory`, execute Phase 1 (Closure & Sync) then Phase 2 (Auto-Start banner).
4. **Passive Observer Invariant**: `memory-bank/*.md` is strictly a read-only passive observer. Active tickets, sprint boards, and bug records live in `docs/backlog.json` and `docs/BACKLOG.md`.
5. **Decoupled Backlog & Context-Frugal Execution**: Capture tasks/attachments offline (`npm run backlog add/attach/actions` or Review pane `backlog.html`). Execute via `[/backlog-start](.agents/skills/backlog-start/SKILL.md)` (`FEAT-101`), unpacking attachments, running tests, and syncing `docs/backlog.json` + `memory-bank/` without sacrificing quality or verification rigor.
6. **Strict End-to-End Verification Before Closure**: NEVER mark any ticket involving third-party integrations, OAuth providers, or external credentials as `done` until live server credentials are configured and a real end-to-end integration test passes; otherwise keep `in_progress`.
7. **Structured Planning Mode (`Explore → Plan → Execute`) & 3-Artifact Backlog Correlation**: On `/plan` or `[/backlog-plan](.agents/skills/backlog-plan/SKILL.md)`, synchronize `task.md`, `implementation_plan.md`, and `walkthrough.md` in `<brainDir>/` and `docs/planning/` 1-to-1 with `docs/backlog.json`.
8. **Strict Credit & Token Frugality (`≤ 8 Tool Turns per Fix`)**:
   - **Fresh Chat + `/start` (or `/compact`)**: Drops per-turn input context from ~150k to ~8k tokens/turn (~95% cost reduction).
   - **Memory-First Lookup**: Check `memory-bank/activeContext.md` and `docs/backlog.json` before running diagnostics; never re-investigate recorded state.
   - **Never Read `transcript.jsonl` or Sibling Repos**: Strictly forbid reading `.system_generated/logs/transcript*.jsonl` or grepping sibling repos (`BinaryDay`, `SnapCal`, `RemoveBackGround`, `AntigravityRemote`) unless explicitly requested.
   - **Hard Turn Budget (`≤ 8 Tool Turns per Fix`)**: Batch all file reads into 1 turn, all edits into 1–2 turns, and all verification/deployment commands into 1–2 chained shell calls.

## Progressive Disclosure Context & Workflows
- **Memory Bank**: `memory-bank/projectbrief.md` · `memory-bank/productContext.md` · `memory-bank/systemPatterns.md` · `memory-bank/infrastructureInvariants.md` · `memory-bank/integrationsAndCustomizations.md` · `memory-bank/activeContext.md` · `memory-bank/progress.md`
- **Backlog & Planning**: `docs/backlog.json` · `docs/planning/implementation_plan.md` · `docs/planning/task.md` · `docs/planning/walkthrough.md` · `docs/PLANNING_GUIDE.md` · `docs/BACKLOG_GUIDE.md`
- **Skills**: `[/start](.agents/skills/start/SKILL.md)` · `[/backlog-plan](.agents/skills/backlog-plan/SKILL.md)` · `[/backlog-start](.agents/skills/backlog-start/SKILL.md)` · `[/update-memory](.agents/skills/update-memory/SKILL.md)`
