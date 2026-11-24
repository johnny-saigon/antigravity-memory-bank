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
import vm from 'node:vm';
import { execFileSync, execSync, spawn } from 'node:child_process';
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

  test('3g. FEAT-140 / BUG-109 / BUG-114: locked READY (planning) -> READY (awaiting_approval) -> IN PROGRESS (coding) -> DONE', () => {
    // Stage 1: stage-plan places ticket directly in READY (greyed-out & locked while planning, never TO DO or IN PROGRESS)
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'stage-plan', 'Zero Skip Live Feature', '--id', 'FEAT-810'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const s1Json = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const s1Task = s1Json.tasks.find((t) => t.id === 'FEAT-810');
    assert.equal(s1Task.status, 'ready', 'stage-plan must place ticket directly in READY (BUG-114)');
    assert.equal(s1Task.liveActivity, 'planning', 'stage-plan must set liveActivity to planning');
    assert.equal(s1Task.planningLocked, true, 'stage-plan must lock ticket while planning (BUG-114)');
    const s1Html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(s1Html, /🔒 🧠 Planning\.\.\. \(Locked\)/, 'backlog.html must render locked greyed-out Planning badge in READY');
    assert.match(s1Html, /data-task-id="FEAT-810"[^>]*draggable="false"/, 'Locked planning card must disable dragging');

    // Stage 2: writing implementation_plan.md unlocks READY ticket with awaiting_approval
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
    assert.equal(s2Task.status, 'ready', 'Finalizing implementation_plan.md must keep ticket in READY');
    assert.equal(s2Task.liveActivity, 'awaiting_approval', 'READY ticket must show awaiting_approval');
    assert.equal(s2Task.planningLocked, undefined, 'Finalizing implementation_plan.md must unlock READY ticket');
    const s2Html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(s2Html, /⏳ READY · Awaiting Proceed/, 'backlog.html must render Awaiting Proceed badge in READY');

    // Stage 3: modifying a code file AFTER Proceed/plan baseline + sync-memory-context.mjs auto-proceeds READY -> IN PROGRESS (coding)
    fs.mkdirSync(path.join(tmpRepo, 'src'), { recursive: true });
    const liveFile = path.join(tmpRepo, 'src', 'live-state.js');
    fs.writeFileSync(liveFile, 'export const live = true;\n', 'utf8');
    const postPlanTs = new Date(Date.now() + 3000);
    fs.utimesSync(liveFile, postPlanTs, postPlanTs);
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'sync-memory-context.mjs'), '--quiet'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const s3Json = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const s3Task = s3Json.tasks.find((t) => t.id === 'FEAT-810');
    assert.equal(s3Task.status, 'in_progress', 'Post-plan edited code file must auto-proceed READY -> IN PROGRESS');
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
    assert.equal(s4Task.planningLocked, undefined);
    const historyTrail = (s4Task.stateHistory || []).map((h) => `${h.status}:${h.activity || 'done'}`);
    assert.deepEqual(
      historyTrail,
      ['ready:planning', 'ready:awaiting_approval', 'in_progress:coding', 'done:done'],
      'stateHistory must record exact locked READY planning -> Awaiting Proceed -> Coding -> Done progression'
    );
  });

  test('3h. FEAT-141 / FEAT-142: explicit worktree upgrade reporting & trickle-up fixes (johnny-saigon auto-accept vs external TO DO ticket)', () => {
    // Set up an isolated mock Main Memory Bank repo + downstream project
    const mockMainDir = path.join(os.tmpdir(), `agy-main-mb-${Date.now()}`);
    const mockDownstreamDir = path.join(os.tmpdir(), `agy-downstream-${Date.now()}`);
    try {
      fs.mkdirSync(path.join(mockMainDir, 'scripts'), { recursive: true });
      fs.mkdirSync(path.join(mockMainDir, 'templates', 'scripts'), { recursive: true });
      fs.mkdirSync(path.join(mockMainDir, 'docs'), { recursive: true });
      fs.mkdirSync(path.join(mockDownstreamDir, 'scripts'), { recursive: true });

      const baselineContent = '// baseline lint-memory v1\nconsole.log("ok");\n';
      fs.writeFileSync(path.join(mockMainDir, 'scripts', 'lint-memory.mjs'), baselineContent, 'utf8');
      fs.writeFileSync(path.join(mockMainDir, 'scripts', 'backlog.mjs'), '// backlog v1\n', 'utf8');
      fs.writeFileSync(path.join(mockMainDir, 'templates', 'scripts', 'backlog.mjs'), '// backlog v1\n', 'utf8');
      fs.writeFileSync(
        path.join(mockMainDir, 'docs', 'backlog.json'),
        JSON.stringify({ version: '1.0.0', project: 'antigravity_memory_bank', tasks: [], milestones: [] }, null, 2),
        'utf8'
      );

      // Case 1: Fix from GitHub user `johnny-saigon` -> MUST auto-accept into Main + template mirror!
      const ownerFix = '// backlog v2 fix by johnny-saigon\n';
      fs.writeFileSync(path.join(mockDownstreamDir, 'scripts', 'backlog.mjs'), ownerFix, 'utf8');
      const ownerOut = execFileSync(
        process.execPath,
        [CLI_PATH, 'trickle-up', mockDownstreamDir, '--main-root', mockMainDir, '--author', 'johnny-saigon'],
        { cwd: mockDownstreamDir, env: testEnv, encoding: 'utf8' }
      );
      assert.match(ownerOut, /TRICKLE-UP AUTO-ACCEPTED \(owner: johnny-saigon\)/);
      assert.equal(fs.readFileSync(path.join(mockMainDir, 'scripts', 'backlog.mjs'), 'utf8'), ownerFix);
      assert.equal(fs.readFileSync(path.join(mockMainDir, 'templates', 'scripts', 'backlog.mjs'), 'utf8'), ownerFix);

      // Case 2: Fix from someone else (`alice-dev`) -> MUST NOT overwrite Main, MUST create TO DO notification ticket in Main backlog!
      const extFix = '// lint-memory external fix by alice-dev\n';
      fs.writeFileSync(path.join(mockDownstreamDir, 'scripts', 'lint-memory.mjs'), extFix, 'utf8');
      const extOut = execFileSync(
        process.execPath,
        [CLI_PATH, 'trickle-up', mockDownstreamDir, '--main-root', mockMainDir, '--author', 'alice-dev'],
        { cwd: mockDownstreamDir, env: testEnv, encoding: 'utf8' }
      );
      assert.match(extOut, /TRICKLE-UP HELD FOR REVIEW \(external author @alice-dev\)/);
      assert.equal(
        fs.readFileSync(path.join(mockMainDir, 'scripts', 'lint-memory.mjs'), 'utf8'),
        baselineContent,
        'External contributor fix must NOT auto-overwrite Main Memory Bank'
      );
      const mainBacklog = JSON.parse(fs.readFileSync(path.join(mockMainDir, 'docs', 'backlog.json'), 'utf8'));
      const notifTicket = mainBacklog.tasks.find((t) => t.title.includes('@alice-dev') && t.title.includes('scripts/lint-memory.mjs'));
      assert.ok(notifTicket, 'External contributor fix must create a notification ticket in Main Memory Bank backlog');
      assert.equal(notifTicket.status, 'todo', 'External contributor notification ticket must land in TO DO column');
      assert.ok(notifTicket.trickleUp && notifTicket.trickleUp.patchPath, 'Notification ticket must attach proposed-fix.patch');

      // Case 3: Accepting the reviewed external ticket via `--accept <ID>` applies the fix and marks ticket DONE
      const acceptOut = execFileSync(
        process.execPath,
        [CLI_PATH, 'trickle-up', '--accept', notifTicket.id, '--main-root', mockMainDir],
        { cwd: mockMainDir, env: testEnv, encoding: 'utf8' }
      );
      assert.match(acceptOut, /Accepted trickled-up fix/);
      assert.equal(fs.readFileSync(path.join(mockMainDir, 'scripts', 'lint-memory.mjs'), 'utf8'), extFix);
    } finally {
      try { fs.rmSync(mockMainDir, { recursive: true, force: true }); } catch {}
      try { fs.rmSync(mockDownstreamDir, { recursive: true, force: true }); } catch {}
    }
  });

  test('3j. FEAT-143: TO DO-only click-to-add idea modal & isolated /api/backlog-add-isolated without disturbing active WIP', async () => {
    // 1. Verify HTML binds handleTodoColumnClick ONLY on #wrap-todo (never on ready/in_progress/done)
    execFileSync(
      process.execPath,
      [path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'render'],
      { cwd: tmpRepo, env: testEnv, stdio: 'pipe' }
    );
    const html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(html, /id="wrap-todo"[^>]*onclick="handleTodoColumnClick\(event\)"/, '#wrap-todo must trigger isolated idea modal on click');
    assert.doesNotMatch(html, /id="wrap-ready"[^>]*handleTodoColumnClick/, '#wrap-ready must NOT trigger idea modal');
    assert.doesNotMatch(html, /id="wrap-in_progress"[^>]*handleTodoColumnClick/, '#wrap-in_progress must NOT trigger idea modal');
    assert.doesNotMatch(html, /id="wrap-done"[^>]*handleTodoColumnClick/, '#wrap-done must NOT trigger idea modal');
    assert.match(html, /id="todoIdeaModal"/, 'backlog.html must include dedicated isolated #todoIdeaModal');
    assert.match(html, /id="todoIdeaInput"/, '#todoIdeaModal must use a single minimalist text input');
    assert.match(html, /id="todoVoiceBtn"/, '#todoIdeaModal must include voice input microphone button');
    assert.match(html, /toggleTodoIdeaVoice/, '#todoIdeaModal must wire voice input handler');
    assert.match(html, /finishTodoIdeaVoiceAndTranscribe/, '#todoIdeaModal must transcribe recorded audio via /api/voice-transcribe');
    assert.match(html, /\/api\/voice-transcribe/, '#todoIdeaModal must send MediaRecorder audio to /api/voice-transcribe (PlayTask parity)');
    assert.match(html, /\/api\/voice-record\/start/, '#todoIdeaModal must fall back to local bridge host-mic recording inside sandboxed Review Pane iframes');
    assert.match(html, /\/api\/voice-record\/stop/, '#todoIdeaModal must stop & transcribe host-mic recording on finish');
    assert.doesNotMatch(html, /webkitSpeechRecognition/, '#todoIdeaModal must not rely on Chromium cloud webkitSpeechRecognition which fails in Electron');
    const bridgeSrc = fs.readFileSync(path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'utf8');
    assert.match(bridgeSrc, /import os from 'node:os'/, 'backlog.mjs must import node:os for ASR config & host-mic temp helpers');
    assert.match(bridgeSrc, /BRIDGE_VERSION = '1\.9\.2'/, 'Bridge version must be bumped to 1.9.2 so stale daemons restart automatically');
    assert.match(bridgeSrc, /transcribeViaGemini/, 'Bridge server must include Gemini multimodal audio transcription');
    assert.match(bridgeSrc, /transcribeViaWhisperEndpoint/, 'Bridge server must include Whisper ASR transcription failover');
    assert.doesNotMatch(html, /id="todoIdeaType"/, '#todoIdeaModal must not clutter UI with manual Type/Priority dropdowns');

    // FEAT-144 / 145 / 146 assertions on rendered HTML
    assert.match(html, /title="Record Audio"/, '#todoVoiceBtn must use AGY Record Audio tooltip');
    assert.match(html, /AGY_RECORD_AUDIO_SVG/, 'backlog.html must include native AGY Record Audio vector SVG iconography');
    assert.doesNotMatch(html, /id="todoVoiceIcon"[^>]*>🎙️/, '#todoVoiceIcon must use AGY vector SVG instead of microphone emoji');
    assert.match(html, /id="inspectorHeaderPlanBtn"[\s\S]*PLAN NOW/, 'Opened ticket modal header must include PLAN NOW button');
    assert.match(html, /id="inspectorHeaderCodeBtn"[\s\S]*CODE NOW/, 'Opened ticket modal header must include CODE NOW button');
    assert.match(html, /id="inspectorFooterPlanBtn"[\s\S]*PLAN NOW/, 'Opened ticket modal footer must include PLAN NOW button');
    assert.match(html, /id="inspectorFooterCodeBtn"[\s\S]*CODE NOW/, 'Opened ticket modal footer must include CODE NOW button');
    assert.match(html, /openPlanFromInspector/, 'Opened ticket modal must wire openPlanFromInspector');
    assert.match(html, /id="inspectorEffortBadge"/, 'Opened ticket modal must include Suggested Execution Effort badge');
    assert.match(html, /getRecommendedExecutionEffort/, 'backlog.html must compute Suggested Execution Effort (HIGH/MEDIUM/LOW)');
    assert.match(html, /id="select-all-todo"/, 'TO DO column header must provide Select All multi-select toggle');
    assert.match(html, /id="select-all-ready"/, 'READY column header must provide Select All multi-select toggle');
    assert.match(html, /id="multiSelectActionBar"/, 'backlog.html must provide floating multi-ticket batch action bar');
    assert.match(html, /toggleTicketMultiSelect/, 'TO DO & READY cards must wire multi-select checkboxes');
    assert.match(html, /openBatchModelSelector/, 'Multi-select bar must open batch Plan / Orchestrator Code selector');
    assert.match(html, /orchestrator-carbon-high/, 'Model selector must offer Google Orchestrator simultaneous execution');
    assert.match(bridgeSrc, /myCount >= c\.maxOther/, 'findTargetBrainDirs must never allow sibling-mention hijack across repos');

    // 2. Verify live POST /api/backlog-add-isolated adds an annotated TO DO ticket while leaving activePlanTaskIds, WIP, and implementation_plan.md untouched
    const planPath = path.join(tmpRepo, 'docs', 'planning', 'implementation_plan.md');
    const sentinelPlan = '# Sentinel Active Plan\nDo not disturb during isolated /backlog-add.\n';
    fs.writeFileSync(planPath, sentinelPlan, 'utf8');

    const beforeData = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    beforeData.activePlanTaskIds = ['FEAT-ACTIVE-WIP'];
    beforeData.tasks.push({
      id: 'FEAT-ACTIVE-WIP',
      type: 'feature',
      title: 'Ongoing Active Work',
      status: 'in_progress',
      priority: 'high',
      components: [],
      attachments: [],
      description: 'Must remain untouched'
    });
    fs.writeFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), JSON.stringify(beforeData, null, 2) + '\n', 'utf8');

    const out = execFileSync(
      process.execPath,
      [
        path.join(tmpRepo, 'scripts', 'backlog.mjs'),
        'add-isolated',
        'Isolated Background Idea From TO DO Click',
        '--desc',
        'Captured without interrupting current turn',
        '--type',
        'ux',
        '--priority',
        'medium'
      ],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    assert.match(out, /ISOLATED TO DO CAPTURE/);

    const afterData = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const addedIdea = afterData.tasks.find((t) => t.title === 'Isolated Background Idea From TO DO Click');
    assert.ok(addedIdea, 'Isolated idea must be added to docs/backlog.json');
    assert.equal(addedIdea.status, 'todo', 'Isolated idea must land strictly in TO DO');
    assert.ok(addedIdea.annotations, 'Isolated idea must be auto-annotated with 0 AI tokens');
    assert.deepEqual(afterData.activePlanTaskIds, ['FEAT-ACTIVE-WIP'], 'activePlanTaskIds must remain 100% untouched');
    assert.equal(afterData.tasks.find((t) => t.id === 'FEAT-ACTIVE-WIP').status, 'in_progress', 'Active WIP ticket must remain IN PROGRESS');
    assert.equal(fs.readFileSync(planPath, 'utf8'), sentinelPlan, 'Active implementation_plan.md must remain 100% untouched');
    assert.match(
      fs.readFileSync(path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'utf8'),
      /endpoint === '\/api\/backlog-add-isolated'/,
      'Local bridge must expose /api/backlog-add-isolated for out-of-band UI capture'
    );
  });

  test('3k. FEAT-145/146: findTargetBrainDirs blocks sibling-repo overwrite & script JS executes cleanly in vm', () => {
    const mockHome = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'agy-brain-iso-')));
    const brainRoot = path.join(mockHome, '.gemini', 'antigravity', 'brain');
    const dirA = path.join(mockHome, 'SnapCal');
    const dirB = path.join(mockHome, 'SnapCal-Base44');
    const sharedCid = path.join(brainRoot, 'shared-convo-111');
    try {
      fs.mkdirSync(path.join(sharedCid, '.system_generated', 'logs'), { recursive: true });
      fs.mkdirSync(path.join(dirA, 'docs'), { recursive: true });
      fs.mkdirSync(path.join(dirA, 'scripts'), { recursive: true });
      fs.mkdirSync(path.join(dirB, 'docs'), { recursive: true });
      fs.mkdirSync(path.join(dirB, 'scripts'), { recursive: true });

      fs.copyFileSync(path.join(tmpRepo, 'scripts', 'backlog.mjs'), path.join(dirA, 'scripts', 'backlog.mjs'));
      fs.copyFileSync(path.join(tmpRepo, 'scripts', 'backlog.mjs'), path.join(dirB, 'scripts', 'backlog.mjs'));

      fs.writeFileSync(path.join(dirA, 'docs', 'backlog.json'), JSON.stringify({
        project: 'snapcal',
        tasks: [{ id: 'FEAT-1', type: 'feature', title: 'SnapCal Task', status: 'todo', priority: 'high' }],
        meta: { lastBrainDir: sharedCid }
      }, null, 2));
      fs.writeFileSync(path.join(dirB, 'docs', 'backlog.json'), JSON.stringify({
        project: 'snapcal_base44',
        tasks: [{ id: 'FEAT-2', type: 'feature', title: 'Base44 Task', status: 'todo', priority: 'medium' }],
        meta: { lastBrainDir: sharedCid }
      }, null, 2));

      // Dominant SnapCal transcript (12 mentions) vs minor SnapCal-Base44 mention (2 mentions)
      const transcriptLines = Array(12).fill(JSON.stringify({ content: dirA })).concat(
        Array(2).fill(JSON.stringify({ content: dirB }))
      ).join('\n');
      fs.writeFileSync(path.join(sharedCid, '.system_generated', 'logs', 'transcript.jsonl'), transcriptLines, 'utf8');

      const isoEnv = { ...testEnv, HOME: mockHome, USERPROFILE: mockHome, ANTIGRAVITY_BRAIN_DIR: '' };
      execFileSync(process.execPath, [path.join(dirA, 'scripts', 'backlog.mjs'), 'render'], { cwd: dirA, env: isoEnv, stdio: 'pipe' });
      const ownedHtml = fs.readFileSync(path.join(sharedCid, 'backlog.html'), 'utf8');
      assert.equal(ownedHtml.includes(`"repoRoot":${JSON.stringify(dirA)}`), true, 'SnapCal must own shared brain artifact');

      // Validate generated script block in VM
      const scriptMatch = ownedHtml.match(/<script>([\s\S]*?)<\/script>/);
      assert.ok(scriptMatch, 'Rendered backlog.html must include inline controller script');
      new vm.Script(scriptMatch[1]);

      // Rendering SnapCal-Base44 must NOT overwrite SnapCal's brain/backlog.html!
      execFileSync(process.execPath, [path.join(dirB, 'scripts', 'backlog.mjs'), 'render'], { cwd: dirB, env: isoEnv, stdio: 'pipe' });
      const afterBase44Html = fs.readFileSync(path.join(sharedCid, 'backlog.html'), 'utf8');
      assert.match(afterBase44Html, /"project":"snapcal"/, 'SnapCal-Base44 must NEVER overwrite SnapCal brain artifact');
      assert.doesNotMatch(afterBase44Html, /"project":"snapcal_base44"/, 'Sibling project must not hijack owned brain dir');
    } finally {
      try { fs.rmSync(mockHome, { recursive: true, force: true }); } catch {}
    }
  });

  test('3i. backlog children: retrieves children tickets of non-completed parents only, supports --open-only and <PARENT_ID>, and renders parent/child badges', () => {
    const backlogScriptPath = path.join(tmpRepo, 'scripts', 'backlog.mjs');

    // Create an incomplete parent (in_progress) and split into 2 child tickets
    execFileSync(process.execPath, [backlogScriptPath, 'add', '--id', 'FEAT-500', '--title', 'Incomplete Parent Feature', '--priority', 'high'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    execFileSync(process.execPath, [backlogScriptPath, 'start', 'FEAT-500'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    execFileSync(process.execPath, [backlogScriptPath, 'split', 'FEAT-500', 'Child A Open', 'Child B Done'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });

    // Create a completed parent (done) and split into a child ticket, then mark parent done
    execFileSync(process.execPath, [backlogScriptPath, 'add', '--id', 'FEAT-600', '--title', 'Completed Parent Feature', '--priority', 'medium'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    execFileSync(process.execPath, [backlogScriptPath, 'split', 'FEAT-600', 'Orphan Child Of Done Parent'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    execFileSync(process.execPath, [backlogScriptPath, 'done', 'FEAT-600', '--force'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });

    // Mark second child of FEAT-500 as done to verify --open-only filtering
    const beforeJson = JSON.parse(
      execFileSync(process.execPath, [backlogScriptPath, 'children', 'FEAT-500', '--json', '--all-branches'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' })
    );
    assert.equal(beforeJson.parentCount, 1);
    assert.equal(beforeJson.count, 2);
    const childB = beforeJson.children.find(c => c.title.includes('Child B Done'));
    assert.ok(childB, 'Expected Child B Done under FEAT-500');
    execFileSync(process.execPath, [backlogScriptPath, 'done', childB.id, '--force'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });

    // 1. All children of non-completed parents (must include FEAT-500's 2 children and EXCLUDE FEAT-600's child)
    const allIncomplete = JSON.parse(
      execFileSync(process.execPath, [backlogScriptPath, 'children', '--json', '--all-branches'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' })
    );
    assert.equal(allIncomplete.parents.some(p => p.parent.id === 'FEAT-500'), true, 'Expected incomplete parent FEAT-500');
    assert.equal(allIncomplete.parents.some(p => p.parent.id === 'FEAT-600'), false, 'Completed parent FEAT-600 must be excluded');
    assert.equal(allIncomplete.children.some(c => c.title.includes('Orphan Child Of Done Parent')), false, 'Children of done parents must be excluded');
    assert.equal(allIncomplete.children.filter(c => c.parentId === 'FEAT-500').length, 2);

    // 2. --open-only returns only non-completed children of non-completed parents
    const openOnlyRes = JSON.parse(
      execFileSync(process.execPath, [backlogScriptPath, 'children', 'FEAT-500', '--open-only', '--json', '--all-branches'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' })
    );
    assert.equal(openOnlyRes.count, 1);
    assert.match(openOnlyRes.children[0].title, /Child A Open/);

    // 3. Rendered backlog.html shows parent child count badge and child-of badge
    execFileSync(process.execPath, [backlogScriptPath, 'render'], { cwd: tmpRepo, env: testEnv, encoding: 'utf8' });
    const html = fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.html'), 'utf8');
    assert.match(html, /2 Children \(1 Open\)/);
    assert.match(html, /↳ Child of FEAT-500/);
  });

  test('3l. FEAT-147 / BUG-113 / BUG-114: FEAT-xxx-ACT-N child lifecycle, Proceed non-premature trigger, and locked greyed-out READY planning UI', () => {
    const backlogScriptPath = path.join(tmpRepo, 'scripts', 'backlog.mjs');

    // 1. FEAT-147 Unit + E2E: planned multi-step parent ticket (FEAT-011) spawns FEAT-011-ACT-1 / FEAT-011-ACT-2 and rolls up
    execFileSync(
      process.execPath,
      [backlogScriptPath, 'add', '--id', 'FEAT-011', '--title', 'Auth Token Refresh Flow', '--priority', 'high'],
      { cwd: tmpRepo, env: testEnv, encoding: 'utf8' }
    );
    const planPath = path.join(tmpRepo, 'docs', 'planning', 'implementation_plan.md');
    fs.writeFileSync(
      planPath,
      [
        '# Implementation Plan — [FEAT-011] Auth Token Refresh Flow',
        '',
        '## 1. Goal Description',
        'Multi-step auth token rotation.',
        '',
        '## 3. Proposed Changes',
        '',
        '### Phase 1: Add JWT Refresh Endpoint',
        'Update auth handler.',
        '',
        '### Phase 2: Persist Session Rotation',
        'Update token store.'
      ].join('\n'),
      'utf8'
    );
    execFileSync(process.execPath, [backlogScriptPath, 'plan', '--from-plan'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    // Re-running plan --from-plan must be idempotent (no duplicate FEAT-011-ACT-3)
    execFileSync(process.execPath, [backlogScriptPath, 'plan', '--from-plan'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });

    const actJson1 = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const feat011 = actJson1.tasks.find((t) => t.id === 'FEAT-011');
    const act1 = actJson1.tasks.find((t) => t.id === 'FEAT-011-ACT-1');
    const act2 = actJson1.tasks.find((t) => t.id === 'FEAT-011-ACT-2');
    const act3 = actJson1.tasks.find((t) => t.id === 'FEAT-011-ACT-3');
    assert.ok(feat011 && act1 && act2, 'plan --from-plan must spawn FEAT-011-ACT-1 and FEAT-011-ACT-2');
    assert.equal(act3, undefined, 'Repeated plan --from-plan must not duplicate -ACT-N child tickets');
    assert.equal(act1.parentId, 'FEAT-011');
    assert.equal(act1.isActionChild, true);
    assert.equal(act2.parentId, 'FEAT-011');
    assert.equal(act2.isActionChild, true);
    assert.equal(
      feat011.actionItems.some((a) => a.childTicketId === 'FEAT-011-ACT-1'),
      true,
      'Parent FEAT-011 actionItems must bidirectionally link FEAT-011-ACT-1'
    );

    // Complete first action child -> parent remains open; complete second -> parent auto-completes (done)
    execFileSync(process.execPath, [backlogScriptPath, 'done', 'FEAT-011-ACT-1', '--force'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    const midRollup = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    const midParent = midRollup.tasks.find((t) => t.id === 'FEAT-011');
    assert.notEqual(midParent.status, 'done', 'Parent must stay open while FEAT-011-ACT-2 is pending');
    assert.equal(
      midParent.actionItems.find((a) => a.childTicketId === 'FEAT-011-ACT-1')?.done,
      true,
      'Completing FEAT-011-ACT-1 must mark linked parent actionItem done'
    );

    execFileSync(process.execPath, [backlogScriptPath, 'done', 'FEAT-011-ACT-2', '--force'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    const doneRollup = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    assert.equal(
      doneRollup.tasks.find((t) => t.id === 'FEAT-011')?.status,
      'done',
      'Completing all FEAT-011-ACT-N children must auto-complete FEAT-011'
    );

    // Explicitly verify `backlog split` also names children `<PARENT_ID>-ACT-1`, `-ACT-2`
    execFileSync(process.execPath, [backlogScriptPath, 'add', '--id', 'FEAT-710', '--title', 'Split Naming Check'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    execFileSync(process.execPath, [backlogScriptPath, 'split', 'FEAT-710', 'First Action', 'Second Action'], {
      cwd: tmpRepo,
      env: testEnv,
      encoding: 'utf8'
    });
    const splitJson = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    assert.ok(splitJson.tasks.find((t) => t.id === 'FEAT-710-ACT-1'), 'split must name child FEAT-710-ACT-1');
    assert.ok(splitJson.tasks.find((t) => t.id === 'FEAT-710-ACT-2'), 'split must name child FEAT-710-ACT-2');

    // 2. BUG-113 & BUG-114 Isolated Non-Regression + E2E Suite
    const bugRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-bug113-114-'));
    try {
      execFileSync(process.execPath, [CLI_PATH, 'install', bugRepo], { cwd: bugRepo, env: testEnv, stdio: 'pipe' });
      execSync('git init && git config user.email "test@example.com" && git config user.name "Test" && git add -A && git commit -m "init"', {
        cwd: bugRepo,
        stdio: 'pipe'
      });

      const bugBacklogScript = path.join(bugRepo, 'scripts', 'backlog.mjs');
      const bugSyncScript = path.join(bugRepo, 'scripts', 'sync-memory-context.mjs');
      const bugBacklogJson = path.join(bugRepo, 'docs', 'backlog.json');
      const bugBacklogHtml = path.join(bugRepo, 'docs', 'backlog.html');
      const bugPlanFile = path.join(bugRepo, 'docs', 'planning', 'implementation_plan.md');

      // Pre-existing dirty code file created BEFORE planning begins
      fs.mkdirSync(path.join(bugRepo, 'src'), { recursive: true });
      const dirtySrcFile = path.join(bugRepo, 'src', 'existing.js');
      fs.writeFileSync(dirtySrcFile, 'export const existing = 1;\n', 'utf8');
      const oldTs = new Date(Date.now() - 10000);
      fs.utimesSync(dirtySrcFile, oldTs, oldTs);

      // BUG-114 Stage 1: stage-plan puts FEAT-830 into locked, greyed-out READY (never IN PROGRESS or TO DO)
      execFileSync(
        process.execPath,
        [bugBacklogScript, 'stage-plan', 'Locked Ready Planning Ticket', '--id', 'FEAT-830'],
        { cwd: bugRepo, env: testEnv, stdio: 'pipe' }
      );
      let bj = JSON.parse(fs.readFileSync(bugBacklogJson, 'utf8'));
      let t830 = bj.tasks.find((t) => t.id === 'FEAT-830');
      assert.equal(t830.status, 'ready', 'BUG-114: stage-plan must place ticket in READY column');
      assert.equal(t830.liveActivity, 'planning', 'BUG-114: stage-plan must set liveActivity=planning');
      assert.equal(t830.planningLocked, true, 'BUG-114: stage-plan must set planningLocked=true');

      const htmlLocked = fs.readFileSync(bugBacklogHtml, 'utf8');
      const readyColSlice = htmlLocked.split('id="col-ready"')[1]?.split('id="col-in_progress"')[0] || '';
      const inProgColSlice = htmlLocked.split('id="col-in_progress"')[1]?.split('id="col-done"')[0] || '';
      assert.equal(readyColSlice.includes('data-task-id="FEAT-830"'), true, 'BUG-114: Locked planning card must render inside col-ready');
      assert.equal(inProgColSlice.includes('data-task-id="FEAT-830"'), false, 'BUG-114: Locked planning card must NOT enter col-in_progress');
      const card830 = readyColSlice.slice(Math.max(0, readyColSlice.indexOf('data-task-id="FEAT-830"')));
      assert.match(card830, /opacity-55/, 'BUG-114: Locked planning card must be visually greyed out');
      assert.match(card830, /cursor-not-allowed/, 'BUG-114: Locked planning card must show not-allowed cursor');
      assert.match(card830, /draggable="false"/, 'BUG-114: Locked planning card must be non-draggable');
      assert.match(card830, /🔒<\/span>\s*Planning Locked/, 'BUG-114: Locked planning card must disable action buttons');
      assert.doesNotMatch(card830, /openModelSelectorModal\('FEAT-830'/, 'BUG-114: Locked planning card must not expose active Code/Plan model buttons');

      // BUG-114 Non-regression: even write_file PostToolUse or quiet proceed must NOT unlock/move planningLocked ticket to IN PROGRESS
      execFileSync(process.execPath, [bugBacklogScript, 'proceed', '--quiet'], { cwd: bugRepo, env: testEnv, stdio: 'pipe' });
      execFileSync(process.execPath, [bugSyncScript, '--hook', 'PostToolUse'], {
        cwd: bugRepo,
        env: testEnv,
        input: JSON.stringify({ tool_name: 'write_file', tool_input: { Path: dirtySrcFile } }),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      bj = JSON.parse(fs.readFileSync(bugBacklogJson, 'utf8'));
      t830 = bj.tasks.find((t) => t.id === 'FEAT-830');
      assert.equal(t830.status, 'ready', 'BUG-114: Locked planning ticket must stay in READY even during hook/proceed runs');
      assert.equal(t830.planningLocked, true, 'BUG-114: planningLocked must remain true until plan is finalized');

      // BUG-114 Stage 2: finalizing implementation_plan.md unlocks FEAT-830 cleanly in READY (Proceed displayed, NOT clicked)
      fs.writeFileSync(
        bugPlanFile,
        `# Implementation Plan — [FEAT-830] Locked Ready Planning Ticket\n\nWorkspace: ${bugRepo}\n\n### [FEAT-830] Locked Ready Planning Ticket\nSafe locked planning flow.\n`,
        'utf8'
      );
      execFileSync(process.execPath, [bugBacklogScript, 'render'], { cwd: bugRepo, env: testEnv, stdio: 'pipe' });
      bj = JSON.parse(fs.readFileSync(bugBacklogJson, 'utf8'));
      t830 = bj.tasks.find((t) => t.id === 'FEAT-830');
      assert.equal(t830.status, 'ready', 'BUG-114: Finalizing plan must unlock inside READY (awaiting Proceed)');
      assert.equal(t830.liveActivity, 'awaiting_approval');
      assert.equal(t830.planningLocked, undefined, 'BUG-114: Finalizing plan must clear planningLocked');

      // BUG-113 Non-regression 1: Pre-existing dirty code file + empty stdin sync must NOT move READY -> IN PROGRESS when Proceed is displayed
      execFileSync(process.execPath, [bugSyncScript, '--quiet'], { cwd: bugRepo, env: testEnv, stdio: 'pipe' });
      bj = JSON.parse(fs.readFileSync(bugBacklogJson, 'utf8'));
      assert.equal(
        bj.tasks.find((t) => t.id === 'FEAT-830')?.status,
        'ready',
        'BUG-113: Pre-existing dirty code files must NEVER prematurely move READY -> IN PROGRESS while Proceed is unclicked'
      );

      // BUG-113 Non-regression 2: PostToolUse `read_file` on a workspace code file must NOT move READY -> IN PROGRESS
      execFileSync(process.execPath, [bugSyncScript, '--hook', 'PostToolUse'], {
        cwd: bugRepo,
        env: testEnv,
        input: JSON.stringify({ tool_name: 'read_file', tool_input: { Path: dirtySrcFile } }),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      bj = JSON.parse(fs.readFileSync(bugBacklogJson, 'utf8'));
      assert.equal(
        bj.tasks.find((t) => t.id === 'FEAT-830')?.status,
        'ready',
        'BUG-113: read_file PostToolUse hook must NEVER prematurely move READY -> IN PROGRESS'
      );

      // BUG-113 Positive E2E: Actual PostToolUse mutating code edit (`edit_file`) after Proceed IS clicked promotes READY -> IN PROGRESS
      execFileSync(process.execPath, [bugSyncScript, '--hook', 'PostToolUse'], {
        cwd: bugRepo,
        env: testEnv,
        input: JSON.stringify({ tool_name: 'edit_file', tool_input: { Path: dirtySrcFile } }),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      bj = JSON.parse(fs.readFileSync(bugBacklogJson, 'utf8'));
      t830 = bj.tasks.find((t) => t.id === 'FEAT-830');
      assert.equal(t830.status, 'in_progress', 'BUG-113: Actual code-mutating edit_file after plan must transition READY -> IN PROGRESS');
      assert.equal(t830.liveActivity, 'coding');
    } finally {
      try { fs.rmSync(bugRepo, { recursive: true, force: true }); } catch {}
    }
  });

  test('3m. BUG-115: Prompt Window dispatch on PLAN/CODE transitions, strict IN PROGRESS/DONE -> TO DO guard, and /api/unlock-plan', async () => {
    const backlogSrc = fs.readFileSync(path.join(tmpRepo, 'scripts', 'backlog.mjs'), 'utf8');
    assert.match(backlogSrc, /function dispatchPromptToAntigravity\(/, 'BUG-115: backlog.mjs must define dispatchPromptToAntigravity');
    assert.match(backlogSrc, /needsAccessibility/, 'BUG-115: bridge response must surface macOS Accessibility fallback cleanly');
    assert.match(backlogSrc, /async function unlockPlanningTicket\(/, 'BUG-115: UI must define unlockPlanningTicket escape hatch');
    assert.match(backlogSrc, /endpoint === '\/api\/unlock-plan'/, 'BUG-115: bridge server must expose /api/unlock-plan');
    assert.match(backlogSrc, /function tryNativeHostSendMessage\(/, 'BUG-115: client must attempt MCP App ui/message dispatch when embedded');
    assert.match(
      backlogSrc,
      /openModelSelectorModal\('\$\{safeIdAttr\}', 'plan', event\)/,
      'BUG-115: TO DO quick plan button must route through PLAN modal & Prompt dispatch'
    );
    assert.match(
      backlogSrc,
      /openModelSelectorModal\('\$\{safeIdAttr\}', 'code', event\)/,
      'BUG-115: quick code button must route through CODE modal & Prompt dispatch'
    );
    assert.match(
      backlogSrc,
      /Move \[' \+ sourceId \+ '\] back to TO DO first to re-plan it\./,
      'BUG-115: drag-drop must block IN PROGRESS/DONE -> READY re-plan without returning to TO DO'
    );

    const httpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-bug115-bridge-'));
    let bridgeProc = null;
    try {
      execFileSync(process.execPath, [CLI_PATH, 'install', httpRepo], { cwd: httpRepo, env: testEnv, stdio: 'pipe' });
      const httpBacklogScript = path.join(httpRepo, 'scripts', 'backlog.mjs');
      const httpJsonPath = path.join(httpRepo, 'docs', 'backlog.json');
      const httpHtmlPath = path.join(httpRepo, 'docs', 'backlog.html');

      execFileSync(process.execPath, [httpBacklogScript, 'add', '--id', 'FEAT-910', '--title', 'Todo Dispatch Ticket', '--priority', 'high'], { cwd: httpRepo, env: testEnv, stdio: 'pipe' });
      execFileSync(process.execPath, [httpBacklogScript, 'add', '--id', 'FEAT-911', '--title', 'InProg Guard Ticket', '--priority', 'medium'], { cwd: httpRepo, env: testEnv, stdio: 'pipe' });
      execFileSync(process.execPath, [httpBacklogScript, 'start', 'FEAT-911'], { cwd: httpRepo, env: testEnv, stdio: 'pipe' });
      execFileSync(process.execPath, [httpBacklogScript, 'add', '--id', 'FEAT-912', '--title', 'Done Guard Ticket', '--priority', 'low'], { cwd: httpRepo, env: testEnv, stdio: 'pipe' });
      execFileSync(process.execPath, [httpBacklogScript, 'done', 'FEAT-912', '--force'], { cwd: httpRepo, env: testEnv, stdio: 'pipe' });

      const bridgePort = 14399 + Math.floor(Math.random() * 400);
      bridgeProc = spawn(process.execPath, [httpBacklogScript, 'serve', '--port', String(bridgePort)], {
        cwd: httpRepo,
        env: { ...testEnv, ANTIGRAVITY_SKIP_PROMPT_DISPATCH: '1' },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const baseUrl = `http://127.0.0.1:${bridgePort}`;
      let health = null;
      for (let i = 0; i < 30; i++) {
        try {
          const r = await fetch(`${baseUrl}/api/health`);
          if (r.ok) {
            health = await r.json();
            break;
          }
        } catch {}
        await new Promise((res) => setTimeout(res, 100));
      }
      assert.equal(health?.ok, true, 'BUG-115: isolated bridge server must boot');
      assert.equal(health?.version, '1.9.2', 'BUG-115: bridge health must report v1.9.2');

      const postJson = async (endpoint, body) => {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoRoot: httpRepo, ...body })
        });
        return { status: res.status, data: await res.json() };
      };

      // 1. PLAN on TO DO ticket -> 200, READY + planningLocked + unlock button in rendered HTML
      const planTodo = await postJson('/api/plan', { id: 'FEAT-910', prompt: '/effort high /backlog-plan FEAT-910 --model gemini-4-argon-high' });
      assert.equal(planTodo.status, 200);
      assert.equal(planTodo.data.ok, true);
      let bj = JSON.parse(fs.readFileSync(httpJsonPath, 'utf8'));
      const t910 = bj.tasks.find((t) => t.id === 'FEAT-910');
      assert.equal(t910.status, 'ready');
      assert.equal(t910.liveActivity, 'planning');
      assert.equal(t910.planningLocked, true);
      const renderedHtml = fs.readFileSync(httpHtmlPath, 'utf8');
      assert.match(renderedHtml, /unlockPlanningTicket\('FEAT-910', event\)/, 'Locked READY card must expose 🔓 Unlock button');

      // 2. PLAN on IN PROGRESS & DONE -> 409 blocked (must return to TO DO first)
      const planInProg = await postJson('/api/plan', { id: 'FEAT-911', prompt: '/effort high /backlog-plan FEAT-911' });
      assert.equal(planInProg.status, 409);
      assert.match(planInProg.data.error, /back to TO DO/i);

      const planDone = await postJson('/api/plan', { id: 'FEAT-912', prompt: '/effort high /backlog-plan FEAT-912' });
      assert.equal(planDone.status, 409);
      assert.match(planDone.data.error, /back to TO DO/i);

      // 3. CODE on DONE or IN PROGRESS -> 409 blocked
      const codeDone = await postJson('/api/kickoff', { id: 'FEAT-912', prompt: '/effort low /backlog-start FEAT-912' });
      assert.equal(codeDone.status, 409);
      assert.match(codeDone.data.error, /back to TO DO/i);

      // 4. Unlock locked READY card -> cleanly reverts to TO DO without executing a turn
      const unlockRes = await postJson('/api/unlock-plan', { id: 'FEAT-910' });
      assert.equal(unlockRes.status, 200);
      assert.equal(unlockRes.data.status, 'todo');
      bj = JSON.parse(fs.readFileSync(httpJsonPath, 'utf8'));
      assert.equal(bj.tasks.find((t) => t.id === 'FEAT-910')?.planningLocked, undefined);

      // 5. CODE on TO DO ticket -> 200 & transitions to IN PROGRESS (coding)
      const codeTodo = await postJson('/api/kickoff', { id: 'FEAT-910', prompt: '/effort high /backlog-start FEAT-910 --model gemini-4-neon-medium' });
      assert.equal(codeTodo.status, 200);
      assert.equal(codeTodo.data.ok, true);
      bj = JSON.parse(fs.readFileSync(httpJsonPath, 'utf8'));
      const coded910 = bj.tasks.find((t) => t.id === 'FEAT-910');
      assert.equal(coded910.status, 'in_progress');
      assert.equal(coded910.liveActivity, 'coding');
    } finally {
      if (bridgeProc && !bridgeProc.killed) {
        try { bridgeProc.kill('SIGKILL'); } catch {}
      }
      try { fs.rmSync(httpRepo, { recursive: true, force: true }); } catch {}
    }
  });

  test('3n. FEAT-148: native Antigravity MCP App plugin (SEP-1865) bundle, stdio tools, BUG-115 guards, and CLI plugin install', async () => {
    const distServer = path.join(REPO_ROOT, 'mcp', 'dist', 'server.mjs');
    const distHtml = path.join(REPO_ROOT, 'mcp', 'dist', 'app.html');
    const pluginManifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'plugin.json'), 'utf8'));
    const mcpCfg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'mcp_config.json'), 'utf8'));

    assert.equal(fs.existsSync(distServer), true, 'mcp/dist/server.mjs must exist');
    assert.equal(fs.existsSync(distHtml), true, 'mcp/dist/app.html must exist');
    assert.ok(fs.statSync(distHtml).size < 10 * 1024 * 1024, 'mcp/dist/app.html must be < 10 MiB');
    const htmlContent = fs.readFileSync(distHtml, 'utf8');
    assert.equal(/<script[^>]+src=["']https?:\/\//i.test(htmlContent), false, 'app.html must not contain external script tags');
    assert.equal(/<link[^>]+href=["']https?:\/\//i.test(htmlContent), false, 'app.html must not contain external link tags');
    assert.ok((pluginManifest.suggestedPrompts || []).length <= 3, 'plugin.json must declare <= 3 suggestedPrompts');
    assert.ok(mcpCfg.mcpServers?.['memory-bank'], 'mcp_config.json must configure memory-bank server');

    // Test CLI plugin install into isolated fake HOME
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-plugin-home-'));
    const mcpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-mcp-repo-'));
    let mcpProc = null;
    try {
      execFileSync('git', ['init', '-b', 'main'], { cwd: mcpRepo, stdio: 'ignore' });
      execFileSync(process.execPath, [CLI_PATH, 'init', mcpRepo, '-y', '--name', 'McpTestApp'], {
        cwd: mcpRepo,
        env: testEnv,
        stdio: 'ignore'
      });

      const installOut = execFileSync(process.execPath, [CLI_PATH, 'plugin', 'install'], {
        cwd: REPO_ROOT,
        env: { ...testEnv, HOME: fakeHome, ANTIGRAVITY_SKIP_LS_REFRESH: '1' },
        encoding: 'utf8'
      });
      assert.match(installOut, /Installed Antigravity Memory Bank MCP App Plugin/i);

      const installedDir = path.join(fakeHome, '.gemini', 'config', 'plugins', 'memory-bank');
      const installedServer = path.join(installedDir, 'mcp', 'dist', 'server.mjs');
      assert.equal(fs.existsSync(path.join(installedDir, 'plugin.json')), true);
      assert.equal(fs.existsSync(path.join(installedDir, 'mcp_config.json')), true);
      assert.equal(fs.existsSync(path.join(installedDir, 'assets', 'logo.svg')), true);
      assert.equal(fs.existsSync(installedServer), true);
      assert.equal(fs.existsSync(path.join(installedDir, 'mcp', 'dist', 'app.html')), true);
      assert.equal(fs.existsSync(path.join(installedDir, 'skills', 'start', 'SKILL.md')), true);
      assert.equal(fs.existsSync(path.join(installedDir, 'skills', 'backlog-plan', 'SKILL.md')), true);

      // Spawn the installed standalone bundle from os.tmpdir() (zero node_modules!)
      mcpProc = spawn(process.execPath, [installedServer, `--data-dir=${fakeHome}`], {
        cwd: os.tmpdir(),
        env: { ...testEnv, HOME: fakeHome, ANTIGRAVITY_MEMORY_BANK_ROOT: REPO_ROOT },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const pending = new Map();
      let buf = '';
      let nextId = 1;
      mcpProc.stdout.on('data', (chunk) => {
        buf += chunk.toString();
        let nl;
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
        }
      });

      const rpc = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const id = nextId++;
          const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`MCP RPC timeout on ${method}`));
          }, 15000);
          pending.set(id, {
            resolve: (msg) => {
              clearTimeout(timer);
              resolve(msg);
            }
          });
          mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
        });

      const initRes = await rpc('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'cli-e2e', version: '1.0.0' }
      });
      assert.equal(initRes.result?.serverInfo?.name, 'antigravity-memory-bank');
      mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

      // 1. Tool visibility: strictly 2 model-visible + 15 app-only (0 model prompt bloat)
      const listRes = await rpc('tools/list');
      const tools = listRes.result?.tools || [];
      assert.equal(tools.length, 17, 'Expected 17 total MCP tools (2 model + 15 app-only)');
      const modelTools = tools.filter((t) => !(t._meta?.ui?.visibility || []).includes('app')).map((t) => t.name).sort();
      const appTools = tools.filter((t) => (t._meta?.ui?.visibility || []).includes('app'));
      assert.deepEqual(modelTools, ['memory_bank_dashboard', 'memory_bank_inline_status']);
      assert.equal(appTools.length, 15, 'All 15 UI backend tools must carry visibility: ["app"]');
      const dash = tools.find((t) => t.name === 'memory_bank_dashboard');
      const entryTypes = (dash?._meta?.['com.google.antigravity/ui']?.entrypoints || []).map((e) => e.type).sort();
      assert.deepEqual(entryTypes, ['aux_pane']);

      // 2. Resource read: ui://memory-bank/app.html returns SEP-1865 MIME
      const resRead = await rpc('resources/read', { uri: 'ui://memory-bank/app.html' });
      const resContent = resRead.result?.contents?.[0];
      assert.equal(resContent?.mimeType, 'text/html;profile=mcp-app');
      assert.ok((resContent?.text || '').length > 50000);

      // 3. Add ticket isolated into TO DO -> Plan -> Unlock -> Kickoff -> Reject re-plan on IN PROGRESS (BUG-115)
      const addRes = await rpc('tools/call', {
        name: 'app_add_ticket_isolated',
        arguments: { repoRoot: mcpRepo, title: 'MCP E2E Smoke Ticket', priority: 'high', type: 'feature' }
      });
      const createdId = addRes.result?.structuredContent?.task?.id;
      assert.ok(createdId && /^FEAT-\d+$/.test(createdId), `Expected FEAT-* id, got ${createdId}`);

      const snapRes = await rpc('tools/call', {
        name: 'app_get_workspace_snapshot',
        arguments: { repoRoot: mcpRepo }
      });
      assert.ok(snapRes.result?.structuredContent?.project, 'Workspace snapshot must include project name');
      assert.ok(snapRes.result?.structuredContent?.tasks?.some((t) => t.id === createdId));

      const planRes = await rpc('tools/call', {
        name: 'app_plan_tickets',
        arguments: { repoRoot: mcpRepo, ids: [createdId], modelId: 'gemini-4-argon-high', effort: 'high' }
      });
      assert.equal(planRes.result?.isError, undefined);
      assert.match(planRes.result?.structuredContent?.prompt || '', new RegExp(`/backlog-plan ${createdId}`));
      let taskState = planRes.result?.structuredContent?.snapshot?.tasks?.find((t) => t.id === createdId);
      assert.equal(taskState?.status, 'ready');
      assert.equal(taskState?.planningLocked, true);

      const unlockRes = await rpc('tools/call', {
        name: 'app_unlock_plan',
        arguments: { repoRoot: mcpRepo, id: createdId }
      });
      assert.equal(unlockRes.result?.structuredContent?.status, 'todo');

      const kickRes = await rpc('tools/call', {
        name: 'app_kickoff_tickets',
        arguments: { repoRoot: mcpRepo, ids: [createdId], modelId: 'gemini-4-neon-medium', effort: 'medium' }
      });
      assert.match(kickRes.result?.structuredContent?.prompt || '', new RegExp(`/backlog-start ${createdId}`));
      taskState = kickRes.result?.structuredContent?.snapshot?.tasks?.find((t) => t.id === createdId);
      assert.equal(taskState?.status, 'in_progress');
      assert.equal(taskState?.liveActivity, 'coding');

      const blockedPlan = await rpc('tools/call', {
        name: 'app_plan_tickets',
        arguments: { repoRoot: mcpRepo, ids: [createdId] }
      });
      assert.equal(blockedPlan.result?.isError, true, 'BUG-115: MCP app_plan_tickets must block IN PROGRESS tickets');
      assert.match(blockedPlan.result?.content?.[0]?.text || '', /back to TO DO/i);

      // 4. Memory Audit + Brick Catalog + Fleet Discovery
      const lintRes = await rpc('tools/call', {
        name: 'app_run_memory_audit',
        arguments: { repoRoot: mcpRepo, action: 'lint' }
      });
      assert.equal(lintRes.result?.structuredContent?.ok, true);

      const brickRes = await rpc('tools/call', {
        name: 'app_brick_manage',
        arguments: { repoRoot: mcpRepo, action: 'list' }
      });
      assert.ok((brickRes.result?.structuredContent?.bricks || []).some((b) => b.name === 'user-profile'));
    } finally {
      if (mcpProc && !mcpProc.killed) {
        try { mcpProc.kill('SIGKILL'); } catch {}
      }
      try { fs.rmSync(fakeHome, { recursive: true, force: true }); } catch {}
      try { fs.rmSync(mcpRepo, { recursive: true, force: true }); } catch {}
    }
  });

  test('3o. FEAT-150: delete ticket from any column across CLI, HTTP Bridge (/api/delete), HTML UI, and MCP App (app_delete_ticket)', async () => {
    const delRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-del-'));
    const delPort = 43990 + Math.floor(Math.random() * 400);
    let bridgeProc = null;
    let mcpProc = null;
    try {
      execFileSync('git', ['init', '-b', 'main'], { cwd: delRepo, stdio: 'ignore' });
      execFileSync(process.execPath, [CLI_PATH, 'init', delRepo, '-y', '--name', 'DeleteTestApp'], {
        cwd: delRepo,
        env: testEnv,
        stdio: 'ignore'
      });

      const backlogPath = path.join(delRepo, 'docs', 'backlog.json');
      const htmlPath = path.join(delRepo, 'docs', 'backlog.html');
      const scriptPath = path.join(delRepo, 'scripts', 'backlog.mjs');
      const seed = {
        project: 'DeleteTestApp',
        activePlanTaskIds: ['FEAT-202', 'FEAT-206'],
        tasks: [
          { id: 'FEAT-201', type: 'feature', title: 'Todo Ticket', status: 'todo', priority: 'medium', branch: 'main' },
          { id: 'FEAT-202', type: 'feature', title: 'Locked Ready Ticket', status: 'ready', liveActivity: 'planning', planningLocked: true, priority: 'high', branch: 'main' },
          { id: 'FEAT-203', type: 'feature', title: 'In Progress Parent', status: 'in_progress', priority: 'high', childTicketIds: ['FEAT-203-ACT-1'], branch: 'main' },
          { id: 'FEAT-203-ACT-1', type: 'feature', title: 'Child of 203', parentId: 'FEAT-203', isActionChild: true, actionIndex: 1, status: 'todo', priority: 'medium', branch: 'main' },
          { id: 'FEAT-204', type: 'feature', title: 'Done Ticket', status: 'done', priority: 'low', branch: 'main' },
          { id: 'FEAT-205', type: 'feature', title: 'Unlink Parent', status: 'todo', priority: 'medium', childTicketIds: ['FEAT-205-ACT-1'], branch: 'main' },
          { id: 'FEAT-205-ACT-1', type: 'feature', title: 'Surviving Child', parentId: 'FEAT-205', isActionChild: true, actionIndex: 1, status: 'todo', priority: 'medium', branch: 'main' },
          { id: 'FEAT-206', type: 'feature', title: 'Bridge Delete Target', status: 'ready', liveActivity: 'planning', planningLocked: true, priority: 'high', branch: 'main' },
          { id: 'FEAT-207', type: 'feature', title: 'MCP Todo Target', status: 'todo', priority: 'low', branch: 'main' },
          { id: 'FEAT-208', type: 'feature', title: 'MCP Done Target', status: 'done', priority: 'low', branch: 'main' }
        ]
      };
      fs.writeFileSync(backlogPath, JSON.stringify(seed, null, 2) + '\n', 'utf8');

      // 1. CLI delete from todo, locked ready, in_progress (cascade child), done, and --no-cascade unlink
      execFileSync(process.execPath, [scriptPath, 'delete', 'FEAT-201', 'FEAT-202', 'FEAT-203', 'FEAT-204'], { cwd: delRepo, env: testEnv });
      execFileSync(process.execPath, [scriptPath, 'delete', 'FEAT-205', '--no-cascade'], { cwd: delRepo, env: testEnv });
      let bj = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
      const idsAfterCli = bj.tasks.map((t) => t.id);
      assert.equal(idsAfterCli.includes('FEAT-201'), false);
      assert.equal(idsAfterCli.includes('FEAT-202'), false);
      assert.equal(idsAfterCli.includes('FEAT-203'), false);
      assert.equal(idsAfterCli.includes('FEAT-203-ACT-1'), false, 'Cascade delete must remove child ticket');
      assert.equal(idsAfterCli.includes('FEAT-204'), false);
      assert.equal(idsAfterCli.includes('FEAT-205'), false);
      const unlinked = bj.tasks.find((t) => t.id === 'FEAT-205-ACT-1');
      assert.ok(unlinked, '--no-cascade must preserve child ticket');
      assert.equal(unlinked.parentId, undefined, '--no-cascade must clear parentId');
      assert.equal((bj.activePlanTaskIds || []).includes('FEAT-202'), false, 'Deleted ticket must be removed from activePlanTaskIds');
      const renderedHtml = fs.readFileSync(htmlPath, 'utf8');
      assert.match(renderedHtml, /openDeleteTicketModal\('FEAT-206', event\)/, 'Locked READY card must expose delete button');
      assert.match(renderedHtml, /id="deleteTicketModal"/, 'HTML board must include Delete Confirmation Modal');

      // 2. HTTP Bridge POST /api/delete (200 on locked READY, 404 on unknown)
      bridgeProc = spawn(process.execPath, [scriptPath, 'serve', '--port', String(delPort)], {
        cwd: delRepo,
        env: { ...testEnv, ANTIGRAVITY_SKIP_PROMPT_DISPATCH: '1' },
        stdio: 'ignore'
      });
      const baseUrl = `http://127.0.0.1:${delPort}`;
      let ok = false;
      for (let i = 0; i < 40; i++) {
        try {
          const r = await fetch(`${baseUrl}/api/health`);
          if (r.ok) { ok = true; break; }
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      assert.equal(ok, true, 'Bridge must start for FEAT-150 test');

      const del206 = await fetch(`${baseUrl}/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoRoot: delRepo, id: 'FEAT-206', cascade: true })
      });
      assert.equal(del206.status, 200);
      const del206Json = await del206.json();
      assert.deepEqual(del206Json.deletedIds, ['FEAT-206']);

      const del404 = await fetch(`${baseUrl}/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoRoot: delRepo, id: 'FEAT-9999' })
      });
      assert.equal(del404.status, 404);

      // 3. MCP App app_delete_ticket over stdio (delete TODO + DONE + reject missing ID)
      const distServer = path.join(REPO_ROOT, 'mcp', 'dist', 'server.mjs');
      mcpProc = spawn(process.execPath, [distServer, `--data-dir=${os.tmpdir()}`], {
        cwd: os.tmpdir(),
        env: { ...testEnv, ANTIGRAVITY_MEMORY_BANK_ROOT: REPO_ROOT },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const pending = new Map();
      let buf = '';
      let nextId = 1;
      mcpProc.stdout.on('data', (chunk) => {
        buf += chunk.toString();
        let nl;
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
        }
      });
      const rpc = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const id = nextId++;
          const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout on ${method}`)); }, 15000);
          pending.set(id, { resolve: (m) => { clearTimeout(timer); resolve(m); } });
          mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
        });
      await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'del-e2e', version: '1.0' } });
      mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

      const mcpDel1 = await rpc('tools/call', { name: 'app_delete_ticket', arguments: { repoRoot: delRepo, id: 'FEAT-207' } });
      assert.equal(mcpDel1.result?.isError, undefined);
      assert.deepEqual(mcpDel1.result?.structuredContent?.deletedIds, ['FEAT-207']);

      const mcpDel2 = await rpc('tools/call', { name: 'app_delete_ticket', arguments: { repoRoot: delRepo, id: 'FEAT-208' } });
      assert.equal(mcpDel2.result?.isError, undefined);
      assert.deepEqual(mcpDel2.result?.structuredContent?.deletedIds, ['FEAT-208']);

      const mcpDelMissing = await rpc('tools/call', { name: 'app_delete_ticket', arguments: { repoRoot: delRepo, id: 'FEAT-4040' } });
      assert.equal(mcpDelMissing.result?.isError, true);
    } finally {
      if (bridgeProc && !bridgeProc.killed) { try { bridgeProc.kill('SIGKILL'); } catch {} }
      if (mcpProc && !mcpProc.killed) { try { mcpProc.kill('SIGKILL'); } catch {} }
      try { fs.rmSync(delRepo, { recursive: true, force: true }); } catch {}
    }
  });

  test('3p. FEAT-151: strict single-branch & single-workspace isolation on main and linked worktrees', async () => {
    const isoMain = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-iso-main-'));
    const isoWt = path.join(os.tmpdir(), `agmb-iso-wt-${Date.now()}`);
    let mcpProc = null;
    try {
      execFileSync('git', ['init', '-b', 'main'], { cwd: isoMain, stdio: 'ignore' });
      execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: isoMain, stdio: 'ignore' });
      execFileSync('git', ['config', 'user.name', 'Test'], { cwd: isoMain, stdio: 'ignore' });
      execFileSync(process.execPath, [CLI_PATH, 'init', isoMain, '-y', '--name', 'IsoApp'], {
        cwd: isoMain,
        env: testEnv,
        stdio: 'ignore'
      });

      const seedTasks = [
        { id: 'FEAT-301', type: 'feature', title: 'Main Branch Ticket', status: 'todo', priority: 'high', branch: 'main' },
        { id: 'FEAT-302', type: 'feature', title: 'Legacy Untagged Ticket', status: 'done', priority: 'low' },
        { id: 'FEAT-303', type: 'feature', title: 'Other Feature Branch Ticket', status: 'todo', priority: 'high', branch: 'feature/isolated' }
      ];
      fs.writeFileSync(path.join(isoMain, 'docs', 'backlog.json'), JSON.stringify({ project: 'IsoApp', tasks: seedTasks }, null, 2) + '\n');
      execFileSync('git', ['add', '-A'], { cwd: isoMain, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', 'init'], { cwd: isoMain, stdio: 'ignore' });
      execFileSync('git', ['worktree', 'add', '-b', 'feature/isolated', isoWt], { cwd: isoMain, stdio: 'ignore' });

      const distServer = path.join(REPO_ROOT, 'mcp', 'dist', 'server.mjs');
      const distHtml = fs.readFileSync(path.join(REPO_ROOT, 'mcp', 'dist', 'app.html'), 'utf8');
      assert.equal(distHtml.includes('toggle-branch-scope'), false, 'MCP UI must not expose toggle-branch-scope');
      assert.equal(distHtml.includes('All Branches'), false, 'MCP UI must not expose All Branches toggle');
      assert.equal(distHtml.includes('workspaceBadge'), true, 'Conversation-bound Side Pane must render read-only workspaceBadge');

      mcpProc = spawn(process.execPath, [distServer, `--data-dir=${os.tmpdir()}`], {
        cwd: os.tmpdir(),
        env: { ...testEnv, ANTIGRAVITY_MEMORY_BANK_ROOT: REPO_ROOT },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const pending = new Map();
      let buf = '';
      let nextId = 1;
      mcpProc.stdout.on('data', (chunk) => {
        buf += chunk.toString();
        let nl;
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
        }
      });
      const rpc = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const id = nextId++;
          const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout on ${method}`)); }, 15000);
          pending.set(id, { resolve: (m) => { clearTimeout(timer); resolve(m); } });
          mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
        });
      await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'iso-e2e', version: '1.0' } });
      mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

      // 1. Main checkout must show ONLY main + legacy untagged tickets, strictly hiding feature/isolated
      const mainSnap = await rpc('tools/call', { name: 'app_get_workspace_snapshot', arguments: { repoRoot: isoMain } });
      const mainIds = (mainSnap.result?.structuredContent?.tasks || []).map((t) => t.id).sort();
      assert.deepEqual(mainIds, ['FEAT-301', 'FEAT-302']);
      assert.equal(mainSnap.result?.structuredContent?.counts?.total, 2);

      // 2. Linked worktree feature/isolated must show ONLY feature/isolated tickets, hiding main & untagged
      const wtSnap = await rpc('tools/call', { name: 'app_get_workspace_snapshot', arguments: { repoRoot: isoWt } });
      const wtIds = (wtSnap.result?.structuredContent?.tasks || []).map((t) => t.id).sort();
      assert.deepEqual(wtIds, ['FEAT-303']);
      assert.equal(wtSnap.result?.structuredContent?.counts?.total, 1);
    } finally {
      if (mcpProc && !mcpProc.killed) { try { mcpProc.kill('SIGKILL'); } catch {} }
      try { execFileSync('git', ['worktree', 'remove', '--force', isoWt], { cwd: isoMain, stdio: 'ignore' }); } catch {}
      try { fs.rmSync(isoWt, { recursive: true, force: true }); } catch {}
      try { fs.rmSync(isoMain, { recursive: true, force: true }); } catch {}
    }
  });

  test('3q. FEAT-152 / BUG-116: MCP workspace resolution prioritizes last_active_workspace & transcript.jsonl mtime over fleet-clobbered backlog.html', async () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'agmb-b116-home-'));
    const repoA = path.join(fakeHome, 'Binaryday');
    const repoB = path.join(fakeHome, 'JBB.PM CV');
    let mcpProc = null;
    try {
      for (const [dir, name] of [[repoA, 'Binaryday'], [repoB, 'JBB.PM CV']]) {
        fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
        fs.mkdirSync(path.join(dir, 'memory-bank'), { recursive: true });
        fs.writeFileSync(path.join(dir, 'docs', 'backlog.json'), JSON.stringify({ project: name, tasks: [{ id: 'FEAT-101', type: 'feature', title: `${name} task`, status: 'todo', priority: 'medium' }] }, null, 2));
      }

      // Simulate brain dirs: repoA has NEWER transcript.jsonl, but repoB has NEWER backlog.html (fleet upgrade clobber!)
      const brainA = path.join(fakeHome, '.gemini', 'antigravity', 'brain', 'conv-a');
      const brainB = path.join(fakeHome, '.gemini', 'antigravity', 'brain', 'conv-b');
      fs.mkdirSync(path.join(brainA, '.system_generated', 'logs'), { recursive: true });
      fs.mkdirSync(path.join(brainB, '.system_generated', 'logs'), { recursive: true });
      const tA = path.join(brainA, '.system_generated', 'logs', 'transcript.jsonl');
      const tB = path.join(brainB, '.system_generated', 'logs', 'transcript.jsonl');
      const hA = path.join(brainA, 'backlog.html');
      const hB = path.join(brainB, 'backlog.html');
      fs.writeFileSync(hA, `<script>const rawData = {"repoRoot":${JSON.stringify(repoA)}};</script>`);
      fs.writeFileSync(hB, `<script>const rawData = {"repoRoot":${JSON.stringify(repoB)}};</script>`);
      fs.writeFileSync(tA, '{"step":1}\n');
      fs.writeFileSync(tB, '{"step":1}\n');
      const now = Date.now() / 1000;
      fs.utimesSync(tA, now, now);            // repoA transcript is NEWEST
      fs.utimesSync(tB, now - 3600, now - 3600); // repoB transcript is 1h OLDER
      fs.utimesSync(hA, now - 600, now - 600);
      fs.utimesSync(hB, now + 10, now + 10);  // repoB backlog.html is NEWEST (fleet upgrade!)

      const dataDir = path.join(fakeHome, '.gemini', 'antigravity', 'plugin_data', 'memory-bank');
      fs.mkdirSync(dataDir, { recursive: true });

      const distServer = path.join(REPO_ROOT, 'mcp', 'dist', 'server.mjs');
      mcpProc = spawn(process.execPath, [distServer, `--data-dir=${dataDir}`], {
        cwd: os.tmpdir(),
        env: { ...testEnv, HOME: fakeHome, ANTIGRAVITY_MEMORY_BANK_ROOT: REPO_ROOT },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const pending = new Map();
      let buf = '';
      let nextId = 1;
      mcpProc.stdout.on('data', (chunk) => {
        buf += chunk.toString();
        let nl;
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
        }
      });
      const rpc = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const id = nextId++;
          const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout on ${method}`)); }, 15000);
          pending.set(id, { resolve: (m) => { clearTimeout(timer); resolve(m); } });
          mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
        });
      await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'b116-e2e', version: '1.0' } });
      mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

      // 1. Without --repo-root, MUST pick repoA (newest transcript.jsonl) NOT repoB (newest backlog.html)
      const snap1 = await rpc('tools/call', { name: 'app_get_workspace_snapshot', arguments: {} });
      assert.equal(snap1.result?.structuredContent?.project, 'Binaryday', 'Must pick newest transcript.jsonl (Binaryday), not fleet-clobbered backlog.html (JBB.PM CV)');
      assert.equal(snap1.result?.structuredContent?.boundByHost, false);
      mcpProc.kill('SIGKILL');
      mcpProc = null;

      // 2. Per-workspace pinned mode (--repo-root=repoA) MUST ALWAYS lock to repoA (boundByHost: true, aux_pane only)
      mcpProc = spawn(process.execPath, [distServer, `--repo-root=${repoA}`], {
        cwd: os.tmpdir(),
        env: { ...testEnv, HOME: fakeHome, ANTIGRAVITY_MEMORY_BANK_ROOT: REPO_ROOT },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      pending.clear();
      buf = '';
      mcpProc.stdout.on('data', (chunk) => {
        buf += chunk.toString();
        let nl;
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.id && pending.has(msg.id)) {
            const { resolve } = pending.get(msg.id);
            pending.delete(msg.id);
            resolve(msg);
          }
        }
      });
      await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'b116-ws', version: '1.0' } });
      mcpProc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
      const wsList = await rpc('tools/list');
      const wsDash = (wsList.result?.tools || []).find((t) => t.name === 'memory_bank_dashboard');
      assert.deepEqual((wsDash?._meta?.['com.google.antigravity/ui']?.entrypoints || []).map((e) => e.type), ['aux_pane']);
      const wsSnap = await rpc('tools/call', { name: 'app_get_workspace_snapshot', arguments: {} });
      assert.equal(wsSnap.result?.structuredContent?.project, 'Binaryday');
      assert.equal(wsSnap.result?.structuredContent?.boundByHost, true);
    } finally {
      if (mcpProc && !mcpProc.killed) { try { mcpProc.kill('SIGKILL'); } catch {} }
      try { fs.rmSync(fakeHome, { recursive: true, force: true }); } catch {}
    }
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
