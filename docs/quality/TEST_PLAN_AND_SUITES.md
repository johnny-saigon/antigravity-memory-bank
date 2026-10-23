<!-- antigravity-doc-sync -->
# 🧪 antigravity-memory-bank — Test Plan & Verification Suites (`docs/quality/TEST_PLAN_AND_SUITES.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Bug Records**: [`docs/quality/BUG_FIX_RECORDS.md`](BUG_FIX_RECORDS.md)

## 1. Verification Mandates & Quality Gates
1. **Deterministic Verification Before Completion**: Run `npm test` and `npm run lint:memory` before closing any backlog ticket.
2. **Mandatory Dual-Test Invariant for Every Bug Fix (`BUG-*`)**: Every bug fix MUST include both a dedicated **Unit/Component Non-Regression Test** and an **End-to-End (E2E) Test** verifying the integrated flow.
3. **Strict Live End-to-End Verification Before Closure (Mandate #6)**: Tickets involving OAuth providers or external APIs remain `in_progress` until live server credentials and end-to-end provider HTTP requests pass.

---

## 2. Discovered Automated Test Suites

<!-- ag-section:test-suites:start -->
| Suite File | Verification Tier | Relative Path |
| :--- | :--- | :--- |
| **`contract.spec.ts`** | Hexagonal Contract | `bricks/user-profile/testing/contract.spec.ts` |
| **`cli-e2e.test.mjs`** | End-to-End (E2E) | `tests/cli-e2e.test.mjs` |
<!-- ag-section:test-suites:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-tests:start -->
_No legacy test plan or QA scenario documents merged yet._
<!-- ag-section:legacy-tests:end -->
