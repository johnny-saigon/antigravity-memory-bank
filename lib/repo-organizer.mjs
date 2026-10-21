/**
 * Antigravity Memory Bank — AI-Native Repository & Root Organizer
 *
 * Enforces a coherent, best-practices repository structure across both greenfield
 * installations and existing/advanced projects:
 *
 * 1. Archetype Detection (`monorepo`, `fullstack-hybrid`, `web-app`, `cli-library`, `greenfield`).
 * 2. Clean Root Entrypoints Only (`AGENTS.md`, `README.md`, `package.json`, `.gitignore`, build configs).
 * 3. Automatic Root Documentation & Board Relocation (`UX_BRIEF.md`, `DESIGN.md`, `MIGRATION_BOARD.md`,
 *    `ARCHITECTURE.md`, `NATIVE_UI_SPEC.md`, etc. -> `docs/` via `git mv` to preserve history).
 * 4. Cross-Reference Link Rewriting across `README.md`, `AGENTS.md`, `memory-bank/*.md`, and `docs/*.md`.
 * 5. Root Clutter & Stub Cleanup (redundant 57B `CLAUDE.md` stubs, orphaned `skills-lock.json`,
 *    `.DS_Store`, ephemeral `test-results/`).
 * 6. Hardened AI-Native `.gitignore` & Git Index Untracking (`docs/backlog.html`, `memory-backups/`).
 * 7. Canonical Directory & GitHub CI Scaffolding (`docs/planning/`, `scripts/`, `memory-bank/`,
 *    `.agents/`, `.github/workflows/memory-bank-sync.yml`, and `src/` + `tests/` on greenfield repos).
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const ROOT_ALLOWED_MARKDOWN = new Set([
  'readme.md',
  'agents.md',
  'gemini.md',
  'license.md',
  'changelog.md',
  'contributing.md',
  'code_of_conduct.md',
  'security.md'
]);

const CANONICAL_GITIGNORE_ENTRIES = [
  { pattern: 'node_modules/', check: /(?:^|\n)\/?node_modules\/?(?:\r?\n|$)/ },
  { pattern: '.DS_Store', check: /(?:^|\n)\/?\.DS_Store(?:\r?\n|$)/ },
  { pattern: '.env', check: /(?:^|\n)\/?\.env(?:\r?\n|$)/ },
  { pattern: '.env.local', check: /(?:^|\n)\/?\.env\.local(?:\r?\n|$)/ },
  { pattern: '.env.*.local', check: /(?:^|\n)\/?\.env\.\*\.local(?:\r?\n|$)/ },
  { pattern: 'docs/backlog.html', check: /(?:^|\n)\/?docs\/backlog\.html(?:\r?\n|$)/ },
  { pattern: 'memory-backups/', check: /(?:^|\n)\/?memory-backups\/?(?:\r?\n|$)/ },
  { pattern: 'test-results/', check: /(?:^|\n)\/?test-results\/?(?:\r?\n|$)/ },
  { pattern: 'playwright-report/', check: /(?:^|\n)\/?playwright-report\/?(?:\r?\n|$)/ }
];

/**
 * Detect whether a root CLAUDE.md / CURSOR.md file is just a tiny pointer stub to AGENTS.md
 */
export function isRedundantAgentPointerStub(filePath) {
  try {
    const stat = fsSync.statSync(filePath);
    if (!stat.isFile() || stat.size > 180) return false;
    const raw = fsSync.readFileSync(filePath, 'utf8').trim();
    return /See\s+AGENTS\.md|Follow\s+the\s+instructions\s+in\s+AGENTS\.md/i.test(raw);
  } catch {
    return false;
  }
}

/**
 * Detect the structural archetype of a repository (`monorepo`, `fullstack-hybrid`, `cli-library`, `web-app`, `greenfield`)
 */
export function detectRepoArchetype(targetDir) {
  const root = path.resolve(targetDir);
  const exists = (rel) => fsSync.existsSync(path.join(root, rel));

  let hasWorkspaces = false;
  let hasBinField = false;
  const pkgPath = path.join(root, 'package.json');
  if (exists('package.json')) {
    try {
      const pkg = JSON.parse(fsSync.readFileSync(pkgPath, 'utf8'));
      hasWorkspaces = Boolean(pkg.workspaces);
      hasBinField = Boolean(pkg.bin);
    } catch {}
  }

  const sourceDirs = ['apps', 'packages', 'src', 'app', 'pages', 'server', 'backend', 'api', 'client', 'frontend', 'lib', 'bin'].filter(exists);
  const testDirs = ['tests', 'test', 'e2e', '__tests__'].filter(exists);

  if (hasWorkspaces || exists('apps') || exists('packages')) {
    return {
      id: 'monorepo',
      label: 'Multi-App Monorepo',
      sourceDirs,
      testDirs
    };
  }

  if ((exists('src') || exists('client') || exists('frontend')) && (exists('server') || exists('backend') || exists('api'))) {
    return {
      id: 'fullstack-hybrid',
      label: 'Full-Stack Hybrid App',
      sourceDirs,
      testDirs
    };
  }

  if ((exists('bin') && exists('lib')) || (hasBinField && exists('lib'))) {
    return {
      id: 'cli-library',
      label: 'CLI & Modular Library',
      sourceDirs,
      testDirs
    };
  }

  if (exists('src') || exists('app') || exists('pages') || exists('server')) {
    return {
      id: 'web-app',
      label: 'Standard Application',
      sourceDirs,
      testDirs
    };
  }

  return {
    id: 'greenfield',
    label: 'Greenfield AI-Native Repo',
    sourceDirs,
    testDirs
  };
}

/**
 * Synchronously audit root hygiene for the 10-Point Baseline Ingestion Checklist
 */
export function auditRootHygiene(targetDir) {
  const root = path.resolve(targetDir);
  const archetype = detectRepoArchetype(root);
  const looseRootDocs = [];
  const clutterItems = [];

  if (!fsSync.existsSync(root)) {
    return { archetype, looseRootDocs, clutterItems, isCleanRoot: true };
  }

  const entries = fsSync.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const lower = entry.name.toLowerCase();
    const fullPath = path.join(root, entry.name);

    if (entry.isFile()) {
      if (entry.name === '.DS_Store') {
        clutterItems.push('.DS_Store');
        continue;
      }
      if ((lower === 'claude.md' || lower === 'cursor.md') && isRedundantAgentPointerStub(fullPath)) {
        clutterItems.push(`${entry.name} (stub)`);
        continue;
      }
      if (lower.endsWith('.md') && !ROOT_ALLOWED_MARKDOWN.has(lower) && lower !== 'claude.md') {
        looseRootDocs.push(entry.name);
      }
    }
  }

  return {
    archetype,
    looseRootDocs,
    clutterItems,
    isCleanRoot: looseRootDocs.length === 0 && clutterItems.length === 0
  };
}

function isFileGitTracked(targetDir, relPath) {
  try {
    execSync(`git ls-files --error-unmatch "${relPath}"`, { cwd: targetDir, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Rewrite relative and file:// links across repository markdown files when root docs move into docs/
 */
async function rewriteMovedDocLinks(targetDir, movedFileNames, dryRun = false) {
  if (!movedFileNames || movedFileNames.length === 0) return [];

  const candidateDirs = [
    { dir: targetDir, prefixFromHere: 'docs/' },
    { dir: path.join(targetDir, 'memory-bank'), prefixFromHere: '../docs/' },
    { dir: path.join(targetDir, 'docs'), prefixFromHere: '' },
    { dir: path.join(targetDir, '.agents/rules'), prefixFromHere: '../../docs/' }
  ];

  const markdownTargets = [];
  for (const { dir, prefixFromHere } of candidateDirs) {
    if (!fsSync.existsSync(dir)) continue;
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith('.md')) {
          // For root directory, only scan root markdown files that remain at root
          if (dir === targetDir && movedFileNames.includes(e.name)) continue;
          markdownTargets.push({ fullPath: path.join(dir, e.name), relPath: path.relative(targetDir, path.join(dir, e.name)), prefixFromHere });
        }
      }
    } catch {}
  }

  const rewrittenFiles = [];
  const escapedRepoRoot = targetDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const target of markdownTargets) {
    let content;
    try {
      content = await fs.readFile(target.fullPath, 'utf8');
    } catch {
      continue;
    }

    let updated = content;
    for (const fileName of movedFileNames) {
      const escapedFile = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. Rewrite absolute file:// links: file:///.../RepoRoot/FILE.md -> file:///.../RepoRoot/docs/FILE.md
      const fileUrlRegex = new RegExp(`(file://${escapedRepoRoot})/${escapedFile}\\b`, 'g');
      updated = updated.replace(fileUrlRegex, `$1/docs/${fileName}`);

      // 2. Rewrite relative markdown links: ](FILE.md) or ](./FILE.md) or ](../FILE.md)
      if (!target.relPath.includes(path.sep)) {
        // Root file (e.g. README.md, AGENTS.md)
        const rootLinkRegex = new RegExp(`(\\]\\()(?:\\.\\/)?${escapedFile}(#[^)]+)?(\\))`, 'g');
        updated = updated.replace(rootLinkRegex, `$1docs/${fileName}$2$3`);
      } else if (target.relPath.startsWith('memory-bank' + path.sep)) {
        const mbLinkRegex = new RegExp(`(\\]\\()(?:\\.\\.\\/|\\.\\/)?${escapedFile}(#[^)]+)?(\\))`, 'g');
        updated = updated.replace(mbLinkRegex, `$1../docs/${fileName}$2$3`);
      } else if (target.relPath.startsWith('docs' + path.sep)) {
        const docsLinkRegex = new RegExp(`(\\]\\()\\.\\.\\/${escapedFile}(#[^)]+)?(\\))`, 'g');
        updated = updated.replace(docsLinkRegex, `$1${fileName}$2$3`);
      }
    }

    if (updated !== content) {
      if (!dryRun) {
        await fs.writeFile(target.fullPath, updated, 'utf8');
      }
      rewrittenFiles.push(target.relPath);
    }
  }

  return rewrittenFiles;
}

/**
 * Coherently organize the repository structure at the root and across AI-native directories
 */
export async function organizeRepositoryStructure(targetDir, opts = {}) {
  const root = path.resolve(targetDir);
  const dryRun = Boolean(opts.dryRun);
  const quiet = Boolean(opts.quiet);
  const pkgRoot = opts.pkgRoot || path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const hasGit = fsSync.existsSync(path.join(root, '.git'));

  const archetype = detectRepoArchetype(root);
  const movedDocs = [];
  const removedClutter = [];
  const createdDirs = [];
  const gitignoreAdded = [];

  if (!quiet) {
    console.log(`\n🗂️  Organizing AI-Native Repository Structure (${archetype.label})...`);
  }

  // 1. Ensure canonical AI-native directories exist
  const requiredDirs = [
    'docs',
    'docs/planning',
    'scripts',
    'memory-bank',
    '.agents/rules',
    '.agents/skills',
    '.github/workflows'
  ];

  if (archetype.id === 'greenfield') {
    requiredDirs.push('src', 'tests');
  }

  for (const relDir of requiredDirs) {
    const fullDir = path.join(root, relDir);
    if (!fsSync.existsSync(fullDir)) {
      if (!dryRun) {
        await fs.mkdir(fullDir, { recursive: true });
        if ((relDir === 'src' || relDir === 'tests') && archetype.id === 'greenfield') {
          await fs.writeFile(path.join(fullDir, '.gitkeep'), '', 'utf8');
        }
      }
      createdDirs.push(relDir);
    }
  }

  // 2. Relocate loose root specification & board markdown files into docs/
  const rootEntries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (!entry.isFile()) continue;
    const fileName = entry.name;
    const lower = fileName.toLowerCase();
    const srcPath = path.join(root, fileName);

    // Handle redundant CLAUDE.md / CURSOR.md pointer stubs first
    if ((lower === 'claude.md' || lower === 'cursor.md') && isRedundantAgentPointerStub(srcPath)) {
      if (!dryRun) {
        if (hasGit && isFileGitTracked(root, fileName)) {
          try {
            execSync(`git rm -f "${fileName}"`, { cwd: root, stdio: 'pipe' });
          } catch {
            await fs.rm(srcPath, { force: true });
          }
        } else {
          await fs.rm(srcPath, { force: true });
        }
      }
      removedClutter.push(`${fileName} (redundant pointer stub)`);
      continue;
    }

    if (!lower.endsWith('.md')) continue;
    if (ROOT_ALLOWED_MARKDOWN.has(lower) || lower === 'claude.md') continue;

    const destRel = path.join('docs', fileName);
    const destPath = path.join(root, destRel);
    const destExists = fsSync.existsSync(destPath);

    if (!destExists) {
      if (!dryRun) {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        let movedByGit = false;
        if (hasGit && isFileGitTracked(root, fileName)) {
          try {
            execSync(`git mv "${fileName}" "${destRel}"`, { cwd: root, stdio: 'pipe' });
            movedByGit = true;
          } catch {}
        }
        if (!movedByGit) {
          await fs.rename(srcPath, destPath);
        }
      }
      movedDocs.push({ from: fileName, to: destRel, action: 'moved' });
      if (!quiet) {
        console.log(`  ✓ Relocated root doc \`${fileName}\` → \`${destRel}\``);
      }
    } else {
      // Destination already exists in docs/: preserve whichever has richer content, remove root duplicate
      if (!dryRun) {
        try {
          const srcStat = await fs.stat(srcPath);
          const destStat = await fs.stat(destPath);
          if (srcStat.size > destStat.size) {
            await fs.copyFile(srcPath, destPath);
          }
        } catch {}
        if (hasGit && isFileGitTracked(root, fileName)) {
          try {
            execSync(`git rm -f "${fileName}"`, { cwd: root, stdio: 'pipe' });
          } catch {
            await fs.rm(srcPath, { force: true });
          }
        } else {
          await fs.rm(srcPath, { force: true });
        }
      }
      movedDocs.push({ from: fileName, to: destRel, action: 'deduplicated' });
      if (!quiet) {
        console.log(`  ✓ Deduplicated root \`${fileName}\` into \`${destRel}\``);
      }
    }
  }

  // 3. Rewrite markdown links across repo to point to docs/<FileName>
  const movedFileNames = movedDocs.map((m) => m.from);
  const rewrittenFiles = await rewriteMovedDocLinks(root, movedFileNames, dryRun);
  if (rewrittenFiles.length > 0 && !quiet) {
    console.log(`  ✓ Updated cross-reference links in ${rewrittenFiles.length} file(s): ${rewrittenFiles.join(', ')}`);
  }

  // 4. Clean root clutter (.DS_Store, orphaned skills-lock.json, ephemeral test-results/)
  const dsStoreCandidates = ['.DS_Store', 'docs/.DS_Store', 'memory-bank/.DS_Store', '.agents/.DS_Store'];
  for (const rel of dsStoreCandidates) {
    const full = path.join(root, rel);
    if (fsSync.existsSync(full)) {
      if (!dryRun) {
        if (hasGit && isFileGitTracked(root, rel)) {
          try {
            execSync(`git rm -f "${rel}"`, { cwd: root, stdio: 'pipe' });
          } catch {
            await fs.rm(full, { force: true });
          }
        } else {
          await fs.rm(full, { force: true });
        }
      }
      removedClutter.push(rel);
    }
  }

  const skillsLockPath = path.join(root, 'skills-lock.json');
  if (fsSync.existsSync(skillsLockPath)) {
    let referencedInPkg = false;
    try {
      const pkgRaw = await fs.readFile(path.join(root, 'package.json'), 'utf8');
      referencedInPkg = pkgRaw.includes('skills-lock.json');
    } catch {}
    if (!referencedInPkg) {
      if (!dryRun) {
        if (hasGit && isFileGitTracked(root, 'skills-lock.json')) {
          try {
            execSync('git rm -f "skills-lock.json"', { cwd: root, stdio: 'pipe' });
          } catch {
            await fs.rm(skillsLockPath, { force: true });
          }
        } else {
          await fs.rm(skillsLockPath, { force: true });
        }
      }
      removedClutter.push('skills-lock.json');
    }
  }

  for (const ephDir of ['test-results', 'playwright-report']) {
    const fullEph = path.join(root, ephDir);
    if (fsSync.existsSync(fullEph)) {
      if (!dryRun) {
        await fs.rm(fullEph, { recursive: true, force: true });
      }
      removedClutter.push(`${ephDir}/`);
    }
  }

  if (removedClutter.length > 0 && !quiet) {
    console.log(`  ✓ Cleaned root clutter: ${removedClutter.join(', ')}`);
  }

  // 5. Harden .gitignore with canonical AI-native ignore rules & untrack ephemeral files from Git index
  const gitignorePath = path.join(root, '.gitignore');
  let gitignoreContent = '';
  try {
    gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
  } catch {}

  for (const item of CANONICAL_GITIGNORE_ENTRIES) {
    if (!item.check.test(gitignoreContent)) {
      gitignoreAdded.push(item.pattern);
    }
  }

  if (gitignoreAdded.length > 0) {
    if (!dryRun) {
      const header = gitignoreContent.includes('# Antigravity Memory Bank & AI-Native Ignores')
        ? ''
        : '\n# Antigravity Memory Bank & AI-Native Ignores\n';
      const base = gitignoreContent.trimEnd();
      const updatedGitignore = (base ? base + '\n' : '') + header + gitignoreAdded.join('\n') + '\n';
      await fs.writeFile(gitignorePath, updatedGitignore, 'utf8');
    }
    if (!quiet) {
      console.log(`  ✓ Hardened .gitignore (+${gitignoreAdded.length} AI-native entries: ${gitignoreAdded.join(', ')})`);
    }
  }

  // Untrack docs/backlog.html and .DS_Store from Git index if currently tracked (while keeping docs/backlog.html on disk)
  if (hasGit && !dryRun) {
    for (const cachedRel of ['docs/backlog.html', '.DS_Store']) {
      if (isFileGitTracked(root, cachedRel)) {
        try {
          execSync(`git rm --cached -f "${cachedRel}"`, { cwd: root, stdio: 'pipe' });
          if (!quiet) {
            console.log(`  ✓ Untracked ephemeral \`${cachedRel}\` from Git index (preserved on disk)`);
          }
        } catch {}
      }
    }
  }

  // 6. Ensure GitHub Actions CI workflow (.github/workflows/memory-bank-sync.yml) is installed
  const ciDest = path.join(root, '.github/workflows/memory-bank-sync.yml');
  const ciSrc = path.join(pkgRoot, 'templates/github/workflows/memory-bank-sync.yml.tpl');
  if (!fsSync.existsSync(ciDest) && fsSync.existsSync(ciSrc)) {
    if (!dryRun) {
      await fs.mkdir(path.dirname(ciDest), { recursive: true });
      await fs.copyFile(ciSrc, ciDest);
    }
    if (!quiet) {
      console.log('  ✓ Installed GitHub CI workflow: .github/workflows/memory-bank-sync.yml');
    }
  }

  // 7. On greenfield projects without a README.md, scaffold a clean AI-Native README.md
  const readmePath = path.join(root, 'README.md');
  if (!fsSync.existsSync(readmePath) && !dryRun) {
    const projName = opts.projectName || path.basename(root);
    const starterReadme = `# ${projName}

Built with the **Antigravity Three-Tier Memory Bank**, **Zero-Token Backlog Engine**, and **Correlated 3-Artifact Planning Mode**.

## Repository Structure

\`\`\`text
.
├── AGENTS.md                  # Tier 3 AI Agent Entrypoint & Operational Mandates
├── memory-bank/               # Passive Context Baseline (<150 lines/file)
├── docs/                      # Operational Backlog (backlog.json, BACKLOG.md) & Architecture/UX Specs
│   └── planning/              # Correlated 3-Artifact Planning Mode (task.md, implementation_plan.md, walkthrough.md)
├── .agents/                   # Antigravity IDE Hooks (hooks.json), Tier 2 Rules & Slash-Command Skills
├── scripts/                   # Zero-dependency Backlog, Memory Sync & Linter scripts
├── src/                       # Application Source Code
└── tests/                     # Automated Verification Suites
\`\`\`

## Quick Commands

- \`npm run backlog list\` — View local sprint backlog
- \`npm run backlog plan <ID>\` — Refresh 3-Artifact Planning Mode (\`task.md\`, \`implementation_plan.md\`, \`walkthrough.md\`)
- \`npm run lint:memory\` — Audit Memory Bank line budgets (\`< 150 lines\`)
- \`npm run memory:organize\` — Re-verify root & repository structure hygiene
`;
    await fs.writeFile(readmePath, starterReadme, 'utf8');
    if (!quiet) {
      console.log('  ✓ Scaffolded starter AI-native README.md');
    }
  }

  const audit = auditRootHygiene(root);
  if (!quiet) {
    console.log(`  ✓ Root hygiene verified: ${audit.looseRootDocs.length} loose root docs, ${audit.clutterItems.length} clutter items (${archetype.label})`);
  }

  return {
    archetype,
    movedDocs,
    rewrittenFiles,
    removedClutter,
    createdDirs,
    gitignoreAdded,
    audit
  };
}
