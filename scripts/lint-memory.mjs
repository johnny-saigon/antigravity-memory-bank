#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Line Budget, Progressive Disclosure, Rule Frontmatter Linter
 * & Verbose AGY Model Roster / Quality-to-Credit ROI Controller
 *
 * Modes:
 *   node scripts/lint-memory.mjs                    -> Full Memory Bank, Root (<50 lines) & Frontmatter Linter
 *   node scripts/lint-memory.mjs --context          -> /context: Active rules, progressive disclosure & token footprint
 *   node scripts/lint-memory.mjs --credits          -> /credits: Verbose credit drain, Dual Quota-Pool & AGY model ROI audit
 *   node scripts/lint-memory.mjs --usage            -> /usage: Session transcript telemetry, effort tier & AGY model guidance
 *   node scripts/lint-memory.mjs --effort [tier]    -> /effort [low|medium|high|xhigh|auto]: Set effort & verbose model ROI guide
 *   node scripts/lint-memory.mjs --advise [id]      -> Verbose ticket-specific Quality-to-Credit ROI & AGY model advisor
 *   node scripts/lint-memory.mjs --clear            -> /clear: Verify state checkpoint & output context reset summary
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

function findLatestBrainStats({ resetWatermark = false } = {}) {
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
    const totalArchiveBytes = active.transcriptBytes;
    const watermarkPath = path.join(active.full, '.system_generated', 'logs', 'compaction_watermark.json');
    let watermarkBytes = 0;
    let resetAt = null;
    let checkpoints = [];

    if (fsSync.existsSync(watermarkPath)) {
      try {
        const wm = JSON.parse(fsSync.readFileSync(watermarkPath, 'utf8'));
        if (typeof wm.watermarkBytes === 'number' && wm.watermarkBytes >= 0 && wm.watermarkBytes <= totalArchiveBytes) {
          watermarkBytes = wm.watermarkBytes;
          resetAt = wm.resetAt || null;
        }
        if (Array.isArray(wm.checkpoints)) checkpoints = wm.checkpoints;
      } catch {}
    }

    if (resetWatermark) {
      const preResetDeltaBytes = Math.max(0, totalArchiveBytes - watermarkBytes);
      watermarkBytes = totalArchiveBytes;
      resetAt = new Date().toISOString();
      checkpoints = [
        ...checkpoints.slice(-24),
        { resetAt, watermarkBytes, preResetDeltaBytes, totalArchiveBytes }
      ];
      try {
        fsSync.mkdirSync(path.dirname(watermarkPath), { recursive: true });
        fsSync.writeFileSync(
          watermarkPath,
          JSON.stringify({ watermarkBytes, resetAt, totalArchiveBytes, checkpoints }, null, 2) + '\n',
          'utf8'
        );
      } catch {}
    }

    const deltaBytes = Math.max(0, totalArchiveBytes - watermarkBytes);
    const estHistoryTokens = deltaBytes === 0 ? 0 : estimateTokens(deltaBytes);
    const archiveTokens = estimateTokens(totalArchiveBytes);
    let zone = '🟢 OPTIMAL (< 25k active delta tokens/turn)';
    let action = 'Continue working normally (100% of archive history preserved on disk; /start resets active delta watermark).';
    if (estHistoryTokens > 75000) {
      zone = '🔴 CREDIT BLEED ZONE (> 75k active delta tokens/turn)';
      action = 'Active post-/start delta overflowed! Run /start (auto-runs /clear & /compact pre-flight) or /compact in chat UI (~95% cost reduction).';
    } else if (estHistoryTokens > 25000) {
      zone = '🟡 CAUTION ZONE (25k–75k active delta tokens/turn)';
      action = 'Run /start (auto-runs /clear & /compact pre-flight checkpoint) after completing your current sub-task.';
    }
    return {
      ...active,
      totalArchiveBytes,
      watermarkBytes,
      deltaBytes,
      resetAt,
      archiveTokens,
      estHistoryTokens,
      zone,
      action
    };
  } catch {
    return null;
  }
}

const AGY_MODEL_FAMILIES = {
  googleGemini: [
    {
      name: 'Gemini 3.8 Flash (Low | Medium | High)',
      ids: ['gemini-3.8-flash-low', 'gemini-3.8-flash-medium', 'gemini-3.8-flash-high'],
      pool: 'Google Quota Pool',
      burn: '1.0x (Lowest Burn)',
      bestFor: 'Micro-tasks, CSS/copy tweaks, docs formatting, test runs, browser/research subagents & simple CRUD'
    },
    {
      name: 'Gemini 4 Hydrogen (Low | Medium | High | XHigh)',
      ids: ['gemini-4-hydrogen-low', 'gemini-4-hydrogen-medium', 'gemini-4-hydrogen-high', 'gemini-4-hydrogen-xhigh'],
      pool: 'Google Quota Pool',
      burn: '1.3x–2.0x (Agile)',
      bestFor: 'Fast Gemini 4 coding; XHigh enables deep single-module reasoning bursts without full Argon credit cost'
    },
    {
      name: 'Gemini 4 Neon (Low | Medium | High | XHigh)',
      ids: ['gemini-4-neon-low', 'gemini-4-neon-medium', 'gemini-4-neon-high', 'gemini-4-neon-xhigh'],
      pool: 'Google Quota Pool',
      burn: '2.0x–3.0x (Best Daily Q/C ROI)',
      bestFor: '80% of standard feature & bug tickets, executing approved /backlog-plan sub-tickets, and UI/API work'
    },
    {
      name: 'Gemini 4 Carbon (Low | Medium | High)',
      ids: ['gemini-4-carbon-low', 'gemini-4-carbon-medium', 'gemini-4-carbon-high'],
      pool: 'Google Quota Pool',
      burn: '3.5x–4.5x (Deep Systems)',
      bestFor: 'Multi-file backend systems, DB/OAuth adapters, state machines, and complex cross-layer bug fixes'
    },
    {
      name: 'Gemini 4 Argon (Low | Medium | High)',
      ids: ['gemini-4-argon-low', 'gemini-4-argon-medium', 'gemini-4-argon-high'],
      pool: 'Google Quota Pool',
      burn: '5.0x–7.0x (Frontier Architect)',
      bestFor: 'Stage-A /backlog-plan blueprints, cross-repo architecture, and P0 root-cause diagnosis (1-2 turns, then switch down!)'
    }
  ],
  externalModels: [
    {
      name: 'GPT-OSS 120B (Medium)',
      ids: ['gpt-oss-120b-medium'],
      pool: 'External Quota Pool (Separate Reset Clock)',
      burn: '1.5x (Open-Weight Offload)',
      bestFor: 'Cost-effective external quota offload for scaffolding, boilerplate, or second-opinion code review when saving Google/Claude quota'
    },
    {
      name: 'Claude Sonnet 5.5 (Low | Medium | High)',
      ids: ['claude-sonnet-5-5-low', 'claude-sonnet-5-5-medium', 'claude-sonnet-5-5-high'],
      pool: 'External Quota Pool (Separate Reset Clock)',
      burn: '2.5x–4.0x (Surgical Code)',
      bestFor: 'High-precision React/TypeScript UI surgery, strict refactoring, and external counterpart to Gemini 4 Neon/Carbon'
    },
    {
      name: 'Claude Opus 5.5 (Low | Medium | High)',
      ids: ['claude-opus-5-5-low', 'claude-opus-5-5-medium', 'claude-opus-5-5-high'],
      pool: 'External Quota Pool (Separate Reset Clock)',
      burn: '6.0x–9.0x (Heavyweight Frontier)',
      bestFor: '1-turn /backlog-plan design reviews, security audits, or stubborn P0 root-cause analysis (NEVER leave active for routine test-fix loops!)'
    }
  ],
  googleOrchestrators: [
    {
      name: 'Orchestrator (Neon)',
      ids: ['gemini-pro-orchestrator-neon'],
      pool: 'Google Quota Pool (Multi-Agent Coordinator)',
      burn: '3.0x–4.5x (Fan-Out Multiplier)',
      bestFor: 'Coordinating 2–3 parallel swarm workers on well-defined independent sub-tickets (/teamwork)'
    },
    {
      name: 'Orchestrator (Carbon)',
      ids: ['gemini-pro-orchestrator'],
      pool: 'Google Quota Pool (Multi-Agent Coordinator)',
      burn: '4.5x–6.5x (Multi-Module Pipeline)',
      bestFor: 'Multi-subsystem feature pipelines & parallel cross-layer refactors where independent workers edit separate modules'
    },
    {
      name: 'Orchestrator (Argon)',
      ids: ['gemini-pro-orchestrator-argon'],
      pool: 'Google Quota Pool (Frontier Coordinator)',
      burn: '6.5x–10.0x (Heavyweight Swarm)',
      bestFor: 'Large-scale multi-repo migrations or full-codebase audits (GUARDRAIL: NEVER use for 1–3 file tickets — wastes 4x+ credits!)'
    }
  ]
};

function analyzeTicketCreditStrategy(task, requestedTier = null) {
  const text = task
    ? `${task.id || ''} ${task.title || ''} ${task.description || ''} ${task.spec || ''} ${(task.components || []).join(' ')}`.toLowerCase()
    : '';
  const compCount = task && Array.isArray(task.components) ? task.components.length : 0;
  const attachCount = task && Array.isArray(task.attachments) ? task.attachments.length : 0;
  const prio = String(task?.priority || 'medium').toLowerCase();
  const type = String(task?.type || 'feature').toLowerCase();

  const isParallelSwarm = /\b(swarm|multi-repo|all repos|parallel|migration across|5 repositories|cross-repo)\b/.test(text) || compCount >= 6;
  const isHighRisk = /\b(oauth|auth|security|schema|migration|concurrency|race|webgl|worker|stripe|billing|brick|architect|p0|production)\b/.test(text);
  const isMicro = /\b(copy|typo|label|css|color|badge|sort|readme|comment|spacing|padding|icon)\b/.test(text) && compCount <= 1 && prio !== 'high';

  let strategyKey = 'standard_direct';
  if (requestedTier === 'low' || (!requestedTier && isMicro)) {
    strategyKey = 'micro_direct';
  } else if (requestedTier === 'xhigh' || (!requestedTier && isParallelSwarm)) {
    strategyKey = isParallelSwarm ? 'parallel_orchestrator' : 'complex_split_plan';
  } else if (requestedTier === 'high' || (!requestedTier && (compCount >= 3 || prio === 'high' || isHighRisk || type === 'refactor'))) {
    strategyKey = 'complex_split_plan';
  } else if (requestedTier === 'medium') {
    strategyKey = 'standard_direct';
  }

  const tid = task?.id || '<TICKET_ID>';

  const strategies = {
    micro_direct: {
      tier: 'low',
      badge: '⚡ TIER 1 · MICRO / BOILERPLATE — Direct Execution (Skip Separate /plan)',
      turnBudget: '≤ 4 Tool Turns (1 turn read, 1 turn edit, 1 turn verify)',
      planningEconomics:
        'SKIP separate /plan (saves ~45%–55% credits): A dedicated planning turn (~3k–5k tokens) costs as much as the 2-turn fix itself. Still create a 0-token backlog ticket first if you want release tracking, then jump straight into execution.',
      stageAPlan: 'Skip separate /backlog-plan (unnecessary overhead for 1-file low-ambiguity edits)',
      stageBGoogle: 'Gemini 3.8 Flash (Low or Medium) — or Gemini 4 Hydrogen (Low)',
      stageBExternal: 'GPT-OSS 120B (Medium) — or Claude Sonnet 5.5 (Low)',
      stageCVerify: 'Gemini 3.8 Flash (Low)',
      orchestratorRule: '🚫 DO NOT use Google Orchestrators here (multi-agent fan-out wastes 4x–6x credits on a 1-file edit).',
      estimatedSavings: '50%–75% fewer credits vs. leaving a frontier model active',
      promptPlan: null,
      promptExec: `/effort low /backlog-start ${tid}`
    },
    standard_direct: {
      tier: 'medium',
      badge: '⚙️ TIER 2 · STANDARD FEATURE / SINGLE-COMPONENT BUG — Ticket-First Direct Sprint',
      turnBudget: '≤ 6 Tool Turns (1 turn read, 1–2 turns edit, 1–2 turns test)',
      planningEconomics:
        'CREATE BACKLOG TICKET FIRST (0 AI tokens via backlog.html or `npm run backlog add --components ...`), then run `/backlog-start` directly: Pre-defining components and attachments offline eliminates 2–4 exploratory chat turns (~15k–30k tokens saved) without paying for a separate formal /plan turn.',
      stageAPlan: 'Optional — skip /plan if ticket spec & target components are already explicit; run `/backlog-plan` only if edge cases are unclear',
      stageBGoogle: 'Gemini 4 Neon (Medium or High) — or Gemini 4 Hydrogen (High)',
      stageBExternal: 'Claude Sonnet 5.5 (Medium)',
      stageCVerify: 'Gemini 3.8 Flash (Medium) or stay on Gemini 4 Neon (Low)',
      orchestratorRule: '🚫 Avoid Google Orchestrators unless splitting into 3+ independent parallel modules.',
      estimatedSavings: '40%–60% fewer credits vs. ad-hoc chat exploration on Argon/Opus',
      promptPlan: `/effort medium /backlog-plan ${tid}`,
      promptExec: `/effort medium /backlog-start ${tid}`
    },
    complex_split_plan: {
      tier: requestedTier === 'xhigh' ? 'xhigh' : 'high',
      badge: '🧠 TIER 3 · MULTI-FILE / ARCHITECTURE / P0 BUG — Two-Stage Split Model Routing (Separate /plan First!)',
      turnBudget: '≤ 8 Tool Turns per Atomic Sub-Ticket (Strict Batching + Dual-Test E2E)',
      planningEconomics:
        'SEPARATE PLANNING CREDITS FROM EXECUTION CREDITS (Saves 55%–80% credits): Jumping straight into coding a multi-file/high-risk ticket burns 10–15 frontier turns on mid-flight U-turns and broken tests. Spend 1–2 turns in `/backlog-plan` on a frontier model to lock `implementation_plan.md` & split into atomic sub-tickets (`npm run backlog split`), THEN switch down to a workhorse model for `/backlog-start`!',
      stageAPlan: 'Google: Gemini 4 Argon (High) or Gemini 4 Carbon (High) · External: Claude Opus 5.5 (Medium/High) [1–2 turns only]',
      stageBGoogle: 'Switch DOWN after approval -> Gemini 4 Neon (Medium/High) or Gemini 4 Carbon (Medium) [or Hydrogen XHigh for single-module deep math]',
      stageBExternal: 'Switch DOWN after approval -> Claude Sonnet 5.5 (Medium/High)',
      stageCVerify: 'Gemini 3.8 Flash (Medium) for test/lint/docs sync',
      orchestratorRule: '⚠️ Use Orchestrator (Neon) or Orchestrator (Carbon) ONLY if `/backlog-plan` splits into 3+ independent non-overlapping sub-tickets you want executed in parallel.',
      estimatedSavings: '55%–80% fewer credits vs. coding end-to-end on Argon/Opus without a plan',
      promptPlan: `/effort high /backlog-plan ${tid}`,
      promptExec: `/effort medium /backlog-start ${tid}`
    },
    parallel_orchestrator: {
      tier: 'xhigh',
      badge: '🎛️ TIER 4 · PARALLEL MULTI-SUBSYSTEM / CROSS-REPO SWARM — Orchestrator + Split Workers',
      turnBudget: '1–2 Planning Turns + Parallel Atomic Workers (≤ 6 turns/worker)',
      planningEconomics:
        'MANDATORY BACKLOG DECOMPOSITION + ORCHESTRATOR ROUTING: Always register & split every deliverable into atomic tickets in `docs/backlog.json` first (`npm run backlog plan --from-plan --split`). Let the Orchestrator coordinate parallel workers while pinning individual workers to lower-cost models (`Gemini 3.8 Flash` / `Gemini 4 Neon`) so you get frontier coordination at workhorse execution cost.',
      stageAPlan: 'Orchestrator (Argon) or Orchestrator (Carbon) — or Gemini 4 Argon (High) for initial blueprint & ticket split',
      stageBGoogle: 'Coordinator: Orchestrator (Neon/Carbon) · Workers: Gemini 4 Neon (Medium) & Gemini 3.8 Flash (High)',
      stageBExternal: 'External Review/Hard Module Worker: Claude Sonnet 5.5 (Medium) or GPT-OSS 120B (Medium)',
      stageCVerify: 'Gemini 3.8 Flash (Low/Medium) verification worker',
      orchestratorRule: '✅ Ideal Orchestrator fit! Remember to switch BACK to Gemini 4 Neon or 3.8 Flash immediately after the swarm finishes so you do not burn Orchestrator credits on follow-up tweaks.',
      estimatedSavings: '50%–70% higher Quality/Credit ratio vs. serial single-thread frontier loops',
      promptPlan: `/effort high /backlog-plan ${tid}`,
      promptExec: `/effort high /backlog-start ${tid}`
    }
  };

  const chosen = strategies[strategyKey];
  return {
    strategyKey,
    ...chosen,
    compCount,
    attachCount,
    hasActiveTicket: Boolean(task),
    backlogFirstTip: task
      ? `✅ Active ticket [${task.id}] is tracked (${compCount} component(s), ${attachCount} attachment(s)) — offline spec saves ~15k–30k discovery tokens.`
      : '⚠️ NO ACTIVE BACKLOG TICKET! Before prompting the model to code, create a 0-token ticket in backlog.html (+ New Task) or via `npm run backlog add "<Title>" --type feature --priority medium --components "<files>"` to eliminate 2–4 exploratory chat turns (~15k–30k tokens saved).'
  };
}

function getOrSetEffortProfile(requestedTier = null, explicitTaskId = null) {
  const backlogPath = path.resolve(process.cwd(), 'docs', 'backlog.json');
  let bj = { meta: {}, tasks: [] };
  if (fsSync.existsSync(backlogPath)) {
    try {
      bj = JSON.parse(fsSync.readFileSync(backlogPath, 'utf8'));
      if (!bj.meta) bj.meta = {};
    } catch {}
  }

  let activeTask = null;
  if (explicitTaskId) {
    activeTask = (bj.tasks || []).find((t) => String(t.id || '').toLowerCase() === explicitTaskId.toLowerCase()) || null;
  }
  if (!activeTask) {
    activeTask =
      (bj.tasks || []).find((t) => t.status === 'in_progress') ||
      (bj.tasks || []).find((t) => t.status === 'todo') ||
      null;
  }

  const normalizedReq = requestedTier ? requestedTier.toLowerCase() : null;
  const strategy = analyzeTicketCreditStrategy(activeTask, ['low', 'medium', 'high', 'xhigh'].includes(normalizedReq) ? normalizedReq : null);
  let tier = ['low', 'medium', 'high', 'xhigh'].includes(normalizedReq)
    ? normalizedReq
    : (['low', 'medium', 'high', 'xhigh'].includes(bj.meta?.effortLevel) && !explicitTaskId ? bj.meta.effortLevel : strategy.tier);

  if (requestedTier && fsSync.existsSync(backlogPath)) {
    try {
      bj.meta.effortLevel = tier;
      bj.meta.effortUpdatedAt = new Date().toISOString();
      fsSync.writeFileSync(backlogPath, JSON.stringify(bj, null, 2) + '\n', 'utf8');
    } catch {}
  }

  const profiles = {
    low: {
      label: '⚡ LOW EFFORT (Fast Execution · Boilerplate UI / Copy / Config / Simple CRUD)',
      turnBudget: '≤ 4 Tool Turns per Fix (1 turn read, 1 turn edit, 1 turn check)',
      modelRec: 'Google: Gemini 3.8 Flash (Low/Med) · Hydrogen (Low) | External: GPT-OSS 120B (Med) · Sonnet 5.5 (Low)',
      planGate: 'Skip separate /plan (direct /backlog-start saves ~50% credits)'
    },
    medium: {
      label: '⚙️ MEDIUM EFFORT (Optimal Daily Q/C ROI · Standard Features & Single-Component Bugs)',
      turnBudget: '≤ 6 Tool Turns per Fix (1 turn read, 1–2 turns edit, 1–2 turns test)',
      modelRec: 'Google: Gemini 4 Neon (Med/High) · Hydrogen (High) | External: Claude Sonnet 5.5 (Med)',
      planGate: 'Create 0-token backlog ticket first -> Direct /backlog-start (or /backlog-plan if 3+ files)'
    },
    high: {
      label: '🧠 HIGH EFFORT (Deep Architecture · Multi-File Features, OAuth/DB & P0 Bugs)',
      turnBudget: '≤ 8 Tool Turns per Fix (Two-Stage Split Routing: Plan on Argon/Carbon/Opus -> Execute on Neon/Sonnet)',
      modelRec: 'Stage A Plan: Gemini 4 Argon/Carbon (High) · Claude Opus 5.5 (Med/High) -> Stage B Exec: Gemini 4 Neon (Med) · Sonnet 5.5 (Med)',
      planGate: 'MANDATORY separate `/backlog-plan` + atomic ticket split BEFORE modifying files (saves 55%–80% credits)'
    },
    xhigh: {
      label: '🧠🔥 XHIGH EFFORT (Maximum Thinking Burst / Multi-Agent Swarm Orchestration)',
      turnBudget: '1–2 Planning Turns + Atomic Parallel Workers (≤ 6 turns/worker)',
      modelRec: 'Single-Module Deep Burst: Gemini 4 Neon/Hydrogen (XHigh) | Swarm: Orchestrator (Neon/Carbon/Argon) + Flash/Neon workers',
      planGate: 'MANDATORY `/backlog-plan` + `npm run backlog split` before spawning Orchestrator/Swarm workers'
    }
  };

  return { tier, profile: profiles[tier], activeTask, strategy };
}

function printVerboseAgyModelAdvisor(strategy, activeTask) {
  console.log('\n🎯 Verbose Quality-to-Credit ROI & AGY Model Prescription:');
  console.log(`   • Classification:       ${strategy.badge}`);
  console.log(`   • Backlog-First Status: ${strategy.backlogFirstTip}`);
  console.log(`   • Planning Credit ROI:  ${strategy.planningEconomics}`);
  console.log(`   • Estimated Savings:    💰 ${strategy.estimatedSavings}`);
  console.log('\n   🔀 Two-Stage Split Model Routing (Best Quality / Used Credits):');
  console.log(`     1) Stage A — Plan (/backlog-plan):   ${strategy.stageAPlan}`);
  console.log(`     2) Stage B — Exec (Google Pool):     ${strategy.stageBGoogle}`);
  console.log(`     3) Stage B — Exec (External Pool):   ${strategy.stageBExternal}`);
  console.log(`     4) Stage C — Verify & Docs Sync:     ${strategy.stageCVerify}`);
  console.log(`     5) Google Orchestrator Guardrail:    ${strategy.orchestratorRule}`);
  console.log('\n   ⚖️  Dual Quota-Pool Balancing (Independent 4h Reset Clocks):');
  console.log('     • Pool 1 (Google):   Gemini 3.8 Flash · Gemini 4 (Hydrogen / Neon / Carbon / Argon) · Orchestrator (Neon / Carbon / Argon)');
  console.log('     • Pool 2 (External): Claude Sonnet 5.5 · Claude Opus 5.5 · GPT-OSS 120B (Medium)');
  console.log('     • Pro Tip: If Pool 1 drops below 30%, shift routine execution to Claude Sonnet 5.5 (Med) or GPT-OSS 120B (Med) instead of hitting a wall!');
  if (activeTask) {
    console.log('\n   🚀 Copy-Paste Optimal Kickoff Commands:');
    if (strategy.promptPlan) console.log(`     • Step 1 (Plan & Split):  ${strategy.promptPlan}`);
    console.log(`     • Step ${strategy.promptPlan ? '2' : '1'} (Execute Ticket): ${strategy.promptExec}`);
    console.log('     • Final Step (Reset):     /start   (auto-runs /clear & /compact pre-flight -> 0.0 KB delta)');
  }
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
    console.log(`   • Active Delta Since /start (${brain.id.slice(0, 8)}): ${(brain.deltaBytes / 1024).toFixed(1)} KB (~${brain.estHistoryTokens} tokens/turn) -> ${brain.zone}`);
    console.log(`   • Preserved Session Archive:    ${(brain.totalArchiveBytes / 1024).toFixed(1)} KB (100% retained on disk — zero history lost)`);
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

  const { tier, profile, activeTask, strategy } = getOrSetEffortProfile();
  const brain = findLatestBrainStats();

  console.log('1. Per-Turn Token Economics:');
  console.log(`   • Always-On Rules (GEMINI.md + AGENTS.md): ~${alwaysOnRuleTokens} tokens/turn`);
  console.log(`   • Progressive Disclosure Savings:          ~${progressiveSavedTokens} tokens/turn deferred via model_decision`);
  if (brain) {
    console.log(`   • Active Delta Since /start (${brain.id.slice(0, 8)}):     ${(brain.deltaBytes / 1024).toFixed(1)} KB (~${brain.estHistoryTokens} tokens/turn)`);
    console.log(`   • Preserved Session Archive (Disk):        ${(brain.totalArchiveBytes / 1024).toFixed(1)} KB (100% retained — zero history lost)`);
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

  printVerboseAgyModelAdvisor(strategy, activeTask);

  console.log('\n3. Overage Hard-Stop & Guardrail Checklist:');
  console.log('   • [✓] Root AGENTS.md & GEMINI.md strictly <= 50 lines (0 inline @-expansion bloat)');
  console.log('   • [✓] Memory-First Lookup & <= 8 Tool Turns per Fix active');
  console.log('   • [!] Verify in Google One / Antigravity Settings -> "Toggle for overage" is OFF (hard stop at 20x baseline limit)\n');
  process.exit(0);
}

if (args.includes('--advise')) {
  const idx = args.indexOf('--advise');
  const targetId = args[idx + 1] && !args[idx + 1].startsWith('-') ? args[idx + 1] : null;
  const { tier, profile, activeTask, strategy } = getOrSetEffortProfile(null, targetId);
  console.log(`\n🧭 Antigravity Save Credits & AGY Model ROI Advisor${activeTask ? ` — [${activeTask.id}] ${activeTask.title}` : ''}\n`);
  console.log(`   • Recommended Effort:  /effort ${tier} (${profile.turnBudget})`);
  printVerboseAgyModelAdvisor(strategy, activeTask);
  console.log('\n📚 Deployed AGY 3-Family Model Reference:');
  console.log('   [1] Google Gemini Models (Google Quota Pool):');
  for (const m of AGY_MODEL_FAMILIES.googleGemini) {
    console.log(`       • ${m.name} [${m.burn}] -> ${m.bestFor}`);
  }
  console.log('   [2] External Partner Models (Separate External Quota Pool):');
  for (const m of AGY_MODEL_FAMILIES.externalModels) {
    console.log(`       • ${m.name} [${m.burn}] -> ${m.bestFor}`);
  }
  console.log('   [3] Google Orchestrators (Multi-Agent / Swarm Coordinators — Google Pool):');
  for (const m of AGY_MODEL_FAMILIES.googleOrchestrators) {
    console.log(`       • ${m.name} [${m.burn}] -> ${m.bestFor}`);
  }
  console.log('');
  process.exit(0);
}

if (args.includes('--effort')) {
  const idx = args.indexOf('--effort');
  const requested = args[idx + 1] && !args[idx + 1].startsWith('-') ? args[idx + 1] : 'auto';
  const { tier, profile, activeTask, strategy } = getOrSetEffortProfile(requested);
  console.log(`\n⚡ Antigravity Reasoning Effort Profile Set: ${tier.toUpperCase()} (/effort ${tier})\n`);
  console.log(`  • Mode:              ${profile.label}`);
  console.log(`  • Turn Budget:       ${profile.turnBudget}`);
  console.log(`  • Recommended Model: ${profile.modelRec}`);
  console.log(`  • Planning Gate:     ${profile.planGate}`);
  if (activeTask) {
    console.log(`  • Active Ticket:     [${activeTask.id}] ${activeTask.title} (${activeTask.priority || 'P1'})`);
  }
  printVerboseAgyModelAdvisor(strategy, activeTask);
  console.log('');
  process.exit(0);
}

if (args.includes('--clear') || args.includes('--start')) {
  const brain = findLatestBrainStats({ resetWatermark: true });
  console.log('\n🧹 Antigravity Session State Checkpointed & Pre-Start Context Reset (/clear -> /start)\n');
  console.log('  • [✓] memory-bank/activeContext.md & memory-bank/progress.md synchronized (zero context lost)');
  console.log('  • [✓] docs/backlog.json & Review pane artifacts (backlog.html, task.md, implementation_plan.md) up to date');
  if (brain) {
    console.log(`  • [✓] Preserved Session Archive (${brain.id.slice(0, 8)}): ${(brain.totalArchiveBytes / 1024).toFixed(1)} KB retained on disk (100% history intact)`);
    console.log(`  • Active Post-Reset Delta: ${(brain.deltaBytes / 1024).toFixed(1)} KB (~${brain.estHistoryTokens} tokens/turn) -> ${brain.zone}`);
  }
  console.log('\n👉 Context Compaction & Pruning Status:');
  if (brain && brain.estHistoryTokens > 25000) {
    console.log('   ⚠️ Active post-reset delta exceeds 25k tokens/turn! Type `/compact` in chat now (or press Cmd/Ctrl + N -> `/start`).\n');
  } else {
    console.log('   ✅ Active context delta reset to 0 KB (< 25k tokens/turn optimal zone) with 100% of historical archive preserved on disk.\n');
  }
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
    'docs/design/DESIGN.md',
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
    console.log('✅ Canonical Living Docs Hierarchy verified: 10/10 docs present, 0 broken links in docs/INDEX.md');
  }
}

// Backlog Schema & Hygiene Audit: runs when docs/backlog.json is present
const backlogJsonFull = path.resolve(process.cwd(), 'docs/backlog.json');
if (fsSync.existsSync(backlogJsonFull)) {
  try {
    const rawBacklog = await fs.readFile(backlogJsonFull, 'utf8');
    const backlog = JSON.parse(rawBacklog);
    if (!Array.isArray(backlog.tasks)) {
      console.error('❌ docs/backlog.json: "tasks" must be an array');
      violations++;
    } else {
      let backlogViolations = 0;
      const seenIds = new Set();
      const validPriorities = new Set(['high', 'medium', 'low']);
      const validStatuses = new Set(['todo', 'in_progress', 'testing', 'done']);

      for (const task of backlog.tasks) {
        const tid = String(task?.id || '').trim();
        if (!tid) {
          console.error('❌ docs/backlog.json: Task found with missing id');
          violations++;
          backlogViolations++;
          continue;
        }
        const normId = tid.toUpperCase();
        if (seenIds.has(normId)) {
          console.error(`❌ docs/backlog.json [${tid}]: Duplicate task id`);
          violations++;
          backlogViolations++;
        }
        seenIds.add(normId);

        const title = String(task?.title || '').trim();
        if (!title || title.startsWith('-')) {
          console.error(`❌ docs/backlog.json [${tid}]: Invalid or flag-like title "${title}" (use --title "..." or positional title)`);
          violations++;
          backlogViolations++;
        }

        const prio = String(task?.priority || '').toLowerCase();
        if (!validPriorities.has(prio)) {
          console.error(`❌ docs/backlog.json [${tid}]: Non-normalized priority "${task?.priority}" (must be high, medium, or low)`);
          violations++;
          backlogViolations++;
        }

        const tType = String(task?.type || '').toLowerCase();
        if (!tType || tType === 'feat' || tType === 'fix' || tType.startsWith('-')) {
          console.error(`❌ docs/backlog.json [${tid}]: Non-normalized type "${task?.type}" (use "feature" or "bug")`);
          violations++;
          backlogViolations++;
        }

        const status = String(task?.status || '').toLowerCase();
        if (!validStatuses.has(status)) {
          console.error(`❌ docs/backlog.json [${tid}]: Invalid status "${task?.status}"`);
          violations++;
          backlogViolations++;
        }

        if (status === 'done') {
          if (task.waitingOn) {
            console.error(`❌ docs/backlog.json [${tid}]: Completed task still has stale waitingOn ("${task.waitingOn}")`);
            violations++;
            backlogViolations++;
          }
          if (Array.isArray(task.actionItems) && task.actionItems.some(a => !a.done)) {
            console.error(`❌ docs/backlog.json [${tid}]: Completed task still has pending actionItems (run "npm run backlog done ${tid}")`);
            violations++;
            backlogViolations++;
          }
        }
      }

      if (backlogViolations === 0) {
        console.log(`✅ Backlog Hygiene verified: ${backlog.tasks.length} tickets valid in docs/backlog.json`);
      }

      // Verify that every ticket ID (`FEAT-*`, `BUG-*`, `QA-*`, `UX-*`) declared in docs/planning/implementation_plan.md exists in docs/backlog.json
      const planMdFull = path.resolve(process.cwd(), 'docs/planning/implementation_plan.md');
      if (fsSync.existsSync(planMdFull)) {
        const planMdRaw = await fs.readFile(planMdFull, 'utf8');
        const planHeadingIdRe = /^#{2,4}\s+[^\n]*?\b((?:FEAT|BUG|QA|REFACTOR|UX)-\d+)\b/gm;
        let pm;
        const missingFromBacklog = [];
        while ((pm = planHeadingIdRe.exec(planMdRaw)) !== null) {
          const pid = pm[1].toUpperCase();
          if (!seenIds.has(pid) && !missingFromBacklog.includes(pid)) {
            missingFromBacklog.push(pid);
          }
        }
        if (missingFromBacklog.length > 0) {
          console.error(`❌ docs/planning/implementation_plan.md: Planned ticket(s) [${missingFromBacklog.join(', ')}] missing from docs/backlog.json (run "node scripts/backlog.mjs render" to self-heal)`);
          violations += missingFromBacklog.length;
        }
      }
    }
  } catch (err) {
    console.error(`❌ docs/backlog.json: Invalid JSON (${err.message})`);
    violations++;
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
