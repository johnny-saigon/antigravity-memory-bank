#!/usr/bin/env node
/**
 * SnapCal Zero-Token Local Backlog Engine
 * 
 * Allows capturing, prioritizing, and updating backlog tasks offline with ZERO AI token
 * consumption and ZERO quota drain. Works hand-in-hand with the Antigravity Memory Bank
 * and renders an interactive Kanban board directly in the Antigravity Review Pane.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const BACKLOG_JSON_PATH = path.join(REPO_ROOT, 'docs', 'backlog.json');
const MIGRATION_BOARD_MD_PATH = fs.existsSync(path.join(REPO_ROOT, 'docs', 'MIGRATION_BOARD.md'))
  ? path.join(REPO_ROOT, 'docs', 'MIGRATION_BOARD.md')
  : path.join(REPO_ROOT, 'docs', 'BACKLOG.md');

let projectName = path.basename(REPO_ROOT);
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  if (pkg.name) projectName = pkg.name;
} catch {}

// Find active Antigravity brain conversation directory
function findActiveBrainDir() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const brainBase = path.join(homeDir, '.gemini', 'antigravity', 'brain');
  if (!fs.existsSync(brainBase)) return null;

  try {
    const entries = fs.readdirSync(brainBase, { withFileTypes: true });
    const candidates = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'tempmediaStorage') continue;
      const dirPath = path.join(brainBase, entry.name);
      const transcriptPath = path.join(dirPath, '.system_generated', 'logs', 'transcript.jsonl');
      
      let score = 0;
      let mtime = 0;
      try {
        const stat = fs.statSync(dirPath);
        mtime = stat.mtimeMs;
      } catch {}

      if (fs.existsSync(transcriptPath)) {
        score += 10;
        try {
          const sample = fs.readFileSync(transcriptPath, 'utf8').slice(0, 10000);
          if (sample.includes('SnapCal') || sample.includes(REPO_ROOT)) {
            score += 100;
          }
        } catch {}
      }
      candidates.push({ dirPath, score, mtime });
    }

    candidates.sort((a, b) => (b.score * 1e12 + b.mtime) - (a.score * 1e12 + a.mtime));
    return candidates.length > 0 ? candidates[0].dirPath : null;
  } catch (err) {
    return null;
  }
}

// Load backlog JSON
function loadBacklog() {
  if (!fs.existsSync(BACKLOG_JSON_PATH)) {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      project: 'snapcal',
      tasks: [],
      milestones: []
    };
  }
  try {
    return JSON.parse(fs.readFileSync(BACKLOG_JSON_PATH, 'utf8'));
  } catch (err) {
    console.error(`❌ Failed to parse ${BACKLOG_JSON_PATH}:`, err.message);
    process.exit(1);
  }
}

// Save backlog JSON
function saveBacklog(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(BACKLOG_JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Render docs/MIGRATION_BOARD.md from backlog data
function renderMigrationBoard(data) {
  const lines = [
    '# SnapCal — Development & Migration Board',
    '',
    'This board tracks active development tickets, feature backlogs, architecture initiatives, and migration milestones for SnapCal. For historical bug fixes and root-cause analyses, refer to [`docs/BUG_FIX_RECORDS.md`](file:///Users/jbb/Documents/SnapCal/docs/BUG_FIX_RECORDS.md).',
    '',
    '---',
    '',
    '## 1. Active Feature Backlog',
    ''
  ];

  const activeTasks = data.tasks.filter(t => t.type === 'feature' || !t.type);
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
      if (task.components) lines.push(`- **Platform:** ${task.components.join(', ')}`);
      if (task.description) lines.push(`- **Scope:**\n  ${task.description}`);
      if (task.acceptanceCriteria) {
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

  fs.writeFileSync(MIGRATION_BOARD_MD_PATH, lines.join('\n') + '\n', 'utf8');
}

// Generate the interactive HTML artifact for Antigravity's Review pane
function generateReviewArtifactHtml(data) {
  const jsonString = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SnapCal Backlog & Sprint Board</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    /* Antigravity design tokens styling */
    :root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body class="bg-[var(--background,#0f172a)] text-[var(--foreground,#f8fafc)] antialiased p-4 min-h-screen">
  
  <!-- Header Bar -->
  <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[var(--border,#334155)] gap-3">
    <div>
      <div class="flex items-center gap-2">
        <span class="text-xl">📅</span>
        <h1 class="text-xl font-bold tracking-tight text-[var(--foreground,#f8fafc)]">SnapCal Local Backlog</h1>
        <span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-medium">0 Tokens • Frugal Mode</span>
      </div>
      <p class="text-xs text-[var(--muted-foreground,#94a3b8)] mt-1">
        Decoupled offline task capture. Click <strong>"Kickoff Prompt"</strong> to start any task in Antigravity with minimal credit consumption.
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
        <input id="newId" type="text" placeholder="e.g. FEAT-710" class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
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
      <input id="newTitle" type="text" placeholder="e.g. Implement Calendar Widget for iOS 18 Lock Screen" class="w-full bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
    </div>
    <div class="mb-3">
      <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Description & Acceptance Criteria</label>
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
      <button onclick="setFilter('all')" class="filter-btn active bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 font-medium">All</button>
      <button onclick="setFilter('todo')" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-[var(--muted-foreground,#94a3b8)]">To-Do</button>
      <button onclick="setFilter('in_progress')" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-[var(--muted-foreground,#94a3b8)]">In Progress</button>
      <button onclick="setFilter('high')" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-rose-400">🔥 High Priority</button>
      <button onclick="setFilter('done')" class="filter-btn bg-[var(--card,#1e293b)] text-xs px-2.5 py-1 rounded-md border border-[var(--border,#334155)] hover:border-blue-500 text-emerald-400">Done</button>
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
        <span id="count-todo" class="text-xs bg-[var(--card,#1e293b)] px-1.5 py-0.5 rounded font-mono text-[var(--muted-foreground,#94a3b8)]">0</span>
      </div>
      <div id="col-todo" class="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-1"></div>
    </div>

    <!-- Column: In Progress & Testing -->
    <div class="bg-[var(--card,#1e293b)]/40 border border-[var(--border,#334155)] rounded-xl p-3 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border,#334155)]">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--foreground,#f8fafc)]">In Progress / QA</h2>
        </div>
        <span id="count-inprogress" class="text-xs bg-[var(--card,#1e293b)] px-1.5 py-0.5 rounded font-mono text-[var(--muted-foreground,#94a3b8)]">0</span>
      </div>
      <div id="col-inprogress" class="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-1"></div>
    </div>

    <!-- Column: Done -->
    <div class="bg-[var(--card,#1e293b)]/40 border border-[var(--border,#334155)] rounded-xl p-3 flex flex-col">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border,#334155)]">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--foreground,#f8fafc)]">Completed (Done)</h2>
        </div>
        <span id="count-done" class="text-xs bg-[var(--card,#1e293b)] px-1.5 py-0.5 rounded font-mono text-[var(--muted-foreground,#94a3b8)]">0</span>
      </div>
      <div id="col-done" class="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] pr-1"></div>
    </div>

  </div>

  <script>
    let rawData = ${jsonString};
    let currentFilter = 'all';

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    function toggleQuickAdd() {
      const panel = document.getElementById('quickAddPanel');
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        // Auto suggest next ID
        const maxNum = rawData.tasks.reduce((max, t) => {
          const match = t.id.match(/FEAT-(\\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 709);
        document.getElementById('newId').value = 'FEAT-' + (maxNum + 1);
        document.getElementById('newTitle').focus();
      }
    }

    function setFilter(filter) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-white', 'font-bold');
      });
      event.target.classList.add('border-blue-500', 'text-white', 'font-bold');
      renderBoard();
    }

    function copyPrompt(id, title) {
      const prompt = "/backlog-start " + id;
      navigator.clipboard.writeText(prompt);
      showToast("📋 Copied: " + prompt + " (paste in Antigravity)");
    }

    function copyCliCommand(cmd) {
      navigator.clipboard.writeText(cmd);
      showToast("⚡ CLI command copied to clipboard: " + cmd);
    }

    function updateTaskStatus(id, newStatus) {
      const task = rawData.tasks.find(t => t.id === id);
      if (task) {
        task.status = newStatus;
        renderBoard();
        const cmd = "npm run backlog status " + id + " " + newStatus;
        copyCliCommand(cmd);
      }
    }

    function saveNewTask() {
      const id = document.getElementById('newId').value.trim();
      const title = document.getElementById('newTitle').value.trim();
      const type = document.getElementById('newType').value;
      const priority = document.getElementById('newPriority').value;
      const desc = document.getElementById('newDesc').value.trim();

      if (!id || !title) {
        alert('Please provide Ticket ID and Title');
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
        acceptanceCriteria: []
      };

      rawData.tasks.unshift(newTask);
      toggleQuickAdd();
      renderBoard();

      // Copy CLI command to sync locally
      const cmd = "npm run backlog add \\"" + title + "\\" --id " + id + " --type " + type + " --priority " + priority + " --desc \\"" + desc.replace(/"/g, '\\\\"') + "\\"";
      copyCliCommand(cmd);
      showToast("✅ Task captured! Run in terminal to persist permanently.");
    }

    function renderCard(task) {
      const isDone = task.status === 'done';
      const isInProgress = task.status === 'in_progress' || task.status === 'testing';
      
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
              <span class="font-mono text-xs font-bold text-blue-400">\${task.id}</span>
              <span class="badge border rounded px-1.5 py-0.2 \${prioColor}">\${task.priority || 'med'}</span>
              <span class="badge bg-slate-700/50 text-slate-300 rounded px-1.5 py-0.2">\${typeBadge}</span>
            </div>
            
            <!-- Quick Status Toggles -->
            <div class="opacity-80 group-hover:opacity-100 flex items-center gap-1">
              \${!isDone ? \`
                <button onclick="updateTaskStatus('\${task.id}', 'done')" class="text-xs hover:text-emerald-400 p-0.5" title="Mark Done">✅</button>
              \` : \`
                <button onclick="updateTaskStatus('\${task.id}', 'todo')" class="text-xs hover:text-amber-400 p-0.5" title="Move to To-Do">↩️</button>
              \`}
              \${!isInProgress && !isDone ? \`
                <button onclick="updateTaskStatus('\${task.id}', 'in_progress')" class="text-xs hover:text-blue-400 p-0.5" title="Mark In Progress">⚡</button>
              \` : ''}
            </div>
          </div>

          <h3 class="text-xs font-semibold text-[var(--foreground,#f8fafc)] leading-snug mb-1.5 \${isDone ? 'line-through opacity-70' : ''}">
            \${task.title}
          </h3>

          \${task.description ? \`
            <p class="text-[11px] text-[var(--muted-foreground,#94a3b8)] line-clamp-2 mb-2 leading-relaxed">
              \${task.description}
            </p>
          \` : ''}

          \${task.components && task.components.length > 0 ? \`
            <div class="flex flex-wrap gap-1 mb-2.5">
              \${task.components.map(c => \`<span class="text-[10px] font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded">\${c.split('/').pop()}</span>\`).join('')}
            </div>
          \` : ''}

          <!-- Action Footer -->
          <div class="pt-2 border-t border-[var(--border,#334155)]/50 flex items-center justify-between">
            \${!isDone ? \`
              <button onclick="copyPrompt('\${task.id}', '\${task.title.replace(/'/g, "\\\\'")}')" class="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-medium px-2 py-1 rounded-md transition flex items-center gap-1">
                <span>🤖</span> Kickoff Prompt
              </button>
            \` : \`
              <span class="text-[11px] text-emerald-400 font-medium">✓ Completed</span>
            \`}
            <button onclick="copyCliCommand('npm run backlog status \${task.id} in_progress')" class="text-[10px] text-[var(--muted-foreground,#94a3b8)] hover:text-white font-mono">
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

    // Initial render
    renderBoard();
  </script>
</body>
</html>`;
}

// Generate the markdown review artifact
function generateReviewArtifactMd(data) {
  const lines = [
    '# SnapCal — Local Backlog & Review Board',
    '',
    '> [!TIP]',
    '> **0 Token Decoupled Task Management**: Maintain your backlog offline without draining AI credits or quota. When ready, kick off any ticket with a single-line frugal prompt.',
    '',
    '## 1. Active Feature Backlog (Ready for Implementation)',
    ''
  ];

  const todoTasks = data.tasks.filter(t => t.status === 'todo');
  for (const task of todoTasks) {
    lines.push(`### [${task.id}](file:///Users/jbb/Documents/SnapCal/docs/MIGRATION_BOARD.md#${task.id.toLowerCase()}): ${task.title}`);
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

// Write the Review Pane artifacts to the active conversation brain folder
function writeReviewPaneArtifacts(data) {
  const brainDir = findActiveBrainDir();
  if (!brainDir) {
    console.log('ℹ️  No active Antigravity brain directory detected. Saved to docs/ only.');
    return;
  }

  const htmlPath = path.join(brainDir, 'backlog.html');
  const htmlMetaPath = path.join(brainDir, 'backlog.html.metadata.json');
  const mdPath = path.join(brainDir, 'backlog-board.md');
  const mdMetaPath = path.join(brainDir, 'backlog-board.md.metadata.json');

  const htmlContent = generateReviewArtifactHtml(data);
  const mdContent = generateReviewArtifactMd(data);

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  fs.writeFileSync(htmlMetaPath, JSON.stringify({
    summary: 'Interactive SnapCal Backlog & Sprint Board for zero-token task capture and frugal agent execution.',
    userFacing: true,
    requestFeedback: false,
    updatedAt: new Date().toISOString()
  }, null, 2), 'utf8');

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  fs.writeFileSync(mdMetaPath, JSON.stringify({
    summary: 'Markdown Backlog and Sprint Status board linking to docs/backlog.json and docs/MIGRATION_BOARD.md.',
    userFacing: true,
    requestFeedback: true,
    updatedAt: new Date().toISOString()
  }, null, 2), 'utf8');

  console.log(`✨ Review pane artifacts refreshed in ${path.basename(brainDir)}:`);
  console.log(`   - file://${htmlPath}`);
  console.log(`   - file://${mdPath}`);
}

// CLI commands
function printUsage() {
  console.log(`
SnapCal Zero-Token Local Backlog Engine

Usage:
  npm run backlog list [todo|in_progress|done|high|all]
  npm run backlog add "<title>" [--id <ID>] [--type <feature|bug|qa|refactor>] [--priority <high|medium|low>] [--desc "<desc>"] [--components "<file1,file2>"]
  npm run backlog status <id> <todo|in_progress|testing|done>
  npm run backlog start <id>
  npm run backlog done <id>
  npm run backlog render
  npm run backlog prompt <id>
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  const data = loadBacklog();

  if (command === 'list') {
    const filter = args[1] || 'all';
    console.log(`\n📋 SnapCal Local Backlog (${data.tasks.length} total tasks):`);
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

    // Parse options
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
        const match = t.id.match(/FEAT-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 709);
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

    console.log(`\n✅ Added task [${id}] to local backlog: "${title}" (0 tokens consumed)`);
    console.log(`💡 Frugal prompt to kick off: "Start ${id}: ${title}"\n`);
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

    const idList = matchedTasks.map(t => t.id).join(', ');
    console.log(`\n🚀 Task(s) [${idList}] are now IN PROGRESS!`);
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`💡 COPY & PASTE THIS 1-LINE PROMPT INTO ANTIGRAVITY (0 Token Waste):`);
    console.log(`   /backlog-start ${idList}`);
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
    console.log(`\n💡 Ultra-Frugal Kickoff Command for [${idList}]:`);
    console.log(`   /backlog-start ${idList}\n`);
    return;
  }

  if (command === 'render') {
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    console.log('✅ Backlog board and Review pane artifacts successfully rendered.');
    return;
  }

  printUsage();
}

main();
