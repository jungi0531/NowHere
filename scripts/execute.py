#!/usr/bin/env python3
"""
Minimal phase executor for NowHere.

Runs pending steps in order, carries forward completed summaries,
supports retry/block/error states, and independently validates
Acceptance Criteria commands defined in step markdown files.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
PHASES_DIR = ROOT / "phases"
DOCS_DIR = ROOT / "docs"
CLAUDE_FILE = ROOT / "CLAUDE.md"
VALID_STATUSES = {"pending", "completed", "error", "blocked"}
MAX_RETRIES = 3


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_guardrails() -> str:
    sections: list[str] = []
    if CLAUDE_FILE.exists():
        sections.append(f"## CLAUDE.md\n\n{CLAUDE_FILE.read_text(encoding='utf-8')}")
    if DOCS_DIR.exists():
        for file in sorted(DOCS_DIR.glob("*.md")):
            sections.append(f"## docs/{file.name}\n\n{file.read_text(encoding='utf-8')}")
    return "\n\n---\n\n".join(sections)


def build_step_context(index: dict) -> str:
    items = []
    for step in index.get("steps", []):
        if step.get("status") == "completed" and step.get("summary"):
            items.append(f"- Step {step['step']} ({step['name']}): {step['summary']}")
    if not items:
        return ""
    return "## Completed Step Summaries\n\n" + "\n".join(items)


def extract_ac_commands(step_file: Path) -> list[str]:
    text = step_file.read_text(encoding="utf-8")
    match = re.search(r"## Acceptance Criteria\s*\n+```bash\n(.*?)```", text, re.DOTALL)
    if not match:
        return []
    commands = []
    for raw in match.group(1).splitlines():
        command = raw.split("#", 1)[0].strip()
        if command:
            commands.append(command)
    return commands


def run_ac_commands(step_file: Path) -> tuple[bool, str]:
    for command in extract_ac_commands(step_file):
        result = subprocess.run(
            command,
            shell=True,
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0:
            output = (result.stdout + result.stderr).strip()[-2000:]
            message = f"Acceptance Criteria failed: `{command}` (exit {result.returncode})"
            if output:
                message += f"\n{output}"
            return False, message
    return True, ""


def update_top_phase_status(phase_dir_name: str, status: str) -> None:
    top_index = PHASES_DIR / "index.json"
    if not top_index.exists():
        return
    data = read_json(top_index)
    for phase in data.get("phases", []):
        if phase.get("dir") == phase_dir_name:
            phase["status"] = status
            phase["updated_at"] = now_iso()
            break
    write_json(top_index, data)


def build_prompt(step_file: Path, guardrails: str, step_context: str, prev_error: Optional[str]) -> str:
    retry_note = ""
    if prev_error:
        retry_note = (
            "## Previous Attempt Failed\n\n"
            f"{prev_error}\n\n"
            "Use this failure information to fix the step instead of repeating the same mistake.\n\n"
        )
    instructions = (
        "You are executing a single project step.\n\n"
        "Rules:\n"
        "- Read the provided project rules and docs context.\n"
        "- Perform only the work required by this step.\n"
        "- Update the relevant phases index status yourself.\n"
        "- Use only these statuses: pending, completed, error, blocked.\n"
        "- On completed, include a short summary.\n"
        "- If external setup or user input is required, mark blocked and stop.\n"
        "- Do not mark completed until the step is actually done.\n\n"
    )
    step_text = step_file.read_text(encoding="utf-8")
    return "\n\n---\n\n".join(part for part in [
        instructions,
        guardrails,
        step_context,
        retry_note,
        step_text,
    ] if part)


def invoke_claude(prompt: str, output_path: Path) -> None:
    result = subprocess.run(
        ["claude", "-p", "--dangerously-skip-permissions", "--output-format", "json", prompt],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=1800,
    )
    payload = {
        "exit_code": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "recorded_at": now_iso(),
    }
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def get_step(index: dict, step_number: int) -> dict:
    for step in index["steps"]:
        if step["step"] == step_number:
            return step
    raise KeyError(f"step {step_number} not found")


def validate_status(status: str) -> bool:
    return status in VALID_STATUSES


def execute_phase(phase_dir_name: str) -> int:
    phase_dir = PHASES_DIR / phase_dir_name
    index_file = phase_dir / "index.json"
    if not phase_dir.exists() or not index_file.exists():
        print(f"Phase not found: {phase_dir_name}", file=sys.stderr)
        return 1

    guardrails = load_guardrails()
    update_top_phase_status(phase_dir_name, "pending")

    while True:
        index = read_json(index_file)
        pending = next((step for step in index["steps"] if step.get("status") == "pending"), None)
        if pending is None:
            update_top_phase_status(phase_dir_name, "completed")
            print(f"Phase completed: {phase_dir_name}")
            return 0

        step_number = pending["step"]
        step_name = pending["name"]
        step_file = phase_dir / f"step{step_number}.md"
        output_file = phase_dir / f"step{step_number}-output.json"
        prev_error: Optional[str] = None

        for attempt in range(1, MAX_RETRIES + 1):
            index = read_json(index_file)
            current = get_step(index, step_number)
            current.setdefault("started_at", now_iso())
            write_json(index_file, index)

            prompt = build_prompt(step_file, guardrails, build_step_context(index), prev_error)
            print(f"Running step {step_number}: {step_name} (attempt {attempt}/{MAX_RETRIES})")
            invoke_claude(prompt, output_file)

            index = read_json(index_file)
            current = get_step(index, step_number)
            status = current.get("status", "pending")
            if not validate_status(status):
                prev_error = f"Invalid status `{status}` written to phase index."
                current["status"] = "pending"
                current.pop("summary", None)
                current.pop("error_message", None)
                write_json(index_file, index)
                continue

            if status == "completed":
                passed, message = run_ac_commands(step_file)
                if passed:
                    current["completed_at"] = now_iso()
                    write_json(index_file, index)
                    print(f"Completed step {step_number}: {step_name}")
                    break
                current["status"] = "pending"
                current.pop("summary", None)
                write_json(index_file, index)
                prev_error = message
                if attempt == MAX_RETRIES:
                    current["status"] = "error"
                    current["error_message"] = message
                    current["failed_at"] = now_iso()
                    write_json(index_file, index)
                    update_top_phase_status(phase_dir_name, "error")
                    print(message, file=sys.stderr)
                    return 1
                continue

            if status == "blocked":
                current["blocked_at"] = now_iso()
                write_json(index_file, index)
                update_top_phase_status(phase_dir_name, "blocked")
                print(current.get("blocked_reason", "Step blocked."), file=sys.stderr)
                return 2

            error_message = current.get("error_message") or "Step did not mark itself completed."
            prev_error = error_message
            current["status"] = "pending"
            current.pop("error_message", None)
            write_json(index_file, index)

            if attempt == MAX_RETRIES:
                current["status"] = "error"
                current["error_message"] = error_message
                current["failed_at"] = now_iso()
                write_json(index_file, index)
                update_top_phase_status(phase_dir_name, "error")
                print(error_message, file=sys.stderr)
                return 1

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Execute a phase directory.")
    parser.add_argument("phase", help="Phase directory name, e.g. 0-foundation")
    args = parser.parse_args()
    return execute_phase(args.phase)


if __name__ == "__main__":
    raise SystemExit(main())
