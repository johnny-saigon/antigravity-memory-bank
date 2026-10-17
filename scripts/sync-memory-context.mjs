#!/usr/bin/env node

/**
 * Antigravity Memory Bank — Incremental Context Synchronizer
 * Automatically synchronizes git commit history and bug fixes into:
 * - memory-bank/progress.md (Recent Accomplishments)
 * - memory-bank/activeContext.md (Current Sprint Focus & Sync State)
 *
 * Can be run manually, via `post-commit` git hooks, or in CI pipelines.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const targetDir = process.cwd();
const memoryBankDir = path.join(targetDir, 'memory-bank');

const args = process.argv.slice(2);
const isQuiet = args.includes('--quiet') || args.includes('-q');
const autoCommit = args.includes('--commit');

function log(...messages) {
  if (!isQuiet) console.log(...messages);
}

async function runSync() {
  try {
    // 1. Verify memory-bank exists
    try {
      await fs.access(memoryBankDir);
    } catch {
      log('ℹ️ No memory-bank directory found, skipping sync.');
      return;
    }

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
    } catch {
      log('ℹ️ Not a git repository or no commits found.');
      return;
    }

    // Prevent recursive loop on memory commits
    if (
      lastCommitMsg.startsWith('docs(memory)') ||
      lastCommitMsg.startsWith('chore(memory)') ||
      lastCommitMsg.startsWith('chore(sync)')
    ) {
      log('ℹ️ Last commit is already a memory sync commit. Skipping.');
      return;
    }

    log(`🔄 Auto-syncing memory context with commit [${lastCommitHash}] ${lastCommitMsg}...`);

    // 3. Extract recent commits (last 10)
    let recentCommits = [];
    try {
      const recentLog = execSync('git log -n 10 --pretty=format:"%h|%s"', {
        cwd: targetDir,
        stdio: 'pipe',
      }).toString().trim();

      const lines = recentLog.split('\n');
      for (const line of lines) {
        const [hash, msg] = line.split('|');
        if (!msg) continue;
        if (
          msg.startsWith('docs(memory)') ||
          msg.startsWith('chore(memory)') ||
          msg.startsWith('chore(sync)')
        ) {
          continue;
        }
        recentCommits.push(`- **${msg}** (\`${hash}\`)`);
      }
    } catch {}

    // 4. Update memory-bank/activeContext.md if present
    const activeContextPath = path.join(memoryBankDir, 'activeContext.md');
    try {
      let content = await fs.readFile(activeContextPath, 'utf8');

      // Update Last Synchronized Commit in Active Context
      const syncStamp = `- **Last Synchronized Commit**: \`${lastCommitHash}\` — "${lastCommitMsg}" (${new Date().toISOString().split('T')[0]})`;
      if (content.includes('**Last Synchronized Commit**:')) {
        content = content.replace(/- \*\*Last Synchronized Commit\*\*:[^\n]+/g, syncStamp);
      }

      // If ## 2. Recent Technical Decisions & Accomplishments exists, update items
      const recentHeader = '## 2. Recent Technical Decisions & Accomplishments';
      if (content.includes(recentHeader) && recentCommits.length > 0) {
        const top5 = recentCommits.slice(0, 5).join('\n');
        const nextSectionMatch = content.slice(content.indexOf(recentHeader)).search(/\n##\s/);
        
        if (nextSectionMatch !== -1) {
          const before = content.slice(0, content.indexOf(recentHeader) + recentHeader.length);
          const after = content.slice(content.indexOf(recentHeader) + nextSectionMatch);
          content = `${before}\n${top5}\n${after}`;
        }
      }

      await fs.writeFile(activeContextPath, content, 'utf8');
      log('  ✓ Updated memory-bank/activeContext.md');
    } catch {}

    // 5. Update memory-bank/progress.md if present
    const progressPath = path.join(memoryBankDir, 'progress.md');
    try {
      let content = await fs.readFile(progressPath, 'utf8');

      // If ## 1. Milestone Tracking or Checklist exists, ensure latest accomplishments are logged
      const featCommits = recentCommits.filter((c) =>
        c.includes('feat') || c.includes('fix') || c.includes('add') || c.includes('implement')
      );

      if (content.includes('## 1. Milestone Tracking') && featCommits.length > 0) {
        const header = '## 1. Milestone Tracking';
        const topItems = featCommits.slice(0, 6).join('\n');
        const nextMatch = content.slice(content.indexOf(header)).search(/\n##\s/);
        if (nextMatch !== -1) {
          const before = content.slice(0, content.indexOf(header) + header.length);
          const after = content.slice(content.indexOf(header) + nextMatch);
          content = `${before}\n${topItems}\n${after}`;
        }
      }

      await fs.writeFile(progressPath, content, 'utf8');
      log('  ✓ Updated memory-bank/progress.md');
    } catch {}

    // 6. Run line budget audit to guarantee < 150 lines
    const linterPath = path.join(targetDir, 'scripts/lint-memory.mjs');
    try {
      await fs.access(linterPath);
      execSync('node scripts/lint-memory.mjs', { cwd: targetDir, stdio: isQuiet ? 'ignore' : 'inherit' });
    } catch {}

    // 7. Auto-commit if requested
    if (autoCommit) {
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
    console.error('⚠️ Warning during memory sync:', err.message);
  }
}

runSync();
