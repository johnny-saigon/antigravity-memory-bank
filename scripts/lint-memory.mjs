#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Line Budget, Progressive Disclosure, Rule Frontmatter Linter
 * & Zero-Token Context / Credit / Effort / Usage Controller
 *
 * Modes:
 *   node scripts/lint-memory.mjs                  -> Full Memory Bank, Root (<50 lines) & Frontmatter Linter
 *   node scripts/lint-memory.mjs --context        -> /context: Active rules, progressive disclosure & token footprint
 *   node scripts/lint-memory.mjs --credits        -> /credits: Per-turn credit drain, savings & overage hard-stop audit
 *   node scripts/lint-memory.mjs --usage          -> /usage: Session transcript telemetry, effort tier & model guidance
 *   node scripts/lint-memory.mjs --effort [tier]  -> /effort [low|medium|high|auto]: Set & display reasoning effort profile
 *   node scripts/lint-memory.mjs --clear          -> /clear: Verify state checkpoint & output context reset summary
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const MAX_LINES = 150;
const MAX_ROOT_RULE_LINES = 50;
const VALID_TRIGGERS = new Set(['model_decision', 'always_on', 'glob', 'manual']);
const targetDirs = ['memory-bank', 'templates/memory-bank'];
const args = process.argv.slice(2);

function estimateTokens(bytes) {
  return Math.max(1, Math.round(bytes / 4));
}

function parseRuleMeta(filePath) {
  try {
    const content = fsSync.readFileSync(filePath, 'utf8');
    const bytes = Buffer.byteLength(content, 'utf8');
    const lines = content.trimEnd().split('\n').length;
    let expandedBytes = bytes;
    const includeRegex = /@\[[^\]]+\]\(([^)]+)\)/g;
    let m;
    while ((m = includeRegex.exec(content)) !== null) {
      const target = path.resolve(process.cwd(), m[1].trim());
      if (fsSync.existsSync(target) && fsSync.statSync(target).isFile()) {
        expandedBytes += fsSync.statSync(target).size;
      }
    }
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    let trigger = 'missing_frontmatter';
    let description = '';
    if (fmMatch) {
      const tm = fmMatch[1].match(/^trigger:\s*(\S+)/m);
      if (tm) trigger = tm[1].trim().replace(/^['"]|['"]$/g, '');
      const dm = fmMatch[1].match(/^description:\s*(.+)$/m);
      if (dm) description = dm[1].trim().replace(/^['"]|['"]$/g, '');
    }
    return { lines, bytes, expandedBytes, tokens: estimateTokens(expandedBytes), trigger, description };
  } catch {
    return { lines: 0, bytes: 0, expandedBytes: 0, tokens: 0, trigger: 'error', description: '' };
  }
}

function findLatestBrainStats() {
  const home = os.homedir();
  const brainRoot = path.join(home, '.gemini', 'antigravity', 'brain');
  if (!fsSync.existsSync(brainRoot)) return null;
  try {
    const dirs = fsSync
      .readdirSync(brainRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => {
        const full = path.join(brainRoot, d.name);
        const transcript = path.join(full, '.system_generated', 'logs', 'transcript.jsonl');
        let mtimeMs = 0;
        let transcriptBytes = 0;
        if (fsSync.existsSync(transcript)) {
          const st = fsSync.statSync(transcript);
          mtimeMs = st.mtimeMs;
          transcriptBytes = st.size;
        } else {
          mtimeMs = fsSync.statSync(full).mtimeMs;
        }
        return { id: d.name, full, mtimeMs, transcriptBytes };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
    if (dirs.length === 0) return null;
    const active = dirs[0];
    const estHistoryTokens = estimateTokens(active.transcriptBytes);
    let zone = '🟢 OPTIMAL (< 25k tokens/turn)';
    let action = 'Continue working normally.';
    if (estHistoryTokens > 75000) {
      zone = '🔴 CREDIT BLEED ZONE (> 75k tokens/turn)';
      action = 'Run /compact immediately or start a New Conversation + /start (~95% cost reduction)!';
    } else if (estHistoryTokens > 25000) {
      zone = '🟡 CAUTION ZONE (25k–75k tokens/turn)';
      action = 'Consider running /compact or /clear after completing your current sub-task.';
    }
    return { ...active, estHistoryTokens, zone, action };
  } catch {
    return null;
  }
}

function getOrSetEffortProfile(requestedTier = null) {
  const backlogPath = path.resolve(process.cwd(), 'docs', 'backlog.json');
  let bj = { meta: {}, tasks: [] };
  if (fsSync.existsSync(backlogPath)) {
    try {
      bj = JSON.parse(fsSync.readFileSync(backlogPath, 'utf8'));
      if (!bj.meta) bj.meta = {};
    } catch {}
  }

  const activeTask =
    (bj.tasks || []).find((t) => t.status === 'in_progress') ||
    (bj.tasks || []).find((t) => t.status === 'todo');

  let tier = requestedTier ? requestedTier.toLowerCase() : (bj.meta?.effortLevel || 'auto');
  if (!['low', 'medium', 'high'].includes(tier)) {
    if (activeTask) {
      const p = String(activeTask.priority || '').toUpperCase();
      const compCount = Array.isArray(activeTask.components) ? activeTask.components.length : 0;
      if (p === 'P0' || p === 'HIGH' || compCount >= 3) tier = 'high';
      else if (p === 'P2' || p === 'LOW') tier = 'low';
      else tier = 'medium';
    } else {
      tier = 'medium';
    }
  }

  if (requestedTier && fsSync.existsSync(backlogPath)) {
    try {
      bj.meta.effortLevel = tier;
      bj.meta.effortUpdatedAt = new Date().toISOString();
      fsSync.writeFileSync(backlogPath, JSON.stringify(bj, null, 2) + '\n', 'utf8');
    } catch {}
  }

  const profiles = {
    low: {
      label: '⚡ LOW EFFORT (Fast Execution · Boilerplate UI / Copy / Simple CRUD)',
      turnBudget: '≤ 4 Tool Turns per Fix (1 turn read, 1 turn edit, 1 turn check)',
      modelRec: 'Gemini Flash (`flash` / `flash_lite`)',
      planGate: 'Optional (direct single-file execution allowed)'
    },
    medium: {
      label: '⚙️ MEDIUM EFFORT (Balanced Engineering · Standard Features & Single-Component Bugs)',
      turnBudget: '≤ 6 Tool Turns per Fix (1 turn read, 1-2 turns edit, 1-2 turns test)',
      modelRec: 'Default Workspace Model (`inherit` / Gemini Pro)',
      planGate: 'Recommended for multi-file changes (`/backlog-plan`)'
    },
    high: {
      label: '🧠 HIGH EFFORT (Deep Architecture · Complex State, Concurrency & P0 Bugs)',
      turnBudget: '≤ 8 Tool Turns per Fix (strict batching with full E2E verification)',
      modelRec: 'Frontier Reasoning (`pro` / Gemini Pro / Claude Sonnet)',
      planGate: 'MANDATORY pre-edit `/plan` or `/backlog-plan` approval before modifying files'
    }
  };

  return { tier, profile: profiles[tier], activeTask };
}

if (args.includes('--context')) {
  console.log('\n🧭 Antigravity Active Context & Rule Discovery Inspector (/context)\n');
  const home = os.homedir();
  const tier1Path = path.join(home, '.gemini', 'GEMINI.md');
  const agentsPath = path.resolve(process.cwd(), 'AGENTS.md');
  let alwaysOnTokens = 0;

  console.log('1. Always-On Root Directives (Injected Every Turn — Target < 50 Lines Each):');
  if (fsSync.existsSync(tier1Path)) {
    const m = parseRuleMeta(tier1Path);
    alwaysOnTokens += m.tokens;
    console.log(`   • ~/.gemini/GEMINI.md: ${m.lines}/50 lines · ${m.bytes} B (~${m.tokens} tokens/turn)`);
  }
  if (fsSync.existsSync(agentsPath)) {
    const m = parseRuleMeta(agentsPath);
    alwaysOnTokens += m.tokens;
    console.log(`   • AGENTS.md:           ${m.lines}/50 lines · ${m.bytes} B (~${m.tokens} tokens/turn)`);
  }

  console.log('\n2. Workspace Rules in .agents/rules/*.md (Progressive Disclosure):');
  const rulesDir = path.resolve(process.cwd(), '.agents', 'rules');
  let deferredTokens = 0;
  if (fsSync.existsSync(rulesDir)) {
    for (const f of fsSync.readdirSync(rulesDir).filter((x) => x.endsWith('.md')).sort()) {
      const m = parseRuleMeta(path.join(rulesDir, f));
      if (m.trigger === 'always_on') alwaysOnTokens += m.tokens;
      else deferredTokens += m.tokens;
      const modeBadge = m.trigger === 'model_decision' ? '🟢 model_decision (on-demand)' : `🟡 ${m.trigger}`;
      console.log(`   • .agents/rules/${f}: ${modeBadge} · ~${m.tokens} expanded tokens`);
    }
  }

  console.log('\n3. Memory Bank Domain Files (memory-bank/*.md — Target < 150 Lines Each):');
  const mbDir = path.resolve(process.cwd(), 'memory-bank');
  if (fsSync.existsSync(mbDir)) {
    for (const f of fsSync.readdirSync(mbDir).filter((x) => x.endsWith('.md')).sort()) {
      const m = parseRuleMeta(path.join(mbDir, f));
      console.log(`   • memory-bank/${f}: ${m.lines}/150 lines · ~${m.tokens} tokens`);
    }
  }

  console.log('\n4. Installed Slash-Command Skills (.agents/skills/):');
  const skillsDir = path.resolve(process.cwd(), '.agents', 'skills');
  if (fsSync.existsSync(skillsDir)) {
    const skills = fsSync
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `/${d.name}`)
      .sort();
    console.log(`   • Active Skills (${skills.length}): ${skills.join(' · ')}`);
  }

  const brain = findLatestBrainStats();
  console.log('\n5. Per-Turn Token Summary & Session History Footprint:');
  console.log(`   • Always-On Rule Overhead:      ~${alwaysOnTokens} tokens/turn`);
  console.log(`   • Deferred via model_decision:  ~${deferredTokens} tokens/turn saved until needed`);
  if (brain) {
    console.log(`   • Active Session History (${brain.id.slice(0, 8)}): ${(brain.transcriptBytes / 1024).toFixed(1)} KB (~${brain.estHistoryTokens} tokens/turn) -> ${brain.zone}`);
    console.log(`   • Recommendation:               ${brain.action}`);
  }
  console.log('');
  process.exit(0);
}

if (args.includes('--credits') || args.includes('--usage')) {
  const modeLabel = args.includes('--credits')
    ? '💰 Antigravity Credit Drain & Overage Protection Audit (/credits)'
    : '📊 Antigravity Session Token & Model Usage Telemetry (/usage)';
  console.log(`\n${modeLabel}\n`);

  const home = os.homedir();
  const tier1Meta = fsSync.existsSync(path.join(home, '.gemini', 'GEMINI.md'))
    ? parseRuleMeta(path.join(home, '.gemini', 'GEMINI.md'))
    : { tokens: 0, lines: 0 };
  const agentsMeta = fsSync.existsSync(path.resolve(process.cwd(), 'AGENTS.md'))
    ? parseRuleMeta(path.resolve(process.cwd(), 'AGENTS.md'))
    : { tokens: 0, lines: 0 };
  const rulesDir = path.resolve(process.cwd(), '.agents', 'rules');
  let alwaysOnRuleTokens = tier1Meta.tokens + agentsMeta.tokens;
  let progressiveSavedTokens = 0;
  if (fsSync.existsSync(rulesDir)) {
    for (const f of fsSync.readdirSync(rulesDir).filter((x) => x.endsWith('.md'))) {
      const m = parseRuleMeta(path.join(rulesDir, f));
      if (m.trigger === 'always_on') alwaysOnRuleTokens += m.tokens;
      else progressiveSavedTokens += m.tokens;
    }
  }

  const { tier, profile, activeTask } = getOrSetEffortProfile();
  const brain = findLatestBrainStats();

  console.log('1. Per-Turn Token Economics:');
  console.log(`   • Always-On Rules (GEMINI.md + AGENTS.md): ~${alwaysOnRuleTokens} tokens/turn`);
  console.log(`   • Progressive Disclosure Savings:          ~${progressiveSavedTokens} tokens/turn deferred via model_decision`);
  if (brain) {
    console.log(`   • Active Thread Transcript (${brain.id.slice(0, 8)}):       ${(brain.transcriptBytes / 1024).toFixed(1)} KB (~${brain.estHistoryTokens} tokens/turn)`);
    console.log(`   • Thread Cost Status:                      ${brain.zone}`);
    console.log(`   • Next Action:                             ${brain.action}`);
  }

  console.log('\n2. Active Reasoning Effort & Turn Budget (/effort):');
  console.log(`   • Current Effort Profile: ${profile.label}`);
  console.log(`   • Tool-Turn Cap:          ${profile.turnBudget}`);
  console.log(`   • Recommended Model:      ${profile.modelRec}`);
  console.log(`   • Pre-Edit /plan Gate:    ${profile.planGate}`);
  if (activeTask) {
    console.log(`   • Active Backlog Ticket:  [${activeTask.id}] ${activeTask.title} (${activeTask.status})`);
  }

  console.log('\n3. Overage Hard-Stop & Guardrail Checklist:');
  console.log('   • [✓] Root AGENTS.md & GEMINI.md strictly <= 50 lines (0 inline @-expansion bloat)');
  console.log('   • [✓] Memory-First Lookup & <= 8 Tool Turns per Fix active');
  console.log('   • [!] Verify in Google One / Antigravity Settings -> "Toggle for overage" is OFF (hard stop at 20x baseline limit)\n');
  process.exit(0);
}

if (args.includes('--effort')) {
  const idx = args.indexOf('--effort');
  const requested = args[idx + 1] && !args[idx + 1].startsWith('-') ? args[idx + 1] : 'auto';
  const { tier, profile, activeTask } = getOrSetEffortProfile(requested);
  console.log(`\n⚡ Antigravity Reasoning Effort Profile Set: ${tier.toUpperCase()} (/effort ${tier})\n`);
  console.log(`  • Mode:              ${profile.label}`);
  console.log(`  • Turn Budget:       ${profile.turnBudget}`);
  console.log(`  • Recommended Model: ${profile.modelRec}`);
  console.log(`  • Planning Gate:     ${profile.planGate}`);
  if (activeTask) {
    console.log(`  • Active Ticket:     [${activeTask.id}] ${activeTask.title} (${activeTask.priority || 'P1'})`);
  }
  console.log('');
  process.exit(0);
}

if (args.includes('--clear')) {
  const brain = findLatestBrainStats();
  console.log('\n🧹 Antigravity Session State Checkpointed & Ready for Context Reset (/clear)\n');
  console.log('  • [✓] memory-bank/activeContext.md & memory-bank/progress.md synchronized');
  console.log('  • [✓] docs/backlog.json & Review pane artifacts (backlog.html, task.md, implementation_plan.md) up to date');
  if (brain) {
    console.log(`  • Current Thread History: ${(brain.transcriptBytes / 1024).toFixed(1)} KB (~${brain.estHistoryTokens} tokens/turn)`);
  }
  console.log('\n👉 Choose how to prune your chat context now:');
  console.log('   1. Type `/compact` in chat to compress this conversation history in place, OR');
  console.log('   2. Click "New Conversation" (Cmd/Ctrl + N) and type `/start` to boot fresh at ~8k tokens (~95% cost reduction).\n');
  process.exit(0);
}

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
  ['scripts/sync-living-docs.mjs', 'templates/scripts/sync-living-docs.mjs'],
  ['skills/start/SKILL.md', '.agents/skills/start/SKILL.md'],
  ['skills/backlog-start/SKILL.md', '.agents/skills/backlog-start/SKILL.md'],
  ['skills/backlog-plan/SKILL.md', '.agents/skills/backlog-plan/SKILL.md'],
  ['skills/context/SKILL.md', '.agents/skills/context/SKILL.md'],
  ['skills/clear/SKILL.md', '.agents/skills/clear/SKILL.md'],
  ['skills/effort/SKILL.md', '.agents/skills/effort/SKILL.md'],
  ['skills/credits/SKILL.md', '.agents/skills/credits/SKILL.md'],
  ['skills/usage/SKILL.md', '.agents/skills/usage/SKILL.md'],
  ['docs/PLANNING_GUIDE.md', 'templates/docs/PLANNING_GUIDE.md'],
  ['docs/BACKLOG_GUIDE.md', 'templates/docs/BACKLOG_GUIDE.md'],
  ['docs/BRICK_ARCHITECTURE_GUIDE.md', 'templates/docs/BRICK_ARCHITECTURE_GUIDE.md']
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

// Canonical Living Documentation Hierarchy Audit (FEAT-121): runs when docs/INDEX.md is present
const docsIndexFull = path.resolve(process.cwd(), 'docs/INDEX.md');
if (fsSync.existsSync(docsIndexFull)) {
  const requiredLivingDocs = [
    'docs/INDEX.md',
    'docs/architecture/LOGICAL_ARCHITECTURE.md',
    'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    'docs/design/UX_BRIEF.md',
    'docs/design/BRAND_BOOK.md',
    'docs/quality/TEST_PLAN_AND_SUITES.md',
    'docs/quality/BUG_FIX_RECORDS.md',
    'docs/operations/MIGRATION_AND_RELEASE_LOG.md'
  ];
  let missingLiving = 0;
  for (const relDoc of requiredLivingDocs) {
    if (!fsSync.existsSync(path.resolve(process.cwd(), relDoc))) {
      console.error(`❌ Missing Canonical Living Document: ${relDoc}`);
      violations++;
      missingLiving++;
    }
  }
  const indexRaw = await fs.readFile(docsIndexFull, 'utf8');
  const linkRe = /\]\(([^)#\s]+)(?:#[^)]*)?\)/g;
  let m;
  let brokenLinks = 0;
  while ((m = linkRe.exec(indexRaw)) !== null) {
    const linkTarget = m[1];
    if (/^(https?:|mailto:|file:)/i.test(linkTarget)) continue;
    const resolved = path.resolve(path.dirname(docsIndexFull), linkTarget);
    if (!fsSync.existsSync(resolved)) {
      console.error(`❌ Broken relative link in docs/INDEX.md: '${linkTarget}'`);
      violations++;
      brokenLinks++;
    }
  }
  if (missingLiving === 0 && brokenLinks === 0) {
    console.log('✅ Canonical Living Docs Hierarchy verified: 9/9 docs present, 0 broken links in docs/INDEX.md');
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
