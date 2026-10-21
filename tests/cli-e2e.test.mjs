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

    // Verify AGENTS.md includes Strict End-to-End Verification Before Closure
    const agentsMd = fs.readFileSync(path.join(tmpRepo, 'AGENTS.md'), 'utf8');
    assert.match(agentsMd, /Strict End-to-End Verification Before Closure/);

    // Verify skills & lifecycle hooks installed
    assert.equal(fs.existsSync(path.join(tmpRepo, '.agents', 'hooks.json')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, '.agents', 'skills', 'start', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, '.agents', 'skills', 'update-memory', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(tmpRepo, '.agents', 'skills', 'backlog-start', 'SKILL.md')), true);

    // Verify backlog adapted from docs/BACKLOG.md and Review pane HTML rendered into hermetic brain dir
    const backlogData = JSON.parse(fs.readFileSync(path.join(tmpRepo, 'docs', 'backlog.json'), 'utf8'));
    assert.ok(backlogData.tasks.some((t) => t.id === 'FEAT-201'), 'Expected FEAT-201 to be adapted into docs/backlog.json');
    assert.equal(fs.existsSync(path.join(tmpRepo, 'docs', 'backlog.html')), true);
    assert.equal(fs.existsSync(path.join(mockBrainDir, 'backlog.html')), true);
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
