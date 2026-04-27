# NowHere Harness Rules

## Project

NowHere is a personalized meditation app built around:

- daily check-in
- AI meditation script generation
- Gemini 3.1 Flash TTS Preview audio generation
- file-based playback
- simple, maintainable MVP architecture

## Current Commands

These are the current stable project-wide commands.

| Purpose | Command |
|---|---|
| Start Expo dev server | `npm run start` |
| Open Android target | `npm run android` |
| Open iOS target | `npm run ios` |
| Open web target | `npm run web` |
| Lint app code | `npm run lint` |
| Type check | `npm run typecheck` |
| Verify repo baseline | `python3 scripts/verify.py` |
| Execute a phase | `python3 scripts/execute.py 0-foundation` |
| Create PR to develop | `python3 scripts/pr.py` |
| Auto-merge to develop | `python3 scripts/auto_merge.py` |
| Start issue + branch  | `python3 scripts/start.py "description"` |
| Run full loop         | `python3 scripts/run.py <phase>`         |

## Critical Rules

- CRITICAL: Do not put business logic directly in screens when implementation starts.
- CRITICAL: Do not call Gemini or Supabase directly from UI components.
- CRITICAL: Keep external integrations behind small service interfaces.
- CRITICAL: Never hardcode secrets, API keys, tokens, or Supabase service-role credentials.
- CRITICAL: A step is not done because code was written. It is done only when its Acceptance Criteria pass.
- CRITICAL: If a step needs user action, credentials, billing, or manual external setup, mark it as `blocked` and stop.

## Development Principles

- Prefer small, explicit modules over clever abstractions.
- Build for MVP speed, but avoid MVP-only throwaway code.
- Separate UI, application flow, and infrastructure concerns.
- Keep files focused on one responsibility.
- Favor contracts first for components likely to change later.

## Operating Model

These rules govern how development work is performed. They exist to keep the automation loop reliable.

- ALL implementation is performed by running `python3 scripts/execute.py <phase>`. Not by conversation. Not by direct editing.
- Humans write step specs (`phases/<phase>/stepN.md`) and review results. Nothing else.
- `phases/<phase>/index.json` is written only by the executor. Humans do not edit it directly.
- A step spec must be ready and reviewed before `execute.py` is invoked. No spec = no execution.
- When `execute.py` finishes, the human reviews the output artifact and either accepts or revises the spec.

## Harness Rules

These rules apply to the executor agent running a step.

- Read this file and the relevant files in `docs/` before executing a step.
- Implement only what the step spec requires. Do not expand scope.
- Update step status only inside the relevant `phases/<phase>/index.json`.
- Use these statuses only: `pending`, `completed`, `error`, `blocked`.
- On success, include a short `summary`.
- On failure after retries, include `error_message`.
- On blocked work, include `blocked_reason`.
- A step is not `completed` until its Acceptance Criteria commands all exit 0.
