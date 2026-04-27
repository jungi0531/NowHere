# Step 1: history-screen

## Read First

- `/CLAUDE.md`
- `/infrastructure/db/sessions.ts`
- `/app/_layout.tsx`

## Goal

Add a history screen that fetches the 20 most recent sessions from Supabase
and displays them in a scrollable list. No new navigation tab — accessible
via a button on the home screen.

## Work

### infrastructure/db/sessions.ts

Add a `fetchRecentSessions` function below `logSession`:

```typescript
export type SessionSummary = {
  id: string;
  mood: string;
  duration: number;
  createdAt: string;
};

export async function fetchRecentSessions(limit = 20): Promise<SessionSummary[]> {
  const { supabaseUrl, supabaseAnonKey } = requireEnv();
  const url = `${supabaseUrl}/rest/v1/meditation_sessions?select=id,mood,duration_minutes,created_at&order=created_at.desc&limit=${limit}`;

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`fetchRecentSessions error ${response.status}`);
  }

  const rows: { id: string; mood: string; duration_minutes: number; created_at: string }[] =
    await response.json();

  return rows.map((r) => ({
    id: r.id,
    mood: r.mood,
    duration: r.duration_minutes,
    createdAt: r.created_at,
  }));
}
```

features/history/ (new feature directory)

Create features/history/presentation/history-screen.tsx:

- Fetch sessions on mount using fetchRecentSessions
- Show a loading state while fetching
- Show an empty state if the list is empty
- Render each session as a row showing: mood, duration (minutes), date (YYYY-MM-DD)
- Use existing shared components: AppScreen, SurfaceCard, AppButton, ScreenIntro

Create features/history/index.ts exporting HistoryScreen.

Update features/index.ts to re-export from ./history.

app/history.tsx (new route)

import { HistoryScreen } from '@/features/history';
export default function HistoryRoute() {
  return <HistoryScreen />;
}

features/home/presentation/home-screen.tsx

Add a secondary AppButton labeled "지난 세션" that navigates to /history.

Acceptance Criteria

```bash
python3 scripts/verify.py
npm run typecheck
npm run lint
```

Status Rules

- success: mark completed with summary
- failure after retries: mark error with error_message
- user action needed: mark blocked with blocked_reason
