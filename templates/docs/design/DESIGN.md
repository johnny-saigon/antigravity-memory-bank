<!-- antigravity-doc-sync -->
# 💎 {{PROJECT_NAME}} — Unified Design System (`docs/design/DESIGN.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Brand Book**: [`docs/design/BRAND_BOOK.md`](BRAND_BOOK.md) · **UX Brief**: [`docs/design/UX_BRIEF.md`](UX_BRIEF.md) · **Brick UX Guide**: [`docs/BRICK_ARCHITECTURE_GUIDE.md`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Visual Direction, Platforms & 3-Tier Pluggable UX/UI
- **Project**: **{{PROJECT_NAME}}** — {{PROJECT_TAGLINE}}
- **Target Platforms**: {{PLATFORMS}}
- **Frontend & UI Stack**: {{FRONTEND_TECH}}
- **3-Tier Pluggable UX/UI Architecture**:
  - **Tier A (`headless/`)**: Pure state, validation, OAuth, and interaction hooks (`0` CSS/colors).
  - **Tier B (`themed-ui/`)**: Token-driven default shell consuming `ProfileBrandThemePort` (`--ag-profile-*`) and `ProfileUISlotsPort` (`slots={{ CardWrapper, HeaderBanner, SocialButton, AvatarBadge, DangerZoneModal }}`).
  - **Tier C (`src/adapters/user-profile-theme.adapter.ts`)**: Host repository brand adapter mapping `BRAND_BOOK.md` and `UX_BRIEF.md` into runtime tokens.

---

## 2. Synthesized Brand Tokens & Palette (Harvested from `BRAND_BOOK.md` & Codebase)

<!-- ag-section:design-brand-summary:start -->
_Progressive scaffold: automatically synthesized from `docs/design/BRAND_BOOK.md`, `src/adapters/*theme*.ts`, `tailwind.config.*`, and CSS custom properties._
<!-- ag-section:design-brand-summary:end -->

---

## 3. Synthesized UX Screens, Flows & Bundles (Harvested from `UX_BRIEF.md` & Codebase)

<!-- ag-section:design-ux-summary:start -->
_Progressive scaffold: automatically synthesized from `docs/design/UX_BRIEF.md`, discovered Web/iOS/Android screens, and `docs/attachments/` UX/UI bundles._
<!-- ag-section:design-ux-summary:end -->

---

## 4. Cross-Harvested Design Specifications (`BRAND_BOOK.md`, `UX_BRIEF.md` & Repo Design Docs)

<!-- ag-section:design-harvested-rollup:start -->
_Progressive scaffold: automatically aggregates design specifications harvested from `BRAND_BOOK.md`, `UX_BRIEF.md`, `memory-bank/productContext.md`, `README.md`, and archived design docs._
<!-- ag-section:design-harvested-rollup:end -->

---

## 5. Consolidated Direct Design Specifications (`DESIGN.md`)

<!-- ag-section:legacy-design:start -->
_No standalone legacy `DESIGN.md` specifications merged yet._
<!-- ag-section:legacy-design:end -->
