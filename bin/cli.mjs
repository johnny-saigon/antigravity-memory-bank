#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Consumer CLI
 * Bootstraps the Three-Tier Memory Bank or installs the plugin into any project.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  if (command === '--help' || command === '-h' || command === 'help') {
    console.log(`
Antigravity Memory Bank CLI

Usage:
  npx antigravity-memory init [options]
  npx antigravity-memory install-plugin

Options:
  --as-plugin           Install into .agents/plugins/memory-bank/ instead of root memory-bank/
  --name <project-name> Specify project name non-interactively
  -h, --help            Show this message
`);
    process.exit(0);
  }

  const asPlugin = args.includes('--as-plugin');
  const targetDir = process.cwd();

  console.log('\n🧠 Antigravity Memory Bank — Project Initializer\n');

  const rl = readline.createInterface({ input, output });

  try {
    const projectName = (await rl.question('Project Name [my-project]: ')).trim() || 'my-project';
    const tagline = (await rl.question('Tagline: ')).trim() || 'High-performance application';
    const description = (await rl.question('Short Description: ')).trim() || 'Built with Antigravity pair programming';
    const platforms = (await rl.question('Platforms (e.g. Web, iOS, Backend) [Web, API]: ')).trim() || 'Web, API';
    const frontendTech = (await rl.question('Frontend Stack [React / Next.js]: ')).trim() || 'React / Next.js';
    const backendTech = (await rl.question('Backend Stack [Fastify / Node.js]: ')).trim() || 'Fastify / Node.js';
    const databaseTech = (await rl.question('Database [PostgreSQL 16]: ')).trim() || 'PostgreSQL 16';
    const port = (await rl.question('Allocated Port [3000]: ')).trim() || '3000';
    const healthUrl = (await rl.question('Health Check URL [http://localhost:3000/health]: ')).trim() || 'http://localhost:3000/health';

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
      '{{DEPLOYMENT_TARGET}}': 'Vast.ai / Cloud VPS',
      '{{PORT}}': port,
      '{{HEALTH_URL}}': healthUrl,
      '{{DAEMON_NAME}}': projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    };

    const destRoot = asPlugin
      ? path.join(targetDir, '.agents/plugins/memory-bank')
      : targetDir;

    console.log(`\n🚀 Bootstrapping Memory Bank into: ${destRoot}`);

    // Helper to interpolate and copy templates
    async function processTemplate(srcRel, destRel) {
      const srcPath = path.join(pkgRoot, 'templates', srcRel);
      const destPath = path.join(destRoot, destRel);
      let content = await fs.readFile(srcPath, 'utf8');
      for (const [key, val] of Object.entries(replacements)) {
        content = content.replaceAll(key, val);
      }
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(destPath, content, 'utf8');
      console.log(`  ✓ Created ${destRel}`);
    }

    // Copy skills
    async function copySkill(skillName) {
      const srcSkill = path.join(pkgRoot, 'skills', skillName, 'SKILL.md');
      const destSkill = asPlugin
        ? path.join(destRoot, 'skills', skillName, 'SKILL.md')
        : path.join(targetDir, '.agents/skills', skillName, 'SKILL.md');
      let content = await fs.readFile(srcSkill, 'utf8');
      await fs.mkdir(path.dirname(destSkill), { recursive: true });
      await fs.writeFile(destSkill, content, 'utf8');
      console.log(`  ✓ Installed skill: ${skillName}`);
    }

    if (asPlugin) {
      // Copy plugin manifest and rules
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
      // Standard Brick scaffolding into project root
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

      // Copy linter into scripts/lint-memory.mjs
      const linterSrc = path.join(pkgRoot, 'scripts/lint-memory.mjs');
      const linterDest = path.join(targetDir, 'scripts/lint-memory.mjs');
      await fs.mkdir(path.dirname(linterDest), { recursive: true });
      await fs.copyFile(linterSrc, linterDest);
      console.log('  ✓ Installed scripts/lint-memory.mjs');

      // Optionally update package.json scripts if package.json exists
      const targetPkg = path.join(targetDir, 'package.json');
      try {
        const pkgData = JSON.parse(await fs.readFile(targetPkg, 'utf8'));
        pkgData.scripts = pkgData.scripts || {};
        if (!pkgData.scripts['lint:memory']) {
          pkgData.scripts['lint:memory'] = 'node scripts/lint-memory.mjs';
          await fs.writeFile(targetPkg, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');
          console.log('  ✓ Added "lint:memory" script to package.json');
        }
      } catch {
        // No package.json or invalid JSON; ignore
      }
    }

    console.log('\n✅ Antigravity Memory Bank successfully installed!');
    console.log('👉 Next step: Launch Antigravity and run /start to bootstrap your session.\n');
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Fatal error during initialization:', err);
  process.exit(1);
});
