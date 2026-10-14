---
paths:
  - "**/models/**/*.py"
  - "**/models.py"
  - "**/repositories/**/*.py"
  - "**/repos/**/*.py"
  - "**/crud/**/*.py"
  - "**/db/**/*.py"
  - "**/alembic/**"
  - "**/migrations/**"
---

# Data access and migrations

**Versions first:** check the ORM version. SQLAlchemy 2.x style is `select()`, `Mapped[...]`, `mapped_column()`, `session.scalars()`; avoid 1.x `query()` style in 2.x projects.

## Sessions and transactions
- One session per request, provided by a dependency; never a global session.
- Commit/rollback at the service (unit-of-work) boundary, not scattered inside repository methods.
- Async sessions: `expire_on_commit=False`, and **no lazy loading**. Load relationships explicitly (`selectinload`/`joinedload`), otherwise you get errors or hidden N+1 queries.

## Queries
- Parameterized queries only; never build SQL with f-strings or concatenation.
- Avoid N+1: check list endpoints load related data in a bounded number of queries.
- Index foreign keys and columns used in filters/sorting; add unique constraints for business uniqueness instead of check-then-insert races.
- Money as `Decimal`/`Numeric` or integer minor units, never float. Timestamps timezone-aware UTC.

## Migrations (Alembic)
- Generate with autogenerate, then **review the file**: autogenerate misses renames (shows drop+add), server defaults, enum value changes, and some index/constraint changes.
- One migration per logical change, with a descriptive message. Implement `downgrade()`.
- Never edit a migration that has been applied on a shared environment; add a new one.
- Large tables: add columns nullable/with default, backfill in a separate step, then add constraints. Avoid long table locks.
- Data migrations are separate from schema migrations.
- Applying migrations to any non-local database is the user's call: ask first.
