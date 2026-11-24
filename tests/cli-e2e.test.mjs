/**
 * Antigravity Memory Bank — Zero-Dependency E2E CLI & Template Parity Test Suite
 *
 * Exercises:
 *  - FEAT-112: Byte-identity parity between scripts/backlog.mjs and templates/scripts/backlog.mjs
 *              (plus negative test verifying lint-memory.mjs fails on divergence)
 *  - FEAT-111: Full CLI lifecycle (init, upgrade, sync, export, uninstall) in an isolated
 *              temporary repository and hermetic HOME directory, asserting 100% preservation
 *              of custom memory-bank/*.md domain files across upgrades.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(REPO_ROOT, 'bin', 'cli.mjs');
const LINTER_PATH = path.join(REPO_ROOT, 'scripts', 'lint-memory.mjs');

describe('FEAT-112: Upstream Template Byte-Parity Verification', () => {
  test('scripts/backlog.mjs and templates/scripts/backlog.mjs are byte-identical', () => {
    const srcBuf = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'backlog.mjs'));
    const tplBuf = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'scripts', 'backlog.mjs'));
    assert.equal(
      Buffer.compare(srcBuf, tplBuf),
      0,
      'scripts/backlog.mjs and templates/scripts/backlog.mjs must be 100% byte-identical'
    );
  });

  test('skills/backlog-start/SKILL.md and .agents/skills/backlog-start/SKILL.md are byte-identical', () => {
    const srcBuf = fs.readFileSync(path.join(REPO_ROOT, 'skills', 'backlog-start', 'SKILL.md'));
    const agentBuf = fs.readFileSync(path.join(REPO_ROOT, '.agents', 'skills', 'backlog-start', 'SKILL.md'));
    assert.equal(
      Buffer.compare(srcBuf, agentBuf),
      0,
      'skills/backlog-start/SKILL.md and .agents/skills/backlog-start/SKILL.md must be byte-identical'
    );
  });

  test('scripts/lint-memory.mjs fails with non-zero exit code when backlog.mjs and template diverge', () => {
    const tmpAuditDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-parity-test-'));
    try {
      fs.mkdirSync(path.join(tmpAuditDir, 'memory-bank'), { recursive: true });
      fs.mkdirSync(path.join(tmpAuditDir, 'scripts'), { recursive: true });
      fs.mkdirSync(path.join(tmpAuditDir, 'templates', 'scripts'), { recursive: true });

      fs.writeFileSync(path.join(tmpAuditDir, 'memory-bank', 'activeContext.md'), '# Active Context\n- Clean\n');
      fs.writeFileSync(path.join(tmpAuditDir, 'scripts', 'backlog.mjs'), '// version A\nconsole.log("A");\n');
      fs.writeFileSync(path.join(tmpAuditDir, 'templates', 'scripts', 'backlog.mjs'), '// version B\nconsole.log("B");\n');

      let failed = false;
      let stderrOutput = '';
      try {
        execFileSync(process.execPath, [LINTER_PATH], {
          cwd: tmpAuditDir,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe']
        });
      } catch (err) {
        failed = true;
        stderrOutput = String(err.stderr || '') + String(err.stdout || '');
      }

      assert.equal(failed, true, 'lint-memory.mjs must fail when scripts/backlog.mjs and templates/scripts/backlog.mjs diverge');
      assert.match(stderrOutput, /Template parity violation/);
    } finally {
      fs.rmSync(tmpAuditDir, { recursive: true, force: true });
    }
  });

  test('scripts/lint-memory.mjs fails on Broken Frontmatter Trap (camelCase modelDecision or missing frontmatter) and Token Bloat Trap (>50 line AGENTS.md)', () => {
    const tmpTrapDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-trap-test-'));
    try {
      fs.mkdirSync(path.join(tmpTrapDir, 'memory-bank'), { recursive: true });
      fs.mkdirSync(path.join(tmpTrapDir, '.agents', 'rules'), { recursive: true });

      fs.writeFileSync(path.join(tmpTrapDir, 'memory-bank', 'activeContext.md'), '# Active Context\n- Clean\n');
      fs.writeFileSync(
        path.join(tmpTrapDir, '.agents', 'rules', 'broken-rule.md'),
        '---\ntrigger: modelDecision\ndescription: "CamelCase trigger trap"\n---\n# Broken Rule\n'
      );
      fs.writeFileSync(
        path.join(tmpTrapDir, 'AGENTS.md'),
        '# Root AGENTS\n- Inline bloat: @[Brief](memory-bank/activeContext.md)\n'
      );

      let failed = false;
      let combinedOut = '';
      try {
        execFileSync(process.execPath, [LINTER_PATH], {
          cwd: tmpTrapDir,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe']
        });
      } catch (err) {
        failed = true;
        combinedOut = String(err.stderr || '') + String(err.stdout || '');
      }

      assert.equal(failed, true, 'lint-memory.mjs must fail on Broken Frontmatter Trap and Token Bloat Trap');
      assert.match(combinedOut, /Broken Frontmatter Trap/);
      assert.match(combinedOut, /Token Bloat Trap/);
    } finally {
      fs.rmSync(tmpTrapDir, { recursive: true, force: true });
    }
  });
});

describe('FEAT-111: Zero-Dependency E2E CLI Lifecycle (init, upgrade, sync, export, uninstall)', () => {
  let tmpRoot;
  let tmpHome;
  let tmpRepo;
  let mockBrainDir;
  let testEnv;

  before(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-mb-e2e-'));
    tmpHome = path.join(tmpRoot, 'home');
    tmpRepo = path.join(tmpRoot, 'acme-saas');
    mockBrainDir = path.join(tmpHome, '.gemini', 'antigravity', 'brain', 'e2e-test-cid-0001');

    // 1. Setup hermetic HOME with Tier 1 GEMINI.md, MCP config, and brain transcript
    fs.mkdirSync(path.join(tmpHome, '.gemini', 'config'), { recursive: true });
    fs.mkdirSync(path.join(mockBrainDir, '.system_generated', 'logs'), { recursive: true });

    fs.writeFileSync(
      path.join(tmpHome, '.gemini', 'GEMINI.md'),
      '# Tier 1 Global Config\n- Strict TypeScript and Conventional Commits.\n'
    );
    fs.writeFileSync(
      path.join(tmpHome, '.gemini', 'config', 'mcp_config.json'),
      JSON.stringify(
        {
          mcpServers: {
            github: {
              command: 'npx',
              args: ['@modelcontextprotocol/server-github'],
              env: { GITHUB_TOKEN_PATH: '~/.github_token' }
            }
          }
        },
        null,
        2
      )
    );
    fs.writeFileSync(path.join(tmpHome, '.github_token'), 'ghp_mock_token_do_not_expose_123456\n');

    // 2. Setup temporary Git repository with package.json, .env.example, and existing BACKLOG.md
    fs.mkdirSync(path.join(tmpRepo, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmpRepo, 'docs'), { recursive: true });

    fs.writeFileSync(
      path.join(tmpRepo, 'package.json'),
      JSON.stringify(
        {
          name: 'acme-saas',
          version: '0.1.0',
          description: 'Multi-tenant AI workflow platform',
          dependencies: {
            next: '^14.2.0',
            react: '^18.3.0',
            fastify: '^4.28.0'
          },
          scripts: {
            test: 'node -e "process.exit(0)"'
          }
        },
        null,
        2
      ) + '\n'
    );

    fs.writeFileSync(
      path.join(tmpRepo, '.env.example'),
      'PORT=4100\nDATABASE_URL=postgresql://localhost:5432/acme\nPUBLIC_API_URL=http://localhost:4100\n'
    );

    fs.writeFileSync(
      path.join(tmpRepo, 'docs', 'BACKLOG.md'),
      '# Acme SaaS Backlog\n\n- [ ] **[FEAT-201]** Implement OAuth2 PKCE Login Flow\n- [x] **[FEAT-200]** Initial Fastify API Skeleton\n'
    );

    // Reference tmpRepo inside mock brain transcript so findTargetBrainDirs matches mockBrainDir
    fs.writeFileSync(
      path.join(mockBrainDir, '.system_generated', 'logs', 'transcript.jsonl'),
      JSON.stringify({
        type: 'USER_INPUT',
        content: `Working on ${tmpRepo}/src/index.ts to implement multi-tenant Fastify API on port 4100.`
      }) + '\n'
    );

    testEnv = {
      ...process.env,
      HOME: tmpHome,
      USERPROFILE: tmpHome,
      GIT_AUTHOR_NAME: 'Antigravity E2E',
      GIT_AUTHOR_EMAIL: 'e2e@antigravity.local',
      GIT_COMMITTER_NAME: 'Antigravity E2E',
      GIT_COMMITTER_EMAIL: 'e2e@antigravity.local'
    };

    execSync('git init -b main && git add -A && git commit -m "feat(init): bootstrap acme-saas repo"', {
      cwd: tmpRepo,
      env: testEnv,
      stdio: 'ignore'
    });
  });

  after(() => {
    if (tmpRoot && fs.existsSync(tmpRoot)) {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  test('1. init: bootstraps Three-Tier Memory Bank, hooks, backlog, and passes 10/10 checklist', () => {
    const output = execFileSync(process.execPath, [CLI_PATH, 'init', tmpRepo, '-y', '--commit'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    assert.match(output, /Mandatory Baseline Ingestion & Verification Checklist \(10\/10 Passed\)/);

    const expectedMemoryFiles = [
      'projectbrief.md',
      'productContext.md',
      'systemPatterns.md',
      'infrastructureInvariants.md',
      'integrationsAndCustomizations.md',
      'activeContext.md',
      'progress.md'
    ];
    for (const file of expectedMemoryFiles) {
      const fullPath = path.join(tmpRepo, 'memory-bank', file);
      assert.equal(fs.existsSync(fullPath), true, `Missing memory-bank/${file} after init`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines < 150, `memory-bank/${file} exceeded 150 lines (${lines})`);
    }

    // Verify AGENTS.md includes Strict End-to-End Verification Before Closure, is <= 50 lines, and has 0 inline @[...](memory-bank/...) bloat
    const agentsMd = fs.readFileSync(path.join(tmpRepo, 'AGENTS.md'), 'utf8');
    assert.match(agentsMd, /Strict End-to-End Verification Before Closure/);
    assert.ok(agentsMd.trimEnd().split('\n').length <= 50, 'Root AGENTS.md must be strictly <= 50 lines');
    assert.equal(/@\[[^\]]+\]\(memory-bank\/[^)]+\)/.test(agentsMd), false, 'Root AGENTS.md must not inline @[...](memory-bank/...)');

    // Verify progressive-disclosure .agents/rules/*.md files exist with valid snake_case trigger: model_decision frontmatter
    for (const ruleFile of ['infra.md', 'negative-constraints.md', 'brick-governance.md', 'docs-living-specs.md', 'memory-architecture.md', 'memory-integrations.md', 'memory-sprint-context.md']) {
      const rulePath = path.join(tmpRepo, '.agents', 'rules', ruleFile);
      assert.equal(fs.existsSync(rulePath), true, `Expected .agents/rules/${ruleFile} to exist`);
      const ruleContent = fs.readFileSync(rulePath, 'utf8');
      assert.match(ruleContent, /^---\n[\s\S]*?trigger:\s*model_decision[\s\S]*?description:\s*".+"[\s\S]*?\n---/, `.agents/rules/${ruleFile} must have valid model_decision frontmatter`);
    }

    // Verify all 10 Canonical Living Documentation Hierarchy files are created on init (`FEAT-121`)
    for (const livingRel of [
      'docs/INDEX.md',
      'docs/architecture/LOGICAL_ARCHITECTURE.md',
      'docs/architecture/TECHNICAL_ARCHITECTURE.md',
      'docs/architecture/SECURITY_AND_COMPLIANCE.md',
      'docs/design/DESIGN.md',
      'docs/design/UX_BRIEF.md',
      'docs/design/BRAND_BOOK.md',
      'docs/quality/TEST_PLAN_AND_SUITES.md',
      'docs/quality/BUG_FIX_RECORDS.md',
      'docs/operations/MIGRATION_AND_RELEASE_LOG.md'
    ]) {
      assert.equal(fs.existsSync(path.join(tmpRepo, livingRel)), true, `Expected ${livingRel} to exist after init`);
    }

    // Verify progressive greenfield auto-fill when a BUG-* or FEAT-* ticket is completed via scripts/backlog.mjs
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'add', 'Fix OAuth Callback Nonce Race', '--id', 'BUG-205', '--type', 'bug', '--desc', 'Resolved nonce race condition in callback verifier'],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'done', 'BUG-205'],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    const bugDocContent = fs.readFileSync(path.join(tmpRepo, 'docs', 'quality', 'BUG_FIX_RECORDS.md'), 'utf8');
    assert.match(bugDocContent, /BUG-205/, 'Expected BUG-205 to progressively populate docs/quality/BUG_FIX_RECORDS.md');
    assert.match(bugDocContent, /Fix OAuth Callback Nonce Race/);

    // Verify docs/BRICK_ARCHITECTURE_GUIDE.md is installed on init and documents the 3-Tier Pluggable UX/UI Architecture
    const brickGuidePath = path.join(tmpRepo, 'docs', 'BRICK_ARCHITECTURE_GUIDE.md');
    assert.equal(fs.existsSync(brickGuidePath), true, 'Expected docs/BRICK_ARCHITECTURE_GUIDE.md to be installed on init');
    const brickGuideContent = fs.readFileSync(brickGuidePath, 'utf8');
    assert.match(brickGuideContent, /Tier A — Headless State & Behavior Hooks/);
    assert.match(brickGuideContent, /Tier B — Token-Driven Default Shell/);
    assert.match(brickGuideContent, /Tier C — Host Brand Adapter/);
    assert.match(brickGuideContent, /Bonus: How to Plug in a Brand New UX\/UI Redesign Later/);

    // Verify skills & lifecycle hooks installed (including /context, /clear, /effort, /credits, /usage)
    assert.equal(fs.existsSync(path.join(tmpRepo, '.agents', 'hooks.json')), true);
    for (const sk of ['start', 'update-memory', 'backlog-start', 'backlog-plan', 'context', 'clear', 'effort', 'credits', 'usage']) {
      assert.equal(fs.existsSync(path.join(tmpRepo, '.agents', 'skills', sk, 'SKILL.md')), true, `Expected .agents/skills/${sk}/SKILL.md to exist`);
    }

    // Verify CLI flags for --context, --credits, --usage, --effort, --clear work deterministically
    const ctxOut = execFileSync(process.execPath, [path.join(tmpRepo, 'scripts', 'lint-memory.mjs'), '--context'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    assert.match(ctxOut, /Antigravity Active Context & Rule Discovery Inspector/);
    const credOut = execFileSync(process.execPath, [path.join(tmpRepo, 'scripts', 'lint-memory.mjs'), '--credits'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    assert.match(credOut, /Antigravity Credit Drain & Overage Protection Audit/);
    const effOut = execFileSync(process.execPath, [path.join(tmpRepo, 'scripts', 'lint-memory.mjs'), '--effort', 'low'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    assert.match(effOut, /Reasoning Effort Profile Set: LOW/);

    // Verify backlog adapted from docs/BACKLOG.md and Review pane HTML + 3 Planning Mode artifacts rendered
    const backlogData = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    assert.ok(backlogData.tasks.some((t) => t.id === 'FEAT-201'), 'Expected FEAT-201 to be adapted into docs/backlog.json');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'backlog.html')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'planning', 'task.md')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'planning', 'implementation_plan.md')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'planning', 'walkthrough.md')), true);
    assert.equal(fs.existsSync(path.join(mockBrainDir, 'backlog.html')), true);
    assert.equal(fs.existsSync(path.join(mockBrainDir, 'task.md')), true);
    assert.equal(fs.existsSync(path.join(mockBrainDir, 'implementation_plan.md')), true);
    assert.equal(fs.existsSync(path.join(mockBrainDir, 'walkthrough.md')), true);

    const implPlan = fs.readFileSync(path.join(tmpRepo, 'docs', 'planning', 'implementation_plan.md'), 'utf8');
    assert.match(implPlan, /## 1\. Goal Description/);
    assert.match(implPlan, /## 2\. User Review Required/);
    assert.match(implPlan, /## 3\. Proposed Changes/);
    assert.match(implPlan, /## 4\. Verification Plan/);

    // Verify Mandatory Plan-to-Backlog Ticket Creation & Atomic Splitting (`plan "<title>" --split` & `split <ID>`)
    const planCreateOut = execFileSync(
      process.execPath,
      [
        path.join(tmpRepo, 'scripts', 'backlog.mjs'),
        'plan',
        'Multi-Phase Billing & Webhook Overhaul',
        '--split',
        'Phase 1: Stripe Webhook Verifier|Phase 2: Invoice Ledger UI'
      ],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    assert.match(planCreateOut, /Auto-created backlog ticket \[FEAT-\d+\]/);
    assert.match(planCreateOut, /Split \[FEAT-\d+\] into 2 atomic sub-ticket\(s\)/);
    const afterSplitBacklog = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const parentTicket = afterSplitBacklog.tasks.find((t) => t.title === 'Multi-Phase Billing & Webhook Overhaul');
    assert.ok(parentTicket, 'Expected parent ticket to be created in docs/backlog.json during /plan');
    const splitChildren = afterSplitBacklog.tasks.filter((t) => t.parentId === parentTicket.id);
    assert.equal(splitChildren.length, 2, 'Expected 2 atomic child tickets linked via parentId in docs/backlog.json');
  });

  test('2. upgrade: 100% preserves custom memory-bank/*.md domain files while upgrading AGENTS.md and skills', () => {
    const customBrief = '# Acme SaaS — Custom Domain Brief\n\n## Core Invariant\n- Custom tenant isolation rule #42.\n';
    const customPatterns = '# Acme SaaS — Custom System Patterns\n\n## Event Bus\n- Uses custom NATS JetStream topology.\n';
    const customExtraFile = '# Acme SaaS — Custom Billing Domain\n\n- Usage-based metered billing schema.\n';

    fs.writeFileSync(path.join(tmpRepo, 'memory-bank', 'projectbrief.md'), customBrief, 'utf8');
    fs.writeFileSync(path.join(tmpRepo, 'memory-bank', 'systemPatterns.md'), customPatterns, 'utf8');
    fs.writeFileSync(path.join(tmpRepo, 'memory-bank', 'customBilling.md'), customExtraFile, 'utf8');

    // Simulate legacy AGENTS.md missing the Strict End-to-End Verification Before Closure mandate
    const legacyAgents = fs
      .readFileSync(path.join(tmpRepo, 'AGENTS.md'), 'utf8')
      .replace(/^.*Strict End-to-End Verification Before Closure.*\n?/m, '');
    fs.writeFileSync(path.join(tmpRepo, 'AGENTS.md'), legacyAgents, 'utf8');

    const output = execFileSync(process.execPath, [CLI_PATH, 'upgrade', tmpRepo, '-y'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    assert.match(output, /Mandatory Baseline Ingestion & Verification Checklist \(10\/10 Passed\)/);

    // Assert 100% byte-for-byte preservation of custom domain memory files
    assert.equal(
      fs.readFileSync(path.join(tmpRepo, 'memory-bank', 'projectbrief.md'), 'utf8'),
      customBrief,
      'memory-bank/projectbrief.md must be 100% preserved during upgrade'
    );
    assert.equal(
      fs.readFileSync(path.join(tmpRepo, 'memory-bank', 'systemPatterns.md'), 'utf8'),
      customPatterns,
      'memory-bank/systemPatterns.md must be 100% preserved during upgrade'
    );
    assert.equal(
      fs.readFileSync(path.join(tmpRepo, 'memory-bank', 'customBilling.md'), 'utf8'),
      customExtraFile,
      'Custom memory-bank/customBilling.md must be 100% preserved during upgrade'
    );

    // Assert AGENTS.md had Strict End-to-End Verification Before Closure restored
    const upgradedAgents = fs.readFileSync(path.join(tmpRepo, 'AGENTS.md'), 'utf8');
    assert.match(upgradedAgents, /Strict End-to-End Verification Before Closure/);
  });

  test('3. sync: indexes new .env keys with secret redaction and syncs recent git commits', () => {
    fs.writeFileSync(
      path.join(tmpRepo, '.env'),
      'STRIPE_SECRET_KEY=sk_live_ultra_secret_value_999999\nNEXT_PUBLIC_APP_URL=https://acme.example.com\n',
      'utf8'
    );
    fs.writeFileSync(path.join(tmpRepo, '.gitignore'), '.env\ndocs/backlog.html\nmemory-backups/\n', 'utf8');

    execSync('git add .gitignore && git commit -m "feat(billing): add Stripe webhook handler"', {
      cwd: tmpRepo,
      env: testEnv,
      stdio: 'ignore'
    });

    execFileSync(process.execPath, [CLI_PATH, 'sync', tmpRepo], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    const integrationsMd = fs.readFileSync(
      path.join(tmpRepo, 'memory-bank', 'integrationsAndCustomizations.md'),
      'utf8'
    );
    assert.match(integrationsMd, /STRIPE_SECRET_KEY/);
    assert.match(integrationsMd, /NEXT_PUBLIC_APP_URL/);
    assert.equal(
      integrationsMd.includes('sk_live_ultra_secret_value_999999'),
      false,
      'Raw secret literal must NEVER be written to memory-bank/integrationsAndCustomizations.md'
    );
    assert.equal(
      integrationsMd.includes('ghp_mock_token_do_not_expose_123456'),
      false,
      'Host token secret literal must NEVER be written to memory-bank/integrationsAndCustomizations.md'
    );

    const activeContextMd = fs.readFileSync(path.join(tmpRepo, 'memory-bank', 'activeContext.md'), 'utf8');
    assert.match(activeContextMd, /feat\(billing\): add Stripe webhook handler/);
  });

  test('3b. organize: relocates loose root specs to docs/, classifies custom nested docs, harvests README/memory-bank, extracts deep routes/schemas, and rewrites links', () => {
    fs.writeFileSync(path.join(tmpRepo, 'UX_BRIEF.md'), '# Acme UX Brief\n- Glassmorphic dark mode.\n', 'utf8');
    fs.writeFileSync(path.join(tmpRepo, 'DESIGN.md'), '# Acme Design System\n- Primary token #0EA5E9.\n', 'utf8');
    fs.writeFileSync(path.join(tmpRepo, 'CLAUDE.md'), '# See AGENTS.md\n\nFollow the instructions in AGENTS.md.\n', 'utf8');
    fs.writeFileSync(path.join(tmpRepo, '.DS_Store'), 'macos-clutter', 'utf8');
    fs.writeFileSync(path.join(tmpRepo, 'skills-lock.json'), '{}', 'utf8');

    // FEAT-122: Seed custom-named nested docs (`docs/specs/STRIPE_BILLING_API.md` & `docs/guides/OAUTH_SECURITY_FLOW.md`)
    fs.mkdirSync(path.join(tmpRepo, 'docs', 'specs'), { recursive: true });
    fs.mkdirSync(path.join(tmpRepo, 'docs', 'guides'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRepo, 'docs', 'specs', 'STRIPE_BILLING_API.md'),
      '# Stripe Billing Webhook & Database Endpoint Spec\n\n## API Endpoints\n- POST /api/webhooks/stripe processes PostgreSQL billing events.\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(tmpRepo, 'docs', 'guides', 'OAUTH_SECURITY_FLOW.md'),
      '# OAuth2 PKCE & GDPR Security Guide\n\n## Authentication & Token Revocation\n- Enforces PKCE authorization_code and Apple 5.1.1(v) revocation.\n',
      'utf8'
    );

    // FEAT-122: Seed Next.js App Router API route (`app/api/billing/route.ts`) & SQL schema (`db/001_billing.sql`)
    fs.mkdirSync(path.join(tmpRepo, 'app', 'api', 'billing'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRepo, 'app', 'api', 'billing', 'route.ts'),
      'export async function GET() { return Response.json({ ok: true }); }\nexport async function POST() { return Response.json({ created: true }); }\n',
      'utf8'
    );
    fs.mkdirSync(path.join(tmpRepo, 'db'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRepo, 'db', '001_billing.sql'),
      'CREATE TABLE IF NOT EXISTS tenant_invoices (id UUID PRIMARY KEY, amount_cents INT NOT NULL);\n',
      'utf8'
    );

    fs.writeFileSync(
      path.join(tmpRepo, 'README.md'),
      '# Acme SaaS\n\nSee [UX Brief](UX_BRIEF.md), [Design Spec](./DESIGN.md), and [Stripe Spec](docs/specs/STRIPE_BILLING_API.md).\n\n## Domain Workflow Overview\n- Multi-tenant bounded context with automated invoice reconciliation.\n',
      'utf8'
    );

    const orgOut = execFileSync(process.execPath, [CLI_PATH, 'organize', tmpRepo], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    assert.match(orgOut, /0 loose root docs/);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'UX_BRIEF.md')), false, 'UX_BRIEF.md must be moved out of root');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'DESIGN.md')), false, 'DESIGN.md must be moved out of root');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'design', 'DESIGN.md')), true, 'docs/design/DESIGN.md must exist');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'design', 'UX_BRIEF.md')), true, 'docs/design/UX_BRIEF.md must exist');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'design', 'BRAND_BOOK.md')), true, 'docs/design/BRAND_BOOK.md must exist');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'archive', 'UX_BRIEF.md')), true, 'docs/archive/UX_BRIEF.md must preserve original legacy file');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'archive', 'DESIGN.md')), true, 'docs/archive/DESIGN.md must preserve original legacy file');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'archive', 'STRIPE_BILLING_API.md')), true, 'Custom nested STRIPE_BILLING_API.md must be archived after classification');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'archive', 'OAUTH_SECURITY_FLOW.md')), true, 'Custom nested OAUTH_SECURITY_FLOW.md must be archived after classification');
    assert.match(fs.readFileSync(path.join(tmpRepo, 'docs', 'design', 'UX_BRIEF.md'), 'utf8'), /Glassmorphic dark mode/, 'Zero content loss when consolidating UX_BRIEF.md');
    const designMdContent = fs.readFileSync(path.join(tmpRepo, 'docs', 'design', 'DESIGN.md'), 'utf8');
    assert.match(designMdContent, /Primary token #0EA5E9/, 'Zero content loss when consolidating DESIGN.md into docs/design/DESIGN.md');
    assert.match(designMdContent, /Glassmorphic dark mode/, 'docs/design/DESIGN.md must also cross-harvest UX_BRIEF.md and BRAND_BOOK.md specifications');

    // FEAT-122 assertions: custom nested docs classified into TECHNICAL_ARCHITECTURE.md and SECURITY_AND_COMPLIANCE.md
    const techArchContent = fs.readFileSync(path.join(tmpRepo, 'docs', 'architecture', 'TECHNICAL_ARCHITECTURE.md'), 'utf8');
    assert.match(techArchContent, /POST \/api\/webhooks\/stripe/, 'Expected STRIPE_BILLING_API.md to be classified into TECHNICAL_ARCHITECTURE.md');
    assert.match(techArchContent, /\/api\/billing/, 'Expected Next.js App Router app/api/billing/route.ts to be discovered in TECHNICAL_ARCHITECTURE.md');
    assert.match(techArchContent, /table tenant_invoices/, 'Expected SQL CREATE TABLE tenant_invoices to be discovered in TECHNICAL_ARCHITECTURE.md');

    const secArchContent = fs.readFileSync(path.join(tmpRepo, 'docs', 'architecture', 'SECURITY_AND_COMPLIANCE.md'), 'utf8');
    assert.match(secArchContent, /PKCE authorization_code/, 'Expected OAUTH_SECURITY_FLOW.md to be classified into SECURITY_AND_COMPLIANCE.md');

    const logicalArchContent = fs.readFileSync(path.join(tmpRepo, 'docs', 'architecture', 'LOGICAL_ARCHITECTURE.md'), 'utf8');
    assert.match(logicalArchContent, /Harvested Repository & Memory-Bank Context/, 'Expected in-place README.md and memory-bank/*.md sections to be harvested into LOGICAL_ARCHITECTURE.md');

    assert.equal(fs.existsSync(path.join(tmpRepo, 'CLAUDE.md')), false, 'Redundant CLAUDE.md pointer stub must be removed');
    assert.equal(fs.existsSync(path.join(tmpRepo, '.DS_Store')), false, '.DS_Store must be removed');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'skills-lock.json')), false, 'Orphaned skills-lock.json must be removed');

    const updatedReadme = fs.readFileSync(path.join(tmpRepo, 'README.md'), 'utf8');
    assert.match(updatedReadme, /\[UX Brief\]\(docs\/design\/UX_BRIEF\.md\)/);
    assert.match(updatedReadme, /\[Design Spec\]\(docs\/design\/DESIGN\.md\)/);
    assert.match(updatedReadme, /\[Stripe Spec\]\(docs\/architecture\/TECHNICAL_ARCHITECTURE\.md\)/);

    const gitignore = fs.readFileSync(path.join(tmpRepo, '.gitignore'), 'utf8');
    assert.match(gitignore, /docs\/backlog\.html/);
    assert.match(gitignore, /memory-backups\//);
    assert.equal(fs.existsSync(path.join(tmpRepo, '.github', 'workflows', 'memory-bank-sync.yml')), true);
  });

  test('3c. brick: list, platform-conditional install (--platforms web --with-schema), non-destructive upgrade, and doctor', () => {
    const listOut = execFileSync(process.execPath, [CLI_PATH, 'brick', 'list'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(listOut, /user-profile@1\.0\.0/);
    assert.match(listOut, /google, facebook, apple, microsoft/);

    const installOut = execFileSync(
      process.execPath,
      [CLI_PATH, 'brick', 'install', 'user-profile', tmpRepo, '--platforms', 'web', '--with-schema'],
      {
        cwd: tmpRepo,
        env: testEnv,
        encoding: 'utf8'
      }
    );
    assert.match(installOut, /Selected Platforms: web/);

    // Verify web platform was installed, and ios/android were excluded for --platforms web
    assert.equal(fs.existsSync(path.join(tmpRepo, 'bricks', 'user-profile', 'platforms', 'web', 'headless', 'index.ts')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'bricks', 'user-profile', 'platforms', 'web', 'themed-ui', 'index.tsx')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'bricks', 'user-profile', 'platforms', 'ios')), false, 'ios should not be installed when --platforms web is used');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'bricks', 'user-profile', 'platforms', 'android')), false, 'android should not be installed when --platforms web is used');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'bricks', 'user-profile', 'schemas', '001_user_profile_oauth.sql')), true);

    // Customize host theme adapter and verify brick upgrade preserves it 100%
    const themeAdapterPath = path.join(tmpRepo, 'src', 'adapters', 'user-profile-theme.adapter.ts');
    assert.equal(fs.existsSync(themeAdapterPath), true);
    const customTheme = '// Custom Acme Brand Tokens (#FF007F)\nexport const userProfileBrandTheme = { custom: true };\n';
    fs.writeFileSync(themeAdapterPath, customTheme, 'utf8');

    const upgradeOut = execFileSync(
      process.execPath,
      [CLI_PATH, 'brick', 'upgrade', 'user-profile', tmpRepo],
      {
        cwd: tmpRepo,
        env: testEnv,
        encoding: 'utf8'
      }
    );
    assert.match(upgradeOut, /Preserved existing host adapter: src\/adapters\/user-profile-theme\.adapter\.ts/);
    assert.equal(fs.readFileSync(themeAdapterPath, 'utf8'), customTheme);

    const doctorOut = execFileSync(
      process.execPath,
      [CLI_PATH, 'brick', 'doctor', 'user-profile', tmpRepo],
      {
        cwd: tmpRepo,
        env: testEnv,
        encoding: 'utf8'
      }
    );
    assert.match(doctorOut, /Brick Doctor passed with 0 structural issues/);
  });

  test('3d. backlog CLI & lint-memory.mjs hygiene: supports flag-first add, normalizes priority/type, completes actionItems on done, and fails lint on corrupted tickets', () => {
    const backlogScriptPath = path.join(tmpRepo, 'scripts', 'backlog.mjs');
    const lintScriptPath = path.join(tmpRepo, 'scripts', 'lint-memory.mjs');
    const backlogJsonPath = path.join(tmpRepo, 'docs', 'backlog.json');

    // 1. Flag-first syntax (--id --title --priority P0 --type feat --description)
    execFileSync(
      process.execPath,
      [
        backlogScriptPath,
        'add',
        '--id',
        'FEAT-244',
        '--title',
        'Interactive 120 FPS Mask Brush',
        '--priority',
        'P0',
        '--type',
        'feat',
        '--description',
        'Client-side erase & restore brush'
      ],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );

    // 1b. Verbose AGY Model & Quality-to-Credit ROI Advisor (--advise, --effort xhigh, backlog advise)
    const adviseOut = execFileSync(process.execPath, [lintScriptPath, '--advise', 'FEAT-244'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(adviseOut, /Gemini 4 Neon/);
    assert.match(adviseOut, /Claude Sonnet 5\.5/);
    assert.match(adviseOut, /Orchestrator \(Carbon\)/);
    assert.match(adviseOut, /Dual Quota-Pool Balancing/);

    const xhighOut = execFileSync(process.execPath, [lintScriptPath, '--effort', 'xhigh'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(xhighOut, /XHIGH/);

    // 1c. BUG-108 / FEAT-129 non-regression & E2E: adaptExistingBoards normalizes legacy tickets[] without milestones[], and render removes duplicate backlog_kanban.html / root backlog.html
    const legacyBacklogRaw = JSON.stringify({
      project: 'Acme Legacy',
      tickets: [
        { id: 'FEAT-901', title: 'Legacy Ticket Schema', type: 'feature', priority: 'high', status: 'todo', description: 'Verify normalization' }
      ]
    }, null, 2);
    fs.writeFileSync(backlogJsonPath, legacyBacklogRaw, 'utf8');
    const testBrainDir = path.join(testEnv.HOME, '.gemini', 'antigravity', 'brain', 'e2e-test-cid-0001');
    fs.writeFileSync(path.join(tmpRepo, 'backlog.html'), '<html>legacy root kanban</html>', 'utf8');
    fs.writeFileSync(path.join(testBrainDir, 'backlog_kanban.html'), '<html>duplicate brain kanban</html>', 'utf8');

    const upgradeLegacyOut = execFileSync(process.execPath, [CLI_PATH, 'upgrade', tmpRepo, '-y'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(upgradeLegacyOut, /Antigravity Memory Bank successfully upgraded on the fly/);
    assert.equal(fs.existsSync(path.join(tmpRepo, 'backlog.html')), false, 'Legacy root backlog.html should be pruned on render');
    assert.equal(fs.existsSync(path.join(testBrainDir, 'backlog_kanban.html')), false, 'Duplicate brain backlog_kanban.html should be pruned on render');
    const canonicalHtml = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(canonicalHtml, /openCreditAdvisor/);
    assert.match(canonicalHtml, /Save Credits &amp; Models/);
    assert.match(canonicalHtml, /id="col-ready"/);
    assert.match(canonicalHtml, /id="sort-btn-ready"/);

    // 1d. FEAT-130 / FEAT-131: ready status transition & Stage B model-downgrade Credit ROI advice
    execFileSync(process.execPath, [backlogScriptPath, 'ready', 'FEAT-901'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    const readyAdviseOut = execFileSync(process.execPath, [lintScriptPath, '--advise', 'FEAT-901'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(readyAdviseOut, /READY \(PLANNED\)/);
    assert.match(readyAdviseOut, /SWITCH DOWN NOW/);

    // 1e. FEAT-133..135: autoAnnotateTicket in TO DO + PLAN/CODE interactive model-selector modals in backlog.html
    execFileSync(
      process.execPath,
      [backlogScriptPath, 'add', '--id', 'FEAT-902', '--title', 'Add OAuth token refresh modal in backlog.mjs', '--priority', 'high'],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    const afterAddJson = JSON.parse(fs.readFileSync(backlogJsonPath, 'utf8'));
    const feat902 = afterAddJson.tasks.find(t => t.id === 'FEAT-902');
    assert.ok(feat902, 'FEAT-902 should exist in docs/backlog.json');
    assert.equal(feat902.status, 'todo', 'backlog add must strictly default to status: todo');
    assert.ok(feat902.annotations && feat902.annotations.recommendedPlanModel, 'autoAnnotateTicket should populate annotations');
    assert.ok(Array.isArray(feat902.acceptanceCriteria) && feat902.acceptanceCriteria.length >= 2, 'autoAnnotateTicket should populate acceptanceCriteria');

    const updatedHtml = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(updatedHtml, /id="modelSelectorModal"/);
    assert.match(updatedHtml, /openModelSelectorModal/);
    assert.match(updatedHtml, /confirmModelAndRun/);

    // Re-add FEAT-244 for step 2
    execFileSync(
      process.execPath,
      [backlogScriptPath, 'add', '--id', 'FEAT-244', '--title', 'Interactive 120 FPS Mask Brush', '--priority', 'P0', '--type', 'feat'],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );

    // 2. Start & Done lifecycle completes actionItems and clears waitingOn
    execFileSync(process.execPath, [backlogScriptPath, 'start', 'FEAT-244'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    execFileSync(process.execPath, [backlogScriptPath, 'done', 'FEAT-244'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    const parsed = JSON.parse(fs.readFileSync(backlogJsonPath, 'utf8'));
    const t244 = parsed.tasks.find((t) => t.id === 'FEAT-244');
    assert.ok(t244, 'Expected FEAT-244 in docs/backlog.json');
    assert.equal(t244.title, 'Interactive 120 FPS Mask Brush');
    assert.equal(t244.priority, 'high');
    assert.equal(t244.type, 'feature');
    assert.equal(t244.status, 'done');
    assert.equal(t244.waitingOn, undefined);
    assert.equal(t244.actionItems.every((a) => a.done === true), true);

    // 3. Clean backlog passes lint-memory.mjs
    const lintOut = execFileSync(process.execPath, [lintScriptPath], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(lintOut, /Backlog Hygiene verified/);

    // 4. Rejects missing/flag-like title on `backlog add`
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          [backlogScriptPath, 'add', '--id', 'FEAT-999', '--priority', 'P1'],
          { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
        ),
      /Please specify a title/
    );

    // 5. Self-heals tickets from docs/planning/implementation_plan.md into docs/backlog.json on render
    const planMdPath = path.join(tmpRepo, 'docs', 'planning', 'implementation_plan.md');
    fs.mkdirSync(path.dirname(planMdPath), { recursive: true });
    fs.writeFileSync(
      planMdPath,
      [
        '# Implementation Plan — Multi-Phase Roadmap',
        '## 3. Proposed Changes',
        '### [FEAT-245] Phase 2: Smart AI Object & Residual Background Eraser',
        '- **Specification**: LaMa FP16 inpainting in `server/app/services/inpainter.py`.',
        '### [FEAT-246] Phase 3: Edge Color Decontamination & Halo Suppressor',
        '- **Specification**: WebGL2 edge decontamination in `src/lib/webglCompositor.js`.'
      ].join('\n'),
      'utf8'
    );

    execFileSync(process.execPath, [backlogScriptPath, 'render'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    const healed = JSON.parse(fs.readFileSync(backlogJsonPath, 'utf8'));
    assert.ok(healed.tasks.some((t) => t.id === 'FEAT-245'), 'Expected FEAT-245 to be auto-healed from implementation_plan.md');
    assert.ok(healed.tasks.some((t) => t.id === 'FEAT-246'), 'Expected FEAT-246 to be auto-healed from implementation_plan.md');
  });

  test('3e. ad-hoc /plan auto-registers into READY on design review display and moves READY -> IN PROGRESS on proceed (FEAT-136)', () => {
    const planDir = path.join(tmpRepo, 'docs', 'planning');
    fs.mkdirSync(planDir, { recursive: true });
    const adHocPlan = [
      '# Implementation Plan — Add Live Dark Mode Switcher',
      '',
      '## 1. Goal Description',
      'Allow users to toggle dark and light theme modes seamlessly across all views.',
      '',
      '## 3. Proposed Changes',
      '- `src/theme/toggle.ts`',
      '',
      '## 4. Verification Plan',
      '- Run `npm test`',
    ].join('\n');
    fs.writeFileSync(path.join(planDir, 'implementation_plan.md'), adHocPlan, 'utf8');

    execFileSync(process.execPath, [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'render'], {
      cwd: tmpRepo,
      env: testEnv,
      stdio: 'pipe',
    });

    const afterPlan = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const adHocTicket = afterPlan.tasks.find((t) => t.title === 'Add Live Dark Mode Switcher');
    assert.ok(adHocTicket, 'Ad-hoc /plan ticket must be auto-minted into docs/backlog.json');
    assert.equal(adHocTicket.status, 'ready', 'Ad-hoc /plan ticket must land in READY (Planned) column');
    assert.ok(adHocTicket.plannedAt, 'Ad-hoc /plan ticket must record plannedAt timestamp');
    assert.ok(adHocTicket.components.includes('src/theme/toggle.ts'), 'Ad-hoc /plan ticket must extract component paths');
    assert.ok(Array.isArray(adHocTicket.acceptanceCriteria) && adHocTicket.acceptanceCriteria.length >= 2, 'Ad-hoc /plan ticket must have verifiable acceptance criteria');
    assert.ok(
      Array.isArray(afterPlan.activePlanTaskIds) && afterPlan.activePlanTaskIds.includes(adHocTicket.id),
      'activePlanTaskIds must track the newly minted ad-hoc /plan ticket'
    );

    const proceedOut = execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'proceed'],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    assert.match(proceedOut, /PROCEED:.*READY → IN PROGRESS/);

    const afterProceed = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const movedTicket = afterProceed.tasks.find((t) => t.id === adHocTicket.id);
    assert.equal(movedTicket.status, 'in_progress', 'Clicking Proceed must move the READY ticket into IN PROGRESS');
    assert.ok(movedTicket.startedAt, 'Proceeded ticket must record startedAt timestamp');
  });

  test('3f. FEAT-137/138/139: worktree branch isolation & auto-upgrade, READY plan examination modal, and residual children (a, b, c)', () => {
    // 1. FEAT-138: Verify READY ticket examination modal embeds implementationPlanMd & Code button in backlog.html
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'add', 'Inspectable Ready Feature', '--id', 'FEAT-701', '--priority', 'high'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'ready', 'FEAT-701'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const htmlOut = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(htmlOut, /inspectorPlanExamination/, 'backlog.html must include READY plan examination container');
    assert.match(htmlOut, /openCodeFromInspector/, 'backlog.html must include direct CODE button inside examination modal');
    assert.match(htmlOut, /"implementationPlanMd":/, 'backlog.html payload must embed implementationPlanMd for READY examination');

    // 2. FEAT-139: Verify done --residual keeps parent in IN PROGRESS (collapsed) and spawns open collapsible a, b, c children
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'start', 'FEAT-701'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const resOut = execFileSync(
      process.execPath,
      [
        path.join(tmpRepo, 'scripts', 'backlog.mjs'),
        'done',
        'FEAT-701',
        '--residual',
        'Polish edge case A|Add mobile test B|Update docs C'
      ],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    assert.match(resOut, /FEAT-701a, FEAT-701b, FEAT-701c/);

    const afterResidual = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const parentTask = afterResidual.tasks.find((t) => t.id === 'FEAT-701');
    const childA = afterResidual.tasks.find((t) => t.id === 'FEAT-701a');
    const childB = afterResidual.tasks.find((t) => t.id === 'FEAT-701b');
    const childC = afterResidual.tasks.find((t) => t.id === 'FEAT-701c');
    assert.equal(parentTask.status, 'in_progress', 'Parent with residual tasks must remain IN PROGRESS');
    assert.equal(parentTask.collapsed, true, 'Parent with residual tasks must be collapsed by default');
    assert.equal(parentTask.coreCompleted, true, 'Parent must record coreCompleted: true');
    assert.ok(childA && childB && childC, 'Residual children FEAT-701a, FEAT-701b, FEAT-701c must be created');
    assert.equal(childA.parentId, 'FEAT-701');
    assert.equal(childA.collapsed, false, 'Residual child tickets must be open (not collapsed) by default');

    // Completing all 3 residual children must automatically roll up the parent to DONE
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'done', 'FEAT-701a', 'FEAT-701b', 'FEAT-701c', '--force'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const afterRollup = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    assert.equal(afterRollup.tasks.find((t) => t.id === 'FEAT-701').status, 'done', 'Parent must auto-complete once all residual children are DONE');

    // 3. FEAT-137: Real Git Worktree isolation + automatic upgrade propagation
    execFileSync('git', ['add', '-A'], { cwd: tmpRepo, stdio: 'pipe' });
    execFileSync('git', ['commit', '-m', 'chore: baseline before worktree test'], { cwd: tmpRepo, stdio: 'pipe' });
    const wtDir = path.join(os.tmpdir(), `agy-wt-test-${Date.now()}`);
    try {
      execFileSync('git', ['worktree', 'add', '-b', 'feat/worktree-iso', wtDir], { cwd: tmpRepo, stdio: 'pipe' });
      // Add a branch-specific ticket inside the worktree
      execFileSync(
        process.execPath,
        [path.join(wtDir, 'scripts', 'backlog.mjs'), 'add', 'Worktree Only Ticket', '--id', 'FEAT-901'],
        { cwd: wtDir, env: testEnv, stdio: 'pipe' }
      );
      const wtList = execFileSync(
        process.execPath,
        [path.join(wtDir, 'scripts', 'backlog.mjs'), 'list'],
        { cwd: wtDir, env: testEnv, encoding: 'utf8' }
      );
      assert.match(wtList, /FEAT-901/, 'Worktree backlog list must show tickets created/run in its branch');
      assert.doesNotMatch(wtList, /FEAT-701/, 'Worktree backlog list must isolate and hide tickets from main branch');

      // Run `cli.mjs upgrade` on main repo and verify it propagates to the linked worktree automatically
      const upgOut = execFileSync(process.execPath, [CLI_PATH, 'upgrade', tmpRepo, '-y', '--no-organize'], {
        cwd: tmpRepo,
        env: testEnv,
        encoding: 'utf8'
      });
      assert.match(upgOut, /Detected 1 linked Git worktree\(s\) — propagating Memory Bank updates/);
    } finally {
      try { execFileSync('git', ['worktree', 'remove', '--force', wtDir], { cwd: tmpRepo, stdio: 'pipe' }); } catch {}
      try { fs.rmSync(wtDir, { recursive: true, force: true }); } catch {}
    }
  });

  test('3g. FEAT-140 / BUG-109: zero-skip 4-state live Kanban transitions TO DO (planning) -> READY (awaiting_approval) -> IN PROGRESS (coding) -> DONE', () => {
    // Stage 1: stage-plan places ticket in TO DO with liveActivity: 'planning' and renders pulsing badge
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'stage-plan', 'Zero Skip Live Feature', '--id', 'FEAT-810'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const s1Json = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const s1Task = s1Json.tasks.find((t) => t.id === 'FEAT-810');
    assert.equal(s1Task.status, 'todo', 'stage-plan must place ticket in TO DO first');
    assert.equal(s1Task.liveActivity, 'planning', 'stage-plan must set liveActivity to planning');
    const s1Html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(s1Html, /🧠 Planning\.\.\./, 'backlog.html must render pulsing Planning badge in TO DO');

    // Stage 2: writing implementation_plan.md promotes TO DO -> READY with awaiting_approval
    fs.writeFileSync(
      path.join(tmpRepo, 'docs', 'planning', 'implementation_plan.md'),
      '# Implementation Plan\n\n### [FEAT-810] Zero Skip Live Feature\nImplement live state transitions.\n',
      'utf8'
    );
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'render'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const s2Json = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const s2Task = s2Json.tasks.find((t) => t.id === 'FEAT-810');
    assert.equal(s2Task.status, 'ready', 'Finalizing implementation_plan.md must promote TO DO -> READY');
    assert.equal(s2Task.liveActivity, 'awaiting_approval', 'READY ticket must show awaiting_approval');
    const s2Html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(s2Html, /⏳ READY · Awaiting Proceed/, 'backlog.html must render Awaiting Proceed badge in READY');

    // Stage 3: modifying a code file + sync-memory-context.mjs auto-proceeds READY -> IN PROGRESS (coding)
    fs.mkdirSync(path.join(tmpRepo, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpRepo, 'src', 'live-state.js'), 'export const live = true;\n', 'utf8');
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'sync-memory-context.mjs'), '--quiet'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const s3Json = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const s3Task = s3Json.tasks.find((t) => t.id === 'FEAT-810');
    assert.equal(s3Task.status, 'in_progress', 'Dirty code file must auto-proceed READY -> IN PROGRESS');
    assert.equal(s3Task.liveActivity, 'coding', 'IN PROGRESS ticket must show liveActivity: coding');
    const s3Html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(s3Html, /⚡ Coding Live\.\.\./, 'backlog.html must render pulsing Coding Live badge in IN PROGRESS');

    // Stage 4: done clears liveActivity and preserves full 4-state audit trail in stateHistory
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'done', 'FEAT-810', '--force'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const s4Json = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const s4Task = s4Json.tasks.find((t) => t.id === 'FEAT-810');
    assert.equal(s4Task.status, 'done');
    assert.equal(s4Task.liveActivity, undefined);
    const historyStatuses = (s4Task.stateHistory || []).map((h) => h.status);
    assert.deepEqual(
      historyStatuses,
      ['todo', 'ready', 'in_progress', 'done'],
      'stateHistory must record exact 4-stage progression without skipping any column'
    );
  });

  test('4. export & uninstall: archives consolidated memory backup and cleanly removes Memory Bank files', () => {
    const exportOut = execFileSync(process.execPath, [CLI_PATH, 'export', tmpRepo], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(exportOut, /Consolidated Markdown/);

    const backupsDir = path.join(tmpRepo, 'memory-backups');
    assert.equal(fs.existsSync(backupsDir), true);
    const backupFiles = fs.readdirSync(backupsDir);
    const mdBackup = backupFiles.find((f) => f.endsWith('.md'));
    const tarBackup = backupFiles.find((f) => f.endsWith('.tar.gz'));
    assert.ok(mdBackup, 'Expected consolidated .md backup file');
    assert.ok(tarBackup, 'Expected .tar.gz archive backup file');

    const mdBackupContent = fs.readFileSync(path.join(backupsDir, mdBackup), 'utf8');
    assert.match(mdBackupContent, /Custom tenant isolation rule #42/);

    // Now run uninstall
    const uninstallOut = execFileSync(process.execPath, [CLI_PATH, 'uninstall', tmpRepo, '-y'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    assert.match(uninstallOut, /cleanly deinstalled/);

    assert.equal(fs.existsSync(path.join(tmpRepo, 'memory-bank')), false, 'memory-bank/ should be removed on uninstall');
    assert.equal(
      fs.existsSync(path.join(tmpRepo, '.agents', 'skills', 'start')),
      false,
      '.agents/skills/start should be removed on uninstall'
    );
    assert.equal(
      fs.existsSync(path.join(tmpRepo, 'scripts', 'lint-memory.mjs')),
      false,
      'scripts/lint-memory.mjs should be removed on uninstall'
    );
    assert.equal(
      fs.existsSync(backupsDir),
      true,
      'memory-backups/ archive must remain preserved after uninstall'
    );
  });
});
