<!-- antigravity-doc-sync -->
# 📚 {{PROJECT_NAME}} — Canonical Living Documentation Index (`docs/INDEX.md`)

> **Architecture**: Standardized Living Documentation Hierarchy (`FEAT-121`) · **Progressive Disclosure Rule**: [`.agents/rules/docs-living-specs.md`](../.agents/rules/docs-living-specs.md) (`trigger: model_decision`)

This index tracks the real-time status of all living specifications across **Architecture**, **Design & Brand**, **Quality & Testing**, and **Operations**. Detailed specifications live here so `memory-bank/*.md` remains strictly `< 150 lines` per file (`Passive Observer Invariant`).

---

## 🏛️ 1. Canonical Living Specifications Matrix

<!-- ag-section:doc-index-matrix:start -->
| Domain | Living Document | Status | Auto-Sync & Progressive Triggers |
| :--- | :--- | :--- | :--- |
| **Architecture** | [`architecture/LOGICAL_ARCHITECTURE.md`](architecture/LOGICAL_ARCHITECTURE.md) | 🟡 Progressive Scaffold | Domain entities, Mermaid flows & `FEAT-*` tickets |
| **Architecture** | [`architecture/TECHNICAL_ARCHITECTURE.md`](architecture/TECHNICAL_ARCHITECTURE.md) | 🟡 Progressive Scaffold | Stack matrix, API routes, DB schemas & ports |
| **Architecture** | [`architecture/SECURITY_AND_COMPLIANCE.md`](architecture/SECURITY_AND_COMPLIANCE.md) | 🟡 Progressive Scaffold | OAuth providers, masked `.env` contracts & GDPR/App Store rules |
| **Design & UX** | [`design/DESIGN.md`](design/DESIGN.md) | 🟡 Progressive Scaffold | Synthesized from BRAND_BOOK.md, UX_BRIEF.md, tokens & harvested design docs |
| **Design & UX** | [`design/UX_BRIEF.md`](design/UX_BRIEF.md) | 🟡 Progressive Scaffold | User journeys, screen/route inventory & UX `.zip` bundles |
| **Design & UX** | [`design/BRAND_BOOK.md`](design/BRAND_BOOK.md) | 🟡 Progressive Scaffold | Color tokens, typography, radii & `ProfileUISlotsPort` overrides |
| **Quality & QA** | [`quality/TEST_PLAN_AND_SUITES.md`](quality/TEST_PLAN_AND_SUITES.md) | 🟡 Progressive Scaffold | Unit, contract & E2E test suites + Mandate #6 gates |
| **Quality & QA** | [`quality/BUG_FIX_RECORDS.md`](quality/BUG_FIX_RECORDS.md) | 🟡 Progressive Scaffold | Root-cause analysis (RCA) correlated with `BUG-*` & `fix:` commits |
| **Operations** | [`operations/MIGRATION_AND_RELEASE_LOG.md`](operations/MIGRATION_AND_RELEASE_LOG.md) | 🟡 Progressive Scaffold | Milestones, DB migrations & installed Hexagonal Bricks |
<!-- ag-section:doc-index-matrix:end -->

---

## 🛠️ 2. Operational & Workflow Guides

- **Local Backlog Store & Board**: [`backlog.json`](backlog.json) · [`BACKLOG.md`](BACKLOG.md) · [`BACKLOG_GUIDE.md`](BACKLOG_GUIDE.md)
- **3-Artifact Planning Mode**: [`planning/task.md`](planning/task.md) · [`planning/implementation_plan.md`](planning/implementation_plan.md) · [`planning/walkthrough.md`](planning/walkthrough.md) · [`PLANNING_GUIDE.md`](PLANNING_GUIDE.md)
- **Pluggable UX/UI & Hexagonal Bricks**: [`BRICK_ARCHITECTURE_GUIDE.md`](BRICK_ARCHITECTURE_GUIDE.md)

---

## 📦 3. Consolidated & Archived Legacy Specifications (`docs/archive/`)

<!-- ag-section:archived-legacy-docs:start -->
_No legacy root or `docs/` markdown files have been archived yet._
<!-- ag-section:archived-legacy-docs:end -->
