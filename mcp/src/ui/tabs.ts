import type { BacklogTask, BrickInfo, FleetInstallation, ModelOption, WorkspaceSnapshot } from './types.ts';

export function esc(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isPlanningLocked(t: BacklogTask): boolean {
  return Boolean(t.planningLocked || (t.status === 'ready' && t.liveActivity === 'planning'));
}

export function getModelOptions(tasks: BacklogTask[], mode: 'plan' | 'code'): ModelOption[] {
  const isBatch = tasks.length >= 2;
  const hasHigh = tasks.some((t) => t.priority === 'high' || (t.components?.length || 0) >= 3);
  if (mode === 'plan') {
    return [
      ...(isBatch
        ? [
            {
              name: 'Orchestrator (Carbon)',
              modelId: 'gemini-pro-orchestrator',
              effort: 'high' as const,
              pool: 'Google Orchestrator',
              burn: '4.5x–6.5x',
              why: 'Coordinates parallel planning across multiple independent tickets simultaneously.',
              recommended: true,
              isOrchestrator: true
            }
          ]
        : []),
      {
        name: 'Gemini 4 Argon (High)',
        modelId: 'gemini-4-argon-high',
        effort: 'high',
        pool: 'Google Quota Pool',
        burn: '5.0x–7.0x',
        why: 'Frontier Stage-A architect for zero-ambiguity implementation_plan.md blueprints.',
        recommended: !isBatch
      },
      {
        name: 'Gemini 4 Carbon (High)',
        modelId: 'gemini-4-carbon-high',
        effort: 'high',
        pool: 'Google Quota Pool',
        burn: '3.5x–4.5x',
        why: 'Strong systems planning with lower credit burn than Argon.'
      },
      {
        name: 'Claude Opus 5.5 (High)',
        modelId: 'claude-opus-5-5-high',
        effort: 'high',
        pool: 'External Quota Pool',
        burn: '6.0x–9.0x',
        why: '1-turn architectural review on separate External quota clock.'
      }
    ];
  }

  const eff = isBatch || hasHigh ? 'high' : 'medium';
  return [
    ...(isBatch
      ? [
          {
            name: 'Orchestrator (Neon)',
            modelId: 'gemini-pro-orchestrator-neon',
            effort: 'high' as const,
            pool: 'Google Orchestrator',
            burn: '3.0x–4.5x',
            why: 'Fans out parallel worker agents for simultaneous multi-ticket execution.',
            recommended: true,
            isOrchestrator: true
          }
        ]
      : []),
    {
      name: `Gemini 4 Neon (${eff === 'high' ? 'High' : 'Medium'})`,
      modelId: `gemini-4-neon-${eff}`,
      effort: eff,
      pool: 'Google Quota Pool',
      burn: '2.0x–3.0x',
      why: 'Best daily Quality-to-Credit ROI for executing approved implementation plans (~65% savings vs Argon).',
      recommended: !isBatch
    },
    {
      name: `Claude Sonnet 5.5 (${eff === 'high' ? 'High' : 'Medium'})`,
      modelId: `claude-sonnet-5-5-${eff}`,
      effort: eff,
      pool: 'External Quota Pool',
      burn: '2.5x–4.0x',
      why: 'Surgical TypeScript/UI edits on the separate External Quota clock.'
    },
    {
      name: 'Gemini 3.8 Flash (Low)',
      modelId: 'gemini-3.8-flash-low',
      effort: 'low',
      pool: 'Google Quota Pool',
      burn: '1.0x (Lowest)',
      why: 'Lowest burn for micro UI/copy/docs tweaks.'
    }
  ];
}

export const RECORD_AUDIO_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;

export function renderKanbanTab(
  snap: WorkspaceSnapshot,
  opts: { search: string; selectedIds: Set<string>; canMessage: boolean; canContext: boolean }
): string {
  const q = opts.search.trim().toLowerCase();
  const visible = snap.tasks.filter(
    (t) =>
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      String(t.description || '').toLowerCase().includes(q)
  );
  const cols: Array<{ key: 'todo' | 'ready' | 'in_progress' | 'done'; title: string; dot: string; items: BacklogTask[] }> = [
    { key: 'todo', title: 'To-Do / Backlog', dot: '#f59e0b', items: visible.filter((t) => t.status === 'todo') },
    { key: 'ready', title: 'Ready (Planned)', dot: '#a855f7', items: visible.filter((t) => t.status === 'ready') },
    { key: 'in_progress', title: 'In Progress / QA', dot: '#3b82f6', items: visible.filter((t) => t.status === 'in_progress' || t.status === 'testing') },
    { key: 'done', title: 'Completed (Done)', dot: '#10b981', items: visible.filter((t) => t.status === 'done') }
  ];

  const selArray = Array.from(opts.selectedIds).filter((id) => {
    const t = snap.tasks.find((x) => x.id === id);
    return t && (t.status === 'todo' || t.status === 'ready') && !isPlanningLocked(t);
  });

  const batchBar =
    selArray.length > 0
      ? `<div class="mb-batch-bar">
           <div class="mb-row">
             <span class="mb-badge mb-badge-purple">${selArray.length} SELECTED</span>
             <span class="mb-muted">${esc(selArray.join(', '))}</span>
           </div>
           <div class="mb-row">
             <button class="mb-btn mb-btn-plan mb-btn-sm" data-action="batch-plan">📐 Plan Selected (${selArray.length})</button>
             <button class="mb-btn mb-btn-code mb-btn-sm" data-action="batch-code">🎛️ Orchestrator Code (${selArray.length})</button>
             <button class="mb-btn mb-btn-sm" data-action="clear-selection">✕ Clear</button>
           </div>
         </div>`
      : '';

  const renderCard = (t: BacklogTask) => {
    const locked = isPlanningLocked(t);
    const isTodo = t.status === 'todo';
    const isReady = t.status === 'ready';
    const isInProg = t.status === 'in_progress' || t.status === 'testing';
    const isDone = t.status === 'done';
    const canSel = (isTodo || isReady) && !locked;
    const isSel = canSel && opts.selectedIds.has(t.id);
    const prioCls = t.priority === 'high' ? 'mb-badge-rose' : t.priority === 'medium' ? 'mb-badge-amber' : '';
    const children = !isDone ? snap.tasks.filter((c) => c.parentId?.toUpperCase() === t.id.toUpperCase()) : [];
    const openChildren = children.filter((c) => c.status !== 'done').length;

    return `<div class="mb-card ${locked ? 'locked' : ''} ${isSel ? 'selected' : ''} ${t.parentId ? 'child-card' : ''}"
                 data-task-id="${esc(t.id)}" data-col="${isDone ? 'done' : isInProg ? 'in_progress' : isReady ? 'ready' : 'todo'}"
                 draggable="${locked ? 'false' : 'true'}">
      <div class="mb-card-top">
        <div class="mb-row" style="gap:5px;">
          ${canSel ? `<input type="checkbox" data-action="toggle-select" data-id="${esc(t.id)}" ${isSel ? 'checked' : ''} />` : ''}
          <span class="mb-card-id">${esc(t.id)}</span>
          <span class="mb-badge ${prioCls}">${esc((t.priority || 'med').toUpperCase())}</span>
          ${children.length > 0 ? `<span class="mb-badge mb-badge-purple">🧩 ${children.length} (${openChildren} open)</span>` : ''}
          ${t.parentId ? `<span class="mb-badge mb-badge-cyan">↳ ${esc(t.parentId)}${t.isActionChild && t.actionIndex ? ` · ACT-${t.actionIndex}` : ''}</span>` : ''}
          ${locked ? `<span class="mb-badge">🔒 Planning... (Locked)</span>` : ''}
          ${isReady && !locked ? `<span class="mb-badge mb-badge-purple">${t.liveActivity === 'awaiting_approval' ? '⏳ Awaiting Proceed' : '📐 READY'}</span>` : ''}
          ${isInProg ? `<span class="mb-badge mb-badge-blue">⚡ Coding</span>` : ''}
        </div>
        ${
          !locked
            ? `<div class="mb-row" style="gap:3px;">
                 ${opts.canContext ? `<button class="mb-btn mb-btn-sm" title="Attach ticket spec to next prompt pill (app.updateModelContext)" data-action="pin-context" data-id="${esc(t.id)}">📎</button>` : ''}
                 <button class="mb-btn mb-btn-sm" title="Inspect details & plan" data-action="inspect" data-id="${esc(t.id)}">🔎</button>
                 ${!isDone ? `<button class="mb-btn mb-btn-sm" title="Mark DONE (0 turns)" data-action="set-status" data-id="${esc(t.id)}" data-status="done">✅</button>` : `<button class="mb-btn mb-btn-sm" title="Move back to TO DO (0 turns)" data-action="set-status" data-id="${esc(t.id)}" data-status="todo">↩️</button>`}
                 <button class="mb-btn mb-btn-sm" title="Delete ticket permanently (0 turns)" data-action="open-delete" data-id="${esc(t.id)}">🗑️</button>
               </div>`
            : `<div class="mb-row" style="gap:3px;">
                 <span class="mb-badge">🔒 Locked</span>
                 <button class="mb-btn mb-btn-sm" title="Delete ticket permanently (0 turns)" data-action="open-delete" data-id="${esc(t.id)}">🗑️</button>
               </div>`
        }
      </div>
      <div class="mb-card-title ${isDone ? 'done' : ''}" data-action="${locked ? '' : 'inspect'}" data-id="${esc(t.id)}">${esc(t.title)}</div>
      ${t.description && !isDone ? `<div class="mb-card-desc">${esc(t.description)}</div>` : ''}
      <div class="mb-card-actions">
        ${
          locked
            ? `<div class="mb-row" style="gap:5px;">
                 <button class="mb-btn mb-btn-sm" disabled>🔒 Planning Locked</button>
                 <button class="mb-btn mb-btn-sm" data-action="unlock-plan" data-id="${esc(t.id)}" title="Unlock back to TO DO (0 turns)">🔓 Unlock</button>
               </div>`
            : isTodo
              ? `<div class="mb-row" style="gap:5px;">
                   <button class="mb-btn mb-btn-plan mb-btn-sm" data-action="open-model" data-mode="plan" data-id="${esc(t.id)}">📐 Plan</button>
                   <button class="mb-btn mb-btn-code mb-btn-sm" data-action="open-model" data-mode="code" data-id="${esc(t.id)}">💻 Code</button>
                 </div>`
              : isReady
                ? `<div class="mb-row" style="gap:5px;">
                     <button class="mb-btn mb-btn-code mb-btn-sm" data-action="open-model" data-mode="code" data-id="${esc(t.id)}">💻 Code</button>
                     <button class="mb-btn mb-btn-plan mb-btn-sm" data-action="open-model" data-mode="plan" data-id="${esc(t.id)}">📐 Re-Plan</button>
                   </div>`
                : isInProg
                  ? `<div class="mb-row" style="gap:5px;">
                       <button class="mb-btn mb-btn-sm" data-action="inspect" data-id="${esc(t.id)}">⏳ Actions (${(t.actionItems || []).filter((a) => !a.done).length})</button>
                       <button class="mb-btn mb-btn-sm" data-action="set-status" data-id="${esc(t.id)}" data-status="todo" title="Return to TO DO to re-plan (0 turns)">↩️ To-Do</button>
                     </div>`
                  : `<span class="mb-muted" style="color:#6ee7b7;">✓ Completed</span>`
        }
      </div>
    </div>`;
  };

  return `
    <div class="mb-toolbar">
      <div class="mb-row">
        <input class="mb-input" style="min-width:190px;" id="kanbanSearchInput" placeholder="Filter tickets..." value="${esc(opts.search)}" />
        <button class="mb-btn mb-btn-sm ${snap.branchScope === 'branch' ? 'mb-btn-primary' : ''}" data-action="toggle-branch-scope">
          🌿 ${snap.branchScope === 'branch' ? `Branch: ${esc(snap.gitContext.branch)}` : `All Branches (${snap.totalTasksAllBranches})`}
        </button>
      </div>
      <div class="mb-row">
        <button class="mb-btn mb-btn-primary mb-btn-sm" data-action="open-add-modal">+ Add Idea (0 Tokens)</button>
        ${
          opts.canMessage
            ? `<span class="mb-badge mb-badge-green" title="Zero macOS Accessibility permissions required — PLAN & CODE execute directly via SEP-1865 app.sendMessage()">⚡ Native app.sendMessage() Ready</span>`
            : `<span class="mb-badge mb-badge-amber" title="Global sidebar surface has no active conversation; PLAN & CODE will launch in a New Thread or copy to clipboard">🌐 Global Surface (New Thread Mode)</span>`
        }
      </div>
    </div>
    ${batchBar}
    <div class="mb-kanban">
      ${cols
        .map(
          (col) => `<div class="mb-col" data-drop-col="${col.key}">
            <div class="mb-col-head">
              <div class="mb-row" style="gap:6px;">
                <span style="width:7px;height:7px;border-radius:50%;background:${col.dot};display:inline-block;"></span>
                <span>${col.title}</span>
              </div>
              <span class="mb-badge">${col.items.length}</span>
            </div>
            <div class="mb-col-cards">
              ${
                col.items.length > 0
                  ? col.items.map(renderCard).join('')
                  : `<div class="mb-muted" style="padding:14px 6px;text-align:center;">${col.key === 'todo' ? 'No queued ideas. Click "+ Add Idea" above.' : 'Empty column'}</div>`
              }
            </div>
          </div>`
        )
        .join('')}
    </div>
  `;
}

export function renderMemoryTab(snap: WorkspaceSnapshot, auditOutput: string): string {
  const m = snap.memoryAudit;
  const agentsPct = Math.min(100, Math.round((m.agents.lines / m.agents.limit) * 100));
  return `
    <div class="mb-panel">
      <div class="mb-between" style="margin-bottom:10px;">
        <div>
          <strong>Three-Tier Memory Bank &amp; Progressive Disclosure Health</strong>
          <div class="mb-muted">${esc(snap.repoRoot)} · ${m.skillCount} workspace skills · Hooks: ${m.hasHooks ? '✅ .agents/hooks.json' : '⚠️ Missing'} · Git hook: ${m.hasPostCommitHook ? '✅ post-commit' : '⚠️ Missing'}</div>
        </div>
        <div class="mb-row">
          <button class="mb-btn mb-btn-sm" data-action="memory-audit" data-audit="lint">🧪 Lint</button>
          <button class="mb-btn mb-btn-sm" data-action="memory-audit" data-audit="sync">🔄 Sync</button>
          <button class="mb-btn mb-btn-sm" data-action="organize-repo" data-dry="true">🗂️ Organize Dry-Run</button>
          <button class="mb-btn mb-btn-sm" data-action="memory-audit" data-audit="export">📦 Export</button>
        </div>
      </div>
      <div class="mb-grid-2">
        <div style="border:1px solid var(--color-border-primary,#334155);border-radius:8px;padding:10px;">
          <div class="mb-between" style="margin-bottom:6px;">
            <button class="mb-link" data-action="open-file" data-uri="${esc(m.agents.uri)}">AGENTS.md (Root Directive)</button>
            <span class="mb-badge ${m.agents.ok ? 'mb-badge-green' : 'mb-badge-rose'}">${m.agents.lines}/${m.agents.limit} lines · ${m.agents.inlineExpansions} @-bloat</span>
          </div>
          <div class="mb-bar-track"><div class="mb-bar-fill ${agentsPct > 100 ? 'danger' : agentsPct > 85 ? 'warn' : ''}" style="width:${agentsPct}%"></div></div>
        </div>
        <div style="border:1px solid var(--color-border-primary,#334155);border-radius:8px;padding:10px;">
          <div class="mb-between" style="margin-bottom:6px;">
            <strong>Audit Summary</strong>
            <span class="mb-badge ${m.violations === 0 ? 'mb-badge-green' : 'mb-badge-rose'}">${m.violations === 0 ? '✅ 0 Violations' : `⚠️ ${m.violations} Violation(s)`}</span>
          </div>
          <div class="mb-muted">Click any file below to open it directly in Antigravity's Side Pane (<code>toggle-aux-pane</code>).</div>
        </div>
      </div>
    </div>

    <div class="mb-grid-2">
      <div class="mb-panel">
        <strong style="display:block;margin-bottom:8px;">Tier 3 — memory-bank/*.md (&lt; 150 lines)</strong>
        ${m.memoryFiles
          .map((mf) => {
            const pct = Math.min(100, Math.round((mf.lines / mf.limit) * 100));
            return `<div style="margin-bottom:8px;">
              <div class="mb-between" style="margin-bottom:3px;">
                <button class="mb-link" data-action="open-file" data-uri="${esc(mf.uri)}">${esc(mf.name)}</button>
                <span class="mb-muted">${mf.lines}/${mf.limit} lines · ~${mf.tokens} tok</span>
              </div>
              <div class="mb-bar-track"><div class="mb-bar-fill ${!mf.ok ? 'danger' : pct > 80 ? 'warn' : ''}" style="width:${pct}%"></div></div>
            </div>`;
          })
          .join('') || '<div class="mb-muted">No memory-bank/*.md files found.</div>'}
      </div>

      <div class="mb-panel">
        <strong style="display:block;margin-bottom:8px;">Tier 2 — .agents/rules/*.md (Progressive Disclosure)</strong>
        <table class="mb-table">
          <thead><tr><th>Rule</th><th>Trigger</th><th>Status</th></tr></thead>
          <tbody>
            ${m.rules
              .map(
                (r) => `<tr>
                  <td><button class="mb-link" data-action="open-file" data-uri="${esc(r.uri)}">${esc(r.name)}</button></td>
                  <td><span class="mb-badge ${r.trigger === 'model_decision' ? 'mb-badge-blue' : r.trigger === 'always_on' ? 'mb-badge-purple' : 'mb-badge-rose'}">${esc(r.trigger)}</span></td>
                  <td>${r.ok ? '✅' : '❌'}</td>
                </tr>`
              )
              .join('') || '<tr><td colspan="3" class="mb-muted">No .agents/rules/*.md found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    ${auditOutput ? `<div class="mb-panel"><strong>Command Output</strong><pre class="mb-pre">${esc(auditOutput)}</pre></div>` : ''}
  `;
}

export function renderCreditsTab(snap: WorkspaceSnapshot, canMessage: boolean): string {
  const ct = snap.creditTelemetry;
  const pct = ct ? Math.min(100, Math.round((ct.estHistoryTokens / 75000) * 100)) : 0;
  const barCls = ct?.zone === 'bleed' ? 'danger' : ct?.zone === 'caution' ? 'warn' : '';
  return `
    <div class="mb-panel">
      <div class="mb-between" style="margin-bottom:8px;">
        <div>
          <strong>Live Context Window &amp; Credit-Bleed Telemetry</strong>
          <div class="mb-muted">${esc(ct?.zoneLabel || 'Telemetry unavailable')}</div>
        </div>
        <div class="mb-row">
          <button class="mb-btn mb-btn-sm" data-action="memory-audit" data-audit="clear">🧹 Checkpoint Watermark (--clear)</button>
          ${canMessage ? `<button class="mb-btn mb-btn-primary mb-btn-sm" data-action="send-slash" data-cmd="/start">🚀 Run /start Reset in Chat</button>` : ''}
        </div>
      </div>
      <div class="mb-bar-track" style="height:10px;margin-bottom:8px;">
        <div class="mb-bar-fill ${barCls}" style="width:${pct}%"></div>
      </div>
      <div class="mb-between">
        <span class="mb-muted">Active Post-Reset Delta: <strong>${(ct?.estHistoryTokens || 0).toLocaleString()}</strong> tokens (Archive: ${(ct?.archiveTokens || 0).toLocaleString()} tokens)</span>
        <span class="mb-muted">Last Watermark: ${esc(ct?.resetAt ? ct.resetAt.slice(0, 19).replace('T', ' ') : 'None yet')}</span>
      </div>
      <p style="margin:8px 0 0;font-size:12px;">${esc(ct?.recommendation || '')}</p>
    </div>

    <div class="mb-grid-3">
      <div class="mb-panel">
        <span class="mb-badge mb-badge-blue" style="margin-bottom:6px;">Pool 1 · Google Gemini</span>
        <div style="font-weight:700;margin-bottom:4px;">Two-Stage Split Routing</div>
        <div class="mb-muted">Stage A (<code>/backlog-plan</code>): <strong>Gemini 4 Argon / Carbon (High)</strong><br/>Stage B (<code>/backlog-start</code>): <strong>Gemini 4 Neon (Medium)</strong> (~65% savings)<br/>Micro edits: <strong>Gemini 3.8 Flash (Low)</strong></div>
      </div>
      <div class="mb-panel">
        <span class="mb-badge mb-badge-purple" style="margin-bottom:6px;">Pool 2 · External Partner</span>
        <div style="font-weight:700;margin-bottom:4px;">Separate Reset Clock</div>
        <div class="mb-muted"><strong>Claude Sonnet 5.5</strong>: Surgical UI/TS refactoring<br/><strong>Claude Opus 5.5</strong>: 1-turn architecture/P0 audits<br/><strong>GPT-OSS 120B</strong>: Low-burn scaffolding offload</div>
      </div>
      <div class="mb-panel">
        <span class="mb-badge mb-badge-green" style="margin-bottom:6px;">Google Orchestrators</span>
        <div style="font-weight:700;margin-bottom:4px;">Multi-Ticket Swarms Only</div>
        <div class="mb-muted"><strong>Orchestrator (Neon / Carbon)</strong>: Use via Kanban multi-select when 2+ independent tickets run in parallel. Avoid for 1-file edits.</div>
      </div>
    </div>
  `;
}

export function renderFleetTab(
  installations: FleetInstallation[],
  activeRepoRoot: string,
  trickleUpTickets: BacklogTask[],
  fleetOutput: string
): string {
  const mainCount = installations.filter((i) => i.role === 'main').length;
  const wtCount = installations.filter((i) => i.role === 'worktree').length;
  return `
    <div class="mb-panel">
      <div class="mb-between" style="margin-bottom:10px;">
        <div>
          <strong>Worktree-Aware Fleet Control Center (${installations.length} Total: ${mainCount} Main + ${wtCount} Worktrees)</strong>
          <div class="mb-muted">Switch any repository or linked git worktree into the Kanban Board, upgrade all installations, or review Trickle-Up fixes.</div>
        </div>
        <div class="mb-row">
          <button class="mb-btn mb-btn-primary mb-btn-sm" data-action="fleet-action" data-fleet="upgrade_all">⬆️ Upgrade All Fleet</button>
          <button class="mb-btn mb-btn-sm" data-action="fleet-action" data-fleet="trickle_up_scan">🔎 Scan Trickle-Up</button>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table class="mb-table">
          <thead>
            <tr><th>Role</th><th>Project</th><th>Branch</th><th>TO DO / READY / WIP / DONE</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${installations
              .map((inst) => {
                const isActive = inst.path === activeRepoRoot;
                return `<tr style="${isActive ? 'background:rgba(99,102,241,0.12);' : ''}">
                  <td><span class="mb-badge ${inst.role === 'worktree' ? 'mb-badge-cyan' : 'mb-badge-blue'}">${inst.role === 'worktree' ? '🌿 WT' : '🏛️ Main'}</span></td>
                  <td><strong>${esc(inst.project)}</strong>${isActive ? ' <span class="mb-badge mb-badge-green">Active</span>' : ''}</td>
                  <td><code>${esc(inst.branch)}</code></td>
                  <td>${inst.counts.todo} / ${inst.counts.ready}${inst.counts.planningLocked ? ` (🔒${inst.counts.planningLocked})` : ''} / ${inst.counts.inProgress} / ${inst.counts.done}</td>
                  <td>
                    <div class="mb-row" style="gap:4px;">
                      <button class="mb-btn mb-btn-sm" data-action="switch-repo" data-path="${esc(inst.path)}">📋 Open</button>
                      ${!inst.isUpstreamMain ? `<button class="mb-btn mb-btn-sm" data-action="fleet-action" data-fleet="upgrade_one" data-path="${esc(inst.path)}">⬆️ Upgrade</button>` : ''}
                    </div>
                  </td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${
      trickleUpTickets.length > 0
        ? `<div class="mb-panel">
             <strong style="display:block;margin-bottom:8px;">Pending Trickle-Up Reviews (${trickleUpTickets.length})</strong>
             ${trickleUpTickets
               .map(
                 (t) => `<div class="mb-between" style="padding:6px 0;border-bottom:1px solid var(--color-border-primary,#1e293b);">
                   <div><span class="mb-card-id">${esc(t.id)}</span> ${esc(t.title)}</div>
                   <button class="mb-btn mb-btn-code mb-btn-sm" data-action="fleet-action" data-fleet="trickle_up_accept" data-ticket="${esc(t.id)}">✅ Accept Fix</button>
                 </div>`
               )
               .join('')}
           </div>`
        : ''
    }
    ${fleetOutput ? `<div class="mb-panel"><strong>Fleet Command Output</strong><pre class="mb-pre">${esc(fleetOutput)}</pre></div>` : ''}
  `;
}

export function renderBricksDocsTab(snap: WorkspaceSnapshot, bricks: BrickInfo[], output: string): string {
  return `
    <div class="mb-grid-2">
      <div class="mb-panel">
        <div class="mb-between" style="margin-bottom:8px;">
          <strong>Hexagonal Bricks Catalog (<code>bricks/*</code>)</strong>
          <button class="mb-btn mb-btn-sm" data-action="brick-action" data-brick-cmd="doctor" data-brick="user-profile">🩺 Brick Doctor</button>
        </div>
        ${bricks
          .map(
            (b) => `<div style="border:1px solid var(--color-border-primary,#334155);border-radius:8px;padding:10px;margin-bottom:8px;">
              <div class="mb-between" style="margin-bottom:4px;">
                <strong>🧱 ${esc(b.name)}@${esc(b.version)}</strong>
                <span class="mb-badge ${b.installed ? 'mb-badge-green' : ''}">${b.installed ? `Installed (${b.installedPlatforms.join(', ') || 'all'})` : 'Available'}</span>
              </div>
              <div class="mb-muted" style="margin-bottom:8px;">${esc(b.title)} · Providers: ${esc(b.providers.join(', '))}</div>
              <div class="mb-row" style="gap:5px;">
                <button class="mb-btn mb-btn-primary mb-btn-sm" data-action="brick-action" data-brick-cmd="${b.installed ? 'upgrade' : 'install'}" data-brick="${esc(b.name)}" data-platforms="web">🌐 Web</button>
                <button class="mb-btn mb-btn-sm" data-action="brick-action" data-brick-cmd="${b.installed ? 'upgrade' : 'install'}" data-brick="${esc(b.name)}" data-platforms="web,ios,android">📱 Full (Web+iOS+Android)</button>
              </div>
            </div>`
          )
          .join('') || '<div class="mb-muted">No bricks discovered.</div>'}
      </div>

      <div class="mb-panel">
        <div class="mb-between" style="margin-bottom:8px;">
          <strong>Canonical Living Docs (${snap.memoryAudit.livingDocsPresent}/10)</strong>
          <button class="mb-btn mb-btn-sm" data-action="memory-audit" data-audit="docs_sync">🔄 Sync Docs</button>
        </div>
        ${snap.memoryAudit.livingDocs
          .map(
            (d) => `<div class="mb-between" style="padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.12);">
              ${d.exists ? `<button class="mb-link" data-action="open-file" data-uri="${esc(d.uri)}">${esc(d.relPath)}</button>` : `<span class="mb-muted">${esc(d.relPath)}</span>`}
              <span>${d.exists ? '✅' : '⬜'}</span>
            </div>`
          )
          .join('')}
      </div>
    </div>
    ${output ? `<div class="mb-panel"><strong>Output</strong><pre class="mb-pre">${esc(output)}</pre></div>` : ''}
  `;
}
