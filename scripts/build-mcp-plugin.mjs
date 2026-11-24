#!/usr/bin/env node
/**
 * Builds the zero-runtime-dependency Antigravity Memory Bank MCP App Plugin bundle:
 *   1. mcp/src/server.mjs  -> mcp/dist/server.mjs (Node ESM bundle with @modelcontextprotocol/sdk + ext-apps + zod)
 *   2. mcp/src/ui/app.ts   -> mcp/dist/app.html   (Single-file CSP-safe SEP-1865 MCP App HTML)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'mcp', 'dist');

fs.mkdirSync(distDir, { recursive: true });

// 1. Bundle MCP stdio server (zero runtime node_modules required when installed in ~/.gemini/config/plugins/)
await esbuild.build({
  entryPoints: [path.join(repoRoot, 'mcp', 'src', 'server.mjs')],
  outfile: path.join(distDir, 'server.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  sourcemap: false,
  minify: false,
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire as __agmbCreateRequire } from 'node:module';\nconst require = __agmbCreateRequire(import.meta.url);"
  }
});

try {
  fs.chmodSync(path.join(distDir, 'server.mjs'), 0o755);
} catch {}

// 2. Bundle MCP App client UI into a single self-contained HTML file (CSP default-src 'none' compliant)
const uiBuild = await esbuild.build({
  entryPoints: [path.join(repoRoot, 'mcp', 'src', 'ui', 'app.ts')],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2022'],
  minify: true,
  write: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

const bundledJs = uiBuild.outputFiles[0].text.replace(/<\/script>/gi, '<\\/script>');
const stylesPath = path.join(repoRoot, 'mcp', 'src', 'ui', 'styles.css');
const stylesCss = fs.existsSync(stylesPath) ? fs.readFileSync(stylesPath, 'utf8') : '';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Antigravity Memory Bank</title>
  <style>${stylesCss}</style>
</head>
<body>
  <div id="app" class="mb-root">
    <div class="mb-boot">
      <div class="mb-spinner"></div>
      <span>Connecting to Antigravity Memory Bank MCP App...</span>
    </div>
  </div>
  <script>${bundledJs}</script>
</body>
</html>
`;

const htmlOutPath = path.join(distDir, 'app.html');
fs.writeFileSync(htmlOutPath, html, 'utf8');

const serverBytes = fs.statSync(path.join(distDir, 'server.mjs')).size;
const htmlBytes = fs.statSync(htmlOutPath).size;
if (htmlBytes > 10 * 1024 * 1024) {
  throw new Error(`mcp/dist/app.html exceeds 10 MiB SEP-1865 limit (${htmlBytes} bytes)`);
}

console.log(`✅ Built MCP App Plugin bundle:`);
console.log(`   - mcp/dist/server.mjs (${(serverBytes / 1024).toFixed(1)} KB)`);
console.log(`   - mcp/dist/app.html   (${(htmlBytes / 1024).toFixed(1)} KB, single-file CSP-safe)`);
