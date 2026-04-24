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
| Type check | `npm run typecheck` |
| Verify docs and harness structure | `python3 scripts/verify.py` |
| Execute a phase | `python3 scripts/execute.py 0-foundation` |

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

## Harness Rules

- Read this file and the relevant files in `docs/` before executing a step.
- Update step status only inside the relevant `phases/.../index.json`.
- Use these statuses only: `pending`, `completed`, `error`, `blocked`.
- On success, include a short `summary`.
- On failure after retries, include `error_message`.
- On blocked work, include `blocked_reason`.
