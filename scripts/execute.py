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
REVIEW_PROMPT_FILE = PHASES_DIR / "_review-prompt.md"
VALID_STATUSES = {"pending", "completed", "error", "blocked"}
MAX_RETRIES = 3


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def relative_path(path: Path) -> str:
    return str(path.relative_to(ROOT))


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


def run_capture(command: list[str]) -> str:
    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=300,
    )
    output = (result.stdout + result.stderr).strip()
    if result.returncode != 0 and output:
        return f"(exit {result.returncode})\n{output}"
    if result.returncode != 0:
        return f"(exit {result.returncode})"
    return output


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


def invoke_claude_text(prompt: str) -> dict:
    try:
        result = subprocess.run(
            ["claude", "-p", "--dangerously-skip-permissions", "--output-format", "json", prompt],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=1800,
        )
        return {
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "recorded_at": now_iso(),
        }
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return {
            "exit_code": 1,
            "stdout": "",
            "stderr": str(exc),
            "recorded_at": now_iso(),
        }


def extract_json_object(text: str) -> dict:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped).strip()

    decoder = json.JSONDecoder()
    for index, char in enumerate(stripped):
        if char != "{":
            continue
        try:
            value, _ = decoder.raw_decode(stripped[index:])
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    raise json.JSONDecodeError("No JSON object found", stripped, 0)


def parse_claude_review(raw: dict) -> dict:
    stdout = raw.get("stdout", "")
    payload = extract_json_object(stdout)
    result_text = payload.get("result") if isinstance(payload.get("result"), str) else stdout
    return extract_json_object(result_text)


def as_list(value: object) -> list:
    if isinstance(value, list):
        return value
    if value in (None, ""):
        return []
    return [value]


def latest_completed_step(index: dict) -> Optional[int]:
    completed = [
        step["step"]
        for step in index.get("steps", [])
        if step.get("status") == "completed" and isinstance(step.get("step"), int)
    ]
    if not completed:
        return None
    return max(completed)


def build_review_prompt(phase_dir: Path, index: dict, step_number: int, guardrails: str) -> str:
    step_file = phase_dir / f"step{step_number}.md"
    template = REVIEW_PROMPT_FILE.read_text(encoding="utf-8")
    status = run_capture(["git", "status", "--short"])
    diff = run_capture(["git", "diff", "--", "."])

    return "\n\n---\n\n".join(
        [
            template,
            guardrails,
            f"## Review Target\n\n- Phase: `{phase_dir.name}`\n- Step: `{step_number}`",
            f"## Step Spec\n\n{step_file.read_text(encoding='utf-8')}",
            f"## Phase Index\n\n```json\n{json.dumps(index, indent=2, ensure_ascii=False)}\n```",
            f"## Git Status\n\n```text\n{status}\n```",
            f"## Git Diff\n\n```diff\n{diff[-20000:]}\n```",
        ]
    )


def write_correction_prompt(
    correction_prompt_file: Path,
    phase_dir: Path,
    step_number: int,
    blocking: list,
    non_blocking: list,
) -> None:
    step_file = phase_dir / f"step{step_number}.md"
    content = "\n\n".join(
        [
            "# Codex Correction Prompt",
            "You are Codex. Perform exactly one correction pass for the blocking review issues below.",
            "Do not run another Claude review automatically. After the correction, rerun the step Acceptance Criteria and `python3 scripts/verify.py`.",
            f"## Phase\n\n`{phase_dir.name}`",
            f"## Step\n\n`{step_number}`",
            f"## Step Spec\n\n{step_file.read_text(encoding='utf-8')}",
            f"## Blocking Issues\n\n```json\n{json.dumps(blocking, indent=2, ensure_ascii=False)}\n```",
            f"## Non-Blocking Notes\n\n```json\n{json.dumps(non_blocking, indent=2, ensure_ascii=False)}\n```",
        ]
    )
    correction_prompt_file.write_text(content + "\n", encoding="utf-8")


def review_phase(phase_dir_name: str) -> int:
    phase_dir = PHASES_DIR / phase_dir_name
    index_file = phase_dir / "index.json"
    if not phase_dir.exists() or not index_file.exists():
        print(f"Phase not found: {phase_dir_name}", file=sys.stderr)
        return 1
    if not REVIEW_PROMPT_FILE.exists():
        print(f"Review prompt not found: {relative_path(REVIEW_PROMPT_FILE)}", file=sys.stderr)
        return 1

    index = read_json(index_file)
    step_number = latest_completed_step(index)
    if step_number is None:
        print(f"No completed step to review: {phase_dir_name}", file=sys.stderr)
        return 1

    review_file = phase_dir / f"step{step_number}-review.json"
    correction_prompt_file = phase_dir / f"step{step_number}-correction-prompt.md"
    if review_file.exists():
        existing = read_json(review_file)
        print(f"Review already exists: {relative_path(review_file)}")
        return 1 if existing.get("verdict") == "needs_correction" else 0

    prompt = build_review_prompt(phase_dir, index, step_number, load_guardrails())
    print(f"Running Claude review for step {step_number}: {phase_dir_name}")
    raw = invoke_claude_text(prompt)

    correction_prompt_path: Optional[str] = None
    try:
        parsed = parse_claude_review(raw)
        blocking = as_list(parsed.get("blocking"))
        non_blocking = as_list(parsed.get("non_blocking"))
        verdict = "needs_correction" if blocking else "pass"
    except (json.JSONDecodeError, TypeError, AttributeError) as exc:
        blocking = []
        non_blocking = [
            {
                "reason": "Claude review output could not be parsed; treating as non-blocking.",
                "error": str(exc),
                "raw": raw,
            }
        ]
        verdict = "pass"

    if blocking:
        if not correction_prompt_file.exists():
            write_correction_prompt(correction_prompt_file, phase_dir, step_number, blocking, non_blocking)
        correction_prompt_path = relative_path(correction_prompt_file)

    review = {
        "step": step_number,
        "timestamp": now_iso(),
        "verdict": verdict,
        "blocking": blocking,
        "non_blocking": non_blocking,
        "correction_prompt_path": correction_prompt_path,
    }
    write_json(review_file, review)

    print(f"Review artifact: {relative_path(review_file)}")
    if verdict == "needs_correction":
        print(f"Correction prompt: {correction_prompt_path}", file=sys.stderr)
        return 1
    return 0


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
    parser.add_argument("--review", action="store_true", help="Run one Claude review after successful execution.")
    args = parser.parse_args()
    result = execute_phase(args.phase)
    if result != 0 or not args.review:
        return result
    return review_phase(args.phase)


if __name__ == "__main__":
    raise SystemExit(main())
