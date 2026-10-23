<!-- antigravity-doc-sync -->
# 📱 antigravity-memory-bank — User Experience (UX) Brief (`docs/design/UX_BRIEF.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Brand Book**: [`docs/design/BRAND_BOOK.md`](BRAND_BOOK.md) · **Brick UX Guide**: [`docs/BRICK_ARCHITECTURE_GUIDE.md`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Target Platforms & Core User Journeys
- **Supported Platforms**: Web, iOS, Android & API
- **UX Principle**: 3-Tier Pluggable UX/UI separation — Tier A (`headless/` state & behavior hooks), Tier B (`themed-ui/` token-driven shell + `ProfileUISlotsPort` component slots), and Tier C (`src/adapters/user-profile-theme.adapter.ts`).

---

## 2. Screen, Route & Interaction Flow Inventory

<!-- ag-section:ux-screens:start -->
| Screen / Component | Platform | Source Path |
| :--- | :--- | :--- |
| **`ProfileThemeTokens`** | Android (Compose) | `bricks/user-profile/platforms/android/themed-ui/ProfileThemeTokens.kt` |
| **`ProfileThemeConfiguration`** | iOS (SwiftUI) | `bricks/user-profile/platforms/ios/themed-ui/ProfileThemeConfiguration.swift` |
| **`AvatarCropUploadModal`** | Web (React) | `bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx` |
| **`ProfileThemeProvider`** | Web (React) | `bricks/user-profile/platforms/web/themed-ui/ProfileThemeProvider.tsx` |
| **`SocialLoginButtonGroup`** | Web (React) | `bricks/user-profile/platforms/web/themed-ui/SocialLoginButtonGroup.tsx` |
| **`UserProfileSettingsView`** | Web (React) | `bricks/user-profile/platforms/web/themed-ui/UserProfileSettingsView.tsx` |
| **`index`** | Web (React) | `bricks/user-profile/platforms/web/themed-ui/index.tsx` |
<!-- ag-section:ux-screens:end -->

---

## 3. Attached UX/UI Bundles & Mockups (`docs/attachments/`)

<!-- ag-section:ux-attachments:start -->
- `docs/attachments/FEAT-121/STANDARD_DOCS_HIERARCHY_SPEC.md`
<!-- ag-section:ux-attachments:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-ux:start -->
<!-- harvested-repo-context:start -->
### Harvested Repository & Memory-Bank Context

- **From [`memory-bank/productContext.md`](../../memory-bank/productContext.md) (Memory Bank Baseline)**:
  - **Primary Persona**: AI-native engineer using Antigravity IDE across multiple repositories who wants persistent architectural context and zero-token task management.
  - **Core Flows**:
  - **Theme**: Dark glassmorphic Kanban board (`#0b0f19` background, `#111827` cards) rendered into both `<appDataDir>/brain/<cid>/backlog.html` and `docs/backlog.html`.
  - **Feedback Loops**: Instant search/filter, one-click `/backlog-start <ID>` prompt copy, and inline modal task creation with WebSocket/FileSystem Access API persistence.

- **From [`README.md`](../../README.md) (## 🏛️ The Three-Tier Memory & Correlated Planning Architecture)**:
  ### 🛡️ Feature Guide 1: Using Native Rule Discovery & `model_decision` Progressive Disclosure (`FEAT-118`)
  Traditional `memory-bank/` setups fail in Antigravity because of three native discovery traps—all of which `antigravity-memory-bank` automatically prevents, heals, and lints:
  | Trap | Why It Happens in Antigravity | How `antigravity-memory-bank` Fixes It Automatically |
  | :--- | :--- | :--- |
  | **1. Silent Discard Trap** | Antigravity only scans `AGENTS.md`, `GEMINI.md`, or immediate `.md` children inside `.agents/rules/*.md`. It ignores standalone `memory-bank/*.md` files and nested subdirectories (like `.agents/rules/ios/swift.md`) unless registered in `.agents/rules.json`. | Automatically generates top-level progressive-disclosure rule bridges in `.agents/rules/` (`memory-architecture.md`, `memory-integrations.md`, `memory-sprint-context.md`) and auto-registers any nested `.agents/rules/<subdir>/` in `.agents/rules.json`. |
  | **2. Broken Frontmatter Trap** | If a file in `.agents/rules/*.md` is missing YAML frontmatter or uses camelCase (`modelDecision` instead of `model_decision`), Antigravity silently discards the file. | Generates, auto-heals, and lints every `.agents/rules/*.md` file with strict snake_case `trigger: model_decision` + `description: "..."` YAML frontmatter. |
  | **3. Token Bloat Trap** | Dumping project memory into `GEMINI.md` or using `@[...](memory-bank/...)` inline expansions inside root `AGENTS.md` injects 15KB+ of memory on every single turn. | Enforces a strict **`< 50 lines`** cap on root `AGENTS.md` and `~/.gemini/GEMINI.md` (with `0` inline `@`-expansions), loading `memory-bank/*.md` on demand via `trigger: model_decision`. |
  #### Step-by-Step: How to Use Progressive Disclosure Rules & Verify with `/context`
<!-- harvested-repo-context:end -->
<!-- ag-section:legacy-ux:end -->
