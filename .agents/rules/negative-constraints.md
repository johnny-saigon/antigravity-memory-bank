---
trigger: model_decision
description: "Apply whenever executing shell commands, managing processes or Docker containers, querying databases, or enforcing the <= 8 tool turns credit and token frugality budget."
---
# Tier 2: Negative Constraints & Execution Deny-List

When generating code, scripts, or executing shell commands in **antigravity-memory-bank**:

1. **Host Stability**:
   - NEVER execute `killall`, `shutdown`, `reboot`, or `systemctl stop`.
   - Only restart the designated worker for this application.
2. **Container Boundaries**:
   - NEVER start unprivileged Docker-in-Docker daemons (`dockerd`) on shared VPS hosts.
3. **Database & Storage Partitioning**:
   - Scoped strictly to allocated databases and storage buckets.
   - Prohibit `FLUSHALL` on shared Redis instances.
4. **Credit & Token Frugality Deny-List**:
   - NEVER read `.system_generated/logs/transcript*.jsonl` or grep sibling repositories (`BinaryDay`, `SnapCal`, `RemoveBackGround`, `AntigravityRemote`) unless explicitly requested for transcript recovery.
   - NEVER re-investigate state already recorded in `memory-bank/activeContext.md` or `docs/backlog.json`.
   - Enforce a **Hard Turn Budget (`≤ 8 Tool Turns per Fix`)**: batch all file reads into 1 turn, all edits into 1–2 turns, and all verification/deployment commands into 1–2 chained shell calls.
