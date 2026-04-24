#!/usr/bin/env python3
"""
Run the full harness loop for a phase: implement → review → PR → merge.

Usage: python3 scripts/run.py <phase>
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

STAGES: list[tuple[str, list[str]]] = [
    ("[1/4] implement", ["python3", "scripts/execute.py"]),
    ("[2/4] review", ["python3", "scripts/execute.py", "--review"]),
    ("[3/4] create PR", ["python3", "scripts/pr.py"]),
    ("[4/4] auto-merge", ["python3", "scripts/auto_merge.py"]),
]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/run.py <phase>", file=sys.stderr)
        return 1

    phase = sys.argv[1].strip()
    if not phase:
        print("Phase argument must not be empty.", file=sys.stderr)
        return 1

    for label, base_command in STAGES:
        command = base_command.copy()
        if "execute.py" in base_command[-1]:
            if "--review" in base_command:
                command = ["python3", "scripts/execute.py", phase, "--review"]
            else:
                command = ["python3", "scripts/execute.py", phase]

        print(f"\n{label}")
        result = subprocess.run(command, cwd=ROOT)
        if result.returncode != 0:
            print(f"\n{label} failed (exit {result.returncode}).", file=sys.stderr)
            return 1

    print("\nDone. PR merged into develop.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
