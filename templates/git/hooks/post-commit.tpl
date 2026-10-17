#!/bin/sh
# Antigravity Memory Bank — Incremental Context Sync Hook
# Automatically updates memory-bank/progress.md and memory-bank/activeContext.md
# on every commit, without failing the commit.

# Skip during rebase, cherry-pick, or merge to prevent conflict locks
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -f ".git/CHERRY_PICK_HEAD" ] || [ -f ".git/MERGE_HEAD" ]; then
  exit 0
fi

# Prevent recursion if commit was a memory sync
LAST_MSG=$(git log -1 --pretty=%B 2>/dev/null || true)
if echo "$LAST_MSG" | grep -q "docs(memory):"; then
  exit 0
fi

# Run incremental memory sync if script exists
if [ -f "scripts/sync-memory-context.mjs" ]; then
  node scripts/sync-memory-context.mjs --quiet || true
fi
