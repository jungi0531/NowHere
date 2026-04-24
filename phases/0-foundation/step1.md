# Step 1: app-structure-foundation

## Read First

- `/docs/ARCHITECTURE.md`
- `/docs/DEVELOPMENT_WORKFLOW.md`
- `/docs/SECURITY.md`

## Goal

Create the initial code structure for a maintainable MVP without overbuilding abstractions.

## Work

- introduce the base app folders described in `docs/ARCHITECTURE.md`
- establish minimal contracts for external integrations
- keep screens thin and keep infrastructure separate

## Acceptance Criteria

```bash
test -d app
test -d features
test -d entities
test -d shared
test -d infrastructure
python3 scripts/verify.py
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
