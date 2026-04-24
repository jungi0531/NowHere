# Step 1: session-draft-store

## Read First

- `/CLAUDE.md`
- `/docs/ARCHITECTURE.md`
- `/shared/index.ts`

## Goal

Introduce a Zustand store that carries the user's check-in inputs across the check-in → length → generating → player flow. Wire CheckInScreen to use it so mood, energy, and note are interactive.

## Work

- install `zustand` as a production dependency
- create `shared/store/session-draft.ts` with:
  - `SessionMood` union type for the six mood values
  - `SessionDuration` union type `3 | 5 | 10`
  - `useSessionDraftStore` exposing `mood`, `energy`, `note`, `duration` and their setters plus `reset`
  - `clampEnergy` to keep energy in 0–100
- export the store from `shared/index.ts` or a re-export path
- update `features/check-in/presentation/check-in-screen.tsx`:
  - mood cards become interactive (Pressable, selected state from store)
  - energy becomes interactive (tap options to change value)
  - TextInput becomes editable, writes to store
  - "다음" button navigates to `/length`
- do not add API calls, persistence, or external services

## Acceptance Criteria

```bash
npm run typecheck
npm run lint
python3 scripts/verify.py
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
