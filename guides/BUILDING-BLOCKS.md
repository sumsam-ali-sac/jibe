# Building blocks: write your own agents, skills, rules and hooks

Copy-paste skeletons with the fields that matter. The full reference is in the [docs](https://code.claude.com/docs/en/skills).

---

## Subagent: `.claude/agents/<name>.md`

```markdown
---
name: perf-auditor                     # required; no ":" allowed
description: Finds performance problems (N+1 queries, hot loops, large payloads). Use when an endpoint or job is slow.
tools: Read, Grep, Glob, Bash          # comma-separated; omit = inherit all
model: sonnet                          # haiku | sonnet | opus | inherit | full model id
color: orange                          # optional
# permissionMode: plan                 # read-only planning agents
# skills: [api-conventions]            # preload skills into its context
# isolation: worktree                  # work in a throwaway git worktree
# maxTurns: 30
---

You are ... (the system prompt: role, process, report format, hard rules).
```

**Tips**
- The description is the trigger. Write *when* to use it ("Use when..."). Add "use proactively" only for 1-2 agents.
- Choose the model per job: **haiku** for search and summaries, **sonnet** for review and tests, **opus** for design and security.
- Read-only agents (reviewers, verifiers) should not get Edit/Write.
- Define the **report format**. The summary is all the main session sees.

---

## Skill: `.claude/skills/<name>/SKILL.md` (folder name = skill name)

```markdown
---
name: release
description: Cut a release - bump version, changelog, tag. Use when the user asks to release.
disable-model-invocation: true         # only YOU can trigger it (/release); use for side effects
argument-hint: "<major|minor|patch>"
allowed-tools: Bash(git tag *) Bash(npm version *)   # space-separated, pre-approved while running
# model: sonnet | effort: high | context: fork (run inside a subagent)
# paths: ["src/payments/**"]          # auto-load only near these files
---

Release a $ARGUMENTS version.          # $ARGUMENTS, $0, $1 ... are substituted
1. ...
```

**Two kinds of skill**
- **Workflow** (`disable-model-invocation: true`): procedures with side effects that you invoke as `/name`. Examples in Jibe: `/ship`, `/commit`, `/spec`.
- **Knowledge** (model-invocable, the default): reference material Claude loads by itself when relevant, e.g. `api-conventions`, `design-system`. Put big references in sibling files (`reference.md`, `scripts/`) and link to them from SKILL.md.

**Tips:** give goals and constraints, not micro-steps; include a "Gotchas" section; don't state the obvious.

---

## Rule: `.claude/rules/<topic>.md`

```markdown
---
paths:                                 # omit = always loaded (keep those short!)
  - "src/api/**/*.ts"
  - "tests/**/*.test.ts"
---

# API rules
- Validate input with Zod before processing.
```

Personal rules for every project go in `~/.claude/rules/`.

---

## Hook: script + entry in `.claude/settings.json`

```json
"PreToolUse": [{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "node",
    "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/my-hook.mjs"],
    "timeout": 10
  }]
}]
```

Jibe writes hooks in Node (exec form: `"command": "node"` plus `args`) so one `settings.json` works on Windows, macOS and Linux with no shell or `jq` dependency.

```js
// my-hook.mjs
import { readFileSync } from 'node:fs';
const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const path = String(input.tool_input?.file_path ?? '');   // Bash/PowerShell tools: input.tool_input.command
if (/(^|[\\/])migrations[\\/]versions[\\/]/.test(path) && input.tool_name === 'Write') {
  process.stderr.write('Generate new migrations with the migration tool instead of writing them by hand.\n');
  process.exit(2);                                     // 2 = BLOCK (stderr goes to Claude). 1 does NOT block.
}
process.exit(0);
```

Gotchas:
- Exit **2** blocks; any other non-zero exit is a non-blocking error.
- On Windows, Node won't spawn `.cmd`/`.bat` shims without a shell. Run node-based tools via their JS entry with `process.execPath` (see `format-on-edit.mjs`).
- Keep hooks fast (they run on every matching tool call) and always handle missing or invalid input by exiting 0.

| Event | Typical use |
|---|---|
| `SessionStart` | Inject context (git status, ticket, env info). Stdout goes to Claude |
| `UserPromptSubmit` | Add context or block certain prompts |
| `PreToolUse` | Guardrails: block commands or files (exit 2) |
| `PostToolUse` | Formatters, linters, quick tests after edits |
| `Stop` | Gate the end of a turn (e.g. tests must pass). Keep it opt-in: it fires every turn |
| `PreCompact` | Back up the transcript before compaction |
| `Notification` | Desktop toast or sound when Claude needs you |

Test a hook without Claude:
```bash
echo '{"tool_input":{"command":"git push --force"}}' | node .claude/hooks/block-dangerous.mjs; echo "exit=$?"
```

---

## Permissions: `.claude/settings.json`

```json
"permissions": {
  "allow": ["Bash(npm run test*)", "Bash(git diff*)"],
  "ask":   ["Bash(git push*)"],
  "deny":  ["Read(./.env)", "Edit(./secrets/**)"]
}
```
Path rules use `Read(...)` and `Edit(...)`. `Edit` covers all file writes. Deny beats allow.

---

## When to promote something

```
Said it twice in chat            ->  /learn it into CLAUDE.md or a rule
Same multi-step request 3 times  ->  make it a skill
Claude ignored a rule that matters ->  make it a hook or permission
Useful in every repo             ->  move it into template/ (or ~/.claude/)
Useful to your whole team        ->  package it as a plugin
```
