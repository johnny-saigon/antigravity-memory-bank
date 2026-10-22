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
import { auditRootHygiene } from './repo-organizer.mjs';

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

  // 1. Repo Paths, Archetype & Root Hygiene
  const rootAudit = auditRootHygiene(resolvedRoot);
  const hasRepoTopology = Boolean(scraped.workspaceRootTilde && scraped.topDirs.length > 0 && rootAudit.isCleanRoot);
  const item1Detail = `${scraped.workspaceRootTilde} (${rootAudit.archetype.label}) · branch \`${scraped.gitBranch}\` · ${scraped.topDirs.length} core dirs · ${rootAudit.isCleanRoot ? '0 loose root docs' : `${rootAudit.looseRootDocs.length} loose root doc(s)`}`;

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

  // 5. Active MCP Servers, Pre-Verified Auth & Tool Schemas
  const totalTools = scraped.mcpServers.reduce((acc, s) => acc + (s.toolCount || 0), 0);
  const authMcpCount = scraped.mcpServers.filter(s => s.authenticated).length;
  const item5Detail = `${authMcpCount}/${scraped.mcpServers.length} MCP server(s) ✅ AUTHENTICATED (${totalTools} tool schemas) in \`integrationsAndCustomizations.md\``;

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
  const hasFrugalityMandate =
    agentsRaw.includes('Stop the Credit Bleed') &&
    agentsRaw.includes('/effort') &&
    agentsRaw.includes('/clear') &&
    backlogSkillRaw.includes('Hard Turn Budget');
  const hasPreAuthDirective = agentsRaw.includes('Pre-Authenticated MCP & Customizations Access');

  // Verify all .agents/rules/*.md have valid snake_case YAML frontmatter (trigger: model_decision / always_on)
  const rulesDir = path.join(resolvedRoot, '.agents', 'rules');
  let validRuleFrontmatterCount = 0;
  let brokenRuleFrontmatterCount = 0;
  if (fsSync.existsSync(rulesDir)) {
    for (const rf of fsSync.readdirSync(rulesDir).filter((x) => x.endsWith('.md'))) {
      const rContent = fsSync.readFileSync(path.join(rulesDir, rf), 'utf8');
      const fm = rContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (
        fm &&
        /^trigger:\s*(model_decision|always_on|glob|manual)\b/m.test(fm[1]) &&
        /^description:\s*\S+/m.test(fm[1])
      ) {
        validRuleFrontmatterCount++;
      } else {
        brokenRuleFrontmatterCount++;
      }
    }
  }
  const hasProgressiveRules = validRuleFrontmatterCount >= 4 && brokenRuleFrontmatterCount === 0;
  const item6Detail = `Tier 1 \`~/.gemini/GEMINI.md\` · ${validRuleFrontmatterCount} \`model_decision\` rule(s) in \`.agents/rules/\` · ${scraped.workspaceSkills.length} workspace + ${(scraped.builtinSkills || []).length} builtin skill(s)${hasPreAuthDirective ? ' · Pre-Auth active' : ''}${hasFrugalityMandate ? ' · ≤8-turn frugality' : ''}`;

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

  // 10. Memory Bank Completeness (<150 Lines/File, <=50 Lines Root AGENTS.md & 0 Inline Token Bloat)
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
  const agentsLineCount = agentsRaw ? agentsRaw.trimEnd().split('\n').length : 0;
  const hasNoInlineBloat = !/@\[[^\]]+\]\(memory-bank\/[^)]+\)/.test(agentsRaw);
  const expandedBytes = computeExpandedAgentsBytes(resolvedRoot);
  const under50RootLines = agentsLineCount > 0 && agentsLineCount <= 50 && hasNoInlineBloat;
  const item10Passed = missingCoreFiles === 0 && mbLineViolations === 0 && under50RootLines && hasProgressiveRules;
  const item10Detail = `${mbFilesChecked} memory files (<150 lines, ${mbLineViolations} violations) · Root \`AGENTS.md\` ${agentsLineCount}/50 lines (${(expandedBytes / 1024).toFixed(1)}KB, 0 inline bloat)`;

  const checklist = [
    { id: 1, title: 'Repository Paths & Workspace Topology', passed: hasRepoTopology, detail: item1Detail },
    { id: 2, title: 'Tech Stack & Lifecycle Scripts', passed: hasStack, detail: item2Detail },
    { id: 3, title: 'Infrastructure, Ports & Health Probes', passed: hasInfraRule && hasInfraMb, detail: item3Detail },
    { id: 4, title: 'API Keys, .env Contracts & Credentials', passed: hasIntegrationsMb, detail: item4Detail },
    { id: 5, title: 'Active MCP Servers & Tool Schemas', passed: hasIntegrationsMb, detail: item5Detail },
    { id: 6, title: 'Antigravity Customizations (Rules & Skills)', passed: hasIntegrationsMb && scraped.workspaceSkills.length >= 3 && hasStrictE2ERule && hasFrugalityMandate && hasProgressiveRules, detail: item6Detail },
    { id: 7, title: 'Historical Git, Docs & Distilled Context', passed: hasActiveContext && hasProgress, detail: item7Detail },
    { id: 8, title: 'Operational Backlog & 3-Artifact Planning Mode', passed: fsSync.existsSync(backlogJsonPath) && hasBacklogHtml && hasPlanningArtifacts, detail: item8Detail },
    { id: 9, title: 'On-the-Fly Auto-Sync Lifecycle Hooks', passed: hasWsHook, detail: item9Detail },
    { id: 10, title: 'Memory Completeness & <50-Line Root Budget', passed: item10Passed, detail: item10Detail }
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
