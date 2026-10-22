/**
 * Hexagonal Brick CLI Engine (`lib/brick-engine.mjs`)
 *
 * Implements:
 * - `brick list`
 * - `brick install <name> [--platforms web,ios,android | --platforms web] [--with-schema]`
 * - `brick upgrade <name> [--platforms ...]`
 * - `brick doctor [name]`
 */

import fsSync, { promises as fs } from 'node:fs';
import path from 'node:path';

async function copyDirRecursive(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export function listAvailableBricks(pkgRoot) {
  const bricksRoot = path.join(pkgRoot, 'bricks');
  if (!fsSync.existsSync(bricksRoot)) return [];
  return fsSync
    .readdirSync(bricksRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fsSync.existsSync(path.join(bricksRoot, d.name, 'brick.json')))
    .map((d) => {
      const manifestPath = path.join(bricksRoot, d.name, 'brick.json');
      const manifest = JSON.parse(fsSync.readFileSync(manifestPath, 'utf8'));
      return {
        name: manifest.name || d.name,
        manifest,
        dir: path.join(bricksRoot, d.name),
      };
    });
}

export function printBrickList(pkgRoot) {
  const bricks = listAvailableBricks(pkgRoot);
  console.log('\n🧱 Antigravity Shared Hexagonal Bricks (`bricks/`)\n');
  if (bricks.length === 0) {
    console.log('  (No bricks found)');
    return bricks;
  }
  for (const { manifest } of bricks) {
    console.log(`  • ${manifest.name}@${manifest.version} — ${manifest.title}`);
    console.log(`    ├─ Architecture: ${manifest.architecture} (${manifest.theming})`);
    console.log(`    ├─ Providers:    ${(manifest.providers || []).join(', ')}`);
    console.log(`    └─ Platforms:    ${(manifest.platforms || []).join(', ')}\n`);
  }
  return bricks;
}

export function resolveRequestedPlatforms(platformsArg, supported = ['web', 'ios', 'android']) {
  if (!platformsArg) return [...supported];
  const requested = String(platformsArg)
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p) => supported.includes(p));
  return requested.length > 0 ? [...new Set(requested)] : ['web'];
}

export async function installOrUpgradeBrick({
  pkgRoot,
  targetDir,
  brickName = 'user-profile',
  platformsArg = null,
  withSchema = false,
  isUpgrade = false,
}) {
  const sourceBrickDir = path.join(pkgRoot, 'bricks', brickName);
  const manifestPath = path.join(sourceBrickDir, 'brick.json');
  if (!fsSync.existsSync(manifestPath)) {
    throw new Error(`Brick "${brickName}" not found at ${sourceBrickDir}`);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const isSelfRepo = path.resolve(targetDir) === path.resolve(pkgRoot);

  // Determine existing installed platforms on upgrade if --platforms wasn't explicitly passed
  const destBrickDir = path.join(targetDir, 'bricks', brickName);
  let selectedPlatforms = resolveRequestedPlatforms(platformsArg, manifest.platforms);
  if (isUpgrade && !platformsArg && fsSync.existsSync(path.join(destBrickDir, 'brick.json'))) {
    try {
      const existingManifest = JSON.parse(fsSync.readFileSync(path.join(destBrickDir, 'brick.json'), 'utf8'));
      if (Array.isArray(existingManifest.installedPlatforms) && existingManifest.installedPlatforms.length > 0) {
        selectedPlatforms = existingManifest.installedPlatforms;
      }
    } catch {}
  }

  console.log(
    `\n🧱 Antigravity Brick Engine — ${isUpgrade ? 'Upgrading' : 'Installing'} ${manifest.name}@${manifest.version}`
  );
  console.log(`📍 Target Directory: ${targetDir}`);
  console.log(`🎯 Selected Platforms: ${selectedPlatforms.join(', ')}`);

  if (!isSelfRepo) {
    await fs.mkdir(destBrickDir, { recursive: true });
    // Copy core, testing, and adapters/templates
    for (const subdir of ['core', 'testing', 'adapters']) {
      const srcSub = path.join(sourceBrickDir, subdir);
      if (fsSync.existsSync(srcSub)) {
        await copyDirRecursive(srcSub, path.join(destBrickDir, subdir));
      }
    }

    // Copy ONLY selected platforms (remove unselected platform directories if present)
    const destPlatformsRoot = path.join(destBrickDir, 'platforms');
    await fs.mkdir(destPlatformsRoot, { recursive: true });
    for (const p of manifest.platforms || ['web', 'ios', 'android']) {
      const srcPlat = path.join(sourceBrickDir, 'platforms', p);
      const destPlat = path.join(destPlatformsRoot, p);
      if (selectedPlatforms.includes(p)) {
        if (fsSync.existsSync(srcPlat)) {
          await copyDirRecursive(srcPlat, destPlat);
          console.log(`  ✓ Installed platform module: bricks/${brickName}/platforms/${p}/`);
        }
      } else if (fsSync.existsSync(destPlat)) {
        await fs.rm(destPlat, { recursive: true, force: true });
      }
    }

    // Optionally provision canonical SQL & Prisma schemas
    if (withSchema && fsSync.existsSync(path.join(sourceBrickDir, 'schemas'))) {
      await copyDirRecursive(path.join(sourceBrickDir, 'schemas'), path.join(destBrickDir, 'schemas'));
      console.log(`  ✓ Provisioned greenfield schemas in bricks/${brickName}/schemas/`);
    }

    const installedManifest = {
      ...manifest,
      installedPlatforms: selectedPlatforms,
      installedAt: new Date().toISOString(),
    };
    await fs.writeFile(
      path.join(destBrickDir, 'brick.json'),
      JSON.stringify(installedManifest, null, 2) + '\n',
      'utf8'
    );
  } else {
    console.log('  ↷ Self-repository detected: preserving upstream bricks/user-profile/ in place.');
  }

  // Non-destructively scaffold consumer adapters in src/adapters/ (ONLY if missing, preserving custom branding!)
  if (!isSelfRepo && manifest.adapterTemplates) {
    for (const [key, tpl] of Object.entries(manifest.adapterTemplates)) {
      const srcTpl = path.join(sourceBrickDir, tpl.source);
      const destAdapter = path.join(targetDir, tpl.target);
      if (!fsSync.existsSync(destAdapter) && fsSync.existsSync(srcTpl)) {
        await fs.mkdir(path.dirname(destAdapter), { recursive: true });
        await fs.copyFile(srcTpl, destAdapter);
        console.log(`  ✓ Scaffolded starter ${key} adapter: ${tpl.target}`);
      } else if (fsSync.existsSync(destAdapter)) {
        console.log(`  🛡️ Preserved existing host adapter: ${tpl.target}`);
      }
    }
  }

  // Install progressive-disclosure rule `.agents/rules/brick-user-profile.md`
  const rulesDir = path.join(targetDir, '.agents', 'rules');
  await fs.mkdir(rulesDir, { recursive: true });
  const brickRulePath = path.join(rulesDir, `brick-${brickName}.md`);
  const brickRuleContent = `---
trigger: model_decision
description: "Apply whenever modifying authentication, OAuth login (Google, Facebook, Apple, Microsoft), user profile settings, avatars, or branding for the ${brickName} brick."
---
# Brick Directive: \`bricks/${brickName}\` (${manifest.version})

- **Installed Platforms**: \`${selectedPlatforms.join(', ')}\`
- **3-Tier Pluggable UX/UI & Branding Architecture**:
  - **Tier A — Headless Hooks (\`bricks/${brickName}/platforms/*/headless/\`)**: 100% shared state, validation, OAuth triggers (\`useSocialAuth()\`), avatar upload (\`useAvatarUploader()\`), and account-linking (\`useUserProfile()\`). Zero CSS/colors/fonts.
  - **Tier B — Token-Driven Default Shell (\`bricks/${brickName}/platforms/*/themed-ui/\`)**: Consumes \`<ProfileThemeProvider slots={customSlots} theme={hostTheme}>\` via \`ProfileBrandThemePort\` & \`ProfileUISlotsPort\` (e.g. \`slots={{ CardWrapper: MyCustomCard }}\`).
  - **Tier C — Host Brand Adapter (\`src/adapters/user-profile-theme.adapter.ts\`)**: 100% isolated per repo. Reads \`docs/BRAND_BOOK.md\` / \`docs/UX_BRIEF.md\`. For future UI redesigns, attach the mockup (\`npm run backlog attach <ID> <zip>\`), run \`/backlog-plan <ID>\`, and update ONLY \`src/adapters/user-profile-theme.adapter.ts\` or \`slots={{ ... }}\`—leaving all 4 OAuth logins, security logic, and DB adapters untouched.
`;
  if (!isSelfRepo) {
    await fs.writeFile(brickRulePath, brickRuleContent, 'utf8');
    console.log(`  ✓ Installed progressive-disclosure rule: .agents/rules/brick-${brickName}.md`);
  }

  // Sync required OAuth environment keys to `.env.example` if not self-repo
  if (!isSelfRepo && manifest.envContract) {
    const envExamplePath = path.join(targetDir, '.env.example');
    let existingEnv = fsSync.existsSync(envExamplePath)
      ? await fs.readFile(envExamplePath, 'utf8')
      : '';
    const allKeys = Object.values(manifest.envContract).flat();
    const missingKeys = allKeys.filter((k) => !new RegExp(`^${k}=`, 'm').test(existingEnv));
    if (missingKeys.length > 0) {
      const block = `\n# ─── Brick: ${manifest.name}@${manifest.version} OAuth & Profile Contract ───\n` +
        missingKeys.map((k) => `${k}=`).join('\n') + '\n';
      await fs.writeFile(envExamplePath, existingEnv + block, 'utf8');
      console.log(`  ✓ Appended ${missingKeys.length} OAuth contract keys to .env.example`);
    }
  }

  return {
    brickName: manifest.name,
    version: manifest.version,
    selectedPlatforms,
  };
}

export function runBrickDoctor({ pkgRoot, targetDir, brickName = 'user-profile' }) {
  const localManifestPath = path.join(targetDir, 'bricks', brickName, 'brick.json');
  const upstreamManifestPath = path.join(pkgRoot, 'bricks', brickName, 'brick.json');
  const manifestPath = fsSync.existsSync(localManifestPath) ? localManifestPath : upstreamManifestPath;

  if (!fsSync.existsSync(manifestPath)) {
    throw new Error(`Brick "${brickName}" is not installed in ${targetDir}`);
  }

  const manifest = JSON.parse(fsSync.readFileSync(manifestPath, 'utf8'));
  const platforms = manifest.installedPlatforms || manifest.platforms || ['web'];

  console.log(`\n🩺 Antigravity Brick Doctor — ${manifest.name}@${manifest.version}`);
  console.log(`📍 Workspace: ${targetDir}`);
  console.log(`🎯 Active Platforms: ${platforms.join(', ')}\n`);

  const checks = [];
  const coreEntry = path.join(
    fsSync.existsSync(localManifestPath) ? path.dirname(localManifestPath) : path.dirname(upstreamManifestPath),
    manifest.entrypoints.core
  );
  checks.push({
    label: 'Hexagonal Core & OAuth Verifiers (`core/index.ts`)',
    ok: fsSync.existsSync(coreEntry),
  });

  for (const p of platforms) {
    const platDir = path.join(
      fsSync.existsSync(localManifestPath) ? path.dirname(localManifestPath) : path.dirname(upstreamManifestPath),
      'platforms',
      p
    );
    checks.push({
      label: `Platform Headless + Themed UI (\`platforms/${p}/{headless,themed-ui}\`)`,
      ok:
        fsSync.existsSync(path.join(platDir, 'headless')) &&
        fsSync.existsSync(path.join(platDir, 'themed-ui')),
    });
  }

  for (const c of checks) {
    console.log(`  ${c.ok ? '✅' : '❌'} ${c.label}`);
  }

  const allOk = checks.every((c) => c.ok);
  console.log(allOk ? '\n✨ Brick Doctor passed with 0 structural issues!\n' : '\n⚠️ Brick Doctor found missing components.\n');
  return { ok: allOk, checks };
}
