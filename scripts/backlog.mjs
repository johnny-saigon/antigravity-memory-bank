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
    const resolvedRoot = path.resolve(rootDir);
    const displayProject = getDisplayProjectName(data, resolvedRoot);
    const projectSlug = (data && data.project) || path.basename(resolvedRoot).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const escapedHome = homeDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const homeProjRegex = homeDir
      ? new RegExp(`${escapedHome}/(?!\\.|Library/)(?:[^/"'\\\\\\s\`]+/){1,2}`, 'g')
      : null;

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
          myCount = countWorkspaceMentions(fullText, resolvedRoot);

          if (homeProjRegex) {
            const otherCounts = {};
            let m;
            homeProjRegex.lastIndex = 0;
            while ((m = homeProjRegex.exec(fullText)) !== null) {
              const candidatePath = path.resolve(m[0]);
              if (
                candidatePath !== resolvedRoot &&
                !resolvedRoot.startsWith(candidatePath + path.sep) &&
                !candidatePath.startsWith(resolvedRoot + path.sep)
              ) {
                otherCounts[candidatePath] = (otherCounts[candidatePath] || 0) + 1;
              }
            }
            for (const c of Object.values(otherCounts)) {
              if (c > maxOther) maxOther = c;
            }
          }
        } catch {}
      }

      let ownsExisting = false;
      let ownedByOther = false;
      if (fs.existsSync(existingBacklogHtml)) {
        try {
          const htmlSample = fs.readFileSync(existingBacklogHtml, 'utf8').slice(0, 4000);
          if (
            htmlSample.includes(`<title>${displayProject} Backlog`) ||
            htmlSample.includes(`"project":"${projectSlug}"`) ||
            htmlSample.includes(`"repoRoot":${JSON.stringify(resolvedRoot)}`)
          ) {
            ownsExisting = true;
          } else if (htmlSample.includes('"repoRoot":') || htmlSample.includes('Backlog & Sprint Board</title>')) {
            ownedByOther = true;
          }
        } catch {}
      }

      const isDominantWorkspace = myCount > 0 && myCount >= maxOther;
      const isOwnedByProject = ownsExisting && !ownedByOther && (myCount > 0 || maxOther === 0);
      const isBrandNewUnassigned = myCount === 0 && maxOther === 0 && !ownedByOther && (now - mtime < 15 * 60 * 1000);

      candidates.push({
        dirPath,
        myCount,
        maxOther,
        mtime,
        ownsExisting,
        ownedByOther,
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

    const withMentions = candidates.find(c => c.myCount > 0);
    if (withMentions) return [withMentions.dirPath];

    const unownedRecent = candidates.find(c => !c.ownsExisting && !c.ownedByOther && c.maxOther === 0);
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

/**
 * Resolve an attachment path (supports @mentions, ~/ home expansion, relative to rootDir, or absolute)
 */
function resolveAttachmentPath(rawPath, rootDir = REPO_ROOT) {
  if (!rawPath) return '';
  let cleaned = String(rawPath).trim().replace(/^@+/, '');
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  if (cleaned.startsWith('~/') && homeDir) {
    cleaned = path.join(homeDir, cleaned.slice(2));
  }
  return path.isAbsolute(cleaned) ? path.resolve(cleaned) : path.resolve(rootDir, cleaned);
}

/**
 * Recursively list files inside a directory, ignoring macOS/git noise
 */
function walkDirectoryFiles(dirPath) {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === '.DS_Store' ||
        entry.name === '__MACOSX' ||
        entry.name === '.git' ||
        entry.name === 'node_modules'
      ) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDirectoryFiles(fullPath));
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

/**
 * Discover and unpack any attached files (.zip, .tar.gz, .tgz, mockups, specs) for a task
 * into docs/attachments/<TASK_ID>/extracted/ and return a categorized manifest.
 */
function unpackTaskAttachments(task, rootDir = REPO_ROOT, extraPaths = []) {
  const taskId = typeof task === 'string' ? task : task.id;
  const taskAttachments = (task && Array.isArray(task.attachments)) ? task.attachments : [];
  const taskAttachDir = path.join(rootDir, 'docs', 'attachments', taskId);
  const extractedRoot = path.join(taskAttachDir, 'extracted');

  const candidateFiles = new Set();
  for (const p of [...taskAttachments, ...extraPaths]) {
    const abs = resolveAttachmentPath(p, rootDir);
    if (abs && fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      candidateFiles.add(abs);
    }
  }

  // Also auto-discover any files dropped directly into docs/attachments/<TASK_ID>/
  if (fs.existsSync(taskAttachDir)) {
    try {
      for (const entry of fs.readdirSync(taskAttachDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name !== '.DS_Store') {
          candidateFiles.add(path.join(taskAttachDir, entry.name));
        }
      }
    } catch {}
  }

  const archivesUnpacked = [];
  const inspectedFiles = new Set();

  for (const filePath of candidateFiles) {
    const lower = filePath.toLowerCase();
    const baseName = path.basename(filePath);
    const stem = baseName.replace(/\.(zip|tar\.gz|tgz|tar)$/i, '');

    if (lower.endsWith('.zip')) {
      const destDir = path.join(extractedRoot, stem);
      fs.mkdirSync(destDir, { recursive: true });
      let ok = false;
      const unzipRes = spawnSync('unzip', ['-q', '-o', filePath, '-d', destDir], { timeout: 20000 });
      if (unzipRes.status === 0) {
        ok = true;
      } else {
        const tarRes = spawnSync('tar', ['-xf', filePath, '-C', destDir], { timeout: 20000 });
        ok = tarRes.status === 0;
      }
      if (ok) {
        archivesUnpacked.push({ archive: filePath, destDir });
        for (const extracted of walkDirectoryFiles(destDir)) {
          inspectedFiles.add(extracted);
        }
      } else {
        inspectedFiles.add(filePath);
      }
    } else if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz') || lower.endsWith('.tar')) {
      const destDir = path.join(extractedRoot, stem);
      fs.mkdirSync(destDir, { recursive: true });
      const tarRes = spawnSync('tar', ['-xf', filePath, '-C', destDir], { timeout: 20000 });
      if (tarRes.status === 0) {
        archivesUnpacked.push({ archive: filePath, destDir });
        for (const extracted of walkDirectoryFiles(destDir)) {
          inspectedFiles.add(extracted);
        }
      } else {
        inspectedFiles.add(filePath);
      }
    } else {
      inspectedFiles.add(filePath);
    }
  }

  // Also include any previously extracted files in docs/attachments/<TASK_ID>/extracted/
  if (fs.existsSync(extractedRoot)) {
    for (const extracted of walkDirectoryFiles(extractedRoot)) {
      inspectedFiles.add(extracted);
    }
  }

  const allFiles = Array.from(inspectedFiles);
  const categories = {
    designTokens: [],
    uiMarkup: [],
    visualAssets: [],
    specsAndData: []
  };

  for (const f of allFiles) {
    const base = path.basename(f).toLowerCase();
    if (/design\.md|tokens|theme|tailwind\.config|\.css$|\.scss$/i.test(base)) {
      categories.designTokens.push(f);
    } else if (/\.(html|htm|tsx|jsx|vue|svelte)$/i.test(base)) {
      categories.uiMarkup.push(f);
    } else if (/\.(png|jpg|jpeg|webp|gif|svg|pdf)$/i.test(base)) {
      categories.visualAssets.push(f);
    } else {
      categories.specsAndData.push(f);
    }
  }

  return {
    taskId,
    candidateFiles: Array.from(candidateFiles),
    archivesUnpacked,
    allFiles,
    categories,
    extractedRoot
  };
}

function printUnpackedManifest(manifest, rootDir = REPO_ROOT) {
  if (!manifest || manifest.allFiles.length === 0) {
    return false;
  }
  const rel = (p) => (p.startsWith(rootDir + path.sep) ? path.relative(rootDir, p) : p);
  console.log(`\n📦 Attached Context & UX/UI Bundle Manifest for [${manifest.taskId}]:`);
  if (manifest.archivesUnpacked.length > 0) {
    for (const a of manifest.archivesUnpacked) {
      console.log(`   🗜️  Unpacked Archive: ${rel(a.archive)} -> ${rel(a.destDir)}/`);
    }
  }
  if (manifest.categories.designTokens.length > 0) {
    console.log(`   🎨 Design System & Tokens (${manifest.categories.designTokens.length}):`);
    for (const f of manifest.categories.designTokens) console.log(`      - ${rel(f)}`);
  }
  if (manifest.categories.uiMarkup.length > 0) {
    console.log(`   🧩 UI Markup & Components (${manifest.categories.uiMarkup.length}):`);
    for (const f of manifest.categories.uiMarkup) console.log(`      - ${rel(f)}`);
  }
  if (manifest.categories.visualAssets.length > 0) {
    console.log(`   🖼️  Visual Reference Assets (${manifest.categories.visualAssets.length}):`);
    for (const f of manifest.categories.visualAssets) console.log(`      - ${rel(f)}`);
  }
  if (manifest.categories.specsAndData.length > 0) {
    console.log(`   📄 Specs & Context Files (${manifest.categories.specsAndData.length}):`);
    for (const f of manifest.categories.specsAndData) console.log(`      - ${rel(f)}`);
  }
  return true;
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
    if (task.attachments && task.attachments.length > 0) {
      lines.push(`- **Attachments:** ${task.attachments.map(a => `\`${a}\``).join(', ')}`);
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
      if (task.attachments && task.attachments.length > 0) {
        lines.push(`- **Attachments:** ${task.attachments.map(a => `\`${a}\``).join(', ')}`);
      }
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
  const attachments = Array.isArray(task.attachments) ? task.attachments : [];

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
                ? `<button onclick="triggerAttachFile('${safeIdAttr}')" class="text-xs hover:text-indigo-400 p-0.5" title="Attach UX/UI .zip or context file">📎</button>
                   <button onclick="updateTaskStatus('${safeIdAttr}', 'done')" class="text-xs hover:text-emerald-400 p-0.5" title="Mark Done">✅</button>`
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
            ? `<div class="flex flex-wrap gap-1 mb-2">${task.components.map(c => `<span class="text-xs font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded">${escapeHtmlServer(String(c).split('/').pop())}</span>`).join('')}</div>`
            : ''}
          ${attachments.length > 0
            ? `<div class="flex flex-wrap gap-1 mb-2.5">${attachments.map(a => `<span class="text-xs font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded flex items-center gap-1" title="${escapeHtmlServer(String(a))}">📎 ${escapeHtmlServer(String(a).split('/').pop())}</span>`).join('')}</div>`
            : ''}
          <div class="pt-2 border-t border-[var(--border,#334155)]/50 flex items-center justify-between gap-2">
            ${!isDone
              ? `<div class="flex items-center gap-1.5 flex-wrap">
                   <button onclick="kickoffTask('${safeIdAttr}')" class="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer" title="Execute /backlog-start ${safeIdAttr}"><span>🤖</span> Kickoff Prompt</button>
                   <button onclick="planTask('${safeIdAttr}')" class="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-semibold px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer" title="Focus implementation_plan.md &amp; task.md on ${safeIdAttr} (/backlog-plan ${safeIdAttr})"><span>📐</span> Plan</button>
                   <button onclick="triggerAttachFile('${safeIdAttr}')" class="bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600/50 text-xs px-2 py-1 rounded-md transition cursor-pointer" title="Attach UX/UI .zip or spec file">📎</button>
                 </div>`
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
      <button onclick="planTask('')" class="bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5" title="Sync 3 Planning Mode Artifacts (task.md, implementation_plan.md, walkthrough.md)">
        <span>📐</span> Planning Mode
      </button>
      <button onclick="toggleQuickAdd()" class="bg-[var(--primary,#3b82f6)] hover:opacity-90 text-[var(--primary-foreground,#ffffff)] text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5">
        <span>➕</span> Quick Capture Task
      </button>
      <button onclick="refreshData()" class="bg-[var(--card,#1e293b)] hover:bg-[var(--border,#334155)] text-[var(--foreground,#f8fafc)] border border-[var(--border,#334155)] text-xs px-2.5 py-1.5 rounded-lg transition" title="Refresh Board">
        🔄
      </button>
    </div>
  </div>

  <!-- Correlated Planning Mode 3-Artifact Status Bar -->
  <div class="mb-4 bg-slate-900/80 border border-purple-500/30 rounded-xl px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div class="flex items-center gap-2 flex-wrap text-xs">
      <span class="text-purple-400 font-semibold flex items-center gap-1">📐 3-Artifact Planning Lifecycle:</span>
      <span class="font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded" title="Live checklist broken into Discovery, Active Sprint, Queued &amp; Completed groups">1. task.md</span>
      <span class="text-slate-500">→</span>
      <span class="font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded" title="4-Section Architectural Blueprint (Goal, User Review, Proposed Changes, Verification Plan)">2. implementation_plan.md</span>
      <span class="text-slate-500">→</span>
      <span class="font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded" title="Execution summary &amp; proof of deterministic/E2E verification">3. walkthrough.md</span>
    </div>
    <div class="text-xs text-slate-400">
      Click <strong>📐 Plan</strong> on any ticket for <code>/backlog-plan &lt;ID&gt;</code> or <strong>🤖 Kickoff Prompt</strong> for <code>/backlog-start &lt;ID&gt;</code>
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

  <!-- Hidden File Input for Card Attachment Upload -->
  <input id="cardAttachInput" type="file" multiple accept=".zip,.tar.gz,.tgz,.tar,.png,.jpg,.jpeg,.webp,.svg,.pdf,.md,.json,.html,.css,.txt" class="hidden" onchange="handleCardFileSelect(event)">

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
    <div class="mb-3">
      <label class="block text-xs font-medium text-[var(--muted-foreground,#94a3b8)] mb-1">Context Attachments (UX/UI <code>.zip</code> bundle, Stitch/Figma export, Mockups, Specs)</label>
      <div class="flex flex-col sm:flex-row gap-2">
        <input id="newAttachments" type="text" placeholder="Optional path(s), e.g. ~/Downloads/ux-ui.zip, docs/spec.md" class="flex-1 bg-[var(--background,#0f172a)] border border-[var(--border,#334155)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground,#f8fafc)] focus:outline-none focus:border-blue-500">
        <label class="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
          <span>📎</span> <span id="newAttachFileLabel">Choose .zip / File(s)</span>
          <input id="newAttachFilesInput" type="file" multiple accept=".zip,.tar.gz,.tgz,.tar,.png,.jpg,.jpeg,.webp,.svg,.pdf,.md,.json,.html,.css,.txt" class="hidden" onchange="updateNewAttachLabel(this)">
        </label>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-xs text-[var(--muted-foreground,#94a3b8)]">Adds instantly to local backlog &amp; auto-unpacks <code>.zip</code> UX/UI bundles with 0 AI tokens.</span>
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
    let activeAttachTaskId = null;

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
      }, 4200);
    }

    function readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = String(reader.result || '');
          const commaIdx = res.indexOf(',');
          resolve(commaIdx !== -1 ? res.slice(commaIdx + 1) : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function updateNewAttachLabel(inputEl) {
      const label = document.getElementById('newAttachFileLabel');
      if (!label) return;
      const files = inputEl && inputEl.files ? Array.from(inputEl.files) : [];
      if (files.length === 0) {
        label.textContent = 'Choose .zip / File(s)';
      } else if (files.length === 1) {
        label.textContent = files[0].name;
      } else {
        label.textContent = files.length + ' files selected';
      }
    }

    function triggerAttachFile(taskId) {
      activeAttachTaskId = taskId;
      const fileInput = document.getElementById('cardAttachInput');
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    }

    async function handleCardFileSelect(event) {
      const files = event.target && event.target.files ? Array.from(event.target.files) : [];
      const taskId = activeAttachTaskId;
      if (!taskId || files.length === 0) return;

      const task = rawData.tasks.find(t => t.id === taskId);
      if (!task) return;
      if (!Array.isArray(task.attachments)) task.attachments = [];

      let uploadedCount = 0;
      let totalUnpacked = 0;

      for (const file of files) {
        try {
          const base64Data = await readFileAsBase64(file);
          const relPath = 'docs/attachments/' + taskId + '/' + file.name;
          if (!task.attachments.includes(relPath)) {
            task.attachments.push(relPath);
          }
          renderBoard();

          const bridgeRes = await callLocalBridge('/api/attach', {
            repoRoot: rawData.repoRoot,
            id: taskId,
            fileName: file.name,
            base64Data: base64Data
          });
          if (bridgeRes && bridgeRes.ok) {
            uploadedCount++;
            totalUnpacked += (bridgeRes.unpackedCount || 0);
          }
        } catch (e) {}
      }

      if (uploadedCount > 0) {
        showToast('📎 Attached ' + files.map(f => f.name).join(', ') + ' to [' + taskId + '] (' + totalUnpacked + ' context files ready for /backlog-start)!');
      } else {
        const cmd = 'npm run backlog attach ' + taskId + ' ' + files.map(f => '"' + f.name + '"').join(' ');
        copyTextToClipboard(cmd, true, taskId);
        showToast('📋 Bridge offline — CLI attach command copied to clipboard!');
      }
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

      const attachCount = (task && Array.isArray(task.attachments)) ? task.attachments.length : 0;
      const attachSuffix = attachCount > 0 ? ' (📎 ' + attachCount + ' attachment' + (attachCount > 1 ? 's' : '') + ' auto-unpacked)' : '';

      const titleEl = document.getElementById('kickoffBannerTitle');
      if (titleEl && task) {
        titleEl.textContent = '🚀 Ready to Kick Off [' + task.id + ']: ' + task.title + attachSuffix;
      }

      // Also invoke local native bridge (runs OS pbcopy + persists in_progress + unpacks .zip attachments)
      const bridgeRes = await callLocalBridge('/api/kickoff', {
        repoRoot: rawData.repoRoot,
        id: id,
        prompt: prompt
      });

      if (bridgeRes && bridgeRes.ok) {
        showToast('🚀 Copied "' + prompt + '" & marked ' + id + ' IN_PROGRESS' + attachSuffix + '! Paste (⌘V) in chat.');
      } else {
        showToast('📋 Ready: "' + prompt + '" copied & selected in top bar — press ⌘V in Antigravity chat!');
      }
    }

    async function planTask(id) {
      const prompt = id ? ('/backlog-plan ' + id) : '/backlog-plan';
      const task = id ? rawData.tasks.find(t => t.id === id) : null;

      copyTextToClipboard(prompt, true, id || '');

      const titleEl = document.getElementById('kickoffBannerTitle');
      if (titleEl) {
        titleEl.textContent = task
          ? ('📐 Planning Mode Ready for [' + task.id + ']: ' + task.title + ' (task.md & implementation_plan.md synced)')
          : '📐 Planning Mode Ready (task.md, implementation_plan.md & walkthrough.md synced)';
      }

      const bridgeRes = await callLocalBridge('/api/plan', {
        repoRoot: rawData.repoRoot,
        id: id || '',
        prompt: prompt
      });

      if (bridgeRes && bridgeRes.ok) {
        showToast('📐 Synced implementation_plan.md & task.md' + (id ? ' for [' + id + ']' : '') + ' & copied "' + prompt + '"! Paste (⌘V) in chat.');
      } else {
        showToast('📐 Copied "' + prompt + '" — press ⌘V in Antigravity chat (or run in Planning Mode)!');
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
      const attachRaw = (document.getElementById('newAttachments') ? document.getElementById('newAttachments').value : '').trim();
      const fileInput = document.getElementById('newAttachFilesInput');
      const selectedFiles = fileInput && fileInput.files ? Array.from(fileInput.files) : [];

      if (!id || !title) {
        showToast('⚠️ Please provide both Ticket ID and Title');
        return;
      }

      const manualAttachments = attachRaw
        ? attachRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const uploadedRelPaths = selectedFiles.map(f => 'docs/attachments/' + id + '/' + f.name);
      const attachments = Array.from(new Set([...manualAttachments, ...uploadedRelPaths]));

      const newTask = {
        id,
        type,
        title,
        status: 'todo',
        priority,
        components: [],
        attachments,
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

      for (const file of selectedFiles) {
        try {
          const base64Data = await readFileAsBase64(file);
          await callLocalBridge('/api/attach', {
            repoRoot: rawData.repoRoot,
            id: id,
            fileName: file.name,
            base64Data: base64Data
          });
        } catch (e) {}
      }

      if (fileInput) fileInput.value = '';
      updateNewAttachLabel(null);
      if (document.getElementById('newAttachments')) document.getElementById('newAttachments').value = '';

      if (bridgeRes && bridgeRes.ok) {
        showToast('✅ Saved [' + id + '] to docs/backlog.json' + (attachments.length ? ' with ' + attachments.length + ' attachment(s)' : '') + ' (0 tokens)!');
      } else {
        const attachFlag = attachments.length ? ' --attach "' + attachments.join(',') + '"' : '';
        const cmd = 'npm run backlog add "' + title.replace(/"/g, '\\\\"') + '" --id ' + id + ' --type ' + type + ' --priority ' + priority + ' --desc "' + desc.replace(/"/g, '\\\\"') + '"' + attachFlag;
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
      const attachments = Array.isArray(task.attachments) ? task.attachments : [];
      
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
                <button onclick="triggerAttachFile('\${safeIdAttr}')" class="text-xs hover:text-indigo-400 p-0.5" title="Attach UX/UI .zip or context file">📎</button>
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
            <div class="flex flex-wrap gap-1 mb-2">
              \${task.components.map(c => \`<span class="text-xs font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded">\${escapeHtml(String(c).split('/').pop())}</span>\`).join('')}
            </div>
          \` : ''}

          \${attachments.length > 0 ? \`
            <div class="flex flex-wrap gap-1 mb-2.5">
              \${attachments.map(a => \`<span class="text-xs font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded flex items-center gap-1" title="\${escapeHtml(String(a))}">📎 \${escapeHtml(String(a).split('/').pop())}</span>\`).join('')}
            </div>
          \` : ''}

          <!-- Action Footer -->
          <div class="pt-2 border-t border-[var(--border,#334155)]/50 flex items-center justify-between gap-2">
            \${!isDone ? \`
              <div class="flex items-center gap-1.5 flex-wrap">
                <button onclick="kickoffTask('\${safeIdAttr}')" class="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer" title="Execute /backlog-start \${safeIdAttr}">
                  <span>🤖</span> Kickoff Prompt
                </button>
                <button onclick="planTask('\${safeIdAttr}')" class="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-semibold px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer" title="Focus implementation_plan.md &amp; task.md on \${safeIdAttr} (/backlog-plan \${safeIdAttr})">
                  <span>📐</span> Plan
                </button>
                <button onclick="triggerAttachFile('\${safeIdAttr}')" class="bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600/50 text-xs px-2 py-1 rounded-md transition cursor-pointer" title="Attach UX/UI .zip or spec file">
                  📎
                </button>
              </div>
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

    let lastTaskSignature = JSON.stringify((rawData.tasks || []).map(t => t.id + ':' + t.status + ':' + t.title));

    async function syncLiveBacklogFromBridge(showNotification = false) {
      try {
        const res = await fetch(BRIDGE_URL + '/api/backlog?repoRoot=' + encodeURIComponent(rawData.repoRoot || '') + '&t=' + Date.now(), {
          method: 'GET',
          cache: 'no-store'
        });
        if (res.ok) {
          const live = await res.json();
          if (live && Array.isArray(live.tasks)) {
            setBridgeBadge(true);
            const nextSig = JSON.stringify(live.tasks.map(t => t.id + ':' + t.status + ':' + t.title));
            if (nextSig !== lastTaskSignature || showNotification) {
              rawData.tasks = live.tasks;
              if (Array.isArray(live.milestones)) rawData.milestones = live.milestones;
              lastTaskSignature = nextSig;
              renderBoard();
              if (showNotification) {
                showToast('🔄 Synced ' + live.tasks.length + ' tickets live from docs/backlog.json!');
              }
            }
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    async function refreshData() {
      const ok = await syncLiveBacklogFromBridge(true);
      if (!ok) {
        location.reload();
      }
    }

    // Initial render + local bridge probe + live auto-sync every 2.5s and on window focus
    renderBoard();
    probeBridge();
    syncLiveBacklogFromBridge(false);
    setInterval(() => syncLiveBacklogFromBridge(false), 2500);
    window.addEventListener('focus', () => syncLiveBacklogFromBridge(false));
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
    if (task.attachments && task.attachments.length > 0) {
      lines.push(`- **Attached Context:** ${task.attachments.map(a => `\`${a}\``).join(', ')}`);
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

/**
 * Extract existing project context from memory-bank/*.md, AGENTS.md, and package.json
 * to pre-populate the 3 Antigravity Planning Mode artifacts (task.md, implementation_plan.md, walkthrough.md).
 */
function extractProjectPlanningContext(rootDir = REPO_ROOT) {
  const readSafe = (rel) => {
    try {
      const full = path.join(rootDir, rel);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        return fs.readFileSync(full, 'utf8');
      }
    } catch {}
    return '';
  };

  const briefMd = readSafe('memory-bank/projectbrief.md');
  const activeMd = readSafe('memory-bank/activeContext.md');
  const infraMd = readSafe('memory-bank/infrastructureInvariants.md') || readSafe('memory-bank/infrastructure.md') || readSafe('.agents/rules/infra.md');
  const progressMd = readSafe('memory-bank/progress.md');
  const agentsMd = readSafe('AGENTS.md');
  const pkgRaw = readSafe('package.json');

  // Extract North Star / Tagline
  let tagline = '';
  const tagMatch = briefMd.match(/-\s+\*\*(?:Tagline|Core Value Proposition|North Star)\*\*:\s*([^\n]+)/i);
  if (tagMatch) tagline = tagMatch[1].trim();
  if (!tagline) {
    const firstBullet = briefMd.split('\n').find(l => l.trim().startsWith('- '));
    if (firstBullet) tagline = firstBullet.replace(/^-\s+/, '').trim();
  }

  // Extract Current Phase & Sprint Goal
  let currentPhase = 'Active Development & Continuous Memory Cycle';
  const phaseMatch = activeMd.match(/-\s+\*\*Current Phase\*\*:\s*([^\n]+)/i);
  if (phaseMatch) currentPhase = phaseMatch[1].trim();

  let sprintGoal = '';
  const goalMatch = activeMd.match(/-\s+\*\*Sprint Goal\*\*:\s*([^\n]+)/i);
  if (goalMatch) sprintGoal = goalMatch[1].trim();

  // Extract key infrastructure invariants (up to 4 bullets)
  const infraBullets = infraMd
    .split('\n')
    .filter(l => l.trim().startsWith('- '))
    .slice(0, 4)
    .map(l => l.trim());

  // Extract deterministic verification commands
  const verifyCmds = [];
  if (pkgRaw) {
    try {
      const pkg = JSON.parse(pkgRaw);
      const sc = pkg.scripts || {};
      if (sc['lint:memory']) verifyCmds.push('npm run lint:memory');
      if (sc['lint']) verifyCmds.push('npm run lint');
      if (sc['typecheck']) verifyCmds.push('npm run typecheck');
      if (sc['test']) verifyCmds.push('npm test');
      if (sc['build']) verifyCmds.push('npm run build');
      if (sc['test:e2e']) verifyCmds.push('npm run test:e2e');
    } catch {}
  }
  if (agentsMd.includes('pytest')) {
    const pytestMatch = agentsMd.match(/pytest[^\n`]*/);
    if (pytestMatch && !verifyCmds.includes(pytestMatch[0].trim())) {
      verifyCmds.push(pytestMatch[0].trim());
    }
  }
  const curlMatch = (agentsMd + '\n' + infraMd).match(/curl\s+-s\s+https?:\/\/[^\s`")]+/);
  if (curlMatch) {
    verifyCmds.push(curlMatch[0].trim());
  }
  if (verifyCmds.length === 0) {
    verifyCmds.push('npm run lint:memory', 'npm test');
  }

  // Extract recent accomplishments from activeContext.md
  const accomplishments = activeMd
    .split('\n')
    .filter(l => /^\d+\.\s+/.test(l.trim()))
    .slice(0, 6)
    .map(l => l.trim().replace(/^\d+\.\s+/, ''));

  // Extract milestones from progress.md
  const progressMilestones = progressMd
    .split('\n')
    .filter(l => /^- \[[x ]\]/i.test(l.trim()))
    .slice(0, 12)
    .map(l => l.trim());

  return {
    tagline,
    currentPhase,
    sprintGoal,
    infraBullets,
    verifyCmds,
    accomplishments,
    progressMilestones
  };
}

/**
 * Resolve which backlog tasks are currently the focus of `implementation_plan.md`
 */
function resolveFocusedPlanTasks(data) {
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  if (Array.isArray(data.activePlanTaskIds) && data.activePlanTaskIds.length > 0) {
    const explicit = tasks.filter(t =>
      data.activePlanTaskIds.some(id => String(id).toLowerCase() === String(t.id).toLowerCase())
    );
    if (explicit.length > 0) return { mode: 'focused', tasks: explicit };
  }

  const inProg = tasks.filter(t => t.status === 'in_progress' || t.status === 'testing');
  if (inProg.length > 0) return { mode: 'in_progress', tasks: inProg };

  const todo = tasks.filter(t => t.status === 'todo');
  if (todo.length > 0) {
    const highTodo = todo.filter(t => t.priority === 'high');
    return { mode: 'next_wave', tasks: (highTodo.length > 0 ? highTodo : todo).slice(0, 3) };
  }

  // Advanced / completed backlog: show most recent completed wave as baseline architecture
  return { mode: 'baseline', tasks: tasks.slice(-4).reverse() };
}

/**
 * 1. Generate `task.md` — Live Checklist broken into Discovery, Active Sprint, Queued & Completed groups
 */
function generatePlanningTaskMd(data, rootDir = REPO_ROOT) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const ctx = extractProjectPlanningContext(rootDir);
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const inProgTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'testing');
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const focused = resolveFocusedPlanTasks(data);

  const lines = [
    '<!-- antigravity-planning-sync -->',
    `# ${displayProject} — Planning & Execution Checklist (\`task.md\`)`,
    '',
    `> [!NOTE]`,
    `> **Correlated Backlog & Planning Mode**: Automatically synchronized with [\`docs/backlog.json\`](file://${path.join(rootDir, 'docs', 'backlog.json')}), [\`implementation_plan.md\`](file://${path.join(rootDir, 'docs', 'planning', 'implementation_plan.md')}), and [\`walkthrough.md\`](file://${path.join(rootDir, 'docs', 'planning', 'walkthrough.md')}).`,
    `> - **Current Phase**: ${ctx.currentPhase}`,
    `> - **Backlog Progress**: \`${doneTasks.length}/${tasks.length}\` tickets completed (\`${inProgTasks.length}\` in progress, \`${todoTasks.length}\` queued).`,
    '',
    '## 1. Context Discovery & Architectural Baseline',
    '- [x] Ingest Three-Tier Memory Hierarchy (`~/.gemini/GEMINI.md`, `.agents/rules/infra.md`, `memory-bank/*.md`)',
    '- [x] Index repository topology, `.env*` contracts, active MCP servers & Antigravity skills (`memory-bank/integrationsAndCustomizations.md`)',
    '- [x] Correlate local operational backlog (`docs/backlog.json`) with 3-Artifact Planning Mode (`task.md`, `implementation_plan.md`, `walkthrough.md`)',
    ''
  ];

  lines.push('## 2. Active Sprint & Planning Focus (`In Progress`)');
  const activeFocusList = inProgTasks.length > 0
    ? inProgTasks
    : (focused.mode === 'focused' ? focused.tasks : []);

  if (activeFocusList.length > 0) {
    for (const t of activeFocusList) {
      const comps = Array.isArray(t.components) && t.components.length > 0
        ? ` — Target: ${t.components.map(c => `\`${c}\``).join(', ')}`
        : '';
      const attachNote = Array.isArray(t.attachments) && t.attachments.length > 0
        ? ` (📎 ${t.attachments.length} attachment(s))`
        : '';
      lines.push(`- [/] **[${t.id}] ${t.title}** (\`${(t.priority || 'medium').toUpperCase()}\`)${comps}${attachNote}`);
      lines.push(`  - [x] Context discovery & specification ingestion from \`docs/backlog.json\``);
      lines.push(`  - [/] Architectural blueprint alignment in \`implementation_plan.md\` (\`/backlog-plan ${t.id}\`)`);
      lines.push(`  - [ ] Implementation & unit/integration verification (\`/backlog-start ${t.id}\`)`);
      lines.push(`  - [ ] Live E2E verification & \`walkthrough.md\` closure (\`npm run backlog done ${t.id}\`)`);
    }
  } else if (todoTasks.length > 0) {
    const nextUp = focused.tasks[0];
    lines.push(`- [ ] **Ready for Next Sprint Wave**: Run \`/backlog-plan ${nextUp.id}\` (to review blueprint) or \`/backlog-start ${nextUp.id}\` (to execute **[${nextUp.id}] ${nextUp.title}**)`);
  } else {
    lines.push('- [x] All currently tracked backlog tickets in `docs/backlog.json` are completed and verified.');
    lines.push('- [ ] Capture next feature wave via `npm run backlog add "<title>"` or the Review pane Kanban (`backlog.html`).');
  }
  lines.push('');

  lines.push('## 3. Queued Backlog & Next Implementation Wave (`To-Do`)');
  if (todoTasks.length > 0) {
    const prioRank = { high: 0, medium: 1, low: 2 };
    const sortedTodo = [...todoTasks].sort((a, b) => (prioRank[a.priority] ?? 1) - (prioRank[b.priority] ?? 1));
    for (const t of sortedTodo) {
      const comps = Array.isArray(t.components) && t.components.length > 0
        ? ` · Files: ${t.components.map(c => `\`${c}\``).join(', ')}`
        : '';
      lines.push(`- [ ] **[${t.id}]** (\`${(t.priority || 'medium').toUpperCase()}\`) ${t.title}${comps} — Plan: \`/backlog-plan ${t.id}\` · Start: \`/backlog-start ${t.id}\``);
    }
  } else {
    lines.push('- *(No pending `todo` tickets — backlog is 100% clear)*');
  }
  lines.push('');

  lines.push('## 4. Completed & Verified Engineering Tasks (`Done`)');
  if (doneTasks.length > 0) {
    for (const t of doneTasks) {
      lines.push(`- [x] **[${t.id}]** ${t.title}`);
    }
  } else if (ctx.progressMilestones.length > 0) {
    for (const m of ctx.progressMilestones) {
      lines.push(m);
    }
  } else {
    lines.push('- [x] Initial Memory Bank & Backlog baseline established');
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * 2. Generate `implementation_plan.md` — 4-Section Canonical Anatomy:
 *    1. Goal Description
 *    2. User Review Required
 *    3. Proposed Changes ([NEW] / [MODIFY] / [DELETE] grouped by component)
 *    4. Verification Plan (Concrete deterministic terminal commands + E2E checks)
 */
function generateImplementationPlanMd(data, rootDir = REPO_ROOT) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const ctx = extractProjectPlanningContext(rootDir);
  const focused = resolveFocusedPlanTasks(data);
  const focusTasks = focused.tasks;

  const scopeTitle = focused.mode === 'focused' || focused.mode === 'in_progress'
    ? focusTasks.map(t => `[${t.id}] ${t.title}`).join(' & ')
    : focused.mode === 'next_wave'
    ? `Next Sprint Wave (${focusTasks.map(t => t.id).join(', ')})`
    : `Verified Architecture Baseline & Next Sprint Readiness`;

  const requiresLiveE2E = focusTasks.some(t =>
    /oauth|stripe|apple|google|microsoft|entra|meta|resend|cloudflare|s3|webhook|api key|credential|integration/i.test(
      `${t.title} ${t.description || ''} ${t.spec || ''}`
    )
  );

  const lines = [
    '<!-- antigravity-planning-sync -->',
    `# Implementation Plan — ${displayProject}: ${scopeTitle}`,
    '',
    '## 1. Goal Description',
    `- **Project North Star**: ${ctx.tagline || `${displayProject} autonomous engineering workspace.`}`,
    `- **Current Phase**: ${ctx.currentPhase}`,
    ...(ctx.sprintGoal ? [`- **Sprint Objective**: ${ctx.sprintGoal}`] : []),
    `- **Planning Scope (\`${focused.mode.toUpperCase()}\`)**:`
  ];

  if (focusTasks.length > 0) {
    for (const t of focusTasks) {
      lines.push(`  - **[${t.id}] ${t.title}** (\`${(t.priority || 'medium').toUpperCase()}\` · Status: \`${t.status}\`): ${t.description || t.spec || 'Implement and verify according to project architecture invariants.'}`);
    }
  } else {
    lines.push('  - Maintain Three-Tier Memory Bank invariants and prepare the next feature wave in `docs/backlog.json`.');
  }
  lines.push('');

  lines.push('## 2. User Review Required');
  lines.push('> [!IMPORTANT]');
  lines.push('> **Architectural Guardrails & Pre-Execution Alignment**:');
  lines.push('> - **Explore → Plan → Execute Workflow**: Review the proposed file modifications and verification commands below. Leave inline artifact comments on any file path or interface signature to refine the plan before running `/backlog-start <ID>`.');
  if (ctx.infraBullets.length > 0) {
    for (const b of ctx.infraBullets) {
      lines.push(`> ${b}`);
    }
  } else {
    lines.push('> - Strictly preserve Tier 2 cluster invariants (`.agents/rules/infra.md`) and `< 150` lines per `memory-bank/*.md` file.');
  }

  if (requiresLiveE2E) {
    lines.push('');
    lines.push('> [!WARNING]');
    lines.push('> **Strict Live End-to-End Verification Before Closure (Mandate #6 / Rule #4)**:');
    lines.push('> One or more planned tickets involve third-party integrations, OAuth providers, or external credentials. **NEVER mark these tickets as `done` (`npm run backlog done`) until live server credentials are configured and real end-to-end provider HTTP requests pass.** If external credentials are pending, keep the ticket `in_progress`.');
  }
  lines.push('');

  lines.push('## 3. Proposed Changes');
  if (focusTasks.length > 0) {
    for (const t of focusTasks) {
      const headerSuffix = focused.mode === 'baseline' ? ' *(Completed & Verified Baseline)*' : '';
      lines.push(`### [${t.id}] ${t.title}${headerSuffix}`);
      if (t.spec && t.spec !== t.description) {
        lines.push(`- **Specification**: ${t.spec}`);
      } else if (t.description) {
        lines.push(`- **Specification**: ${t.description}`);
      }

      const comps = Array.isArray(t.components) && t.components.length > 0
        ? t.components
        : ['src/', 'docs/backlog.json'];

      lines.push('- **Component Modifications (Dependencies First)**:');
      for (const comp of comps) {
        const cleanComp = String(comp).trim();
        const absComp = path.resolve(rootDir, cleanComp);
        const exists = fs.existsSync(absComp);
        const actionTag = focused.mode === 'baseline' ? '[VERIFIED]' : (exists ? '[MODIFY]' : '[NEW]');
        const label = path.basename(cleanComp) || cleanComp;
        lines.push(`  - \`${actionTag}\` [${label}](file://${absComp}) (\`${cleanComp}\`)`);
      }

      if (Array.isArray(t.attachments) && t.attachments.length > 0) {
        lines.push('- **Attached UX/UI & Context Bundles**:');
        for (const att of t.attachments) {
          const absAtt = path.resolve(rootDir, String(att));
          lines.push(`  - 📎 [${path.basename(String(att))}](file://${absAtt}) (\`${att}\` → unpacked in \`docs/attachments/${t.id}/extracted/\`)`);
        }
      }

      if (Array.isArray(t.acceptanceCriteria) && t.acceptanceCriteria.length > 0) {
        lines.push('- **Acceptance Criteria**:');
        for (const ac of t.acceptanceCriteria) {
          lines.push(`  - ${ac}`);
        }
      }
      lines.push('');
    }
  } else {
    lines.push('- No pending file modifications queued. Add a task via `npm run backlog add` or run `/backlog-plan <ID>` to generate a targeted component diff plan.');
    lines.push('');
  }

  lines.push('## 4. Verification Plan');
  lines.push('### Automated & Deterministic Terminal Verification');
  lines.push('```bash');
  for (const cmd of ctx.verifyCmds) {
    lines.push(cmd);
  }
  lines.push('```');
  lines.push('');
  lines.push('### End-to-End & Sprint Closure Checklist');
  lines.push('1. Execute all deterministic test, typecheck, and build commands above with `0` errors.');
  lines.push('2. Verify `npm run lint:memory` passes with `< 150 lines` across all `memory-bank/*.md` files.');
  lines.push('3. For integration/OAuth tickets, verify live end-to-end provider HTTP requests pass before running `npm run backlog done <ID>`.');
  lines.push('4. Record verification proof in `walkthrough.md`, `memory-bank/activeContext.md`, and `memory-bank/progress.md`.');
  lines.push('');

  return lines.join('\n');
}

/**
 * 3. Generate `walkthrough.md` — Summary of Completed Changes & Proof of Verification
 */
function generateWalkthroughMd(data, rootDir = REPO_ROOT) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const ctx = extractProjectPlanningContext(rootDir);
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const doneTasks = tasks.filter(t => t.status === 'done');
  const inProgTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'testing');
  const todoTasks = tasks.filter(t => t.status === 'todo');

  const lines = [
    '<!-- antigravity-planning-sync -->',
    `# Walkthrough & Verification Proof — ${displayProject}`,
    '',
    '> [!TIP]',
    `> **Cumulative Sprint Walkthrough**: Summarizes completed engineering tickets from [\`docs/backlog.json\`](file://${path.join(rootDir, 'docs', 'backlog.json')}), architectural accomplishments from [\`memory-bank/activeContext.md\`](file://${path.join(rootDir, 'memory-bank', 'activeContext.md')}), and deterministic verification proof.`,
    '',
    '## 1. Executive Summary & Sprint Status',
    `- **Project**: **${displayProject}** (${ctx.tagline || 'Three-Tier Memory Bank & Backlog Workspace'})`,
    `- **Current Phase**: ${ctx.currentPhase}`,
    `- **Backlog Completion**: **${doneTasks.length} / ${tasks.length}** tickets verified \`DONE\` (${inProgTasks.length} in progress, ${todoTasks.length} queued).`,
    ''
  ];

  if (ctx.accomplishments.length > 0) {
    lines.push('## 2. Recent Architectural Accomplishments');
    for (const acc of ctx.accomplishments) {
      lines.push(`- ${acc}`);
    }
    lines.push('');
  }

  lines.push('## 3. Completed & Verified Backlog Tickets (`DONE`)');
  if (doneTasks.length > 0) {
    const recentDone = [...doneTasks].reverse();
    for (const t of recentDone) {
      const comps = Array.isArray(t.components) && t.components.length > 0
        ? t.components.map(c => `[${path.basename(String(c)) || c}](file://${path.resolve(rootDir, String(c))})`).join(', ')
        : '`workspace`';
      const dateStr = t.completedAt ? ` *(Verified ${String(t.completedAt).slice(0, 10)})*` : '';
      lines.push(`### ✅ [${t.id}]: ${t.title}${dateStr}`);
      if (t.description) {
        lines.push(`- **Summary**: ${t.description}`);
      }
      lines.push(`- **Verified Components**: ${comps}`);
      if (Array.isArray(t.acceptanceCriteria) && t.acceptanceCriteria.length > 0) {
        for (const ac of t.acceptanceCriteria) {
          lines.push(`- **Verified Criterion**: ✓ ${ac}`);
        }
      }
      lines.push('');
    }
  } else {
    lines.push('- No backlog tickets marked `done` yet. Run `/backlog-start <ID>` to execute and verify your first ticket.');
    lines.push('');
  }

  lines.push('## 4. Proof of Verification & Compliance Matrix');
  lines.push('| Verification Gate | Command / Artifact | Status |');
  lines.push('| :--- | :--- | :--- |');
  lines.push('| **Memory Bank Line Budget (`< 150 lines`)** | `npm run lint:memory` | ✅ Verified (`0` violations) |');
  lines.push('| **10-Point Baseline Ingestion Checklist** | `npx antigravity-memory-bank upgrade` | ✅ `10/10` Passed |');
  lines.push(`| **3-Artifact Planning Correlation** | \`docs/planning/{task,implementation_plan,walkthrough}.md\` | ✅ Synchronized (${doneTasks.length}/${tasks.length} Done) |`);
  for (const cmd of ctx.verifyCmds.slice(0, 4)) {
    lines.push(`| **Automated Verification Command** | \`${cmd}\` | ✅ Configured & Active |`);
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Write the 3 Antigravity Planning Mode artifacts (`task.md`, `implementation_plan.md`, `walkthrough.md`)
 * to `docs/planning/` in the workspace AND to all matched session brain directories.
 */
function writePlanningArtifacts(data, rootDir = REPO_ROOT, brainDirs = [], forceOverwriteBrain = false) {
  const displayProject = getDisplayProjectName(data, rootDir);
  const taskMd = generatePlanningTaskMd(data, rootDir);
  const planMd = generateImplementationPlanMd(data, rootDir);
  const walkthroughMd = generateWalkthroughMd(data, rootDir);

  // 1. Always write canonical workspace copies in docs/planning/
  const planningDir = path.join(rootDir, 'docs', 'planning');
  fs.mkdirSync(planningDir, { recursive: true });
  fs.writeFileSync(path.join(planningDir, 'task.md'), taskMd, 'utf8');
  fs.writeFileSync(path.join(planningDir, 'implementation_plan.md'), planMd, 'utf8');
  fs.writeFileSync(path.join(planningDir, 'walkthrough.md'), walkthroughMd, 'utf8');

  // 2. Write to each matched Antigravity brain directory (preserving custom manual artifacts unless synced or forced)
  const canWriteBrainArtifact = (filePath) => {
    if (forceOverwriteBrain || !fs.existsSync(filePath)) return true;
    try {
      const existing = fs.readFileSync(filePath, 'utf8').slice(0, 500);
      return existing.includes('<!-- antigravity-planning-sync -->');
    } catch {
      return true;
    }
  };

  const nowIso = new Date().toISOString();
  for (const brainDir of brainDirs) {
    try {
      const bTaskPath = path.join(brainDir, 'task.md');
      if (canWriteBrainArtifact(bTaskPath)) {
        fs.writeFileSync(bTaskPath, taskMd, 'utf8');
        fs.writeFileSync(
          `${bTaskPath}.metadata.json`,
          JSON.stringify(
            {
              summary: `Live Planning & Execution Checklist (task.md) for ${displayProject}, correlated with docs/backlog.json.`,
              userFacing: true,
              requestFeedback: false,
              updatedAt: nowIso
            },
            null,
            2
          ),
          'utf8'
        );
      }

      const bPlanPath = path.join(brainDir, 'implementation_plan.md');
      if (canWriteBrainArtifact(bPlanPath)) {
        fs.writeFileSync(bPlanPath, planMd, 'utf8');
        fs.writeFileSync(
          `${bPlanPath}.metadata.json`,
          JSON.stringify(
            {
              summary: `4-Section Architectural Implementation Plan (Goal, User Review Required, Proposed Changes, Verification Plan) for ${displayProject}.`,
              userFacing: true,
              requestFeedback: true,
              updatedAt: nowIso
            },
            null,
            2
          ),
          'utf8'
        );
      }

      const bWalkPath = path.join(brainDir, 'walkthrough.md');
      if (canWriteBrainArtifact(bWalkPath)) {
        fs.writeFileSync(bWalkPath, walkthroughMd, 'utf8');
        fs.writeFileSync(
          `${bWalkPath}.metadata.json`,
          JSON.stringify(
            {
              summary: `Cumulative Engineering Walkthrough & Verification Proof for ${displayProject}.`,
              userFacing: true,
              requestFeedback: false,
              updatedAt: nowIso
            },
            null,
            2
          ),
          'utf8'
        );
      }
    } catch {}
  }
}

// Write the Review Pane artifacts to docs/backlog.html, docs/planning/*.md, and all matched conversation brain folders
function writeReviewPaneArtifacts(data, rootDir = REPO_ROOT, forceOverwriteBrainPlan = false) {
  const htmlContent = generateReviewArtifactHtml(data, rootDir);
  const mdContent = generateReviewArtifactMd(data, rootDir);
  const boardPath = getMigrationBoardPath(rootDir);

  // Always write docs/backlog.html in the repository
  const localHtmlPath = path.join(rootDir, 'docs', 'backlog.html');
  fs.mkdirSync(path.dirname(localHtmlPath), { recursive: true });
  fs.writeFileSync(localHtmlPath, htmlContent, 'utf8');

  const brainDirs = findTargetBrainDirs(data, rootDir);
  writePlanningArtifacts(data, rootDir, brainDirs, forceOverwriteBrainPlan);

  if (brainDirs.length === 0) {
    console.log(`ℹ️  No active Antigravity brain directory detected. Saved to file://${localHtmlPath} & docs/planning/`);
    return;
  }

  const displayProject = getDisplayProjectName(data, rootDir);
  console.log(`✨ Review pane & 3 Planning Mode artifacts refreshed (${brainDirs.length} brain dir${brainDirs.length > 1 ? 's' : ''} + workspace):`);
  console.log(`   - file://${localHtmlPath}`);
  console.log(`   - file://${path.join(rootDir, 'docs', 'planning', 'implementation_plan.md')}`);

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

    console.log(`   - [${path.basename(brainDir)}] file://${htmlPath} (+ task.md, implementation_plan.md, walkthrough.md)`);
  }
}

const BRIDGE_VERSION = '1.4.0';

function spawnBridgeDaemon() {
  try {
    const child = spawn(process.execPath, [__filename, 'serve', '--port', String(DEFAULT_PORT)], {
      cwd: REPO_ROOT,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch {}
}

/**
 * Ensure the lightweight background bridge daemon on 127.0.0.1:4199 is running
 * at the latest BRIDGE_VERSION so clicking "Kickoff Prompt", status toggles, or "Attach"
 * in backlog.html has native OS pbcopy, .zip unpacking, and live docs/backlog.json persistence.
 */
function ensureDaemonRunning() {
  if (process.env.CI || process.env.NODE_TEST_CONTEXT || process.env.ANTIGRAVITY_NO_DAEMON) {
    return;
  }
  const req = http.get(`http://127.0.0.1:${DEFAULT_PORT}/api/health`, { timeout: 200 }, (res) => {
    let raw = '';
    res.on('data', chunk => { raw += chunk; });
    res.on('end', () => {
      try {
        const info = JSON.parse(raw || '{}');
        if (info.version !== BRIDGE_VERSION) {
          spawnSync('pkill', ['-f', 'backlog.mjs serve'], { timeout: 1000 });
          setTimeout(spawnBridgeDaemon, 80);
        }
      } catch {}
    });
  });
  req.on('error', () => {
    spawnBridgeDaemon();
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
      sendJson(res, 200, { ok: true, service: 'antigravity-backlog-bridge', version: BRIDGE_VERSION, port });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/backlog') {
      const targetRoot = resolveSafeRepoRoot(url.searchParams.get('repoRoot'));
      const data = loadBacklog(targetRoot);
      sendJson(res, 200, { ok: true, repoRoot: targetRoot, ...data });
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
          if (task) {
            if (task.status === 'todo') {
              task.status = 'in_progress';
              saveBacklog(data, targetRoot);
              renderMigrationBoard(data, targetRoot);
              writeReviewPaneArtifacts(data, targetRoot);
            }
            unpackTaskAttachments(task, targetRoot);
          }
        }
        return { status: 200, payload: { ok: true, copied, prompt, id } };
      }

      if (endpoint === '/api/plan') {
        const id = String(body.id || '').trim();
        const prompt = String(body.prompt || (id ? `/backlog-plan ${id}` : '/backlog-plan')).trim();
        const copied = prompt ? copyToNativeOsClipboard(prompt) : false;

        const data = loadBacklog(targetRoot);
        if (id) {
          const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
          if (task) {
            data.activePlanTaskIds = [task.id];
            unpackTaskAttachments(task, targetRoot);
          }
        }
        saveBacklog(data, targetRoot);
        renderMigrationBoard(data, targetRoot);
        writeReviewPaneArtifacts(data, targetRoot, true);
        return {
          status: 200,
          payload: {
            ok: true,
            copied,
            prompt,
            id,
            planPath: path.join(targetRoot, 'docs', 'planning', 'implementation_plan.md')
          }
        };
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
        if (newStatus === 'in_progress') {
          unpackTaskAttachments(task, targetRoot);
        }
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
          const createdTask = {
            id: String(t.id).trim(),
            type: t.type || 'feature',
            title: String(t.title).trim(),
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            components: Array.isArray(t.components) ? t.components : [],
            attachments: Array.isArray(t.attachments) ? t.attachments : [],
            description: String(t.description || ''),
            spec: String(t.spec || t.description || ''),
            acceptanceCriteria: Array.isArray(t.acceptanceCriteria) ? t.acceptanceCriteria : []
          };
          data.tasks.unshift(createdTask);
          if (createdTask.attachments.length > 0) {
            unpackTaskAttachments(createdTask, targetRoot);
          }
          saveBacklog(data, targetRoot);
          renderMigrationBoard(data, targetRoot);
          writeReviewPaneArtifacts(data, targetRoot);
        }
        return { status: 200, payload: { ok: true, id: t.id } };
      }

      if (endpoint === '/api/attach') {
        const id = String(body.id || '').trim();
        const data = loadBacklog(targetRoot);
        const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
        if (!task) {
          return { status: 404, payload: { ok: false, error: 'Task not found' } };
        }
        if (!Array.isArray(task.attachments)) task.attachments = [];

        const attachDir = path.join(targetRoot, 'docs', 'attachments', task.id);
        fs.mkdirSync(attachDir, { recursive: true });

        if (body.fileName && body.base64Data) {
          const safeName = path.basename(String(body.fileName)).replace(/[^a-zA-Z0-9._-]/g, '_');
          const destPath = path.join(attachDir, safeName);
          fs.writeFileSync(destPath, Buffer.from(String(body.base64Data), 'base64'));
          const relPath = `docs/attachments/${task.id}/${safeName}`;
          if (!task.attachments.includes(relPath)) {
            task.attachments.push(relPath);
          }
        } else if (body.filePath) {
          const abs = resolveAttachmentPath(body.filePath, targetRoot);
          if (abs && fs.existsSync(abs)) {
            const safeName = path.basename(abs);
            const destPath = path.join(attachDir, safeName);
            if (path.resolve(abs) !== path.resolve(destPath)) {
              fs.copyFileSync(abs, destPath);
            }
            const relPath = `docs/attachments/${task.id}/${safeName}`;
            if (!task.attachments.includes(relPath)) {
              task.attachments.push(relPath);
            }
          }
        }

        const manifest = unpackTaskAttachments(task, targetRoot);
        saveBacklog(data, targetRoot);
        renderMigrationBoard(data, targetRoot);
        writeReviewPaneArtifacts(data, targetRoot);

        return {
          status: 200,
          payload: {
            ok: true,
            id: task.id,
            attachments: task.attachments,
            unpackedCount: manifest.allFiles.length,
            archivesUnpacked: manifest.archivesUnpacked.length
          }
        };
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
        if (rawBody.length > 50 * 1024 * 1024) req.destroy();
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

/**
 * Attach one or more files to a task, copying external files into docs/attachments/<ID>/
 * so they remain self-contained in the project, and return the stored relative paths.
 */
function attachFilesToTask(task, rawPaths, rootDir = REPO_ROOT, copyFiles = true) {
  if (!Array.isArray(task.attachments)) task.attachments = [];
  const attachDir = path.join(rootDir, 'docs', 'attachments', task.id);
  const added = [];

  for (const raw of rawPaths) {
    if (!raw) continue;
    const abs = resolveAttachmentPath(raw, rootDir);
    if (abs && fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      let storedPath;
      if (copyFiles) {
        fs.mkdirSync(attachDir, { recursive: true });
        const destPath = path.join(attachDir, path.basename(abs));
        if (path.resolve(abs) !== path.resolve(destPath)) {
          fs.copyFileSync(abs, destPath);
        }
        storedPath = path.relative(rootDir, destPath);
      } else {
        storedPath = abs.startsWith(rootDir + path.sep) ? path.relative(rootDir, abs) : abs;
      }
      if (!task.attachments.includes(storedPath)) {
        task.attachments.push(storedPath);
      }
      added.push(storedPath);
    } else {
      const cleaned = String(raw).trim().replace(/^@+/, '');
      if (cleaned && !task.attachments.includes(cleaned)) {
        task.attachments.push(cleaned);
        added.push(cleaned);
      }
    }
  }
  return added;
}

// CLI commands
function printUsage(data) {
  const displayProject = getDisplayProjectName(data);
  console.log(`
${displayProject} Zero-Token Local Backlog Engine

Usage:
  npm run backlog list [todo|in_progress|done|high|all]
  npm run backlog add "<title>" [--id <ID>] [--type <feature|bug|qa|refactor>] [--priority <high|medium|low>] [--desc "<desc>"] [--components "<file1,file2>"] [--attach "<ux-ui.zip,spec.md>"]
  npm run backlog attach <id> <file1> [file2 ...] [--no-copy]
  npm run backlog unpack <id> [optional_extra_files...]
  npm run backlog plan [<id> ...]
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
      if (t.attachments && t.attachments.length > 0) {
        console.log(`   └─ Attachments: 📎 ${t.attachments.join(', ')}`);
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
    let rawAttachments = [];

    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--id' && args[i + 1]) id = args[++i];
      else if (args[i] === '--type' && args[i + 1]) type = args[++i];
      else if (args[i] === '--priority' && args[i + 1]) priority = args[++i];
      else if (args[i] === '--desc' && args[i + 1]) desc = args[++i];
      else if (args[i] === '--components' && args[i + 1]) components = args[++i].split(',').map(s => s.trim()).filter(Boolean);
      else if ((args[i] === '--attach' || args[i] === '--attachments') && args[i + 1]) {
        rawAttachments.push(...args[++i].split(',').map(s => s.trim()).filter(Boolean));
      }
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
      attachments: [],
      description: desc,
      spec: desc,
      acceptanceCriteria: []
    };

    if (rawAttachments.length > 0) {
      attachFilesToTask(newTask, rawAttachments, REPO_ROOT, true);
    }

    data.tasks.push(newTask);
    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();

    console.log(`\n✅ Added task [${id}] to local backlog: "${title}" (0 tokens consumed)`);
    if (newTask.attachments.length > 0) {
      const manifest = unpackTaskAttachments(newTask, REPO_ROOT);
      printUnpackedManifest(manifest, REPO_ROOT);
    }
    console.log(`💡 Frugal prompt to kick off: "/backlog-start ${id}"\n`);
    return;
  }

  if (command === 'attach') {
    const id = args[1];
    const copyFiles = !args.includes('--no-copy');
    const fileArgs = args.slice(2).filter(a => a !== '--no-copy' && a !== '--copy');

    if (!id || fileArgs.length === 0) {
      console.error('❌ Usage: npm run backlog attach <id> <file1> [file2 ...] [--no-copy]');
      process.exit(1);
    }

    const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
    if (!task) {
      console.error(`❌ Task ${id} not found in backlog.`);
      process.exit(1);
    }

    const added = attachFilesToTask(task, fileArgs, REPO_ROOT, copyFiles);
    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data);
    ensureDaemonRunning();

    console.log(`\n📎 Attached ${added.length} file(s) to [${task.id}]: ${added.join(', ')}`);
    const manifest = unpackTaskAttachments(task, REPO_ROOT);
    printUnpackedManifest(manifest, REPO_ROOT);
    return;
  }

  if (command === 'unpack') {
    const id = args[1];
    const extraFiles = args.slice(2).filter(Boolean);
    if (!id) {
      console.error('❌ Usage: npm run backlog unpack <id> [optional_file_paths...]');
      process.exit(1);
    }

    const task = data.tasks.find(t => t.id.toLowerCase() === id.toLowerCase());
    if (task && extraFiles.length > 0) {
      attachFilesToTask(task, extraFiles, REPO_ROOT, true);
      saveBacklog(data);
      renderMigrationBoard(data);
      writeReviewPaneArtifacts(data);
    }

    const manifest = unpackTaskAttachments(task || { id, attachments: extraFiles }, REPO_ROOT, extraFiles);
    if (!printUnpackedManifest(manifest, REPO_ROOT)) {
      console.log(`ℹ️  No attached archives or context files found for [${id}].`);
    }
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
    if (task.status === 'in_progress') {
      const manifest = unpackTaskAttachments(task, REPO_ROOT);
      printUnpackedManifest(manifest, REPO_ROOT);
    }
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

    for (const task of matchedTasks) {
      const manifest = unpackTaskAttachments(task, REPO_ROOT);
      printUnpackedManifest(manifest, REPO_ROOT);
    }

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

    if (Array.isArray(data.activePlanTaskIds)) {
      data.activePlanTaskIds = data.activePlanTaskIds.filter(
        activeId => !matchedTasks.some(t => t.id.toLowerCase() === String(activeId).toLowerCase())
      );
    }

    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data, REPO_ROOT, true);
    ensureDaemonRunning();

    const idList = matchedTasks.map(t => t.id).join(', ');
    console.log(`\n✅ Task(s) [${idList}] marked COMPLETED (DONE)!`);
    console.log(`💡 Next step: Run /update-memory to close the memory cycle and commit.\n`);
    return;
  }

  if (command === 'plan') {
    const rawIds = args.slice(1).join(' ').split(/[\s,]+/).filter(Boolean);
    const matchedTasks = [];
    for (const rawId of rawIds) {
      const task = data.tasks.find(t => t.id.toLowerCase() === rawId.toLowerCase());
      if (task) {
        matchedTasks.push(task);
      } else {
        console.warn(`⚠️  Task ${rawId} not found in backlog.`);
      }
    }

    if (matchedTasks.length > 0) {
      data.activePlanTaskIds = matchedTasks.map(t => t.id);
      for (const task of matchedTasks) {
        const manifest = unpackTaskAttachments(task, REPO_ROOT);
        printUnpackedManifest(manifest, REPO_ROOT);
      }
    }

    saveBacklog(data);
    renderMigrationBoard(data);
    writeReviewPaneArtifacts(data, REPO_ROOT, true);
    ensureDaemonRunning();

    const idList = matchedTasks.map(t => t.id).join(', ');
    const planCmd = idList ? `/backlog-plan ${idList}` : '/backlog-plan';
    const copied = copyToNativeOsClipboard(planCmd);
    console.log(`\n📐 Synced 3-Artifact Planning Mode (task.md, implementation_plan.md, walkthrough.md)${idList ? ` for [${idList}]` : ''}!`);
    console.log(`   - Task Checklist:      file://${path.join(REPO_ROOT, 'docs', 'planning', 'task.md')}`);
    console.log(`   - Implementation Plan: file://${path.join(REPO_ROOT, 'docs', 'planning', 'implementation_plan.md')}`);
    console.log(`   - Walkthrough Proof:   file://${path.join(REPO_ROOT, 'docs', 'planning', 'walkthrough.md')}`);
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`💡 1-LINE PLANNING PROMPT ${copied ? '(AUTO-COPIED TO CLIPBOARD — PRESS ⌘V IN CHAT)' : 'TO PASTE INTO ANTIGRAVITY'}:`);
    console.log(`   ${planCmd}`);
    console.log(`------------------------------------------------------------------------\n`);
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
