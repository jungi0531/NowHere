# Step 1: start-and-run-scripts

## Read First

- `/CLAUDE.md`
- `/scripts/execute.py`
- `/scripts/pr.py`
- `/scripts/auto_merge.py`

## Goal

Add the final two harness automation scripts and wire auto-commit into the executor so the full loop runs with two commands: `python3 scripts/start.py "description"` and `python3 scripts/run.py <phase>`.

## Work

### scripts/start.py

Create `scripts/start.py`. Usage: `python3 scripts/start.py "brief feature description"`

1. Require exactly one CLI argument. If missing, print usage to stderr and exit 1.
2. Run `gh issue create --title "[feat] <description>" --body "Created by harness start script." --label "enhancement"`. Capture stdout to extract the issue URL. Parse the issue number from the last path segment of the URL. On failure, print error and exit 1.
3. Build branch name: `feature/issue-<number>-<slug>`. slug = description lowercased, spaces→hyphens, keep only `[a-z0-9-]`, truncate to 40 chars.
4. Run `git checkout -b <branch-name>`.
5. Run `git push -u origin <branch-name>`.
6. Print `Issue : <url>` and `Branch: <branch-name>`. Exit 0.

### scripts/run.py

Create `scripts/run.py`. Usage: `python3 scripts/run.py <phase>`

1. Require exactly one CLI argument (phase directory name). If missing, print usage and exit 1.
2. Run stages in order. On non-zero exit, print which stage failed and exit 1.
   - `[1/4] implement` → `python3 scripts/execute.py <phase>`
   - `[2/4] review` → `python3 scripts/execute.py <phase> --review`
   - `[3/4] create PR` → `python3 scripts/pr.py`
   - `[4/4] auto-merge` → `python3 scripts/auto_merge.py`
3. Use `subprocess.run(["python3", "scripts/x.py", ...], cwd=ROOT)` for each stage. Pass stdout/stderr through to the terminal (do not capture).
4. On full success print `Done. PR merged into develop.`

### scripts/execute.py — auto-commit

Add one new function `auto_commit(step_number: int, step_name: str) -> None`:

```python
def auto_commit(step_number: int, step_name: str) -> None:
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=ROOT, capture_output=True, text=True,
    )
    if not result.stdout.strip():
        return
    subprocess.run(["git", "add", "-A"], cwd=ROOT, check=True)
    subprocess.run(
        ["git", "commit", "-m", f"feat: step {step_number} — {step_name}"],
        cwd=ROOT, check=True,
    )
```

Call `auto_commit(step_number, step_name)` inside `execute_phase()`, immediately after `run_ac_commands` returns `(True, "")` and before writing `completed_at` to the index. Do not change any other logic.

### CLAUDE.md

Add two rows to the "Current Commands" table:

```
| Start issue + branch  | `python3 scripts/start.py "description"` |
| Run full loop         | `python3 scripts/run.py <phase>`         |
```

## Acceptance Criteria

```bash
python3 scripts/verify.py
npm run typecheck
npm run lint
python3 -c "import ast, pathlib; ast.parse(pathlib.Path('scripts/start.py').read_text())"
python3 -c "import ast, pathlib; ast.parse(pathlib.Path('scripts/run.py').read_text())"
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
