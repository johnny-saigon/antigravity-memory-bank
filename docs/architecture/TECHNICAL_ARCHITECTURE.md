<!-- antigravity-doc-sync -->
# ⚙️ antigravity-memory-bank — Technical Architecture (`docs/architecture/TECHNICAL_ARCHITECTURE.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Memory Baseline**: [`memory-bank/systemPatterns.md`](../../memory-bank/systemPatterns.md) · [`memory-bank/infrastructureInvariants.md`](../../memory-bank/infrastructureInvariants.md)

## 1. Technology Stack & Runtime Matrix

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Frontend / Client** | React / Next.js | Target platforms: Web, iOS, Android & API |
| **Backend / Runtime** | Node.js | Port `3000` (`http://localhost:3000/health`) |
| **Database & Persistence** | PostgreSQL 16 | Isolated per project schema/database |

---

## 2. Repository Archetype, Entrypoints & Route Inventory

<!-- ag-section:api-endpoints:start -->
| Kind | Route / Binary | Source File |
| :--- | :--- | :--- |
| **CLI Binary** | `antigravity-memory` | `./bin/cli.mjs` |
| **CLI Binary** | `agy-memory` | `./bin/cli.mjs` |
<!-- ag-section:api-endpoints:end -->

---

## 3. Database & Schema Inventory

<!-- ag-section:db-schemas:start -->
| Schema / Model File | Path |
| :--- | :--- |
| **`schemas.ts`** | `bricks/user-profile/core/schemas.ts` |
| **`001_user_profile_oauth.sql`** | `bricks/user-profile/schemas/001_user_profile_oauth.sql` |
| **`user-profile.prisma`** | `bricks/user-profile/schemas/user-profile.prisma` |
<!-- ag-section:db-schemas:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-technical:start -->
_No legacy technical architecture documents merged yet._
<!-- ag-section:legacy-technical:end -->
