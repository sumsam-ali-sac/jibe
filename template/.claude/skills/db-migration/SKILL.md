---
name: db-migration
description: Change the data model safely - update ORM models, autogenerate an Alembic migration, review and fix it, test upgrade and downgrade locally.
disable-model-invocation: true
argument-hint: "<describe the schema change>"
---

Schema change: $ARGUMENTS

Follow `.claude/rules/backend-data.md`.

1. Read the current model(s) and the latest migration to understand conventions (naming, constraints, indexes).
2. Plan the change. For large or busy tables use expand/contract: add nullable/defaulted column -> backfill (separate data migration) -> add constraint later. Say if the change is breaking for existing data or API consumers.
3. Update the ORM models (typed `Mapped[...]` columns, explicit nullability, indexes on foreign keys and filter columns, unique constraints where needed).
4. Generate: the "New migration" command from CLAUDE.md with a descriptive message.
5. **Review the generated file line by line** and fix it:
   - renames show up as drop + add (data loss) -> rewrite as `alter_column`/rename
   - server defaults, enum changes, check constraints and some index changes are often missing
   - `downgrade()` must exactly reverse `upgrade()`
6. Test locally (ask before touching any shared database): upgrade to head, downgrade one step, upgrade again. Run the backend tests.
7. Report: model changes, migration file, review fixes you made, test results, and any deployment notes (ordering, backfill, locks).
