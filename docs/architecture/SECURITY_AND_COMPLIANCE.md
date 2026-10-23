<!-- antigravity-doc-sync -->
# 🔐 antigravity-memory-bank — Security, Auth & Compliance (`docs/architecture/SECURITY_AND_COMPLIANCE.md`)

> **Index**: [`docs/INDEX.md`](../INDEX.md) · **Memory Baseline**: [`memory-bank/integrationsAndCustomizations.md`](../../memory-bank/integrationsAndCustomizations.md) · [`.agents/rules/negative-constraints.md`](../../.agents/rules/negative-constraints.md)

## 1. Authentication, OAuth 2.0 / OIDC & Session Security
- **Secret Hygiene**: Raw `.env*` secrets, private keys (`*.p8`, `*.pem`), and bearer tokens MUST NEVER be committed to Git.
- **External Boundary Validation**: All external API payloads and OAuth callbacks must be validated before persistence.
- **Account Deletion & Privacy Compliance**:
  - **Apple App Store Guideline `5.1.1(v)`**: Revoke Apple OAuth tokens via `https://appleid.apple.com/auth/revoke` upon account deletion.
  - **Meta / Facebook GDPR Compliance**: Verify `signed_request` HMAC-SHA256 payloads on the data-deletion callback endpoint.

---

## 2. Environment Variable & Credential Contract (Secrets Masked)

<!-- ag-section:security-env:start -->
_Progressive scaffold: automatically synchronized from `.env*` and brick contracts with secret literals redacted._
<!-- ag-section:security-env:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-security:start -->
_No legacy security or compliance documents merged yet._
<!-- ag-section:legacy-security:end -->
