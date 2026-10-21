/**
 * Antigravity Memory Bank — Mandatory 10-Point Baseline Ingestion & Upgrade Checklist
 *
 * Enforces that every Memory Bank installation (`init`) and upgrade (`upgrade`) ingests,
 * populates, and verifies all 10 standard categories of project & environment context upfront:
 *
 *  [1/10] Repository Paths, Git Remote & Workspace Topology
 *  [2/10] Tech Stack, Runtime & Package Lifecycle Scripts
 *  [3/10] Infrastructure Invariants, Ports & Health Probes
 *  [4/10] API Keys, .env Contracts, Mobile/Cloud & Host Credentials
 *  [5/10] Active MCP Servers & Tool Schema Inventory
 *  [6/10] Antigravity Customizations (Rules, Skills, Workflows & Policies)
 *  [7/10] Historical Git Accomplishments, Docs & Distilled Brain Decisions
 *  [8/10] Decoupled Operational Backlog, Bug Records & Review Pane Kanban
 *  [9/10] On-the-Fly Auto-Sync Hooks (.agents/hooks.json + .git/hooks/post-commit)
 * [10/10] Memory Bank Completeness (<150 Lines/File & <24KB AGENTS.md Rule Cap)
 */

import fsSync from 'node:fs';
import path from 'node:path';
import { scrapeCustomizationsAndIntegrations } from './customizations-scraper.mjs';

const REQUIRED_MEMORY_FILES = [
  'projectbrief.md',
  'productContext.md',
  'systemPatterns.md',
  'infrastructureInvariants.md',
  'integrationsAndCustomizations.md',
  'activeContext.md',
  'progress.md'
];

/**
 * Compute approximate expanded byte size of AGENTS.md (expanding `@[label](relPath)` includes)
 */
function computeExpandedAgentsBytes(targetDir) {
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  if (!fsSync.existsSync(agentsPath)) return 0;
  try {
    const raw = fsSync.readFileSync(agentsPath, 'utf8');
    let totalBytes = Buffer.byteLength(raw, 'utf8');
    const includeRegex = /@\[[^\]]+\]\(([^)]+)\)/g;
    let m;
    const seen = new Set();
    while ((m = includeRegex.exec(raw)) !== null) {
      const rel = m[1].trim();
      if (seen.has(rel)) continue;
      seen.add(rel);
      const full = path.join(targetDir, rel);
      if (fsSync.existsSync(full) && fsSync.statSync(full).isFile()) {
        totalBytes += fsSync.statSync(full).size;
      }
    }
    return totalBytes;
  } catch {
    return 0;
  }
}

/**
 * Run and print the 10-Point Mandatory Baseline Ingestion Checklist
 */
export function runMandatoryIngestionChecklist(targetDir, detected = {}) {
  const resolvedRoot = path.resolve(targetDir);
  const scraped = scrapeCustomizationsAndIntegrations(resolvedRoot, detected.name);

  // 1. Repo Paths & Topology
  const hasRepoTopology = Boolean(scraped.workspaceRootTilde && scraped.topDirs.length > 0);
  const item1Detail = `${scraped.workspaceRootTilde} · branch \`${scraped.gitBranch}\` · ${scraped.topDirs.length} core dirs${scraped.siblingRepos.length ? ` · ${scraped.siblingRepos.length} sibling repos` : ''}`;

  // 2. Tech Stack & Lifecycle Scripts
  let pkgScriptsCount = 0;
  const pkgPath = path.join(resolvedRoot, 'package.json');
  if (fsSync.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fsSync.readFileSync(pkgPath, 'utf8'));
      const sc = pkg.scripts || {};
      for (const k of ['lint:memory', 'memory:sync', 'backlog', 'backlog:start', 'backlog:done', 'backlog:attach', 'backlog:unpack', 'backlog:render']) {
        if (sc[k]) pkgScriptsCount++;
      }
    } catch {}
  }
  const hasStack = Boolean(fsSync.existsSync(path.join(resolvedRoot, 'memory-bank/systemPatterns.md')));
  const item2Detail = `${detected.frontend || 'Frontend'} + ${detected.backend || 'Backend'} · ${pkgScriptsCount}/8 lifecycle & backlog npm scripts wired`;

  // 3. Infrastructure, Ports & Health Probes
  const hasInfraRule = fsSync.existsSync(path.join(resolvedRoot, '.agents/rules/infra.md'));
  const hasInfraMb =
    fsSync.existsSync(path.join(resolvedRoot, 'memory-bank/infrastructureInvariants.md')) ||
    fsSync.existsSync(path.join(resolvedRoot, 'memory-bank/infrastructure.md'));
  const item3Detail = `Port ${detected.port || '3000'} · Tier 2 \`.agents/rules/infra.md\` & infrastructure memory verified`;

  // 4. API Keys, .env Contracts & Credentials
  const hasIntegrationsMb = fsSync.existsSync(path.join(resolvedRoot, 'memory-bank/integrationsAndCustomizations.md'));
  const envFileTotal = scraped.liveEnvFiles.length + scraped.templateEnvFiles.length;
  const credTotal = scraped.platformCredentials.length + scraped.hostTokens.length;
  const item4Detail = `${envFileTotal} .env* file(s) (${scraped.allEnvKeys.length} keys indexed, secrets masked) · ${credTotal} platform/host credential source(s)`;

  // 5. Active MCP Servers & Tool Schemas
  const totalTools = scraped.mcpServers.reduce((acc, s) => acc + (s.toolCount || 0), 0);
  const item5Detail = `${scraped.mcpServers.length} MCP server(s) (${totalTools} tool schemas) indexed in \`integrationsAndCustomizations.md\``;

  // 6. Antigravity Customizations (Rules, Skills, Workflows & Policies)
  const agentsRaw = fsSync.existsSync(path.join(resolvedRoot, 'AGENTS.md'))
    ? fsSync.readFileSync(path.join(resolvedRoot, 'AGENTS.md'), 'utf8')
    : '';
  const backlogSkillRaw = fsSync.existsSync(path.join(resolvedRoot, '.agents/skills/backlog-start/SKILL.md'))
    ? fsSync.readFileSync(path.join(resolvedRoot, '.agents/skills/backlog-start/SKILL.md'), 'utf8')
    : '';
  const hasStrictE2ERule =
    agentsRaw.includes('Strict End-to-End Verification Before Closure') &&
    backlogSkillRaw.includes('Live End-to-End Verification Before Closure');
  const item6Detail = `Tier 1 \`~/.gemini/GEMINI.md\` · ${scraped.workspaceRules.length} workspace rule(s) · ${scraped.workspaceSkills.length} skill(s)${hasStrictE2ERule ? ' · Strict E2E closure guard active' : ''}`;

  // 7. Historical Git, Docs & Distilled Brain Context
  const hasActiveContext = fsSync.existsSync(path.join(resolvedRoot, 'memory-bank/activeContext.md'));
  const hasProgress = fsSync.existsSync(path.join(resolvedRoot, 'memory-bank/progress.md'));
  const item7Detail = `Distilled git commits, docs & session accomplishments synced in \`activeContext.md\` & \`progress.md\``;

  // 8. Operational Backlog, 3-Artifact Planning Mode & Review Pane Kanban
  let taskCount = 0;
  const backlogJsonPath = path.join(resolvedRoot, 'docs/backlog.json');
  if (fsSync.existsSync(backlogJsonPath)) {
    try {
      const bj = JSON.parse(fsSync.readFileSync(backlogJsonPath, 'utf8'));
      taskCount = Array.isArray(bj.tasks) ? bj.tasks.length : 0;
    } catch {}
  }
  const hasBacklogHtml = fsSync.existsSync(path.join(resolvedRoot, 'docs/backlog.html'));
  const hasPlanningArtifacts =
    fsSync.existsSync(path.join(resolvedRoot, 'docs/planning/task.md')) &&
    fsSync.existsSync(path.join(resolvedRoot, 'docs/planning/implementation_plan.md')) &&
    fsSync.existsSync(path.join(resolvedRoot, 'docs/planning/walkthrough.md'));
  const item8Detail = `\`docs/backlog.json\` (${taskCount} tasks) · \`docs/backlog.html\` · 3 Planning Mode artifacts (\`task.md\`, \`implementation_plan.md\`, \`walkthrough.md\`) synced`;

  // 9. On-the-Fly Auto-Sync Hooks (.agents/hooks.json + .git/hooks/post-commit)
  const hasWsHook = scraped.workspaceHooks.some(h => h.includes('antigravity-memory-bank'));
  const item9Detail = `\`.agents/hooks.json\` (SessionStart, PostToolUse, Stop)${scraped.hasGitPostCommit ? ' + `.git/hooks/post-commit`' : ''} active (0-manual-step sync)`;

  // 10. Memory Bank Completeness (<150 Lines/File & <24KB AGENTS.md Rule Cap)
  const mbDir = path.join(resolvedRoot, 'memory-bank');
  let mbFilesChecked = 0;
  let mbLineViolations = 0;
  let missingCoreFiles = 0;
  for (const reqFile of REQUIRED_MEMORY_FILES) {
    if (reqFile === 'infrastructureInvariants.md') {
      if (!fsSync.existsSync(path.join(mbDir, 'infrastructureInvariants.md')) && !fsSync.existsSync(path.join(mbDir, 'infrastructure.md'))) {
        missingCoreFiles++;
      }
    } else if (!fsSync.existsSync(path.join(mbDir, reqFile))) {
      missingCoreFiles++;
    }
  }
  if (fsSync.existsSync(mbDir)) {
    for (const f of fsSync.readdirSync(mbDir).filter(x => x.endsWith('.md'))) {
      mbFilesChecked++;
      const lines = fsSync.readFileSync(path.join(mbDir, f), 'utf8').split('\n').length;
      if (lines >= 150) mbLineViolations++;
    }
  }
  const expandedBytes = computeExpandedAgentsBytes(resolvedRoot);
  const under24Kb = expandedBytes > 0 && expandedBytes < 24000;
  const item10Passed = missingCoreFiles === 0 && mbLineViolations === 0 && under24Kb;
  const item10Detail = `${mbFilesChecked} memory files (<150 lines, ${mbLineViolations} violations) · Expanded \`AGENTS.md\` ${(expandedBytes / 1024).toFixed(1)}KB / 24.0KB cap`;

  const checklist = [
    { id: 1, title: 'Repository Paths & Workspace Topology', passed: hasRepoTopology, detail: item1Detail },
    { id: 2, title: 'Tech Stack & Lifecycle Scripts', passed: hasStack, detail: item2Detail },
    { id: 3, title: 'Infrastructure, Ports & Health Probes', passed: hasInfraRule && hasInfraMb, detail: item3Detail },
    { id: 4, title: 'API Keys, .env Contracts & Credentials', passed: hasIntegrationsMb, detail: item4Detail },
    { id: 5, title: 'Active MCP Servers & Tool Schemas', passed: hasIntegrationsMb, detail: item5Detail },
    { id: 6, title: 'Antigravity Customizations (Rules & Skills)', passed: hasIntegrationsMb && scraped.workspaceSkills.length >= 3 && hasStrictE2ERule, detail: item6Detail },
    { id: 7, title: 'Historical Git, Docs & Distilled Context', passed: hasActiveContext && hasProgress, detail: item7Detail },
    { id: 8, title: 'Operational Backlog & 3-Artifact Planning Mode', passed: fsSync.existsSync(backlogJsonPath) && hasBacklogHtml && hasPlanningArtifacts, detail: item8Detail },
    { id: 9, title: 'On-the-Fly Auto-Sync Lifecycle Hooks', passed: hasWsHook, detail: item9Detail },
    { id: 10, title: 'Memory Completeness & <24KB Rule Budget', passed: item10Passed, detail: item10Detail }
  ];

  const passedCount = checklist.filter(c => c.passed).length;
  console.log(`\n📋 Mandatory Baseline Ingestion & Verification Checklist (${passedCount}/${checklist.length} Passed):`);
  for (const item of checklist) {
    const icon = item.passed ? '✓' : '✗';
    const num = String(item.id).padStart(2, ' ');
    console.log(`  [${icon}] ${num}/10 ${item.title}: ${item.detail}`);
  }

  return {
    passedCount,
    totalCount: checklist.length,
    allPassed: passedCount === checklist.length,
    expandedBytes,
    checklist
  };
}
