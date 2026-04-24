#!/usr/bin/env python3
"""
Create a GitHub issue and a matching feature branch, then push it.

Usage: python3 scripts/start.py "brief feature description"
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(1)


def slugify(text: str) -> str:
    slug = text.lower()
    slug = slug.replace(" ", "-")
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    return slug[:40]


def create_issue(description: str) -> tuple[str, int]:
    result = subprocess.run(
        [
            "gh", "issue", "create",
            "--title", f"[feat] {description}",
            "--body", "Created by harness start script.",
            "--label", "enhancement",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail(f"gh issue create failed: {output}")

    url = result.stdout.strip()
    if not url:
        fail("gh issue create succeeded but did not print a URL.")

    parts = url.rstrip("/").split("/")
    try:
        issue_number = int(parts[-1])
    except (ValueError, IndexError):
        fail(f"Could not parse issue number from URL: {url}")

    return url, issue_number


def checkout_branch(branch_name: str) -> None:
    result = subprocess.run(
        ["git", "checkout", "-b", branch_name],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail(f"git checkout -b failed: {output}")


def push_branch(branch_name: str) -> None:
    result = subprocess.run(
        ["git", "push", "-u", "origin", branch_name],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        fail(f"git push failed: {output}")


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/start.py \"brief feature description\"", file=sys.stderr)
        return 1

    description = sys.argv[1].strip()
    if not description:
        print("Description must not be empty.", file=sys.stderr)
        return 1

    url, issue_number = create_issue(description)
    branch_name = f"feature/issue-{issue_number}-{slugify(description)}"

    checkout_branch(branch_name)
    push_branch(branch_name)

    print(f"Issue : {url}")
    print(f"Branch: {branch_name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
