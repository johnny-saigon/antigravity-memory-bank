#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Project Initializer, Exporter & Deinstaller CLI
 * Manages the full lifecycle of the Three-Tier Memory Bank on the fly:
 * - init: Bootstraps the Memory Bank with smart auto-detection
 * - export: Creates consolidated markdown and tarball context exports
 * - uninstall: Safely exports context and cleanly uninstalls all memory files
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { execSync } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import { scrapeHistoricalContext } from '../lib/context-scraper.mjs';
import { adaptExistingBacklog } from '../lib/backlog-adapter.mjs';
import { syncCustomizationsToMemoryBank } from '../lib/customizations-scraper.mjs';
import { runMandatoryIngestionChecklist } from '../lib/ingestion-checklist.mjs';
import { organizeRepositoryStructure } from '../lib/repo-organizer.mjs';
import {
  printBrickList,
  installOrUpgradeBrick,
  runBrickDoctor,
} from '../lib/brick-engine.mjs';
import { synthesizeLivingDocs, validateLivingDocsHierarchy } from '../lib/docs-synthesizer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

// Prevent npm's _npx directory from caching stale git tarballs across future npx invocations
if (pkgRoot.includes('_npx')) {
  process.on('exit', () => {
    try {
      fsSync.rmSync(pkgRoot, { recursive: true, force: true });
    } catch {}
  });
}

function parseCliArgs(argv) {
  const options = {
    command: 'init',
    brickAction: null,
    brickName: null,
    withSchema: false,
    targetDir: null,
    asPlugin: false,
    yes: false,
    commit: false,
    force: false,
    dryRun: false,
    noOrganize: false,
    noExport: false,
    exportDir: null,
    name: null,
    tagline: null,
    desc: null,
    platforms: null,
    frontend: null,
    backend: null,
    db: null,
    port: null,
    health: null,
  };

  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === 'brick' || a === 'bricks') {
      options.command = 'brick';
      const sub = args[i + 1];
      if (sub && ['list', 'install', 'upgrade', 'update', 'doctor'].includes(sub)) {
        options.brickAction = sub === 'update' ? 'upgrade' : sub;
        i++;
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith('-')) {
          options.brickName = nextArg;
          i++;
        }
      } else {
        options.brickAction = 'list';
      }
    } else if (a === '--with-schema') {
      options.withSchema = true;
    } else if (a === 'init' || a === 'install' || a === 'install-plugin') {
      options.command = 'init';
      if (a === 'install-plugin') options.asPlugin = true;
    } else if (a === 'export' || a === 'backup') {
      options.command = 'export';
    } else if (a === 'uninstall' || a === 'remove' || a === 'deinstall') {
      options.command = 'uninstall';
    } else if (a === 'upgrade' || a === 'update') {
      options.command = 'upgrade';
    } else if (a === 'organize' || a === 'reorganize' || a === 'organise') {
      options.command = 'organize';
    } else if (a === 'docs:sync' || a === 'docs' || a === 'harvest') {
      options.command = 'docs:sync';
    } else if (a === 'sync') {
      options.command = 'sync';
    } else if (a === '--dry-run') {
      options.dryRun = true;
    } else if (a === '--no-organize') {
      options.noOrganize = true;
    } else if ((a === '--dir' || a === '-d') && args[i + 1]) {
      options.targetDir = path.resolve(args[++i]);
    } else if (a === '--quiet' || a === '-q') {
      options.quiet = true;
    } else if (a === '--as-plugin') {
      options.asPlugin = true;
    } else if (a === '-y' || a === '--yes' || a === '--non-interactive') {
      options.yes = true;
    } else if (a === '--commit') {
      options.commit = true;
    } else if (a === '--force') {
      options.force = true;
    } else if (a === '--no-export') {
      options.noExport = true;
    } else if (a === '--export-dir' && args[i + 1]) {
      options.exportDir = path.resolve(args[++i]);
    } else if (a === '--name' && args[i + 1]) {
      options.name = args[++i];
    } else if (a === '--tagline' && args[i + 1]) {
      options.tagline = args[++i];
    } else if (a === '--desc' && args[i + 1]) {
      options.desc = args[++i];
    } else if (a === '--platforms' && args[i + 1]) {
      options.platforms = args[++i];
    } else if (a === '--frontend' && args[i + 1]) {
      options.frontend = args[++i];
    } else if (a === '--backend' && args[i + 1]) {
      options.backend = args[++i];
    } else if (a === '--db' && args[i + 1]) {
      options.db = args[++i];
    } else if (a === '--port' && args[i + 1]) {
      options.port = args[++i];
    } else if (a === '--health' && args[i + 1]) {
      options.health = args[++i];
    } else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else if (!a.startsWith('-') && !options.targetDir) {
      options.targetDir = path.resolve(a);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
🧠 Antigravity Memory Bank CLI

Commands:
  init [options]         Bootstrap Memory Bank & organize AI-native repo layout on the fly (default)
  organize [options]     Coherently organize repository root, docs/, .gitignore, and AI-native structure
  sync [options]         Incrementally sync git history and accomplishments into context
  upgrade [options]      Upgrade Memory Bank to v1.5 (3-artifact planning mode, root organizer, zero-token backlog)
  export [options]       Export project memory & context to markdown and archive
  uninstall [options]    Cleanly uninstall Memory Bank (automatically exports context first)

Options:
  -y, --yes, --non-interactive  Run without interactive prompts (headless mode)
  --commit                      Automatically git add and commit changes
  --dry-run                     Preview repository reorganization without writing changes
  --no-organize                 Skip root documentation & directory reorganization during init/upgrade
  --as-plugin                   Target .agents/plugins/memory-bank/ instead of root
  --export-dir <path>           Custom export/backup directory (default: ./memory-backups)
  --no-export                   Skip context export during deinstallation
  --force                       Overwrite existing memory files on init
  --name <project-name>         Override project name
  --tagline <tagline>           Override tagline
  --desc <description>          Override description
  --platforms <platforms>       Override platforms (e.g. "Web, iOS, Backend")
  --frontend <tech>             Override frontend tech (e.g. "Next.js / React")
  --backend <tech>              Override backend tech (e.g. "Fastify / Node.js")
  --db <tech>                   Override database tech (e.g. "PostgreSQL 16")
  --port <port>                 Override allocated internal port
  --health <url>                Override health check probe URL
  -h, --help                    Show this help message
`);
}

async function detectProjectContext(targetDir) {
  const detected = {
    name: path.basename(targetDir),
    tagline: 'High-performance application',
    description: 'Built with Antigravity agentic pair programming',
    platforms: 'Web, API',
    frontend: 'React / Next.js',
    backend: 'Node.js',
    db: 'PostgreSQL 16',
    port: '3000',
    health: 'http://localhost:3000/health',
    hasGit: false,
    hasPackageJson: false,
    memoryBankExists: false,
    agentsMdExists: false,
    isSelfRepo: path.resolve(targetDir) === path.resolve(pkgRoot),
  };

  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkgRaw = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgRaw);
    detected.hasPackageJson = true;
    if (pkg.name) detected.name = pkg.name;
    if (pkg.description) detected.description = pkg.description;

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    if (allDeps['next']) detected.frontend = 'Next.js (React)';
    else if (allDeps['expo'] || allDeps['react-native']) detected.frontend = 'Expo & React Native';
    else if (allDeps['vue']) detected.frontend = 'Vue.js';
    else if (allDeps['svelte'] || allDeps['@sveltejs/kit']) detected.frontend = 'SvelteKit';
    else if (allDeps['react']) detected.frontend = 'React (Vite)';

    if (allDeps['fastify']) detected.backend = 'Fastify (Node.js)';
    else if (allDeps['express']) detected.backend = 'Express (Node.js)';
    else if (allDeps['@nestjs/core']) detected.backend = 'NestJS';
    else if (allDeps['koa']) detected.backend = 'Koa (Node.js)';
    else if (allDeps['hono']) detected.backend = 'Hono';

    if (allDeps['@prisma/client'] || allDeps['prisma']) detected.db = 'PostgreSQL (Prisma ORM)';
    else if (allDeps['drizzle-orm']) detected.db = 'PostgreSQL (Drizzle ORM)';
    else if (allDeps['pg']) detected.db = 'PostgreSQL 16';
    else if (allDeps['mongoose'] || allDeps['mongodb']) detected.db = 'MongoDB';
    else if (allDeps['mysql2']) detected.db = 'MySQL 8';
    else if (allDeps['better-sqlite3'] || allDeps['sqlite3']) detected.db = 'SQLite';

    if (allDeps['react-native'] || allDeps['expo']) {
      detected.platforms = 'Native iOS, Android & Web';
    } else if (allDeps['next'] || allDeps['react']) {
      detected.platforms = 'Responsive Web & REST API';
    }
  } catch {}

  const gitConfigPath = path.join(targetDir, '.git', 'config');
  try {
    const gitConf = await fs.readFile(gitConfigPath, 'utf8');
    detected.hasGit = true;
    const remoteMatch = gitConf.match(/url\s*=\s*.*github\.com[:/]([^/\s]+)\/([^/\s\.]+)(?:\.git)?/i);
    if (remoteMatch && !detected.hasPackageJson) {
      detected.name = remoteMatch[2];
    }
  } catch {}

  try {
    const mbStat = await fs.stat(path.join(targetDir, 'memory-bank'));
    if (mbStat.isDirectory()) detected.memoryBankExists = true;
  } catch {}

  try {
    const agentsStat = await fs.stat(path.join(targetDir, 'AGENTS.md'));
    if (agentsStat.isFile()) detected.agentsMdExists = true;
  } catch {}

  if (!detected.isSelfRepo && detected.name === 'antigravity-memory-bank') {
    try {
      const tplStat = await fs.stat(path.join(targetDir, 'templates', 'AGENTS.md.tpl'));
      if (tplStat.isFile()) detected.isSelfRepo = true;
    } catch {}
  }

  for (const envFile of ['.env', '.env.local', '.env.example']) {
    try {
      const envContent = await fs.readFile(path.join(targetDir, envFile), 'utf8');
      const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
      if (portMatch) {
        detected.port = portMatch[1];
        detected.health = `http://localhost:${detected.port}/health`;
        break;
      }
    } catch {}
  }

  return detected;
}

/**
 * Exports all active memory documents into:
 * 1. A human-readable consolidated markdown snapshot
 * 2. A compressed tar.gz archive of all raw files
 */
async function exportMemory(targetDir, exportDir) {
  const finalExportDir = exportDir || path.join(targetDir, 'memory-backups');
  await fs.mkdir(finalExportDir, { recursive: true });

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  console.log(`\n📦 Exporting Antigravity Memory Bank context...`);

  const memoryFiles = [];
  const candidatePaths = [
    'AGENTS.md',
    '.agents/hooks.json',
    '.agents/rules/infra.md',
    '.agents/rules/negative-constraints.md',
    '.agents/rules/brick-governance.md',
    '.agents/rules/docs-living-specs.md',
    '.agents/skills/start/SKILL.md',
    '.agents/skills/update-memory/SKILL.md',
    '.agents/skills/backlog-start/SKILL.md',
    '.agents/plugins/memory-bank/plugin.json',
    '.agents/plugins/memory-bank/rules/AGENTS.md',
    '.agents/plugins/memory-bank/skills/start/SKILL.md',
    '.agents/plugins/memory-bank/skills/update-memory/SKILL.md',
    '.agents/plugins/memory-bank/skills/backlog-start/SKILL.md',
    'scripts/backlog.mjs',
    'scripts/sync-living-docs.mjs',
    'docs/INDEX.md',
    'docs/backlog.json',
    'docs/BACKLOG_GUIDE.md',
    'docs/PLANNING_GUIDE.md',
    'docs/BRICK_ARCHITECTURE_GUIDE.md',
  ];

  for (const rel of candidatePaths) {
    try {
      const full = path.join(targetDir, rel);
      const stat = await fs.stat(full);
      if (stat.isFile()) memoryFiles.push(rel);
    } catch {}
  }

  // Scan memory-bank/ directory
  const mbDir = path.join(targetDir, 'memory-bank');
  try {
    const entries = await fs.readdir(mbDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.md')) {
        memoryFiles.push(path.join('memory-bank', e.name));
      }
    }
  } catch {}

  if (memoryFiles.length === 0) {
    console.log('ℹ️ No active memory bank files found to export.');
    return null;
  }

  // 1. Build Consolidated Markdown
  let consolidatedMd = `# Antigravity Memory Bank — Project Context Export\n\n`;
  consolidatedMd += `- **Export Date**: ${now.toISOString()}\n`;
  consolidatedMd += `- **Project Directory**: \`${targetDir}\`\n`;
  consolidatedMd += `- **Exported Files**: ${memoryFiles.length} documents\n\n`;
  consolidatedMd += `## Table of Contents\n`;
  for (const rel of memoryFiles) {
    consolidatedMd += `- [${rel}](#${rel.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`;
  }
  consolidatedMd += `\n---\n\n`;

  for (const rel of memoryFiles) {
    const full = path.join(targetDir, rel);
    const content = await fs.readFile(full, 'utf8');
    consolidatedMd += `## \`${rel}\`\n\n\`\`\`markdown\n${content.trim()}\n\`\`\`\n\n---\n\n`;
  }

  const exportMdFile = path.join(finalExportDir, `memory-bank-export-${timestamp}.md`);
  await fs.writeFile(exportMdFile, consolidatedMd, 'utf8');
  console.log(`  ✓ Consolidated Markdown: ${exportMdFile}`);

  // 2. Build Compressed Archive (tar.gz)
  const tarArchiveFile = path.join(finalExportDir, `memory-bank-backup-${timestamp}.tar.gz`);
  try {
    const existingItems = [];
    if (await fileOrDirExists(path.join(targetDir, 'memory-bank'))) existingItems.push('memory-bank');
    if (await fileOrDirExists(path.join(targetDir, 'AGENTS.md'))) existingItems.push('AGENTS.md');
    if (await fileOrDirExists(path.join(targetDir, '.agents'))) existingItems.push('.agents');

    if (existingItems.length > 0) {
      execSync(`tar -czf "${tarArchiveFile}" ${existingItems.map((i) => `"${i}"`).join(' ')}`, {
        cwd: targetDir,
        stdio: 'pipe',
      });
      console.log(`  ✓ Raw Backup Archive:    ${tarArchiveFile}`);
    }
  } catch (err) {
    console.warn(`⚠️ Archive warning (tar failed): ${err.message}`);
  }

  return { exportMdFile, tarArchiveFile, count: memoryFiles.length };
}

async function fileOrDirExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cleanly uninstalls all Memory Bank artifacts with prior context preservation.
 */
async function uninstallMemory(targetDir, opts, detected) {
  console.log('\n🧹 Antigravity Memory Bank — Deinstallation Workflow');

  const isHeadless = opts.yes || !input.isTTY;

  if (!isHeadless) {
    const rl = readline.createInterface({ input, output });
    try {
      console.log(`\n⚠️  WARNING: You are about to cleanly remove the Antigravity Memory Bank from:\n   ${targetDir}\n`);
      const ans = (await rl.question('Proceed with clean deinstallation? (y/N): ')).trim().toLowerCase();
      if (ans !== 'y' && ans !== 'yes') {
        console.log('Deinstallation aborted by user.');
        process.exit(0);
      }
    } finally {
      rl.close();
    }
  }

  // 1. Export context before deinstallation
  if (!opts.noExport) {
    const exportResult = await exportMemory(targetDir, opts.exportDir);
    if (exportResult) {
      console.log(`\n🛡️  Context successfully archived prior to removal (${exportResult.count} files preserved).`);
    }
  } else {
    console.log('↷ Skipping context export (--no-export specified).');
  }

  console.log('\n🗑️  Removing Memory Bank files and skills...');

  // 2. Remove memory-bank directory
  const mbDir = path.join(targetDir, 'memory-bank');
  try {
    await fs.rm(mbDir, { recursive: true, force: true });
    console.log('  ✓ Removed memory-bank/');
  } catch {}

  // 3. Remove skills: start, update-memory, backlog-start, backlog-plan, context, clear, effort, credits, and usage
  const skillsToRemove = ['start', 'update-memory', 'backlog-start', 'backlog-plan', 'context', 'clear', 'effort', 'credits', 'usage'];
  for (const s of skillsToRemove) {
    try {
      await fs.rm(path.join(targetDir, '.agents/skills', s), { recursive: true, force: true });
      console.log(`  ✓ Removed .agents/skills/${s}/`);
    } catch {}
  }

  // Clean empty .agents/skills
  try {
    const remainingSkills = await fs.readdir(path.join(targetDir, '.agents/skills'));
    if (remainingSkills.length === 0) {
      await fs.rm(path.join(targetDir, '.agents/skills'), { recursive: true, force: true });
    }
  } catch {}

  // 4. Remove rules: infra.md, negative-constraints.md, brick-governance.md, docs-living-specs.md, and progressive-disclosure memory-*.md rules
  for (const r of [
    'infra.md',
    'negative-constraints.md',
    'brick-governance.md',
    'docs-living-specs.md',
    'memory-architecture.md',
    'memory-integrations.md',
    'memory-sprint-context.md',
    'memory-context.md',
    'memory-context-2.md',
    'memory-context-3.md'
  ]) {
    try {
      await fs.rm(path.join(targetDir, '.agents/rules', r), { force: true });
      console.log(`  ✓ Removed .agents/rules/${r}`);
    } catch {}
  }

  // Clean empty .agents/rules
  try {
    const remainingRules = await fs.readdir(path.join(targetDir, '.agents/rules'));
    if (remainingRules.length === 0) {
      await fs.rm(path.join(targetDir, '.agents/rules'), { recursive: true, force: true });
    }
  } catch {}

  // 4b. Remove antigravity-memory-bank entry from .agents/hooks.json
  const wsHooksPath = path.join(targetDir, '.agents/hooks.json');
  try {
    const hooksRaw = JSON.parse(await fs.readFile(wsHooksPath, 'utf8'));
    if (hooksRaw['antigravity-memory-bank']) {
      delete hooksRaw['antigravity-memory-bank'];
      if (Object.keys(hooksRaw).length === 0) {
        await fs.rm(wsHooksPath, { force: true });
        console.log('  ✓ Removed .agents/hooks.json');
      } else {
        await fs.writeFile(wsHooksPath, JSON.stringify(hooksRaw, null, 2) + '\n', 'utf8');
        console.log('  ✓ Removed antigravity-memory-bank hook from .agents/hooks.json');
      }
    }
  } catch {}

  // Clean empty .agents
  try {
    const remainingAgents = await fs.readdir(path.join(targetDir, '.agents'));
    if (remainingAgents.length === 0) {
      await fs.rm(path.join(targetDir, '.agents'), { recursive: true, force: true });
    }
  } catch {}

  // 5. Remove plugin directory if installed as plugin
  try {
    await fs.rm(path.join(targetDir, '.agents/plugins/memory-bank'), { recursive: true, force: true });
    console.log('  ✓ Removed .agents/plugins/memory-bank/');
  } catch {}

  // 6. Remove scripts/lint-memory.mjs and scripts/sync-memory-context.mjs
  if (detected.isSelfRepo) {
    console.log('  ↷ Preserved upstream source scripts in scripts/ (self-repository guard)');
  } else {
    try {
      await fs.rm(path.join(targetDir, 'scripts/lint-memory.mjs'), { force: true });
      await fs.rm(path.join(targetDir, 'scripts/sync-memory-context.mjs'), { force: true });
      await fs.rm(path.join(targetDir, 'scripts/sync-living-docs.mjs'), { force: true });
      console.log('  ✓ Removed scripts/lint-memory.mjs, scripts/sync-memory-context.mjs, and scripts/sync-living-docs.mjs');
      const remainingScripts = await fs.readdir(path.join(targetDir, 'scripts'));
      if (remainingScripts.length === 0) {
        await fs.rm(path.join(targetDir, 'scripts'), { recursive: true, force: true });
      }
    } catch {}
  }

  // 7. Clean package.json scripts
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    if (pkg.scripts) {
      const keys = detected.isSelfRepo
        ? ['memory:sync', 'memory:organize', 'memory:upgrade', 'memory:export', 'memory:uninstall']
        : ['lint:memory', 'memory:sync', 'memory:organize', 'memory:upgrade', 'memory:export', 'memory:uninstall'];
      let cleaned = false;
      for (const k of keys) {
        if (pkg.scripts[k]) {
          delete pkg.scripts[k];
          cleaned = true;
        }
      }
      if (cleaned) {
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log('  ✓ Cleaned memory scripts from package.json');
      }
    }
  } catch {}

  // 7b. Remove git hook if ours
  const postCommitHookPath = path.join(targetDir, '.git/hooks/post-commit');
  try {
    const hookContent = await fs.readFile(postCommitHookPath, 'utf8');
    if (hookContent.includes('sync-memory-context.mjs')) {
      await fs.rm(postCommitHookPath, { force: true });
      console.log('  ✓ Removed .git/hooks/post-commit');
    }
  } catch {}

  // 7c. Remove CI workflow if ours
  const ciWorkflowPath = path.join(targetDir, '.github/workflows/memory-bank-sync.yml');
  try {
    await fs.rm(ciWorkflowPath, { force: true });
    console.log('  ✓ Removed .github/workflows/memory-bank-sync.yml');
  } catch {}

  // 8. Handle AGENTS.md
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  try {
    const agentsContent = await fs.readFile(agentsPath, 'utf8');
    const isPureMemoryDirectives = agentsContent.includes('Three-Tier Memory Hierarchy') && 
      (agentsContent.includes('Antigravity Agent Directives') || agentsContent.includes('Operational Mandates')) &&
      !agentsContent.includes('### PROJECT_CUSTOM_DIRECTIVES');

    if (isPureMemoryDirectives) {
      await fs.rm(agentsPath, { force: true });
      console.log('  ✓ Removed AGENTS.md (no custom directives detected)');
    } else {
      console.log('  ↷ Preserved custom directives in AGENTS.md');
    }
  } catch {}

  // 9. Git commit if requested
  if (opts.commit && detected.hasGit) {
    console.log('\n🔧 Committing deinstallation to Git...');
    try {
      execSync('git add -A', { cwd: targetDir, stdio: 'pipe' });
      execSync('git commit -m "chore(memory): cleanly deinstall Antigravity Memory Bank (context archived)"', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      console.log('  ✓ Deinstallation committed to Git.');
    } catch {
      console.log('  ℹ️ Working tree clean or changes already committed.');
    }
  }

  console.log('\n✅ Antigravity Memory Bank has been cleanly deinstalled.');
  if (!opts.noExport) {
    console.log(`📦 Your context remains safely preserved in: ${opts.exportDir || path.join(targetDir, 'memory-backups')}\n`);
  }
}

/**
 * Incrementally syncs git commits and feats into memory-bank
 */
async function syncMemory(targetDir, opts) {
  const syncScript = path.join(targetDir, 'scripts/sync-memory-context.mjs');
  try {
    await fs.access(syncScript);
  } catch {
    console.error('❌ scripts/sync-memory-context.mjs not found. Run `npx antigravity-memory-bank upgrade` to install it.');
    process.exit(1);
  }
  const cmd = `node scripts/sync-memory-context.mjs${opts.commit ? ' --commit' : ''}${opts.quiet ? ' --quiet' : ''}`;
  try {
    execSync(cmd, { cwd: targetDir, stdio: opts.quiet ? 'ignore' : 'inherit' });
  } catch (err) {
    console.error('⚠️ Sync failed:', err.message);
    process.exit(1);
  }
}

/**
 * Installs incremental synchronizer, automated git hooks, and package scripts
 */
async function installSyncAndHooks(targetDir, detected) {
  // 1. Install scripts/sync-memory-context.mjs
  const syncSrc = path.join(pkgRoot, 'scripts/sync-memory-context.mjs');
  const syncDest = path.join(targetDir, 'scripts/sync-memory-context.mjs');
  if (path.resolve(syncSrc) !== path.resolve(syncDest) && !detected.isSelfRepo) {
    await fs.mkdir(path.dirname(syncDest), { recursive: true });
    await fs.copyFile(syncSrc, syncDest);
    await fs.chmod(syncDest, 0o755);
    console.log('  ✓ Installed scripts/sync-memory-context.mjs (incremental auto-synchronizer)');
  } else {
    console.log('  ↷ Preserved upstream scripts/sync-memory-context.mjs (self-repository guard)');
  }

  // 2. Install Git post-commit hook if .git/hooks exists
  const gitHooksDir = path.join(targetDir, '.git/hooks');
  try {
    await fs.access(gitHooksDir);
    const postCommitHookPath = path.join(gitHooksDir, 'post-commit');
    const hookTemplate = path.join(pkgRoot, 'templates/git/hooks/post-commit.tpl');
    const hookContent = await fs.readFile(hookTemplate, 'utf8');

    let shouldWriteHook = true;
    try {
      const existing = await fs.readFile(postCommitHookPath, 'utf8');
      if (existing.includes('sync-memory-context.mjs')) {
        shouldWriteHook = false;
        console.log('  ↷ Existing .git/hooks/post-commit already configured for memory sync');
      } else {
        await fs.appendFile(postCommitHookPath, `\n\n${hookContent}`, 'utf8');
        await fs.chmod(postCommitHookPath, 0o755);
        console.log('  ✓ Appended memory sync hook to existing .git/hooks/post-commit');
        shouldWriteHook = false;
      }
    } catch {}

    if (shouldWriteHook) {
      await fs.writeFile(postCommitHookPath, hookContent, 'utf8');
      await fs.chmod(postCommitHookPath, 0o755);
      console.log('  ✓ Configured automated .git/hooks/post-commit hook (auto-syncs on every commit)');
    }
  } catch {}

  // 3. Install scripts/backlog.mjs
  const backlogSrc = path.join(pkgRoot, 'templates/scripts/backlog.mjs');
  const backlogDest = path.join(targetDir, 'scripts/backlog.mjs');
  if (path.resolve(backlogSrc) !== path.resolve(backlogDest) && !detected.isSelfRepo) {
    await fs.mkdir(path.dirname(backlogDest), { recursive: true });
    await fs.copyFile(backlogSrc, backlogDest);
    await fs.chmod(backlogDest, 0o755);
    console.log('  ✓ Installed scripts/backlog.mjs (zero-token local backlog engine)');
  } else {
    console.log('  ↷ Preserved upstream scripts/backlog.mjs (self-repository guard)');
  }

  // 4. Install docs/BACKLOG_GUIDE.md, docs/PLANNING_GUIDE.md, docs/BRICK_ARCHITECTURE_GUIDE.md, and .agents/rules/brick-governance.md
  const guideSrc = path.join(pkgRoot, 'templates/docs/BACKLOG_GUIDE.md');
  const guideDest = path.join(targetDir, 'docs/BACKLOG_GUIDE.md');
  await fs.mkdir(path.dirname(guideDest), { recursive: true });
  await fs.copyFile(guideSrc, guideDest);
  console.log('  ✓ Installed docs/BACKLOG_GUIDE.md (decoupled backlog guide)');

  const planGuideSrc = path.join(pkgRoot, 'templates/docs/PLANNING_GUIDE.md');
  const planGuideDest = path.join(targetDir, 'docs/PLANNING_GUIDE.md');
  await fs.copyFile(planGuideSrc, planGuideDest);
  console.log('  ✓ Installed docs/PLANNING_GUIDE.md (3-artifact planning mode guide)');

  const brickGuideSrc = path.join(pkgRoot, 'templates/docs/BRICK_ARCHITECTURE_GUIDE.md');
  const brickGuideDest = path.join(targetDir, 'docs/BRICK_ARCHITECTURE_GUIDE.md');
  await fs.copyFile(brickGuideSrc, brickGuideDest);
  console.log('  ✓ Installed docs/BRICK_ARCHITECTURE_GUIDE.md (3-tier pluggable UX/UI & brick architecture guide)');

  const brickGovSrc = path.join(pkgRoot, 'templates/rules/brick-governance.md.tpl');
  const brickGovDest = path.join(targetDir, '.agents/rules/brick-governance.md');
  await fs.mkdir(path.dirname(brickGovDest), { recursive: true });
  await fs.copyFile(brickGovSrc, brickGovDest);
  console.log('  ✓ Installed .agents/rules/brick-governance.md (3-tier pluggable UX/UI & brick governance rule)');

  const docsRuleSrc = path.join(pkgRoot, 'templates/rules/docs-living-specs.md.tpl');
  const docsRuleDest = path.join(targetDir, '.agents/rules/docs-living-specs.md');
  await fs.copyFile(docsRuleSrc, docsRuleDest);
  console.log('  ✓ Installed .agents/rules/docs-living-specs.md (canonical living docs progressive disclosure rule)');

  const livingDocsScriptSrc = path.join(pkgRoot, 'templates/scripts/sync-living-docs.mjs');
  const livingDocsScriptDest = path.join(targetDir, 'scripts/sync-living-docs.mjs');
  if (path.resolve(livingDocsScriptSrc) !== path.resolve(livingDocsScriptDest) && !detected.isSelfRepo) {
    await fs.mkdir(path.dirname(livingDocsScriptDest), { recursive: true });
    await fs.copyFile(livingDocsScriptSrc, livingDocsScriptDest);
    await fs.chmod(livingDocsScriptDest, 0o755);
    console.log('  ✓ Installed scripts/sync-living-docs.mjs (canonical living docs synthesizer)');
  } else {
    console.log('  ↷ Preserved upstream scripts/sync-living-docs.mjs (self-repository guard)');
  }

  // 5. Install docs/backlog.json if not present
  const backlogJsonDest = path.join(targetDir, 'docs/backlog.json');
  try {
    await fs.access(backlogJsonDest);
    console.log('  ↷ Preserved existing docs/backlog.json');
  } catch {
    const backlogTpl = path.join(pkgRoot, 'templates/docs/backlog.json.tpl');
    let tplContent = await fs.readFile(backlogTpl, 'utf8');
    tplContent = tplContent
      .replaceAll('{{PROJECT_NAME}}', detected.name || 'project')
      .replaceAll('{{CURRENT_TIMESTAMP}}', new Date().toISOString());
    await fs.writeFile(backlogJsonDest, tplContent, 'utf8');
    console.log('  ✓ Created docs/backlog.json (local task store)');
  }

  // 6. Install .agents/skills/ (and global ~/.gemini/config/skills/ if present) for backlog & credit/context controls
  const allManagedSkills = ['start', 'backlog-start', 'backlog-plan', 'context', 'clear', 'effort', 'credits', 'usage'];
  const globalSkillsRoot = path.join(process.env.HOME || process.env.USERPROFILE || '', '.gemini', 'config', 'skills');
  const hasGlobalConfig = fsSync.existsSync(path.join(process.env.HOME || process.env.USERPROFILE || '', '.gemini', 'config'));
  for (const skName of allManagedSkills) {
    const skSrc = path.join(pkgRoot, 'skills', skName, 'SKILL.md');
    const skDest = path.join(targetDir, '.agents/skills', skName, 'SKILL.md');
    await fs.mkdir(path.dirname(skDest), { recursive: true });
    await fs.copyFile(skSrc, skDest);
    if (hasGlobalConfig) {
      try {
        const globalDest = path.join(globalSkillsRoot, skName, 'SKILL.md');
        await fs.mkdir(path.dirname(globalDest), { recursive: true });
        await fs.copyFile(skSrc, globalDest);
      } catch {}
    }
    console.log(`  ✓ Installed skill: ${skName} (/${skName})`);
  }

  // 7. Update package.json scripts with lint, sync, upgrade, export, uninstall, and backlog commands
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    pkg.scripts = pkg.scripts || {};
    let pkgUpdated = false;

    if (!pkg.scripts['lint:memory']) {
      pkg.scripts['lint:memory'] = 'node scripts/lint-memory.mjs';
      pkgUpdated = true;
      console.log('  ✓ Added "lint:memory" script to package.json');
    }
    if (!pkg.scripts['memory:sync']) {
      pkg.scripts['memory:sync'] = 'node scripts/sync-memory-context.mjs';
      pkgUpdated = true;
      console.log('  ✓ Added "memory:sync" script to package.json');
    }
    const creditScripts = {
      'memory:context': 'node scripts/lint-memory.mjs --context',
      'memory:credits': 'node scripts/lint-memory.mjs --credits',
      'memory:usage': 'node scripts/lint-memory.mjs --usage',
      'memory:effort': 'node scripts/lint-memory.mjs --effort',
      'memory:clear': 'node scripts/lint-memory.mjs --clear',
      'docs:sync': 'node scripts/sync-living-docs.mjs',
      'docs:lint': 'node scripts/sync-living-docs.mjs --lint'
    };
    for (const [k, v] of Object.entries(creditScripts)) {
      if (!pkg.scripts[k]) {
        pkg.scripts[k] = v;
        pkgUpdated = true;
      }
    }
    const upgradeCmd = 'rm -rf ~/.npm/_npx/*/node_modules/antigravity-memory-bank 2>/dev/null; npx -y github:johnny-saigon/antigravity-memory-bank upgrade';
    const organizeCmd = 'rm -rf ~/.npm/_npx/*/node_modules/antigravity-memory-bank 2>/dev/null; npx -y github:johnny-saigon/antigravity-memory-bank organize';
    const exportCmd = 'rm -rf ~/.npm/_npx/*/node_modules/antigravity-memory-bank 2>/dev/null; npx -y github:johnny-saigon/antigravity-memory-bank export';
    const uninstallCmd = 'rm -rf ~/.npm/_npx/*/node_modules/antigravity-memory-bank 2>/dev/null; npx -y github:johnny-saigon/antigravity-memory-bank uninstall';

    if (!detected.isSelfRepo && (!pkg.scripts['memory:upgrade'] || pkg.scripts['memory:upgrade'] === 'npx github:johnny-saigon/antigravity-memory-bank upgrade')) {
      pkg.scripts['memory:upgrade'] = upgradeCmd;
      pkgUpdated = true;
      console.log('  ✓ Configured cache-safe "memory:upgrade" script in package.json');
    }
    if (!detected.isSelfRepo && (!pkg.scripts['memory:organize'] || pkg.scripts['memory:organize'] === 'npx github:johnny-saigon/antigravity-memory-bank organize')) {
      pkg.scripts['memory:organize'] = organizeCmd;
      pkgUpdated = true;
      console.log('  ✓ Configured cache-safe "memory:organize" script in package.json');
    }
    if (!detected.isSelfRepo && (!pkg.scripts['memory:export'] || pkg.scripts['memory:export'] === 'npx github:johnny-saigon/antigravity-memory-bank export')) {
      pkg.scripts['memory:export'] = exportCmd;
      pkgUpdated = true;
      console.log('  ✓ Configured cache-safe "memory:export" script in package.json');
    }
    if (!detected.isSelfRepo && (!pkg.scripts['memory:uninstall'] || pkg.scripts['memory:uninstall'] === 'npx github:johnny-saigon/antigravity-memory-bank uninstall')) {
      pkg.scripts['memory:uninstall'] = uninstallCmd;
      pkgUpdated = true;
      console.log('  ✓ Configured cache-safe "memory:uninstall" script in package.json');
    }
    if (!pkg.scripts['backlog']) {
      pkg.scripts['backlog'] = 'node scripts/backlog.mjs';
      pkgUpdated = true;
      console.log('  ✓ Added "backlog" script to package.json');
    }
    if (!pkg.scripts['backlog:list']) {
      pkg.scripts['backlog:list'] = 'node scripts/backlog.mjs list';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:add']) {
      pkg.scripts['backlog:add'] = 'node scripts/backlog.mjs add';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:attach']) {
      pkg.scripts['backlog:attach'] = 'node scripts/backlog.mjs attach';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:unpack']) {
      pkg.scripts['backlog:unpack'] = 'node scripts/backlog.mjs unpack';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:plan']) {
      pkg.scripts['backlog:plan'] = 'node scripts/backlog.mjs plan';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:split']) {
      pkg.scripts['backlog:split'] = 'node scripts/backlog.mjs split';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:start']) {
      pkg.scripts['backlog:start'] = 'node scripts/backlog.mjs start';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:done']) {
      pkg.scripts['backlog:done'] = 'node scripts/backlog.mjs done';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:render']) {
      pkg.scripts['backlog:render'] = 'node scripts/backlog.mjs render';
      pkgUpdated = true;
    }
    if (!pkg.scripts['backlog:serve']) {
      pkg.scripts['backlog:serve'] = 'node scripts/backlog.mjs serve';
      pkgUpdated = true;
    }

    if (pkgUpdated) {
      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    }
  } catch {}

  // 4. Install CI workflow if .github directory exists
  const githubDir = path.join(targetDir, '.github');
  try {
    await fs.access(githubDir);
    const workflowsDir = path.join(githubDir, 'workflows');
    await fs.mkdir(workflowsDir, { recursive: true });
    const ciSrc = path.join(pkgRoot, 'templates/github/workflows/memory-bank-sync.yml.tpl');
    const ciDest = path.join(workflowsDir, 'memory-bank-sync.yml');
    try {
      await fs.access(ciDest);
      console.log('  ↷ Existing .github/workflows/memory-bank-sync.yml preserved');
    } catch {
      await fs.copyFile(ciSrc, ciDest);
      console.log('  ✓ Installed CI workflow: .github/workflows/memory-bank-sync.yml');
    }
  } catch {}
}

/**
 * Initializes the Memory Bank
 */
async function initMemory(targetDir, opts, detected) {
  const isHeadless = opts.yes || !input.isTTY;

  console.log('\n🧠 Antigravity Memory Bank — On-the-Fly Initializer');
  console.log(`📍 Target Directory: ${targetDir}`);
  if (detected.hasGit) console.log('✓ Git repository detected');
  if (detected.hasPackageJson) console.log('✓ Node/JavaScript package detected');

  let projectName = opts.name || detected.name;
  let tagline = opts.tagline || detected.tagline;
  let description = opts.desc || detected.description;
  let platforms = opts.platforms || detected.platforms;
  let frontendTech = opts.frontend || detected.frontend;
  let backendTech = opts.backend || detected.backend;
  let databaseTech = opts.db || detected.db;
  let port = opts.port || detected.port;
  let healthUrl = opts.health || (detected.port ? `http://localhost:${detected.port}/health` : detected.health);

  // Scrape prior project history, docs, and conversation transcripts
  const scraped = await scrapeHistoricalContext(targetDir, projectName);

  if (!opts.tagline && scraped.tagline) tagline = scraped.tagline;
  if (!opts.desc && scraped.summary) description = scraped.summary;

  if (!isHeadless) {
    const rl = readline.createInterface({ input, output });
    try {
      console.log('\nConfigure your Three-Tier Memory Bank (press ENTER to accept auto-detected defaults):\n');
      projectName = (await rl.question(`Project Name [${projectName}]: `)).trim() || projectName;
      tagline = (await rl.question(`Tagline [${tagline}]: `)).trim() || tagline;
      description = (await rl.question(`Short Description [${description}]: `)).trim() || description;
      platforms = (await rl.question(`Platforms [${platforms}]: `)).trim() || platforms;
      frontendTech = (await rl.question(`Frontend Stack [${frontendTech}]: `)).trim() || frontendTech;
      backendTech = (await rl.question(`Backend Stack [${backendTech}]: `)).trim() || backendTech;
      databaseTech = (await rl.question(`Database [${databaseTech}]: `)).trim() || databaseTech;
      port = (await rl.question(`Allocated Port [${port}]: `)).trim() || port;
      healthUrl = (await rl.question(`Health Check URL [${healthUrl}]: `)).trim() || healthUrl;

      if (!opts.commit && detected.hasGit) {
        const commitAns = (await rl.question(`Automatically git commit memory bank? (Y/n): `)).trim().toLowerCase();
        if (commitAns !== 'n' && commitAns !== 'no') {
          opts.commit = true;
        }
      }
    } finally {
      rl.close();
    }
  } else {
    console.log(`⚙️ Running in automated on-the-fly mode for project: "${projectName}"`);
  }

  // Format scraped context for template interpolation
  let recentAccomplishmentsMd = '';
  if (scraped.recentAccomplishments.length > 0) {
    recentAccomplishmentsMd = scraped.recentAccomplishments.map((item, idx) => `${idx + 1}. **${item}**`).join('\n');
  } else {
    recentAccomplishmentsMd = `1. Initialized repository with Antigravity Three-Tier Memory Bank.\n2. Configured automated line-budget linter (< 150 lines per memory document).\n3. Established 2-phase continuous session cycle on \`/update-memory\`.`;
  }

  let pendingTasksMd = '';
  if (scraped.pendingTasks.length > 0) {
    pendingTasksMd = scraped.pendingTasks.map((t) => `- [ ] ${t}`).join('\n');
  } else {
    pendingTasksMd = `- [ ] Implement core domain models and database schemas.\n- [ ] Connect health check probe (\`${healthUrl}\`).\n- [ ] Run first test suite cycle.`;
  }

  let milestonesMd = '';
  if (scraped.completedMilestones.length > 0) {
    milestonesMd = scraped.completedMilestones.map((m) => `- [x] ${m}`).join('\n') + `\n- [ ] Current sprint milestone in progress`;
  } else {
    milestonesMd = `- [x] Memory Bank initialized and committed to version control.\n- [ ] Core API / service skeleton established.\n- [ ] Automated CI pipeline active and passing.\n- [ ] Production deployment and live health verification.`;
  }

  const replacements = {
    '{{PROJECT_NAME}}': projectName,
    '{{PROJECT_TAGLINE}}': tagline,
    '{{PROJECT_DESCRIPTION}}': description,
    '{{PLATFORMS}}': platforms,
    '{{TARGET_AUDIENCE}}': 'Developers & end users',
    '{{FRONTEND_TECH}}': frontendTech,
    '{{BACKEND_TECH}}': backendTech,
    '{{DATABASE_TECH}}': databaseTech,
    '{{DATABASE_NAME}}': projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    '{{CACHE_TECH}}': 'Redis 7',
    '{{CACHE_DB}}': 'DB 0',
    '{{DEPLOYMENT_TARGET}}': 'Cloud VPS / Production Node',
    '{{PORT}}': port,
    '{{HEALTH_URL}}': healthUrl,
    '{{DAEMON_NAME}}': projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    '{{RECENT_ACCOMPLISHMENTS}}': recentAccomplishmentsMd,
    '{{PENDING_TASKS}}': pendingTasksMd,
    '{{MILESTONES}}': milestonesMd,
  };

  const destRoot = opts.asPlugin
    ? path.join(targetDir, '.agents/plugins/memory-bank')
    : targetDir;

  console.log(`\n🚀 Bootstrapping Memory Bank files into: ${destRoot}`);

  async function processTemplate(srcRel, destRel) {
    const srcPath = path.join(pkgRoot, 'templates', srcRel);
    const destPath = path.join(destRoot, destRel);

    if (!opts.force) {
      try {
        await fs.access(destPath);
        console.log(`  ↷ Preserved existing ${destRel} (use --force to overwrite)`);
        return;
      } catch {}
    }

    let content = await fs.readFile(srcPath, 'utf8');
    for (const [key, val] of Object.entries(replacements)) {
      content = content.replaceAll(key, val);
    }
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, content, 'utf8');
    console.log(`  ✓ Created ${destRel}`);
  }

  async function copySkill(skillName) {
    const srcSkill = path.join(pkgRoot, 'skills', skillName, 'SKILL.md');
    const destSkill = opts.asPlugin
      ? path.join(destRoot, 'skills', skillName, 'SKILL.md')
      : path.join(targetDir, '.agents/skills', skillName, 'SKILL.md');

    let content = await fs.readFile(srcSkill, 'utf8');
    await fs.mkdir(path.dirname(destSkill), { recursive: true });
    await fs.writeFile(destSkill, content, 'utf8');
    console.log(`  ✓ Installed skill: ${skillName}`);
  }

  if (opts.asPlugin) {
    const manifestSrc = path.join(pkgRoot, 'plugin.json');
    await fs.mkdir(destRoot, { recursive: true });
    await fs.copyFile(manifestSrc, path.join(destRoot, 'plugin.json'));
    console.log('  ✓ Installed plugin.json');

    const rulesSrc = path.join(pkgRoot, 'rules/AGENTS.md');
    await fs.mkdir(path.join(destRoot, 'rules'), { recursive: true });
    await fs.copyFile(rulesSrc, path.join(destRoot, 'rules/AGENTS.md'));
    console.log('  ✓ Installed rules/AGENTS.md');

    await copySkill('start');
    await copySkill('update-memory');
    await copySkill('backlog-start');
    await copySkill('backlog-plan');
    await copySkill('context');
    await copySkill('clear');
    await copySkill('effort');
    await copySkill('credits');
    await copySkill('usage');
  } else {
    await processTemplate('AGENTS.md.tpl', 'AGENTS.md');
    await processTemplate('rules/infra.md.tpl', '.agents/rules/infra.md');
    await processTemplate('rules/negative-constraints.md.tpl', '.agents/rules/negative-constraints.md');
    await processTemplate('memory-bank/projectbrief.md.tpl', 'memory-bank/projectbrief.md');
    await processTemplate('memory-bank/productContext.md.tpl', 'memory-bank/productContext.md');
    await processTemplate('memory-bank/systemPatterns.md.tpl', 'memory-bank/systemPatterns.md');
    await processTemplate('memory-bank/infrastructureInvariants.md.tpl', 'memory-bank/infrastructureInvariants.md');
    await processTemplate('memory-bank/activeContext.md.tpl', 'memory-bank/activeContext.md');
    await processTemplate('memory-bank/progress.md.tpl', 'memory-bank/progress.md');

    await copySkill('start');
    await copySkill('update-memory');
    await copySkill('backlog-start');
    await copySkill('backlog-plan');
    await copySkill('context');
    await copySkill('clear');
    await copySkill('effort');
    await copySkill('credits');
    await copySkill('usage');

    const linterSrc = path.join(pkgRoot, 'scripts/lint-memory.mjs');
    const linterDest = path.join(targetDir, 'scripts/lint-memory.mjs');
    if (path.resolve(linterSrc) !== path.resolve(linterDest) && !detected.isSelfRepo) {
      await fs.mkdir(path.dirname(linterDest), { recursive: true });
      await fs.copyFile(linterSrc, linterDest);
      await fs.chmod(linterDest, 0o755);
      console.log('  ✓ Installed scripts/lint-memory.mjs');
    } else {
      console.log('  ↷ Preserved upstream scripts/lint-memory.mjs (self-repository guard)');
    }

    await installSyncAndHooks(targetDir, detected);
    await adaptExistingBacklog(targetDir, projectName);
    if (!opts.noOrganize) {
      await organizeRepositoryStructure(targetDir, {
        pkgRoot,
        projectName,
        dryRun: opts.dryRun,
        quiet: opts.quiet
      });
    }
    const custInit = await syncCustomizationsToMemoryBank(targetDir, projectName);
    if (custInit) {
      console.log('  ✓ Configured .agents/hooks.json (SessionStart, PostToolUse, Stop on-the-fly sync)');
      console.log(`  ✓ Synchronized memory-bank/integrationsAndCustomizations.md (${custInit.envKeyCount} env keys, ${custInit.mcpCount} MCP servers, ${custInit.rulesCount} rules, ${custInit.skillsCount} skills)`);
    }

    try {
      execSync('node scripts/backlog.mjs render', { cwd: targetDir, stdio: 'inherit' });
      if (detected.hasGit) {
        execSync('git rm --cached -f docs/backlog.html .DS_Store 2>/dev/null || true', { cwd: targetDir, stdio: 'pipe' });
      }
    } catch (err) {
      console.warn('⚠️ Backlog render warning:', err.message);
    }
  }

  console.log('\n🧪 Auditing Memory Bank line budget (<150 lines per document)...');
  try {
    execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Linter notice:', e.message);
  }

  if (!opts.asPlugin) {
    runMandatoryIngestionChecklist(targetDir, detected);
  }

  if (opts.commit && detected.hasGit) {
    console.log('\n🔧 Recording Memory Bank baseline into Git...');
    try {
      execSync('git add -A && git rm --cached -f docs/backlog.html .DS_Store 2>/dev/null || true', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      execSync('git commit -m "chore(memory): bootstrap Three-Tier Memory Bank with continuous lifecycle and auto-sync"', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      console.log('  ✓ Baseline committed to Git.');
    } catch {
      console.log('  ℹ️ Working tree clean or changes already staged.');
    }
  }

  console.log('\n✅ Antigravity Memory Bank successfully activated on the fly!');
  console.log('⚡ Immediate In-Window Activation:');
  console.log('   Because workspace skills, rules, and lifecycle hooks (.agents/hooks.json) are dynamically ingested,');
  console.log('   all new keys, MCP servers, skills, rules, and distilled decisions now sync on the fly with ZERO manual steps!\n');
}

/**
 * In-place upgrade for existing projects (preserves custom memory-bank documents)
 */
async function upgradeMemory(targetDir, opts, detected) {
  console.log('\n🔄 Antigravity Memory Bank — In-Place Upgrade Workflow');
  console.log(`📍 Target Directory: ${targetDir}`);
  console.log('🛡️  Existing Memory Bank detected: Domain files in memory-bank/ will be PRESERVED.');

  // 1. Detect Project Title from AGENTS.md or package.json
  let projectTitle = detected.name;
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  let agentsContent = '';
  try {
    agentsContent = await fs.readFile(agentsPath, 'utf8');
    const titleMatch = agentsContent.match(/^#\s+Antigravity Agent Directives\s+[—-]\s+([^\n]+)/m);
    if (titleMatch) projectTitle = titleMatch[1].trim();
  } catch {}

  // 2. Detect Health Probe from .agents/skills/start/SKILL.md
  let healthProbe = `curl -s http://localhost:${detected.port}/health || true`;
  const startSkillPath = path.join(targetDir, '.agents/skills/start/SKILL.md');
  try {
    const startContent = await fs.readFile(startSkillPath, 'utf8');
    const curlMatch = startContent.match(/curl\s+[^`)\n]+/);
    if (curlMatch) {
      healthProbe = curlMatch[0].trim().replace(/[)\`]+$/, '');
    }
  } catch {}

  console.log(`  ✓ Detected project title: "${projectTitle}"`);
  console.log(`  ✓ Detected health probe: \`${healthProbe}\``);

  // 3. Upgrade .agents/skills/update-memory/SKILL.md
  const upgradedSkill = `---
name: update-memory
description: Memory synchronization workflow triggered via /update-memory or after major milestones.
---

# ${projectTitle} Memory Synchronization & Continuous Cycle (\`/update-memory\`)

When \`/update-memory\` is triggered or a major milestone/task completes:

### Phase 1: Close & Synchronize Current Session
1. Auto-sync recent git commit history, repo paths, API keys, MCP configs & customizations into context:
   \`\`\`bash
   node scripts/sync-memory-context.mjs
   \`\`\`
2. Review all changes made in the working branch (\`git status -s\` and \`git diff --stat\`) and any active production or staging deployments.
3. Refresh the Review pane backlog artifacts:
   \`\`\`bash
   node scripts/backlog.mjs render
   \`\`\`
4. Update \`memory-bank/progress.md\` and \`memory-bank/activeContext.md\` as a **passive observer**:
   - Record high-level completed milestones and technical decisions made during this session.
   - Cross-reference active tickets in \`docs/backlog.json\` and resolved bugs in \`docs/BUG_FIX_RECORDS.md\`.
   - **Do NOT** conduct active ticket management or task tracking inside \`memory-bank/*.md\`.
5. Verify that every file in \`memory-bank/*.md\` remains strictly **under 150 lines** (per Operational Best Practice #3). If any file approaches 150 lines, split deeper domain sections into a dedicated \`memory-bank/<topic>.md\` file and link via \`@[Topic](memory-bank/<topic>.md)\`.
6. Verify that no Tier 2 infrastructure invariants (\`.agents/rules/infra.md\` and \`memory-bank/infrastructureInvariants.md\`) were violated or modified without cross-cluster alignment.
7. Commit and push memory updates to Git with a conventional commit message (e.g. \`docs(memory-bank): sync session state and close milestone\`).

### Phase 2: Explicit Auto-Start & New Session Initialization
Immediately after closing the previous session, initialize the new working cycle without requiring the user to invoke \`/start\` manually:
8. Re-anchor context by re-reading \`memory-bank/activeContext.md\` and \`memory-bank/progress.md\` to identify the next priority tasks.
9. Check working tree cleanliness (\`git status -s\`) and head commit (\`git log -n 1 --oneline\`).
10. Run a live non-invasive health check against the production backend:
   \`\`\`bash
   ${healthProbe}
   \`\`\`
11. Explicitly output the new active session status banner to the user:
    - 🟢 **New Session Cycle Initialized**
    - **Current Phase**: [Current project phase from activeContext.md]
    - **Immediate Focus**: [Top pending task / feature / bug in progress]
    - **Proposed Next Action**: [Concrete first step ready for execution + recommended \`/effort\` tier & \`/plan\` gate]
    - **💡 Credit Hygiene**: Run \`/clear\` (or \`/compact\`) now to prune completed session history, \`/context\` to inspect active rules, \`/effort\` to throttle reasoning on routine tasks, and \`/credits\` · \`/usage\` (with the Google One / Antigravity **Overage Toggle disabled**).
`;
  const updateSkillDest = path.join(targetDir, '.agents/skills/update-memory/SKILL.md');
  await fs.mkdir(path.dirname(updateSkillDest), { recursive: true });
  await fs.writeFile(updateSkillDest, upgradedSkill, 'utf8');
  console.log('  ✓ Upgraded .agents/skills/update-memory/SKILL.md (2-phase continuous lifecycle)');

  // 4. Upgrade Operational Mandates in AGENTS.md and enforce < 50 lines Progressive Disclosure root architecture
  if (agentsContent) {
    let customSection = '';
    const customIdx = agentsContent.indexOf('### PROJECT_CUSTOM_DIRECTIVES');
    if (customIdx !== -1) {
      customSection = '\n' + agentsContent.slice(customIdx).trim() + '\n';
    }

    const tplPath = path.join(pkgRoot, 'templates/AGENTS.md.tpl');
    let cleanAgents = await fs.readFile(tplPath, 'utf8');
    const replacements = {
      '{{PROJECT_NAME}}': projectTitle,
      '{{PROJECT_TAGLINE}}': detected.description || detected.tagline || 'AI-native application',
      '{{FRONTEND_TECH}}': detected.frontend || 'Frontend',
      '{{BACKEND_TECH}}': detected.backend || 'Backend',
      '{{DATABASE_TECH}}': detected.db || 'Database',
      '{{PORT}}': detected.port || '3000',
      '{{HEALTH_URL}}': detected.health || `http://localhost:${detected.port || '3000'}/health`
    };
    for (const [k, v] of Object.entries(replacements)) {
      cleanAgents = cleanAgents.replaceAll(k, v);
    }
    if (customSection) {
      cleanAgents = cleanAgents.trimEnd() + '\n' + customSection;
    }

    await fs.writeFile(agentsPath, cleanAgents, 'utf8');
    console.log('  ✓ Upgraded AGENTS.md (<50 lines progressive-disclosure root, /context verification, credit/token frugality & strict E2E verification)');
  }

  // 4b. Upgrade .agents/rules/infra.md & .agents/rules/negative-constraints.md with valid YAML frontmatter (trigger: model_decision) & Frugality Deny-List
  const infraRulePath = path.join(targetDir, '.agents/rules/infra.md');
  try {
    let infraRuleContent = await fs.readFile(infraRulePath, 'utf8');
    if (!infraRuleContent.startsWith('---\n') && !infraRuleContent.startsWith('---\r\n')) {
      infraRuleContent = `---\ntrigger: model_decision\ndescription: "Apply whenever configuring ports, databases, Redis caches, process daemons, supervisor/systemd workers, or deployment infrastructure."\n---\n` + infraRuleContent;
      await fs.writeFile(infraRulePath, infraRuleContent, 'utf8');
      console.log('  ✓ Added trigger: model_decision YAML frontmatter to .agents/rules/infra.md');
    }
  } catch {}

  const negRulePath = path.join(targetDir, '.agents/rules/negative-constraints.md');
  try {
    let negRuleContent = await fs.readFile(negRulePath, 'utf8');
    if (!negRuleContent.startsWith('---\n') && !negRuleContent.startsWith('---\r\n')) {
      negRuleContent = `---\ntrigger: model_decision\ndescription: "Apply whenever executing shell commands, managing processes or Docker containers, querying databases, or enforcing the <= 8 tool turns credit and token frugality budget."\n---\n` + negRuleContent;
    }
    if (!negRuleContent.includes('Stop the Credit Bleed')) {
      negRuleContent = `---\ntrigger: model_decision\ndescription: "Apply whenever executing shell commands, managing processes or Docker containers, querying databases, or enforcing the <= 8 tool turns credit and token frugality budget."\n---\n# Tier 2: Negative Constraints & Execution Deny-List\n\nWhen generating code, scripts, or executing shell commands in **${projectTitle}**:\n\n1. **Host Stability**:\n   - NEVER execute \`killall\`, \`shutdown\`, \`reboot\`, or \`systemctl stop\`.\n   - Only restart the designated worker for this application.\n2. **Container Boundaries**:\n   - NEVER start unprivileged Docker-in-Docker daemons (\`dockerd\`) on shared VPS hosts.\n3. **Database & Storage Partitioning**:\n   - Scoped strictly to allocated databases and storage buckets.\n   - Prohibit \`FLUSHALL\` on shared Redis instances.\n4. **Credit & Token Frugality Deny-List (Stop the Credit Bleed)**:\n   - NEVER jump straight into editing production files on complex features or multi-file bugs without locking down an approved plan via \`/plan\` or \`/backlog-plan\`.\n   - NEVER use maximum frontier reasoning effort on boilerplate UI, routing, or simple CRUD—throttle reasoning with \`/effort\` (\`low\`/\`medium\`), prune completed task history with \`/clear\` (or \`/compact\`) + \`/context\`, keep the Google One / Antigravity **Overage Toggle disabled** (hard stop at 20x limit), and check \`/credits\` & \`/usage\`.\n   - NEVER read \`.system_generated/logs/transcript*.jsonl\` or grep sibling repositories (\`BinaryDay\`, \`SnapCal\`, \`RemoveBackGround\`, \`AntigravityRemote\`) unless explicitly requested for transcript recovery.\n   - NEVER re-investigate state already recorded in \`memory-bank/activeContext.md\` or \`docs/backlog.json\`.\n   - Enforce a **Hard Turn Budget (\`≤ 8 Tool Turns per Fix\`)**: batch all file reads into 1 turn, all edits into 1–2 turns, and all verification/deployment commands into 1–2 chained shell calls.\n`;
    }
    await fs.writeFile(negRulePath, negRuleContent, 'utf8');
    console.log('  ✓ Upgraded .agents/rules/negative-constraints.md with model_decision frontmatter & Credit/Token Frugality Deny-List');
  } catch {}

  // 5. Install scripts/lint-memory.mjs
  const linterSrc = path.join(pkgRoot, 'scripts/lint-memory.mjs');
  const linterDest = path.join(targetDir, 'scripts/lint-memory.mjs');
  if (path.resolve(linterSrc) !== path.resolve(linterDest) && !detected.isSelfRepo) {
    await fs.mkdir(path.dirname(linterDest), { recursive: true });
    await fs.copyFile(linterSrc, linterDest);
    await fs.chmod(linterDest, 0o755);
    console.log('  ✓ Installed scripts/lint-memory.mjs (token budget linter)');
  } else {
    console.log('  ↷ Preserved upstream scripts/lint-memory.mjs (self-repository guard)');
  }

  // 6. Install sync script, git hooks, package scripts, and CI workflows
  await installSyncAndHooks(targetDir, detected);

  // 6b. Discover, adapt, and migrate existing boards and bug records into the decoupled backlog
  const backlogResult = await adaptExistingBacklog(targetDir, projectTitle);

  // 6c. Organize repository root & AI-native directory structure (relocate loose root specs to docs/, rewrite links, harden .gitignore)
  if (!opts.noOrganize) {
    await organizeRepositoryStructure(targetDir, {
      pkgRoot,
      projectName: projectTitle,
      dryRun: opts.dryRun,
      quiet: opts.quiet
    });
  }

  // 6d. Configure .agents/hooks.json & synchronize repo paths, API keys, MCP configs & customizations
  const custUpgrade = await syncCustomizationsToMemoryBank(targetDir, projectTitle);
  if (custUpgrade) {
    console.log('  ✓ Configured .agents/hooks.json (SessionStart, PostToolUse, Stop on-the-fly sync)');
    console.log(`  ✓ Synchronized memory-bank/integrationsAndCustomizations.md (${custUpgrade.envKeyCount} env keys, ${custUpgrade.mcpCount} MCP servers, ${custUpgrade.rulesCount} rules, ${custUpgrade.skillsCount} skills)`);
  }

  // Render initial Review pane artifacts
  try {
    execSync('node scripts/backlog.mjs render', { cwd: targetDir, stdio: 'inherit' });
    if (detected.hasGit) {
      execSync('git rm --cached -f docs/backlog.html .DS_Store 2>/dev/null || true', { cwd: targetDir, stdio: 'pipe' });
    }
  } catch (err) {
    console.warn('⚠️ Backlog render warning:', err.message);
  }

  // 7. Audit line budget on existing files
  console.log('\n🧪 Auditing existing Memory Bank line budget (<150 lines per document)...');
  try {
    execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Linter notice:', e.message);
  }

  // 7b. Run Mandatory 10-Point Baseline Ingestion & Verification Checklist
  runMandatoryIngestionChecklist(targetDir, detected);

  // 8. Commit upgrade to Git if requested
  if (opts.commit && detected.hasGit) {
    console.log('\n🔧 Committing memory upgrade to Git...');
    try {
      execSync('git add -A && git rm --cached -f docs/backlog.html .DS_Store 2>/dev/null || true', {
        cwd: targetDir,
        stdio: 'pipe',
      });
      execSync('git commit -m "chore(memory): upgrade Antigravity Memory Bank (AI-native root organizer, 3-artifact planning mode & pre-auth MCP sync)"', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      console.log('  ✓ Memory Bank upgrade committed to Git.');
    } catch {
      console.log('  ℹ️ Working tree clean or changes already committed.');
    }
  }

  console.log('\n✅ Antigravity Memory Bank successfully upgraded on the fly!');
  console.log('🛡️  Your domain files in memory-bank/ remain 100% intact.');
  console.log('📦 New capabilities active in this project:');
  console.log('   - 🗂️  AI-Native Repository Organizer: Clean root entrypoints, relocated docs/, rewritten links & hardened .gitignore');
  console.log('   - 📚 Canonical Living Docs & Deep Harvester: docs/INDEX.md + 4 Pillars (npm run docs:sync / npm run docs:lint)');
  console.log('   - ⚡ On-the-Fly Lifecycle Hooks: .agents/hooks.json (SessionStart, PostToolUse, Stop) + .git/hooks/post-commit');
  console.log('   - 📋 10-Point Baseline Ingestion Checklist: Verified repo paths, keys, MCPs, rules, skills & <24KB rule cap');
  console.log('   - 🔑 API Keys, MCP & Customizations Index: memory-bank/integrationsAndCustomizations.md');
  console.log('   - 📋 Decoupled Zero-Token Backlog: docs/backlog.json & npm run backlog');
  console.log('   - 📐 Correlated 3-Artifact Planning Mode: docs/planning/{task,implementation_plan,walkthrough}.md & /backlog-plan <TICKET_ID>');
  console.log('   - 🚀 Autonomous Sprint Execution: /backlog-start <TICKET_ID> [optional_attachments]');
  console.log('   - 🖥️  Review Pane Board: backlog.html auxiliary pane Kanban board');
  console.log('   - 🔄 Continuous 2-Phase Cycle: /update-memory auto-boots the next session');
  console.log('   - 📏 Token Budget Linter: npm run lint:memory (<150 lines/file)\n');
}

/**
 * Standalone command to organize repository root, docs/, .gitignore, and AI-native directories
 */
async function organizeRepo(targetDir, opts, detected) {
  console.log('\n🗂️  Antigravity Memory Bank — AI-Native Repository Organizer');
  console.log(`📍 Target Directory: ${targetDir}${opts.dryRun ? ' (DRY RUN)' : ''}`);

  if (!opts.dryRun && (detected.memoryBankExists || fsSync.existsSync(path.join(targetDir, 'docs/backlog.json')))) {
    await adaptExistingBacklog(targetDir, detected.name);
  }

  const orgResult = await organizeRepositoryStructure(targetDir, {
    pkgRoot,
    projectName: detected.name,
    dryRun: opts.dryRun,
    quiet: opts.quiet
  });

  if (!opts.dryRun && detected.memoryBankExists) {
    await syncCustomizationsToMemoryBank(targetDir, detected.name);
    if (fsSync.existsSync(path.join(targetDir, 'scripts/backlog.mjs'))) {
      try {
        execSync('node scripts/backlog.mjs render', { cwd: targetDir, stdio: 'pipe' });
        if (detected.hasGit) {
          execSync('git rm --cached -f docs/backlog.html .DS_Store 2>/dev/null || true', { cwd: targetDir, stdio: 'pipe' });
        }
      } catch {}
    }
    runMandatoryIngestionChecklist(targetDir, detected);
  }

  if (opts.commit && detected.hasGit && !opts.dryRun) {
    console.log('\n🔧 Committing repository reorganization to Git...');
    try {
      execSync('git add -A && git rm --cached -f docs/backlog.html .DS_Store 2>/dev/null || true', {
        cwd: targetDir,
        stdio: 'pipe',
      });
      execSync('git commit -m "chore(repo): organize AI-native repository root and docs structure"', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      console.log('  ✓ Repository reorganization committed to Git.');
    } catch {
      console.log('  ℹ️ Working tree clean or changes already committed.');
    }
  }

  return orgResult;
}

async function main() {
  const opts = parseCliArgs(process.argv);
  const targetDir = opts.targetDir || process.cwd();
  const detected = await detectProjectContext(targetDir);

  if (opts.command === 'brick') {
    const action = opts.brickAction || 'list';
    const brickName = opts.brickName || 'user-profile';
    if (action === 'list') {
      printBrickList(pkgRoot);
    } else if (action === 'doctor') {
      const res = runBrickDoctor({ pkgRoot, targetDir, brickName });
      if (!res.ok) process.exit(1);
    } else if (action === 'install' || action === 'upgrade') {
      await installOrUpgradeBrick({
        pkgRoot,
        targetDir,
        brickName,
        platformsArg: opts.platforms,
        withSchema: opts.withSchema,
        isUpgrade: action === 'upgrade',
      });
    }
    return;
  }

  if (opts.command === 'export') {
    await exportMemory(targetDir, opts.exportDir);
  } else if (opts.command === 'uninstall') {
    await uninstallMemory(targetDir, opts, detected);
  } else if (opts.command === 'organize') {
    await organizeRepo(targetDir, opts, detected);
  } else if (opts.command === 'docs:sync') {
    await synthesizeLivingDocs(targetDir, { pkgRoot, projectName: detected.name, dryRun: opts.dryRun, quiet: opts.quiet });
  } else if (opts.command === 'sync') {
    await syncCustomizationsToMemoryBank(targetDir, detected.name);
    await syncMemory(targetDir, opts);
  } else if (opts.command === 'upgrade' || (opts.command === 'init' && detected.memoryBankExists && !opts.force)) {
    await upgradeMemory(targetDir, opts, detected);
  } else {
    await initMemory(targetDir, opts, detected);
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal error during Memory Bank operation:', err.message);
  process.exit(1);
});
