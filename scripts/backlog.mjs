#!/usr/bin/env node
/**
 * Antigravity Zero-Token Local Backlog Engine
 * 
 * Allows capturing, prioritizing, and updating backlog tasks offline with ZERO AI token
 * consumption and ZERO quota drain. Works hand-in-hand with the Antigravity Memory Bank
 * and renders an interactive Kanban board directly in the Antigravity Review Pane.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_PORT = Number(process.env.BACKLOG_PORT || 4199);

const BACKLOG_JSON_PATH = path.join(REPO_ROOT, 'docs', 'backlog.json');
const MIGRATION_BOARD_MD_PATH = fs.existsSync(path.join(REPO_ROOT, 'docs', 'MIGRATION_BOARD.md'))
  ? path.join(REPO_ROOT, 'docs', 'MIGRATION_BOARD.md')
  : path.join(REPO_ROOT, 'docs', 'BACKLOG.md');

let projectName = path.basename(REPO_ROOT);
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  if (pkg.name) projectName = pkg.name;
} catch {}

function getDisplayProjectName(data, rootDir = REPO_ROOT) {
  if (data && data.project) {
    return data.project.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  const fallback = path.basename(rootDir);
  return fallback.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Copy text directly to the native OS clipboard (pbcopy on macOS, clip on Windows, xclip/xsel on Linux)
 */
function copyToNativeOsClipboard(text) {
  try {
    if (process.platform === 'darwin') {
      const res = spawnSync('pbcopy', [], { input: text, encoding: 'utf8', timeout: 2000 });
      return res.status === 0;
    } else if (process.platform === 'win32') {
      const res = spawnSync('clip', [], { input: text, encoding: 'utf8', timeout: 2000 });
      return res.status === 0;
    } else {
      const xclip = spawnSync('xclip', ['-selection', 'clipboard'], { input: text, encoding: 'utf8', timeout: 2000 });
      if (xclip.status === 0) return true;
      const xsel = spawnSync('xsel', ['--clipboard', '--input'], { input: text, encoding: 'utf8', timeout: 2000 });
      return xsel.status === 0;
    }
  } catch {
    return false;
  }
}

/**
 * Count occurrences of a workspace path inside a transcript log
 * (requires trailing '/', '"', '\\', or "'" to avoid partial prefix matches)
 */
function countWorkspaceMentions(text, targetPath) {
  if (!text || !targetPath) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(targetPath, pos)) !== -1) {
    const nextChar = text[pos + targetPath.length];
    if (!nextChar || nextChar === '/' || nextChar === '"' || nextChar === '\\' || nextChar === "'" || nextChar === '\n' || nextChar === ' ') {
      count++;
    }
    pos += targetPath.length;
  }
  return count;
}

/**
 * Find all Antigravity brain conversation directories that belong to this project
 * using workspace-dominance scoring to prevent cross-project false positives.
 */
function findTargetBrainDirs(data, rootDir = REPO_ROOT) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const brainBase = path.join(homeDir, '.gemini', 'antigravity', 'brain');
  if (!fs.existsSync(brainBase)) return [];

  try {
    const entries = fs.readdirSync(brainBase, { withFileTypes: true });
    const parentDir = path.dirname(rootDir);
    const displayProject = getDisplayProjectName(data, rootDir);
    const projectSlug = (data && data.project) || path.basename(rootDir).toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Discover sibling project paths in the same parent folder to compare dominance
    let siblingPaths = [];
    try {
      siblingPaths = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
        .map(d => path.join(parentDir, d.name))
        .filter(p => path.resolve(p) !== path.resolve(rootDir));
    } catch {}

    const candidates = [];
    const now = Date.now();

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'tempmediaStorage') continue;
      const dirPath = path.join(brainBase, entry.name);
      const transcriptPath = path.join(dirPath, '.system_generated', 'logs', 'transcript.jsonl');
      const existingBacklogHtml = path.join(dirPath, 'backlog.html');

      let mtime = 0;
      try {
        const stat = fs.statSync(fs.existsSync(transcriptPath) ? transcriptPath : dirPath);
        mtime = stat.mtimeMs;
      } catch {}

      let myCount = 0;
      let maxOther = 0;
      if (fs.existsSync(transcriptPath)) {
        try {
          const fullText = fs.readFileSync(transcriptPath, 'utf8');
          myCount = countWorkspaceMentions(fullText, rootDir);
          for (const sibPath of siblingPaths) {
            const c = countWorkspaceMentions(fullText, sibPath);
            if (c > maxOther) maxOther = c;
          }
        } catch {}
      }

      let ownsExisting = false;
      if (fs.existsSync(existingBacklogHtml)) {
        try {
          const htmlSample = fs.readFileSync(existingBacklogHtml, 'utf8').slice(0, 4000);
          if (
            htmlSample.includes(`<title>${displayProject} Backlog`) ||
            htmlSample.includes(`"project":"${projectSlug}"`) ||
            htmlSample.includes(`"repoRoot":${JSON.stringify(rootDir)}`)
          ) {
            ownsExisting = true;
          }
        } catch {}
      }

      const isDominantWorkspace = myCount > 0 && myCount >= maxOther * 0.5;
      const isOwnedByProject = ownsExisting && (myCount > 0 || maxOther === 0);
      const isBrandNewUnassigned = myCount === 0 && maxOther === 0 && (now - mtime < 15 * 60 * 1000);

      candidates.push({
        dirPath,
        myCount,
        maxOther,
        mtime,
        ownsExisting,
        matched: isDominantWorkspace || isOwnedByProject || isBrandNewUnassigned
      });
    }

    candidates.sort((a, b) => {
      if (b.myCount !== a.myCount) return b.myCount - a.myCount;
      return b.mtime - a.mtime;
    });

    const matchedDirs = candidates.filter(c => c.matched).map(c => c.dirPath);
    if (matchedDirs.length > 0) {
      return matchedDirs;
    }

    // Fallback: if no brain dir met the dominance threshold, pick the one with highest myCount > 0
    const withMentions = candidates.find(c => c.myCount > 0);
    if (withMentions) return [withMentions.dirPath];

    // Only fallback to most recent if the brain dir is genuinely unowned and has zero mentions of other workspaces
    const unownedRecent = candidates.find(c => !c.ownsExisting && c.maxOther === 0);
    if (unownedRecent) return [unownedRecent.dirPath];

    return [];
  } catch {
    return [];
  }
}

// Load backlog JSON
function loadBacklog(rootDir = REPO_ROOT) {
  const jsonPath = path.join(rootDir, 'docs', 'backlog.json');
  const fallbackName = path.basename(rootDir);
  if (!fs.existsSync(jsonPath)) {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      project: fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      tasks: [],
      milestones: []
    };
  }
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error(`❌ Failed to parse ${jsonPath}:`, err.message);
    process.exit(1);
  }
}

// Save backlog JSON
function saveBacklog(data, rootDir = REPO_ROOT) {
  const jsonPath = path.join(rootDir, 'docs', 'backlog.json');
  data.lastUpdated = new Date().toISOString();
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getMigrationBoardPath(rootDir = REPO_ROOT) {
  return fs.existsSync(path.join(rootDir, 'docs', 'MIGRATION_BOARD.md'))
    ? path.join(rootDir, 'docs', 'MIGRATION_BOARD.md')
    : path.join(rootDir, 'docs', 'BACKLOG.md');
}

// Render docs/MIGRATION_BOARD.md or docs/BACKLOG.md from backlog data
function renderMigrationBoard(data, rootDir = REPO_ROOT) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const boardPath = getMigrationBoardPath(rootDir);
  const bugFixPath = path.join(rootDir, 'docs', 'BUG_FIX_RECORDS.md');
  const bugFixNotice = fs.existsSync(bugFixPath)
    ? ` For historical bug fixes and root-cause analyses, refer to [\`docs/BUG_FIX_RECORDS.md\`](file://${bugFixPath}).`
    : '';

  const lines = [
    `# ${displayProject} — Development & Backlog Board`,
    '',
    `This board tracks active development tickets, feature backlogs, architecture initiatives, and sprint milestones for ${displayProject}.${bugFixNotice}`,
    '',
    '---',
    '',
    '## 1. Active Feature Backlog',
    ''
  ];

  const activeTasks = data.tasks.filter(t => t.type === 'feature' || t.type === 'bug' || t.type === 'refactor' || !t.type);
  for (const task of activeTasks) {
    const statusLabel = task.status === 'done' ? 'Completed (`DONE`)'
      : task.status === 'in_progress' ? 'In Progress (`IN_PROGRESS`)'
      : task.status === 'testing' ? 'In Testing (`TESTING`)'
      : 'Backlog (`TODO`)';
    
    const prioLabel = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium';

    lines.push(`### ${task.id}: ${task.title}`);
    lines.push(`- **Status:** ${statusLabel}`);
    lines.push(`- **Priority:** ${prioLabel}`);
    if (task.components && task.components.length > 0) {
      lines.push(`- **Components:** ${task.components.map(c => `\`${c}\``).join(', ')}`);
    }
    if (task.description) {
      lines.push(`- **Description:** ${task.description}`);
    }
    if (task.spec) {
      lines.push(`- **Technical Specification:**\n  ${task.spec.replace(/\n/g, '\n  ')}`);
    }
    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      lines.push('- **Acceptance Criteria:**');
      for (const ac of task.acceptanceCriteria) {
        const checked = task.status === 'done' ? '[x]' : '[ ]';
        lines.push(`  - ${checked} ${ac}`);
      }
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  const qaTasks = data.tasks.filter(t => t.type === 'qa');
  if (qaTasks.length > 0) {
    lines.push('## 2. Active Quality Assurance & Release Validation');
    lines.push('');
    for (const task of qaTasks) {
      const statusLabel = task.status === 'done' ? 'Completed (`DONE`)'
        : task.status === 'in_progress' ? 'In Progress (`IN_PROGRESS`)'
        : task.status === 'testing' ? 'In Progress (`TESTING`)'
        : 'Backlog (`TODO`)';
      lines.push(`### ${task.id}: ${task.title}`);
      lines.push(`- **Status:** ${statusLabel}`);
      if (task.components && task.components.length > 0) lines.push(`- **Platform:** ${task.components.join(', ')}`);
      if (task.description) lines.push(`- **Scope:**\n  ${task.description}`);
      if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
        lines.push('- **Acceptance Criteria:**');
        for (const ac of task.acceptanceCriteria) {
          const checked = task.status === 'done' ? '[x]' : '[ ]';
          lines.push(`  - ${checked} ${ac}`);
        }
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  if (data.milestones && data.milestones.length > 0) {
    lines.push('## 3. Completed Migration Milestones');
    lines.push('');
    for (const m of data.milestones) {
      const checked = m.status === 'done' ? '[x]' : '[ ]';
      lines.push(`- ${checked} **${m.id}**: ${m.title}`);
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(boardPath), { recursive: true });
  fs.writeFileSync(boardPath, lines.join('\n') + '\n', 'utf8');
}

function escapeHtmlServer(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttrServer(str) {
  if (!str) return '';
  return String(str).replace(/[^a-zA-Z0-9_-]/g, '');
}

function renderCardServer(task) {
  const isDone = task.status === 'done';
  const isInProgress = task.status === 'in_progress' || task.status === 'testing';
  const safeIdAttr = escapeAttrServer(task.id);
  const safeIdHtml = escapeHtmlServer(task.id);
  const safeTitleHtml = escapeHtmlServer(task.title);
  const safeDescHtml = escapeHtmlServer(task.description);

  const prioColor = task.priority === 'high'
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : task.priority === 'medium'
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  const typeBadge = task.type === 'feature' ? 'FEAT'
    : task.type === 'bug' ? 'BUG'
    : task.type === 'qa' ? 'QA'
    : 'TASK';

  return `
        <div class="bg-[var(--card,#1e293b)] border border-[var(--border,#334155)] hover:border-slate-500 rounded-xl p-3 shadow-sm transition group">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-mono text-xs font-bold text-blue-400">${safeIdHtml}</span>
              <span class="badge border rounded px-1.5 py-0.5 ${prioColor}">${escapeHtmlServer(task.priority || 'med')}</span>
              <span class="badge bg-slate-700/50 text-slate-300 rounded px-1.5 py-0.5">${typeBadge}</span>
            </div>
            <div class="opacity-80 group-hover:opacity-100 flex items-center gap-1">
              ${!isDone
                ? `<button onclick="updateTaskStatus('${safeIdAttr}', 'done')" class="text-xs hover:text-emerald-400 p-0.5" title="Mark Done">✅</button>`
                : `<button onclick="updateTaskStatus('${safeIdAttr}', 'todo')" class="text-xs hover:text-amber-400 p-0.5" title="Move to To-Do">↩️</button>`}
              ${!isInProgress && !isDone
                ? `<button onclick="updateTaskStatus('${safeIdAttr}', 'in_progress')" class="text-xs hover:text-blue-400 p-0.5" title="Mark In Progress">⚡</button>`
                : ''}
            </div>
          </div>
          <h3 class="text-xs font-semibold text-[var(--foreground,#f8fafc)] leading-snug mb-1.5 ${isDone ? 'line-through opacity-70' : ''}">
            ${safeTitleHtml}
          </h3>
          ${safeDescHtml ? `<p class="text-xs text-[var(--muted-foreground,#94a3b8)] line-clamp-2 mb-2 leading-relaxed">${safeDescHtml}</p>` : ''}
          ${task.components && task.components.length > 0
            ? `<div class="flex flex-wrap gap-1 mb-2.5">${task.components.map(c => `<span class="text-xs font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded">${escapeHtmlServer(String(c).split('/').pop())}</span>`).join('')}</div>`
            : ''}
          <div class="pt-2 border-t border-[var(--border,#334155)]/50 flex items-center justify-between gap-2">
            ${!isDone
              ? `<button onclick="kickoffTask('${safeIdAttr}')" class="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer"><span>🤖</span> Kickoff Prompt</button>`
              : `<span class="text-xs text-emerald-400 font-medium">✓ Completed</span>`}
            <button onclick="copyCliCommand('npm run backlog status ${safeIdAttr} in_progress')" class="text-xs text-[var(--muted-foreground,#94a3b8)] hover:text-white font-mono cursor-pointer">CLI copy</button>
          </div>
        </div>`;
}

// Generate the interactive HTML artifact for Antigravity's Review pane
function generateReviewArtifactHtml(data, rootDir = REPO_ROOT) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const payload = { ...data, repoRoot: rootDir };
  const jsonString = JSON.stringify(payload).replace(/</g, '\\u003c');

  const initialTodo = (data.tasks || []).filter(t => t.status === 'todo');
  const initialInProg = (data.tasks || []).filter(t => t.status === 'in_progress' || t.status === 'testing');
  const initialDone = (data.tasks || []).filter(t => t.status === 'done');

  const todoHtml = initialTodo.map(renderCardServer).join('') || '<div class="text-xs text-slate-500 p-4 text-center">No to-do tasks</div>';
  const inProgHtml = initialInProg.map(renderCardServer).join('') || '<div class="text-xs text-slate-500 p-4 text-center">No active tasks in progress</div>';
  const doneHtml = initialDone.map(renderCardServer).join('') || '<div class="text-xs text-slate-500 p-4 text-center">No completed tasks</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${displayProject} Backlog & Sprint Board</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    .badge {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body class="bg-[var(--background,#0f172a)] text-[var(--foreground,#f8fafc)] antialiased p-4 min-h-screen">
  
  <!-- Header Bar -->
  <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[var(--border,#334155)] gap-3">
    <div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xl">📅</span>
        <h1 class="text-xl font-bold tracking-tight text-[var(--foreground,#f8fafc)]">${displayProject} Local Backlog</h1>
        <span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-medium">0 Tokens • Frugal Mode</span>
        <span id="bridgeStatusBadge" class="bg-slate-700/60 text-slate-300 border border-slate-600/40 text-xs px-2 py-0.5 rounded-full font-mono">Bridge: Ready</span>
      </div>
      <p class="text-xs text-[var(--muted-foreground,#94a3b8)] mt-1">
        Decoupled offline task capture. Click <strong>"🤖 Kickoff Prompt"</strong> on any ticket to copy &amp; activate <code>/backlog-start &lt;ID&gt;</code> with zero context bloat.
      </p>
    </div>
    
    <div class="flex items-center gap-2">
      <button onclick="toggleQuickAdd()" class="bg-[var(--primary,#3b82f6)] hover:opacity-90 text-[var(--primary-foreground,#ffffff)] text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5">
        <span>➕</span> Quick Capture Task
      </button>
      <button onclick="refreshData()" class="bg-[var(--card,#1e293b)] hover:bg-[var(--border,#334155)] text-[var(--foreground,#f8fafc)] border border-[var(--border,#334155)] text-xs px-2.5 py-1.5 rounded-lg transition" title="Refresh Board">
        🔄
      </button>
    </div>
  </div>

  <!-- Interactive Ready-to-Paste Kickoff Prompt Bar -->
  <div id="kickoffBanner" class="hidden mb-4 bg-blue-950/60 border border-blue-500/50 rounded-xl p-3 shadow-lg">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-base">🚀</span>
        <div>
          <div class="text-xs font-bold text-blue-300" id="kickoffBannerTitle">Ready to Execute in Antigravity Chat</div>
          <div class="text-xs text-slate-300" id="kickoffBannerSub">Prompt is copied &amp; selected below — press <kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs font-mono">⌘V</kbd> in the conversation window (or <kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs font-mono">⌘C</kbd> then <kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs font-mono">⌘V</kbd>):</div>
        </div>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <input id="kickoffPromptInput" type="text" readonly onclick="this.focus();this.select();" class="w-full sm:w-64 bg-slate-900 border border-blue-400/60 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-400 selection:bg-blue-600 selection:text-white" value="/backlog-start ">
        <button onclick="reCopyFromBanner()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition whitespace-nowrap">
          📋 Copy
        </button>
        <button onclick="document.getElementById('kickoffBanner').classList.add('hidden')" class="text-xs text-slate-400 hover:text-white px-1.5 py-1">✕</button>
      </div>
    </div>
  </div>

  <!-- Quick Capture Form (Collapsible) -->
  <div id="quickAddPanel" class="hidden mb-6 bg-[var(--card,#1e293b)] border border-[var(--primary,#3b82f6)]/40 rounded-xl p-4 shadow-lg">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-[var(--foreground,#f8fafc)] flex items-center gap-1.5">
        <span>⚡</span> Fast Offline Task Capture (0 Credits)
      </h3>
      <button onclick="toggleQuickAdd()" class="text-xs text-[var(--muted-foreground,#94a3b8)] hover:text-white">✕ Close</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
      <div>
        <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Ticket ID</label>
        <input id="newId" type="text" placeholder="e.g. FEAT-115" class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
      </div>
      <div>
        <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Type</label>
        <select id="newType" class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
          <option value="feature">Feature</option>
          <option value="bug">Bug Fix</option>
          <option value="qa">QA / Validation</option>
          <option value="refactor">Refactor</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Priority</label>
        <select id="newPriority" class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
          <option value="high">High</option>
          <option value="medium" selected>Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
    <div class="mb-3">
      <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Title</label>
      <input id="newTitle" type="text" placeholder="Short, actionable feature or bug title" class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
    </div>
    <div class="mb-3">
      <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Description &amp; Acceptance Criteria</label>
      <textarea id="newDesc" rows="2" placeholder="Brief technical summary and key acceptance criteria..." class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500"></textarea>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-xs text-[var(--muted-foreground,#94a3b8)]">Adds instantly to local backlog with 0 AI tokens.</span>
      <div class="flex gap-2">
        <button onclick="saveNewTask()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition">
          Save Task Offline
        </button>
      </div>
    </div>
  </div>

  <!-- Filter & Search Toolbar -->
  <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div class="flex flex-wrap items-center gap-1.5">
      <button onclick="setFilter('all', this)" class="filter-btn active bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-blue-500 text-white font-bold">All</button>
      <button onclick="setFilter('todo', this)" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-[var(--muted-foreground,#94a3b8)]">To-Do</button>
      <button onclick="setFilter('in_progress', this)" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-[var(--muted-foreground,#94a3b8)]">In Progress</button>
      <button onclick="setFilter('high', this)" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-rose-400">🔥 High Priority</button>
      <button onclick="setFilter('done', this)" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-emerald-400">Done</button>
    </div>
    <div class="relative w-full sm:w-64">
      <input id="searchInput" oninput="renderBoard()" type="text" placeholder="Search tasks..." class="w-full bg-[var(--card,#1e293b)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1 text-xs text-[var(--foreground,#f8fafc)] placeholder-[var(--muted-foreground,#94a3b8)] focus:outline-none focus:border-blue-500">
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-xl hidden transition-all duration-300 z-50"></div>

  <!-- Kanban Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <!-- Column: Backlog / To-Do -->
    <div class="bg-[var(--card,#1e293b)]/40 border border-[var(--border,#334155)] rounded-xl p-3 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border,#334155)]">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--foreground,#f8fafc)]">To-Do / Backlog</h2>
        </div>
        <span id="count-todo" class="text-xs bg-[var(--card,#1e293b)] px-1.5 py-0.5 rounded font-mono text-[var(--muted-foreground,#94a3b8)]">${initialTodo.length}</span>
      </div>
      <div id="col-todo" class="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-1">${todoHtml}</div>
    </div>

    <!-- Column: In Progress & Testing -->
    <div class="bg-[var(--card,#1e293b)]/40 border border-[var(--border,#334155)] rounded-xl p-3 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border,#334155)]">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--foreground,#f8fafc)]">In Progress / QA</h2>
        </div>
        <span id="count-inprogress" class="text-xs bg-[var(--card,#1e293b)] px-1.5 py-0.5 rounded font-mono text-[var(--muted-foreground,#94a3b8)]">${initialInProg.length}</span>
      </div>
      <div id="col-inprogress" class="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-1">${inProgHtml}</div>
    </div>

    <!-- Column: Done -->
    <div class="bg-[var(--card,#1e293b)]/40 border border-[var(--border,#334155)] rounded-xl p-3 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border,#334155)]">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--foreground,#f8fafc)]">Completed (Done)</h2>
        </div>
        <span id="count-done" class="text-xs bg-[var(--card,#1e293b)] px-1.5 py-0.5 rounded font-mono text-[var(--muted-foreground,#94a3b8)]">${initialDone.length}</span>
      </div>
      <div id="col-done" class="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-1">${doneHtml}</div>
    </div>

  </div>

  <script>
    let rawData = ${jsonString};
    const BRIDGE_URL = 'http://127.0.0.1:${DEFAULT_PORT}';
    let currentFilter = 'all';
    let bridgeOnline = false;

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function escapeAttr(str) {
      if (!str) return '';
      return String(str).replace(/[^a-zA-Z0-9_-]/g, '');
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.remove('hidden');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3800);
    }

    /**
     * Multi-layer synchronous + asynchronous clipboard copy that works inside
     * sandboxed Electron Review pane iframes, file:// origins, and standard browsers.
     */
    function copyTextToClipboard(text, showBanner = false, taskId = '') {
      let copied = false;

      // Layer 1: Synchronous DOM textarea + execCommand('copy') (works in sandboxed iframes)
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.width = '2em';
        ta.style.height = '2em';
        ta.style.padding = '0';
        ta.style.border = 'none';
        ta.style.outline = 'none';
        ta.style.boxShadow = 'none';
        ta.style.background = 'transparent';
        ta.style.opacity = '0.01';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, text.length);
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}

      // Layer 2: Populate & synchronously select + copy from the visible top Kickoff Banner
      if (showBanner) {
        const banner = document.getElementById('kickoffBanner');
        const input = document.getElementById('kickoffPromptInput');
        if (banner && input) {
          banner.classList.remove('hidden');
          input.removeAttribute('readonly');
          input.value = text;
          try {
            input.focus();
            input.select();
            input.setSelectionRange(0, text.length);
            if (document.execCommand('copy')) copied = true;
          } catch (e) {}
          input.setAttribute('readonly', '');
          try {
            input.focus();
            input.select();
          } catch (e) {}
        }
      }

      // Layer 3: Async Clipboard API fallback
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(text).catch(() => {});
          copied = true;
        }
      } catch (e) {}

      // Layer 4: Notify parent frame via postMessage
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'antigravity:kickoff',
            command: 'insertPrompt',
            prompt: text,
            text: text,
            taskId: taskId
          }, '*');
        }
      } catch (e) {}

      return copied;
    }

    function reCopyFromBanner() {
      const input = document.getElementById('kickoffPromptInput');
      if (!input) return;
      const text = input.value;
      copyTextToClipboard(text, true);
      callLocalBridge('/api/kickoff', { repoRoot: rawData.repoRoot, prompt: text });
      showToast('📋 Copied "' + text + '" to clipboard!');
    }

    async function callLocalBridge(endpoint, payload) {
      try {
        const res = await fetch(BRIDGE_URL + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setBridgeBadge(true);
          return data;
        }
      } catch (e) {
        // Fallback: if iframe CSP blocks fetch (connect-src), fire a GET image beacon
        try {
          const img = new Image();
          img.src = BRIDGE_URL + '/api/trigger?endpoint=' + encodeURIComponent(endpoint) + '&data=' + encodeURIComponent(JSON.stringify(payload)) + '&t=' + Date.now();
        } catch (err) {}
      }
      return null;
    }

    function setBridgeBadge(online) {
      bridgeOnline = online;
      const badge = document.getElementById('bridgeStatusBadge');
      if (!badge) return;
      if (online) {
        badge.textContent = '⚡ Native Bridge: Live';
        badge.className = 'bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full font-mono';
      } else {
        badge.textContent = '📋 Offline Mode (Auto-Select)';
        badge.className = 'bg-slate-700/60 text-slate-300 border border-slate-600/40 text-xs px-2 py-0.5 rounded-full font-mono';
      }
    }

    async function probeBridge() {
      try {
        const res = await fetch(BRIDGE_URL + '/api/health', { method: 'GET' });
        if (res.ok) {
          setBridgeBadge(true);
          return;
        }
      } catch (e) {}
      setBridgeBadge(false);
    }

    function toggleQuickAdd() {
      const panel = document.getElementById('quickAddPanel');
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        const maxNum = rawData.tasks.reduce((max, t) => {
          const match = String(t.id).match(/FEAT-(\\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 100);
        document.getElementById('newId').value = 'FEAT-' + (maxNum + 1);
        document.getElementById('newTitle').focus();
      }
    }

    function setFilter(filter, btnEl) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-white', 'font-bold');
      });
      if (btnEl) {
        btnEl.classList.add('border-blue-500', 'text-white', 'font-bold');
      }
      renderBoard();
    }

    async function kickoffTask(id) {
      const prompt = '/backlog-start ' + id;
      const task = rawData.tasks.find(t => t.id === id);
      if (task && task.status === 'todo') {
        task.status = 'in_progress';
        renderBoard();
      }

      // Immediately copy & highlight synchronously inside click handler
      copyTextToClipboard(prompt, true, id);

      const titleEl = document.getElementById('kickoffBannerTitle');
      if (titleEl && task) {
        titleEl.textContent = '🚀 Ready to Kick Off [' + task.id + ']: ' + task.title;
      }

      // Also invoke local native bridge (runs OS pbcopy + persists in_progress to docs/backlog.json)
      const bridgeRes = await callLocalBridge('/api/kickoff', {
        repoRoot: rawData.repoRoot,
        id: id,
        prompt: prompt
      });

      if (bridgeRes && bridgeRes.ok) {
        showToast('🚀 Copied "' + prompt + '" via OS clipboard & marked ' + id + ' IN_PROGRESS! Paste (⌘V) in chat.');
      } else {
        showToast('📋 Ready: "' + prompt + '" copied & selected in top bar — press ⌘V in Antigravity chat!');
      }
    }

    function copyCliCommand(cmd) {
      copyTextToClipboard(cmd, false);
      callLocalBridge('/api/clipboard', { text: cmd });
      showToast('⚡ CLI command copied: ' + cmd);
    }

    async function updateTaskStatus(id, newStatus) {
      const task = rawData.tasks.find(t => t.id === id);
      if (task) {
        task.status = newStatus;
        renderBoard();
        const bridgeRes = await callLocalBridge('/api/status', {
          repoRoot: rawData.repoRoot,
          id: id,
          status: newStatus
        });
        if (bridgeRes && bridgeRes.ok) {
          showToast('✅ Saved [' + id + '] -> ' + newStatus.toUpperCase() + ' to docs/backlog.json');
        } else {
          const cmd = 'npm run backlog status ' + id + ' ' + newStatus;
          copyCliCommand(cmd);
        }
      }
    }

    async function saveNewTask() {
      const id = document.getElementById('newId').value.trim();
      const title = document.getElementById('newTitle').value.trim();
      const type = document.getElementById('newType').value;
      const priority = document.getElementById('newPriority').value;
      const desc = document.getElementById('newDesc').value.trim();

      if (!id || !title) {
        showToast('⚠️ Please provide both Ticket ID and Title');
        return;
      }

      const newTask = {
        id,
        type,
        title,
        status: 'todo',
        priority,
        components: [],
        description: desc,
        spec: desc,
        acceptanceCriteria: []
      };

      rawData.tasks.unshift(newTask);
      toggleQuickAdd();
      renderBoard();

      const bridgeRes = await callLocalBridge('/api/add', {
        repoRoot: rawData.repoRoot,
        task: newTask
      });

      if (bridgeRes && bridgeRes.ok) {
        showToast('✅ Saved [' + id + '] directly to docs/backlog.json (0 tokens)!');
      } else {
        const cmd = 'npm run backlog add "' + title.replace(/"/g, '\\\\"') + '" --id ' + id + ' --type ' + type + ' --priority ' + priority + ' --desc "' + desc.replace(/"/g, '\\\\"') + '"';
        copyTextToClipboard(cmd, true, id);
        showToast('✅ Task captured! Command copied to persist offline.');
      }
    }

    function renderCard(task) {
      const isDone = task.status === 'done';
      const isInProgress = task.status === 'in_progress' || task.status === 'testing';
      const safeIdAttr = escapeAttr(task.id);
      const safeIdHtml = escapeHtml(task.id);
      const safeTitleHtml = escapeHtml(task.title);
      const safeDescHtml = escapeHtml(task.description);
      
      const prioColor = task.priority === 'high' 
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
        : task.priority === 'medium'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

      const typeBadge = task.type === 'feature' ? 'FEAT'
        : task.type === 'bug' ? 'BUG'
        : task.type === 'qa' ? 'QA'
        : 'TASK';

      return \`
        <div class="bg-[var(--card,#1e293b)] border border-[var(--border,#334155)] hover:border-slate-500 rounded-xl p-3 shadow-sm transition group">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-mono text-xs font-bold text-blue-400">\${safeIdHtml}</span>
              <span class="badge border rounded px-1.5 py-0.5 \${prioColor}">\${escapeHtml(task.priority || 'med')}</span>
              <span class="badge bg-slate-700/50 text-slate-300 rounded px-1.5 py-0.5">\${typeBadge}</span>
            </div>
            
            <!-- Quick Status Toggles -->
            <div class="opacity-80 group-hover:opacity-100 flex items-center gap-1">
              \${!isDone ? \`
                <button onclick="updateTaskStatus('\${safeIdAttr}', 'done')" class="text-xs hover:text-emerald-400 p-0.5" title="Mark Done">✅</button>
              \` : \`
                <button onclick="updateTaskStatus('\${safeIdAttr}', 'todo')" class="text-xs hover:text-amber-400 p-0.5" title="Move to To-Do">↩️</button>
              \`}
              \${!isInProgress && !isDone ? \`
                <button onclick="updateTaskStatus('\${safeIdAttr}', 'in_progress')" class="text-xs hover:text-blue-400 p-0.5" title="Mark In Progress">⚡</button>
              \` : ''}
            </div>
          </div>

          <h3 class="text-xs font-semibold text-[var(--foreground,#f8fafc)] leading-snug mb-1.5 \${isDone ? 'line-through opacity-70' : ''}">
            \${safeTitleHtml}
          </h3>

          \${safeDescHtml ? \`
            <p class="text-xs text-[var(--muted-foreground,#94a3b8)] line-clamp-2 mb-2 leading-relaxed">
              \${safeDescHtml}
            </p>
          \` : ''}

          \${task.components && task.components.length > 0 ? \`
            <div class="flex flex-wrap gap-1 mb-2.5">
              \${task.components.map(c => \`<span class="text-xs font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded">\${escapeHtml(String(c).split('/').pop())}</span>\`).join('')}
            </div>
          \` : ''}

          <!-- Action Footer -->
          <div class="pt-2 border-t border-[var(--border,#334155)]/50 flex items-center justify-between gap-2">
            \${!isDone ? \`
              <button onclick="kickoffTask('\${safeIdAttr}')" class="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer">
                <span>🤖</span> Kickoff Prompt
              </button>
            \` : \`
              <span class="text-xs text-emerald-400 font-medium">✓ Completed</span>
            \`}
            <button onclick="copyCliCommand('npm run backlog status \${safeIdAttr} in_progress')" class="text-xs text-[var(--muted-foreground,#94a3b8)] hover:text-white font-mono cursor-pointer">
              CLI copy
            </button>
          </div>
        </div>
      \`;
    }

    function renderBoard() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      
      const filterTask = (t) => {
        const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
        if (!matchesQuery) return false;
        if (currentFilter === 'all') return true;
        if (currentFilter === 'todo') return t.status === 'todo';
        if (currentFilter === 'in_progress') return t.status === 'in_progress' || t.status === 'testing';
        if (currentFilter === 'done') return t.status === 'done';
        if (currentFilter === 'high') return t.priority === 'high';
        return true;
      };

      const todoTasks = rawData.tasks.filter(t => t.status === 'todo' && filterTask(t));
      const inProgressTasks = rawData.tasks.filter(t => (t.status === 'in_progress' || t.status === 'testing') && filterTask(t));
      const doneTasks = rawData.tasks.filter(t => t.status === 'done' && filterTask(t));

      document.getElementById('col-todo').innerHTML = todoTasks.map(renderCard).join('') || '<div class="text-xs text-slate-500 p-4 text-center">No to-do tasks</div>';
      document.getElementById('col-inprogress').innerHTML = inProgressTasks.map(renderCard).join('') || '<div class="text-xs text-slate-500 p-4 text-center">No active tasks in progress</div>';
      document.getElementById('col-done').innerHTML = doneTasks.map(renderCard).join('') || '<div class="text-xs text-slate-500 p-4 text-center">No completed tasks</div>';

      document.getElementById('count-todo').textContent = todoTasks.length;
      document.getElementById('count-inprogress').textContent = inProgressTasks.length;
      document.getElementById('count-done').textContent = doneTasks.length;
    }

    function refreshData() {
      location.reload();
    }

    // Initial render + local bridge probe
    renderBoard();
    probeBridge();
  </script>
</body>
</html>`;
}

// Generate the markdown review artifact
function generateReviewArtifactMd(data, rootDir = REPO_ROOT) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const boardPath = getMigrationBoardPath(rootDir);
  const lines = [
    `# ${displayProject} — Local Backlog & Review Board`,
    '',
    '> [!TIP]',
    '> **0 Token Decoupled Task Management**: Maintain your backlog offline without draining AI credits or quota. When ready, kick off any ticket with a single-line frugal prompt.',
    '',
    '## 1. Active Feature Backlog (Ready for Implementation)',
    ''
  ];

  const todoTasks = data.tasks.filter(t => t.status === 'todo');
  for (const task of todoTasks) {
    const linkPath = `file://${boardPath}#${task.id.toLowerCase()}`;
    lines.push(`### [${task.id}](${linkPath}): ${task.title}`);
    lines.push(`- **Priority:** \`${task.priority || 'medium'}\` | **Type:** \`${task.type || 'feature'}\``);
    if (task.description) lines.push(`- **Overview:** ${task.description}`);
    if (task.components && task.components.length > 0) {
      lines.push(`- **Target Files:** ${task.components.map(c => `\`${c}\``).join(', ')}`);
    }
    lines.push(`- **Frugal Kickoff:** \`/backlog-start ${task.id}\``);
    lines.push('');
  }

  const inProgTasks = data.tasks.filter(t => t.status === 'in_progress' || t.status === 'testing');
  if (inProgTasks.length > 0) {
    lines.push('## 2. In Progress & Testing');
    lines.push('');
    for (const task of inProgTasks) {
      lines.push(`- ⚡ **${task.id}: ${task.title}** (${task.status})`);
      if (task.description) lines.push(`  ${task.description}`);
    }
    lines.push('');
  }

  const doneTasks = data.tasks.filter(t => t.status === 'done');
  lines.push('## 3. Recently Completed Tasks');
  lines.push('');
  for (const task of doneTasks) {
    lines.push(`- ✅ **${task.id}**: ${task.title}`);
  }
  lines.push('');

  return lines.join('\n');
}

// Write the Review Pane artifacts to docs/backlog.html and all matched conversation brain folders
function writeReviewPaneArtifacts(data, rootDir = REPO_ROOT) {
  const htmlContent = generateReviewArtifactHtml(data, rootDir);
  const mdContent = generateReviewArtifactMd(data, rootDir);
  const boardPath = getMigrationBoardPath(rootDir);

  // Always write docs/backlog.html in the repository
  const localHtmlPath = path.join(rootDir, 'docs', 'backlog.html');
  fs.mkdirSync(path.dirname(localHtmlPath), { recursive: true });
  fs.writeFileSync(localHtmlPath, htmlContent, 'utf8');

  const brainDirs = findTargetBrainDirs(data, rootDir);
  if (brainDirs.length === 0) {
    console.log(`ℹ️  No active Antigravity brain directory detected. Saved to file://${localHtmlPath}`);
    return;
  }

  const displayProject = getDisplayProjectName(data, rootDir);
  console.log(`✨ Review pane artifacts refreshed (${brainDirs.length} brain dir${brainDirs.length > 1 ? 's' : ''} + workspace):`);
  console.log(`   - file://${localHtmlPath}`);

  for (const brainDir of brainDirs) {
    const htmlPath = path.join(brainDir, 'backlog.html');
    const htmlMetaPath = path.join(brainDir, 'backlog.html.metadata.json');
    const mdPath = path.join(brainDir, 'backlog-board.md');
    const mdMetaPath = path.join(brainDir, 'backlog-board.md.metadata.json');

    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    fs.writeFileSync(htmlMetaPath, JSON.stringify({
      summary: `Interactive ${displayProject} Backlog & Sprint Board for zero-token task capture and frugal agent execution.`,
      userFacing: true,
      requestFeedback: false,
      updatedAt: new Date().toISOString()
    }, null, 2), 'utf8');

    fs.writeFileSync(mdPath, mdContent, 'utf8');
    fs.writeFileSync(mdMetaPath, JSON.stringify({
      summary: `Markdown Backlog and Sprint Status board for ${displayProject} linking to docs/backlog.json and ${path.relative(rootDir, boardPath)}.`,
      userFacing: true,
      requestFeedback: true,
      updatedAt: new Date().toISOString()
    }, null, 2), 'utf8');

    console.log(`   - [${path.basename(brainDir)}] file://${htmlPath}`);
  }
}

/**
 * Ensure the lightweight background bridge daemon on 127.0.0.1:4199 is running
 * so clicking "Kickoff Prompt" or status toggles in backlog.html has native OS pbcopy
 * and live docs/backlog.json persistence.
 */
function ensureDaemonRunning() {
  if (process.env.CI || process.env.NODE_TEST_CONTEXT || process.env.ANTIGRAVITY_NO_DAEMON) {
    return;
  }
  const req = http.get(`http://127.0.0.1:${DEFAULT_PORT}/api/health`, { timeout: 150 }, (res) => {
    res.resume();
  });
  req.on('error', () => {
    try {
      const child = spawn(process.execPath, [__filename, 'serve', '--port', String(DEFAULT_PORT)], {
        cwd: REPO_ROOT,
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
    } catch {}
  });
  req.on('timeout', () => {
    req.destroy();
  });
}

function startBridgeServer(port = DEFAULT_PORT) {
  const sendJson = (res, status, obj) => {
    const body = JSON.stringify(obj);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Private-Network': 'true',
      'Cache-Control': 'no-store'
    });
    res.end(body);
  };

  const resolveSafeRepoRoot = (candidate) => {
    if (candidate && typeof candidate === 'string' && fs.existsSync(path.join(candidate, 'docs', 'backlog.json'))) {
      return path.resolve(candidate);
    }
    return REPO_ROOT;
  };

  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Private-Network': 'true'
      });
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true, service: 'antigravity-backlog-bridge', port });
      return;
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/backlog.html')) {
      const targetRoot = resolveSafeRepoRoot(url.searchParams.get('repoRoot'));
      const data = loadBacklog(targetRoot);
      const html = generateReviewArtifactHtml(data, targetRoot);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(html);
      return;
    }

    const executeBridgeAction = (endpoint, body) => {
      const targetRoot = resolveSafeRepoRoot(body.repoRoot);

      if (endpoint === '/api/clipboard') {
        const text = String(body.text || body.prompt || '');
        const copied = text ? copyToNativeOsClipboard(text) : false;
        return { status: 200, payload: { ok: true, copied } };
      }

      if (endpoint === '/api/kickoff') {
        const id = String(body.id || '').trim();
        const prompt = String(body.prompt || (id ? `/backlog-start ${id}` : '')).trim();
        const copied = prompt ? copyToNativeOsClipboard(prompt) : false;

        if (id) {
          const data = loadBacklog(targetRoot);
          const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
          if (task && task.status === 'todo') {
            task.status = 'in_progress';
            saveBacklog(data, targetRoot);
            renderMigrationBoard(data, targetRoot);
            writeReviewPaneArtifacts(data, targetRoot);
          }
        }
        return { status: 200, payload: { ok: true, copied, prompt, id } };
      }

      if (endpoint === '/api/status') {
        const id = String(body.id || '').trim();
        const newStatus = String(body.status || '').trim().toLowerCase();
        const data = loadBacklog(targetRoot);
        const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
        if (!task) {
          return { status: 404, payload: { ok: false, error: 'Task not found' } };
        }
        task.status = newStatus;
        saveBacklog(data, targetRoot);
        renderMigrationBoard(data, targetRoot);
        writeReviewPaneArtifacts(data, targetRoot);
        return { status: 200, payload: { ok: true, id: task.id, status: task.status } };
      }

      if (endpoint === '/api/add') {
        const t = body.task || {};
        if (!t.id || !t.title) {
          return { status: 400, payload: { ok: false, error: 'Missing id or title' } };
        }
        const data = loadBacklog(targetRoot);
        if (!data.tasks.some(existing => existing.id.toLowerCase() === String(t.id).toLowerCase())) {
          data.tasks.unshift({
            id: String(t.id).trim(),
            type: t.type || 'feature',
            title: String(t.title).trim(),
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            components: Array.isArray(t.components) ? t.components : [],
            description: String(t.description || ''),
            spec: String(t.spec || t.description || ''),
            acceptanceCriteria: Array.isArray(t.acceptanceCriteria) ? t.acceptanceCriteria : []
          });
          saveBacklog(data, targetRoot);
          renderMigrationBoard(data, targetRoot);
          writeReviewPaneArtifacts(data, targetRoot);
        }
        return { status: 200, payload: { ok: true, id: t.id } };
      }

      return { status: 404, payload: { ok: false, error: 'Unknown endpoint' } };
    };

    if (req.method === 'GET' && url.pathname === '/api/trigger') {
      try {
        const endpoint = url.searchParams.get('endpoint') || '/api/kickoff';
        const body = JSON.parse(url.searchParams.get('data') || '{}');
        executeBridgeAction(endpoint, body);
      } catch {}
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      });
      res.end(pixel);
      return;
    }

    if (req.method === 'POST') {
      let rawBody = '';
      req.on('data', chunk => {
        rawBody += chunk;
        if (rawBody.length > 1e6) req.destroy();
      });
      req.on('end', () => {
        try {
          const body = rawBody ? JSON.parse(rawBody) : {};
          const result = executeBridgeAction(url.pathname, body);
          sendJson(res, result.status, result.payload);
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err.message });
        }
      });
      return;
    }

    sendJson(res, 404, { ok: false, error: 'Not found' });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`ℹ️  Backlog bridge server already running on http://127.0.0.1:${port}`);
      process.exit(0);
    }
    console.error('❌ Bridge server error:', err.message);
    process.exit(1);
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`🚀 Antigravity Backlog Live Bridge listening on http://127.0.0.1:${port}`);
  });
}

// CLI commands
function printUsage(data) {
  const displayProject = getDisplayProjectName(data);
  console.log(`
${displayProject} Zero-Token Local Backlog Engine

Usage:
  npm run backlog list [todo|in_progress|done|high|all]
  npm run backlog add "<title>" [--id <ID>] [--type <feature|bug|qa|refactor>] [--priority <high|medium|low>] [--desc "<desc>"] [--components "<file1,file2>"]
  npm run backlog status <id> <todo|in_progress|testing|done>
  npm run backlog start <id>
  npm run backlog done <id>
  npm run backlog render
  npm run backlog serve [--port 4199]
  npm run backlog prompt <id>
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  if (command === 'serve') {
    let port = DEFAULT_PORT;
    const portIdx = args.indexOf('--port');
    if (portIdx !== -1 && args[portIdx + 1]) {
      port = Number(args[portIdx + 1]) || DEFAULT_PORT;
    }
    startBridgeServer(port);
    return;
  }

  const data = loadBacklog();

  if (command === 'list') {
    const filter = args[1] || 'all';
    const displayProject = getDisplayProjectName(data);
    console.log(`\n📋 ${displayProject} Local Backlog (${data.tasks.length} total tasks):`);
    console.log('='.repeat(70));

    const filtered = data.tasks.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'todo') return t.status === 'todo';
      if (filter === 'in_progress') return t.status === 'in_progress' || t.status === 'testing';
      if (filter === 'done') return t.status === 'done';
      if (filter === 'high') return t.priority === 'high';
      return true;
    });

    for (const t of filtered) {
      const statusIcon = t.status === 'done' ? '✅' : t.status === 'in_progress' ? '⚡' : t.status === 'testing' ? '🧪' : '📋';
      const prio = (t.priority || 'med').toUpperCase().padEnd(6);
      console.log(`${statusIcon} [${t.id}] (${prio}) ${t.title}`);
      if (t.components && t.components.length > 0) {
        console.log(`   └─ Components: ${t.components.join(', ')}`);
      }
    }
    console.log('='.repeat(70));
    console.log(`💡 To kickoff a task with 0 token waste: npm run backlog prompt <ID>\n`);
    return;
  }

  if (command === 'add') {
    const title = args[1];
    if (!title) {
      console.error('❌ Please specify a title: npm run backlog add "Feature title"');
      process.exit(1);
    }

    let id = null;
    let type = 'feature';
    let priority = 'medium';
    let desc = '';
    let components = [];

    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--id' && args[i + 1]) id = args[++i];
      else if (args[i] === '--type' && args[i + 1]) type = args[++i];
      else if (args[i] === '--priority' && args[i + 1]) priority = args[++i];
      else if (args[i] === '--desc' && args[i + 1]) desc = args[++i];
      else if (args[i] === '--components' && args[i + 1]) components = args[++i].split(',').map(s => s.trim());
    }

    if (!id) {
      const maxNum = data.tasks.reduce((max, t) => {
        const match = String(t.id).match(/FEAT-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 100);
      id = `FEAT-${maxNum + 1}`;
    }

    const newTask = {
      id,
      type,
      title,
      status: 'todo',
      priority,
      components,
      description: desc,
      spec: desc,
      acceptanceCriteria: []
    };

    data.tasks.push(newTask);
    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();

    console.log(`\n✅ Added task [${id}] to local backlog: "${title}" (0 tokens consumed)`);
    console.log(`💡 Frugal prompt to kick off: "/backlog-start ${id}"\n`);
    return;
  }

  if (command === 'status') {
    const id = args[1];
    const newStatus = args[2];
    if (!id || !newStatus) {
      console.error('❌ Usage: npm run backlog status <id> <todo|in_progress|testing|done>');
      process.exit(1);
    }

    const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
    if (!task) {
      console.error(`❌ Task ${id} not found in backlog.`);
      process.exit(1);
    }

    task.status = newStatus.toLowerCase();
    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();

    console.log(`\n✅ Updated [${task.id}] status to: ${task.status.toUpperCase()}`);
    return;
  }

  if (command === 'start') {
    const rawIds = args.slice(1).join(' ').split(/[\s,]+/).filter(Boolean);
    if (rawIds.length === 0) {
      console.error('❌ Usage: npm run backlog start <id> [, <id2> ...]');
      process.exit(1);
    }

    const matchedTasks = [];
    for (const rawId of rawIds) {
      const task = data.tasks.find(t => t.id.toLowerCase() === rawId.toLowerCase());
      if (task) {
        task.status = 'in_progress';
        matchedTasks.push(task);
      } else {
        console.warn(`⚠️  Task ${rawId} not found in backlog.`);
      }
    }

    if (matchedTasks.length === 0) {
      console.error('❌ No matching tasks found.');
      process.exit(1);
    }

    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();

    const idList = matchedTasks.map(t => t.id).join(', ');
    const kickoffCmd = `/backlog-start ${idList}`;
    const copied = copyToNativeOsClipboard(kickoffCmd);
    console.log(`\n🚀 Task(s) [${idList}] are now IN PROGRESS!`);
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`💡 1-LINE PROMPT ${copied ? '(AUTO-COPIED TO CLIPBOARD — PRESS ⌘V IN CHAT)' : 'TO PASTE INTO ANTIGRAVITY'}:`);
    console.log(`   ${kickoffCmd}`);
    console.log(`------------------------------------------------------------------------\n`);
    return;
  }

  if (command === 'done') {
    const rawIds = args.slice(1).join(' ').split(/[\s,]+/).filter(Boolean);
    if (rawIds.length === 0) {
      console.error('❌ Usage: npm run backlog done <id> [, <id2> ...]');
      process.exit(1);
    }

    const matchedTasks = [];
    for (const rawId of rawIds) {
      const task = data.tasks.find(t => t.id.toLowerCase() === rawId.toLowerCase());
      if (task) {
        task.status = 'done';
        task.completedAt = new Date().toISOString();
        matchedTasks.push(task);
      } else {
        console.warn(`⚠️  Task ${rawId} not found in backlog.`);
      }
    }

    if (matchedTasks.length === 0) {
      console.error('❌ No matching tasks found.');
      process.exit(1);
    }

    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();

    const idList = matchedTasks.map(t => t.id).join(', ');
    console.log(`\n✅ Task(s) [${idList}] marked COMPLETED (DONE)!`);
    console.log(`💡 Next step: Run /update-memory to close the memory cycle and commit.\n`);
    return;
  }

  if (command === 'prompt') {
    const rawIds = args.slice(1).join(' ').split(/[\s,]+/).filter(Boolean);
    if (rawIds.length === 0) {
      console.error('❌ Usage: npm run backlog prompt <id> [, <id2> ...]');
      process.exit(1);
    }

    const idList = rawIds.join(', ');
    const kickoffCmd = `/backlog-start ${idList}`;
    const copied = copyToNativeOsClipboard(kickoffCmd);
    console.log(`\n💡 Ultra-Frugal Kickoff Command for [${idList}]${copied ? ' (Copied to clipboard!)' : ''}:`);
    console.log(`   ${kickoffCmd}\n`);
    return;
  }

  if (command === 'render') {
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();
    console.log('✅ Backlog board and Review pane artifacts successfully rendered.');
    return;
  }

  printUsage(data);
}

main();
