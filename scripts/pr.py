#!/usr/bin/env python3
"""
Create a PR from the current feature/* branch to develop.
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


def fail(message: str) -> None:
    print(message, file=sys.stderr)
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
        fail(f"Failed to read current branch: {result.stderr.strip()}")
    branch = result.stdout.strip()
    if not branch.startswith("feature/"):
        fail(f"Current branch must start with feature/: {branch}")
    return branch


def require_develop_target() -> None:
    if TARGET_BRANCH == "main":
        fail("Refusing to create a PR targeting main.")
    if TARGET_BRANCH != "develop":
        fail(f"Target branch must be develop, got {TARGET_BRANCH}.")


def require_verify_passes() -> None:
    result = run_command(["python3", "scripts/verify.py"])
    if result.returncode != 0:
        output = (result.stdout + result.stderr).strip()
        fail(f"Verification failed before PR creation.\n{output}")


def latest_phase() -> tuple[dict[str, Any], dict[str, Any]]:
    phases_index = read_json(PHASES_DIR / "index.json")
    phases = phases_index.get("phases")
    if not isinstance(phases, list) or not phases:
        fail("phases/index.json must contain a non-empty phases array.")

    phase = max(phases, key=lambda item: item.get("updated_at", ""))
    phase_dir = phase.get("dir")
    if not isinstance(phase_dir, str) or not phase_dir:
        fail("Most recently updated phase is missing dir.")

    phase_index_path = PHASES_DIR / phase_dir / "index.json"
    if not phase_index_path.exists():
        fail(f"Phase index not found: phases/{phase_dir}/index.json")
    return phase, read_json(phase_index_path)


def latest_completed_step(phase_index: dict[str, Any]) -> dict[str, Any]:
    steps = phase_index.get("steps")
    if not isinstance(steps, list):
        fail("Phase index must contain a steps array.")

    completed = [
        step
        for step in steps
        if step.get("status") == "completed" and isinstance(step.get("step"), int)
    ]
    if not completed:
        fail("No completed step found in the most recently updated phase.")
    return max(completed, key=lambda step: step["step"])


def require_review_passes(phase_dir: str, step_number: int) -> dict[str, Any]:
    review_path = PHASES_DIR / phase_dir / f"step{step_number}-review.json"
    if not review_path.exists():
        fail(f"Review artifact not found: phases/{phase_dir}/step{step_number}-review.json")

    review = read_json(review_path)
    verdict = review.get("verdict")
    if verdict != "pass":
        fail(f"Review verdict must be pass, got {verdict}.")
    return review


def format_non_blocking(review: dict[str, Any]) -> str:
    items = review.get("non_blocking")
    if not items:
        return "[]"
    return json.dumps(items, indent=2, ensure_ascii=False)


def create_pr(title: str, body: str) -> str:
    result = run_command(["gh", "pr", "create", "--base", TARGET_BRANCH, "--title", title, "--body", body])
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail(f"gh pr create failed.\n{output}")

    url = result.stdout.strip()
    if not url:
        fail("gh pr create succeeded but did not print a PR URL.")
    return url


def main() -> int:
    require_feature_branch()
    require_develop_target()
    require_verify_passes()

    phase, phase_index = latest_phase()
    step = latest_completed_step(phase_index)
    phase_dir = phase["dir"]
    phase_name = phase.get("name", phase_dir)
    step_number = step["step"]
    step_name = step.get("name", f"step-{step_number}")
    review = require_review_passes(phase_dir, step_number)

    title = f"feat: {phase_name} step {step_number} — {step_name}"
    body = "\n\n".join(
        [
            f"## Phase\n\n{phase_name} (`{phase_dir}`)",
            f"## Step\n\n{step_number} - {step_name}",
            f"## Step Summary\n\n{step.get('summary', '')}",
            f"## Non-Blocking Review Items\n\n```json\n{format_non_blocking(review)}\n```",
        ]
    )

    url = create_pr(title, body)
    print(url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
