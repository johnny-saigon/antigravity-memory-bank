import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { z } from 'zod';
import type { BacklogTask, BrickInfo, FleetInstallation, WorkspaceSnapshot } from './types.ts';
import {
  esc,
  getModelOptions,
  isPlanningLocked,
  RECORD_AUDIO_SVG,
  renderBricksDocsTab,
  renderCreditsTab,
  renderFleetTab,
  renderKanbanTab,
  renderMemoryTab
} from './tabs.ts';

type TabKey = 'kanban' | 'memory' | 'credits' | 'fleet' | 'bricks';

const app = new App({ name: 'Antigravity Memory Bank', version: '2.0.0' }, {});

const state: {
  mode: 'dashboard' | 'inline';
  inlineView: string;
  activeTab: TabKey;
  repoRoot: string;
  branchScope: 'branch' | 'all';
  search: string;
  snapshot: WorkspaceSnapshot | null;
  fleet: FleetInstallation[];
  trickleUpTickets: BacklogTask[];
  bricks: BrickInfo[];
  selectedIds: Set<string>;
  auditOutput: string;
  fleetOutput: string;
  brickOutput: string;
  toast: string;
  toastTimer: number | null;
  modal:
    | null
    | { kind: 'model'; mode: 'plan' | 'code'; ids: string[]; useNewThread: boolean }
    | { kind: 'inspect'; id: string }
    | { kind: 'delete'; id: string; cascade: boolean }
    | { kind: 'add'; recording: boolean; hostRecordingId: string | null; draftTitle: string; draftDesc: string };
  draggedId: string | null;
  busy: boolean;
} = {
  mode: 'dashboard',
  inlineView: 'sprint',
  activeTab: 'kanban',
  repoRoot: '',
  branchScope: 'branch',
  search: '',
  snapshot: null,
  fleet: [],
  trickleUpTickets: [],
  bricks: [],
  selectedIds: new Set(),
  auditOutput: '',
  fleetOutput: '',
  brickOutput: '',
  toast: '',
  toastTimer: null,
  modal: null,
  draggedId: null,
  busy: false
};

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

function showToast(msg: string) {
  state.toast = msg;
  render();
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    state.toast = '';
    render();
  }, 4500);
}

function getCapabilities() {
  const caps = app.getHostCapabilities() as Record<string, unknown> | undefined;
  return {
    canMessage: Boolean(caps && caps.message),
    canContext: Boolean(caps && caps.updateModelContext)
  };
}

async function callTool<T = Record<string, unknown>>(name: string, args: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const res = await app.callServerTool({ name, arguments: args });
    if (res.isError) {
      const errText = (res.content || [])
        .map((c) => ('text' in c && typeof c.text === 'string' ? c.text : ''))
        .join(' ')
        .trim();
      showToast(`⚠️ ${errText || `Tool ${name} failed`}`);
      return null;
    }
    return (res.structuredContent as T) || ({} as T);
  } catch (err) {
    showToast(`⚠️ ${String((err as Error)?.message || err)}`);
    return null;
  }
}

async function dispatchTurnMessage(prompt: string, useNewThread: boolean) {
  const { canMessage } = getCapabilities();
  if (!canMessage) {
    try {
      await navigator.clipboard.writeText(prompt);
      showToast(`📋 Copied "${prompt}" — open a conversation and press ⌘V + Enter.`);
    } catch {
      showToast(`📋 Command ready: ${prompt}`);
    }
    return false;
  }

  try {
    const payload: Record<string, unknown> = {
      role: 'user',
      content: [{ type: 'text', text: prompt }]
    };
    if (useNewThread) {
      payload._meta = { 'com.google.antigravity/message': { target: 'new' } };
    }
    const res = await app.sendMessage(payload as Parameters<App['sendMessage']>[0]);
    if (res?.isError) {
      showToast(`⚠️ Host declined message — command copied: ${prompt}`);
      return false;
    }
    showToast(useNewThread ? `🧵 Launched in fresh thread: ${prompt}` : `🚀 Executing in Prompt Window: ${prompt}`);
    return true;
  } catch (err) {
    showToast(`⚠️ sendMessage failed: ${String((err as Error)?.message || err)}`);
    return false;
  }
}

async function openWorkspaceFile(uri: string) {
  try {
    const res = await app.request(
      { method: 'com.google.antigravity/toggle-aux-pane', params: { tabType: 'fileView', uri } },
      z.object({ isError: z.boolean().optional() }).passthrough()
    );
    if (res?.isError) showToast(`ℹ️ File viewer unavailable on this surface: ${uri.replace('file://', '')}`);
  } catch {
    showToast(`📄 ${uri.replace('file://', '')}`);
  }
}

async function pinTicketContext(task: BacklogTask) {
  const { canContext } = getCapabilities();
  if (!canContext) {
    showToast('ℹ️ Context pills are available inside a conversation side pane.');
    return;
  }
  const text = [
    `Pinned Memory Bank Ticket [${task.id}] (${task.status.toUpperCase()} · ${(task.priority || 'medium').toUpperCase()})`,
    `Title: ${task.title}`,
    task.description ? `Description: ${task.description}` : '',
    task.components?.length ? `Target Files: ${task.components.join(', ')}` : '',
    task.actionItems?.length
      ? `Action Items:\n${task.actionItems.map((a) => `- [${a.done ? 'x' : ' '}] ${a.text}`).join('\n')}`
      : ''
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await app.updateModelContext({ content: [{ type: 'text', text }] });
    showToast(`📎 Pinned [${task.id}] as a Context Pill on your next prompt!`);
  } catch (err) {
    showToast(`⚠️ Failed to pin context: ${String((err as Error)?.message || err)}`);
  }
}

async function refreshSnapshot(repoRoot?: string) {
  const target = repoRoot || state.repoRoot || undefined;
  const snap = await callTool<WorkspaceSnapshot>('app_get_workspace_snapshot', {
    ...(target ? { repoRoot: target } : {}),
    branchScope: state.branchScope
  });
  if (snap && snap.repoRoot) {
    state.snapshot = snap;
    state.repoRoot = snap.repoRoot;
  }
  render();
}

async function refreshFleet() {
  const res = await callTool<{ installations: FleetInstallation[]; trickleUpTickets: BacklogTask[] }>('app_list_fleet', {});
  if (res) {
    state.fleet = res.installations || [];
    state.trickleUpTickets = res.trickleUpTickets || [];
    render();
  }
}

async function refreshBricks() {
  if (!state.repoRoot) return;
  const res = await callTool<{ bricks: BrickInfo[] }>('app_brick_manage', { repoRoot: state.repoRoot, action: 'list' });
  if (res?.bricks) {
    state.bricks = res.bricks;
    render();
  }
}

function renderInlineView(): string {
  const snap = state.snapshot;
  if (!snap) return '<div class="mb-boot"><div class="mb-spinner"></div><span>Loading status...</span></div>';
  const ct = snap.creditTelemetry;
  const { canMessage } = getCapabilities();
  return `
    <div style="padding:8px 2px;display:flex;flex-direction:column;gap:8px;">
      <div class="mb-between" style="padding-bottom:6px;border-bottom:1px solid var(--color-border-primary,#334155);">
        <div>
          <strong>🧠 ${esc(snap.project)}</strong>
          <span class="mb-badge mb-badge-blue" style="margin-left:6px;">🌿 ${esc(snap.gitContext.branch)}</span>
        </div>
        <div class="mb-row" style="gap:5px;">
          <span class="mb-badge mb-badge-amber">${snap.counts.todo} TO DO</span>
          <span class="mb-badge mb-badge-purple">${snap.counts.ready} READY</span>
          <span class="mb-badge mb-badge-blue">${snap.counts.inProgress} WIP</span>
          <span class="mb-badge mb-badge-green">${snap.counts.done} DONE</span>
        </div>
      </div>
      <div class="mb-between">
        <span class="mb-muted">${esc(ct?.zoneLabel || 'Telemetry active')} · Memory violations: <strong>${snap.memoryAudit.violations}</strong></span>
        <div class="mb-row" style="gap:5px;">
          ${canMessage ? `<button class="mb-btn mb-btn-sm" data-action="send-slash" data-cmd="/start">🧹 /start</button>` : ''}
          <button class="mb-btn mb-btn-primary mb-btn-sm" data-action="expand-dashboard">📋 Open Full Control Plane</button>
        </div>
      </div>
    </div>
  `;
}

function renderModal(): string {
  const modal = state.modal;
  const snap = state.snapshot;
  if (!modal || !snap) return '';

  if (modal.kind === 'model') {
    const tasks = modal.ids.map((id) => snap.tasks.find((t) => t.id === id)).filter(Boolean) as BacklogTask[];
    const options = getModelOptions(tasks, modal.mode);
    const isPlan = modal.mode === 'plan';
    return `<div class="mb-modal-backdrop" data-action="close-modal">
      <div class="mb-modal" data-stop="true">
        <div class="mb-between" style="margin-bottom:10px;">
          <div>
            <span class="mb-badge ${isPlan ? 'mb-badge-purple' : 'mb-badge-green'}">${isPlan ? '📐 PLAN TRANSITION (TO DO → READY)' : '💻 CODE TRANSITION (→ IN PROGRESS)'}</span>
            <h3 style="margin:6px 0 2px;font-size:15px;">${esc(tasks.map((t) => `[${t.id}]`).join(', '))}</h3>
            <div class="mb-muted">Executes directly in Antigravity via native <code>app.sendMessage()</code> — zero macOS Accessibility permissions needed.</div>
          </div>
          <button class="mb-btn mb-btn-sm" data-action="close-modal">✕</button>
        </div>

        <label class="mb-row" style="margin-bottom:10px;padding:7px 10px;border-radius:8px;border:1px solid var(--color-border-primary,#334155);cursor:pointer;">
          <input type="checkbox" id="newThreadCheckbox" ${modal.useNewThread ? 'checked' : ''} />
          <span><strong>🧵 Run in New Thread</strong> <span class="mb-muted">(starts a fresh zero-history background conversation via <code>target: "new"</code>)</span></span>
        </label>

        <div style="display:flex;flex-direction:column;gap:8px;">
          ${options
            .map(
              (opt) => `<div class="mb-between" style="padding:10px;border-radius:9px;border:1px solid ${opt.recommended ? '#6366f1' : 'var(--color-border-primary,#334155)'};background:var(--color-background-tertiary,#162032);">
                <div style="flex:1;">
                  <div class="mb-row" style="gap:6px;margin-bottom:3px;">
                    <strong>${esc(opt.name)}</strong>
                    ${opt.recommended ? '<span class="mb-badge mb-badge-amber">🏆 Recommended</span>' : ''}
                    ${opt.isOrchestrator ? '<span class="mb-badge mb-badge-purple">🎛️ Orchestrator</span>' : ''}
                    <span class="mb-badge">${esc(opt.burn)}</span>
                  </div>
                  <div class="mb-muted">${esc(opt.why)}</div>
                </div>
                <button class="mb-btn ${isPlan ? 'mb-btn-plan' : 'mb-btn-code'}"
                        data-action="confirm-model"
                        data-mode="${modal.mode}"
                        data-model-id="${esc(opt.modelId)}"
                        data-effort="${esc(opt.effort)}">
                  ${isPlan ? '📐 PLAN NOW' : '💻 CODE NOW'}
                </button>
              </div>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
  }

  if (modal.kind === 'inspect') {
    const task = snap.tasks.find((t) => t.id === modal.id);
    if (!task) return '';
    const canPlanOrCode = (task.status === 'todo' || task.status === 'ready') && !isPlanningLocked(task);
    const { canContext } = getCapabilities();
    return `<div class="mb-modal-backdrop" data-action="close-modal">
      <div class="mb-modal" data-stop="true">
        <div class="mb-between" style="margin-bottom:10px;">
          <div class="mb-row">
            <span class="mb-card-id" style="font-size:13px;">${esc(task.id)}</span>
            <span class="mb-badge">${esc(task.status.toUpperCase())}</span>
            <span class="mb-badge">${esc((task.priority || 'medium').toUpperCase())}</span>
          </div>
          <div class="mb-row">
            ${canContext ? `<button class="mb-btn mb-btn-sm" data-action="pin-context" data-id="${esc(task.id)}">📎 Pin to Prompt</button>` : ''}
            ${canPlanOrCode ? `<button class="mb-btn mb-btn-plan mb-btn-sm" data-action="open-model" data-mode="plan" data-id="${esc(task.id)}">📐 ${task.status === 'todo' ? 'PLAN NOW' : 'RE-PLAN'}</button>` : ''}
            ${canPlanOrCode ? `<button class="mb-btn mb-btn-code mb-btn-sm" data-action="open-model" data-mode="code" data-id="${esc(task.id)}">💻 CODE NOW</button>` : ''}
            ${task.status === 'in_progress' || task.status === 'done' ? `<button class="mb-btn mb-btn-sm" data-action="set-status" data-id="${esc(task.id)}" data-status="todo">↩️ Move to TO DO</button>` : ''}
            <button class="mb-btn mb-btn-danger mb-btn-sm" data-action="open-delete" data-id="${esc(task.id)}" title="Delete ticket permanently (0 turns)">🗑️ Delete</button>
            <button class="mb-btn mb-btn-sm" data-action="close-modal">✕</button>
          </div>
        </div>
        <h3 style="margin:0 0 6px;font-size:15px;">${esc(task.title)}</h3>
        <p class="mb-muted" style="margin:0 0 10px;font-size:12px;">${esc(task.description || task.spec || '')}</p>
        ${
          task.components && task.components.length > 0
            ? `<div style="margin-bottom:10px;"><strong style="font-size:11px;">Target Files:</strong> <div class="mb-row" style="margin-top:4px;gap:5px;">${task.components
                .map((c) => `<button class="mb-btn mb-btn-sm" data-action="open-file" data-uri="${esc(`file://${snap.repoRoot}/${c}`)}">📄 ${esc(c)}</button>`)
                .join('')}</div></div>`
            : ''
        }
        <div style="margin-bottom:10px;">
          <strong style="font-size:11px;">Action Items (${(task.actionItems || []).length})</strong>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:5px;">
            ${(task.actionItems || [])
              .map(
                (a, idx) => `<label class="mb-row" style="font-size:12px;cursor:pointer;">
                  <input type="checkbox" data-action="toggle-action-item" data-id="${esc(task.id)}" data-idx="${idx}" ${a.done ? 'checked' : ''} />
                  <span style="${a.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${esc(a.text)}</span>
                </label>`
              )
              .join('') || '<div class="mb-muted">No action items yet.</div>'}
          </div>
        </div>
        ${
          snap.implementationPlan.exists
            ? `<div>
                 <div class="mb-between">
                   <strong style="font-size:11px;">Implementation Plan</strong>
                   <button class="mb-link" data-action="open-file" data-uri="${esc(snap.implementationPlan.uri)}">Open in Side Pane ↗</button>
                 </div>
                 <pre class="mb-pre">${esc(snap.implementationPlan.text.slice(0, 2500))}</pre>
               </div>`
            : ''
        }
      </div>
    </div>`;
  }

  if (modal.kind === 'delete') {
    const task = snap.tasks.find((t) => t.id === modal.id);
    if (!task) return '';
    const children = snap.tasks.filter((c) => c.parentId?.toLowerCase() === task.id.toLowerCase());
    return `<div class="mb-modal-backdrop" data-action="close-modal">
      <div class="mb-modal" data-stop="true" style="max-width:440px;">
        <div class="mb-between" style="margin-bottom:10px;">
          <strong>🗑️ Delete Ticket Permanently?</strong>
          <button class="mb-btn mb-btn-sm" data-action="close-modal">✕</button>
        </div>
        <div style="padding:10px;border-radius:9px;border:1px solid var(--color-border-primary,#334155);background:var(--color-background-tertiary,#162032);margin-bottom:10px;">
          <div class="mb-row" style="gap:6px;margin-bottom:4px;">
            <span class="mb-card-id">${esc(task.id)}</span>
            <span class="mb-badge">${esc(task.status.toUpperCase())}</span>
          </div>
          <div style="font-size:12px;font-weight:600;">${esc(task.title)}</div>
        </div>
        ${
          children.length > 0
            ? `<label class="mb-row" style="margin-bottom:10px;font-size:12px;cursor:pointer;">
                 <input type="checkbox" data-action="toggle-delete-cascade" ${modal.cascade ? 'checked' : ''} />
                 <span>Also delete ${children.length} child ticket${children.length === 1 ? '' : 's'} (${esc(children.map((c) => c.id).join(', '))})</span>
               </label>`
            : ''
        }
        <p class="mb-muted" style="margin:0 0 12px;font-size:11px;">Removes this ticket from <code>docs/backlog.json</code> with <strong>0 AI turns executed</strong>.</p>
        <div class="mb-between">
          <button class="mb-btn mb-btn-sm" data-action="close-modal">Cancel</button>
          <button class="mb-btn mb-btn-danger mb-btn-sm" data-action="confirm-delete" data-id="${esc(task.id)}">🗑️ Delete Permanently</button>
        </div>
      </div>
    </div>`;
  }

  if (modal.kind === 'add') {
    return `<div class="mb-modal-backdrop" data-action="close-modal">
      <div class="mb-modal" data-stop="true" style="max-width:480px;">
        <div class="mb-between" style="margin-bottom:10px;">
          <strong>+ Capture Idea into TO DO (0 AI Tokens)</strong>
          <button class="mb-btn mb-btn-sm" data-action="close-modal">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="mb-row" style="flex-wrap:nowrap;">
            <input id="addIdeaTitle" class="mb-input" style="flex:1;" placeholder="Describe the feature or bug idea..." value="${esc(modal.draftTitle)}" />
            <button class="mb-btn ${modal.recording ? 'mb-btn-danger' : ''}" data-action="toggle-voice" title="Record Audio">
              ${RECORD_AUDIO_SVG} ${modal.recording ? 'Stop' : 'Voice'}
            </button>
          </div>
          <textarea id="addIdeaDesc" class="mb-input" rows="3" placeholder="Optional details or acceptance notes...">${esc(modal.draftDesc)}</textarea>
          <div class="mb-between">
            <span class="mb-muted">Strictly isolated — never disturbs active WIP or planning.</span>
            <button class="mb-btn mb-btn-primary" data-action="submit-add-idea">Save to TO DO</button>
          </div>
        </div>
      </div>
    </div>`;
  }
  return '';
}

function render() {
  const root = document.getElementById('app');
  if (!root) return;
  document.body.classList.toggle('inline-mode', state.mode === 'inline');

  if (state.mode === 'inline') {
    root.innerHTML = renderInlineView() + (state.toast ? `<div class="mb-toast">${esc(state.toast)}</div>` : '');
    return;
  }

  const snap = state.snapshot;
  const { canMessage, canContext } = getCapabilities();

  const header = `<div class="mb-header">
    <div class="mb-header-top">
      <div class="mb-brand">
        <span>🧠 Memory Bank</span>
        <select id="workspaceSwitcher" class="mb-select">
          ${(state.fleet.length > 0 ? state.fleet : snap ? [{ project: snap.project, role: snap.gitContext.isWorktree ? 'worktree' : 'main', branch: snap.gitContext.branch, path: snap.repoRoot }] : [])
            .map(
              (f) => `<option value="${esc(f.path)}" ${f.path === state.repoRoot ? 'selected' : ''}>${f.role === 'worktree' ? '🌿' : '🏛️'} ${esc(f.project)} [${esc(f.branch)}]</option>`
            )
            .join('')}
        </select>
      </div>
      <div class="mb-row">
        <button class="mb-btn mb-btn-sm" data-action="refresh-all" ${state.busy ? 'disabled' : ''}>🔄 Refresh</button>
      </div>
    </div>
    <div class="mb-tabs">
      <button class="mb-tab ${state.activeTab === 'kanban' ? 'active' : ''}" data-action="switch-tab" data-tab="kanban">📋 Kanban ${snap ? `(${snap.counts.todo + snap.counts.ready + snap.counts.inProgress})` : ''}</button>
      <button class="mb-tab ${state.activeTab === 'memory' ? 'active' : ''}" data-action="switch-tab" data-tab="memory">🧠 Memory &amp; Rules ${snap && snap.memoryAudit.violations > 0 ? '⚠️' : ''}</button>
      <button class="mb-tab ${state.activeTab === 'credits' ? 'active' : ''}" data-action="switch-tab" data-tab="credits">⚡ Credits &amp; Usage</button>
      <button class="mb-tab ${state.activeTab === 'fleet' ? 'active' : ''}" data-action="switch-tab" data-tab="fleet">🚀 Fleet (${state.fleet.length})</button>
      <button class="mb-tab ${state.activeTab === 'bricks' ? 'active' : ''}" data-action="switch-tab" data-tab="bricks">🧱 Bricks &amp; Docs</button>
    </div>
  </div>`;

  let body = '<div class="mb-boot"><div class="mb-spinner"></div><span>Loading workspace snapshot...</span></div>';
  if (snap) {
    if (state.activeTab === 'kanban') {
      body = renderKanbanTab(snap, { search: state.search, selectedIds: state.selectedIds, canMessage, canContext });
    } else if (state.activeTab === 'memory') {
      body = renderMemoryTab(snap, state.auditOutput);
    } else if (state.activeTab === 'credits') {
      body = renderCreditsTab(snap, canMessage);
    } else if (state.activeTab === 'fleet') {
      body = renderFleetTab(state.fleet, state.repoRoot, state.trickleUpTickets, state.fleetOutput);
    } else if (state.activeTab === 'bricks') {
      body = renderBricksDocsTab(snap, state.bricks, state.brickOutput);
    }
  }

  root.innerHTML = `${header}<div class="mb-main">${body}</div>${renderModal()}${state.toast ? `<div class="mb-toast">${esc(state.toast)}</div>` : ''}`;
}

async function handleVoiceToggle() {
  if (!state.modal || state.modal.kind !== 'add') return;
  const titleEl = document.getElementById('addIdeaTitle') as HTMLInputElement | null;
  const descEl = document.getElementById('addIdeaDesc') as HTMLTextAreaElement | null;
  if (titleEl) state.modal.draftTitle = titleEl.value;
  if (descEl) state.modal.draftDesc = descEl.value;

  if (state.modal.recording) {
    state.modal.recording = false;
    if (state.modal.hostRecordingId) {
      const recId = state.modal.hostRecordingId;
      state.modal.hostRecordingId = null;
      render();
      showToast('🎙️ Transcribing host microphone recording...');
      const res = await callTool<{ transcript?: string }>('app_voice_transcribe', { action: 'stop_host_mic', recordingId: recId });
      if (res?.transcript && state.modal && state.modal.kind === 'add') {
        state.modal.draftTitle = (state.modal.draftTitle ? state.modal.draftTitle + ' ' : '') + res.transcript;
        showToast('✅ Voice idea transcribed!');
      }
      render();
      return;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    render();
    return;
  }

  // Try MediaRecorder first; fallback to server-side host mic recording inside sandboxed iframe
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('MediaDevices unavailable');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) audioChunks.push(ev.data);
    };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      const blob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        showToast('🎙️ Transcribing voice idea...');
        const res = await callTool<{ transcript?: string }>('app_voice_transcribe', {
          action: 'transcribe',
          audioBase64: String(reader.result || ''),
          mimeType: blob.type || 'audio/webm'
        });
        if (res?.transcript && state.modal && state.modal.kind === 'add') {
          state.modal.draftTitle = (state.modal.draftTitle ? state.modal.draftTitle + ' ' : '') + res.transcript;
          showToast('✅ Voice idea transcribed!');
        }
        render();
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    state.modal.recording = true;
    showToast('🎙️ Recording... click Stop when finished.');
    render();
  } catch {
    const startRes = await callTool<{ recordingId?: string }>('app_voice_transcribe', { action: 'start_host_mic' });
    if (startRes?.recordingId && state.modal && state.modal.kind === 'add') {
      state.modal.recording = true;
      state.modal.hostRecordingId = startRes.recordingId;
      showToast('🎙️ Recording via host microphone... click Stop when finished.');
      render();
    }
  }
}

document.addEventListener('input', (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (target.id === 'kanbanSearchInput') {
    state.search = (target as HTMLInputElement).value;
    render();
    const el = document.getElementById('kanbanSearchInput') as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }
});

document.addEventListener('change', async (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (target.id === 'workspaceSwitcher') {
    const nextRoot = (target as HTMLSelectElement).value;
    state.selectedIds.clear();
    await refreshSnapshot(nextRoot);
    if (state.activeTab === 'bricks') await refreshBricks();
    return;
  }
  if (target.id === 'newThreadCheckbox' && state.modal?.kind === 'model') {
    state.modal.useNewThread = (target as HTMLInputElement).checked;
    return;
  }
  const action = target.getAttribute('data-action');
  if (action === 'toggle-select') {
    const id = target.getAttribute('data-id') || '';
    if (state.selectedIds.has(id)) state.selectedIds.delete(id);
    else state.selectedIds.add(id);
    render();
  } else if (action === 'toggle-action-item' && state.snapshot) {
    const id = target.getAttribute('data-id') || '';
    const idx = Number(target.getAttribute('data-idx') || -1);
    const task = state.snapshot.tasks.find((t) => t.id === id);
    if (task && Array.isArray(task.actionItems) && task.actionItems[idx]) {
      task.actionItems[idx].done = (target as HTMLInputElement).checked;
      const res = await callTool<{ snapshot?: WorkspaceSnapshot }>('app_save_action_items', {
        repoRoot: state.repoRoot,
        id,
        waitingOn: task.waitingOn || '',
        actionItems: task.actionItems
      });
      if (res?.snapshot) state.snapshot = res.snapshot;
      render();
    }
  }
});

document.addEventListener('click', async (e) => {
  const el = (e.target as HTMLElement | null)?.closest('[data-action]') as HTMLElement | null;
  if (!el) return;
  const action = el.getAttribute('data-action');
  if (!action) return;
  if (el.getAttribute('data-stop') === 'true') e.stopPropagation();

  if (action === 'close-modal') {
    if (e.target !== el && el.classList.contains('mb-modal-backdrop')) return;
    state.modal = null;
    render();
    return;
  }
  if (action === 'expand-dashboard') {
    state.mode = 'dashboard';
    await Promise.all([refreshSnapshot(), refreshFleet()]);
    return;
  }
  if (action === 'switch-tab') {
    state.activeTab = (el.getAttribute('data-tab') as TabKey) || 'kanban';
    render();
    if (state.activeTab === 'fleet') await refreshFleet();
    if (state.activeTab === 'bricks') await refreshBricks();
    return;
  }
  if (action === 'refresh-all') {
    state.busy = true;
    render();
    await Promise.all([refreshSnapshot(), refreshFleet()]);
    if (state.activeTab === 'bricks') await refreshBricks();
    state.busy = false;
    render();
    return;
  }
  if (action === 'toggle-branch-scope') {
    state.branchScope = state.branchScope === 'branch' ? 'all' : 'branch';
    await refreshSnapshot();
    return;
  }
  if (action === 'clear-selection') {
    state.selectedIds.clear();
    render();
    return;
  }
  if (action === 'batch-plan' || action === 'batch-code') {
    const ids = Array.from(state.selectedIds);
    if (ids.length === 0) return;
    const { canMessage } = getCapabilities();
    state.modal = { kind: 'model', mode: action === 'batch-plan' ? 'plan' : 'code', ids, useNewThread: !canMessage };
    render();
    return;
  }
  if (action === 'open-model') {
    const id = el.getAttribute('data-id') || '';
    const mode = (el.getAttribute('data-mode') as 'plan' | 'code') || 'plan';
    const task = state.snapshot?.tasks.find((t) => t.id === id);
    if (!task) return;
    if (isPlanningLocked(task)) {
      showToast(`🔒 [${id}] is locked in READY while planning.`);
      return;
    }
    if (task.status === 'done' || task.status === 'in_progress' || task.status === 'testing') {
      showToast(`↩️ Move [${id}] back to TO DO first before planning or coding.`);
      return;
    }
    const { canMessage } = getCapabilities();
    state.modal = { kind: 'model', mode, ids: [id], useNewThread: !canMessage };
    render();
    return;
  }
  if (action === 'confirm-model' && state.modal?.kind === 'model') {
    const mode = (el.getAttribute('data-mode') as 'plan' | 'code') || state.modal.mode;
    const modelId = el.getAttribute('data-model-id') || '';
    const effort = el.getAttribute('data-effort') || 'medium';
    const ids = [...state.modal.ids];
    const useNewThread = state.modal.useNewThread;
    state.modal = null;
    state.selectedIds.clear();
    render();

    const toolName = mode === 'plan' ? 'app_plan_tickets' : 'app_kickoff_tickets';
    const res = await callTool<{ prompt?: string; snapshot?: WorkspaceSnapshot }>(toolName, {
      repoRoot: state.repoRoot,
      ids,
      modelId,
      effort
    });
    if (res?.snapshot) state.snapshot = res.snapshot;
    render();
    if (res?.prompt) {
      await dispatchTurnMessage(res.prompt, useNewThread);
    }
    return;
  }
  if (action === 'unlock-plan') {
    const id = el.getAttribute('data-id') || '';
    const res = await callTool<{ snapshot?: WorkspaceSnapshot }>('app_unlock_plan', { repoRoot: state.repoRoot, id });
    if (res?.snapshot) {
      state.snapshot = res.snapshot;
      showToast(`🔓 Unlocked [${id}] back to TO DO (0 turns run).`);
      render();
    }
    return;
  }
  if (action === 'set-status') {
    const id = el.getAttribute('data-id') || '';
    const status = el.getAttribute('data-status') || 'todo';
    const res = await callTool<{ snapshot?: WorkspaceSnapshot }>('app_update_ticket_status', {
      repoRoot: state.repoRoot,
      id,
      status
    });
    if (res?.snapshot) {
      state.snapshot = res.snapshot;
      if (state.modal?.kind === 'inspect') state.modal = null;
      showToast(`✅ Moved [${id}] → ${status.toUpperCase()} (0 turns run).`);
      render();
    }
    return;
  }
  if (action === 'open-delete') {
    const id = el.getAttribute('data-id') || '';
    if (!id) return;
    state.modal = { kind: 'delete', id, cascade: true };
    render();
    return;
  }
  if (action === 'toggle-delete-cascade' && state.modal?.kind === 'delete') {
    state.modal.cascade = (el as HTMLInputElement).checked;
    return;
  }
  if (action === 'confirm-delete' && state.modal?.kind === 'delete') {
    const id = el.getAttribute('data-id') || state.modal.id;
    const cascade = state.modal.cascade;
    state.modal = null;
    render();
    const res = await callTool<{ deletedIds?: string[]; snapshot?: WorkspaceSnapshot }>('app_delete_ticket', {
      repoRoot: state.repoRoot,
      id,
      cascade
    });
    if (res?.snapshot) {
      state.snapshot = res.snapshot;
      for (const did of res.deletedIds || [id]) {
        state.selectedIds.delete(did);
      }
      showToast(`🗑️ Deleted [${(res.deletedIds || [id]).join(', ')}] (0 turns run).`);
      render();
    }
    return;
  }
  if (action === 'inspect') {
    const id = el.getAttribute('data-id') || '';
    const task = state.snapshot?.tasks.find((t) => t.id === id);
    if (!task || isPlanningLocked(task)) return;
    state.modal = { kind: 'inspect', id };
    render();
    return;
  }
  if (action === 'pin-context') {
    const id = el.getAttribute('data-id') || '';
    const task = state.snapshot?.tasks.find((t) => t.id === id);
    if (task) await pinTicketContext(task);
    return;
  }
  if (action === 'open-add-modal') {
    state.modal = { kind: 'add', recording: false, hostRecordingId: null, draftTitle: '', draftDesc: '' };
    render();
    return;
  }
  if (action === 'toggle-voice') {
    await handleVoiceToggle();
    return;
  }
  if (action === 'submit-add-idea') {
    const titleEl = document.getElementById('addIdeaTitle') as HTMLInputElement | null;
    const descEl = document.getElementById('addIdeaDesc') as HTMLTextAreaElement | null;
    const title = (titleEl?.value || '').trim();
    const description = (descEl?.value || '').trim();
    if (!title) {
      showToast('⚠️ Enter an idea title first.');
      return;
    }
    const res = await callTool<{ task?: BacklogTask; snapshot?: WorkspaceSnapshot }>('app_add_ticket_isolated', {
      repoRoot: state.repoRoot,
      title,
      ...(description ? { description } : {})
    });
    if (res?.snapshot) {
      state.snapshot = res.snapshot;
      state.modal = null;
      showToast(`✅ Captured [${res.task?.id || 'TICKET'}] in TO DO (0 tokens).`);
      render();
    }
    return;
  }
  if (action === 'open-file') {
    const uri = el.getAttribute('data-uri') || '';
    if (uri) await openWorkspaceFile(uri);
    return;
  }
  if (action === 'send-slash') {
    const cmd = el.getAttribute('data-cmd') || '/start';
    await dispatchTurnMessage(cmd, false);
    return;
  }
  if (action === 'memory-audit') {
    const audit = el.getAttribute('data-audit') || 'lint';
    showToast(`⏳ Running ${audit}...`);
    const res = await callTool<{ output?: string; snapshot?: WorkspaceSnapshot }>('app_run_memory_audit', {
      repoRoot: state.repoRoot,
      action: audit
    });
    if (res) {
      state.auditOutput = res.output || '';
      if (state.activeTab === 'bricks') state.brickOutput = res.output || '';
      if (res.snapshot) state.snapshot = res.snapshot;
      showToast(`✅ Completed ${audit}`);
      render();
    }
    return;
  }
  if (action === 'organize-repo') {
    const dryRun = el.getAttribute('data-dry') === 'true';
    showToast(dryRun ? '⏳ Previewing repository organization...' : '⏳ Applying organization...');
    const res = await callTool<{ output?: string; snapshot?: WorkspaceSnapshot }>('app_organize_repo', {
      repoRoot: state.repoRoot,
      dryRun
    });
    if (res) {
      state.auditOutput = res.output || '';
      if (res.snapshot) state.snapshot = res.snapshot;
      render();
    }
    return;
  }
  if (action === 'switch-repo') {
    const nextPath = el.getAttribute('data-path') || '';
    if (nextPath) {
      state.activeTab = 'kanban';
      state.selectedIds.clear();
      await refreshSnapshot(nextPath);
      showToast(`📋 Switched Kanban to ${state.snapshot?.project || nextPath}`);
    }
    return;
  }
  if (action === 'fleet-action') {
    const fleetCmd = el.getAttribute('data-fleet') || 'upgrade_all';
    const targetDir = el.getAttribute('data-path') || undefined;
    const ticketId = el.getAttribute('data-ticket') || undefined;
    showToast(`⏳ Running fleet ${fleetCmd}...`);
    const res = await callTool<{ output?: string; installations?: FleetInstallation[] }>('app_fleet_manage', {
      action: fleetCmd,
      ...(targetDir ? { targetDir } : {}),
      ...(ticketId ? { ticketId } : {})
    });
    if (res) {
      state.fleetOutput = res.output || '';
      if (res.installations) state.fleet = res.installations;
      showToast(`✅ Fleet ${fleetCmd} complete`);
      render();
    }
    return;
  }
  if (action === 'brick-action') {
    const brickCmd = el.getAttribute('data-brick-cmd') || 'doctor';
    const brickName = el.getAttribute('data-brick') || 'user-profile';
    const platRaw = el.getAttribute('data-platforms') || '';
    const platforms = platRaw ? platRaw.split(',').filter(Boolean) : undefined;
    showToast(`⏳ Running brick ${brickCmd}...`);
    const res = await callTool<{ output?: string; bricks?: BrickInfo[] }>('app_brick_manage', {
      repoRoot: state.repoRoot,
      action: brickCmd,
      brickName,
      ...(platforms ? { platforms } : {})
    });
    if (res) {
      state.brickOutput = res.output || '';
      if (res.bricks) state.bricks = res.bricks;
      showToast(`✅ Brick ${brickCmd} finished`);
      render();
    }
  }
});

// Drag & Drop (strict BUG-115 rules)
document.addEventListener('dragstart', (e) => {
  const card = (e.target as HTMLElement | null)?.closest('.mb-card') as HTMLElement | null;
  if (!card) return;
  const id = card.getAttribute('data-task-id') || '';
  const task = state.snapshot?.tasks.find((t) => t.id === id);
  if (!task || isPlanningLocked(task)) {
    e.preventDefault();
    return;
  }
  state.draggedId = id;
  e.dataTransfer?.setData('text/plain', id);
});

document.addEventListener('dragover', (e) => {
  const col = (e.target as HTMLElement | null)?.closest('[data-drop-col]') as HTMLElement | null;
  if (!col) return;
  e.preventDefault();
  document.querySelectorAll('.mb-col.drop-active').forEach((c) => c.classList.remove('drop-active'));
  col.classList.add('drop-active');
});

document.addEventListener('drop', async (e) => {
  const col = (e.target as HTMLElement | null)?.closest('[data-drop-col]') as HTMLElement | null;
  document.querySelectorAll('.mb-col.drop-active').forEach((c) => c.classList.remove('drop-active'));
  if (!col || !state.snapshot) return;
  e.preventDefault();
  const sourceId = state.draggedId || e.dataTransfer?.getData('text/plain') || '';
  state.draggedId = null;
  const targetCol = col.getAttribute('data-drop-col') as 'todo' | 'ready' | 'in_progress' | 'done';
  const task = state.snapshot.tasks.find((t) => t.id === sourceId);
  if (!task || isPlanningLocked(task)) return;

  const prev = task.status;
  if ((prev === 'in_progress' || prev === 'testing' || prev === 'done') && targetCol === 'ready') {
    showToast(`↩️ Move [${sourceId}] back to TO DO first to re-plan it.`);
    return;
  }
  if (prev === 'done' && targetCol === 'in_progress') {
    showToast(`↩️ Move [${sourceId}] back to TO DO first to re-code it.`);
    return;
  }
  if (prev === 'todo' && targetCol === 'ready') {
    const { canMessage } = getCapabilities();
    state.modal = { kind: 'model', mode: 'plan', ids: [sourceId], useNewThread: !canMessage };
    render();
    return;
  }
  if ((prev === 'todo' || prev === 'ready') && targetCol === 'in_progress') {
    const { canMessage } = getCapabilities();
    state.modal = { kind: 'model', mode: 'code', ids: [sourceId], useNewThread: !canMessage };
    render();
    return;
  }
  if (prev !== targetCol) {
    const res = await callTool<{ snapshot?: WorkspaceSnapshot }>('app_update_ticket_status', {
      repoRoot: state.repoRoot,
      id: sourceId,
      status: targetCol
    });
    if (res?.snapshot) {
      state.snapshot = res.snapshot;
      showToast(`✋ Moved [${sourceId}] → ${targetCol.toUpperCase()} (0 turns run).`);
      render();
    }
  }
});

function applyHostContext(ctx: ReturnType<App['getHostContext']>) {
  if (!ctx) return;
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
}

// Register handlers BEFORE connect() per SEP-1865 lifecycle rule
app.ontoolinput = () => {
  render();
};

app.ontoolresult = (result) => {
  const sc = (result?.structuredContent || {}) as Record<string, unknown>;
  if (sc.mode === 'inline') {
    state.mode = 'inline';
    state.inlineView = String(sc.view || 'sprint');
  } else {
    state.mode = 'dashboard';
    if (sc.activeTab) state.activeTab = sc.activeTab as TabKey;
  }
  if (typeof sc.repoRoot === 'string' && sc.repoRoot) {
    state.repoRoot = sc.repoRoot;
  }
  void Promise.all([refreshSnapshot(state.repoRoot || undefined), refreshFleet()]);
};

app.onhostcontextchanged = (ctx) => {
  applyHostContext(ctx);
};

async function boot() {
  try {
    await app.connect();
    applyHostContext(app.getHostContext());
    const caps = getCapabilities();
    // On Global sidebar surface (no active conversation), default to Fleet view if no explicit tab was sent
    if (!caps.canMessage && state.mode === 'dashboard' && !state.repoRoot) {
      state.activeTab = 'fleet';
    }
    await Promise.all([refreshSnapshot(), refreshFleet()]);
  } catch (err) {
    const root = document.getElementById('app');
    if (root) {
      root.innerHTML = `<div class="mb-boot">⚠️ Failed to connect MCP App host: ${esc(String((err as Error)?.message || err))}</div>`;
    }
  }
}

void boot();
