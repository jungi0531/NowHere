# Step 1: pr-and-automerge-scripts

## Read First

- `/CLAUDE.md`
- `/docs/HARNESS.md`
- `/scripts/execute.py`

## Goal

Add two local scripts that automate the feature → develop PR workflow: one to create the PR after all gates pass, and one to squash-merge it.

## Work

- create `scripts/pr.py`:
  - refuse if current branch is not `feature/*`
  - refuse if target is not `develop`
  - run `python3 scripts/verify.py` and abort on failure
  - locate the most recently updated phase and its latest completed step
  - require `phases/<phase>/step<N>-review.json` to exist with `verdict == "pass"`
  - run `gh pr create --base develop` with title and body derived from phase/step metadata
- create `scripts/auto_merge.py`:
  - same branch and target guards as above
  - require an open PR targeting `develop` for the current branch
  - run `python3 scripts/verify.py`
  - require review artifact with `verdict == "pass"`
  - check PR mergeability via `gh pr view --json mergeable`
  - run `gh pr merge --squash --delete-branch`
- update `CLAUDE.md` commands table with the two new commands
- update `docs/HARNESS.md` Usage section with the full operating loop

## Acceptance Criteria

```bash
python3 scripts/verify.py
npm run typecheck
npm run lint
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
