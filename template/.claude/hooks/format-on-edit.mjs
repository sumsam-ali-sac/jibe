#!/usr/bin/env node
// PostToolUse hook (Edit|Write): best-effort auto-FORMAT of the file Claude just changed.
//
// - Formatting only. No lint autofix here: e.g. `ruff check --fix` would delete an import
//   that the very next edit is about to use. Lint fixes happen in /ship.
// - Finds the formatter by walking UP from the edited file to the project root, so
//   monorepos work (backend/.venv, frontend/node_modules).
// - Runs node-based formatters through their JS entry with this Node binary (no .cmd shims,
//   which Node refuses to spawn without a shell on Windows).
// - Never blocks: always exits 0.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TIMEOUT_MS = 45_000;
let filePath = '';
try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  filePath = String(input?.tool_input?.file_path ?? input?.tool_response?.filePath ?? '');
} catch {
  process.exit(0);
}
if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) process.exit(0);

const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const file = path.resolve(filePath);
const rel = path.relative(root, file);
if (rel.startsWith('..') || path.isAbsolute(rel)) process.exit(0); // outside the project

// Directories from the file's folder up to (and including) the project root.
function dirsUp() {
  const out = [];
  let d = path.dirname(file);
  while (true) {
    out.push(d);
    if (path.relative(root, d) === '' || d === path.dirname(d)) break;
    d = path.dirname(d);
  }
  return out;
}

function run(cmd, args, cwd) {
  spawnSync(cmd, args, { cwd, stdio: 'ignore', timeout: TIMEOUT_MS, windowsHide: true });
}

function onPath(cmd) {
  const r = spawnSync(cmd, ['--version'], { stdio: 'ignore', timeout: 5_000, windowsHide: true });
  return r.status === 0;
}

// Executable inside a virtualenv next to (or above) the file.
function venvTool(name) {
  for (const d of dirsUp()) {
    for (const venv of ['.venv', 'venv', 'env']) {
      for (const candidate of [path.join(d, venv, 'Scripts', `${name}.exe`), path.join(d, venv, 'bin', name)]) {
        if (existsSync(candidate)) return { bin: candidate, cwd: d };
      }
    }
  }
  return null;
}

// JS entry point of a node package's bin, e.g. prettier -> node_modules/prettier/bin/prettier.cjs
function nodeTool(pkgName, binName) {
  for (const d of dirsUp()) {
    const pkgJson = path.join(d, 'node_modules', pkgName, 'package.json');
    if (!existsSync(pkgJson)) continue;
    try {
      const pkg = JSON.parse(readFileSync(pkgJson, 'utf8'));
      const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[binName];
      if (!bin) continue;
      const entry = path.join(d, 'node_modules', pkgName, bin);
      if (existsSync(entry)) return { entry, cwd: d };
    } catch { /* ignore broken package.json */ }
  }
  return null;
}

const ext = path.extname(file).toLowerCase();

if (['.py', '.pyi'].includes(ext)) {
  const ruff = venvTool('ruff');
  if (ruff) run(ruff.bin, ['format', '--quiet', file], ruff.cwd);
  else if (onPath('ruff')) run('ruff', ['format', '--quiet', file], path.dirname(file));
  else {
    const black = venvTool('black');
    if (black) run(black.bin, ['--quiet', file], black.cwd);
    else if (onPath('black')) run('black', ['--quiet', file], path.dirname(file));
  }
} else if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.json', '.css', '.scss', '.md', '.mdx', '.html', '.yaml', '.yml'].includes(ext)) {
  const biome = nodeTool('@biomejs/biome', 'biome');
  const prettier = nodeTool('prettier', 'prettier');
  if (biome) run(process.execPath, [biome.entry, 'format', '--write', file], biome.cwd);
  else if (prettier) run(process.execPath, [prettier.entry, '--write', '--log-level', 'silent', file], prettier.cwd);
}
process.exit(0);
