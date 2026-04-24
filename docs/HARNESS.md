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

    python3 scripts/verify.py

Execute a phase:

    python3 scripts/execute.py <phase>

Execute a phase with Claude review:

    python3 scripts/execute.py <phase> --review

Create a PR to develop (after review passes):

    python3 scripts/pr.py

Auto-merge to develop (after PR is open and all conditions pass):

    python3 scripts/auto_merge.py

develop → main merge is always manual and performed by the human owner only.

## Notes

- `verify.py` is intentionally light for now.
- Later phases can extend verification once real app commands exist.
- Review artifacts are generated outputs for operating the harness loop.
