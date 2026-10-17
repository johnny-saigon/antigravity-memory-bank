# Tier 2: Shared Cluster & Infrastructure Guardrails

Machine-enforceable safety contract for **antigravity-memory-bank**:

## 1. Resource Allocations
| Resource | Allocation | Notes |
| :--- | :--- | :--- |
| **Internal Port** | `3000` | Strictly allocated service port |
| **Database** | `antigravity_memory_bank` | Isolated schema/database |
| **Cache DB** | `DB 0` | Redis namespace or dedicated DB |
| **Process Daemon** | `antigravity_memory_bank` | Supervisor or systemd worker |

## 2. Non-Negotiable Safety Rules
1. **Host Isolation**: Never run destructive broad commands (`killall`, `shutdown`, `reboot`).
2. **Process Scope**: Only restart the assigned daemon (`supervisorctl restart antigravity_memory_bank`).
3. **Database Scope**: Never modify or query sibling project databases.
