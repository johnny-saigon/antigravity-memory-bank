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

if (totalFilesChecked === 0) {
  console.log('ℹ️ No markdown memory files found to audit.');
  process.exit(0);
}

console.log(`\nSummary: Checked ${totalFilesChecked} files. ${violations} violations found.\n`);

if (violations > 0) {
  console.error('❌ Memory Bank line budget violated! Split large domain files into linked sub-files using @[Name](path.md).');
  process.exit(1);
} else {
  console.log('✨ All Memory Bank files comply with the 150-line limit!');
  process.exit(0);
}
