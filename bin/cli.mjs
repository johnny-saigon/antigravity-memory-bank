#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Project Initializer, Exporter & Deinstaller CLI
 * Manages the full lifecycle of the Three-Tier Memory Bank on the fly:
 * - init: Bootstraps the Memory Bank with smart auto-detection
 * - export: Creates consolidated markdown and tarball context exports
 * - uninstall: Safely exports context and cleanly uninstalls all memory files
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { execSync } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import { scrapeHistoricalContext } from '../lib/context-scraper.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

function parseCliArgs(argv) {
  const options = {
    command: 'init',
    asPlugin: false,
    yes: false,
    commit: false,
    force: false,
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
    if (a === 'init' || a === 'install' || a === 'install-plugin') {
      options.command = 'init';
      if (a === 'install-plugin') options.asPlugin = true;
    } else if (a === 'export' || a === 'backup') {
      options.command = 'export';
    } else if (a === 'uninstall' || a === 'remove' || a === 'deinstall') {
      options.command = 'uninstall';
    } else if (a === 'upgrade' || a === 'update') {
      options.command = 'upgrade';
    } else if (a === 'sync') {
      options.command = 'sync';
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
    }
  }

  return options;
}

function printHelp() {
  console.log(`
🧠 Antigravity Memory Bank CLI

Commands:
  init [options]         Bootstrap Memory Bank into project on the fly (default)
  sync [options]         Incrementally sync git history and accomplishments into context
  upgrade [options]      Safely upgrade existing Memory Bank to v1.2 (preserves all domain data)
  export [options]       Export project memory & context to markdown and archive
  uninstall [options]    Cleanly uninstall Memory Bank (automatically exports context first)

Options:
  -y, --yes, --non-interactive  Run without interactive prompts (headless mode)
  --commit                      Automatically git add and commit changes
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
    '.agents/rules/infra.md',
    '.agents/rules/negative-constraints.md',
    '.agents/skills/start/SKILL.md',
    '.agents/skills/update-memory/SKILL.md',
    '.agents/plugins/memory-bank/plugin.json',
    '.agents/plugins/memory-bank/rules/AGENTS.md',
    '.agents/plugins/memory-bank/skills/start/SKILL.md',
    '.agents/plugins/memory-bank/skills/update-memory/SKILL.md',
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

  // 3. Remove skills: start and update-memory
  const skillsToRemove = ['start', 'update-memory'];
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

  // 4. Remove rules: infra.md and negative-constraints.md
  for (const r of ['infra.md', 'negative-constraints.md']) {
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
  try {
    await fs.rm(path.join(targetDir, 'scripts/lint-memory.mjs'), { force: true });
    await fs.rm(path.join(targetDir, 'scripts/sync-memory-context.mjs'), { force: true });
    console.log('  ✓ Removed scripts/lint-memory.mjs and scripts/sync-memory-context.mjs');
    const remainingScripts = await fs.readdir(path.join(targetDir, 'scripts'));
    if (remainingScripts.length === 0) {
      await fs.rm(path.join(targetDir, 'scripts'), { recursive: true, force: true });
    }
  } catch {}

  // 7. Clean package.json scripts
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    if (pkg.scripts) {
      const keys = ['lint:memory', 'memory:sync', 'memory:upgrade', 'memory:export', 'memory:uninstall'];
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
  await fs.mkdir(path.dirname(syncDest), { recursive: true });
  await fs.copyFile(syncSrc, syncDest);
  await fs.chmod(syncDest, 0o755);
  console.log('  ✓ Installed scripts/sync-memory-context.mjs (incremental auto-synchronizer)');

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

  // 3. Update package.json scripts with lint, sync, upgrade, export, and uninstall commands
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
    if (!pkg.scripts['memory:upgrade']) {
      pkg.scripts['memory:upgrade'] = 'npx github:johnny-saigon/antigravity-memory-bank upgrade';
      pkgUpdated = true;
      console.log('  ✓ Added "memory:upgrade" script to package.json');
    }
    if (!pkg.scripts['memory:export']) {
      pkg.scripts['memory:export'] = 'npx github:johnny-saigon/antigravity-memory-bank export';
      pkgUpdated = true;
      console.log('  ✓ Added "memory:export" script to package.json');
    }
    if (!pkg.scripts['memory:uninstall']) {
      pkg.scripts['memory:uninstall'] = 'npx github:johnny-saigon/antigravity-memory-bank uninstall';
      pkgUpdated = true;
      console.log('  ✓ Added "memory:uninstall" script to package.json');
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

    const linterSrc = path.join(pkgRoot, 'scripts/lint-memory.mjs');
    const linterDest = path.join(targetDir, 'scripts/lint-memory.mjs');
    await fs.mkdir(path.dirname(linterDest), { recursive: true });
    await fs.copyFile(linterSrc, linterDest);
    await fs.chmod(linterDest, 0o755);
    console.log('  ✓ Installed scripts/lint-memory.mjs');

    await installSyncAndHooks(targetDir, detected);
  }

  console.log('\n🧪 Auditing Memory Bank line budget (<150 lines per document)...');
  try {
    execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Linter notice:', e.message);
  }

  if (opts.commit && detected.hasGit) {
    console.log('\n🔧 Recording Memory Bank baseline into Git...');
    try {
      execSync('git add AGENTS.md .agents/ memory-bank/ scripts/ package.json .github/ 2>/dev/null || true', {
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
  console.log('   Because workspace skills and directives are dynamically ingested,');
  console.log('   you can type /start right now in this Antigravity window with ZERO restart!\n');
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
1. Auto-sync recent git commit history into context drafts:
   \`\`\`bash
   node scripts/sync-memory-context.mjs
   \`\`\`
2. Review all changes made in the working branch (\`git status -s\` and \`git diff --stat\`) and any production deployments on Vast.ai (\`85.10.218.46:44016\`).
3. Update \`memory-bank/progress.md\` by marking finished acceptance criteria as complete (\`[x]\`).
4. Update \`memory-bank/activeContext.md\` with:
   - Technical decisions made during this session.
   - Any modifications to endpoints, database schemas, or client screens.
   - Resolved bugs (cross-referenced with \`docs/BUG_FIX_RECORDS.md\` if present).
   - Closed sprint items.
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
    - **Proposed Next Action**: [Concrete first step ready for execution]
`;
  const updateSkillDest = path.join(targetDir, '.agents/skills/update-memory/SKILL.md');
  await fs.mkdir(path.dirname(updateSkillDest), { recursive: true });
  await fs.writeFile(updateSkillDest, upgradedSkill, 'utf8');
  console.log('  ✓ Upgraded .agents/skills/update-memory/SKILL.md (2-phase continuous lifecycle)');

  // 4. Upgrade Operational Mandate in AGENTS.md
  if (agentsContent) {
    let modifiedAgents = agentsContent;
    const oldMandatePattern = /\d+\.\s+\*\*Session State Updates & Line Budget\*\*:[^\n]+/g;
    const newMandateText = `4. **Session State Updates & Continuous Cycling**: Keep every \`memory-bank/*.md\` file strictly **under 150 lines** (split deep domains into linked sub-files using \`@\`). When a major milestone is completed or upon \`/update-memory\`, synchronize and close the completed cycle, commit to Git, and immediately auto-bootstrap the new session state with a fresh status banner without requiring manual \`/start\`.`;
    if (oldMandatePattern.test(modifiedAgents)) {
      modifiedAgents = modifiedAgents.replace(oldMandatePattern, newMandateText);
      await fs.writeFile(agentsPath, modifiedAgents, 'utf8');
      console.log('  ✓ Upgraded AGENTS.md operational mandate #4 (continuous session cycle)');
    } else {
      console.log('  ↷ AGENTS.md already contains updated continuous cycling directives');
    }
  }

  // 5. Install scripts/lint-memory.mjs
  const linterSrc = path.join(pkgRoot, 'scripts/lint-memory.mjs');
  const linterDest = path.join(targetDir, 'scripts/lint-memory.mjs');
  await fs.mkdir(path.dirname(linterDest), { recursive: true });
  await fs.copyFile(linterSrc, linterDest);
  await fs.chmod(linterDest, 0o755);
  console.log('  ✓ Installed scripts/lint-memory.mjs (token budget linter)');

  // 6. Install sync script, git hooks, package scripts, and CI workflows
  await installSyncAndHooks(targetDir, detected);

  // 7. Audit line budget on existing files
  console.log('\n🧪 Auditing existing Memory Bank line budget (<150 lines per document)...');
  try {
    execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Linter notice:', e.message);
  }

  // 8. Commit upgrade to Git if requested
  if (opts.commit && detected.hasGit) {
    console.log('\n🔧 Committing memory upgrade to Git...');
    try {
      execSync('git add .agents/skills/update-memory/SKILL.md AGENTS.md scripts/ package.json .github/ 2>/dev/null || true', {
        cwd: targetDir,
        stdio: 'pipe',
      });
      execSync('git commit -m "chore(memory): upgrade Antigravity Memory Bank to v1.3 (continuous lifecycle, auto-sync hook, CI workflows)"', {
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
  console.log('   - 🔄 Continuous 2-Phase Cycle: /update-memory auto-boots the next session');
  console.log('   - ⚡ Incremental Auto-Sync: .git/hooks/post-commit automatically syncs commits');
  console.log('   - 📏 Token Budget Linter: npm run lint:memory (<150 lines/file)');
  console.log('   - 📤 Context Export: npm run memory:export (or npx ... export)');
  console.log('   - 🧹 Safe Deinstallation: npm run memory:uninstall (or npx ... uninstall)\n');
}

async function main() {
  const opts = parseCliArgs(process.argv);
  const targetDir = process.cwd();
  const detected = await detectProjectContext(targetDir);

  if (opts.command === 'export') {
    await exportMemory(targetDir, opts.exportDir);
  } else if (opts.command === 'uninstall') {
    await uninstallMemory(targetDir, opts, detected);
  } else if (opts.command === 'sync') {
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
