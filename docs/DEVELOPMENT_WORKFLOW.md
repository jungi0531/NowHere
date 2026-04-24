# Development Workflow

## Default Flow

1. Research existing options before inventing new abstractions.
2. Plan the smallest useful implementation.
3. Implement the target step only.
4. Verify the result.
5. Update working context and move to the next step.

## Research First

- Search the current repo first.
- Check primary vendor docs for framework and API behavior.
- Prefer battle-tested libraries over custom helpers.

## Implementation Rules

- Keep scope tight per step.
- Do not mix unrelated improvements into the same step.
- Prefer explicit code over premature generalization.

## Verification Rules

- Every meaningful step must have Acceptance Criteria.
- The harness independently runs Acceptance Criteria commands.
- `scripts/verify.py` is the repo-level baseline gate.

## Review Mindset

- Look for regressions, not just completion.
- Favor maintainability over cleverness.
- Flag security and data-handling issues early.
