#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Project Initializer & Consumer CLI
 * Bootstraps the Three-Tier Memory Bank into existing or new repositories on the fly.
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
      options.command = a;
      if (a === 'install-plugin') options.asPlugin = true;
    } else if (a === '--as-plugin') {
      options.asPlugin = true;
    } else if (a === '-y' || a === '--yes' || a === '--non-interactive') {
      options.yes = true;
    } else if (a === '--commit') {
      options.commit = true;
    } else if (a === '--force') {
      options.force = true;
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

Usage:
  npx antigravity-memory init [options]
  npx github:johnny-saigon/antigravity-memory-bank init [options]

Options:
  -y, --yes, --non-interactive  Run headless on the fly using auto-detected defaults
  --as-plugin                   Install as Antigravity Plugin (.agents/plugins/memory-bank/)
  --commit                      Automatically git add and commit initialized memory bank
  --force                       Overwrite existing memory files if already present
  --name <project-name>         Override project name
  --tagline <tagline>           Override tagline
  --desc <description>          Override short description
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

  // 1. Detect package.json
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

    // Detect frontend
    if (allDeps['next']) detected.frontend = 'Next.js (React)';
    else if (allDeps['expo'] || allDeps['react-native']) detected.frontend = 'Expo & React Native';
    else if (allDeps['vue']) detected.frontend = 'Vue.js';
    else if (allDeps['svelte'] || allDeps['@sveltejs/kit']) detected.frontend = 'SvelteKit';
    else if (allDeps['react']) detected.frontend = 'React (Vite)';

    // Detect backend
    if (allDeps['fastify']) detected.backend = 'Fastify (Node.js)';
    else if (allDeps['express']) detected.backend = 'Express (Node.js)';
    else if (allDeps['@nestjs/core']) detected.backend = 'NestJS';
    else if (allDeps['koa']) detected.backend = 'Koa (Node.js)';
    else if (allDeps['hono']) detected.backend = 'Hono';

    // Detect database
    if (allDeps['@prisma/client'] || allDeps['prisma']) detected.db = 'PostgreSQL (Prisma ORM)';
    else if (allDeps['drizzle-orm']) detected.db = 'PostgreSQL (Drizzle ORM)';
    else if (allDeps['pg']) detected.db = 'PostgreSQL 16';
    else if (allDeps['mongoose'] || allDeps['mongodb']) detected.db = 'MongoDB';
    else if (allDeps['mysql2']) detected.db = 'MySQL 8';
    else if (allDeps['better-sqlite3'] || allDeps['sqlite3']) detected.db = 'SQLite';

    // Detect platforms
    if (allDeps['react-native'] || allDeps['expo']) {
      detected.platforms = 'Native iOS, Android & Web';
    } else if (allDeps['next'] || allDeps['react']) {
      detected.platforms = 'Responsive Web & REST API';
    }
  } catch {
    // No package.json or invalid JSON
  }

  // 2. Detect Git config & remote
  const gitConfigPath = path.join(targetDir, '.git', 'config');
  try {
    const gitConf = await fs.readFile(gitConfigPath, 'utf8');
    detected.hasGit = true;
    const remoteMatch = gitConf.match(/url\s*=\s*.*github\.com[:/]([^/\s]+)\/([^/\s\.]+)(?:\.git)?/i);
    if (remoteMatch) {
      const repoName = remoteMatch[2];
      if (!detected.hasPackageJson && repoName) {
        detected.name = repoName;
      }
    }
  } catch {
    // No .git config
  }

  // 3. Detect existing Memory Bank
  try {
    const mbStat = await fs.stat(path.join(targetDir, 'memory-bank'));
    if (mbStat.isDirectory()) detected.memoryBankExists = true;
  } catch {}

  try {
    const agentsStat = await fs.stat(path.join(targetDir, 'AGENTS.md'));
    if (agentsStat.isFile()) detected.agentsMdExists = true;
  } catch {}

  // 4. Detect Port from .env
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

async function main() {
  const opts = parseCliArgs(process.argv);
  const targetDir = process.cwd();
  const detected = await detectProjectContext(targetDir);

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
        // File already exists
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
    // Option A: Workspace Brick scaffolding
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

    // Install memory linter script
    const linterSrc = path.join(pkgRoot, 'scripts/lint-memory.mjs');
    const linterDest = path.join(targetDir, 'scripts/lint-memory.mjs');
    await fs.mkdir(path.dirname(linterDest), { recursive: true });
    await fs.copyFile(linterSrc, linterDest);
    await fs.chmod(linterDest, 0o755);
    console.log('  ✓ Installed scripts/lint-memory.mjs');

    // Update package.json scripts if package.json exists
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

  // Run token line budget audit
  console.log('\n🧪 Auditing Memory Bank line budget (<150 lines per document)...');
  try {
    execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Linter notice:', e.message);
  }

  // Git Commit if requested or auto-commit enabled
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
    } catch (e) {
      console.log('  ℹ️ Working tree clean or changes already staged.');
    }
  }

  console.log('\n✅ Antigravity Memory Bank successfully activated on the fly!');
  console.log('⚡ Immediate In-Window Activation:');
  console.log('   Because workspace skills and directives are dynamically ingested,');
  console.log('   you can type /start right now in this Antigravity window with ZERO restart!\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error during Memory Bank initialization:', err.message);
  process.exit(1);
});
