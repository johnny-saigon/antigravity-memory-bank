name: Memory Bank Verification & Context Sync

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  audit-and-sync:
    name: Audit Line Budget & Sync Context
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Audit Memory Bank Token Budget (< 150 lines)
        run: |
          if [ -f "scripts/lint-memory.mjs" ]; then
            node scripts/lint-memory.mjs
          fi

      - name: Sync Memory Context on Push to Main
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          if [ -f "scripts/sync-memory-context.mjs" ]; then
            node scripts/sync-memory-context.mjs
            git config --global user.name "github-actions[bot]"
            git config --global user.email "github-actions[bot]@users.noreply.github.com"
            git add memory-bank/
            if ! git diff --cached --quiet; then
              git commit -m "docs(memory): auto-sync context from main push [skip ci]"
              git push
            fi
          fi
