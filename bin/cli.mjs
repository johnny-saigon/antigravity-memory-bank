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

  // 6. Remove scripts/lint-memory.mjs
  try {
    await fs.rm(path.join(targetDir, 'scripts/lint-memory.mjs'), { force: true });
    console.log('  ✓ Removed scripts/lint-memory.mjs');
    const remainingScripts = await fs.readdir(path.join(targetDir, 'scripts'));
    if (remainingScripts.length === 0) {
      await fs.rm(path.join(targetDir, 'scripts'), { recursive: true, force: true });
    }
  } catch {}

  // 7. Clean package.json scripts
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    if (pkg.scripts && pkg.scripts['lint:memory']) {
      delete pkg.scripts['lint:memory'];
      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log('  ✓ Cleaned "lint:memory" from package.json scripts');
    }
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

    if (detected.hasPackageJson) {
      try {
        const pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
        pkgData.scripts = pkgData.scripts || {};
        if (!pkgData.scripts['lint:memory']) {
          pkgData.scripts['lint:memory'] = 'node scripts/lint-memory.mjs';
          await fs.writeFile(pkgPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');
          console.log('  ✓ Added "lint:memory" script to package.json');
        }
      } catch {}
    }
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
      execSync('git add AGENTS.md .agents/ memory-bank/ scripts/lint-memory.mjs package.json 2>/dev/null || true', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      execSync('git commit -m "chore(memory): bootstrap Three-Tier Memory Bank with continuous lifecycle"', {
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

async function main() {
  const opts = parseCliArgs(process.argv);
  const targetDir = process.cwd();
  const detected = await detectProjectContext(targetDir);

  if (opts.command === 'export') {
    await exportMemory(targetDir, opts.exportDir);
  } else if (opts.command === 'uninstall') {
    await uninstallMemory(targetDir, opts, detected);
  } else {
    await initMemory(targetDir, opts, detected);
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal error during Memory Bank operation:', err.message);
  process.exit(1);
});
