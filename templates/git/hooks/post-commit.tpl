#!/bin/sh
# Antigravity Memory Bank — Incremental Context Sync Hook
# Automatically updates memory-bank/progress.md and memory-bank/activeContext.md
# on every commit, without failing the commit.

# Prevent recursion if commit was a memory sync
LAST_MSG=$(git log -1 --pretty=%B 2>/dev/null || true)
if echo "$LAST_MSG" | grep -q "docs(memory):"; then
  exit 0
fi

# Run incremental memory sync if script exists
if [ -f "scripts/sync-memory-context.mjs" ]; then
  node scripts/sync-memory-context.mjs --quiet || true
fi
