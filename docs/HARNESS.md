# Harness

## Purpose

This repo uses a small internal harness to turn product intent into repeatable implementation phases.

## Components

- `CLAUDE.md`: execution rules
- `docs/`: product and architecture truth
- `phases/`: step plans and state
- `scripts/execute.py`: step executor
- `scripts/verify.py`: lightweight repo verification

## Current Scope

This harness is intentionally small.

It supports:

- phase and step tracking
- retry on failed steps
- blocked/error state handling
- context carry-forward through step summaries
- independent acceptance-criteria checks

It does not support:

- complex agent orchestration
- auto-learning systems
- external hook frameworks
- deployment automation

## Usage

Verify the repo:

```bash
python3 scripts/verify.py
```

Execute the first phase:

```bash
python3 scripts/execute.py 0-foundation
```

## Notes

- `verify.py` is intentionally light for now.
- Later phases can extend verification once real app commands exist.
