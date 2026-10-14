#!/usr/bin/env node
// PreToolUse hook (Bash|PowerShell): blocks destructive, history-rewriting or publishing commands.
// Exit 2 = block (stderr is shown to Claude). Exit 0 = no opinion; the normal permission flow applies.
// Tune RULES for your project. Requires Node 20+.
import { readFileSync } from 'node:fs';

let command = '';
try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  command = String(input?.tool_input?.command ?? '');
} catch {
  process.exit(0);
}
if (!command.trim()) process.exit(0);

const RULES = [
  [/\brm\s+-[a-z]*r[a-z]*\s+(\/|~|\*|\.|\$HOME)(\s|$|\/\s|\/\*)/i, 'recursive delete of a root, home or whole-directory path'],
  [/Remove-Item\b.*-Recurse\b.*\s(C:\\?|~|\$HOME|\$env:USERPROFILE|\.|\*)(\s|$)/i, 'recursive delete of a root, home or whole-directory path'],
  [/\bgit\s+push\b.*(--force(?!-with-lease)|\s-f(\s|$))/i, 'force push (use --force-with-lease on your own branch, and ask the user first)'],
  [/\bgit\s+reset\s+--hard\b/i, 'git reset --hard discards work; ask the user to run it'],
  [/\bgit\s+clean\s+-[a-z]*f/i, 'git clean -f deletes untracked files; ask the user to run it'],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, 'discards all uncommitted changes; ask the user to run it'],
  [/\bgit\s+branch\s+(-D\b|.*--delete\s+--force\b|.*--force\s+--delete\b)/, 'force-deleting a branch; ask the user to run it'], // case-sensitive: -d is safe
  [/\bgit\s+(commit|push|merge|rebase|am|cherry-pick)\b.*\s--no-verify\b/i, 'skipping git hooks is not allowed; fix the hook failure instead'],
  [/\b(psql|mysql|sqlite3|sqlcmd|mongosh)\b.*\b(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE)\b/i, 'destructive SQL; ask the user to run it'],
  [/\balembic\b.*\bdowngrade\s+base\b/i, 'downgrading all migrations wipes the schema; ask the user to run it'],
  [/\bdocker\s+(system|volume)\s+prune\b|\bdocker\s+volume\s+rm\b/i, 'deletes docker volumes/data; ask the user to run it'],
  [/\b(npm|pnpm|yarn|bun)\s+publish\b|\b(twine|uv)\s+(upload|publish)\b/i, 'publishing a package; ask the user to run it'],
  [/\bvercel\b.*(--prod\b|\bdeploy\b)|\b(fly|railway|heroku)\b.*\bdeploy\b/i, 'deploying; ask the user to run it'],
  [/\b(mkfs|Format-Volume|diskpart)\b|\bdd\s+if=/i, 'disk-level operation'],
  [/\bchmod\s+-R\s+777\b/i, 'world-writable permissions'],
  [/\b(curl|wget|iwr|Invoke-WebRequest)\b[^|]*\|\s*(sh|bash|zsh|iex|Invoke-Expression)\b/i, 'piping a download straight into a shell'],
];

for (const [re, why] of RULES) {
  if (re.test(command)) {
    process.stderr.write(`Blocked by .claude/hooks/block-dangerous.mjs: ${why}. Command: ${command}\n`);
    process.exit(2);
  }
}
process.exit(0);
