<!-- antigravity-doc-sync -->
# 🎨 antigravity-memory-bank — Brand Book & Design Tokens (`docs/design/BRAND_BOOK.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **UX Brief**: [`docs/design/UX_BRIEF.md`](UX_BRIEF.md) · **Brick UX Guide**: [`docs/BRICK_ARCHITECTURE_GUIDE.md`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Visual Identity & Pluggable Theme Adapter (`ProfileBrandThemePort`)
- **Host Brand Adapter Location**: `src/adapters/user-profile-theme.adapter.ts`
- **CSS Custom Property Namespace**: `--ag-profile-*` (`--ag-profile-primary`, `--ag-profile-surface`, `--ag-profile-bg`, `--ag-profile-text`, `--ag-profile-radius-card`, etc.)
- **Component Slot Overrides (`ProfileUISlotsPort`)**: Pass `slots={{ CardWrapper, HeaderBanner, SocialButton, AvatarBadge, DangerZoneModal }}` to `<ProfileThemeProvider>` to customize layout shells without modifying shared brick code.

---

## 2. Discovered Color Palette, Typography & Theme Tokens

<!-- ag-section:brand-tokens:start -->
| Design Token | Default / Value | Source File |
| :--- | :--- | :--- |
| `primary` | `#2563EB` | `bricks/user-profile/adapters/templates/theme.adapter.template.ts` |
| `primaryForeground` | `#FFFFFF` | `bricks/user-profile/adapters/templates/theme.adapter.template.ts` |
| `danger` | `#EF4444` | `bricks/user-profile/adapters/templates/theme.adapter.template.ts` |
| `success` | `#10B981` | `bricks/user-profile/adapters/templates/theme.adapter.template.ts` |
<!-- ag-section:brand-tokens:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-brand:start -->
_No legacy design system or brand book documents merged yet._
<!-- ag-section:legacy-brand:end -->
