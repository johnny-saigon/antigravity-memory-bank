<!-- antigravity-doc-sync -->
# 🎨 {{PROJECT_NAME}} — Brand Book & Design Tokens (`docs/design/BRAND_BOOK.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **UX Brief**: [`docs/design/UX_BRIEF.md`](UX_BRIEF.md) · **Brick UX Guide**: [`docs/BRICK_ARCHITECTURE_GUIDE.md`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Visual Identity & Pluggable Theme Adapter (`ProfileBrandThemePort`)
- **Host Brand Adapter Location**: `src/adapters/user-profile-theme.adapter.ts`
- **CSS Custom Property Namespace**: `--ag-profile-*` (`--ag-profile-primary`, `--ag-profile-surface`, `--ag-profile-bg`, `--ag-profile-text`, `--ag-profile-radius-card`, etc.)
- **Component Slot Overrides (`ProfileUISlotsPort`)**: Pass `slots={{ CardWrapper, HeaderBanner, SocialButton, AvatarBadge, DangerZoneModal }}` to `<ProfileThemeProvider>` to customize layout shells without modifying shared brick code.

---

## 2. Discovered Color Palette, Typography & Theme Tokens

<!-- ag-section:brand-tokens:start -->
_Progressive scaffold: automatically populated from `src/adapters/*theme*.ts`, `tailwind.config.*`, and CSS custom properties._
<!-- ag-section:brand-tokens:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-brand:start -->
_No legacy design system or brand book documents merged yet._
<!-- ag-section:legacy-brand:end -->
