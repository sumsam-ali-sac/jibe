---
name: learn
description: Turn a correction or lesson from this session into a durable instruction in the right place (CLAUDE.md, a path-scoped rule, a skill, or a hook). Use right after correcting Claude.
disable-model-invocation: true
argument-hint: "<what Claude got wrong or should remember>"
---

Lesson to capture: $ARGUMENTS
(If empty, infer it from the most recent correction in this conversation and confirm with the user.)

Pick the right home - the cheapest mechanism that reliably works:

| The lesson is... | Put it in |
|---|---|
| A fact needed in almost every session (command, convention, architecture rule) | `CLAUDE.md` |
| Only relevant for certain files/folders | `.claude/rules/<topic>.md` with `paths:` frontmatter |
| A multi-step procedure used occasionally | a new or existing skill in `.claude/skills/` |
| Something that must happen or must never happen, every time | a hook in `.claude/hooks/` + `.claude/settings.json`, or a permission rule |
| A personal preference, not a team rule | `CLAUDE.local.md` (or `~/.claude/CLAUDE.md` for all projects) |

Then:
1. Check for an existing line that covers it; update it rather than adding a duplicate. Remove anything it contradicts.
2. Write it as one specific, imperative line ("Use `uv run pytest`, never bare `pytest`"), with the *why* if it's not obvious.
3. Keep CLAUDE.md under ~150 lines; if it's getting long, move file-specific content into path-scoped rules.
4. Show the diff of what you changed and where.
