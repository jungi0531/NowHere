#!/usr/bin/env python3
"""
Lightweight repo verification for the current harness-only stage.

Checks:
- required files and directories exist
- phase metadata is structurally valid
- step files referenced by phase indexes exist
"""

from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = ROOT / "artifacts" / "verify"
VALID_STEP_STATUSES = {"pending", "completed", "error", "blocked"}

REQUIRED_FILES = [
    ROOT / "README.md",
    ROOT / "CLAUDE.md",
    ROOT / "package.json",
    ROOT / "eslint.config.js",
    ROOT / "app.json",
    ROOT / "tsconfig.json",
    ROOT / "docs" / "PRD.md",
    ROOT / "docs" / "ARCHITECTURE.md",
    ROOT / "docs" / "ADR.md",
    ROOT / "docs" / "SECURITY.md",
    ROOT / "docs" / "DEVELOPMENT_WORKFLOW.md",
    ROOT / "docs" / "WORKING_CONTEXT.md",
    ROOT / "docs" / "HARNESS.md",
    ROOT / "phases" / "index.json",
    ROOT / "scripts" / "execute.py",
    ROOT / "scripts" / "verify.py",
    ROOT / "evals" / "README.md",
    ROOT / "app" / "_layout.tsx",
    ROOT / "app" / "index.tsx",
    ROOT / "app" / "home.tsx",
    ROOT / "app" / "check-in.tsx",
    ROOT / "app" / "length.tsx",
    ROOT / "app" / "generating.tsx",
    ROOT / "app" / "player.tsx",
    ROOT / "features" / "index.ts",
    ROOT / "features" / "home" / "index.ts",
    ROOT / "features" / "home" / "presentation" / "home-screen.tsx",
    ROOT / "features" / "onboarding" / "index.ts",
    ROOT / "features" / "onboarding" / "presentation" / "onboarding-screen.tsx",
    ROOT / "features" / "check-in" / "index.ts",
    ROOT / "features" / "check-in" / "presentation" / "check-in-screen.tsx",
    ROOT / "features" / "meditation-length" / "index.ts",
    ROOT / "features" / "meditation-length" / "presentation" / "meditation-length-screen.tsx",
    ROOT / "features" / "generating" / "index.ts",
    ROOT / "features" / "generating" / "presentation" / "generating-screen.tsx",
    ROOT / "features" / "player" / "index.ts",
    ROOT / "features" / "player" / "presentation" / "player-screen.tsx",
    ROOT / "entities" / "index.ts",
    ROOT / "entities" / "session" / "index.ts",
    ROOT / "shared" / "index.ts",
    ROOT / "shared" / "providers" / "app-providers.tsx",
    ROOT / "shared" / "ui" / "app-screen.tsx",
    ROOT / "shared" / "ui" / "app-button.tsx",
    ROOT / "shared" / "ui" / "screen-intro.tsx",
    ROOT / "shared" / "ui" / "surface-card.tsx",
    ROOT / "infrastructure" / "index.ts",
    ROOT / "infrastructure" / "env" / "index.ts",
    ROOT / "infrastructure" / "supabase" / "index.ts",
]

REQUIRED_DIRS = [
    ROOT / "app",
    ROOT / "docs",
    ROOT / "features",
    ROOT / "entities",
    ROOT / "shared",
    ROOT / "infrastructure",
    ROOT / "phases",
    ROOT / "scripts",
    ROOT / "evals",
    ROOT / "artifacts" / "verify",
]


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def run_command(command: list[str]) -> tuple[bool, str]:
    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode == 0:
        return True, ""

    output = (result.stdout + result.stderr).strip()[-2000:]
    message = f"Command failed: {' '.join(command)} (exit {result.returncode})"
    if output:
        message += f"\n{output}"
    return False, message


def verify() -> dict:
    failures: list[str] = []
    warnings: list[str] = []

    for path in REQUIRED_FILES:
        if not path.exists():
            failures.append(f"Missing required file: {path.relative_to(ROOT)}")

    for path in REQUIRED_DIRS:
        if not path.exists():
            failures.append(f"Missing required directory: {path.relative_to(ROOT)}")

    phases_index_path = ROOT / "phases" / "index.json"
    if phases_index_path.exists():
        try:
            phases_index = read_json(phases_index_path)
            phases = phases_index.get("phases")
            if not isinstance(phases, list) or not phases:
                failures.append("phases/index.json must contain a non-empty `phases` array.")
            else:
                for phase in phases:
                    phase_dir_name = phase.get("dir")
                    if not phase_dir_name:
                        failures.append("A phase entry is missing `dir`.")
                        continue
                    phase_dir = ROOT / "phases" / phase_dir_name
                    phase_index_path = phase_dir / "index.json"
                    if not phase_dir.exists():
                        failures.append(f"Phase directory missing: phases/{phase_dir_name}")
                        continue
                    if not phase_index_path.exists():
                        failures.append(f"Phase index missing: phases/{phase_dir_name}/index.json")
                        continue

                    phase_index = read_json(phase_index_path)
                    steps = phase_index.get("steps")
                    if not isinstance(steps, list) or not steps:
                        failures.append(f"Phase `{phase_dir_name}` must define a non-empty `steps` array.")
                        continue

                    for step in steps:
                        step_number = step.get("step")
                        step_status = step.get("status")
                        if not isinstance(step_number, int):
                            failures.append(f"Phase `{phase_dir_name}` has a step with invalid `step` value.")
                            continue
                        if step_status not in VALID_STEP_STATUSES:
                            failures.append(
                                f"Phase `{phase_dir_name}` step {step_number} has invalid status `{step_status}`."
                            )
                        step_file = phase_dir / f"step{step_number}.md"
                        if not step_file.exists():
                            failures.append(f"Missing step file: phases/{phase_dir_name}/step{step_number}.md")
        except json.JSONDecodeError as exc:
            failures.append(f"Invalid JSON in phases/index.json: {exc}")

    package_json_path = ROOT / "package.json"
    if package_json_path.exists():
        try:
            package_json = read_json(package_json_path)
            scripts = package_json.get("scripts", {})
            required_scripts = ["start", "android", "ios", "web", "lint", "typecheck", "verify"]
            for script_name in required_scripts:
                if script_name not in scripts:
                    failures.append(f"package.json is missing required script `{script_name}`.")
        except json.JSONDecodeError as exc:
            failures.append(f"Invalid JSON in package.json: {exc}")

    if not failures:
        for command in (["npm", "run", "typecheck"], ["npm", "run", "lint"]):
            ok, message = run_command(command)
            if not ok:
                failures.append(message)

    report = {
        "timestamp": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "ok": not failures,
        "failures": failures,
        "warnings": warnings,
    }
    return report


def write_report(report: dict) -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    (ARTIFACTS_DIR / "latest.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    report = verify()
    write_report(report)

    if report["ok"]:
        print("VERIFY PASS")
        print(" - harness structure is valid")
        return 0

    print("VERIFY FAIL")
    for failure in report["failures"]:
        print(f" - {failure}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
