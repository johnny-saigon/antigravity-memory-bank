#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Canonical Living Documentation Hierarchy & Auto-Synthesizer (`FEAT-121`)
 *
 * Self-contained, zero-dependency engine that works identically in:
 * 1. Upstream CLI operations (`init`, `upgrade`, `organize`, `docs:sync`)
 * 2. Standalone downstream repositories (`node scripts/sync-living-docs.mjs [--quiet] [--lint]`)
 * 3. Progressive lifecycle hooks (`scripts/backlog.mjs` plan/done & `scripts/sync-memory-context.mjs`)
 */

import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CANONICAL_LIVING_DOCS = [
  {
    relPath: 'docs/INDEX.md',
    templateRel: 'docs/INDEX.md',
    domain: 'Index',
    title: 'Canonical Living Documentation Index',
    triggers: 'Master TOC & real-time status badges'
  },
  {
    relPath: 'docs/architecture/LOGICAL_ARCHITECTURE.md',
    templateRel: 'docs/architecture/LOGICAL_ARCHITECTURE.md',
    domain: 'Architecture',
    title: 'Logical Architecture',
    triggers: 'Domain entities, Mermaid flows & `FEAT-*` tickets'
  },
  {
    relPath: 'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    templateRel: 'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    domain: 'Architecture',
    title: 'Technical Architecture',
    triggers: 'Stack matrix, API routes, DB schemas & ports'
  },
  {
    relPath: 'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    templateRel: 'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    domain: 'Architecture',
    title: 'Security & Compliance',
    triggers: 'OAuth providers, masked `.env` contracts & GDPR/App Store rules'
  },
  {
    relPath: 'docs/design/DESIGN.md',
    templateRel: 'docs/design/DESIGN.md',
    domain: 'Design & UX',
    title: 'Unified Design System (DESIGN.md)',
    triggers: 'Synthesized from BRAND_BOOK.md, UX_BRIEF.md, tokens & harvested design docs'
  },
  {
    relPath: 'docs/design/UX_BRIEF.md',
    templateRel: 'docs/design/UX_BRIEF.md',
    domain: 'Design & UX',
    title: 'UX Brief',
    triggers: 'User journeys, screen/route inventory & UX `.zip` bundles'
  },
  {
    relPath: 'docs/design/BRAND_BOOK.md',
    templateRel: 'docs/design/BRAND_BOOK.md',
    domain: 'Design & UX',
    title: 'Brand Book',
    triggers: 'Color tokens, typography, radii & `ProfileUISlotsPort` overrides'
  },
  {
    relPath: 'docs/quality/TEST_PLAN_AND_SUITES.md',
    templateRel: 'docs/quality/TEST_PLAN_AND_SUITES.md',
    domain: 'Quality & QA',
    title: 'Test Plan & Suites',
    triggers: 'Unit, contract & E2E test suites + Mandate #6 gates'
  },
  {
    relPath: 'docs/quality/BUG_FIX_RECORDS.md',
    templateRel: 'docs/quality/BUG_FIX_RECORDS.md',
    domain: 'Quality & QA',
    title: 'Bug Fix Records',
    triggers: 'Root-cause analysis (RCA) correlated with `BUG-*` & `fix:` commits'
  },
  {
    relPath: 'docs/operations/MIGRATION_AND_RELEASE_LOG.md',
    templateRel: 'docs/operations/MIGRATION_AND_RELEASE_LOG.md',
    domain: 'Operations',
    title: 'Migration & Release Log',
    triggers: 'Milestones, DB migrations & installed Hexagonal Bricks'
  }
];

/**
 * Legacy file names inside `docs/` (or relocated from root into `docs/`) that consolidate
 * into the canonical `docs/{architecture,design,quality,operations}/` hierarchy.
 */
export const LEGACY_DOC_MAPPING = {
  'logical_architecture.md': {
    targetRel: 'docs/architecture/LOGICAL_ARCHITECTURE.md',
    sectionId: 'legacy-logical'
  },
  'architecture.md': {
    targetRel: 'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    sectionId: 'legacy-technical'
  },
  'system_architecture.md': {
    targetRel: 'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    sectionId: 'legacy-technical'
  },
  'native_share_setup.md': {
    targetRel: 'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    sectionId: 'legacy-technical'
  },
  'security.md': {
    targetRel: 'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    sectionId: 'legacy-security'
  },
  'compliance.md': {
    targetRel: 'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    sectionId: 'legacy-security'
  },
  'auth_spec.md': {
    targetRel: 'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    sectionId: 'legacy-security'
  },
  'ux_brief.md': {
    targetRel: 'docs/design/UX_BRIEF.md',
    sectionId: 'legacy-ux'
  },
  'native_ui_spec.md': {
    targetRel: 'docs/design/UX_BRIEF.md',
    sectionId: 'legacy-ux'
  },
  'user_flows.md': {
    targetRel: 'docs/design/UX_BRIEF.md',
    sectionId: 'legacy-ux'
  },
  'wireframes.md': {
    targetRel: 'docs/design/UX_BRIEF.md',
    sectionId: 'legacy-ux'
  },
  'design.md': {
    targetRel: 'docs/design/DESIGN.md',
    sectionId: 'legacy-design'
  },
  'design_system.md': {
    targetRel: 'docs/design/DESIGN.md',
    sectionId: 'legacy-design'
  },
  'ui_guidelines.md': {
    targetRel: 'docs/design/DESIGN.md',
    sectionId: 'legacy-design'
  },
  'brand_book.md': {
    targetRel: 'docs/design/BRAND_BOOK.md',
    sectionId: 'legacy-brand'
  },
  'style_guide.md': {
    targetRel: 'docs/design/BRAND_BOOK.md',
    sectionId: 'legacy-brand'
  },
  'theme.md': {
    targetRel: 'docs/design/BRAND_BOOK.md',
    sectionId: 'legacy-brand'
  },
  'testing_agent_scenarios.md': {
    targetRel: 'docs/quality/TEST_PLAN_AND_SUITES.md',
    sectionId: 'legacy-tests'
  },
  'test_plan.md': {
    targetRel: 'docs/quality/TEST_PLAN_AND_SUITES.md',
    sectionId: 'legacy-tests'
  },
  'qa_matrix.md': {
    targetRel: 'docs/quality/TEST_PLAN_AND_SUITES.md',
    sectionId: 'legacy-tests'
  },
  'bug_fix_records.md': {
    targetRel: 'docs/quality/BUG_FIX_RECORDS.md',
    sectionId: 'legacy-bugs'
  },
  'bugs.md': {
    targetRel: 'docs/quality/BUG_FIX_RECORDS.md',
    sectionId: 'legacy-bugs'
  },
  'known_issues.md': {
    targetRel: 'docs/quality/BUG_FIX_RECORDS.md',
    sectionId: 'legacy-bugs'
  },
  'migration_board.md': {
    targetRel: 'docs/operations/MIGRATION_AND_RELEASE_LOG.md',
    sectionId: 'legacy-migrations'
  },
  'release_log.md': {
    targetRel: 'docs/operations/MIGRATION_AND_RELEASE_LOG.md',
    sectionId: 'legacy-migrations'
  },
  'deploy.md': {
    targetRel: 'docs/operations/MIGRATION_AND_RELEASE_LOG.md',
    sectionId: 'legacy-migrations'
  }
};

export const PRESERVED_DOCS_REL_PATHS = new Set([
  ...CANONICAL_LIVING_DOCS.map((d) => d.relPath.toLowerCase()),
  'docs/backlog.md',
  'docs/backlog_guide.md',
  'docs/planning_guide.md',
  'docs/brick_architecture_guide.md',
  'docs/standard_docs_hierarchy_spec.md',
  'docs/phase_1_extract_snapcal_auth_profile_brick.md'
]);

const PILLAR_CLASSIFICATION_RULES = [
  {
    targetRel: 'docs/architecture/LOGICAL_ARCHITECTURE.md',
    sectionId: 'legacy-logical',
    fileKeywords: ['logical', 'domain', 'entity', 'entities', 'bounded', 'usecase', 'workflow', 'feature', 'overview', 'product', 'concept'],
    headingKeywords: ['domain', 'entity', 'logical', 'workflow', 'capability', 'use case', 'bounded context', 'mermaid', 'system context', 'overview'],
    bodyKeywords: ['flowchart', 'sequencediagram', 'erdiagram', 'bounded context', 'hexagonal', 'domain model', 'aggregate', 'invariant']
  },
  {
    targetRel: 'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    sectionId: 'legacy-technical',
    fileKeywords: ['technical', 'architecture', 'system', 'api', 'endpoint', 'route', 'database', 'schema', 'sql', 'prisma', 'infra', 'server', 'backend', 'billing', 'stripe', 'webhook', 'setup', 'share'],
    headingKeywords: ['api', 'endpoint', 'route', 'database', 'schema', 'table', 'stack', 'infrastructure', 'port', 'webhook', 'service', 'adapter', 'runtime'],
    bodyKeywords: ['postgresql', 'fastify', 'express', 'next.js', 'create table', 'endpoint', 'http', 'webhook', 'redis', 'localhost', 'docker', 'prisma']
  },
  {
    targetRel: 'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    sectionId: 'legacy-security',
    fileKeywords: ['security', 'auth', 'oauth', 'oidc', 'pkce', 'compliance', 'gdpr', 'privacy', 'permission', 'secret', 'token', 'jwt', 'encryption', 'rbac'],
    headingKeywords: ['security', 'authentication', 'authorization', 'oauth', 'compliance', 'gdpr', 'privacy', 'secret', 'token', 'credential', 'revocation', 'deletion'],
    bodyKeywords: ['client_secret', 'authorization_code', 'pkce', 'appleid.apple.com', 'signed_request', 'hmac', 'sha256', 'bearer', 'jwt', 'gdpr', '5.1.1']
  },
  {
    targetRel: 'docs/design/DESIGN.md',
    sectionId: 'legacy-design',
    fileKeywords: ['design_system', 'ui_guidelines', 'stitch', 'aesthetic', 'visual_spec', 'component_library'],
    headingKeywords: ['design system', 'visual language', 'design principles', 'component library', 'stitch', 'ui specification'],
    bodyKeywords: ['design system', 'stitch', 'glassmorphism', 'elevation', 'component hierarchy', 'visual hierarchy']
  },
  {
    targetRel: 'docs/design/UX_BRIEF.md',
    sectionId: 'legacy-ux',
    fileKeywords: ['ux', 'ui', 'wireframe', 'flow', 'journey', 'screen', 'onboarding', 'navigation', 'interaction', 'modal', 'mockup'],
    headingKeywords: ['user journey', 'screen', 'wireframe', 'onboarding', 'navigation', 'interaction', 'ux', 'modal', 'form', 'layout'],
    bodyKeywords: ['headless', 'modal', 'screen', 'onboarding', 'button', 'avatar', 'crop', 'responsive', 'mobile', 'gesture', 'accessibility']
  },
  {
    targetRel: 'docs/design/BRAND_BOOK.md',
    sectionId: 'legacy-brand',
    fileKeywords: ['brand', 'design', 'style', 'theme', 'palette', 'color', 'typography', 'font', 'token', 'icon', 'logo'],
    headingKeywords: ['brand', 'color', 'palette', 'typography', 'font', 'theme', 'token', 'radius', 'spacing', 'dark mode', 'slot'],
    bodyKeywords: ['--ag-profile', 'tailwind', 'border-radius', 'font-family', 'glassmorphic', 'hex', 'primary', 'surface', 'dark mode', 'light mode']
  },
  {
    targetRel: 'docs/quality/TEST_PLAN_AND_SUITES.md',
    sectionId: 'legacy-tests',
    fileKeywords: ['test', 'testing', 'qa', 'e2e', 'playwright', 'vitest', 'jest', 'scenario', 'verification', 'suite', 'coverage'],
    headingKeywords: ['test', 'qa', 'verification', 'e2e', 'unit test', 'contract test', 'assertion', 'coverage', 'scenario'],
    bodyKeywords: ['node --test', 'playwright', 'vitest', 'jest', 'assert.', 'expect(', 'non-regression', 'e2e', 'mock']
  },
  {
    targetRel: 'docs/quality/BUG_FIX_RECORDS.md',
    sectionId: 'legacy-bugs',
    fileKeywords: ['bug', 'bugs', 'rca', 'issue', 'issues', 'incident', 'postmortem', 'hotfix', 'regression', 'fix'],
    headingKeywords: ['bug', 'root cause', 'rca', 'regression', 'symptom', 'resolution', 'incident', 'hotfix'],
    bodyKeywords: ['bug-', 'root cause', 'non-regression', 'race condition', 'crash', 'workaround', 'fixed by']
  },
  {
    targetRel: 'docs/operations/MIGRATION_AND_RELEASE_LOG.md',
    sectionId: 'legacy-migrations',
    fileKeywords: ['migration', 'release', 'changelog', 'deploy', 'deployment', 'cutover', 'rollout', 'upgrade', 'ops', 'runbook'],
    headingKeywords: ['migration', 'release', 'changelog', 'deployment', 'cutover', 'milestone', 'rollout', 'version'],
    bodyKeywords: ['git push', 'migration', 'milestone', 'v1.', 'v2.', 'production', 'staging', 'cutover', 'rollback']
  }
];

/**
 * Deterministically classify any Markdown document (docs/<subpath>/<name>.md) into one of the 8 canonical living pillars
 * using exact filename lookup first, followed by weighted filename + heading + keyword scoring.
 */
export function classifyMarkdownDocument(relPath, content = '') {
  const baseName = path.basename(relPath).toLowerCase();
  if (LEGACY_DOC_MAPPING[baseName]) {
    return {
      ...LEGACY_DOC_MAPPING[baseName],
      confidence: 'exact-mapping',
      score: 100
    };
  }

  const lowerRel = relPath.toLowerCase();
  const lowerBody = String(content || '').toLowerCase();
  const headings = (String(content || '').match(/^#{1,3}\s+[^\n]+/gm) || []).join(' ').toLowerCase();

  let bestRule = PILLAR_CLASSIFICATION_RULES[1]; // Default to TECHNICAL_ARCHITECTURE.md
  let bestScore = -1;

  for (const rule of PILLAR_CLASSIFICATION_RULES) {
    let score = 0;
    for (const fk of rule.fileKeywords) {
      if (lowerRel.includes(fk)) score += 6;
    }
    for (const hk of rule.headingKeywords) {
      if (headings.includes(hk)) score += 4;
    }
    for (const bk of rule.bodyKeywords) {
      if (lowerBody.includes(bk)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  return {
    targetRel: bestRule.targetRel,
    sectionId: bestRule.sectionId,
    confidence: bestScore >= 6 ? 'heuristic-high' : 'heuristic-fallback',
    score: bestScore
  };
}

/**
 * Non-destructively harvest domain sections from in-place repository Markdown files
 * (`README.md`, `SECURITY.md`, `CHANGELOG.md`, `memory-bank/*.md`, and preserved guides)
 * to enrich the 8 canonical pillars without moving or deleting the source files.
 */
function harvestInPlaceRepoKnowledge(root) {
  const harvestedBySection = {
    'legacy-logical': [],
    'legacy-technical': [],
    'legacy-security': [],
    'legacy-design': [],
    'legacy-ux': [],
    'legacy-brand': [],
    'legacy-tests': [],
    'legacy-bugs': [],
    'legacy-migrations': []
  };

  const pushExcerpt = (sectionId, sourceRel, heading, excerpt, fromDocDir = 'docs/architecture') => {
    const withoutCodeBlocks = String(excerpt || '').replace(/```[\s\S]*?```/g, '');
    const cleanExcerpt = withoutCodeBlocks
      .split('\n')
      .map((l) => l.trimEnd())
      .filter((l) => l && !l.startsWith('<!--') && !l.startsWith('```'))
      .slice(0, 8)
      .join('\n')
      .trim();
    if (!cleanExcerpt || cleanExcerpt.length < 15) return;
    const relLink = path.relative(path.join(root, fromDocDir), path.join(root, sourceRel)).split(path.sep).join('/');
    harvestedBySection[sectionId].push(
      `- **From [\`${sourceRel}\`](${relLink}) (${heading})**:\n  ${cleanExcerpt.replace(/\n/g, '\n  ')}`
    );
  };

  // 1. Harvest Memory Bank baseline files (`memory-bank/*.md`)
  const memoryMappings = [
    { rel: 'memory-bank/projectbrief.md', sectionId: 'legacy-logical', dir: 'docs/architecture' },
    { rel: 'memory-bank/productContext.md', sectionId: 'legacy-design', dir: 'docs/design' },
    { rel: 'memory-bank/productContext.md', sectionId: 'legacy-ux', dir: 'docs/design' },
    { rel: 'memory-bank/systemPatterns.md', sectionId: 'legacy-technical', dir: 'docs/architecture' },
    { rel: 'memory-bank/infrastructureInvariants.md', sectionId: 'legacy-technical', dir: 'docs/architecture' },
    { rel: 'memory-bank/integrationsAndCustomizations.md', sectionId: 'legacy-security', dir: 'docs/architecture' },
    { rel: 'memory-bank/progress.md', sectionId: 'legacy-migrations', dir: 'docs/operations' }
  ];

  for (const mm of memoryMappings) {
    const full = path.join(root, mm.rel);
    if (!fsSync.existsSync(full)) continue;
    try {
      const raw = fsSync.readFileSync(full, 'utf8');
      const bulletLines = raw
        .split('\n')
        .filter((l) => /^\s*[-*]\s+\*\*/.test(l) && !l.includes('{{'))
        .slice(0, 5);
      if (bulletLines.length > 0) {
        pushExcerpt(mm.sectionId, mm.rel, 'Memory Bank Baseline', bulletLines.join('\n'), mm.dir);
      }
    } catch {}
  }

  // 2. Harvest `README.md`, `SECURITY.md`, `CHANGELOG.md` by `## ` headings
  for (const rootDoc of ['README.md', 'SECURITY.md', 'CHANGELOG.md']) {
    const full = path.join(root, rootDoc);
    if (!fsSync.existsSync(full)) continue;
    try {
      const raw = fsSync.readFileSync(full, 'utf8');
      const sections = raw.split(/^##\s+/m);
      for (const sec of sections.slice(1)) {
        const firstNl = sec.indexOf('\n');
        if (firstNl === -1) continue;
        const headingTitle = sec.slice(0, firstNl).trim();
        const body = sec.slice(firstNl + 1).trim();
        if (!body || body.length < 20) continue;
        const classified = classifyMarkdownDocument(rootDoc, `## ${headingTitle}\n${body}`);
        const docDir = path.dirname(classified.targetRel);
        pushExcerpt(classified.sectionId, rootDoc, `## ${headingTitle}`, body, docDir);
      }
    } catch {}
  }

  return harvestedBySection;
}

const SENSITIVE_KEY_REGEX = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCESS_KEY|WEBHOOK_SECRET|CREDENTIAL|AUTH_KEY|CLIENT_SECRET|DSN)/i;

function getDefaultTemplateContent(relPath) {
  const map = {
    'docs/INDEX.md': `<!-- antigravity-doc-sync -->
# 📚 {{PROJECT_NAME}} — Canonical Living Documentation Index (\`docs/INDEX.md\`)

> **Architecture**: Standardized Living Documentation Hierarchy (\`FEAT-121\`) · **Progressive Disclosure Rule**: [\`.agents/rules/docs-living-specs.md\`](../.agents/rules/docs-living-specs.md) (\`trigger: model_decision\`)

This index tracks the real-time status of all living specifications across **Architecture**, **Design & Brand**, **Quality & Testing**, and **Operations**. Detailed specifications live here so \`memory-bank/*.md\` remains strictly \`< 150 lines\` per file (\`Passive Observer Invariant\`).

---

## 🏛️ 1. Canonical Living Specifications Matrix

<!-- ag-section:doc-index-matrix:start -->
| Domain | Living Document | Status | Auto-Sync & Progressive Triggers |
| :--- | :--- | :--- | :--- |
| **Architecture** | [\`architecture/LOGICAL_ARCHITECTURE.md\`](architecture/LOGICAL_ARCHITECTURE.md) | 🟡 Progressive Scaffold | Domain entities, Mermaid flows & \`FEAT-*\` tickets |
| **Architecture** | [\`architecture/TECHNICAL_ARCHITECTURE.md\`](architecture/TECHNICAL_ARCHITECTURE.md) | 🟡 Progressive Scaffold | Stack matrix, API routes, DB schemas & ports |
| **Architecture** | [\`architecture/SECURITY_AND_COMPLIANCE.md\`](architecture/SECURITY_AND_COMPLIANCE.md) | 🟡 Progressive Scaffold | OAuth providers, masked \`.env\` contracts & GDPR/App Store rules |
| **Design & UX** | [\`design/DESIGN.md\`](design/DESIGN.md) | 🟡 Progressive Scaffold | Synthesized from BRAND_BOOK.md, UX_BRIEF.md, tokens & harvested design docs |
| **Design & UX** | [\`design/UX_BRIEF.md\`](design/UX_BRIEF.md) | 🟡 Progressive Scaffold | User journeys, screen/route inventory & UX \`.zip\` bundles |
| **Design & UX** | [\`design/BRAND_BOOK.md\`](design/BRAND_BOOK.md) | 🟡 Progressive Scaffold | Color tokens, typography, radii & \`ProfileUISlotsPort\` overrides |
| **Quality & QA** | [\`quality/TEST_PLAN_AND_SUITES.md\`](quality/TEST_PLAN_AND_SUITES.md) | 🟡 Progressive Scaffold | Unit, contract & E2E test suites + Mandate #6 gates |
| **Quality & QA** | [\`quality/BUG_FIX_RECORDS.md\`](quality/BUG_FIX_RECORDS.md) | 🟡 Progressive Scaffold | Root-cause analysis (RCA) correlated with \`BUG-*\` & \`fix:\` commits |
| **Operations** | [\`operations/MIGRATION_AND_RELEASE_LOG.md\`](operations/MIGRATION_AND_RELEASE_LOG.md) | 🟡 Progressive Scaffold | Milestones, DB migrations & installed Hexagonal Bricks |
<!-- ag-section:doc-index-matrix:end -->

---

## 🛠️ 2. Operational & Workflow Guides

- **Local Backlog Store & Board**: [\`backlog.json\`](backlog.json) · [\`BACKLOG.md\`](BACKLOG.md) · [\`BACKLOG_GUIDE.md\`](BACKLOG_GUIDE.md)
- **3-Artifact Planning Mode**: [\`planning/task.md\`](planning/task.md) · [\`planning/implementation_plan.md\`](planning/implementation_plan.md) · [\`planning/walkthrough.md\`](planning/walkthrough.md) · [\`PLANNING_GUIDE.md\`](PLANNING_GUIDE.md)
- **Pluggable UX/UI & Hexagonal Bricks**: [\`BRICK_ARCHITECTURE_GUIDE.md\`](BRICK_ARCHITECTURE_GUIDE.md)

---

## 📦 3. Consolidated & Archived Legacy Specifications (\`docs/archive/\`)

<!-- ag-section:archived-legacy-docs:start -->
_No legacy root or \`docs/\` markdown files have been archived yet._
<!-- ag-section:archived-legacy-docs:end -->
`,
    'docs/architecture/LOGICAL_ARCHITECTURE.md': `<!-- antigravity-doc-sync -->
# 🧩 {{PROJECT_NAME}} — Logical Architecture (\`docs/architecture/LOGICAL_ARCHITECTURE.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Memory Baseline**: [\`memory-bank/projectbrief.md\`](../../memory-bank/projectbrief.md)

## 1. System Context & Domain North Star
- **Project**: **{{PROJECT_NAME}}** — {{PROJECT_TAGLINE}}
- **Target Platforms**: {{PLATFORMS}}
- **Core Architectural Pattern**: Three-Tier Memory Bank + Decoupled Zero-Token Backlog + Hexagonal Domain/Adapter Isolation.

\`\`\`mermaid
flowchart LR
  User["User / Client ({{PLATFORMS}})"] --> UI["Presentation Layer (Headless + Themed UI)"]
  UI --> Core["Domain & Application Services"]
  Core --> Ports["Hexagonal Ports & Adapters"]
  Ports --> DB[("{{DATABASE_TECH}}")]
\`\`\`

---

## 2. Core Domain Entities & Shared Hexagonal Bricks

<!-- ag-section:logical-entities:start -->
| Module / Brick | Responsibility | Status |
| :--- | :--- | :--- |
| \`core\` | Primary domain logic and business invariants | 🟢 Active |
<!-- ag-section:logical-entities:end -->

---

## 3. Progressive Feature & Capability Map (\`FEAT-*\`)

<!-- ag-section:logical-features:start -->
_Progressive scaffold: automatically populated as \`FEAT-*\` backlog tickets are planned (\`/backlog-plan\`) and completed (\`/backlog-start\`)._
<!-- ag-section:logical-features:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-logical:start -->
_No legacy logical architecture documents merged yet._
<!-- ag-section:legacy-logical:end -->
`,
    'docs/architecture/TECHNICAL_ARCHITECTURE.md': `<!-- antigravity-doc-sync -->
# ⚙️ {{PROJECT_NAME}} — Technical Architecture (\`docs/architecture/TECHNICAL_ARCHITECTURE.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Memory Baseline**: [\`memory-bank/systemPatterns.md\`](../../memory-bank/systemPatterns.md) · [\`memory-bank/infrastructureInvariants.md\`](../../memory-bank/infrastructureInvariants.md)

## 1. Technology Stack & Runtime Matrix

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Frontend / Client** | {{FRONTEND_TECH}} | Target platforms: {{PLATFORMS}} |
| **Backend / Runtime** | {{BACKEND_TECH}} | Port \`{{PORT}}\` (\`{{HEALTH_URL}}\`) |
| **Database & Persistence** | {{DATABASE_TECH}} | Isolated per project schema/database |

---

## 2. Repository Archetype, Entrypoints & Route Inventory

<!-- ag-section:api-endpoints:start -->
_Progressive scaffold: automatically populated from discovered API routes, pages, and CLI entrypoints._
<!-- ag-section:api-endpoints:end -->

---

## 3. Database & Schema Inventory

<!-- ag-section:db-schemas:start -->
_Progressive scaffold: automatically populated from Prisma, SQL, and Zod/TypeScript schema definitions._
<!-- ag-section:db-schemas:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-technical:start -->
_No legacy technical architecture documents merged yet._
<!-- ag-section:legacy-technical:end -->
`,
    'docs/architecture/SECURITY_AND_COMPLIANCE.md': `<!-- antigravity-doc-sync -->
# 🔐 {{PROJECT_NAME}} — Security, Auth & Compliance (\`docs/architecture/SECURITY_AND_COMPLIANCE.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Memory Baseline**: [\`memory-bank/integrationsAndCustomizations.md\`](../../memory-bank/integrationsAndCustomizations.md) · [\`.agents/rules/negative-constraints.md\`](../../.agents/rules/negative-constraints.md)

## 1. Authentication, OAuth 2.0 / OIDC & Session Security
- **Secret Hygiene**: Raw \`.env*\` secrets, private keys (\`*.p8\`, \`*.pem\`), and bearer tokens MUST NEVER be committed to Git.
- **External Boundary Validation**: All external API payloads and OAuth callbacks must be validated before persistence.
- **Account Deletion & Privacy Compliance**:
  - **Apple App Store Guideline \`5.1.1(v)\`**: Revoke Apple OAuth tokens via \`https://appleid.apple.com/auth/revoke\` upon account deletion.
  - **Meta / Facebook GDPR Compliance**: Verify \`signed_request\` HMAC-SHA256 payloads on the data-deletion callback endpoint.

---

## 2. Environment Variable & Credential Contract (Secrets Masked)

<!-- ag-section:security-env:start -->
_Progressive scaffold: automatically synchronized from \`.env*\` and brick contracts with secret literals redacted._
<!-- ag-section:security-env:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-security:start -->
_No legacy security or compliance documents merged yet._
<!-- ag-section:legacy-security:end -->
`,
    'docs/design/DESIGN.md': `<!-- antigravity-doc-sync -->
# 💎 {{PROJECT_NAME}} — Unified Design System (\`docs/design/DESIGN.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Brand Book**: [\`docs/design/BRAND_BOOK.md\`](BRAND_BOOK.md) · **UX Brief**: [\`docs/design/UX_BRIEF.md\`](UX_BRIEF.md) · **Brick UX Guide**: [\`docs/BRICK_ARCHITECTURE_GUIDE.md\`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Visual Direction, Platforms & 3-Tier Pluggable UX/UI
- **Project**: **{{PROJECT_NAME}}** — {{PROJECT_TAGLINE}}
- **Target Platforms**: {{PLATFORMS}}
- **Frontend & UI Stack**: {{FRONTEND_TECH}}
- **3-Tier Pluggable UX/UI Architecture**:
  - **Tier A (\`headless/\`)**: Pure state, validation, OAuth, and interaction hooks (\`0\` CSS/colors).
  - **Tier B (\`themed-ui/\`)**: Token-driven default shell consuming \`ProfileBrandThemePort\` (\`--ag-profile-*\`) and \`ProfileUISlotsPort\` (\`slots={{ CardWrapper, HeaderBanner, SocialButton, AvatarBadge, DangerZoneModal }}\`).
  - **Tier C (\`src/adapters/user-profile-theme.adapter.ts\`)**: Host repository brand adapter mapping \`BRAND_BOOK.md\` and \`UX_BRIEF.md\` into runtime tokens.

---

## 2. Synthesized Brand Tokens & Palette (Harvested from \`BRAND_BOOK.md\` & Codebase)

<!-- ag-section:design-brand-summary:start -->
_Progressive scaffold: automatically synthesized from \`docs/design/BRAND_BOOK.md\`, \`src/adapters/*theme*.ts\`, \`tailwind.config.*\`, and CSS custom properties._
<!-- ag-section:design-brand-summary:end -->

---

## 3. Synthesized UX Screens, Flows & Bundles (Harvested from \`UX_BRIEF.md\` & Codebase)

<!-- ag-section:design-ux-summary:start -->
_Progressive scaffold: automatically synthesized from \`docs/design/UX_BRIEF.md\`, discovered Web/iOS/Android screens, and \`docs/attachments/\` UX/UI bundles._
<!-- ag-section:design-ux-summary:end -->

---

## 4. Cross-Harvested Design Specifications (\`BRAND_BOOK.md\`, \`UX_BRIEF.md\` & Repo Design Docs)

<!-- ag-section:design-harvested-rollup:start -->
_Progressive scaffold: automatically aggregates design specifications harvested from \`BRAND_BOOK.md\`, \`UX_BRIEF.md\`, \`memory-bank/productContext.md\`, \`README.md\`, and archived design docs._
<!-- ag-section:design-harvested-rollup:end -->

---

## 5. Consolidated Direct Design Specifications (\`DESIGN.md\`)

<!-- ag-section:legacy-design:start -->
_No standalone legacy \`DESIGN.md\` specifications merged yet._
<!-- ag-section:legacy-design:end -->
`,
    'docs/design/UX_BRIEF.md': `<!-- antigravity-doc-sync -->
# 📱 {{PROJECT_NAME}} — User Experience (UX) Brief (\`docs/design/UX_BRIEF.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Brand Book**: [\`docs/design/BRAND_BOOK.md\`](BRAND_BOOK.md) · **Brick UX Guide**: [\`docs/BRICK_ARCHITECTURE_GUIDE.md\`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Target Platforms & Core User Journeys
- **Supported Platforms**: {{PLATFORMS}}
- **UX Principle**: 3-Tier Pluggable UX/UI separation — Tier A (\`headless/\` state & behavior hooks), Tier B (\`themed-ui/\` token-driven shell + \`ProfileUISlotsPort\` component slots), and Tier C (\`src/adapters/user-profile-theme.adapter.ts\`).

---

## 2. Screen, Route & Interaction Flow Inventory

<!-- ag-section:ux-screens:start -->
_Progressive scaffold: automatically populated from discovered UI screens, pages, and \`FEAT-*\` UX specifications._
<!-- ag-section:ux-screens:end -->

---

## 3. Attached UX/UI Bundles & Mockups (\`docs/attachments/\`)

<!-- ag-section:ux-attachments:start -->
_No UX/UI \`.zip\` bundles or screen mockups attached yet. Attach via \`npm run backlog attach <ID> <path>\`._
<!-- ag-section:ux-attachments:end -->

---

## 4. Consolidated Project Specifications

<!-- ag-section:legacy-ux:start -->
_No legacy UX brief or wireframe specifications merged yet._
<!-- ag-section:legacy-ux:end -->
`,
    'docs/design/BRAND_BOOK.md': `<!-- antigravity-doc-sync -->
# 🎨 {{PROJECT_NAME}} — Brand Book & Design Tokens (\`docs/design/BRAND_BOOK.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **UX Brief**: [\`docs/design/UX_BRIEF.md\`](UX_BRIEF.md) · **Brick UX Guide**: [\`docs/BRICK_ARCHITECTURE_GUIDE.md\`](../BRICK_ARCHITECTURE_GUIDE.md)

## 1. Visual Identity & Pluggable Theme Adapter (\`ProfileBrandThemePort\`)
- **Host Brand Adapter Location**: \`src/adapters/user-profile-theme.adapter.ts\`
- **CSS Custom Property Namespace**: \`--ag-profile-*\` (\`--ag-profile-primary\`, \`--ag-profile-surface\`, \`--ag-profile-bg\`, \`--ag-profile-text\`, \`--ag-profile-radius-card\`, etc.)
- **Component Slot Overrides (\`ProfileUISlotsPort\`)**: Pass \`slots={{ CardWrapper, HeaderBanner, SocialButton, AvatarBadge, DangerZoneModal }}\` to \`<ProfileThemeProvider>\` to customize layout shells without modifying shared brick code.

---

## 2. Discovered Color Palette, Typography & Theme Tokens

<!-- ag-section:brand-tokens:start -->
_Progressive scaffold: automatically populated from \`src/adapters/*theme*.ts\`, \`tailwind.config.*\`, and CSS custom properties._
<!-- ag-section:brand-tokens:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-brand:start -->
_No legacy design system or brand book documents merged yet._
<!-- ag-section:legacy-brand:end -->
`,
    'docs/quality/TEST_PLAN_AND_SUITES.md': `<!-- antigravity-doc-sync -->
# 🧪 {{PROJECT_NAME}} — Test Plan & Verification Suites (\`docs/quality/TEST_PLAN_AND_SUITES.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Bug Records**: [\`docs/quality/BUG_FIX_RECORDS.md\`](BUG_FIX_RECORDS.md)

## 1. Verification Mandates & Quality Gates
1. **Deterministic Verification Before Completion**: Run \`npm test\` and \`npm run lint:memory\` before closing any backlog ticket.
2. **Mandatory Dual-Test Invariant for Every Bug Fix (\`BUG-*\`)**: Every bug fix MUST include both a dedicated **Unit/Component Non-Regression Test** and an **End-to-End (E2E) Test** verifying the integrated flow.
3. **Strict Live End-to-End Verification Before Closure (Mandate #6)**: Tickets involving OAuth providers or external APIs remain \`in_progress\` until live server credentials and end-to-end provider HTTP requests pass.

---

## 2. Discovered Automated Test Suites

<!-- ag-section:test-suites:start -->
_Progressive scaffold: automatically populated from discovered test files (\`tests/**\`, \`**/*.spec.*\`, \`**/*.test.*\`)._
<!-- ag-section:test-suites:end -->

---

## 3. Consolidated Project Specifications

<!-- ag-section:legacy-tests:start -->
_No legacy test plan or QA scenario documents merged yet._
<!-- ag-section:legacy-tests:end -->
`,
    'docs/quality/BUG_FIX_RECORDS.md': `<!-- antigravity-doc-sync -->
# 🐛 {{PROJECT_NAME}} — Bug Fix & Root-Cause Analysis Records (\`docs/quality/BUG_FIX_RECORDS.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Test Suites**: [\`docs/quality/TEST_PLAN_AND_SUITES.md\`](TEST_PLAN_AND_SUITES.md)

## 1. Structured Bug Resolution & Dual-Test Log (\`BUG-*\` & \`fix:\` Commits)

<!-- ag-section:bug-records:start -->
_Progressive scaffold: automatically populated from \`BUG-*\` tickets in \`docs/backlog.json\` and \`fix:\` commits._
<!-- ag-section:bug-records:end -->

---

## 2. Consolidated Historical Bug Records

<!-- ag-section:legacy-bugs:start -->
_No legacy \`BUG_FIX_RECORDS.md\` entries merged yet._
<!-- ag-section:legacy-bugs:end -->
`,
    'docs/operations/MIGRATION_AND_RELEASE_LOG.md': `<!-- antigravity-doc-sync -->
# 🚀 {{PROJECT_NAME}} — Migration, Brick & Release Log (\`docs/operations/MIGRATION_AND_RELEASE_LOG.md\`)

> **Index**: [\`docs/INDEX.md\`](../INDEX.md) · **Memory Progress**: [\`memory-bank/progress.md\`](../../memory-bank/progress.md)

## 1. Completed Milestones & Release Cutovers

<!-- ag-section:release-milestones:start -->
_Progressive scaffold: automatically populated from \`docs/backlog.json\` milestones and release commits._
<!-- ag-section:release-milestones:end -->

---

## 2. Database Migrations & Installed Hexagonal Bricks

<!-- ag-section:db-migrations:start -->
_Progressive scaffold: automatically populated from \`bricks/*/brick.json\` and SQL/Prisma migration files._
<!-- ag-section:db-migrations:end -->

---

## 3. Consolidated Historical Migration Boards

<!-- ag-section:legacy-migrations:start -->
_No legacy migration board documents merged yet._
<!-- ag-section:legacy-migrations:end -->
`
  };
  return map[relPath] || '';
}

function updateBoundedSection(docContent, sectionId, newInnerMarkdown) {
  const startMarker = `<!-- ag-section:${sectionId}:start -->`;
  const endMarker = `<!-- ag-section:${sectionId}:end -->`;
  const startIdx = docContent.indexOf(startMarker);
  const endIdx = docContent.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return docContent;
  }
  const before = docContent.slice(0, startIdx + startMarker.length);
  const after = docContent.slice(endIdx);
  return `${before}\n${newInnerMarkdown.trim()}\n${after}`;
}

function extractBoundedSection(docContent, sectionId) {
  const startMarker = `<!-- ag-section:${sectionId}:start -->`;
  const endMarker = `<!-- ag-section:${sectionId}:end -->`;
  const startIdx = docContent.indexOf(startMarker);
  const endIdx = docContent.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return '';
  return docContent.slice(startIdx + startMarker.length, endIdx).trim();
}

function isFileGitTracked(root, relPath) {
  try {
    execSync(`git ls-files --error-unmatch "${relPath}"`, { cwd: root, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function walkFiles(dir, predicate, maxDepth = 4, depth = 0, relPrefix = '') {
  const results = [];
  if (depth > maxDepth || !fsSync.existsSync(dir)) return results;
  try {
    const entries = fsSync.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (['node_modules', '.git', 'dist', 'build', '.next', '.expo', 'memory-backups', 'coverage', 'test-results', 'playwright-report'].includes(e.name)) {
        continue;
      }
      const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
      const full = path.join(dir, e.name);
      if (e.isFile()) {
        if (predicate(e.name, rel, full)) results.push({ name: e.name, relPath: rel, fullPath: full });
      } else if (e.isDirectory()) {
        results.push(...walkFiles(full, predicate, maxDepth, depth + 1, rel));
      }
    }
  } catch {}
  return results;
}

function inferProjectMeta(root, opts = {}) {
  const meta = {
    projectName: opts.projectName || path.basename(root),
    tagline: 'AI-native application',
    platforms: 'Web, iOS, Android & API',
    frontend: 'React / Next.js',
    backend: 'Node.js',
    db: 'PostgreSQL 16',
    port: '3000',
    health: 'http://localhost:3000/health'
  };

  const pkgPath = path.join(root, 'package.json');
  if (fsSync.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fsSync.readFileSync(pkgPath, 'utf8'));
      if (!opts.projectName && pkg.name) meta.projectName = pkg.name;
      if (pkg.description) meta.tagline = pkg.description;
    } catch {}
  }

  const agentsPath = path.join(root, 'AGENTS.md');
  if (fsSync.existsSync(agentsPath)) {
    try {
      const raw = fsSync.readFileSync(agentsPath, 'utf8');
      const titleMatch = raw.match(/^#\s+Antigravity Agent Directives\s+[—-]\s+([^\n]+)/m);
      if (titleMatch && !opts.projectName) meta.projectName = titleMatch[1].trim();
      const stackMatch = raw.match(/-\s+\*\*Stack\*\*:\s+([^·\n]+)·\s*([^·\n]+)·\s*([^·\n]+)·\s*Port\s+`(\d+)`\s*\(`([^`]+)`\)/);
      if (stackMatch) {
        meta.frontend = stackMatch[1].trim();
        meta.backend = stackMatch[2].trim();
        meta.db = stackMatch[3].trim();
        meta.port = stackMatch[4].trim();
        meta.health = stackMatch[5].trim();
      }
    } catch {}
  }

  return meta;
}

function interpolateTemplate(raw, meta) {
  return raw
    .replaceAll('{{PROJECT_NAME}}', meta.projectName)
    .replaceAll('{{PROJECT_TAGLINE}}', meta.tagline)
    .replaceAll('{{PLATFORMS}}', meta.platforms)
    .replaceAll('{{FRONTEND_TECH}}', meta.frontend)
    .replaceAll('{{BACKEND_TECH}}', meta.backend)
    .replaceAll('{{DATABASE_TECH}}', meta.db)
    .replaceAll('{{PORT}}', meta.port)
    .replaceAll('{{HEALTH_URL}}', meta.health);
}

/**
 * Rewrite markdown links across the repository when a legacy doc `fileName` (at root or `docs/<fileName>`)
 * is consolidated into `targetRel` (e.g. `docs/design/UX_BRIEF.md`).
 */
export function rewriteConsolidatedDocLinks(root, consolidations, dryRun = false) {
  if (!consolidations || consolidations.length === 0) return [];

  const mdFiles = walkFiles(
    root,
    (name, rel) => name.endsWith('.md') && !rel.startsWith('docs/archive/') && !rel.startsWith('templates/'),
    3
  );

  const rewritten = [];
  const escapedRoot = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const fileObj of mdFiles) {
    let content;
    try {
      content = fsSync.readFileSync(fileObj.fullPath, 'utf8');
    } catch {
      continue;
    }

    let updated = content;
    const fileDir = path.dirname(fileObj.fullPath);

    for (const item of consolidations) {
      const fileName = item.fileName;
      const fromRel = item.fromRel || `docs/${fileName}`;
      const fromInsideDocs = fromRel.replace(/^docs\//, '');
      const targetFull = path.join(root, item.targetRel);
      if (path.resolve(fileObj.fullPath) === path.resolve(targetFull)) continue;

      const relToTarget = path.relative(fileDir, targetFull).split(path.sep).join('/');
      const escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedFromInsideDocs = fromInsideDocs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. Rewrite file:// absolute links pointing to <root>/<fileName> or <root>/docs/<fromInsideDocs>
      const fileUrlRe = new RegExp(`(file://${escapedRoot})/(?:docs/)?(?:${escapedFromInsideDocs}|${escapedName})\\b`, 'g');
      updated = updated.replace(fileUrlRe, `$1/${item.targetRel}`);

      // 2. Rewrite markdown links: ](./docs/sub/FILE.md), ](docs/FILE.md), ](./FILE.md), ](sub/FILE.md)
      const mdLinkRe = new RegExp(
        `(\\]\\()(?:\\.\\.\\/docs\\/|\\.\\/docs\\/|docs\\/|\\.\\.\\/|\\.\\/)?(?:${escapedFromInsideDocs}|${escapedName})(#[^)]+)?(\\))`,
        'g'
      );
      updated = updated.replace(mdLinkRe, `$1${relToTarget}$2$3`);
    }

    if (updated !== content) {
      if (!dryRun) {
        fsSync.writeFileSync(fileObj.fullPath, updated, 'utf8');
      }
      rewritten.push(fileObj.relPath);
    }
  }

  return rewritten;
}

/**
 * Extract real codebase facts (0 AI tokens) to populate canonical sections
 */
function extractCodebaseFacts(root) {
  const facts = {
    bricks: [],
    backlogTasks: [],
    milestones: [],
    routesAndEntrypoints: [],
    schemas: [],
    envKeys: [],
    uxScreens: [],
    uxAttachments: [],
    brandTokens: [],
    testSuites: [],
    bugRecords: [],
    archivedDocs: [],
    harvestedKnowledge: harvestInPlaceRepoKnowledge(root)
  };

  // 1. Bricks (`bricks/*/brick.json`)
  const bricksDir = path.join(root, 'bricks');
  if (fsSync.existsSync(bricksDir)) {
    try {
      for (const d of fsSync.readdirSync(bricksDir, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        const mfPath = path.join(bricksDir, d.name, 'brick.json');
        if (fsSync.existsSync(mfPath)) {
          try {
            const mf = JSON.parse(fsSync.readFileSync(mfPath, 'utf8'));
            facts.bricks.push({
              name: mf.name || d.name,
              version: mf.version || '1.0.0',
              title: mf.title || d.name,
              platforms: (mf.installedPlatforms || mf.platforms || []).join(', '),
              providers: (mf.providers || []).join(', ')
            });
          } catch {}
        }
      }
    } catch {}
  }

  // 2. Backlog (`docs/backlog.json`)
  const backlogPath = path.join(root, 'docs', 'backlog.json');
  if (fsSync.existsSync(backlogPath)) {
    try {
      const bj = JSON.parse(fsSync.readFileSync(backlogPath, 'utf8'));
      facts.backlogTasks = Array.isArray(bj.tasks) ? bj.tasks : [];
      facts.milestones = Array.isArray(bj.milestones) ? bj.milestones : [];
    } catch {}
  }

  // 3. Routes, Pages & CLI Entrypoints
  const pkgPath = path.join(root, 'package.json');
  if (fsSync.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fsSync.readFileSync(pkgPath, 'utf8'));
      if (pkg.bin && typeof pkg.bin === 'object') {
        for (const [binName, binTarget] of Object.entries(pkg.bin)) {
          facts.routesAndEntrypoints.push({
            kind: 'CLI Binary',
            route: binName,
            source: String(binTarget)
          });
        }
      } else if (typeof pkg.bin === 'string') {
        facts.routesAndEntrypoints.push({
          kind: 'CLI Binary',
          route: pkg.name || 'cli',
          source: pkg.bin
        });
      }
    } catch {}
  }

  const routeFiles = walkFiles(
    root,
    (name, rel) =>
      /\.(ts|tsx|js|mjs)$/.test(name) &&
      (rel.startsWith('src/') || rel.startsWith('server/') || rel.startsWith('app/') || rel.startsWith('pages/') || rel.startsWith('apps/') || rel.startsWith('bin/') || rel.startsWith('lib/')),
    5
  );

  for (const rf of routeFiles.slice(0, 80)) {
    try {
      const raw = fsSync.readFileSync(rf.fullPath, 'utf8');
      const httpRe = /\b(?:app|router|fastify|server)\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
      let m;
      while ((m = httpRe.exec(raw)) !== null) {
        facts.routesAndEntrypoints.push({
          kind: `HTTP ${m[1].toUpperCase()}`,
          route: m[2],
          source: rf.relPath
        });
      }

      // Next.js App Router API Route Handlers (`app/**/route.{ts,tsx,js,mjs}`)
      if (/(?:^|\/)route\.(ts|tsx|js|mjs)$/.test(rf.relPath)) {
        const cleanRoute =
          '/' +
          rf.relPath
            .replace(/^(?:src\/)?app\//, '')
            .replace(/\/?route\.(ts|tsx|js|mjs)$/, '');
        const methodRe = /export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/g;
        let mm;
        let matchedAny = false;
        while ((mm = methodRe.exec(raw)) !== null) {
          matchedAny = true;
          facts.routesAndEntrypoints.push({
            kind: `HTTP ${mm[1].toUpperCase()}`,
            route: cleanRoute === '//' ? '/' : cleanRoute,
            source: rf.relPath
          });
        }
        if (!matchedAny) {
          facts.routesAndEntrypoints.push({
            kind: 'App Router Handler',
            route: cleanRoute === '//' ? '/' : cleanRoute,
            source: rf.relPath
          });
        }
      }

      // Next.js Pages Router API Handlers (`pages/api/**/*.{ts,js,mjs}`)
      if (/(?:^|\/)pages\/api\/.+\.(ts|tsx|js|mjs)$/.test(rf.relPath)) {
        const apiRoute =
          '/' +
          rf.relPath
            .replace(/^(?:src\/)?pages\//, '')
            .replace(/\.(ts|tsx|js|mjs)$/, '')
            .replace(/\/index$/, '');
        facts.routesAndEntrypoints.push({
          kind: 'Pages API Route',
          route: apiRoute,
          source: rf.relPath
        });
      }

      if (/\/page\.(tsx|jsx|ts|js)$/.test(rf.relPath)) {
        const routePath = '/' + rf.relPath.replace(/^.*?\bapp\//, '').replace(/\/?page\.(tsx|jsx|ts|js)$/, '');
        facts.uxScreens.push({
          screen: routePath === '//' ? '/' : routePath,
          platform: 'Web (Next.js App Router)',
          source: rf.relPath
        });
      }
    } catch {}
  }

  // Mobile & OAuth Manifest Discovery (`app.json`, `Info.plist`, `AndroidManifest.xml`)
  const appJsonPath = path.join(root, 'app.json');
  if (fsSync.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fsSync.readFileSync(appJsonPath, 'utf8'));
      const expo = appJson.expo || appJson;
      if (expo.scheme) {
        facts.routesAndEntrypoints.push({
          kind: 'Deep Link / OAuth Scheme',
          route: `${expo.scheme}://`,
          source: 'app.json'
        });
      }
    } catch {}
  }

  const mobileManifests = walkFiles(
    root,
    (name) => name === 'Info.plist' || name === 'AndroidManifest.xml',
    4
  );
  for (const mm of mobileManifests.slice(0, 10)) {
    try {
      const raw = fsSync.readFileSync(mm.fullPath, 'utf8');
      if (mm.name === 'AndroidManifest.xml') {
        const schemeMatch = raw.match(/android:scheme="([^"]+)"/);
        if (schemeMatch) {
          facts.routesAndEntrypoints.push({
            kind: 'Android URL Scheme',
            route: `${schemeMatch[1]}://`,
            source: mm.relPath
          });
        }
      } else if (mm.name === 'Info.plist' && raw.includes('CFBundleURLSchemes')) {
        const afterKey = raw.split('CFBundleURLSchemes')[1] || '';
        const strMatch = afterKey.match(/<string>([^<]+)<\/string>/);
        if (strMatch) {
          facts.routesAndEntrypoints.push({
            kind: 'iOS URL Scheme',
            route: `${strMatch[1]}://`,
            source: mm.relPath
          });
        }
      }
    } catch {}
  }

  // Discover platform UI components in bricks or src
  const uiFiles = walkFiles(
    root,
    (name, rel) =>
      /\.(tsx|swift|kt)$/.test(name) &&
      (rel.includes('themed-ui') || rel.includes('components') || rel.includes('screens') || rel.includes('views')),
    5
  );
  for (const uf of uiFiles.slice(0, 25)) {
    const plat = uf.name.endsWith('.swift') ? 'iOS (SwiftUI)' : uf.name.endsWith('.kt') ? 'Android (Compose)' : 'Web (React)';
    facts.uxScreens.push({
      screen: uf.name.replace(/\.(tsx|swift|kt)$/, ''),
      platform: plat,
      source: uf.relPath
    });
  }

  // 4. Deep Database & Schema Files (`*.sql`, `*.prisma`, `*schema*.ts`, `bricks/**/core/*.mjs`)
  const schemaFiles = walkFiles(
    root,
    (name, rel) =>
      name.endsWith('.prisma') ||
      name.endsWith('.sql') ||
      /schema/i.test(name) ||
      (rel.startsWith('bricks/') && rel.includes('/core/') && /\.(ts|js|mjs)$/.test(name)),
    5
  );
  for (const sf of schemaFiles.slice(0, 35)) {
    const entities = [];
    try {
      const raw = fsSync.readFileSync(sf.fullPath, 'utf8');
      if (sf.name.endsWith('.prisma')) {
        const modelRe = /^\s*model\s+([A-Za-z0-9_]+)\s*\{/gm;
        let m;
        while ((m = modelRe.exec(raw)) !== null) {
          entities.push(`model ${m[1]}`);
        }
      } else if (sf.name.endsWith('.sql')) {
        const sqlRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([A-Za-z0-9_.]+)["`]?/gi;
        let m;
        while ((m = sqlRe.exec(raw)) !== null) {
          entities.push(`table ${m[1]}`);
        }
      } else {
        const zodRe = /export\s+(?:const|function|interface|type)\s+([A-Za-z0-9_]*(?:Schema|Port|Profile|Account|Session|validate[A-Za-z0-9_]+))\b/g;
        let m;
        while ((m = zodRe.exec(raw)) !== null && entities.length < 6) {
          if (!entities.includes(m[1])) entities.push(m[1]);
        }
      }
    } catch {}
    const entitySuffix = entities.length > 0 ? ` (${entities.slice(0, 5).join(', ')})` : '';
    facts.schemas.push({
      name: `${sf.name}${entitySuffix}`,
      relPath: sf.relPath
    });
  }

  // 5. Environment Variable Keys (Masked)
  for (const envName of ['.env.example', '.env', '.env.local']) {
    const ep = path.join(root, envName);
    if (!fsSync.existsSync(ep)) continue;
    try {
      const raw = fsSync.readFileSync(ep, 'utf8');
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, '');
        const val = trimmed.slice(eq + 1).trim();
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
        if (facts.envKeys.some((x) => x.key === key)) continue;
        const masked = SENSITIVE_KEY_REGEX.test(key)
          ? (val ? '`***` (secret configured)' : 'template placeholder (secret)')
          : (val ? `\`${val.slice(0, 40)}\`` : 'empty');
        facts.envKeys.push({ key, source: envName, status: masked });
      }
    } catch {}
  }

  // 6. Brand & Theme Tokens
  const themeCandidates = walkFiles(
    root,
    (name, rel) =>
      /theme/i.test(name) ||
      name.startsWith('tailwind.config') ||
      name.endsWith('.css'),
    5
  );
  for (const tf of themeCandidates.slice(0, 20)) {
    try {
      const raw = fsSync.readFileSync(tf.fullPath, 'utf8');
      const cssVarRe = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;'"}\n]+)/g;
      let m;
      while ((m = cssVarRe.exec(raw)) !== null && facts.brandTokens.length < 25) {
        if (!facts.brandTokens.some((t) => t.token === m[1])) {
          facts.brandTokens.push({
            token: m[1],
            value: m[2].trim().slice(0, 40),
            source: tf.relPath
          });
        }
      }
      const hexRe = /([a-zA-Z0-9_]+)\s*:\s*['"](#[0-9a-fA-F]{3,8})['"]/g;
      while ((m = hexRe.exec(raw)) !== null && facts.brandTokens.length < 25) {
        if (!facts.brandTokens.some((t) => t.token === m[1])) {
          facts.brandTokens.push({
            token: m[1],
            value: m[2],
            source: tf.relPath
          });
        }
      }
    } catch {}
  }

  // 7. Test Suites (`tests/**`, `**/*.spec.*`, `**/*.test.*`)
  const testFiles = walkFiles(
    root,
    (name) => /\.(test|spec)\.(js|mjs|cjs|ts|tsx)$/.test(name),
    4
  );
  for (const tf of testFiles) {
    facts.testSuites.push({
      name: tf.name,
      relPath: tf.relPath,
      type: tf.relPath.includes('e2e') ? 'End-to-End (E2E)' : tf.relPath.includes('contract') ? 'Hexagonal Contract' : 'Unit / Integration'
    });
  }

  // 8. UX Attachments (`docs/attachments/`)
  const attachDir = path.join(root, 'docs', 'attachments');
  if (fsSync.existsSync(attachDir)) {
    const attFiles = walkFiles(attachDir, () => true, 3, 0, 'docs/attachments');
    for (const af of attFiles.slice(0, 25)) {
      facts.uxAttachments.push(af.relPath);
    }
  }

  // 9. Bug Records (`BUG-*` in backlog.json + `fix:` commits)
  for (const t of facts.backlogTasks) {
    if (String(t.id).startsWith('BUG-') || t.type === 'bug') {
      facts.bugRecords.push({
        id: t.id,
        title: t.title,
        status: (t.status || 'todo').toUpperCase(),
        summary: (t.description || t.spec || 'Recorded in backlog.json').slice(0, 140),
        components: Array.isArray(t.components) ? t.components.join(', ') : ''
      });
    }
  }

  if (fsSync.existsSync(path.join(root, '.git'))) {
    try {
      const gitFixes = execSync('git log --grep="^fix" -n 10 --pretty=format:"%h|%s|%ad" --date=short', {
        cwd: root,
        stdio: 'pipe'
      })
        .toString()
        .trim();
      if (gitFixes) {
        for (const line of gitFixes.split('\n')) {
          const [hash, subject] = line.split('|');
          if (hash && subject && !facts.bugRecords.some((b) => b.title === subject)) {
            facts.bugRecords.push({
              id: `COMMIT-${hash}`,
              title: subject,
              status: 'DONE',
              summary: `Git fix commit \`${hash}\``,
              components: 'git history'
            });
          }
        }
      }
    } catch {}
  }

  // 10. Archived Legacy Docs (`docs/archive/*.md`)
  const archiveDir = path.join(root, 'docs', 'archive');
  if (fsSync.existsSync(archiveDir)) {
    try {
      for (const f of fsSync.readdirSync(archiveDir).filter((x) => x.endsWith('.md')).sort()) {
        let archivedRaw = '';
        try {
          archivedRaw = fsSync.readFileSync(path.join(archiveDir, f), 'utf8');
        } catch {}
        const classified = classifyMarkdownDocument(`docs/${f}`, archivedRaw);
        facts.archivedDocs.push({
          fileName: f,
          archiveRel: `archive/${f}`,
          targetRel: classified ? classified.targetRel.replace(/^docs\//, '') : 'INDEX.md'
        });
      }
    } catch {}
  }

  return facts;
}

/**
 * Scaffold, consolidate legacy docs, and auto-synthesize all 9 canonical living documents.
 */
export async function synthesizeLivingDocs(targetDir, opts = {}) {
  const root = path.resolve(targetDir);
  const dryRun = Boolean(opts.dryRun);
  const quiet = Boolean(opts.quiet);
  const pkgRoot = opts.pkgRoot || path.resolve(__dirname, '..');
  const hasGit = fsSync.existsSync(path.join(root, '.git'));
  const meta = inferProjectMeta(root, opts);

  const subdirs = [
    'docs',
    'docs/architecture',
    'docs/design',
    'docs/quality',
    'docs/operations'
  ];

  if (!dryRun) {
    for (const d of subdirs) {
      fsSync.mkdirSync(path.join(root, d), { recursive: true });
    }
  }

  // 1. Ensure all 9 canonical living documents exist from templates (or built-in fallback)
  const createdDocs = [];
  for (const docSpec of CANONICAL_LIVING_DOCS) {
    const destFull = path.join(root, docSpec.relPath);
    if (!fsSync.existsSync(destFull)) {
      let tplRaw = '';
      const tplCandidate = path.join(pkgRoot, 'templates', docSpec.templateRel);
      if (fsSync.existsSync(tplCandidate)) {
        tplRaw = fsSync.readFileSync(tplCandidate, 'utf8');
      } else {
        tplRaw = getDefaultTemplateContent(docSpec.relPath);
      }
      const populated = interpolateTemplate(tplRaw, meta);
      if (!dryRun) {
        fsSync.mkdirSync(path.dirname(destFull), { recursive: true });
        fsSync.writeFileSync(destFull, populated, 'utf8');
      }
      createdDocs.push(docSpec.relPath);
    }
  }

  // 2. Crawl `docs/**/*.md` (top-level & nested custom subdirectories) and classify/consolidate non-preserved specs
  const docsDir = path.join(root, 'docs');
  const consolidatedLegacy = [];
  if (fsSync.existsSync(docsDir)) {
    const candidateDocs = walkFiles(
      docsDir,
      (name, relInsideDocs) => {
        if (!name.endsWith('.md')) return false;
        const fullRel = `docs/${relInsideDocs}`.toLowerCase();
        if (PRESERVED_DOCS_REL_PATHS.has(fullRel)) return false;
        if (
          relInsideDocs.startsWith('archive/') ||
          relInsideDocs.startsWith('planning/') ||
          relInsideDocs.startsWith('attachments/') ||
          relInsideDocs.startsWith('architecture/') ||
          relInsideDocs.startsWith('design/') ||
          relInsideDocs.startsWith('quality/') ||
          relInsideDocs.startsWith('operations/')
        ) {
          return false;
        }
        return true;
      },
      4
    );

    for (const docFile of candidateDocs) {
      const legacyFull = docFile.fullPath;
      const fromRel = `docs/${docFile.relPath}`;
      let legacyContent = '';
      try {
        legacyContent = fsSync.readFileSync(legacyFull, 'utf8').trim();
      } catch {
        continue;
      }

      const mapping = classifyMarkdownDocument(fromRel, legacyContent);
      const targetFull = path.join(root, mapping.targetRel);
      const archiveDir = path.join(docsDir, 'archive');
      const archiveFileName = docFile.name;
      const archiveFull = path.join(archiveDir, archiveFileName);

      if (!dryRun && fsSync.existsSync(legacyFull) && fsSync.existsSync(targetFull)) {
        let targetContent = fsSync.readFileSync(targetFull, 'utf8');
        const currentSection = extractBoundedSection(targetContent, mapping.sectionId);
        const sourceTagStart = `<!-- merged-source:${fromRel}:start -->`;
        const sourceTagEnd = `<!-- merged-source:${fromRel}:end -->`;

        const mergedBlock = `${sourceTagStart}\n### Consolidated from \`${fromRel}\` (Archived at [\`docs/archive/${archiveFileName}\`](../archive/${archiveFileName}))\n\n${legacyContent}\n${sourceTagEnd}`;

        let nextSection = currentSection;
        if (currentSection.includes(sourceTagStart) && currentSection.includes(sourceTagEnd)) {
          const sIdx = currentSection.indexOf(sourceTagStart);
          const eIdx = currentSection.indexOf(sourceTagEnd) + sourceTagEnd.length;
          nextSection = currentSection.slice(0, sIdx) + mergedBlock + currentSection.slice(eIdx);
        } else if (currentSection.startsWith('_No legacy ')) {
          nextSection = mergedBlock;
        } else {
          nextSection = `${currentSection}\n\n---\n\n${mergedBlock}`;
        }

        targetContent = updateBoundedSection(targetContent, mapping.sectionId, nextSection);
        fsSync.writeFileSync(targetFull, targetContent, 'utf8');

        // Archive original file in docs/archive/<name>
        fsSync.mkdirSync(archiveDir, { recursive: true });
        const relTo = path.join('docs', 'archive', archiveFileName);
        let movedByGit = false;
        if (hasGit && isFileGitTracked(root, fromRel)) {
          try {
            execSync(`git mv -f "${fromRel}" "${relTo}"`, { cwd: root, stdio: 'pipe' });
            movedByGit = true;
          } catch {}
        }
        if (!movedByGit) {
          fsSync.copyFileSync(legacyFull, archiveFull);
          fsSync.rmSync(legacyFull, { force: true });
        }

        // Remove empty custom parent directory inside docs/ if applicable
        const parentDir = path.dirname(legacyFull);
        if (path.resolve(parentDir) !== path.resolve(docsDir)) {
          try {
            if (fsSync.readdirSync(parentDir).length === 0) {
              fsSync.rmdirSync(parentDir);
            }
          } catch {}
        }
      }

      consolidatedLegacy.push({
        fileName: docFile.name,
        fromRel,
        archiveRel: `docs/archive/${archiveFileName}`,
        targetRel: mapping.targetRel,
        confidence: mapping.confidence
      });
      if (!quiet) {
        console.log(
          `  ✓ Consolidated \`${fromRel}\` → \`${mapping.targetRel}\` (${mapping.confidence}, archived in \`docs/archive/${archiveFileName}\`)`
        );
      }
    }
  }

  // 3. Rewrite relative & file:// markdown links for any consolidated legacy docs
  const rewrittenLinks = rewriteConsolidatedDocLinks(root, consolidatedLegacy, dryRun);
  if (rewrittenLinks.length > 0 && !quiet) {
    console.log(`  ✓ Rewrote consolidated doc links in ${rewrittenLinks.length} file(s): ${rewrittenLinks.join(', ')}`);
  }

  if (dryRun) {
    return { createdDocs, consolidatedLegacy, rewrittenLinks, updatedDocs: [] };
  }

  // 4. Extract codebase facts and progressively update bounded sections across all 9 canonical docs
  const facts = extractCodebaseFacts(root);
  const updatedDocs = [];

  const writeDocSectionUpdates = (relPath, updater) => {
    const full = path.join(root, relPath);
    if (!fsSync.existsSync(full)) return false;
    const before = fsSync.readFileSync(full, 'utf8');
    const after = updater(before);
    if (after !== before) {
      fsSync.writeFileSync(full, after, 'utf8');
      updatedDocs.push(relPath);
      return true;
    }
    return false;
  };

  // 4a. LOGICAL_ARCHITECTURE.md
  writeDocSectionUpdates('docs/architecture/LOGICAL_ARCHITECTURE.md', (content) => {
    let next = content;
    const entityRows = [
      '| Module / Brick | Responsibility | Status |',
      '| :--- | :--- | :--- |',
      '| `core` | Primary domain & application services | 🟢 Active |'
    ];
    for (const b of facts.bricks) {
      entityRows.push(`| \`bricks/${b.name}\` (\`v${b.version}\`) | ${b.title} (${b.providers || b.platforms}) | 🟢 Installed (${b.platforms}) |`);
    }
    next = updateBoundedSection(next, 'logical-entities', entityRows.join('\n'));

    const featTasks = facts.backlogTasks.filter((t) => String(t.id).startsWith('FEAT-') || t.type === 'feature');
    if (featTasks.length > 0) {
      const featRows = [
        '| Feature ID | Capability / Title | Status | Target Components |',
        '| :--- | :--- | :--- | :--- |'
      ];
      for (const ft of featTasks.slice(-20)) {
        const stBadge = ft.status === 'done' ? '🟢 DONE' : ft.status === 'in_progress' ? '⚡ IN PROGRESS' : '📋 TODO';
        const comps = Array.isArray(ft.components) && ft.components.length > 0 ? `\`${ft.components.slice(0, 3).join('`, `')}\`` : '—';
        featRows.push(`| **\`${ft.id}\`** | ${ft.title.replace(/\|/g, '\\|')} | ${stBadge} | ${comps} |`);
      }
      next = updateBoundedSection(next, 'logical-features', featRows.join('\n'));
    }
    return next;
  });

  // 4b. TECHNICAL_ARCHITECTURE.md
  writeDocSectionUpdates('docs/architecture/TECHNICAL_ARCHITECTURE.md', (content) => {
    let next = content;
    if (facts.routesAndEntrypoints.length > 0) {
      const rows = [
        '| Kind | Route / Binary | Source File |',
        '| :--- | :--- | :--- |'
      ];
      for (const r of facts.routesAndEntrypoints.slice(0, 25)) {
        rows.push(`| **${r.kind}** | \`${r.route}\` | \`${r.source}\` |`);
      }
      next = updateBoundedSection(next, 'api-endpoints', rows.join('\n'));
    }
    if (facts.schemas.length > 0) {
      const sRows = [
        '| Schema / Model File | Path |',
        '| :--- | :--- |'
      ];
      for (const s of facts.schemas) {
        sRows.push(`| **\`${s.name}\`** | \`${s.relPath}\` |`);
      }
      next = updateBoundedSection(next, 'db-schemas', sRows.join('\n'));
    }
    return next;
  });

  // 4c. SECURITY_AND_COMPLIANCE.md
  writeDocSectionUpdates('docs/architecture/SECURITY_AND_COMPLIANCE.md', (content) => {
    let next = content;
    if (facts.envKeys.length > 0) {
      const rows = [
        '| Environment Key | Source File | Masked Status |',
        '| :--- | :--- | :--- |'
      ];
      for (const ek of facts.envKeys.slice(0, 35)) {
        rows.push(`| \`${ek.key}\` | \`${ek.source}\` | ${ek.status} |`);
      }
      next = updateBoundedSection(next, 'security-env', rows.join('\n'));
    }
    return next;
  });

  // 4d. UX_BRIEF.md
  writeDocSectionUpdates('docs/design/UX_BRIEF.md', (content) => {
    let next = content;
    if (facts.uxScreens.length > 0) {
      const rows = [
        '| Screen / Component | Platform | Source Path |',
        '| :--- | :--- | :--- |'
      ];
      for (const sc of facts.uxScreens.slice(0, 25)) {
        rows.push(`| **\`${sc.screen}\`** | ${sc.platform} | \`${sc.source}\` |`);
      }
      next = updateBoundedSection(next, 'ux-screens', rows.join('\n'));
    }
    if (facts.uxAttachments.length > 0) {
      const attLines = facts.uxAttachments.map((a) => `- \`${a}\``).join('\n');
      next = updateBoundedSection(next, 'ux-attachments', attLines);
    }
    return next;
  });

  // 4e. BRAND_BOOK.md
  writeDocSectionUpdates('docs/design/BRAND_BOOK.md', (content) => {
    let next = content;
    if (facts.brandTokens.length > 0) {
      const rows = [
        '| Design Token | Default / Value | Source File |',
        '| :--- | :--- | :--- |'
      ];
      for (const bt of facts.brandTokens.slice(0, 25)) {
        rows.push(`| \`${bt.token}\` | \`${bt.value}\` | \`${bt.source}\` |`);
      }
      next = updateBoundedSection(next, 'brand-tokens', rows.join('\n'));
    }
    return next;
  });

  // 4f. TEST_PLAN_AND_SUITES.md
  writeDocSectionUpdates('docs/quality/TEST_PLAN_AND_SUITES.md', (content) => {
    let next = content;
    if (facts.testSuites.length > 0) {
      const rows = [
        '| Suite File | Verification Tier | Relative Path |',
        '| :--- | :--- | :--- |'
      ];
      for (const ts of facts.testSuites) {
        rows.push(`| **\`${ts.name}\`** | ${ts.type} | \`${ts.relPath}\` |`);
      }
      next = updateBoundedSection(next, 'test-suites', rows.join('\n'));
    }
    return next;
  });

  // 4g. BUG_FIX_RECORDS.md
  writeDocSectionUpdates('docs/quality/BUG_FIX_RECORDS.md', (content) => {
    let next = content;
    if (facts.bugRecords.length > 0) {
      const rows = [
        '| Bug / Commit ID | Title & Root-Cause Summary | Status | Target Components |',
        '| :--- | :--- | :--- | :--- |'
      ];
      for (const b of facts.bugRecords.slice(0, 25)) {
        rows.push(
          `| **\`${b.id}\`** | ${b.title.replace(/\|/g, '\\|')} — ${b.summary.replace(/\|/g, '\\|')} | ${b.status} | \`${b.components || 'core'}\` |`
        );
      }
      next = updateBoundedSection(next, 'bug-records', rows.join('\n'));
    }
    return next;
  });

  // 4h. MIGRATION_AND_RELEASE_LOG.md
  writeDocSectionUpdates('docs/operations/MIGRATION_AND_RELEASE_LOG.md', (content) => {
    let next = content;
    if (facts.milestones.length > 0) {
      const rows = [
        '| Milestone ID | Title | Status |',
        '| :--- | :--- | :--- |'
      ];
      for (const m of facts.milestones) {
        rows.push(`| **\`${m.id}\`** | ${m.title.replace(/\|/g, '\\|')} | ${(m.status || 'done').toUpperCase()} |`);
      }
      next = updateBoundedSection(next, 'release-milestones', rows.join('\n'));
    }
    if (facts.bricks.length > 0 || facts.schemas.length > 0) {
      const lines = [];
      for (const b of facts.bricks) {
        lines.push(`- **Hexagonal Brick**: \`bricks/${b.name}@${b.version}\` — ${b.title} (Platforms: \`${b.platforms}\`)`);
      }
      for (const s of facts.schemas) {
        lines.push(`- **Schema / Migration**: \`${s.relPath}\` — ${s.name}`);
      }
      next = updateBoundedSection(next, 'db-migrations', lines.join('\n'));
    }
    return next;
  });

  // 4h-bis. Inject non-destructively harvested repo knowledge (`README.md`, `SECURITY.md`, `CHANGELOG.md`, `memory-bank/*.md`)
  for (const rule of PILLAR_CLASSIFICATION_RULES) {
    const items = facts.harvestedKnowledge?.[rule.sectionId] || [];
    if (items.length === 0) continue;
    writeDocSectionUpdates(rule.targetRel, (content) => {
      const currentSection = extractBoundedSection(content, rule.sectionId);
      const hStart = '<!-- harvested-repo-context:start -->';
      const hEnd = '<!-- harvested-repo-context:end -->';
      const harvestedBlock = `${hStart}\n### Harvested Repository & Memory-Bank Context\n\n${items.slice(0, 8).join('\n\n')}\n${hEnd}`;

      let nextSection = currentSection;
      if (currentSection.includes(hStart) && currentSection.includes(hEnd)) {
        const sIdx = currentSection.indexOf(hStart);
        const eIdx = currentSection.indexOf(hEnd) + hEnd.length;
        nextSection = currentSection.slice(0, sIdx) + harvestedBlock + currentSection.slice(eIdx);
      } else if (currentSection.startsWith('_No legacy ') || currentSection.startsWith('_No standalone legacy ')) {
        nextSection = harvestedBlock;
      } else {
        nextSection = `${currentSection}\n\n---\n\n${harvestedBlock}`;
      }
      return updateBoundedSection(content, rule.sectionId, nextSection);
    });
  }

  // 4h-ter. Synthesize docs/design/DESIGN.md from BRAND_BOOK.md, UX_BRIEF.md, tokens, screens & all harvested design docs
  writeDocSectionUpdates('docs/design/DESIGN.md', (content) => {
    let next = content;
    const brandPath = path.join(root, 'docs', 'design', 'BRAND_BOOK.md');
    const uxPath = path.join(root, 'docs', 'design', 'UX_BRIEF.md');
    const brandRaw = fsSync.existsSync(brandPath) ? fsSync.readFileSync(brandPath, 'utf8') : '';
    const uxRaw = fsSync.existsSync(uxPath) ? fsSync.readFileSync(uxPath, 'utf8') : '';

    // 1. Brand Tokens & Palette Summary (from BRAND_BOOK.md & codebase tokens)
    const brandSummaryLines = [
      '- **Source Brand Specification**: [`docs/design/BRAND_BOOK.md`](BRAND_BOOK.md)',
      '- **Theme Adapter Contract**: `ProfileBrandThemePort` (`--ag-profile-*`) & `ProfileUISlotsPort` (`src/adapters/user-profile-theme.adapter.ts`)'
    ];
    if (facts.brandTokens.length > 0) {
      brandSummaryLines.push(
        '',
        '| Design Token | Default / Value | Source File |',
        '| :--- | :--- | :--- |'
      );
      for (const bt of facts.brandTokens.slice(0, 25)) {
        brandSummaryLines.push(`| \`${bt.token}\` | \`${bt.value}\` | \`${bt.source}\` |`);
      }
    }
    next = updateBoundedSection(next, 'design-brand-summary', brandSummaryLines.join('\n'));

    // 2. UX Screens, Flows & Bundles Summary (from UX_BRIEF.md & codebase screens)
    const uxSummaryLines = [
      '- **Source UX Specification**: [`docs/design/UX_BRIEF.md`](UX_BRIEF.md)'
    ];
    if (facts.uxScreens.length > 0) {
      uxSummaryLines.push(
        '',
        '| Screen / Component | Platform | Source Path |',
        '| :--- | :--- | :--- |'
      );
      for (const sc of facts.uxScreens.slice(0, 25)) {
        uxSummaryLines.push(`| **\`${sc.screen}\`** | ${sc.platform} | \`${sc.source}\` |`);
      }
    }
    if (facts.uxAttachments.length > 0) {
      uxSummaryLines.push('', '### Attached UX/UI Bundles (`docs/attachments/`)');
      for (const att of facts.uxAttachments) {
        uxSummaryLines.push(`- \`${att}\``);
      }
    }
    next = updateBoundedSection(next, 'design-ux-summary', uxSummaryLines.join('\n'));

    // 3. Cross-Harvested Design Specifications Rollup (from BRAND_BOOK.md, UX_BRIEF.md, legacy-design & harvested design docs)
    const rollupBlocks = [];
    const legacyBrandSection = extractBoundedSection(brandRaw, 'legacy-brand');
    if (legacyBrandSection && !legacyBrandSection.startsWith('_No legacy ')) {
      rollupBlocks.push(`### Harvested from [\`docs/design/BRAND_BOOK.md\`](BRAND_BOOK.md)\n\n${legacyBrandSection}`);
    }
    const legacyUxSection = extractBoundedSection(uxRaw, 'legacy-ux');
    if (legacyUxSection && !legacyUxSection.startsWith('_No legacy ')) {
      rollupBlocks.push(`### Harvested from [\`docs/design/UX_BRIEF.md\`](UX_BRIEF.md)\n\n${legacyUxSection}`);
    }
    const directDesignItems = [
      ...(facts.harvestedKnowledge?.['legacy-design'] || []),
      ...(facts.harvestedKnowledge?.['legacy-brand'] || []),
      ...(facts.harvestedKnowledge?.['legacy-ux'] || [])
    ];
    const uniqueDesignItems = Array.from(new Set(directDesignItems));
    if (uniqueDesignItems.length > 0 && rollupBlocks.length === 0) {
      rollupBlocks.push(`### Harvested Repository & Memory-Bank Design Context\n\n${uniqueDesignItems.slice(0, 10).join('\n\n')}`);
    }
    if (rollupBlocks.length > 0) {
      next = updateBoundedSection(next, 'design-harvested-rollup', rollupBlocks.join('\n\n---\n\n'));
    }
    return next;
  });

  // 4i. Update docs/INDEX.md status badges (`🟢 Populated` vs `🟡 Progressive Scaffold`) & archived legacy docs
  writeDocSectionUpdates('docs/INDEX.md', (content) => {
    let next = content;
    const matrixRows = [
      '| Domain | Living Document | Status | Auto-Sync & Progressive Triggers |',
      '| :--- | :--- | :--- | :--- |'
    ];
    for (const docSpec of CANONICAL_LIVING_DOCS.slice(1)) {
      const full = path.join(root, docSpec.relPath);
      const shortRel = docSpec.relPath.replace(/^docs\//, '');
      let isPopulated = false;
      if (fsSync.existsSync(full)) {
        const raw = fsSync.readFileSync(full, 'utf8');
        isPopulated =
          raw.includes('| **') ||
          raw.includes('<!-- merged-source:') ||
          raw.includes('<!-- harvested-repo-context:start -->') ||
          raw.includes('- **Hexagonal Brick**:') ||
          raw.includes('| `--');
      }
      const badge = isPopulated ? '🟢 Populated & Auto-Synced' : '🟡 Progressive Scaffold';
      matrixRows.push(`| **${docSpec.domain}** | [\`${shortRel}\`](${shortRel}) | ${badge} | ${docSpec.triggers} |`);
    }
    next = updateBoundedSection(next, 'doc-index-matrix', matrixRows.join('\n'));

    if (facts.archivedDocs.length > 0) {
      const archRows = [
        '| Archived File | Consolidated Into Canonical Spec |',
        '| :--- | :--- |'
      ];
      for (const ad of facts.archivedDocs) {
        archRows.push(`| [\`${ad.archiveRel}\`](${ad.archiveRel}) | [\`${ad.targetRel}\`](${ad.targetRel}) |`);
      }
      next = updateBoundedSection(next, 'archived-legacy-docs', archRows.join('\n'));
    }
    return next;
  });

  if (!quiet && (createdDocs.length > 0 || updatedDocs.length > 0)) {
    console.log(
      `  ✓ Synchronized Canonical Living Docs Hierarchy (${CANONICAL_LIVING_DOCS.length}/10 docs active, ${consolidatedLegacy.length} legacy file(s) consolidated)`
    );
  }

  return {
    createdDocs,
    consolidatedLegacy,
    rewrittenLinks,
    updatedDocs
  };
}

/**
 * Audit that all 9 canonical living documents exist and all relative markdown links in `docs/INDEX.md` resolve.
 */
export function validateLivingDocsHierarchy(targetDir) {
  const root = path.resolve(targetDir);
  const missingDocs = [];
  const brokenLinks = [];

  for (const spec of CANONICAL_LIVING_DOCS) {
    const full = path.join(root, spec.relPath);
    if (!fsSync.existsSync(full)) {
      missingDocs.push(spec.relPath);
    }
  }

  const indexPath = path.join(root, 'docs', 'INDEX.md');
  if (fsSync.existsSync(indexPath)) {
    const raw = fsSync.readFileSync(indexPath, 'utf8');
    const linkRe = /\]\(([^)#\s]+)(?:#[^)]*)?\)/g;
    let m;
    while ((m = linkRe.exec(raw)) !== null) {
      const linkTarget = m[1];
      if (/^(https?:|mailto:|file:)/i.test(linkTarget)) continue;
      const resolved = path.resolve(path.dirname(indexPath), linkTarget);
      if (!fsSync.existsSync(resolved)) {
        brokenLinks.push(linkTarget);
      }
    }
  }

  return {
    ok: missingDocs.length === 0 && brokenLinks.length === 0,
    missingDocs,
    brokenLinks
  };
}

// CLI entrypoint when invoked directly (`node scripts/sync-living-docs.mjs [--quiet] [--lint]`)
let resolvedArgv1 = '';
try {
  resolvedArgv1 = process.argv[1] ? fsSync.realpathSync(process.argv[1]) : '';
} catch {
  resolvedArgv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
}
const isCliEntrypoint = Boolean(resolvedArgv1 && import.meta.url === pathToFileURL(resolvedArgv1).href);
if (isCliEntrypoint) {
  const cliArgs = process.argv.slice(2);
  const quiet = cliArgs.includes('--quiet') || cliArgs.includes('-q');
  const lintOnly = cliArgs.includes('--lint');
  const repoRoot = fsSync.existsSync(path.join(path.resolve(__dirname, '..'), 'docs'))
    ? path.resolve(__dirname, '..')
    : process.cwd();

  if (lintOnly) {
    const res = validateLivingDocsHierarchy(repoRoot);
    if (!res.ok) {
      console.error('❌ Canonical Living Docs audit failed:', res);
      process.exit(1);
    }
    if (!quiet) {
      console.log('✅ All 10 Canonical Living Docs exist with 0 broken links in docs/INDEX.md.');
    }
    process.exit(0);
  }

  synthesizeLivingDocs(repoRoot, { quiet }).catch((err) => {
    if (!quiet) console.error('⚠️ Living docs sync warning:', err.message);
    process.exit(1);
  });
}
