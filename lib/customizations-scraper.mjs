/**
 * Antigravity Memory Bank — API Keys, MCP Configs & Customizations Scraper
 *
 * Automatically discovers and synchronizes into `memory-bank/integrationsAndCustomizations.md`:
 * 1. Project API Keys, Environment Variable Contracts (.env*, eas.json, app.json) & Credential Paths
 * 2. Active MCP Servers (~/.gemini/config/mcp_config.json, workspace .mcp.json, ~/.gemini/antigravity/mcp/*)
 * 3. Workspace & Global Antigravity Customizations (.agents/rules/*, .agents/skills/*, .agents/workflows/*,
 *    .agents/plugins/*, ~/.gemini/config/hooks.json, ~/.gemini/config/config.json, ~/.gemini/GEMINI.md)
 *
 * Enforces the < 150-line Memory Bank budget while giving agents 100% visibility into all keys,
 * credentials, MCP tools, skills, rules, and hooks without committing raw secret literals to Git.
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SENSITIVE_KEY_REGEX = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCESS_KEY|WEBHOOK_SECRET|CREDENTIAL|AUTH_KEY|CLIENT_SECRET|DSN)/i;

function toTildePath(p) {
  if (!p) return '';
  const home = os.homedir();
  const str = String(p);
  if (home && str.startsWith(home)) {
    return '~' + str.slice(home.length);
  }
  return str;
}

/**
 * Safely summarize an env/config value:
 * - Preserves non-sensitive config values (ports, URLs without embedded passwords, emails, model names, public IDs)
 * - Masks sensitive API keys/secrets with a prefix hint (e.g. `sk_live_***`, `re_***`, `Set`)
 */
function summarizeEnvValue(key, rawVal) {
  const val = String(rawVal || '').trim().replace(/^['"]|['"]$/g, '');
  if (!val) return 'empty';
  if (val.includes('your_') || val.includes('replace_') || val.includes('example') || val.includes('xxx') || val === 'changeme') {
    return 'template placeholder';
  }
  if (val.startsWith('/') || val.startsWith('~/') || val.startsWith('./')) {
    return `path: \`${toTildePath(val)}\``;
  }
  // Check URLs with credentials (e.g. postgresql://user:pass@host:5432/db)
  if (/^[a-z0-9+.-]+:\/\/[^/]*:[^/]*@/i.test(val)) {
    try {
      const u = new URL(val);
      return `\`${u.protocol}//${u.username}:***@${u.host}${u.pathname}\``;
    } catch {
      return '`configured URI`';
    }
  }
  if (SENSITIVE_KEY_REGEX.test(key)) {
    const prefixMatch = val.match(/^(sk_live_|sk_test_|pk_live_|pk_test_|whsec_|re_|ghp_|gho_|AQ\.|AIza)[A-Za-z0-9_-]*/);
    if (prefixMatch) {
      return `\`${prefixMatch[1]}***\` (configured)`;
    }
    return 'configured (secret)';
  }
  if (val.length > 65) {
    return `\`${val.slice(0, 42)}...\``;
  }
  return `\`${val}\``;
}

/**
 * Parse a .env file into an array of { key, value, summary, isSensitive }
 */
function parseEnvFile(content) {
  const entries = [];
  const lines = String(content || '').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim().replace(/^export\s+/, '');
    const value = line.slice(eqIdx + 1).trim();
    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    entries.push({
      key,
      value,
      summary: summarizeEnvValue(key, value),
      isSensitive: SENSITIVE_KEY_REGEX.test(key)
    });
  }
  return entries;
}

/**
 * Recursively find matching files up to maxDepth
 */
function findWorkspaceFiles(rootDir, predicate, maxDepth = 3, currentDepth = 0, relPrefix = '') {
  const results = [];
  if (currentDepth > maxDepth || !fsSync.existsSync(rootDir)) return results;
  try {
    const entries = fsSync.readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '.next' ||
        entry.name === '.expo' ||
        entry.name === 'memory-backups' ||
        entry.name === '__pycache__' ||
        entry.name === '.venv' ||
        entry.name === 'venv'
      ) {
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

/**
 * Extract frontmatter description or first heading from a markdown skill/rule/workflow file
 */
function extractMarkdownSummary(filePath) {
  try {
    const content = fsSync.readFileSync(filePath, 'utf8');
    const descMatch = content.match(/^description:\s*>?-?\s*\n?\s*([^\n]+)/m);
    if (descMatch && descMatch[1].trim()) {
      return descMatch[1].trim().replace(/^['"]|['"]$/g, '').slice(0, 110);
    }
    const h1Match = content.match(/^#\s+([^\n]+)/m);
    if (h1Match && h1Match[1].trim()) {
      return h1Match[1].trim().slice(0, 110);
    }
  } catch {}
  return 'Custom workspace configuration';
}

/**
 * Discover all API keys, env contracts, MCP servers, and Antigravity customizations
 */
export function scrapeCustomizationsAndIntegrations(targetDir, projectName = '') {
  const resolvedRoot = path.resolve(targetDir);
  const homeDir = os.homedir();
  const geminiRoot = process.env.GEMINI_CONFIG_DIR || path.join(homeDir, '.gemini');
  const displayProject = projectName || path.basename(resolvedRoot);

  // ---------------------------------------------------------------------------
  // 1. Project .env* Files, EAS/Mobile Configs & Credential Files
  // ---------------------------------------------------------------------------
  const envFiles = findWorkspaceFiles(
    resolvedRoot,
    (name) => name === '.env' || name.startsWith('.env.'),
    3
  );

  const liveEnvFiles = [];
  const templateEnvFiles = [];
  const allEnvKeysMap = new Map(); // key -> { sources: [], liveSummary: null, templateSummary: null }

  for (const ef of envFiles) {
    const isTemplate = ef.name.includes('example') || ef.name.includes('sample') || ef.name.includes('template');
    const parsed = parseEnvFile(fsSync.readFileSync(ef.fullPath, 'utf8'));
    if (isTemplate) {
      templateEnvFiles.push({ relPath: ef.relPath, count: parsed.length, keys: parsed.map(p => p.key) });
    } else {
      liveEnvFiles.push({ relPath: ef.relPath, count: parsed.length, entries: parsed });
    }
    for (const item of parsed) {
      if (!allEnvKeysMap.has(item.key)) {
        allEnvKeysMap.set(item.key, {
          key: item.key,
          sources: [],
          liveSummary: null,
          templateSummary: null
        });
      }
      const rec = allEnvKeysMap.get(item.key);
      if (!rec.sources.includes(ef.relPath)) rec.sources.push(ef.relPath);
      if (!isTemplate && item.value) {
        rec.liveSummary = item.summary;
      } else if (isTemplate && !rec.templateSummary) {
        rec.templateSummary = item.summary;
      }
    }
  }

  // Check eas.json / app.json / wrangler.toml for mobile/cloud keys & IDs
  const easFiles = findWorkspaceFiles(resolvedRoot, (name) => name === 'eas.json' || name === 'wrangler.toml', 3);
  const platformCredentials = [];

  for (const ef of easFiles) {
    if (ef.name === 'eas.json') {
      try {
        const eas = JSON.parse(fsSync.readFileSync(ef.fullPath, 'utf8'));
        const buildEnvs = new Map();
        for (const [, prof] of Object.entries(eas.build || {})) {
          if (prof && prof.env) {
            for (const [k, v] of Object.entries(prof.env)) {
              buildEnvs.set(k, summarizeEnvValue(k, v));
            }
          }
        }
        if (buildEnvs.size > 0) {
          const kvList = Array.from(buildEnvs.entries()).map(([k, v]) => `\`${k}\`=${v}`).join(', ');
          platformCredentials.push(`- **EAS Build Env (\`${ef.relPath}\`)**: ${kvList}`);
        }
        const iosSub = eas.submit?.production?.ios || eas.submit?.testflight?.ios;
        if (iosSub) {
          const parts = [];
          if (iosSub.ascAppId) parts.push(`App ID \`${iosSub.ascAppId}\``);
          if (iosSub.ascApiKeyId) parts.push(`Key ID \`${iosSub.ascApiKeyId}\``);
          if (iosSub.ascApiKeyIssuerId) parts.push(`Issuer \`${iosSub.ascApiKeyIssuerId}\``);
          if (iosSub.ascApiKeyPath) parts.push(`Key \`${iosSub.ascApiKeyPath}\``);
          if (parts.length > 0) {
            platformCredentials.push(`- **App Store Connect (\`${ef.relPath}\`)**: ${parts.join(' · ')}`);
          }
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

  // Discover workspace credential files (*.p8, *service-account*.json, credentials/*)
  const workspaceCredFiles = findWorkspaceFiles(
    resolvedRoot,
    (name, relPath) =>
      name.endsWith('.p8') ||
      (relPath.includes('credentials/') && (name.endsWith('.json') || name.endsWith('.pem') || name.endsWith('.key'))),
    4
  );
  for (const cf of workspaceCredFiles) {
    platformCredentials.push(`- **Local Credential Key**: \`${cf.relPath}\``);
  }

  // Discover host-level token files in ~/
  const hostTokenCandidates = [
    { path: path.join(homeDir, '.github_token'), label: 'GitHub PAT File' },
    { path: path.join(homeDir, '.stripe_token'), label: 'Stripe API Token File' },
    { path: path.join(homeDir, '.stitch_token'), label: 'Google Stitch Token File' },
    { path: path.join(homeDir, '.ovh_credentials.json'), label: 'OVHcloud API Credentials' }
  ];
  const hostTokens = [];
  for (const ht of hostTokenCandidates) {
    if (fsSync.existsSync(ht.path)) {
      hostTokens.push(`\`${toTildePath(ht.path)}\` (${ht.label})`);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. MCP Server Configurations (Global & Workspace)
  // ---------------------------------------------------------------------------
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

        // Count tool schemas in ~/.gemini/antigravity/mcp/<serverName>
        let toolCount = 0;
        const schemaDir = path.join(geminiRoot, 'antigravity', 'mcp', serverName);
        if (fsSync.existsSync(schemaDir)) {
          try {
            toolCount = fsSync.readdirSync(schemaDir).filter(f => f.endsWith('.json')).length;
          } catch {}
        }

        // Summarize command / bridge
        const cmd = spec.command ? toTildePath(spec.command) : (spec.url || spec.serverUrl || 'stdio');
        const args = Array.isArray(spec.args) ? spec.args : [];
        let bridgeSummary = `\`${path.basename(cmd)}\``;
        if (cmd === 'npx') {
          const pkgArg = args.find(a => !a.startsWith('-') && a !== 'run' && !a.startsWith('http') && !a.startsWith('X-Goog'));
          const urlArg = args.find(a => a.startsWith('http'));
          if (pkgArg && urlArg) {
            bridgeSummary = `\`npx ${pkgArg}\` (\`${urlArg}\`)`;
          } else if (pkgArg) {
            // Check for Cloudflare account ID argument after 'run'
            const runIdx = args.indexOf('run');
            const acctId = (runIdx !== -1 && args[runIdx + 1]) ? ` (acct \`${args[runIdx + 1].slice(0, 10)}...\`)` : '';
            bridgeSummary = `\`npx ${pkgArg}\`${acctId}`;
          }
        } else if (cmd === '/bin/bash' || cmd === 'bash' || cmd === 'sh') {
          const scriptStr = args.join(' ');
          const mcpPkg = scriptStr.match(/@modelcontextprotocol\/[a-z0-9-]+/i);
          bridgeSummary = mcpPkg ? `\`${mcpPkg[0]}\`` : '`bash bridge`';
        } else {
          bridgeSummary = `\`${toTildePath(cmd)}\``;
        }

        // Summarize auth / env keys & token paths (never output raw secret tokens)
        const authParts = [];
        if (spec.env && typeof spec.env === 'object') {
          for (const [ek, ev] of Object.entries(spec.env)) {
            const evStr = String(ev || '');
            if (evStr.startsWith('/') || evStr.startsWith('~/')) {
              let displayEvPath = toTildePath(evStr);
              if (evStr.startsWith(resolvedRoot + '/')) {
                displayEvPath = evStr.slice(resolvedRoot.length + 1);
              } else if (displayEvPath.startsWith('~/Documents/')) {
                displayEvPath = `credentials/${path.basename(evStr)}`;
              }
              authParts.push(`\`${ek}\` -> \`${displayEvPath}\``);
            } else if (SENSITIVE_KEY_REGEX.test(ek)) {
              authParts.push(`\`${ek}\` (${ summarizeEnvValue(ek, evStr) })`);
            } else {
              authParts.push(`\`${ek}\`=\`${evStr}\``);
            }
          }
        }
        // Check args for --header "X-Goog-Api-Key: ..."
        for (const a of args) {
          if (String(a).toLowerCase().includes('api-key') || String(a).toLowerCase().includes('authorization')) {
            const headerName = String(a).split(':')[0].trim();
            authParts.push(`Header \`${headerName}\` (configured)`);
          }
        }

        mcpServers.push({
          name: serverName,
          scope: cand.scope,
          bridgeSummary,
          toolCount,
          authSummary: authParts.length > 0 ? authParts.join(', ') : 'Default / CLI auth'
        });
      }
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 3. Workspace & Global Antigravity Customizations
  // ---------------------------------------------------------------------------
  const workspaceRules = [];
  const rulesDir = path.join(resolvedRoot, '.agents', 'rules');
  if (fsSync.existsSync(rulesDir)) {
    try {
      const files = fsSync.readdirSync(rulesDir).filter(f => f.endsWith('.md')).sort();
      for (const f of files) {
        const full = path.join(rulesDir, f);
        workspaceRules.push({
          name: f,
          relPath: `.agents/rules/${f}`,
          summary: extractMarkdownSummary(full)
        });
      }
    } catch {}
  }

  const workspaceSkills = [];
  const skillsDir = path.join(resolvedRoot, '.agents', 'skills');
  if (fsSync.existsSync(skillsDir)) {
    try {
      const dirs = fsSync.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
      for (const d of dirs) {
        const skillMd = path.join(skillsDir, d, 'SKILL.md');
        if (fsSync.existsSync(skillMd)) {
          workspaceSkills.push({
            name: d,
            relPath: `.agents/skills/${d}/SKILL.md`,
            summary: extractMarkdownSummary(skillMd)
          });
        }
      }
    } catch {}
  }

  const workspaceWorkflows = [];
  const workflowsDir = path.join(resolvedRoot, '.agents', 'workflows');
  if (fsSync.existsSync(workflowsDir)) {
    try {
      const files = fsSync.readdirSync(workflowsDir).filter(f => f.endsWith('.md')).sort();
      for (const f of files) {
        workspaceWorkflows.push({
          name: f.replace(/\.md$/, ''),
          relPath: `.agents/workflows/${f}`
        });
      }
    } catch {}
  }

  // Global Hooks & Config
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
      const cfg = JSON.parse(fsSync.readFileSync(configJsonPath, 'utf8'));
      const us = cfg.userSettings || {};
      const parts = [];
      if (us.permissionPreset) parts.push(`Preset: \`${us.permissionPreset}\``);
      if (us.autoExecutionPolicy) parts.push(`Execution: \`${us.autoExecutionPolicy}\``);
      if (parts.length > 0) globalSettingsSummary = parts.join(' · ');
    } catch {}
  }

  return {
    displayProject,
    liveEnvFiles,
    templateEnvFiles,
    allEnvKeys: Array.from(allEnvKeysMap.values()),
    platformCredentials,
    hostTokens,
    mcpServers,
    workspaceRules,
    workspaceSkills,
    workspaceWorkflows,
    globalHooks,
    globalSettingsSummary
  };
}

/**
 * Render `memory-bank/integrationsAndCustomizations.md` strictly under 125 lines
 */
export function renderCustomizationsMarkdown(scraped) {
  const lines = [
    `# ${scraped.displayProject} — API Keys, MCP Configs & Customizations`,
    '',
    '> **Agent Lookup Directive**: Raw secret literals are stored in the local git-ignored `.env*` and `~/.gemini/` files indexed below (never committed in plaintext to Git). Read the referenced source file or invoke the corresponding MCP server when executing tasks.',
    '',
    '## 1. Environment Files, API Keys & Credentials Inventory'
  ];

  if (scraped.liveEnvFiles.length > 0) {
    lines.push(`- **Active Local Env Files**: ${scraped.liveEnvFiles.map(f => `\`${f.relPath}\` (${f.count} keys)`).join(', ')}`);
  }
  if (scraped.templateEnvFiles.length > 0) {
    lines.push(`- **Env Templates**: ${scraped.templateEnvFiles.map(f => `\`${f.relPath}\` (${f.count} keys)`).join(', ')}`);
  }
  if (scraped.hostTokens.length > 0) {
    lines.push(`- **Host Token Files**: ${scraped.hostTokens.join(' · ')}`);
  }
  for (const pc of scraped.platformCredentials.slice(0, 6)) {
    lines.push(pc);
  }

  if (scraped.allEnvKeys.length > 0) {
    lines.push('');
    lines.push('### Key & Environment Variable Registry');
    // Group compactly up to 22 lines so we never breach the 150-line budget
    const prioritized = [...scraped.allEnvKeys].sort((a, b) => {
      const aLive = a.liveSummary ? 1 : 0;
      const bLive = b.liveSummary ? 1 : 0;
      return bLive - aLive;
    });

    const maxDetailed = 18;
    for (const item of prioritized.slice(0, maxDetailed)) {
      const status = item.liveSummary
        ? `✅ Live (${item.liveSummary})`
        : `📋 Template (${item.templateSummary || 'defined'})`;
      lines.push(`- **\`${item.key}\`**: ${status} — in ${item.sources.map(s => `\`${s}\``).join(', ')}`);
    }
    if (prioritized.length > maxDetailed) {
      const rest = prioritized.slice(maxDetailed).map(i => `\`${i.key}\``).join(', ');
      lines.push(`- **Additional Env Keys (${prioritized.length - maxDetailed})**: ${rest}`);
    }
  } else if (scraped.liveEnvFiles.length === 0 && scraped.templateEnvFiles.length === 0) {
    lines.push('- **Workspace `.env` Files**: None detected (uses host environment & `~/.gemini/config/mcp_config.json`).');
  }

  lines.push('');
  lines.push('## 2. Active MCP Servers (`~/.gemini/config/mcp_config.json`)');
  if (scraped.mcpServers.length > 0) {
    lines.push('| MCP Server | Bridge / Package | Tools | Auth & Credential Source |');
    lines.push('| :--- | :--- | :---: | :--- |');
    for (const s of scraped.mcpServers.slice(0, 14)) {
      lines.push(`| **\`${s.name}\`** | ${s.bridgeSummary} | ${s.toolCount || '—'} | ${s.authSummary} |`);
    }
  } else {
    lines.push('- No MCP servers detected in `~/.gemini/config/mcp_config.json` or `.mcp.json`.');
  }

  lines.push('');
  lines.push('## 3. Antigravity Customizations (Rules, Skills, Hooks & Policies)');
  lines.push('- **Tier 1 Global Rules**: `~/.gemini/GEMINI.md`');
  if (scraped.globalSettingsSummary) {
    lines.push(`- **Global Agent Policy (` + '`~/.gemini/config/config.json`' + `)**: ${scraped.globalSettingsSummary}`);
  }
  if (scraped.globalHooks.length > 0) {
    lines.push(`- **Global Lifecycle Hooks (` + '`~/.gemini/config/hooks.json`' + `)**: ${scraped.globalHooks.join(', ')}`);
  }

  if (scraped.workspaceRules.length > 0) {
    lines.push(`- **Workspace Rules (${scraped.workspaceRules.length})**:`);
    for (const r of scraped.workspaceRules.slice(0, 10)) {
      lines.push(`  - \`${r.relPath}\`: ${r.summary}`);
    }
  }

  if (scraped.workspaceSkills.length > 0) {
    lines.push(`- **Workspace Skills (${scraped.workspaceSkills.length})**:`);
    for (const sk of scraped.workspaceSkills.slice(0, 16)) {
      lines.push(`  - \`/${sk.name}\` (\`${sk.relPath}\`): ${sk.summary}`);
    }
    if (scraped.workspaceSkills.length > 16) {
      const more = scraped.workspaceSkills.slice(16).map(s => `\`/${s.name}\``).join(', ');
      lines.push(`  - *Additional Skills*: ${more}`);
    }
  }

  if (scraped.workspaceWorkflows.length > 0) {
    lines.push(`- **Workspace Workflows**: ${scraped.workspaceWorkflows.map(w => `\`${w.relPath}\``).join(', ')}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Synchronize `memory-bank/integrationsAndCustomizations.md` and link it in `AGENTS.md` and `.agents/skills/start/SKILL.md`
 */
export async function syncCustomizationsToMemoryBank(targetDir, projectName = '') {
  const resolvedRoot = path.resolve(targetDir);
  const mbDir = path.join(resolvedRoot, 'memory-bank');
  if (!fsSync.existsSync(mbDir)) return null;

  const scraped = scrapeCustomizationsAndIntegrations(resolvedRoot, projectName);
  const markdown = renderCustomizationsMarkdown(scraped);
  const destPath = path.join(mbDir, 'integrationsAndCustomizations.md');
  await fs.writeFile(destPath, markdown, 'utf8');

  // Ensure AGENTS.md links to memory-bank/integrationsAndCustomizations.md
  const agentsPath = path.join(resolvedRoot, 'AGENTS.md');
  if (fsSync.existsSync(agentsPath)) {
    try {
      let agentsMd = await fs.readFile(agentsPath, 'utf8');
      if (!agentsMd.includes('integrationsAndCustomizations.md')) {
        const linkLine = `- **API Keys, MCP Servers & Customizations**: @[Integrations & Customizations](memory-bank/integrationsAndCustomizations.md)`;
        if (agentsMd.includes('## Context Links')) {
          agentsMd = agentsMd.replace(/(## Context Links[^\n]*\n)/, `$1${linkLine}\n`);
        } else {
          agentsMd = agentsMd.trimEnd() + `\n${linkLine}\n`;
        }
        await fs.writeFile(agentsPath, agentsMd, 'utf8');
      }
    } catch {}
  }

  // Ensure .agents/skills/start/SKILL.md mentions integrationsAndCustomizations.md
  const startSkillPath = path.join(resolvedRoot, '.agents', 'skills', 'start', 'SKILL.md');
  if (fsSync.existsSync(startSkillPath)) {
    try {
      let startMd = await fs.readFile(startSkillPath, 'utf8');
      if (!startMd.includes('integrationsAndCustomizations.md')) {
        if (startMd.includes('and `memory-bank/infrastructureInvariants.md`')) {
          startMd = startMd.replace(
            'and `memory-bank/infrastructureInvariants.md`',
            '`memory-bank/infrastructureInvariants.md`, and `memory-bank/integrationsAndCustomizations.md`'
          );
          await fs.writeFile(startSkillPath, startMd, 'utf8');
        } else if (startMd.includes('`memory-bank/infrastructureInvariants.md`')) {
          startMd = startMd.replace(
            '`memory-bank/infrastructureInvariants.md`',
            '`memory-bank/infrastructureInvariants.md`\n   - `memory-bank/integrationsAndCustomizations.md`'
          );
          await fs.writeFile(startSkillPath, startMd, 'utf8');
        }
      }
    } catch {}
  }

  return {
    destPath,
    envKeyCount: scraped.allEnvKeys.length,
    mcpCount: scraped.mcpServers.length,
    rulesCount: scraped.workspaceRules.length,
    skillsCount: scraped.workspaceSkills.length
  };
}
