export interface ActionItem {
  id: string;
  childTicketId?: string;
  text: string;
  owner?: 'user' | 'antigravity';
  done: boolean;
}

export interface BacklogTask {
  id: string;
  parentId?: string;
  isActionChild?: boolean;
  actionIndex?: number;
  isResidualChild?: boolean;
  residualLetter?: string;
  type?: string;
  title: string;
  status: 'todo' | 'ready' | 'in_progress' | 'testing' | 'done';
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  spec?: string;
  components?: string[];
  attachments?: string[];
  actionItems?: ActionItem[];
  waitingOn?: string;
  liveActivity?: string;
  planningLocked?: boolean;
  branch?: string;
  plannedAt?: string;
  createdAt?: string;
  completedAt?: string;
  annotations?: {
    recommendedPlanModel?: string;
    recommendedCodeModel?: string;
    estimatedSavings?: string;
  };
}

export interface MemoryFileAudit {
  name: string;
  path: string;
  uri: string;
  lines: number;
  limit: number;
  tokens: number;
  ok: boolean;
}

export interface RuleAudit {
  name: string;
  path: string;
  uri: string;
  trigger: string;
  description: string;
  tokens: number;
  ok: boolean;
}

export interface LivingDocStatus {
  relPath: string;
  path: string;
  uri: string;
  exists: boolean;
}

export interface MemoryAudit {
  agents: {
    exists: boolean;
    path: string;
    uri: string;
    lines: number;
    limit: number;
    inlineExpansions: number;
    ok: boolean;
  };
  memoryFiles: MemoryFileAudit[];
  rules: RuleAudit[];
  livingDocs: LivingDocStatus[];
  livingDocsPresent: number;
  hasHooks: boolean;
  hasPostCommitHook: boolean;
  skillCount: number;
  violations: number;
}

export interface CreditTelemetry {
  zone: 'optimal' | 'caution' | 'bleed';
  zoneLabel: string;
  estHistoryTokens: number;
  archiveTokens: number;
  resetAt: string | null;
  conversationId: string | null;
  recommendation: string;
}

export interface WorkspaceSnapshot {
  repoRoot: string;
  project: string;
  gitContext: {
    branch: string;
    isWorktree: boolean;
    worktreeName: string;
    isGit: boolean;
  };
  branchScope: 'branch' | 'all';
  totalTasksAllBranches: number;
  activePlanTaskIds: string[];
  columnSorts: Record<string, string>;
  tasks: BacklogTask[];
  counts: {
    total: number;
    todo: number;
    ready: number;
    inProgress: number;
    done: number;
    planningLocked: number;
    project: string;
  };
  memoryAudit: MemoryAudit;
  creditTelemetry: CreditTelemetry | null;
  implementationPlan: {
    path: string;
    uri: string;
    exists: boolean;
    text: string;
  };
}

export interface FleetInstallation {
  project: string;
  role: 'main' | 'worktree';
  branch: string;
  path: string;
  isUpstreamMain: boolean;
  hasMemoryBank: boolean;
  hasHooks: boolean;
  hasBacklogScript: boolean;
  counts: {
    total: number;
    todo: number;
    ready: number;
    inProgress: number;
    done: number;
    planningLocked: number;
  };
}

export interface BrickInfo {
  name: string;
  version: string;
  title: string;
  architecture: string;
  theming: string;
  providers: string[];
  platforms: string[];
  installed: boolean;
  installedVersion: string | null;
  installedPlatforms: string[];
}

export interface ModelOption {
  name: string;
  modelId: string;
  effort: 'low' | 'medium' | 'high' | 'xhigh';
  pool: string;
  burn: string;
  why: string;
  recommended?: boolean;
  isOrchestrator?: boolean;
}
