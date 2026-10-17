# antigravity-memory-bank — Project Brief & North Star

## 1. Executive Summary & Vision
- **Product Name**: antigravity-memory-bank
- **Tagline**: Production-tested Three-Tier Memory Bank brick, Zero-Token Backlog Engine, and Antigravity Plugin for autonomous AI pair programming.
- **Core Value Proposition**: Prevents context drift, cross-project rule pollution, and token waste by separating global preferences (Tier 1), cluster invariants (Tier 2), and isolated domain memory (Tier 3) alongside a decoupled zero-token local backlog (`docs/backlog.json`).

## 2. Target Platforms & Distribution Scope
- **Platforms**: Node.js CLI (`npx github:johnny-saigon/antigravity-memory-bank`), Antigravity IDE Workspace Plugin & Skills (`/start`, `/backlog-start`, `/update-memory`), Git Hooks & GitHub Actions CI.
- **Primary Audience**: Developers and autonomous AI coding agents working across single or colocated multi-project repositories.

## 3. Key Success Metrics
- **Token Frugalism**: 0 AI tokens spent on task capture/prioritization; `< 150 lines` strictly enforced per memory document.
- **Zero-Restart Activation**: Immediate in-window skill & directive ingestion upon `init` or `upgrade`.
- **Non-Destructive Lifecycle**: 100% preservation of custom `memory-bank/*.md` domain files during `upgrade` and automatic archival prior to `uninstall`.
