/**
 * Antigravity Memory Bank — Native MCP App Server (SEP-1865)
 *
 * Exposes:
 *   - 2 compact model-visible tools (< 250 tokens):
 *       1. memory_bank_dashboard      (aux_pane + global sidebar entrypoints)
 *       2. memory_bank_inline_status  (compact inline chat status widget)
 *   - 14 app-only tools (visibility: ["app"], 0 model prompt token bloat)
 *   - 1 self-contained UI resource: ui://memory-bank/app.html (text/html;profile=mcp-app)
 *
 * IMPORTANT: Never write to stdout (stdout is reserved strictly for MCP JSON-RPC frames).
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync, execSync, spawn } from 'node:child_process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE
} from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_URI = 'ui://memory-bank/app.html';
const APP_ONLY_META = { ui: { visibility: ['app'] } };
const activeHostRecordings = new Map();

function logErr(...args) {
  console.error('[memory-bank-mcp]', ...args);
}

function getHtmlResourcePath() {
  if (process.env.MEMORY_BANK_APP_HTML && fs.existsSync(process.env.MEMORY_BANK_APP_HTML)) {
    return process.env.MEMORY_BANK_APP_HTML;
  }
  const adjacent = path.join(__dirname, 'app.html');
  if (fs.existsSync(adjacent)) return adjacent;
  return path.join(__dirname, '..', 'dist', 'app.html');
}

function resolveUpstreamRepoRoot() {
  const candidates = [
    process.env.ANTIGRAVITY_MEMORY_BANK_ROOT,
    path.resolve(__dirname, '..', '..'),
    path.join(os.homedir(), 'Documents', 'antigravity-memory-bank')
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'bin', 'cli.mjs')) && fs.existsSync(path.join(c, 'bricks'))) {
      return c;
    }
  }
  return path.resolve(__dirname, '..', '..');
}

function detectGitContext(rootDir) {
  const fallback = {
    branch: 'main',
    isWorktree: false,
    worktreeName: path.basename(rootDir || ''),
    isGit: false
  };
  if (!rootDir || !fs.existsSync(rootDir)) return fallback;
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    const gitDir = execSync('git rev-parse --git-dir', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return {
      branch: branch || 'main',
      isWorktree: gitDir.includes(`${path.sep}worktrees${path.sep}`) || gitDir.includes('/worktrees/'),
      worktreeName: path.basename(rootDir),
      isGit: true
    };
  } catch {
    return fallback;
  }
}

function listGitWorktrees(mainDir) {
  try {
    const raw = execSync('git worktree list --porcelain', {
      cwd: mainDir,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString();
    const entries = [];
    let cur = null;
    for (const line of raw.split(/\r?\n/)) {
      if (line.startsWith('worktree ')) {
        if (cur) entries.push(cur);
        cur = { path: line.slice('worktree '.length).trim(), branch: 'detached', isMain: entries.length === 0 };
      } else if (cur && line.startsWith('branch ')) {
        cur.branch = line.slice('branch '.length).trim().replace(/^refs\/heads\//, '');
      }
    }
    if (cur) entries.push(cur);
    return entries.filter((e) => fs.existsSync(e.path));
  } catch {
    return [{ path: mainDir, branch: detectGitContext(mainDir).branch, isMain: true }];
  }
}

function readJsonSafe(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function summarizeBacklogCounts(rootDir) {
  const bj = readJsonSafe(path.join(rootDir, 'docs', 'backlog.json'), null);
  const tasks = Array.isArray(bj?.tasks) ? bj.tasks : [];
  let todo = 0;
  let ready = 0;
  let inProgress = 0;
  let done = 0;
  let planningLocked = 0;
  for (const t of tasks) {
    if (t.status === 'done') done++;
    else if (t.status === 'in_progress' || t.status === 'testing') inProgress++;
    else if (t.status === 'ready') {
      ready++;
      if (t.planningLocked || t.liveActivity === 'planning') planningLocked++;
    } else todo++;
  }
  return { total: tasks.length, todo, ready, inProgress, done, planningLocked, project: bj?.project || path.basename(rootDir) };
}

function discoverFleetInstallations() {
  const upstreamRoot = resolveUpstreamRepoRoot();
  const docsParent = path.join(os.homedir(), 'Documents');
  const seenMains = new Set();
  const mains = [];

  const tryAddMain = (dirPath) => {
    if (!dirPath || !fs.existsSync(dirPath)) return;
    let real;
    try {
      real = fs.realpathSync(path.resolve(dirPath));
    } catch {
      return;
    }
    if (seenMains.has(real)) return;
    if (fs.existsSync(path.join(real, 'memory-bank')) || fs.existsSync(path.join(real, 'AGENTS.md'))) {
      seenMains.add(real);
      mains.push(real);
    }
  };

  tryAddMain(upstreamRoot);
  if (fs.existsSync(docsParent)) {
    try {
      for (const entry of fs.readdirSync(docsParent, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        tryAddMain(path.join(docsParent, entry.name));
      }
    } catch {}
  }

  // Also discover repos outside ~/Documents via brain artifacts (e.g. ~/Pictures/JBB.PM CV)
  try {
    const brainBase = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
    if (fs.existsSync(brainBase)) {
      for (const bEntry of fs.readdirSync(brainBase, { withFileTypes: true })) {
        if (!bEntry.isDirectory() || bEntry.name.startsWith('.')) continue;
        const bHtml = path.join(brainBase, bEntry.name, 'backlog.html');
        if (!fs.existsSync(bHtml)) continue;
        const txt = fs.readFileSync(bHtml, 'utf8');
        const m = txt.match(/"repoRoot":("(?:[^"\\]|\\.)*")/);
        if (!m) continue;
        const rr = JSON.parse(m[1]);
        if (fs.existsSync(rr) && !rr.includes('/.gemini/antigravity/worktrees/') && !rr.includes('/var/folders/')) {
          tryAddMain(rr);
        }
      }
    }
  } catch {}

  const installations = [];
  for (const mainDir of mains) {
    const projectName = path.basename(mainDir);
    const worktrees = listGitWorktrees(mainDir);
    for (const wt of worktrees) {
      const counts = summarizeBacklogCounts(wt.path);
      const hasMemoryBank = fs.existsSync(path.join(wt.path, 'memory-bank'));
      const hasHooks = fs.existsSync(path.join(wt.path, '.agents', 'hooks.json'));
      const hasBacklogScript = fs.existsSync(path.join(wt.path, 'scripts', 'backlog.mjs'));
      const isUpstreamMain = wt.isMain && path.resolve(wt.path) === path.resolve(upstreamRoot);
      installations.push({
        project: projectName,
        role: wt.isMain ? 'main' : 'worktree',
        branch: wt.branch,
        path: wt.path,
        isUpstreamMain,
        hasMemoryBank,
        hasHooks,
        hasBacklogScript,
        counts
      });
    }
  }
  return installations;
}

function resolveWorkspaceRoot(requestedRoot) {
  if (requestedRoot && fs.existsSync(requestedRoot)) {
    return path.resolve(requestedRoot);
  }
  const cwd = process.cwd();
  if (
    cwd &&
    cwd !== '/' &&
    cwd !== os.homedir() &&
    (fs.existsSync(path.join(cwd, 'docs', 'backlog.json')) || fs.existsSync(path.join(cwd, 'memory-bank')))
  ) {
    return cwd;
  }
  // Most recently updated brain backlog.html workspace
  try {
    const brainBase = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
    if (fs.existsSync(brainBase)) {
      const candidates = fs
        .readdirSync(brainBase, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
        .map((d) => {
          const p = path.join(brainBase, d.name, 'backlog.html');
          return fs.existsSync(p) ? { p, mtimeMs: fs.statSync(p).mtimeMs } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.mtimeMs - a.mtimeMs);
      for (const c of candidates) {
        const txt = fs.readFileSync(c.p, 'utf8');
        const m = txt.match(/"repoRoot":("(?:[^"\\]|\\.)*")/);
        if (m) {
          const rr = JSON.parse(m[1]);
          if (fs.existsSync(rr) && !rr.includes('/var/folders/')) return rr;
        }
      }
    }
  } catch {}

  const fleet = discoverFleetInstallations();
  if (fleet.length > 0) return fleet[0].path;
  return resolveUpstreamRepoRoot();
}

function readBrainCreditTelemetry() {
  const brainRoot = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
  if (!fs.existsSync(brainRoot)) {
    return {
      zone: 'optimal',
      zoneLabel: '🟢 OPTIMAL (< 25k active delta tokens/turn)',
      estHistoryTokens: 0,
      archiveTokens: 0,
      resetAt: null,
      conversationId: null,
      recommendation: 'Context is lean. Continue normally.'
    };
  }
  try {
    const dirs = fs
      .readdirSync(brainRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => {
        const full = path.join(brainRoot, d.name);
        const transcript = path.join(full, '.system_generated', 'logs', 'transcript.jsonl');
        const hasT = fs.existsSync(transcript);
        const st = fs.statSync(hasT ? transcript : full);
        return { id: d.name, full, mtimeMs: st.mtimeMs, transcriptBytes: hasT ? st.size : 0 };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
    if (dirs.length === 0) return null;
    const active = dirs[0];
    const wm = readJsonSafe(path.join(active.full, '.system_generated', 'logs', 'compaction_watermark.json'), {});
    const watermarkBytes =
      typeof wm?.watermarkBytes === 'number' && wm.watermarkBytes >= 0 && wm.watermarkBytes <= active.transcriptBytes
        ? wm.watermarkBytes
        : 0;
    const deltaBytes = Math.max(0, active.transcriptBytes - watermarkBytes);
    const estHistoryTokens = deltaBytes === 0 ? 0 : Math.max(1, Math.round(deltaBytes / 4));
    const archiveTokens = Math.max(0, Math.round(active.transcriptBytes / 4));
    let zone = 'optimal';
    let zoneLabel = '🟢 OPTIMAL (< 25k active delta tokens/turn)';
    let recommendation = 'Continue working normally; run /start after finishing your current ticket.';
    if (estHistoryTokens > 75000) {
      zone = 'bleed';
      zoneLabel = '🔴 CREDIT BLEED ZONE (> 75k active delta tokens/turn)';
      recommendation = 'Click Reset Context (/start) immediately to cut per-turn token burn by ~95%.';
    } else if (estHistoryTokens > 25000) {
      zone = 'caution';
      zoneLabel = '🟡 CAUTION ZONE (25k–75k active delta tokens/turn)';
      recommendation = 'Run /start right after completing the current sub-task to checkpoint and compact.';
    }
    return {
      zone,
      zoneLabel,
      estHistoryTokens,
      archiveTokens,
      resetAt: wm?.resetAt || null,
      conversationId: active.id,
      recommendation
    };
  } catch {
    return null;
  }
}

function auditWorkspaceMemory(rootDir) {
  const mbDir = path.join(rootDir, 'memory-bank');
  const memoryFiles = [];
  if (fs.existsSync(mbDir)) {
    for (const f of fs.readdirSync(mbDir).filter((x) => x.endsWith('.md')).sort()) {
      const full = path.join(mbDir, f);
      const raw = fs.readFileSync(full, 'utf8');
      const lines = raw.trimEnd() ? raw.trimEnd().split('\n').length : 0;
      const bytes = Buffer.byteLength(raw, 'utf8');
      memoryFiles.push({
        name: f,
        path: full,
        uri: `file://${full}`,
        lines,
        limit: 150,
        tokens: Math.max(1, Math.round(bytes / 4)),
        ok: lines <= 150
      });
    }
  }

  const agentsPath = path.join(rootDir, 'AGENTS.md');
  let agentsInfo = { exists: false, path: agentsPath, uri: `file://${agentsPath}`, lines: 0, limit: 50, inlineExpansions: 0, ok: false };
  if (fs.existsSync(agentsPath)) {
    const raw = fs.readFileSync(agentsPath, 'utf8');
    const lines = raw.trimEnd().split('\n').length;
    const inlineExpansions = (raw.match(/@\[[^\]]+\]\([^)]+\)/g) || []).length;
    agentsInfo = {
      exists: true,
      path: agentsPath,
      uri: `file://${agentsPath}`,
      lines,
      limit: 50,
      tokens: Math.max(1, Math.round(Buffer.byteLength(raw, 'utf8') / 4)),
      inlineExpansions,
      ok: lines <= 50 && inlineExpansions === 0
    };
  }

  const rulesDir = path.join(rootDir, '.agents', 'rules');
  const rules = [];
  if (fs.existsSync(rulesDir)) {
    for (const f of fs.readdirSync(rulesDir).filter((x) => x.endsWith('.md')).sort()) {
      const full = path.join(rulesDir, f);
      const raw = fs.readFileSync(full, 'utf8');
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let trigger = 'missing_frontmatter';
      let description = '';
      if (fm) {
        const tm = fm[1].match(/^trigger:\s*(\S+)/m);
        if (tm) trigger = tm[1].trim().replace(/^['"]|['"]$/g, '');
        const dm = fm[1].match(/^description:\s*(.+)$/m);
        if (dm) description = dm[1].trim().replace(/^['"]|['"]$/g, '');
      }
      const valid = ['model_decision', 'always_on', 'glob', 'manual'].includes(trigger) && Boolean(description);
      rules.push({
        name: f,
        path: full,
        uri: `file://${full}`,
        trigger,
        description,
        tokens: Math.max(1, Math.round(Buffer.byteLength(raw, 'utf8') / 4)),
        ok: valid
      });
    }
  }

  const livingDocsExpected = [
    'docs/INDEX.md',
    'docs/architecture/LOGICAL_ARCHITECTURE.md',
    'docs/architecture/TECHNICAL_ARCHITECTURE.md',
    'docs/architecture/SECURITY_AND_COMPLIANCE.md',
    'docs/design/DESIGN.md',
    'docs/design/UX_BRIEF.md',
    'docs/design/BRAND_BOOK.md',
    'docs/quality/TESTING_STRATEGY.md',
    'docs/quality/BUG_FIX_RECORDS.md',
    'docs/operations/MIGRATION_AND_RELEASE_LOG.md'
  ];
  const livingDocs = livingDocsExpected.map((rel) => {
    const full = path.join(rootDir, rel);
    return {
      relPath: rel,
      path: full,
      uri: `file://${full}`,
      exists: fs.existsSync(full)
    };
  });

  const hooksPath = path.join(rootDir, '.agents', 'hooks.json');
  const postCommitPath = path.join(rootDir, '.git', 'hooks', 'post-commit');
  const skillsDir = path.join(rootDir, '.agents', 'skills');
  const skillCount = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).length
    : 0;

  return {
    agents: agentsInfo,
    memoryFiles,
    rules,
    livingDocs,
    livingDocsPresent: livingDocs.filter((d) => d.exists).length,
    hasHooks: fs.existsSync(hooksPath),
    hasPostCommitHook: fs.existsSync(postCommitPath),
    skillCount,
    violations:
      (agentsInfo.exists && !agentsInfo.ok ? 1 : 0) +
      memoryFiles.filter((m) => !m.ok).length +
      rules.filter((r) => !r.ok).length
  };
}

function loadImplementationPlanSummary(rootDir) {
  const wsPlan = path.join(rootDir, 'docs', 'planning', 'implementation_plan.md');
  if (!fs.existsSync(wsPlan)) return { path: wsPlan, uri: `file://${wsPlan}`, exists: false, text: '' };
  try {
    const text = fs.readFileSync(wsPlan, 'utf8');
    return { path: wsPlan, uri: `file://${wsPlan}`, exists: true, text: text.slice(0, 12000) };
  } catch {
    return { path: wsPlan, uri: `file://${wsPlan}`, exists: false, text: '' };
  }
}

function loadBacklogData(rootDir) {
  const jsonPath = path.join(rootDir, 'docs', 'backlog.json');
  const data = readJsonSafe(jsonPath, {
    version: '1.0.0',
    project: path.basename(rootDir),
    tasks: [],
    milestones: []
  });
  if (!Array.isArray(data.tasks)) data.tasks = [];
  return data;
}

function saveBacklogAndRender(rootDir, data) {
  const jsonPath = path.join(rootDir, 'docs', 'backlog.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  const scriptPath = path.join(rootDir, 'scripts', 'backlog.mjs');
  if (fs.existsSync(scriptPath)) {
    try {
      execFileSync(process.execPath, [scriptPath, 'render'], {
        cwd: rootDir,
        env: { ...process.env, ANTIGRAVITY_BRIDGE_NO_SPAWN: '1' },
        stdio: 'ignore',
        timeout: 15000
      });
    } catch {}
  }
}

function recordTransition(task, newStatus, liveActivity = null) {
  const nowIso = new Date().toISOString();
  task.status = newStatus;
  if (liveActivity) task.liveActivity = liveActivity;
  else delete task.liveActivity;
  if (liveActivity === 'planning') {
    task.planningLocked = true;
    task.planningStartedAt = nowIso;
    delete task.plannedAt;
  } else {
    delete task.planningLocked;
  }
  if (newStatus === 'ready' && liveActivity !== 'planning' && !task.plannedAt) task.plannedAt = nowIso;
  if (newStatus === 'in_progress' && !task.startedAt) task.startedAt = nowIso;
  if (newStatus === 'done') task.completedAt = nowIso;
  if (!Array.isArray(task.stateHistory)) task.stateHistory = [];
  const last = task.stateHistory[task.stateHistory.length - 1];
  if (!last || last.status !== newStatus || last.activity !== (liveActivity || null)) {
    task.stateHistory.push({ status: newStatus, activity: liveActivity || null, at: nowIso });
    if (task.stateHistory.length > 20) task.stateHistory = task.stateHistory.slice(-20);
  }
}

function isTaskVisibleInBranch(task, gitCtx) {
  if (!gitCtx || !gitCtx.isWorktree) return true;
  if (!task.branch) return true;
  if (task.branch === gitCtx.branch) return true;
  if (Array.isArray(task.activeBranches) && task.activeBranches.includes(gitCtx.branch)) return true;
  return false;
}

function buildWorkspaceSnapshot(requestedRoot, branchScope = 'branch') {
  const rootDir = resolveWorkspaceRoot(requestedRoot);
  const gitCtx = detectGitContext(rootDir);
  const backlog = loadBacklogData(rootDir);
  const allTasks = Array.isArray(backlog.tasks) ? backlog.tasks : [];
  const tasks = branchScope === 'all' ? allTasks : allTasks.filter((t) => isTaskVisibleInBranch(t, gitCtx));
  const memoryAudit = auditWorkspaceMemory(rootDir);
  const creditTelemetry = readBrainCreditTelemetry();
  const plan = loadImplementationPlanSummary(rootDir);

  return {
    repoRoot: rootDir,
    project: backlog.project || path.basename(rootDir),
    gitContext: gitCtx,
    branchScope,
    totalTasksAllBranches: allTasks.length,
    activePlanTaskIds: Array.isArray(backlog.activePlanTaskIds) ? backlog.activePlanTaskIds : [],
    columnSorts: (backlog.meta && backlog.meta.columnSorts) || {},
    tasks,
    counts: summarizeBacklogCounts(rootDir),
    memoryAudit,
    creditTelemetry,
    implementationPlan: plan
  };
}

function listAvailableBricks(upstreamRoot, targetDir) {
  const bricksRoot = path.join(upstreamRoot, 'bricks');
  if (!fs.existsSync(bricksRoot)) return [];
  return fs
    .readdirSync(bricksRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(bricksRoot, d.name, 'brick.json')))
    .map((d) => {
      const manifest = readJsonSafe(path.join(bricksRoot, d.name, 'brick.json'), {});
      const installedManifest = readJsonSafe(path.join(targetDir, 'bricks', d.name, 'brick.json'), null);
      return {
        name: manifest.name || d.name,
        version: manifest.version || '1.0.0',
        title: manifest.title || d.name,
        architecture: manifest.architecture || 'hexagonal',
        theming: manifest.theming || '3-tier',
        providers: manifest.providers || [],
        platforms: manifest.platforms || ['web'],
        installed: Boolean(installedManifest),
        installedVersion: installedManifest?.version || null,
        installedPlatforms: installedManifest?.installedPlatforms || []
      };
    });
}

function resolveAsrApiKey(keyName) {
  if (process.env[keyName]) return process.env[keyName];
  const shellFiles = [
    path.join(os.homedir(), '.zshrc'),
    path.join(os.homedir(), '.bashrc'),
    path.join(os.homedir(), '.zprofile')
  ];
  for (const sf of shellFiles) {
    try {
      if (!fs.existsSync(sf)) continue;
      const content = fs.readFileSync(sf, 'utf8');
      const m = content.match(new RegExp(`(?:export\\s+)?${keyName}=["']?([^"'\\n\\r#]+)["']?`));
      if (m && m[1]) return m[1].trim();
    } catch {}
  }
  return '';
}

async function transcribeAudioBase64(audioBase64, mimeType = 'audio/webm') {
  const cleanB64 = String(audioBase64 || '').replace(/^data:[^;]+;base64,/, '').trim();
  if (!cleanB64) throw new Error('Empty audio payload');
  const geminiKey = resolveAsrApiKey('GEMINI_API_KEY') || resolveAsrApiKey('GOOGLE_API_KEY');
  if (geminiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Transcribe the spoken software engineering backlog idea verbatim into clean concise text. Output ONLY the transcript text with no markdown or preamble.'
                },
                { inline_data: { mime_type: mimeType, data: cleanB64 } }
              ]
            }
          ]
        })
      }
    );
    if (res.ok) {
      const json = await res.json();
      const transcript = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join(' ').trim();
      if (transcript) return { ok: true, transcript, provider: 'gemini-2.5-flash' };
    }
  }
  const openaiKey = resolveAsrApiKey('OPENAI_API_KEY');
  if (openaiKey) {
    const buf = Buffer.from(cleanB64, 'base64');
    const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp4') ? 'm4a' : 'webm';
    const form = new FormData();
    form.append('file', new Blob([buf], { type: mimeType }), `idea.${ext}`);
    form.append('model', 'whisper-1');
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.text) return { ok: true, transcript: String(json.text).trim(), provider: 'whisper-1' };
    }
  }
  throw new Error('No ASR key configured (set GEMINI_API_KEY or OPENAI_API_KEY)');
}

function createServer() {
  const server = new McpServer({
    name: 'antigravity-memory-bank',
    version: '2.0.0'
  });

  // UI Resource (SEP-1865)
  registerAppResource(
    server,
    'Memory Bank Control Plane',
    APP_URI,
    {
      description: 'Antigravity Memory Bank 5-Tab MCP App (Kanban, Memory & Rules, Credits & Usage, Fleet & Worktrees, Bricks & Living Docs)',
      _meta: { ui: { prefersBorder: false } }
    },
    async () => {
      const htmlPath = getHtmlResourcePath();
      const html = fs.existsSync(htmlPath)
        ? fs.readFileSync(htmlPath, 'utf8')
        : '<!DOCTYPE html><html><body><p>Build missing: run npm run build:mcp</p></body></html>';
      return {
        contents: [
          {
            uri: APP_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: { ui: { prefersBorder: false } }
          }
        ]
      };
    }
  );

  // =========================================================================
  // MODEL-VISIBLE ENTRYPOINT TOOLS (2 ONLY -> < 250 tokens total)
  // =========================================================================

  registerAppTool(
    server,
    'memory_bank_dashboard',
    {
      title: 'Memory Bank',
      description: 'Open the interactive Antigravity Memory Bank Control Plane (Kanban Board with zero-permission PLAN/CODE execution, Memory & Rules Inspector, Credits & Usage Telemetry, Fleet Worktrees, and Hexagonal Bricks).',
      inputSchema: z.object({
        repoRoot: z.string().optional().describe('Optional absolute path to a repository or linked worktree'),
        tab: z.enum(['kanban', 'memory', 'credits', 'fleet', 'bricks']).optional().describe('Initial tab to open')
      }),
      _meta: {
        ui: { resourceUri: APP_URI },
        'com.google.antigravity/ui': {
          entrypoints: [
            { type: 'aux_pane', title: 'Memory Bank' },
            { type: 'global', title: 'Memory Bank Fleet' }
          ]
        }
      }
    },
    async (args = {}) => {
      const rootDir = resolveWorkspaceRoot(args.repoRoot);
      const counts = summarizeBacklogCounts(rootDir);
      const fleet = discoverFleetInstallations();
      const activeTab = args.tab || 'kanban';
      return {
        content: [
          {
            type: 'text',
            text: `Memory Bank Control Plane opened for ${counts.project} (${counts.todo} TO DO, ${counts.ready} READY, ${counts.inProgress} IN PROGRESS, ${counts.done} DONE · ${fleet.length} fleet installations).`
          }
        ],
        structuredContent: {
          mode: 'dashboard',
          activeTab,
          repoRoot: rootDir,
          project: counts.project,
          counts,
          fleetCount: fleet.length
        }
      };
    }
  );

  registerAppTool(
    server,
    'memory_bank_inline_status',
    {
      title: 'Memory Bank Status Widget',
      description: 'Render a compact inline status card in chat showing active sprint counts, Memory Bank line/rule hygiene, and Credit/Compaction Watermark telemetry.',
      inputSchema: z.object({
        repoRoot: z.string().optional().describe('Optional workspace root path'),
        view: z.enum(['sprint', 'context', 'credits', 'usage']).optional().describe('Inline card focus view')
      }),
      _meta: {
        ui: { resourceUri: APP_URI }
      }
    },
    async (args = {}) => {
      const snap = buildWorkspaceSnapshot(args.repoRoot, 'branch');
      const view = args.view || 'sprint';
      return {
        content: [
          {
            type: 'text',
            text: `[${snap.project}] ${snap.counts.todo} TO DO · ${snap.counts.ready} READY · ${snap.counts.inProgress} IN PROGRESS · ${snap.counts.done} DONE | Memory violations: ${snap.memoryAudit.violations} | ${snap.creditTelemetry?.zoneLabel || 'Telemetry ready'}`
          }
        ],
        structuredContent: {
          mode: 'inline',
          view,
          repoRoot: snap.repoRoot,
          project: snap.project,
          counts: snap.counts,
          memoryAudit: {
            agentsLines: snap.memoryAudit.agents.lines,
            memoryCount: snap.memoryAudit.memoryFiles.length,
            ruleCount: snap.memoryAudit.rules.length,
            violations: snap.memoryAudit.violations,
            livingDocsPresent: snap.memoryAudit.livingDocsPresent
          },
          creditTelemetry: snap.creditTelemetry
        }
      };
    }
  );

  // =========================================================================
  // APP-ONLY TOOLS (14 tools, visibility: ["app"] -> 0 model prompt tokens!)
  // =========================================================================

  registerAppTool(
    server,
    'app_get_workspace_snapshot',
    {
      description: 'Fetch full workspace backlog, memory audit, credit telemetry, and implementation plan snapshot for the UI.',
      inputSchema: z.object({
        repoRoot: z.string().optional(),
        branchScope: z.enum(['branch', 'all']).optional()
      }),
      _meta: APP_ONLY_META
    },
    async (args = {}) => {
      const snap = buildWorkspaceSnapshot(args.repoRoot, args.branchScope || 'branch');
      return {
        content: [{ type: 'text', text: `Loaded ${snap.project} (${snap.tasks.length} tasks)` }],
        structuredContent: snap
      };
    }
  );

  registerAppTool(
    server,
    'app_list_fleet',
    {
      description: 'List all discovered Main repositories, linked git worktrees, and pending Trickle-Up candidates.',
      inputSchema: z.object({}),
      _meta: APP_ONLY_META
    },
    async () => {
      const installations = discoverFleetInstallations();
      const upstreamRoot = resolveUpstreamRepoRoot();
      const upstreamBacklog = loadBacklogData(upstreamRoot);
      const trickleUpTickets = (upstreamBacklog.tasks || []).filter((t) => Boolean(t.trickleUp) && t.status !== 'done');
      return {
        content: [{ type: 'text', text: `Discovered ${installations.length} Memory Bank installations` }],
        structuredContent: {
          upstreamRoot,
          installations,
          trickleUpTickets
        }
      };
    }
  );

  registerAppTool(
    server,
    'app_plan_tickets',
    {
      description: 'Lock TO DO / READY tickets into READY (planning) and return the /backlog-plan command for app.sendMessage(). Rejects IN PROGRESS / DONE tickets (BUG-115).',
      inputSchema: z.object({
        repoRoot: z.string(),
        ids: z.array(z.string()).min(1),
        modelId: z.string().optional(),
        effort: z.enum(['low', 'medium', 'high', 'xhigh']).optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, ids, modelId, effort }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      const canonicalIds = [];
      for (const oneId of ids) {
        const task = data.tasks.find((t) => String(t.id).toLowerCase() === String(oneId).toLowerCase());
        if (!task) {
          return { isError: true, content: [{ type: 'text', text: `Ticket [${oneId}] not found in ${rootDir}` }] };
        }
        if (task.status === 'done' || task.status === 'in_progress' || task.status === 'testing') {
          return {
            isError: true,
            content: [{ type: 'text', text: `Move ${task.status.toUpperCase()} ticket [${task.id}] back to TO DO before re-planning (BUG-115).` }]
          };
        }
        canonicalIds.push(task.id);
      }

      for (const cid of canonicalIds) {
        const task = data.tasks.find((t) => t.id === cid);
        if (task) recordTransition(task, 'ready', 'planning');
      }
      data.activePlanTaskIds = canonicalIds;
      saveBacklogAndRender(rootDir, data);

      const eff = effort || 'high';
      const idListStr = canonicalIds.join(', ');
      const prompt = modelId
        ? `/effort ${eff} /backlog-plan ${idListStr} --model ${modelId}`
        : `/effort ${eff} /backlog-plan ${idListStr}`;

      return {
        content: [{ type: 'text', text: `Locked [${idListStr}] in READY for planning.` }],
        structuredContent: {
          ok: true,
          ids: canonicalIds,
          prompt,
          snapshot: buildWorkspaceSnapshot(rootDir)
        }
      };
    }
  );

  registerAppTool(
    server,
    'app_kickoff_tickets',
    {
      description: 'Transition TO DO / READY tickets into IN PROGRESS (coding) and return the /backlog-start command for app.sendMessage(). Rejects DONE / IN PROGRESS / planningLocked tickets (BUG-115).',
      inputSchema: z.object({
        repoRoot: z.string(),
        ids: z.array(z.string()).min(1),
        modelId: z.string().optional(),
        effort: z.enum(['low', 'medium', 'high', 'xhigh']).optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, ids, modelId, effort }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      const canonicalIds = [];
      for (const oneId of ids) {
        const task = data.tasks.find((t) => String(t.id).toLowerCase() === String(oneId).toLowerCase());
        if (!task) {
          return { isError: true, content: [{ type: 'text', text: `Ticket [${oneId}] not found in ${rootDir}` }] };
        }
        if (task.planningLocked || (task.status === 'ready' && task.liveActivity === 'planning')) {
          return {
            isError: true,
            content: [{ type: 'text', text: `Ticket [${task.id}] is currently locked in READY while planning (BUG-114).` }]
          };
        }
        if (task.status === 'done' || task.status === 'in_progress' || task.status === 'testing') {
          return {
            isError: true,
            content: [{ type: 'text', text: `Move ${task.status.toUpperCase()} ticket [${task.id}] back to TO DO before coding (BUG-115).` }]
          };
        }
        canonicalIds.push(task.id);
      }

      for (const cid of canonicalIds) {
        const task = data.tasks.find((t) => t.id === cid);
        if (task) recordTransition(task, 'in_progress', 'coding');
      }
      saveBacklogAndRender(rootDir, data);

      const eff = effort || 'medium';
      const idListStr = canonicalIds.join(', ');
      const prompt = modelId
        ? `/effort ${eff} /backlog-start ${idListStr} --model ${modelId}`
        : `/effort ${eff} /backlog-start ${idListStr}`;

      return {
        content: [{ type: 'text', text: `Moved [${idListStr}] to IN PROGRESS.` }],
        structuredContent: {
          ok: true,
          ids: canonicalIds,
          prompt,
          snapshot: buildWorkspaceSnapshot(rootDir)
        }
      };
    }
  );

  registerAppTool(
    server,
    'app_unlock_plan',
    {
      description: 'Unlock a planningLocked READY ticket and move it back to TO DO with 0 agent turns executed.',
      inputSchema: z.object({
        repoRoot: z.string(),
        id: z.string()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, id }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      const task = data.tasks.find((t) => String(t.id).toLowerCase() === String(id).toLowerCase());
      if (!task) {
        return { isError: true, content: [{ type: 'text', text: `Ticket [${id}] not found` }] };
      }
      recordTransition(task, 'todo', null);
      delete task.waitingOn;
      if (Array.isArray(data.activePlanTaskIds)) {
        data.activePlanTaskIds = data.activePlanTaskIds.filter((aid) => String(aid).toLowerCase() !== task.id.toLowerCase());
      }
      saveBacklogAndRender(rootDir, data);
      return {
        content: [{ type: 'text', text: `Unlocked [${task.id}] back to TO DO.` }],
        structuredContent: { ok: true, id: task.id, status: 'todo', snapshot: buildWorkspaceSnapshot(rootDir) }
      };
    }
  );

  registerAppTool(
    server,
    'app_add_ticket_isolated',
    {
      description: 'Capture a new idea strictly into TO DO without modifying active WIP or planning artifacts.',
      inputSchema: z.object({
        repoRoot: z.string(),
        title: z.string().min(2),
        description: z.string().optional(),
        priority: z.enum(['high', 'medium', 'low']).optional(),
        type: z.enum(['feature', 'bug', 'ux', 'qa', 'refactor']).optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, title, description, priority, type }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      const cleanTitle = title.trim();
      const inferredBug = /\b(bug|fix|broken|crash|error|regression)\b/i.test(cleanTitle);
      const resolvedType = type || (inferredBug ? 'bug' : 'feature');
      const prefix = resolvedType === 'bug' ? 'BUG' : resolvedType === 'qa' ? 'QA' : resolvedType === 'ux' ? 'UX' : 'FEAT';
      const re = new RegExp(`^${prefix}-(\\d+)$`, 'i');
      const maxNum = data.tasks.reduce((max, t) => {
        const m = String(t.id || '').match(re);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 100);
      const newId = `${prefix}-${maxNum + 1}`;
      const gitCtx = detectGitContext(rootDir);
      const newTask = {
        id: newId,
        type: resolvedType,
        title: cleanTitle,
        status: 'todo',
        priority: priority || (resolvedType === 'bug' ? 'high' : 'medium'),
        components: [],
        attachments: [],
        description: (description || cleanTitle).trim(),
        spec: (description || cleanTitle).trim(),
        acceptanceCriteria: [
          `Implement and verify ${cleanTitle}`,
          `Pass deterministic lint, typecheck, and automated test verification (npm test)`
        ],
        annotations: {
          annotatedAt: new Date().toISOString(),
          complexityTier: 'tier2_standard',
          recommendedPlanModel: 'Gemini 4 Argon (High) / Gemini 4 Carbon (High)',
          recommendedCodeModel: 'Gemini 4 Neon (Medium) / Claude Sonnet 5.5 (Medium)',
          estimatedSavings: '55%–80% via Two-Stage Split Routing (Plan -> READY -> Code)'
        },
        branch: gitCtx.branch,
        worktree: gitCtx.worktreeName,
        activeBranches: [gitCtx.branch],
        createdAt: new Date().toISOString()
      };
      data.tasks.unshift(newTask);
      const jsonPath = path.join(rootDir, 'docs', 'backlog.json');
      fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      return {
        content: [{ type: 'text', text: `Captured [${newId}] in TO DO (0 agent turns run).` }],
        structuredContent: { ok: true, task: newTask, snapshot: buildWorkspaceSnapshot(rootDir) }
      };
    }
  );

  registerAppTool(
    server,
    'app_update_ticket_status',
    {
      description: 'Update non-turn ticket status (e.g. return IN PROGRESS/DONE to TO DO, mark DONE). Rejects mutating planningLocked unless returning to TO DO.',
      inputSchema: z.object({
        repoRoot: z.string(),
        id: z.string(),
        status: z.enum(['todo', 'ready', 'in_progress', 'done'])
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, id, status }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      const task = data.tasks.find((t) => String(t.id).toLowerCase() === String(id).toLowerCase());
      if (!task) return { isError: true, content: [{ type: 'text', text: `Ticket [${id}] not found` }] };
      if ((task.planningLocked || (task.status === 'ready' && task.liveActivity === 'planning')) && status !== 'todo') {
        return { isError: true, content: [{ type: 'text', text: `Ticket [${task.id}] is locked while planning (unlock to TO DO first).` }] };
      }
      if ((task.status === 'done' || task.status === 'in_progress' || task.status === 'testing') && status === 'ready') {
        return { isError: true, content: [{ type: 'text', text: `Move [${task.id}] back to TO DO first before re-planning.` }] };
      }
      if (task.status === 'done' && status === 'in_progress') {
        return { isError: true, content: [{ type: 'text', text: `Move DONE ticket [${task.id}] back to TO DO first before re-coding.` }] };
      }
      recordTransition(task, status, null);
      if (status === 'todo' || status === 'done') delete task.waitingOn;
      if (status === 'done' && Array.isArray(task.actionItems)) {
        task.actionItems.forEach((a) => {
          a.done = true;
        });
      }
      saveBacklogAndRender(rootDir, data);
      return {
        content: [{ type: 'text', text: `Updated [${task.id}] -> ${status.toUpperCase()}` }],
        structuredContent: { ok: true, id: task.id, status: task.status, snapshot: buildWorkspaceSnapshot(rootDir) }
      };
    }
  );

  registerAppTool(
    server,
    'app_reorder_tickets',
    {
      description: 'Persist drag-and-drop card ordering and per-column sort preferences.',
      inputSchema: z.object({
        repoRoot: z.string(),
        orderedIds: z.array(z.string()).optional(),
        columnSorts: z.record(z.string(), z.string()).optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, orderedIds, columnSorts }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      if (Array.isArray(orderedIds) && orderedIds.length > 0) {
        const rank = new Map(orderedIds.map((id, i) => [String(id).toLowerCase(), i]));
        data.tasks.sort((a, b) => {
          const ra = rank.has(String(a.id).toLowerCase()) ? rank.get(String(a.id).toLowerCase()) : 999999;
          const rb = rank.has(String(b.id).toLowerCase()) ? rank.get(String(b.id).toLowerCase()) : 999999;
          return ra - rb;
        });
      }
      if (columnSorts) {
        if (!data.meta) data.meta = {};
        data.meta.columnSorts = { ...(data.meta.columnSorts || {}), ...columnSorts };
      }
      saveBacklogAndRender(rootDir, data);
      return {
        content: [{ type: 'text', text: 'Saved board ordering.' }],
        structuredContent: { ok: true, snapshot: buildWorkspaceSnapshot(rootDir) }
      };
    }
  );

  registerAppTool(
    server,
    'app_save_action_items',
    {
      description: 'Save ticket action items (preserving childTicketId links) and waitingOn summary.',
      inputSchema: z.object({
        repoRoot: z.string(),
        id: z.string(),
        waitingOn: z.string().optional(),
        actionItems: z.array(
          z.object({
            id: z.string().optional(),
            childTicketId: z.string().optional(),
            text: z.string(),
            owner: z.enum(['user', 'antigravity']).optional(),
            done: z.boolean().optional()
          })
        )
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, id, waitingOn, actionItems }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const data = loadBacklogData(rootDir);
      const task = data.tasks.find((t) => String(t.id).toLowerCase() === String(id).toLowerCase());
      if (!task) return { isError: true, content: [{ type: 'text', text: `Ticket [${id}] not found` }] };
      if (typeof waitingOn === 'string') task.waitingOn = waitingOn.trim();
      task.actionItems = actionItems
        .map((item, idx) => ({
          id: item.id || `${task.id}-ACT-${idx + 1}`,
          ...(item.childTicketId ? { childTicketId: item.childTicketId } : {}),
          text: item.text.trim(),
          owner: item.owner === 'user' ? 'user' : 'antigravity',
          done: Boolean(item.done)
        }))
        .filter((i) => i.text);
      saveBacklogAndRender(rootDir, data);
      return {
        content: [{ type: 'text', text: `Saved ${task.actionItems.length} action item(s) for [${task.id}].` }],
        structuredContent: { ok: true, snapshot: buildWorkspaceSnapshot(rootDir) }
      };
    }
  );

  registerAppTool(
    server,
    'app_voice_transcribe',
    {
      description: 'Transcribe MediaRecorder base64 audio or manage host-mic recording (sox/ffmpeg) for TO DO Voice Capture.',
      inputSchema: z.object({
        action: z.enum(['transcribe', 'start_host_mic', 'stop_host_mic']),
        audioBase64: z.string().optional(),
        mimeType: z.string().optional(),
        recordingId: z.string().optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ action, audioBase64, mimeType, recordingId }) => {
      try {
        if (action === 'transcribe') {
          const out = await transcribeAudioBase64(audioBase64, mimeType || 'audio/webm');
          return { content: [{ type: 'text', text: out.transcript }], structuredContent: out };
        }
        if (action === 'start_host_mic') {
          const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const wavPath = path.join(os.tmpdir(), `agmb-mcp-${id}.wav`);
          let proc = null;
          try {
            proc = spawn('rec', ['-q', '-c', '1', '-r', '16000', '-b', '16', wavPath], { stdio: 'ignore' });
          } catch {}
          if (!proc || !proc.pid) {
            proc = spawn('ffmpeg', ['-y', '-f', 'avfoundation', '-i', ':0', '-ac', '1', '-ar', '16000', wavPath], {
              stdio: 'ignore'
            });
          }
          activeHostRecordings.set(id, { proc, wavPath });
          return {
            content: [{ type: 'text', text: `Started host mic recording ${id}` }],
            structuredContent: { ok: true, recordingId: id }
          };
        }
        if (action === 'stop_host_mic') {
          const rec = activeHostRecordings.get(recordingId || '');
          if (!rec) return { isError: true, content: [{ type: 'text', text: 'Recording session not found' }] };
          activeHostRecordings.delete(recordingId);
          try {
            rec.proc.kill('SIGINT');
          } catch {}
          await new Promise((r) => setTimeout(r, 350));
          if (!fs.existsSync(rec.wavPath)) {
            return { isError: true, content: [{ type: 'text', text: 'No audio captured from host microphone' }] };
          }
          const b64 = fs.readFileSync(rec.wavPath).toString('base64');
          try {
            fs.unlinkSync(rec.wavPath);
          } catch {}
          const out = await transcribeAudioBase64(b64, 'audio/wav');
          return { content: [{ type: 'text', text: out.transcript }], structuredContent: out };
        }
        return { isError: true, content: [{ type: 'text', text: 'Unknown voice action' }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: String(err?.message || err) }] };
      }
    }
  );

  registerAppTool(
    server,
    'app_run_memory_audit',
    {
      description: 'Run lint-memory, sync-memory-context, clear watermark reset, docs:sync, or export backup on a workspace.',
      inputSchema: z.object({
        repoRoot: z.string(),
        action: z.enum(['lint', 'sync', 'clear', 'docs_sync', 'export'])
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, action }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const upstreamRoot = resolveUpstreamRepoRoot();
      let cmdPath = '';
      let cmdArgs = [];
      if (action === 'lint') {
        cmdPath = fs.existsSync(path.join(rootDir, 'scripts', 'lint-memory.mjs'))
          ? path.join(rootDir, 'scripts', 'lint-memory.mjs')
          : path.join(upstreamRoot, 'scripts', 'lint-memory.mjs');
      } else if (action === 'clear') {
        cmdPath = fs.existsSync(path.join(rootDir, 'scripts', 'lint-memory.mjs'))
          ? path.join(rootDir, 'scripts', 'lint-memory.mjs')
          : path.join(upstreamRoot, 'scripts', 'lint-memory.mjs');
        cmdArgs = ['--clear'];
      } else if (action === 'sync') {
        cmdPath = fs.existsSync(path.join(rootDir, 'scripts', 'sync-memory-context.mjs'))
          ? path.join(rootDir, 'scripts', 'sync-memory-context.mjs')
          : path.join(upstreamRoot, 'scripts', 'sync-memory-context.mjs');
      } else if (action === 'docs_sync') {
        cmdPath = fs.existsSync(path.join(rootDir, 'scripts', 'sync-living-docs.mjs'))
          ? path.join(rootDir, 'scripts', 'sync-living-docs.mjs')
          : path.join(upstreamRoot, 'scripts', 'sync-living-docs.mjs');
      } else if (action === 'export') {
        cmdPath = path.join(upstreamRoot, 'bin', 'cli.mjs');
        cmdArgs = ['export', rootDir];
      }
      try {
        const output = execFileSync(process.execPath, [cmdPath, ...cmdArgs], {
          cwd: rootDir,
          encoding: 'utf8',
          timeout: 30000
        });
        return {
          content: [{ type: 'text', text: output.slice(0, 4000) || `Completed ${action}` }],
          structuredContent: { ok: true, action, output: output.slice(0, 8000), snapshot: buildWorkspaceSnapshot(rootDir) }
        };
      } catch (err) {
        const combined = `${err.stdout || ''}\n${err.stderr || err.message || ''}`.trim();
        return {
          isError: true,
          content: [{ type: 'text', text: combined.slice(0, 4000) }],
          structuredContent: { ok: false, action, output: combined.slice(0, 8000), snapshot: buildWorkspaceSnapshot(rootDir) }
        };
      }
    }
  );

  registerAppTool(
    server,
    'app_organize_repo',
    {
      description: 'Preview (--dry-run) or apply AI-Native repository root organization via bin/cli.mjs organize.',
      inputSchema: z.object({
        repoRoot: z.string(),
        dryRun: z.boolean().optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, dryRun = true }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const upstreamRoot = resolveUpstreamRepoRoot();
      const cliArgs = ['organize', rootDir, '-y', ...(dryRun ? ['--dry-run'] : [])];
      try {
        const output = execFileSync(process.execPath, [path.join(upstreamRoot, 'bin', 'cli.mjs'), ...cliArgs], {
          cwd: rootDir,
          encoding: 'utf8',
          timeout: 30000
        });
        return {
          content: [{ type: 'text', text: output.slice(0, 4000) }],
          structuredContent: { ok: true, dryRun, output: output.slice(0, 8000), snapshot: buildWorkspaceSnapshot(rootDir) }
        };
      } catch (err) {
        const combined = `${err.stdout || ''}\n${err.stderr || err.message || ''}`.trim();
        return { isError: true, content: [{ type: 'text', text: combined.slice(0, 4000) }] };
      }
    }
  );

  registerAppTool(
    server,
    'app_fleet_manage',
    {
      description: 'Run fleet upgrade_one, upgrade_all, init_repo, trickle_up_scan, or trickle_up_accept.',
      inputSchema: z.object({
        action: z.enum(['upgrade_one', 'upgrade_all', 'init_repo', 'trickle_up_scan', 'trickle_up_accept']),
        targetDir: z.string().optional(),
        ticketId: z.string().optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ action, targetDir, ticketId }) => {
      const upstreamRoot = resolveUpstreamRepoRoot();
      const cliPath = path.join(upstreamRoot, 'bin', 'cli.mjs');
      let cliArgs = [];
      if (action === 'upgrade_all') {
        cliArgs = ['fleet', 'upgrade', '-y', '--no-trickle-up'];
      } else if (action === 'upgrade_one') {
        if (!targetDir) return { isError: true, content: [{ type: 'text', text: 'targetDir required' }] };
        cliArgs = ['upgrade', targetDir, '-y', '--no-trickle-up'];
      } else if (action === 'init_repo') {
        if (!targetDir) return { isError: true, content: [{ type: 'text', text: 'targetDir required' }] };
        cliArgs = ['init', targetDir, '-y'];
      } else if (action === 'trickle_up_scan') {
        cliArgs = ['trickle-up', targetDir || upstreamRoot];
      } else if (action === 'trickle_up_accept') {
        if (!ticketId) return { isError: true, content: [{ type: 'text', text: 'ticketId required' }] };
        cliArgs = ['trickle-up', '--accept', ticketId];
      }
      try {
        const output = execFileSync(process.execPath, [cliPath, ...cliArgs], {
          cwd: upstreamRoot,
          encoding: 'utf8',
          timeout: 60000
        });
        return {
          content: [{ type: 'text', text: output.slice(0, 4000) }],
          structuredContent: {
            ok: true,
            action,
            output: output.slice(0, 8000),
            installations: discoverFleetInstallations()
          }
        };
      } catch (err) {
        const combined = `${err.stdout || ''}\n${err.stderr || err.message || ''}`.trim();
        return { isError: true, content: [{ type: 'text', text: combined.slice(0, 4000) }] };
      }
    }
  );

  registerAppTool(
    server,
    'app_brick_manage',
    {
      description: 'List, run doctor, install, or upgrade Hexagonal Bricks (e.g. bricks/user-profile) in the active workspace.',
      inputSchema: z.object({
        repoRoot: z.string(),
        action: z.enum(['list', 'doctor', 'install', 'upgrade']),
        brickName: z.string().optional(),
        platforms: z.array(z.enum(['web', 'ios', 'android'])).optional(),
        withSchema: z.boolean().optional()
      }),
      _meta: APP_ONLY_META
    },
    async ({ repoRoot, action, brickName = 'user-profile', platforms, withSchema }) => {
      const rootDir = resolveWorkspaceRoot(repoRoot);
      const upstreamRoot = resolveUpstreamRepoRoot();
      if (action === 'list') {
        const bricks = listAvailableBricks(upstreamRoot, rootDir);
        return {
          content: [{ type: 'text', text: `Found ${bricks.length} brick(s)` }],
          structuredContent: { ok: true, bricks }
        };
      }
      const cliArgs = ['brick', action, brickName, rootDir];
      if (Array.isArray(platforms) && platforms.length > 0) {
        cliArgs.push('--platforms', platforms.join(','));
      }
      if (withSchema) cliArgs.push('--with-schema');
      try {
        const output = execFileSync(process.execPath, [path.join(upstreamRoot, 'bin', 'cli.mjs'), ...cliArgs], {
          cwd: rootDir,
          encoding: 'utf8',
          timeout: 30000
        });
        return {
          content: [{ type: 'text', text: output.slice(0, 4000) }],
          structuredContent: {
            ok: true,
            action,
            output: output.slice(0, 8000),
            bricks: listAvailableBricks(upstreamRoot, rootDir)
          }
        };
      } catch (err) {
        const combined = `${err.stdout || ''}\n${err.stderr || err.message || ''}`.trim();
        return { isError: true, content: [{ type: 'text', text: combined.slice(0, 4000) }] };
      }
    }
  );

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logErr('Antigravity Memory Bank MCP App server connected over stdio.');
}

main().catch((err) => {
  logErr('Fatal startup error:', err);
  process.exit(1);
});
