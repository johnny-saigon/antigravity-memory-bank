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
