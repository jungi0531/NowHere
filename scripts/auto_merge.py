#!/usr/bin/env python3
"""
Squash-merge the open PR for the current feature/* branch into develop.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PHASES_DIR = ROOT / "phases"
TARGET_BRANCH = "develop"


def fail(condition: str, message: str) -> None:
    print(f"{condition} failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def run_command(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=300,
    )


def require_feature_branch() -> str:
    result = run_command(["git", "branch", "--show-current"])
    if result.returncode != 0:
        fail("feature branch", f"could not read current branch: {result.stderr.strip()}")
    branch = result.stdout.strip()
    if not branch.startswith("feature/"):
        fail("feature branch", f"current branch must start with feature/: {branch}")
    return branch


def require_develop_target() -> None:
    if TARGET_BRANCH == "main":
        fail("target branch", "refusing to merge into main")
    if TARGET_BRANCH != "develop":
        fail("target branch", f"target branch must be develop, got {TARGET_BRANCH}")


def open_pr_for_branch(branch: str) -> dict[str, Any]:
    result = run_command(
        [
            "gh",
            "pr",
            "view",
            "--json",
            "number,baseRefName,state,headRefName",
        ]
    )
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail("open PR", f"no open PR found for current branch: {output}")

    try:
        pr = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        fail("open PR", f"could not parse gh pr view output: {exc}")

    if pr.get("state") != "OPEN":
        fail("open PR", f"PR state must be OPEN, got {pr.get('state')}")
    if pr.get("headRefName") != branch:
        fail("open PR", f"PR head must be current branch {branch}, got {pr.get('headRefName')}")
    if pr.get("baseRefName") != TARGET_BRANCH:
        fail("open PR", f"PR target must be develop, got {pr.get('baseRefName')}")
    return pr


def require_verify_passes() -> None:
    result = run_command(["python3", "scripts/verify.py"])
    if result.returncode != 0:
        output = (result.stdout + result.stderr).strip()
        fail("verification", output)


def latest_phase() -> tuple[dict[str, Any], dict[str, Any]]:
    phases_index = read_json(PHASES_DIR / "index.json")
    phases = phases_index.get("phases")
    if not isinstance(phases, list) or not phases:
        fail("phase lookup", "phases/index.json must contain a non-empty phases array")

    phase = max(phases, key=lambda item: item.get("updated_at", ""))
    phase_dir = phase.get("dir")
    if not isinstance(phase_dir, str) or not phase_dir:
        fail("phase lookup", "most recently updated phase is missing dir")

    phase_index_path = PHASES_DIR / phase_dir / "index.json"
    if not phase_index_path.exists():
        fail("phase lookup", f"phase index not found: phases/{phase_dir}/index.json")
    return phase, read_json(phase_index_path)


def latest_completed_step(phase_index: dict[str, Any]) -> dict[str, Any]:
    steps = phase_index.get("steps")
    if not isinstance(steps, list):
        fail("step lookup", "phase index must contain a steps array")

    completed = [
        step
        for step in steps
        if step.get("status") == "completed" and isinstance(step.get("step"), int)
    ]
    if not completed:
        fail("step lookup", "no completed step found in the most recently updated phase")
    return max(completed, key=lambda step: step["step"])


def require_review_passes(phase_dir: str, step_number: int) -> None:
    review_path = PHASES_DIR / phase_dir / f"step{step_number}-review.json"
    if not review_path.exists():
        fail("review artifact", f"not found: phases/{phase_dir}/step{step_number}-review.json")

    review = read_json(review_path)
    verdict = review.get("verdict")
    if verdict != "pass":
        fail("review verdict", f"expected pass, got {verdict}")


def require_mergeable(pr_number: int) -> None:
    result = run_command(["gh", "pr", "view", str(pr_number), "--json", "mergeable", "-q", ".mergeable"])
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail("mergeability", output)

    mergeable = result.stdout.strip().lower()
    if mergeable not in {"mergeable", "true"}:
        fail("mergeability", f"PR has merge conflicts or unknown mergeability: {result.stdout.strip()}")


def merge_pr(pr_number: int) -> None:
    result = run_command(["gh", "pr", "merge", str(pr_number), "--squash", "--delete-branch"])
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail("merge", output)


def main() -> int:
    branch = require_feature_branch()
    require_develop_target()
    pr = open_pr_for_branch(branch)
    require_verify_passes()

    phase, phase_index = latest_phase()
    step = latest_completed_step(phase_index)
    require_review_passes(phase["dir"], step["step"])

    pr_number = pr["number"]
    require_mergeable(pr_number)
    merge_pr(pr_number)
    print(f"Squash-merged PR #{pr_number} into {TARGET_BRANCH}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
