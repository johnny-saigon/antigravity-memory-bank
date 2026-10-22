#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Line Budget, Progressive Disclosure & Rule Frontmatter Linter
 * Enforces:
 * 1. < 150 lines per memory-bank/*.md document
 * 2. <= 50 lines on root AGENTS.md / GEMINI.md and 0 unconditional @[...](memory-bank/...) inline bloat (Token Bloat Trap)
 * 3. Valid snake_case YAML frontmatter (`trigger: model_decision` + `description`) in .agents/rules/*.md (Broken Frontmatter Trap)
 * 4. No unindexed nested subdirectories in .agents/rules/ without .agents/rules.json (Silent Discard Trap)
 * 5. Upstream template byte-parity when templates/ is present
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_LINES = 150;
const MAX_ROOT_RULE_LINES = 50;
const VALID_TRIGGERS = new Set(['model_decision', 'always_on', 'glob', 'manual']);
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

function validateRuleFrontmatter(relPath, content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    console.error(`❌ Broken Frontmatter Trap in ${relPath}: Missing YAML frontmatter (--- ... ---); Antigravity will silently discard this rule.`);
    violations++;
    return;
  }
  const fm = fmMatch[1];
  const triggerMatch = fm.match(/^trigger:\s*(\S+)/m);
  if (!triggerMatch) {
    console.error(`❌ Broken Frontmatter Trap in ${relPath}: Missing 'trigger:' field in YAML frontmatter.`);
    violations++;
    return;
  }
  const triggerVal = triggerMatch[1].trim().replace(/^['"]|['"]$/g, '');
  if (triggerVal === 'modelDecision' || triggerVal === 'alwaysOn' || !VALID_TRIGGERS.has(triggerVal)) {
    console.error(
      `❌ Broken Frontmatter Trap in ${relPath}: Invalid trigger '${triggerVal}' (must use snake_case: model_decision, always_on, glob, or manual).`
    );
    violations++;
    return;
  }
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  if (!descMatch || !descMatch[1].trim().replace(/^['"]|['"]$/g, '')) {
    console.error(`❌ Broken Frontmatter Trap in ${relPath}: Missing non-empty 'description:' field for progressive disclosure.`);
    violations++;
    return;
  }
  console.log(`✅ Rule frontmatter valid: ${relPath} (trigger: ${triggerVal})`);
}

console.log('\n🔍 Auditing Memory Bank line budget (< 150 lines), Root AGENTS.md (< 50 lines) & .agents/rules/ Discovery...\n');

for (const dir of targetDirs) {
  await checkDir(path.resolve(process.cwd(), dir));
}

// Check Root AGENTS.md / GEMINI.md for Token Bloat Trap (<= 50 lines, no @[...](memory-bank/...) inline expansion)
for (const rootRuleName of ['AGENTS.md', 'GEMINI.md', 'templates/AGENTS.md.tpl']) {
  const fullRootRule = path.resolve(process.cwd(), rootRuleName);
  if (fsSync.existsSync(fullRootRule)) {
    const content = await fs.readFile(fullRootRule, 'utf8');
    const nonEmptyLines = content.trimEnd().split('\n').length;
    if (nonEmptyLines > MAX_ROOT_RULE_LINES) {
      console.error(`❌ Token Bloat Trap in ${rootRuleName}: ${nonEmptyLines} lines (exceeds root cap of ${MAX_ROOT_RULE_LINES} lines). Move domain details into .agents/rules/ with trigger: model_decision.`);
      violations++;
    } else if (/@\[[^\]]+\]\(memory-bank\/[^)]+\)/.test(content)) {
      console.error(`❌ Token Bloat Trap in ${rootRuleName}: Contains @[...](memory-bank/...) inline expansion which injects memory-bank files on every turn. Use standard [Label](memory-bank/...) links in ${rootRuleName} and bridge via .agents/rules/memory-*.md.`);
      violations++;
    } else {
      console.log(`✅ Root directives lean: ${rootRuleName} (${nonEmptyLines}/${MAX_ROOT_RULE_LINES} lines, 0 inline @-expansions)`);
    }
  }
}

// Check .agents/rules/*.md and templates/rules/*.md.tpl for Silent Discard & Broken Frontmatter Traps
for (const rDirRel of ['.agents/rules', 'templates/rules']) {
  const rDirFull = path.resolve(process.cwd(), rDirRel);
  if (!fsSync.existsSync(rDirFull)) continue;
  const entries = await fs.readdir(rDirFull, { withFileTypes: true });
  let registeredDirs = new Set();
  const rulesJsonPath = path.resolve(process.cwd(), '.agents/rules.json');
  if (fsSync.existsSync(rulesJsonPath)) {
    try {
      const rj = JSON.parse(await fs.readFile(rulesJsonPath, 'utf8'));
      for (const e of rj.entries || []) {
        if (e && e.path) registeredDirs.add(e.path.replace(/\/+$/, ''));
      }
    } catch {}
  }

  for (const entry of entries) {
    const relEntry = `${rDirRel}/${entry.name}`;
    if (entry.isDirectory() && !entry.name.startsWith('.') && rDirRel === '.agents/rules') {
      if (!registeredDirs.has(relEntry)) {
        console.error(`❌ Silent Discard Trap: Nested directory '${relEntry}' is ignored by Antigravity unless registered in .agents/rules.json.`);
        violations++;
      }
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.md.tpl'))) {
      totalFilesChecked++;
      const content = await fs.readFile(path.join(rDirFull, entry.name), 'utf8');
      validateRuleFrontmatter(relEntry, content);
    }
  }
}

// Template Byte-Parity Audit (FEAT-112): runs when upstream templates/ directory is present
const parityPairs = [
  ['scripts/backlog.mjs', 'templates/scripts/backlog.mjs'],
  ['scripts/sync-memory-context.mjs', 'templates/scripts/sync-memory-context.mjs'],
  ['skills/start/SKILL.md', '.agents/skills/start/SKILL.md'],
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

console.log(`\nSummary: Checked ${totalFilesChecked} memory & rule files${parityChecked > 0 ? ` and ${parityChecked} template parity pairs` : ''}. ${violations} violations found.\n`);

if (violations > 0) {
  console.error('❌ Memory Bank audit failed! Fix line-budget, root AGENTS.md (<50 lines), .agents/rules/ frontmatter, or template parity violations.');
  process.exit(1);
} else {
  console.log('✨ All Memory Bank files, progressive-disclosure rules, and templates comply with all invariants!');
  process.exit(0);
}
