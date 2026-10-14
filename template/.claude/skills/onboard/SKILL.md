---
name: onboard
description: Produce a guided tour of this codebase - architecture, main flows, where things live, how to run and test, and gotchas. Use when new to a repo or returning after a long break.
disable-model-invocation: true
argument-hint: "[area to focus on]"
---

Give me an onboarding tour of this codebase. Focus area (optional): $ARGUMENTS

Use several `searcher` subagents in parallel to explore different areas, so the main context stays small. Then write a concise tour:

1. **What it is**: purpose, users, main technologies.
2. **Map**: top-level folders and what lives where (only non-obvious ones).
3. **Main flows**: trace 2-3 core requests/jobs end to end with `file:line` references (entry point -> logic -> data -> response).
4. **Data model**: key entities and where they're defined.
5. **How to run, test, debug**: verified commands.
6. **Conventions**: patterns new code should copy, with an example file for each.
7. **Gotchas**: surprising behaviour, tech debt, flaky areas.
8. **Good first changes**: 3 small, safe tasks to learn the codebase.

Ask whether to save it to `docs/ONBOARDING.md`. If any command or fact belongs in CLAUDE.md and is missing, propose the exact addition.
