# .claude/ - Claude Code project setup (Jibe)

Committed to the repo so every teammate and every session gets the same setup. **Requires Node 20+** on PATH for the hooks.

| Path | What it is | Loaded |
|---|---|---|
| `../CLAUDE.md` | Project facts: stack, commands, architecture, git conventions | Every session |
| `../CLAUDE.local.md` | Your personal notes (gitignored) | Every session, only you |
| `settings.json` | Permissions, attribution off, hooks | Always (enforced) |
| `settings.local.json` | Your personal overrides (gitignored) | Always, only you |
| `rules/*.md` | Topic rules; files with `paths:` load only when matching files are touched | Always / on demand |
| `agents/*.md` | Subagents with their own context, tools and model | When delegated to |
| `skills/<name>/SKILL.md` | Slash-command workflows | When you type `/name` |
| `hooks/*.mjs` | Scripts the harness runs automatically (Node, cross-platform) | On their events |

## Slash commands

| Command | Use it to |
|---|---|
| `/adapt-setup` | Tailor Jibe to this repo; fills every `TODO(setup)` in CLAUDE.md (run once) |
| `/onboard [area]` | Guided tour of the codebase |
| `/start-branch <type> [TICKET] <desc>` | Create `feature/`, `bugfix/`, `hot-fix/`... branch from the right base |
| `/spec <feature>` | Be interviewed; produces `docs/specs/<name>.md` |
| `/plan-feature <spec>` | Produces `docs/plans/<name>.md` with small test-first tasks |
| `/new-endpoint <METHOD /path> <desc>` | Schemas -> repository -> service -> router -> tests -> regenerate client |
| `/db-migration <change>` | Model change + reviewed migration, upgrade/downgrade tested |
| `/new-page <route> <desc>` | Server-rendered page with loading/error states, metadata, tests, browser check |
| `/new-component <Name> <desc>` | Accessible, typed, tested UI component |
| `/fix-issue <n>` | `bugfix/` flow: failing test -> fix -> verify -> commit |
| `/hot-fix <problem>` | Urgent production fix from the production branch, merged back afterwards |
| `/ship [plan]` | All checks + parallel reviews + fixes + commit |
| `/commit` | Commits with `feature:` / `bugfix:` / `hot-fix:`... prefixes, no attribution |
| `/open-pr` | Push and open a PR with a complete description |
| `/learn <lesson>` | Turn a correction into a permanent instruction |

## Subagents

| Agent | Model | Job |
|---|---|---|
| `searcher` | Haiku | Find files, symbols, usages cheaply |
| `architect` | Opus | Designs and plans (read-only) |
| `debugger` | inherit | Root-cause investigation |
| `test-writer` | Sonnet | API, component and E2E tests |
| `code-reviewer` | Sonnet | Correctness and stack-specific pitfalls |
| `security-reviewer` | Opus | AuthZ, injection, secrets, client-side leaks |
| `verifier` | Sonnet | Checks work against spec/plan, runs checks |
| `ui-verifier` | Sonnet | Real-browser check of UI changes |
| `docs-writer` | Sonnet | Docs, changelog, `.env.example` |

## Hooks

| Hook | Event | Effect |
|---|---|---|
| `session-start.mjs` | SessionStart | Adds branch, uncommitted files, recent commits; reminds about unfilled `TODO(setup)` |
| `block-dangerous.mjs` | Before Bash/PowerShell | Blocks force push, `reset --hard`, `clean -f`, `--no-verify`, destructive SQL, `alembic downgrade base`, publish/deploy, `curl \| sh`... |
| `protect-files.mjs` | Before Edit/Write | Blocks edits to `.env`, keys, lockfiles, build output, generated API client |
| `format-on-edit.mjs` | After Edit/Write | Formats the file with the project's ruff/black (venv or PATH) or biome/prettier (node_modules) |

Edit any of these freely; they're your project's config. In a `claude` terminal, `/hooks` lists active hooks and `/context` shows what's loaded.

Each shell command and file edit starts a short Node process for the hooks (typically well under a second). Remove hooks you don't need from `settings.json`.
