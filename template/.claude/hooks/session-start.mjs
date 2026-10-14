#!/usr/bin/env node
// SessionStart hook: prints a short snapshot that is added to Claude's context:
// git branch, uncommitted files, recent commits, and a reminder if CLAUDE.md still
// has unfilled TODO(setup) markers. Keep the output small.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

try { readFileSync(0); } catch { /* no stdin */ }
const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const lines = [];

function git(args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', timeout: 5_000, windowsHide: true });
  return r.status === 0 ? r.stdout.trim() : null;
}

if (git(['rev-parse', '--is-inside-work-tree']) === 'true') {
  const branch = git(['branch', '--show-current']) || '(detached HEAD)';
  const changes = (git(['status', '--porcelain']) || '').split('\n').filter(Boolean);
  const recent = (git(['log', '--oneline', '-5']) || '').split('\n').filter(Boolean);
  lines.push('Git snapshot at session start:', `- Branch: ${branch}`, `- Uncommitted files: ${changes.length}`);
  changes.slice(0, 10).forEach((c) => lines.push(`    ${c}`));
  if (recent.length) {
    lines.push('- Recent commits:');
    recent.forEach((c) => lines.push(`    ${c}`));
  }
}

const claudeMd = path.join(root, 'CLAUDE.md');
if (existsSync(claudeMd)) {
  const todos = (readFileSync(claudeMd, 'utf8').match(/TODO\(setup\)/g) || []).length;
  if (todos > 0) {
    lines.push(`- CLAUDE.md still has ${todos} unfilled TODO(setup) markers. Tell the user once, and suggest running /adapt-setup (or see the SETUP-GUIDE).`);
  }
}
for (const name of ['CLAUDE.starter.md', path.join('.claude', 'settings.starter.json')]) {
  if (existsSync(path.join(root, name))) lines.push(`- ${name} is waiting to be merged: suggest running /adapt-setup.`);
}

if (lines.length) process.stdout.write(lines.join('\n') + '\n');
process.exit(0);
