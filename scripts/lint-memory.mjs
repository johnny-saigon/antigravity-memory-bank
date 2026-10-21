#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Line Budget Linter
 * Enforces strict < 150 lines rule on all memory-bank markdown documents.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_LINES = 150;
const targetDirs = ['memory-bank', 'templates/memory-bank'];

let totalFilesChecked = 0;
let violations = 0;

async function checkDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await checkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.md.tpl'))) {
        totalFilesChecked++;
        const content = await fs.readFile(fullPath, 'utf8');
        const lineCount = content.split('\n').length;
        const relativePath = path.relative(process.cwd(), fullPath);

        if (lineCount > MAX_LINES) {
          console.error(`❌ ${relativePath}: ${lineCount} lines (exceeds budget of ${MAX_LINES} lines)`);
          violations++;
        } else {
          console.log(`✅ ${relativePath}: ${lineCount} lines`);
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`⚠️ Error checking ${dirPath}: ${err.message}`);
    }
  }
}

console.log('\n🔍 Auditing Memory Bank line budget (< 150 lines per file)...\n');

for (const dir of targetDirs) {
  await checkDir(path.resolve(process.cwd(), dir));
}

// Template Byte-Parity Audit (FEAT-112): runs when upstream templates/ directory is present
const parityPairs = [
  ['scripts/backlog.mjs', 'templates/scripts/backlog.mjs'],
  ['scripts/sync-memory-context.mjs', 'templates/scripts/sync-memory-context.mjs'],
  ['skills/backlog-start/SKILL.md', '.agents/skills/backlog-start/SKILL.md'],
  ['skills/backlog-plan/SKILL.md', '.agents/skills/backlog-plan/SKILL.md'],
  ['docs/PLANNING_GUIDE.md', 'templates/docs/PLANNING_GUIDE.md'],
  ['docs/BACKLOG_GUIDE.md', 'templates/docs/BACKLOG_GUIDE.md']
];

let parityChecked = 0;
for (const [relA, relB] of parityPairs) {
  const fullA = path.resolve(process.cwd(), relA);
  const fullB = path.resolve(process.cwd(), relB);
  try {
    const [statA, statB] = await Promise.all([fs.stat(fullA), fs.stat(fullB)]);
    if (statA.isFile() && statB.isFile()) {
      parityChecked++;
      const [bufA, bufB] = await Promise.all([fs.readFile(fullA), fs.readFile(fullB)]);
      if (Buffer.compare(bufA, bufB) !== 0) {
        console.error(`❌ Template parity violation: ${relA} (${bufA.length}B) and ${relB} (${bufB.length}B) have diverged!`);
        violations++;
      } else {
        console.log(`✅ Template parity: ${relA} === ${relB} (${bufA.length} bytes)`);
      }
    }
  } catch {
    // Downstream consumer repositories do not have templates/ or upstream skills/
  }
}

if (totalFilesChecked === 0 && parityChecked === 0) {
  console.log('ℹ️ No markdown memory files found to audit.');
  process.exit(0);
}

console.log(`\nSummary: Checked ${totalFilesChecked} memory files${parityChecked > 0 ? ` and ${parityChecked} template parity pairs` : ''}. ${violations} violations found.\n`);

if (violations > 0) {
  console.error('❌ Memory Bank audit failed! Fix line-budget (<150 lines) or template byte-parity violations.');
  process.exit(1);
} else {
  console.log('✨ All Memory Bank files comply with the 150-line limit and template parity invariants!');
  process.exit(0);
}
