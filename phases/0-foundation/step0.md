# Step 0: expo-scaffold

## Read First

- `/README.md`
- `/docs/PRD.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`

## Goal

Initialize the Expo application so this repo stops being docs-only and becomes an executable mobile project.

## Work

- create the Expo app foundation in this repo
- align the generated structure with `docs/ARCHITECTURE.md`
- update `CLAUDE.md` with real project commands once they exist
- do not add product features yet

## Acceptance Criteria

```bash
test -f package.json
test -d app
python3 scripts/verify.py
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
