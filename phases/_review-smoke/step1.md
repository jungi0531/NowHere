# Step 1: review-artifact-smoke

## Goal

Validate that `python3 scripts/execute.py <phase> --review` can create a review artifact for the current harness-review PR worktree.

## Work

- no implementation changes are required for this smoke phase
- allowed current worktree scope:
  - `scripts/execute.py`
  - `phases/_review-prompt.md`
  - `docs/HARNESS.md`
  - `CLAUDE.md`
  - `phases/index.json`
  - `phases/1-vertical-slice/`
  - `artifacts/verify/latest.json`
  - `phases/_review-smoke/`

## Acceptance Criteria

```bash
python3 scripts/verify.py
```

## Status Rules

- success: leave this step `completed`
- failure: report a blocking review issue
