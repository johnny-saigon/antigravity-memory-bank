#!/usr/bin/env node

/**
 * Antigravity Memory Bank — On-the-Fly Context & Customizations Synchronizer
 *
 * Runs automatically with ZERO manual commands via:
 * 1. `.agents/hooks.json` lifecycle hooks (`SessionStart`, `PostToolUse`, `Stop`)
 * 2. `.git/hooks/post-commit` on every git commit
 * 3. `npm run memory:sync` or CI pipelines
 *
 * Automatically distills and synchronizes pertinent project & environment data (never raw conversations):
 * - `memory-bank/integrationsAndCustomizations.md`: Repo paths, git remote, workspace layout, `.env*` keys,
 *   `eas.json`/`.p8`/host credentials, active MCP servers & tool counts, rules, skills, workflows & hooks
 * - `memory-bank/activeContext.md`: Latest git commit, active backlog focus, and distilled session component updates
 * - `memory-bank/progress.md`: Completed `feat:` / `fix:` milestones
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Always resolve repo root from scripts/sync-memory-context.mjs so .agents/hooks.json cwd never breaks
const scriptRepoRoot = path.resolve(__dirname, '..');
const targetDir = fsSync.existsSync(path.join(scriptRepoRoot, 'memory-bank')) ? scriptRepoRoot : process.cwd();
const memoryBankDir = path.join(targetDir, 'memory-bank');

const args = process.argv.slice(2);
const hookIdx = args.indexOf('--hook');
const hookEvent = hookIdx !== -1 && args[hookIdx + 1] ? args[hookIdx + 1] : null;
const isQuiet = Boolean(hookEvent) || args.includes('--quiet') || args.includes('-q');
const autoCommit = args.includes('--commit');

const SENSITIVE_KEY_REGEX = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCESS_KEY|WEBHOOK_SECRET|CREDENTIAL|AUTH_KEY|CLIENT_SECRET|DSN)/i;

function log(...messages) {
  if (!isQuiet) console.log(...messages);
}

function readHookStdinSync() {
  if (!hookEvent) return null;
  try {
    if (process.stdin.isTTY) return null;
    const raw = fsSync.readFileSync(0, 'utf8').trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeFileIfChangedSync(filePath, newContent) {
  try {
    if (fsSync.existsSync(filePath)) {
      const existing = fsSync.readFileSync(filePath, 'utf8');
      if (existing === newContent) return false;
    }
    fsSync.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch {
    return false;
  }
}

function toTildePath(p) {
  if (!p) return '';
  const home = os.homedir();
  const str = String(p);
  if (home && str.startsWith(home)) return '~' + str.slice(home.length);
  return str;
}

function summarizeEnvValue(key, rawVal) {
  const val = String(rawVal || '').trim().replace(/^['"]|['"]$/g, '');
  if (!val) return 'empty';
  if (val.includes('your_') || val.includes('replace_') || val.includes('example') || val.includes('xxx') || val === 'changeme') {
    return 'template placeholder';
  }
  if (val.startsWith('/') || val.startsWith('~/') || val.startsWith('./')) {
    return `path: \`${toTildePath(val)}\``;
  }
  if (/^[a-z0-9+.-]+:\/\/[^/]*:[^/]*@/i.test(val)) {
    try {
      const u = new URL(val);
      return `\`${u.protocol}//${u.username}:***@${u.host}${u.pathname}\``;
    } catch {
      return '`configured URI`';
    }
  }
  if (SENSITIVE_KEY_REGEX.test(key)) {
    const prefixMatch = val.match(/^(sk_live_|sk_test_|pk_live_|pk_test_|whsec_|re_|ghp_|gho_|AQ\.|AIza|GK[0-9a-z]{2})[A-Za-z0-9_-]*/);
    if (prefixMatch) return `\`${prefixMatch[1]}***\` (configured)`;
    return 'configured (secret)';
  }
  if (val.length > 65) return `\`${val.slice(0, 42)}...\``;
  return `\`${val}\``;
}

function parseEnvFile(content) {
  const entries = [];
  for (const rawLine of String(content || '').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim().replace(/^export\s+/, '');
    const value = line.slice(eqIdx + 1).trim();
    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    entries.push({ key, value, summary: summarizeEnvValue(key, value) });
  }
  return entries;
}

function findWorkspaceFiles(rootDir, predicate, maxDepth = 3, currentDepth = 0, relPrefix = '') {
  const results = [];
  if (currentDepth > maxDepth || !fsSync.existsSync(rootDir)) return results;
  try {
    const entries = fsSync.readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', '.git', 'dist', 'build', '.next', '.expo', 'memory-backups', '__pycache__', '.venv', 'venv'].includes(entry.name)) {
        continue;
      }
      const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(rootDir, entry.name);
      if (entry.isFile() && predicate(entry.name, relPath, fullPath)) {
        results.push({ name: entry.name, relPath, fullPath });
      } else if (entry.isDirectory()) {
        results.push(...findWorkspaceFiles(fullPath, predicate, maxDepth, currentDepth + 1, relPath));
      }
    }
  } catch {}
  return results;
}

function extractMarkdownSummary(filePath) {
  try {
    const content = fsSync.readFileSync(filePath, 'utf8');
    const descMatch = content.match(/^description:\s*>?-?\s*\n?\s*([^\n]+)/m);
    if (descMatch && descMatch[1].trim()) return descMatch[1].trim().replace(/^['"]|['"]$/g, '').slice(0, 110);
    const h1Match = content.match(/^#\s+([^\n]+)/m);
    if (h1Match && h1Match[1].trim()) return h1Match[1].trim().slice(0, 110);
  } catch {}
  return 'Custom workspace configuration';
}

function syncIntegrationsAndCustomizations(rootDir) {
  const resolvedRoot = path.resolve(rootDir);
  const homeDir = os.homedir();
  const geminiRoot = process.env.GEMINI_CONFIG_DIR || path.join(homeDir, '.gemini');
  let displayProject = path.basename(resolvedRoot);
  try {
    const agentsMd = fsSync.readFileSync(path.join(resolvedRoot, 'AGENTS.md'), 'utf8');
    const m = agentsMd.match(/^#\s+Antigravity Agent Directives\s+[—-]\s+([^\n]+)/m);
    if (m) displayProject = m[1].trim();
  } catch {}

  const workspaceRootTilde = toTildePath(resolvedRoot);
  let gitRemote = 'local-only';
  let gitBranch = 'main';
  try {
    gitRemote = execSync('git config --get remote.origin.url', { cwd: resolvedRoot, stdio: 'pipe' }).toString().trim() || 'local-only';
  } catch {}
  try {
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: resolvedRoot, stdio: 'pipe' }).toString().trim() || 'main';
  } catch {}

  const topDirs = [];
  for (const d of ['apps/mobile', 'apps/web', 'apps', 'server', 'src', 'lib', 'bin', 'scripts', 'docs', 'templates', 'memory-bank', '.agents']) {
    if (fsSync.existsSync(path.join(resolvedRoot, d))) {
      if (d === 'apps' && (topDirs.includes('`apps/mobile/`') || topDirs.includes('`apps/web/`'))) continue;
      topDirs.push(`\`${d}/\``);
    }
  }

  const siblingRepos = [];
  const parentDir = path.dirname(resolvedRoot);
  try {
    for (const s of fsSync.readdirSync(parentDir, { withFileTypes: true })) {
      if (!s.isDirectory() || s.name.startsWith('.') || s.name === path.basename(resolvedRoot)) continue;
      const sibPath = path.join(parentDir, s.name);
      if (fsSync.existsSync(path.join(sibPath, 'memory-bank')) || fsSync.existsSync(path.join(sibPath, '.git'))) {
        siblingRepos.push(`\`${toTildePath(sibPath)}\``);
      }
    }
  } catch {}

  const envFiles = findWorkspaceFiles(resolvedRoot, (name) => name === '.env' || name.startsWith('.env.'), 3);
  const liveEnvFiles = [];
  const templateEnvFiles = [];
  const allEnvKeysMap = new Map();

  for (const ef of envFiles) {
    const isTemplate = ef.name.includes('example') || ef.name.includes('sample') || ef.name.includes('template');
    const parsed = parseEnvFile(fsSync.readFileSync(ef.fullPath, 'utf8'));
    if (isTemplate) templateEnvFiles.push({ relPath: ef.relPath, count: parsed.length });
    else liveEnvFiles.push({ relPath: ef.relPath, count: parsed.length });

    for (const item of parsed) {
      if (!allEnvKeysMap.has(item.key)) {
        allEnvKeysMap.set(item.key, { key: item.key, sources: [], liveSummary: null, templateSummary: null });
      }
      const rec = allEnvKeysMap.get(item.key);
      if (!rec.sources.includes(ef.relPath)) rec.sources.push(ef.relPath);
      if (!isTemplate && item.value) rec.liveSummary = item.summary;
      else if (isTemplate && !rec.templateSummary) rec.templateSummary = item.summary;
    }
  }

  const easFiles = findWorkspaceFiles(resolvedRoot, (name) => name === 'eas.json' || name === 'wrangler.toml', 3);
  const platformCredentials = [];
  for (const ef of easFiles) {
    if (ef.name === 'eas.json') {
      try {
        const eas = JSON.parse(fsSync.readFileSync(ef.fullPath, 'utf8'));
        const buildEnvs = new Map();
        for (const [, prof] of Object.entries(eas.build || {})) {
          if (prof && prof.env) {
            for (const [k, v] of Object.entries(prof.env)) buildEnvs.set(k, summarizeEnvValue(k, v));
          }
        }
        if (buildEnvs.size > 0) {
          platformCredentials.push(`- **EAS Build Env (\`${ef.relPath}\`)**: ${Array.from(buildEnvs.entries()).map(([k, v]) => `\`${k}\`=${v}`).join(', ')}`);
        }
        const iosSub = eas.submit?.production?.ios || eas.submit?.testflight?.ios;
        if (iosSub) {
          const parts = [];
          if (iosSub.ascAppId) parts.push(`App ID \`${iosSub.ascAppId}\``);
          if (iosSub.ascApiKeyId) parts.push(`Key ID \`${iosSub.ascApiKeyId}\``);
          if (iosSub.ascApiKeyIssuerId) parts.push(`Issuer \`${iosSub.ascApiKeyIssuerId}\``);
          if (iosSub.ascApiKeyPath) parts.push(`Key \`${iosSub.ascApiKeyPath}\``);
          if (parts.length > 0) platformCredentials.push(`- **App Store Connect (\`${ef.relPath}\`)**: ${parts.join(' · ')}`);
        }
        const androidSub = eas.submit?.production?.android || eas.submit?.['internal-track']?.android;
        if (androidSub && androidSub.serviceAccountKeyPath) {
          platformCredentials.push(`- **Google Play Submit (\`${ef.relPath}\`)**: Service Account \`${androidSub.serviceAccountKeyPath}\` (track: \`${androidSub.track || 'internal'}\`)`);
        }
      } catch {}
    } else if (ef.name === 'wrangler.toml') {
      platformCredentials.push(`- **Cloudflare Wrangler Config**: \`${ef.relPath}\``);
    }
  }

  const workspaceCredFiles = findWorkspaceFiles(
    resolvedRoot,
    (name, relPath) => name.endsWith('.p8') || (relPath.includes('credentials/') && (name.endsWith('.json') || name.endsWith('.pem') || name.endsWith('.key'))),
    4
  );
  for (const cf of workspaceCredFiles) {
    platformCredentials.push(`- **Local Credential Key**: \`${cf.relPath}\``);
  }

  const hostTokenCandidates = [
    { path: path.join(homeDir, '.github_token'), label: 'GitHub PAT' },
    { path: path.join(homeDir, '.stripe_token'), label: 'Stripe API Token' },
    { path: path.join(homeDir, '.stitch_token'), label: 'Google Stitch Token' },
    { path: path.join(homeDir, '.ovh_credentials.json'), label: 'OVHcloud API' },
    { path: path.join(homeDir, '.meta_credentials.json'), label: 'Meta Graph API' }
  ];
  const hostTokens = hostTokenCandidates.filter(ht => fsSync.existsSync(ht.path)).map(ht => `\`${toTildePath(ht.path)}\` (${ht.label})`);

  const mcpServers = [];
  const mcpConfigCandidates = [
    { path: path.join(resolvedRoot, '.mcp.json'), scope: 'Workspace' },
    { path: path.join(resolvedRoot, 'mcp_config.json'), scope: 'Workspace' },
    { path: path.join(geminiRoot, 'config', 'mcp_config.json'), scope: 'Global' }
  ];
  const seenMcpNames = new Set();
  for (const cand of mcpConfigCandidates) {
    if (!fsSync.existsSync(cand.path)) continue;
    try {
      const raw = JSON.parse(fsSync.readFileSync(cand.path, 'utf8'));
      const serversObj = raw.mcpServers || raw.servers || {};
      for (const [serverName, spec] of Object.entries(serversObj)) {
        if (seenMcpNames.has(serverName)) continue;
        seenMcpNames.add(serverName);

        let toolCount = 0;
        const schemaDir = path.join(geminiRoot, 'antigravity', 'mcp', serverName);
        if (fsSync.existsSync(schemaDir)) {
          try {
            toolCount = fsSync.readdirSync(schemaDir).filter(f => f.endsWith('.json')).length;
          } catch {}
        }

        const cmd = spec.command ? toTildePath(spec.command) : (spec.url || spec.serverUrl || 'stdio');
        const cArgs = Array.isArray(spec.args) ? spec.args : [];
        let bridgeSummary = `\`${toTildePath(cmd)}\``;
        if (cmd === 'npx') {
          const pkgArg = cArgs.find(a => !a.startsWith('-') && a !== 'run' && !a.startsWith('http') && !a.startsWith('X-Goog'));
          const urlArg = cArgs.find(a => a.startsWith('http'));
          if (pkgArg && urlArg) bridgeSummary = `\`npx ${pkgArg}\` (\`${urlArg}\`)`;
          else if (pkgArg) {
            const runIdx = cArgs.indexOf('run');
            const acctId = (runIdx !== -1 && cArgs[runIdx + 1]) ? ` (acct \`${cArgs[runIdx + 1].slice(0, 10)}...\`)` : '';
            bridgeSummary = `\`npx ${pkgArg}\`${acctId}`;
          }
        } else if (cmd === '/bin/bash' || cmd === 'bash' || cmd === 'sh') {
          const mcpPkg = cArgs.join(' ').match(/@modelcontextprotocol\/[a-z0-9-]+/i);
          bridgeSummary = mcpPkg ? `\`${mcpPkg[0]}\`` : '`bash bridge`';
        }

        const authParts = [];
        if (spec.env && typeof spec.env === 'object') {
          for (const [ek, ev] of Object.entries(spec.env)) {
            const evStr = String(ev || '');
            if (evStr.startsWith('/') || evStr.startsWith('~/')) {
              let displayEvPath = toTildePath(evStr);
              if (evStr.startsWith(resolvedRoot + '/')) displayEvPath = evStr.slice(resolvedRoot.length + 1);
              else if (displayEvPath.startsWith('~/Documents/')) displayEvPath = `credentials/${path.basename(evStr)}`;
              authParts.push(`\`${ek}\` -> \`${displayEvPath}\``);
            } else if (SENSITIVE_KEY_REGEX.test(ek)) {
              authParts.push(`\`${ek}\` (${summarizeEnvValue(ek, evStr)})`);
            } else {
              authParts.push(`\`${ek}\`=\`${evStr}\``);
            }
          }
        }
        for (const a of cArgs) {
          if (String(a).toLowerCase().includes('api-key') || String(a).toLowerCase().includes('authorization')) {
            authParts.push(`Header \`${String(a).split(':')[0].trim()}\` (configured)`);
          }
        }
        mcpServers.push({ name: serverName, bridgeSummary, toolCount, authSummary: authParts.length > 0 ? authParts.join(', ') : 'Default / CLI auth' });
      }
    } catch {}
  }

  const workspaceRules = [];
  const rulesDir = path.join(resolvedRoot, '.agents', 'rules');
  if (fsSync.existsSync(rulesDir)) {
    try {
      for (const f of fsSync.readdirSync(rulesDir).filter(x => x.endsWith('.md')).sort()) {
        workspaceRules.push({ relPath: `.agents/rules/${f}`, summary: extractMarkdownSummary(path.join(rulesDir, f)) });
      }
    } catch {}
  }

  const workspaceSkills = [];
  const skillsDir = path.join(resolvedRoot, '.agents', 'skills');
  if (fsSync.existsSync(skillsDir)) {
    try {
      for (const d of fsSync.readdirSync(skillsDir, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort()) {
        const skillMd = path.join(skillsDir, d, 'SKILL.md');
        if (fsSync.existsSync(skillMd)) {
          workspaceSkills.push({ name: d, relPath: `.agents/skills/${d}/SKILL.md`, summary: extractMarkdownSummary(skillMd) });
        }
      }
    } catch {}
  }

  const workspaceWorkflows = [];
  const workflowsDir = path.join(resolvedRoot, '.agents', 'workflows');
  if (fsSync.existsSync(workflowsDir)) {
    try {
      for (const f of fsSync.readdirSync(workflowsDir).filter(x => x.endsWith('.md')).sort()) {
        workspaceWorkflows.push({ relPath: `.agents/workflows/${f}` });
      }
    } catch {}
  }

  const workspaceHooks = [];
  const wsHooksPath = path.join(resolvedRoot, '.agents', 'hooks.json');
  if (fsSync.existsSync(wsHooksPath)) {
    try {
      const hooksObj = JSON.parse(fsSync.readFileSync(wsHooksPath, 'utf8'));
      for (const [hookGroup, cfg] of Object.entries(hooksObj)) {
        if (cfg && typeof cfg === 'object') {
          const events = Object.keys(cfg).filter(k => k !== 'enabled');
          workspaceHooks.push(`\`${hookGroup}\` (${cfg.enabled !== false ? 'enabled' : 'disabled'}: ${events.join(', ')})`);
        }
      }
    } catch {}
  }

  const hasGitPostCommit = fsSync.existsSync(path.join(resolvedRoot, '.git', 'hooks', 'post-commit'));

  const globalHooks = [];
  const hooksJsonPath = path.join(geminiRoot, 'config', 'hooks.json');
  if (fsSync.existsSync(hooksJsonPath)) {
    try {
      const hooksObj = JSON.parse(fsSync.readFileSync(hooksJsonPath, 'utf8'));
      for (const [hookGroup, cfg] of Object.entries(hooksObj)) {
        if (cfg && typeof cfg === 'object') {
          const events = Object.keys(cfg).filter(k => k !== 'enabled');
          globalHooks.push(`\`${hookGroup}\` (${cfg.enabled !== false ? 'enabled' : 'disabled'}: ${events.join(', ')})`);
        }
      }
    } catch {}
  }

  let globalSettingsSummary = '';
  const configJsonPath = path.join(geminiRoot, 'config', 'config.json');
  if (fsSync.existsSync(configJsonPath)) {
    try {
      const us = JSON.parse(fsSync.readFileSync(configJsonPath, 'utf8')).userSettings || {};
      const parts = [];
      if (us.permissionPreset) parts.push(`Preset: \`${us.permissionPreset}\``);
      if (us.autoExecutionPolicy) parts.push(`Execution: \`${us.autoExecutionPolicy}\``);
      if (parts.length > 0) globalSettingsSummary = parts.join(' · ');
    } catch {}
  }

  const isSelf = displayProject === 'antigravity-memory-bank';
  const lines = [
    `# ${displayProject} — Repo Paths, API Keys, MCP Configs & Customizations`,
    '',
    '> **On-the-Fly Lookup & Sync Directive**: Auto-synchronized via `.agents/hooks.json` (`SessionStart`, `PostToolUse`, `Stop`) and `.git/hooks/post-commit`. Raw secret literals stay in git-ignored `.env*` / `~/.gemini/` files; read the indexed paths or invoke the MCP servers below when executing tasks.',
    '',
    '## 1. Repository Paths & Workspace Topology',
    `- **Workspace Root**: \`${workspaceRootTilde}\` · **Git Remote**: \`${gitRemote}\` (\`${gitBranch}\`)`,
    `- **Directory Layout**: ${topDirs.join(', ') || '`/`'}`
  ];

  if (!isSelf && siblingRepos.length > 0) {
    lines.push(`- **Colocated Sibling Repos**: ${siblingRepos.join(', ')}`);
  }

  lines.push('', '## 2. Environment Files, API Keys & Credentials Inventory');
  if (liveEnvFiles.length > 0) lines.push(`- **Active Local Env Files**: ${liveEnvFiles.map(f => `\`${f.relPath}\` (${f.count} keys)`).join(', ')}`);
  if (templateEnvFiles.length > 0) lines.push(`- **Env Templates**: ${templateEnvFiles.map(f => `\`${f.relPath}\` (${f.count} keys)`).join(', ')}`);
  if (hostTokens.length > 0) lines.push(`- **Host Token Files**: ${hostTokens.join(' · ')}`);
  for (const pc of platformCredentials.slice(0, 6)) lines.push(pc);

  const allEnvKeys = Array.from(allEnvKeysMap.values());
  if (allEnvKeys.length > 0) {
    lines.push('', '### Key & Environment Variable Registry');
    const prioritized = [...allEnvKeys].sort((a, b) => (b.liveSummary ? 1 : 0) - (a.liveSummary ? 1 : 0));
    const maxDetailed = 18;
    for (const item of prioritized.slice(0, maxDetailed)) {
      const status = item.liveSummary ? `✅ Live (${item.liveSummary})` : `📋 Template (${item.templateSummary || 'defined'})`;
      lines.push(`- **\`${item.key}\`**: ${status} — in ${item.sources.map(s => `\`${s}\``).join(', ')}`);
    }
    if (prioritized.length > maxDetailed) {
      lines.push(`- **Additional Env Keys (${prioritized.length - maxDetailed})**: ${prioritized.slice(maxDetailed).map(i => `\`${i.key}\``).join(', ')}`);
    }
  } else if (liveEnvFiles.length === 0 && templateEnvFiles.length === 0) {
    lines.push('- **Workspace `.env` Files**: None detected (uses host environment & `~/.gemini/config/mcp_config.json`).');
  }

  lines.push('', '## 3. Active MCP Servers (`~/.gemini/config/mcp_config.json`)');
  if (mcpServers.length > 0) {
    lines.push('| MCP Server | Bridge / Package | Tools | Auth & Credential Source |', '| :--- | :--- | :---: | :--- |');
    for (const s of mcpServers.slice(0, 14)) {
      lines.push(`| **\`${s.name}\`** | ${s.bridgeSummary} | ${s.toolCount || '—'} | ${s.authSummary} |`);
    }
  } else {
    lines.push('- No MCP servers detected in `~/.gemini/config/mcp_config.json` or `.mcp.json`.');
  }

  lines.push('', '## 4. Antigravity Customizations & Lifecycle Hooks', '- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`');
  if (globalSettingsSummary) lines.push(`- **Global Agent Policy (\`~/.gemini/config/config.json\`)**: ${globalSettingsSummary}`);
  const hookSummaries = [];
  if (workspaceHooks.length > 0) hookSummaries.push(`Workspace \`.agents/hooks.json\`: ${workspaceHooks.join(', ')}`);
  if (hasGitPostCommit) hookSummaries.push(`Git \`.git/hooks/post-commit\`: auto-sync enabled`);
  if (globalHooks.length > 0) hookSummaries.push(`Global \`~/.gemini/config/hooks.json\`: ${globalHooks.join(', ')}`);
  if (hookSummaries.length > 0) lines.push(`- **On-the-Fly Lifecycle Hooks**: ${hookSummaries.join(' · ')}`);
  if (workspaceRules.length > 0) {
    lines.push(`- **Workspace Rules (${workspaceRules.length})**:`);
    for (const r of workspaceRules.slice(0, 10)) lines.push(`  - \`${r.relPath}\`: ${r.summary}`);
  }
  if (workspaceSkills.length > 0) {
    lines.push(`- **Workspace Skills (${workspaceSkills.length})**:`);
    for (const sk of workspaceSkills.slice(0, 16)) lines.push(`  - \`/${sk.name}\` (\`${sk.relPath}\`): ${sk.summary}`);
    if (workspaceSkills.length > 16) lines.push(`  - *Additional Skills*: ${workspaceSkills.slice(16).map(s => `\`/${s.name}\``).join(', ')}`);
  }
  if (workspaceWorkflows.length > 0) {
    lines.push(`- **Workspace Workflows**: ${workspaceWorkflows.map(w => `\`${w.relPath}\``).join(', ')}`);
  }
  lines.push('');

  const changed = writeFileIfChangedSync(path.join(memoryBankDir, 'integrationsAndCustomizations.md'), lines.join('\n'));
  if (changed) log('  ✓ Updated memory-bank/integrationsAndCustomizations.md');
}

/**
 * Distill pertinent file modifications from the hook payload or recent git working tree (never raw conversations)
 */
function distillRecentWorkspaceActivity(rootDir, hookPayload) {
  const touchedFiles = new Set();
  if (hookPayload && hookPayload.toolCall && hookPayload.toolCall.args) {
    const tcArgs = hookPayload.toolCall.args;
    const f = tcArgs.TargetFile || tcArgs.AbsolutePath;
    if (f && String(f).startsWith(rootDir + '/')) {
      const rel = String(f).slice(rootDir.length + 1);
      if (!rel.startsWith('memory-bank/') && !rel.startsWith('docs/backlog.html')) {
        touchedFiles.add(rel);
      }
    }
  }
  try {
    const statusOut = execSync('git status --porcelain', { cwd: rootDir, stdio: 'pipe' }).toString().trim();
    if (statusOut) {
      for (const line of statusOut.split('\n')) {
        const rel = line.slice(3).trim().replace(/^"|"$/g, '');
        if (rel && !rel.startsWith('memory-bank/') && !rel.startsWith('docs/backlog.html') && !rel.startsWith('??')) {
          touchedFiles.add(rel);
        }
      }
    }
  } catch {}
  return Array.from(touchedFiles).slice(0, 5);
}

async function runSync() {
  const hookPayload = readHookStdinSync();
  try {
    if (!fsSync.existsSync(memoryBankDir)) {
      log('ℹ️ No memory-bank directory found, skipping sync.');
      return;
    }

    // 1. Always sync Repo Paths, API Keys, MCP Configs & Customizations on the fly
    try {
      syncIntegrationsAndCustomizations(targetDir);
    } catch {}

    // 2. Inspect latest git commit
    let lastCommitMsg = '';
    let lastCommitHash = '';
    try {
      const logOutput = execSync('git log -n 1 --pretty=format:"%h|%s"', {
        cwd: targetDir,
        stdio: 'pipe',
      }).toString().trim();
      const parts = logOutput.split('|');
      lastCommitHash = parts[0];
      lastCommitMsg = parts[1] || '';
    } catch {}

    const isMemoryCommit =
      lastCommitMsg.startsWith('docs(memory') ||
      lastCommitMsg.startsWith('chore(memory') ||
      lastCommitMsg.startsWith('chore(sync)');

    if (!isMemoryCommit && lastCommitHash) {
      log(`🔄 Auto-syncing memory context with commit [${lastCommitHash}] ${lastCommitMsg}...`);
    }

    // 3. Update memory-bank/activeContext.md if present
    const activeContextPath = path.join(memoryBankDir, 'activeContext.md');
    if (fsSync.existsSync(activeContextPath)) {
      try {
        let content = fsSync.readFileSync(activeContextPath, 'utf8');

        if (!isMemoryCommit && lastCommitHash && lastCommitMsg) {
          const syncStamp = `- **Last Synchronized Commit**: \`${lastCommitHash}\` — "${lastCommitMsg}" (${new Date().toISOString().split('T')[0]})`;
          if (content.includes('**Last Synchronized Commit**:')) {
            content = content.replace(/- \*\*Last Synchronized Commit\*\*:[^\n]+/g, syncStamp);
          } else if (content.includes('## 1. Current Phase & Sprint Objective')) {
            content = content.replace('## 1. Current Phase & Sprint Objective', `## 1. Current Phase & Sprint Objective\n${syncStamp}`);
          }

          const recentHeader = '## 2. Recent Technical Decisions & Accomplishments';
          const alreadyHasCommitInActive = content.includes(lastCommitHash);
          if (!alreadyHasCommitInActive && content.includes(recentHeader)) {
            const newBullet = `- **${lastCommitMsg}** (\`${lastCommitHash}\`)`;
            content = content.replace(recentHeader, `${recentHeader}\n${newBullet}`);
          }
        }

        // Sync active backlog ticket status if docs/backlog.json exists
        const backlogPath = path.join(targetDir, 'docs', 'backlog.json');
        if (fsSync.existsSync(backlogPath)) {
          try {
            const bj = JSON.parse(fsSync.readFileSync(backlogPath, 'utf8'));
            const tasks = Array.isArray(bj.tasks) ? bj.tasks : [];
            const inProg = tasks.filter(t => t.status === 'in_progress');
            const todo = tasks.filter(t => t.status === 'todo');
            const done = tasks.filter(t => t.status === 'done');
            const backlogLine = inProg.length > 0
              ? `- **Active Backlog Sprint**: \`${inProg.map(t => `${t.id} (${t.title})`).join(', ')}\` · ${todo.length} todo · ${done.length} done`
              : `- **Backlog Status**: ${done.length} done · ${todo.length} todo${todo[0] ? ` (Next: \`${todo[0].id}: ${todo[0].title}\`)` : ''}`;
            if (content.includes('- **Active Backlog Sprint**:') || content.includes('- **Backlog Status**:')) {
              content = content.replace(/- \*\*(?:Active Backlog Sprint|Backlog Status)\*\*:[^\n]+/g, backlogLine);
            }
          } catch {}
        }

        // Enforce < 140 line budget on activeContext.md by trimming excess lines if needed
        const acLines = content.split('\n');
        if (acLines.length > 140) {
          content = acLines.slice(0, 140).join('\n') + '\n';
        }

        if (writeFileIfChangedSync(activeContextPath, content)) {
          log('  ✓ Updated memory-bank/activeContext.md');
        }
      } catch {}
    }

    // 4. Update memory-bank/progress.md if present
    const progressPath = path.join(memoryBankDir, 'progress.md');
    if (!isMemoryCommit && lastCommitHash && fsSync.existsSync(progressPath)) {
      try {
        let content = fsSync.readFileSync(progressPath, 'utf8');
        const alreadyHasCommitInProgress = content.includes(lastCommitHash);
        const isFeatureOrFix = lastCommitMsg.startsWith('feat') || lastCommitMsg.startsWith('fix') || lastCommitMsg.includes('BUG-');
        if (!alreadyHasCommitInProgress && isFeatureOrFix) {
          const newMilestone = `- [x] **${lastCommitMsg}** (\`${lastCommitHash}\`)`;
          const possibleHeaders = [
            '## 1. High-Level Milestone Tracking',
            '## 1. Milestone Tracking',
            '## 1. Feature Implementation & Readiness Checklist',
            '## 1. Feature Implementation',
          ];
          for (const h of possibleHeaders) {
            if (content.includes(h)) {
              content = content.replace(h, `${h}\n${newMilestone}`);
              break;
            }
          }
          const pLines = content.split('\n');
          if (pLines.length > 140) {
            content = pLines.slice(0, 140).join('\n') + '\n';
          }
          if (writeFileIfChangedSync(progressPath, content)) {
            log('  ✓ Updated memory-bank/progress.md');
          }
        }
      } catch {}
    }

    // 5. Run line budget audit if not in quiet hook mode
    if (!hookEvent) {
      const linterPath = path.join(targetDir, 'scripts/lint-memory.mjs');
      if (fsSync.existsSync(linterPath)) {
        try {
          execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: isQuiet ? 'ignore' : 'inherit' });
        } catch {}
      }
    }

    // 6. Auto-commit if requested
    if (autoCommit && lastCommitHash) {
      try {
        execSync('git add memory-bank/', { cwd: targetDir, stdio: 'pipe' });
        const diffStatus = execSync('git diff --cached --name-only', { cwd: targetDir, stdio: 'pipe' }).toString().trim();
        if (diffStatus) {
          execSync(`git commit -m "docs(memory): auto-sync context with ${lastCommitHash} [skip ci]"`, {
            cwd: targetDir,
            stdio: isQuiet ? 'ignore' : 'inherit',
          });
          log('  ✓ Committed updated memory bank state to Git.');
        }
      } catch (err) {
        log(`ℹ️ Auto-commit skipped: ${err.message}`);
      }
    }

    log('✨ Memory context synchronization complete.\n');
  } catch (err) {
    if (!hookEvent) {
      console.error('⚠️ Warning during memory sync:', err.message);
    }
  } finally {
    if (hookEvent === 'Stop') {
      process.stdout.write('{"decision":"allow"}\n');
    } else if (hookEvent) {
      process.stdout.write('{}\n');
    }
  }
}

runSync();
