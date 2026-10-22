---
trigger: model_decision
description: "Apply whenever configuring ports, databases, Redis caches, process daemons, supervisor/systemd workers, or deployment infrastructure."
---
# Tier 2: Shared Cluster & Infrastructure Guardrails

Machine-enforceable safety contract for **{{PROJECT_NAME}}**:

## 1. Resource Allocations
| Resource | Allocation | Notes |
| :--- | :--- | :--- |
| **Internal Port** | `{{PORT}}` | Strictly allocated service port |
| **Database** | `{{DATABASE_NAME}}` | Isolated schema/database |
| **Cache DB** | `{{CACHE_DB}}` | Redis namespace or dedicated DB |
| **Process Daemon** | `{{DAEMON_NAME}}` | Supervisor or systemd worker |

## 2. Non-Negotiable Safety Rules
1. **Host Isolation**: Never run destructive broad commands (`killall`, `shutdown`, `reboot`).
2. **Process Scope**: Only restart the assigned daemon (`supervisorctl restart {{DAEMON_NAME}}`).
3. **Database Scope**: Never modify or query sibling project databases.
