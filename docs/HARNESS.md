# Harness

## Purpose

This repo uses a small internal harness to turn product intent into repeatable implementation phases.

## Components

- `CLAUDE.md`: execution rules
- `docs/`: product and architecture truth
- `phases/`: step plans and state
- `scripts/execute.py`: step executor
- `scripts/verify.py`: lightweight repo verification
- `phases/_review-prompt.md`: Claude review-only prompt used by `execute.py --review`

## Current Scope

This harness is intentionally small.

It supports:

- phase and step tracking
- retry on failed steps
- blocked/error state handling
- context carry-forward through step summaries
- independent acceptance-criteria checks
- one optional Claude review after a successful phase execution
- correction prompt artifact creation when the review finds blocking issues

It does not support:

- complex agent orchestration
- auto-learning systems
- external hook frameworks
- deployment automation
- automatic correction implementation
- automatic re-review

## Usage

Verify the repo:

```bash
python3 scripts/verify.py
```

Execute the first phase:

```bash
python3 scripts/execute.py 0-foundation
```

Execute a phase and then run one Claude review:

```bash
python3 scripts/execute.py 0-foundation --review
```

When `--review` is used, the executor first runs the normal `execute_phase(<phase>)` loop. If that loop fails, blocks, or errors, execution stops before review.

On success, Claude performs one review pass only. The review is saved to:

```text
phases/<phase>/stepN-review.json
```

If Claude reports blocking issues, `execute.py` writes a Codex correction prompt to:

```text
phases/<phase>/stepN-correction-prompt.md
```

The correction prompt is for Codex to implement in one correction pass. Claude does not implement corrections, and the executor does not automatically run a second review. After applying a correction, rerun the step Acceptance Criteria and:

```bash
python3 scripts/verify.py
```

If Claude review output cannot be parsed, the raw output is saved under `non_blocking`, the verdict is treated as `pass`, and no correction prompt is created.

## Notes

- `verify.py` is intentionally light for now.
- Later phases can extend verification once real app commands exist.
- Review artifacts are generated outputs for operating the harness loop.
