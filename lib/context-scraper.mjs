/**
 * Antigravity Memory Bank — Historical Context & Conversation Scraper
 *
 * Scrapes prior context from:
 * 1. Antigravity conversation transcripts (~/.gemini/antigravity/brain)
 * 2. Project documentation (docs/*.md, README.md, MIGRATION_BOARD.md, DESIGN.md)
 * 3. Git commit log (feat, fix, docs, tags)
 *
 * Automatically populates the new Memory Bank baseline with real project context.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { createReadStream } from 'node:fs';
import { execSync } from 'node:child_process';

export async function scrapeHistoricalContext(targetDir, projectName) {
  console.log('🔍 Scraping prior project history, documentation, and conversation transcripts...');

  const result = {
    tagline: '',
    summary: '',
    recentAccomplishments: [],
    resolvedBugs: [],
    pendingTasks: [],
    completedMilestones: [],
    architectureNotes: [],
    scrapedConversationsCount: 0,
    scrapedDocsCount: 0,
    scrapedCommitsCount: 0,
  };

  const projectBaseName = path.basename(targetDir);
  const targetLower = targetDir.toLowerCase();
  const nameLower = (projectName || projectBaseName).toLowerCase();

  // -------------------------------------------------------------
  // 1. Scrape Git Commit History
  // -------------------------------------------------------------
  try {
    const gitLogRaw = execSync('git log -n 35 --pretty=format:"%h|%s|%ad" --date=short', {
      cwd: targetDir,
      stdio: 'pipe',
    }).toString().trim();

    if (gitLogRaw) {
      const lines = gitLogRaw.split('\n');
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 2) {
          const hash = parts[0];
          const msg = parts[1].trim();
          result.scrapedCommitsCount++;

          if (msg.startsWith('feat') || msg.startsWith('add ') || msg.startsWith('implement ')) {
            result.recentAccomplishments.push(`${msg} (${hash})`);
            result.completedMilestones.push(msg.replace(/^feat(\([^)]+\))?:\s*/i, ''));
          } else if (msg.startsWith('fix') || msg.includes('BUG-') || msg.includes('fix(')) {
            result.resolvedBugs.push(`${msg} (${hash})`);
            result.recentAccomplishments.push(`${msg} (${hash})`);
          } else if (!msg.startsWith('chore(memory)')) {
            result.recentAccomplishments.push(`${msg} (${hash})`);
          }
        }
      }
    }
  } catch {}

  // -------------------------------------------------------------
  // 2. Scrape Documentation Files (docs/, README.md, MIGRATION_BOARD.md, DESIGN.md)
  // -------------------------------------------------------------
  try {
    // README.md
    const readmePath = path.join(targetDir, 'README.md');
    try {
      const readme = await fs.readFile(readmePath, 'utf8');
      result.scrapedDocsCount++;
      const lines = readme.split('\n').map((l) => l.trim()).filter(Boolean);
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        if (line.startsWith('# ') && !result.summary) {
          result.summary = line.replace(/^#\s+/, '').trim();
        } else if (line.length > 20 && !line.startsWith('[') && !line.startsWith('<') && !result.tagline) {
          result.tagline = line.replace(/[*_#]/g, '').trim();
        }
      }
    } catch {}

    // Scan docs/ folder
    const docsDir = path.join(targetDir, 'docs');
    try {
      const docEntries = await fs.readdir(docsDir, { withFileTypes: true });
      for (const entry of docEntries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          result.scrapedDocsCount++;
          const content = await fs.readFile(path.join(docsDir, entry.name), 'utf8');
          // Check for bug records or decisions
          if (entry.name.toLowerCase().includes('bug') || content.includes('BUG-')) {
            const bugMatches = content.match(/(?:BUG-\d+|FIX-\d+|SAFEGUARD-\d+)[^:\n]*:[^\n]+/g);
            if (bugMatches) {
              for (const bm of bugMatches.slice(0, 5)) {
                if (!result.resolvedBugs.includes(bm.trim())) {
                  result.resolvedBugs.push(bm.trim());
                }
              }
            }
          }
          if (entry.name.toLowerCase().includes('arch') || entry.name.toLowerCase().includes('design')) {
            const h2Matches = content.match(/^##\s+[^\n]+/gm);
            if (h2Matches) {
              result.architectureNotes.push(...h2Matches.slice(0, 4).map((h) => h.replace(/^##\s+/, '')));
            }
          }
        }
      }
    } catch {}

    // Check MIGRATION_BOARD.md or DESIGN.md
    for (const specialDoc of ['MIGRATION_BOARD.md', 'DESIGN.md']) {
      try {
        const content = await fs.readFile(path.join(targetDir, specialDoc), 'utf8');
        result.scrapedDocsCount++;
        const completedMatches = content.match(/[-*]\s+\[x\]\s+([^\n]+)/gi);
        if (completedMatches) {
          for (const m of completedMatches.slice(0, 4)) {
            const item = m.replace(/[-*]\s+\[x\]\s+/i, '').trim();
            if (!result.completedMilestones.includes(item)) result.completedMilestones.push(item);
          }
        }
        const pendingMatches = content.match(/[-*]\s+\[\s\]\s+([^\n]+)/gi);
        if (pendingMatches) {
          for (const m of pendingMatches.slice(0, 4)) {
            const item = m.replace(/[-*]\s+\[\s\]\s+/i, '').trim();
            if (!result.pendingTasks.includes(item)) result.pendingTasks.push(item);
          }
        }
      } catch {}
    }
  } catch {}

  // -------------------------------------------------------------
  // 3. Scrape Antigravity Brain Conversation Transcripts
  // -------------------------------------------------------------
  const brainDir = path.join(os.homedir(), '.gemini/antigravity/brain');
  try {
    const convDirs = await fs.readdir(brainDir, { withFileTypes: true });

    for (const d of convDirs) {
      if (!d.isDirectory()) continue;
      const transcriptPath = path.join(brainDir, d.name, '.system_generated/logs/transcript.jsonl');
      try {
        await fs.access(transcriptPath);

        const rl = readline.createInterface({
          input: createReadStream(transcriptPath),
          crlfDelay: Infinity,
        });

        let isMatch = false;
        const candidateUserRequests = [];

        for await (const line of rl) {
          if (!isMatch && (line.includes(targetDir) || line.includes(targetLower) || line.includes(projectName) || line.includes(nameLower))) {
            isMatch = true;
          }

          if (line.includes('"type":"USER_INPUT"')) {
            try {
              const data = JSON.parse(line);
              let text = String(data.content || '').replace(/<[^>]+>/g, '').trim();
              if (text && !text.startsWith('/start') && !text.startsWith('/update-memory') && text.length > 15) {
                // Remove timestamp and system metadata
                text = text.split('\nThe current local time is:')[0].trim();
                candidateUserRequests.push(text);
              }
            } catch {}
          }
        }

        if (isMatch && candidateUserRequests.length > 0) {
          result.scrapedConversationsCount++;
          // Take the most recent user requests as context
          const recentRequests = candidateUserRequests.slice(-4);
          for (const req of recentRequests) {
            const firstSentence = req.split('\n')[0].slice(0, 140);
            if (!result.pendingTasks.includes(firstSentence)) {
              result.pendingTasks.push(firstSentence);
            }
          }
        }
      } catch {}
    }
  } catch {}

  // Deduplicate and trim lists to fit within token line budgets
  result.recentAccomplishments = Array.from(new Set(result.recentAccomplishments)).slice(0, 6);
  result.resolvedBugs = Array.from(new Set(result.resolvedBugs)).slice(0, 5);
  result.completedMilestones = Array.from(new Set(result.completedMilestones)).slice(0, 5);
  result.pendingTasks = Array.from(new Set(result.pendingTasks)).slice(0, 4);

  console.log(`  ✓ Scraped ${result.scrapedCommitsCount} git commits`);
  console.log(`  ✓ Scraped ${result.scrapedDocsCount} documentation files`);
  console.log(`  ✓ Scraped ${result.scrapedConversationsCount} Antigravity conversation transcripts`);

  return result;
}
