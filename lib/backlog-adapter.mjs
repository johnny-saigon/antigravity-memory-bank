/**
 * Antigravity Memory Bank — Backlog & Board Adapter
 *
 * Scans an existing project for any boards, documentation, bug records,
 * or checklists that maintain features and bug fixes, and adapts them into
 * the canonical decoupled backlog system:
 * - docs/backlog.json (Machine-readable local task store)
 * - docs/MIGRATION_BOARD.md or docs/BACKLOG.md (Human-readable board)
 * - docs/BACKLOG_GUIDE.md (User guide)
 * - scripts/backlog.mjs (Zero-token CLI engine)
 * - .agents/skills/backlog-start/SKILL.md (/backlog-start slash command)
 * - Antigravity Review Pane artifacts (backlog.html & backlog-board.md)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export async function adaptExistingBacklog(targetDir, projectName) {
  console.log('\n🔎 Scanning for existing feature boards, bug fix records, and task checklists...');

  const projectBaseName = path.basename(targetDir);
  const resolvedProjectName = projectName || projectBaseName;

  const backlogJsonPath = path.join(targetDir, 'docs/backlog.json');
  let existingData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    project: resolvedProjectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    tasks: [],
    milestones: []
  };

  try {
    const raw = await fs.readFile(backlogJsonPath, 'utf8');
    existingData = JSON.parse(raw);
    console.log(`  ℹ️ Found existing docs/backlog.json with ${existingData.tasks.length} tasks.`);
  } catch {}

  const existingTaskIds = new Set(existingData.tasks.map(t => (t.id || '').toUpperCase()));
  const existingMilestoneIds = new Set(existingData.milestones.map(m => (m.id || '').toUpperCase()));

  const scannedFiles = [];
  const discoveredTasks = [];
  const discoveredMilestones = [];

  // Candidate board and doc paths to check
  const candidateDocs = [
    'docs/MIGRATION_BOARD.md',
    'docs/BUG_FIX_RECORDS.md',
    'docs/BACKLOG.md',
    'docs/ROADMAP.md',
    'docs/TODO.md',
    'MIGRATION_BOARD.md',
    'BACKLOG.md',
    'ROADMAP.md',
    'TODO.md',
    'memory-bank/progress.md'
  ];

  for (const relPath of candidateDocs) {
    const fullPath = path.join(targetDir, relPath);
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      scannedFiles.push(relPath);

      // Parse structured sections: ### ID: Title or ### [ID]: Title
      const sectionRegex = /^###\s+(?:\[([^\]]+)\]|([A-Z0-9_\-]+))[:\s]+([^\n]+)/gm;
      let match;
      const sectionIndices = [];

      while ((match = sectionRegex.exec(content)) !== null) {
        const id = (match[1] || match[2] || '').trim();
        const title = (match[3] || '').trim();
        sectionIndices.push({
          id,
          title,
          index: match.index
        });
      }

      for (let i = 0; i < sectionIndices.length; i++) {
        const current = sectionIndices[i];
        const nextIndex = i + 1 < sectionIndices.length ? sectionIndices[i + 1].index : content.length;
        const block = content.slice(current.index, nextIndex);

        const taskId = current.id.toUpperCase();
        if (taskId.startsWith('MILESTONE-') || existingMilestoneIds.has(taskId) || existingTaskIds.has(taskId) || discoveredTasks.some(t => t.id.toUpperCase() === taskId)) {
          continue;
        }

        // Determine type
        let type = 'feature';
        if (taskId.startsWith('BUG-') || taskId.startsWith('FIX-') || taskId.startsWith('SAFEGUARD-') || relPath.includes('BUG')) {
          type = 'bug';
        } else if (taskId.startsWith('QA-') || taskId.includes('TEST')) {
          type = 'qa';
        } else if (taskId.startsWith('REFACTOR-')) {
          type = 'refactor';
        }

        // Parse status
        let status = 'todo';
        const statusMatch = block.match(/Status:\s*([^\n]+)/i);
        if (statusMatch) {
          const s = statusMatch[1].toLowerCase();
          if (s.includes('done') || s.includes('complete') || s.includes('closed') || s.includes('resolved')) {
            status = 'done';
          } else if (s.includes('in progress') || s.includes('active') || s.includes('wip')) {
            status = 'in_progress';
          } else if (s.includes('test') || s.includes('qa')) {
            status = 'testing';
          }
        } else if (block.includes('[x]')) {
          status = 'done';
        }

        // Parse priority
        let priority = 'medium';
        const prioMatch = block.match(/Priority:\s*([^\n]+)/i);
        if (prioMatch) {
          const p = prioMatch[1].toLowerCase();
          if (p.includes('high') || p.includes('urgent') || p.includes('critical')) priority = 'high';
          else if (p.includes('low')) priority = 'low';
        }

        // Parse components
        let components = [];
        const compMatch = block.match(/(?:Components|Platform):\s*([^\n]+)/i);
        if (compMatch) {
          components = compMatch[1].replace(/[`]/g, '').split(',').map(s => s.trim()).filter(Boolean);
        }

        // Parse attachments
        let attachments = [];
        const attachMatch = block.match(/Attachments:\s*([^\n]+)/i);
        if (attachMatch) {
          attachments = attachMatch[1].replace(/[`]/g, '').split(',').map(s => s.trim()).filter(Boolean);
        }

        // Parse description
        let description = '';
        const descMatch = block.match(/(?:Description|Scope|Overview):\s*([^\n]+(?:\n(?!\s*[-*#])[^\n]+)*)/i);
        if (descMatch) {
          description = descMatch[1].trim();
        }

        // Parse technical spec
        let spec = '';
        const specMatch = block.match(/(?:Technical Specification|Spec):\s*([\s\S]*?)(?=(?:\n[-*]\s+\*\*Acceptance Criteria|\n---|\n###|$))/i);
        if (specMatch) {
          spec = specMatch[1].trim();
        }

        // Parse acceptance criteria
        const acceptanceCriteria = [];
        const acMatches = block.match(/[-*]\s+\[[ x]\]\s+([^\n]+)/gi);
        if (acMatches) {
          for (const ac of acMatches) {
            acceptanceCriteria.push(ac.replace(/[-*]\s+\[[ x]\]\s+/i, '').trim());
          }
        }

        discoveredTasks.push({
          id: current.id,
          type,
          title: current.title,
          status,
          priority,
          components,
          ...(attachments.length > 0 ? { attachments } : {}),
          description: description || current.title,
          spec: spec || description || current.title,
          acceptanceCriteria
        });
      }

      // Also parse checklist items like: - [x] **[DEV-01]** ... or - [ ] **[FE-02]** ...
      const checklistItemRegex = /^[-*]\s+\[([ xX])\]\s+\*\*[`\[]?([A-Za-z0-9_\-]+)[`\]]?\*\*[:\s]+([^\n]+)/gm;
      let checkMatch;
      while ((checkMatch = checklistItemRegex.exec(content)) !== null) {
        const isChecked = checkMatch[1].toLowerCase() === 'x';
        const id = checkMatch[2].trim().toUpperCase();
        const text = checkMatch[3].trim();

        if (id.startsWith('MILESTONE-') || existingMilestoneIds.has(id) || existingTaskIds.has(id) || discoveredTasks.some(t => t.id.toUpperCase() === id)) {
          continue;
        }

        let type = 'feature';
        if (id.startsWith('BUG') || id.startsWith('FIX')) type = 'bug';
        else if (id.startsWith('QA') || id.startsWith('TEST')) type = 'qa';
        else if (id.startsWith('DEV') || id.startsWith('INFRA')) type = 'feature';
        else if (id.startsWith('MEM')) type = 'feature';

        discoveredTasks.push({
          id,
          type,
          title: text.split('—')[0].split(':')[0].trim(),
          status: isChecked ? 'done' : 'todo',
          priority: 'medium',
          components: [],
          description: text,
          spec: text,
          acceptanceCriteria: []
        });
      }

      // Parse Milestones: - [x] **MILESTONE-1**: ...
      const milestoneRegex = /^[-*]\s+\[([ xX])\]\s+\*\*(MILESTONE-[A-Za-z0-9_\-]+)\*\*[:\s]+([^\n]+)/gmi;
      let msMatch;
      while ((msMatch = milestoneRegex.exec(content)) !== null) {
        const isChecked = msMatch[1].toLowerCase() === 'x';
        const id = msMatch[2].trim();
        const title = msMatch[3].trim();

        if (!existingMilestoneIds.has(id.toUpperCase()) && !discoveredMilestones.some(m => m.id.toUpperCase() === id.toUpperCase())) {
          discoveredMilestones.push({
            id,
            title,
            status: isChecked ? 'done' : 'todo'
          });
        }
      }

    } catch {}
  }

  console.log(`  ✓ Scanned ${scannedFiles.length} board and checklist files:`);
  for (const f of scannedFiles) {
    console.log(`     └─ ${f}`);
  }

  // Merge discovered tasks into backlog data
  let addedCount = 0;
  for (const t of discoveredTasks) {
    if (!existingTaskIds.has(t.id.toUpperCase())) {
      existingData.tasks.push(t);
      existingTaskIds.add(t.id.toUpperCase());
      addedCount++;
    }
  }

  for (const m of discoveredMilestones) {
    if (!existingMilestoneIds.has(m.id.toUpperCase())) {
      existingData.milestones.push(m);
      existingMilestoneIds.add(m.id.toUpperCase());
    }
  }

  // If no tasks were discovered and no existing tasks, add a sensible starter task
  if (existingData.tasks.length === 0) {
    existingData.tasks.push({
      id: 'FEAT-101',
      type: 'feature',
      title: 'Initial Architecture Scaffolding',
      status: 'todo',
      priority: 'high',
      components: [],
      description: `Establish core domain scaffolding for ${resolvedProjectName}.`,
      spec: 'Implement base models, entrypoints, and test suites.',
      acceptanceCriteria: ['Entry points wired', 'Tests passing']
    });
    addedCount++;
  }

  // Ensure all in_progress / testing tasks have structured actionItems & waitingOn summary
  for (const t of existingData.tasks) {
    if (!Array.isArray(t.actionItems) || t.actionItems.length === 0) {
      const criteria = Array.isArray(t.acceptanceCriteria) ? t.acceptanceCriteria : [];
      const derived = criteria.map((c, idx) => {
        const text = String(c || '').trim();
        const lower = text.toLowerCase();
        const isUser =
          /apple developer portal|meta developer|facebook developer|entra portal|azure portal|google cloud console|stripe dashboard|configure .* in .*\.env|live .* app id|live .* secret|physical iphone|physical device|testflight build|manual|provide /i.test(lower) ||
          (/^qa-/i.test(t.id || '') && /physical|device|iphone|ipad|android|disappears|auto-advance|back navigation|skip for now/i.test(lower + ' ' + (t.title || '').toLowerCase()));
        return {
          id: `${t.id}-ACT-${idx + 1}`,
          text,
          owner: isUser ? 'user' : 'antigravity',
          done: t.status === 'done'
        };
      }).filter(i => i.text);

      const combined = `${t.description || ''} ${t.spec || ''}`;
      if ((t.status === 'in_progress' || t.status === 'testing') && /Services ID|Apple Developer Portal/i.test(combined) && !derived.some(d => /Apple Developer Portal|Services ID/i.test(d.text))) {
        derived.unshift({
          id: `${t.id}-ACT-PORTAL`,
          text: 'Register & verify Web Services ID and Return URL in Apple Developer Portal (or assign to Antigravity apple MCP)',
          owner: 'user',
          done: false
        });
      }
      if ((t.status === 'in_progress' || t.status === 'testing') && /Meta App ID|Facebook \/ Meta OAuth/i.test(combined) && !derived.some(d => /Meta App ID|META_APP_ID/i.test(d.text))) {
        derived.unshift({
          id: `${t.id}-ACT-META`,
          text: 'Configure live META_APP_ID & META_APP_SECRET in server/.env and verify Meta OAuth redirect URI',
          owner: 'user',
          done: false
        });
      }
      if (derived.length === 0 && (t.status === 'in_progress' || t.status === 'testing')) {
        derived.push({
          id: `${t.id}-ACT-1`,
          text: t.description || `Complete implementation and verification for ${t.title}`,
          owner: 'antigravity',
          done: false
        });
      }
      if (derived.length > 0) {
        t.actionItems = derived;
      }
    }
    if ((t.status === 'in_progress' || t.status === 'testing') && !t.waitingOn) {
      const combined = `${t.title || ''} ${t.description || ''} ${t.spec || ''} ${(t.acceptanceCriteria || []).join(' ')}`;
      if (/Services ID|Apple Developer Portal|gd\.removeback\.web/i.test(combined)) {
        t.waitingOn = 'Apple Developer Portal Services ID registration & live Web OAuth E2E verification';
      } else if (/Meta App ID|Facebook \/ Meta OAuth|META_APP_ID/i.test(combined)) {
        t.waitingOn = 'Live Meta App ID & Secret in server/.env + end-to-end Facebook OAuth verification';
      } else if (/Physical Device|TestFlight Build/i.test(combined)) {
        t.waitingOn = 'Physical iOS/Android device TestFlight validation & QA checklist sign-off';
      } else if (Array.isArray(t.actionItems) && t.actionItems.length > 0) {
        const firstPending = t.actionItems.find(a => !a.done);
        if (firstPending) t.waitingOn = firstPending.text;
      }
    }
  }

  existingData.lastUpdated = new Date().toISOString();

  // Save docs/backlog.json
  await fs.mkdir(path.dirname(backlogJsonPath), { recursive: true });
  await fs.writeFile(backlogJsonPath, JSON.stringify(existingData, null, 2) + '\n', 'utf8');
  console.log(`\n  ✅ Updated ${backlogJsonPath} with ${existingData.tasks.length} total tasks (${addedCount} newly adapted).`);

  // Ensure docs/BACKLOG.md or docs/MIGRATION_BOARD.md exists
  const boardPath = path.join(targetDir, 'docs/MIGRATION_BOARD.md');
  const fallbackBoardPath = path.join(targetDir, 'docs/BACKLOG.md');
  const targetBoard = (await fileExists(fallbackBoardPath))
    ? fallbackBoardPath
    : ((await fileExists(boardPath)) ? boardPath : fallbackBoardPath);

  // Render board markdown
  await renderBoardMarkdown(targetBoard, existingData);
  console.log(`  ✓ Synchronized board markdown in ${path.relative(targetDir, targetBoard)}`);

  return {
    scannedFiles,
    totalTasks: existingData.tasks.length,
    addedTasks: addedCount,
    milestonesCount: existingData.milestones.length
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function renderBoardMarkdown(boardPath, data) {
  const lines = [
    `# ${data.project ? data.project.toUpperCase() : 'PROJECT'} — Development Backlog & Board`,
    '',
    'This board tracks active development tickets, feature backlogs, architecture initiatives, and migration milestones. Synchronized with `docs/backlog.json`.',
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

  const qaAndBugTasks = data.tasks.filter(t => t.type === 'qa' || t.type === 'bug');
  if (qaAndBugTasks.length > 0) {
    lines.push('## 2. Bug Fixes & QA Tasks');
    lines.push('');
    for (const task of qaAndBugTasks) {
      const statusLabel = task.status === 'done' ? 'Completed (`DONE`)'
        : task.status === 'in_progress' ? 'In Progress (`IN_PROGRESS`)'
        : 'Backlog (`TODO`)';
      lines.push(`### ${task.id}: ${task.title}`);
      lines.push(`- **Status:** ${statusLabel}`);
      lines.push(`- **Type:** \`${task.type}\``);
      if (task.attachments && task.attachments.length > 0) {
        lines.push(`- **Attachments:** ${task.attachments.map(a => `\`${a}\``).join(', ')}`);
      }
      if (task.description) lines.push(`- **Details:** ${task.description}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  if (data.milestones && data.milestones.length > 0) {
    lines.push('## 3. Milestones');
    lines.push('');
    for (const m of data.milestones) {
      const checked = m.status === 'done' ? '[x]' : '[ ]';
      lines.push(`- ${checked} **${m.id}**: ${m.title}`);
    }
    lines.push('');
  }

  await fs.mkdir(path.dirname(boardPath), { recursive: true });
  await fs.writeFile(boardPath, lines.join('\n') + '\n', 'utf8');
}
