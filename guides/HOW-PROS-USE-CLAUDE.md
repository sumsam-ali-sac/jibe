# How experienced developers use Claude Code

A digest of Anthropic's official best-practices docs and blog, plus the most-referenced community guides (October 2026). Sources are at the bottom. Each principle maps to a part of Jibe, noted as **Jibe:**.

---

## 1. The core constraint: context

Everything Claude reads (files, command output, your messages) fills one context window, and quality drops as it fills. Most good practice comes down to **keeping the main context small and focused**:

- `/clear` between tasks. Use `/compact <focus>` for long tasks. Use `/btw` for side questions that shouldn't stay in history.
- Send exploration to **subagents**. They read 50 files and return a 10-line summary.
- Put rarely needed knowledge in **skills** and **path-scoped rules**, which load on demand, not in CLAUDE.md.

**Jibe:** a CLAUDE.md of about 120 lines; backend and frontend rules that load only for matching files; `searcher` on Haiku for exploration.

## 2. Pick the right mechanism

| You want... | Use | Why |
|---|---|---|
| Facts needed in every session (commands, layout, conventions) | **CLAUDE.md** (under 200 lines) | Always loaded |
| Rules for certain files only | **`.claude/rules/*.md` with `paths:`** | Loads only when matching files are touched |
| A repeatable procedure (ship, release, fix-issue) | **Skill** (`.claude/skills/<name>/SKILL.md`) | Body loads only when invoked |
| Side work that would flood context (search, review, log analysis) | **Subagent** (`.claude/agents/*.md`) | Own context, returns only a summary |
| Something that must happen every time, or must never happen | **Hook** or **permission rule** | Deterministic; CLAUDE.md is only advice |
| Personal preferences | `CLAUDE.local.md` or `~/.claude/CLAUDE.md` | Not imposed on teammates |
| External systems (GitHub, DBs, Figma, Jira) | **CLI tools** first (`gh`, `az`), then **MCP** | CLIs use the least context |

**Anti-patterns:**
- "Always do Y" in CLAUDE.md: use a hook.
- "Never do X" in CLAUDE.md: use a hook or a permission rule.
- Long procedures in CLAUDE.md: move them to skills.
- File-specific rules without `paths:`: they cost tokens in every session.

## 3. The workflow pros converge on

1. **Explore -> Plan -> Implement -> Commit.** Use plan mode (Shift+Tab) for anything multi-file or unclear. Skip planning when you could describe the diff in one sentence.
2. **Let Claude interview you** for big features, then write `SPEC.md` and start a fresh session to implement it.
3. **Give Claude a way to verify:** tests, build, lint, screenshots. "Claude stops when it looks done"; a check turns "looks done" into "is done". Ask for evidence (command plus output), not assertions.
4. **Test-first** for features and bugs. A failing test is the most precise prompt there is.
5. **Adversarial review in a fresh context** (writer/reviewer). Tell the reviewer to report only correctness or requirement gaps, otherwise you get over-engineering.
6. **Course-correct early:** `Esc` to stop, `Esc Esc` / `/rewind` to roll back. After two failed corrections, `/clear` and write a better prompt.
7. **Parallelize:** use git worktrees or several sessions for independent work, `/batch` for large migrations, and `claude -p` in scripts and CI.

**Jibe:** `/spec` -> `/plan-feature` -> test-first tasks -> `/ship` (parallel `code-reviewer`, `security-reviewer`, `verifier`, `ui-verifier`).

### For an API + web-app stack specifically
- **Contract first:** design the request/response schemas, then generate the frontend client from the OpenAPI schema. Most cross-stack bugs are contract drift.
- **Version awareness:** framework majors change APIs (async request APIs and caching defaults in recent web-framework majors; v1 -> v2 of the validation library). Make Claude read the lockfile and use a docs MCP rather than rely on memory.
- **Async pitfalls:** blocking calls inside async handlers and lazy-loaded ORM relationships are the bugs models make most often on the backend. Put them in the reviewer's checklist.
- **Server-first rendering:** client components only at interactive leaves; never leak secrets through public env vars.
- **Verify UI in a browser** (Playwright MCP) instead of trusting that the JSX "looks right".

## 4. Prompting patterns that work

| Instead of | Say |
|---|---|
| "add tests for foo.py" | "write a test for foo.py covering a logged-out user; avoid mocks" |
| "fix the login bug" | "login fails after session timeout; check src/auth token refresh; write a failing test first, then fix" |
| "add a calendar widget" | "look at how HotDogWidget is built and follow that pattern for a calendar widget" |
| "make it look better" | "[screenshot] implement this; screenshot the result, list the differences, fix them" |

Use `@file` to point at files, paste screenshots, and pipe logs in (`cat err.log | claude -p "explain"`).

## 5. Setup habits

- Run `/init` for a first CLAUDE.md, then **prune it**. For every line ask: "would removing this cause a mistake?"
- Commit `.claude/` (settings, agents, skills, rules, hooks) so the whole team shares it.
- Pre-approve safe commands with `permissions.allow`; put `ask` on push/deploy and `deny` on secrets.
- Install a **code-intelligence (LSP) plugin** for typed languages, for precise navigation and errors after each edit.
- Treat CLAUDE.md like code: review it when Claude misbehaves. Run `/doctor prompt-audit` to find bloat and contradictions.
- Bundle your best agents, skills and hooks as a **plugin** to share across repos and teams.

## 6. Common failure patterns

| Failure | Fix |
|---|---|
| Kitchen-sink session (many unrelated tasks) | `/clear` between tasks |
| Correcting the same thing over and over | `/clear`, better prompt, `/learn` the lesson |
| Bloated CLAUDE.md that Claude ignores | Prune; move content to rules or skills; enforce with hooks |
| Plausible code that misses edge cases | Require tests or verification; reviewer subagent |
| Endless "investigation" | Scope it, or hand it to a subagent |

## 7. Skill collections worth studying

- **superpowers** (plugin): brainstorming, writing-plans, TDD, subagent-driven development, verification. It complements Jibe, whose workflow skills only run when you type them.
- **Anthropic plugins:** `feature-dev`, `code-review`.
- Community: shanraisshan/claude-code-best-practice, a large catalog of patterns (useful for ideas; not authoritative).

---

## Sources

- [Best practices for Claude Code (Anthropic docs)](https://code.claude.com/docs/en/best-practices)
- [Steering Claude Code: CLAUDE.md, skills, hooks, rules, subagents (Anthropic blog)](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
- [Skills (docs)](https://code.claude.com/docs/en/skills)
- [Subagents (docs)](https://code.claude.com/docs/en/sub-agents)
- [Memory / CLAUDE.md / rules (docs)](https://code.claude.com/docs/en/memory)
- [Hooks (docs)](https://code.claude.com/docs/en/hooks)
- [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)
- [Claude Code: CLAUDE.md vs Skills vs Hooks vs Subagents (claudekit)](https://claudekit.app/blog/claude-code-claude-md-vs-skills-vs-hooks-vs-subagents)
- [Best practices for Claude Code subagents (PubNub)](https://www.pubnub.com/blog/best-practices-claude-code-subagents-part-two-from-prompts-to-pipelines/)
- [Remote GitHub MCP server GA](https://dev.classmethod.jp/en/articles/github-remote-mcp-ga)
- [Context7 MCP: all clients](https://context7.com/docs/resources/all-clients)
- [Playwright MCP](https://github.com/mcp/microsoft/playwright-mcp)
- [Next.js DevTools MCP](https://mcpservers.org/servers/vercel/next-devtools-mcp)
