---
trigger: always_on
description: Tier 2 Shared Cluster Invariants for projects colocated on Vast.ai (85.10.218.46:44016) — Port allocations, Redis DB indexing, Postgres/S3 isolation, Supervisor rules, and cuda:0 GPU exclusivity.
---

# Tier 2: Shared Cluster Invariant Guardrails (`.agents/rules/infra.md`)

This machine-enforceable safety contract applies across all sister projects (**`RemoveBackGround`**, **`BinaryDay`**, and **`SnapCal`**) colocated on the dedicated Vast.ai compute node (`85.10.218.46:44016`, Instance `50951592`).

```
┌────────────────────────────────────────────────────────────────────────┐
│  Tier 1: Global Antigravity Config (~/.gemini/GEMINI.md)               │
│  - User CLI execution policies, formatting standards, git conventions. │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│  Tier 2: Infrastructure Invariant Guardrails (.agents/rules/infra.md)  │
│  - Shared cluster invariants: Port allocations, Redis DB indexing,     │
│    Postgres isolation, and GPU exclusivity on cuda:0.                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│  Tier 3: Project-Specific Memory Bank (memory-bank/)                   │
│  - Isolated domain logic, UX specs, technical stack, data contracts,   │
│    active sprint state, and design tokens.                             │
└────────────────────────────────────────────────────────────────────────┘
```

## 1. Shared Cluster Allocation Matrix (`85.10.218.46:44016`)

| Project | Supervisor Daemon | Internal Port | Caddy Ingress (`:10100` / Ext `:44190`) | Caddy Static Web Root (`frontend/dist`) | PostgreSQL 16 (`:5432`) | Redis 7 (`:6379`) | Garage S3 (`:3900`) | GPU (`cuda:0`) |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **`RemoveBackGround`** | `model_server` | `127.0.0.1:7861` | `/api/*` (`removeback.gd`) | **`/workspace/frontend/dist`**<br>*(symlinked: `/workspace/{dist,web-dist,apps/web/dist}`)* | DB: `removebg`<br>Role: `removebg_user` | **`DB 2`** | `removebg-private` | **100% Dedicated**<br>(RTX 4060 Ti 16GB) |
| **`BinaryDay`** | `binaryday` | `127.0.0.1:4001` | `/binaryday/api/*` (`binaryday.app`) | **`/workspace/binaryday/frontend/dist`**<br>*(symlinked: `.../binaryday/{dist,web-dist,apps/web/dist}`)* | DB: `binaryday`<br>Role: `binaryday_user` | **`DB 0`** | `binaryday-media` | **0 Bytes (Forbidden)** |
| **`SnapCal`** | `snapcal` | `127.0.0.1:4002` | `api.snapcal.io` / `/snapcal/api/*` | **`/workspace/snapcal/frontend/dist`**<br>*(symlinked: `.../snapcal/{dist,web-dist,apps/web/dist}`)* | DB: `snapcal`<br>Role: `snapcal_user` | **`DB 1`** | `snapcal-uploads` | **0 Bytes (Forbidden)** |

### 1.1 Social OAuth Provider & MCP Isolation Matrix (`Google`, `Apple`, `Microsoft`, `Facebook`)

| Provider (Web + Mobile) | `RemoveBackGround` (`/workspace/server/.env`) | `BinaryDay` (`/workspace/binaryday/server/.env`) | `SnapCal` (`/workspace/snapcal/server/.env`) | SnapCal Associated MCP Server(s) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Google OAuth 2.0** | GCP `1048657873522` (`...b7b6rsfr5hbfc57em8ihgt21h7agr2h5`) | GCP `695272256243` (Web `...397v7vh` / iOS `...b1qk3ou`) | **GCP `1077982774821`** (Web `...il4lue0pcqj8rc8ggd82em9t6bcrj6cn` / iOS `...o7bjrjj52oktngnlksi1njhu4mo2129l`) | `cloudflare` + `ovh` (Callback DNS `snapcal.io`) |
| **2. Sign in with Apple** | `gd.removeback.web` / `com.removebackground.app` (`3JG863F5KY`) | `app.binaryday.web` / `com.binaryday.app` | **`io.snapcal.web`** (Web) / **`io.snapcal.iphone`** (iOS ASC `6822819728`, Key `Y9V6TK5R8A`) | **`apple`** (`apple_mcp.cjs` · Key `Y9V6TK5R8A` · `AuthKey_Y9V6TK5R8A.p8`) |
| **3. Microsoft Entra ID** | `c3bc32b0-50f5-41db-86e3-639dbe030312` | `03a33aaf-42c3-4496-9532-9546958d4e07` | **`4a3a43fa-2186-4eab-91de-255649d5c54b`** (Web secret + Mobile PKCE `snapcal://auth/callback`) | **`entra`** (`entra_mcp.cjs`) & **`azure-mcp`** (`~/.azure` `snapcal.oauth@hotmail.com`, Tenant `3f3f912a...`) |
| **4. Facebook (Meta)** | *None* | Meta App `2199060924286885` | **Meta App `1612158530609943`** (Live Mode, Web & Mobile `snapcal://auth/callback`) | **`meta`** (`meta_mcp.cjs`) & **`meta_business`** (`meta_business_mcp.cjs` · `~/.meta_credentials.json`, Biz `1277193594593819`) |

## 2. Non-Negotiable Cluster Safety Rules
1. **GPU Exclusivity on `cuda:0`**:
   - The NVIDIA GeForce RTX 4060 Ti (16 GB VRAM) on `cuda:0` is **100% reserved for `RemoveBackGround`**.
   - `BinaryDay` and `SnapCal` must NEVER import PyTorch, ONNX, or local CUDA runtimes (`0 bytes` VRAM allocation). All AI inference (Gemini 1.5 Flash Vision) must execute over external HTTPS REST APIs.
2. **Database & Cache Isolation**:
   - An agent working in **SnapCal** may ONLY query PostgreSQL database `snapcal` (`snapcal_user`) and Redis **`DB 1`** (`redis://127.0.0.1:6379/1`).
   - Never run `FLUSHALL` on Redis (use `FLUSHDB` only inside DB 1 if explicitly required) and never query or alter sibling PostgreSQL databases (`removebg`, `binaryday`).
3. **Process & Daemon Isolation (Supervisor PID 1)**:
   - Never install or start `dockerd` (Docker-in-Docker causes cgroup kernel panics on Vast.ai).
   - Only restart the current project's Supervisor worker:
     - In SnapCal: `supervisorctl restart snapcal`
     - In BinaryDay: `supervisorctl restart binaryday`
     - In RemoveBackGround: `supervisorctl restart model_server`
   - **NEVER** run `supervisorctl restart all` or restart `postgresql`, `redis`, `garage`, or a sibling project's worker.
4. **Caddy Ingress & Frontend Distribution Path Invariant (`/workspace/caddy/Caddyfile`)**:
   - External traffic enters on port `44190` (mapped to internal port `10100`). When updating `/workspace/caddy/Caddyfile`, preserve all existing `Host` blocks and path handlers (`/binaryday/api/*`, `/snapcal/api/*`, `/api/*`) before running `caddy reload`.
   - **Canonical Static Web Roots (`frontend/dist`)**: Caddy serves static SPA builds strictly from each project's `frontend/dist` directory (`/workspace/frontend/dist` for `RemoveBackGround`, `/workspace/binaryday/frontend/dist` for `BinaryDay`, and `/workspace/snapcal/frontend/dist` for `SnapCal`). Always deploy production web bundles to `.../frontend/dist/` (and keep `dist`, `web-dist`, and `apps/web/dist` symlinked to `frontend/dist` so no build lands in an unserved directory).
