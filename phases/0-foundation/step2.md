# Step 2: quality-baseline

## Read First

- `/CLAUDE.md`
- `/docs/DEVELOPMENT_WORKFLOW.md`
- `/docs/HARNESS.md`

## Goal

Add the first real project quality baseline once the app scaffold exists.

## Work

- update repo commands in `CLAUDE.md`
- add project-aware lint, typecheck, and test commands
- keep verification simple and local to this repo

## Acceptance Criteria

```bash
python3 scripts/verify.py
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
