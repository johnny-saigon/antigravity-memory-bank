# antigravity-memory-bank — Infrastructure Invariants

## 1. Package & Distribution Invariants
- **Zero External Dependencies**: Must run out-of-the-box via `npx github:johnny-saigon/antigravity-memory-bank` using only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:http`, `node:readline`).
- **Verification Command**: `npm test` (`node scripts/lint-memory.mjs`) must pass with 0 violations (`< 150 lines` across both `memory-bank/` and `templates/memory-bank/`).
- **Local Live Server Port**: `node scripts/backlog.mjs serve` defaults to `http://127.0.0.1:4199`.

## 2. Dogfooding & Upstream Isolation Boundaries
- **Package Whitelist (`"files"`)**: `package.json` strictly restricts published package contents to `bin/`, `lib/`, `rules/`, `scripts/`, `skills/`, `templates/`, `plugin.json`, and `install.sh`, excluding dogfood files (`memory-bank/`, `docs/`, `.agents/`, `AGENTS.md`).
- **Self-Repository Guard (`isSelfRepo`)**: `bin/cli.mjs` detects when running inside `antigravity-memory-bank` itself to prevent self-overwriting or deleting upstream scripts in `scripts/`.
- **Ephemeral HTML Ignore**: `docs/backlog.html` and `memory-backups/` are git-ignored; `docs/backlog.json` and `docs/BACKLOG.md` remain tracked.
- **Generic Upstream Templates**: Never hardcode downstream project names or private host IPs inside `bin/`, `skills/`, `rules/`, or `templates/`. Keep `scripts/backlog.mjs` and `templates/scripts/backlog.mjs` byte-identical.
