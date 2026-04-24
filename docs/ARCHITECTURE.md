# Architecture

## Goal

Build the MVP quickly without creating a codebase that must be thrown away later.

## Target App Structure

When application code is introduced, the repo should evolve toward this structure:

```text
app/                # Expo Router entry points and screens
features/           # Feature modules such as check-in, session, reflection
entities/           # Shared domain types and core models
shared/             # Reusable UI, utils, constants
infrastructure/     # Supabase, Gemini, audio, notifications
```

## Layering Rules

- UI handles rendering and user input.
- Application flow coordinates use cases.
- Infrastructure talks to external systems.
- External SDK shapes should not leak through the whole app.

## Core Service Boundaries

- `CheckinService`
- `ScriptGenerationService`
- `TtsService`
- `PlaybackService`
- `SessionRepository`

These names are architectural guidance, not a requirement to prebuild unnecessary abstractions.

## Data Flow

```text
user input
-> app screen
-> application flow
-> script generation
-> TTS generation
-> storage and session persistence
-> playback UI
```

## Harness Structure

The harness layer in this repo stays separate from the future app code:

```text
docs/               # project truth and execution guidance
phases/             # step plans and phase state
scripts/            # execute and verify entry points
evals/              # future eval definitions
artifacts/verify/   # verification reports
```

## Architecture Constraints

- Keep the harness simple.
- Do not add automation frameworks that require heavy operator overhead.
- Prefer small scripts and explicit markdown over large orchestration systems.
