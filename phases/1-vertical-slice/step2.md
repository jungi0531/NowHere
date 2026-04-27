# Step 2: flow-wiring

## Read First

- `/CLAUDE.md`
- `/shared/store/session-draft.ts`
- `/phases/1-vertical-slice/step1.md`

## Goal

Connect the remaining screens so the full check-in → length → generating → player path works end-to-end using only local store state. No API calls.

## Work

- `features/meditation-length/presentation/meditation-length-screen.tsx`:
  - read `duration` from store, write `setDuration` on selection
  - "명상 만들기" button navigates to `/generating`
- `features/generating/presentation/generating-screen.tsx`:
  - add `useEffect` that auto-navigates to `/player` after ~3 seconds using `router.replace`
  - animate progress dots step-by-step with `useState` + `setInterval`
  - do not call any external API
- `features/player/presentation/player-screen.tsx`:
  - read `mood` and `duration` from store
  - display a derived session title such as `"${mood} · ${duration}분 명상"`
  - add a local countdown timer using `useEffect` + `setInterval`
  - timer counts down from `duration * 60` seconds
  - "홈으로" resets the store and navigates to `/home`
- do not add persistence, network calls, or audio playback

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
