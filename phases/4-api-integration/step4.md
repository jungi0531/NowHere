# Step 4: supabase-session-log

## Read First

- `/CLAUDE.md`
- `/infrastructure/env/index.ts`
- `/infrastructure/supabase/index.ts`
- `/shared/store/session-draft.ts`

## Goal

Create a Supabase session logging service that records each completed meditation session to a `meditation_sessions` table via the Supabase REST API (no SDK, plain `fetch`).

## Work

### infrastructure/db/sessions.ts (new file)

Create `infrastructure/db/sessions.ts`:

```typescript
import { requireEnv } from '@/infrastructure/env';
import type { SessionDuration, SessionMood } from '@/shared/store/session-draft';

export type SessionLog = {
  id: string;
  mood: SessionMood;
  energy: number;
  note: string;
  duration: SessionDuration;
  scriptText: string;
  audioUri: string;
  createdAt: string;
};

export async function logSession(log: SessionLog): Promise<void> {
  const { supabaseUrl, supabaseAnonKey } = requireEnv();
  const url = `${supabaseUrl}/rest/v1/meditation_sessions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      id: log.id,
      mood: log.mood,
      energy: log.energy,
      note: log.note,
      duration_minutes: log.duration,
      script_text: log.scriptText,
      audio_uri: log.audioUri,
      created_at: log.createdAt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase logSession error ${response.status}: ${errorText}`);
  }
}
```

Note for the user: run this SQL in the Supabase SQL editor before using the app:

```sql
create table if not exists meditation_sessions (
  id uuid primary key,
  mood text not null,
  energy integer not null,
  note text,
  duration_minutes integer not null,
  script_text text,
  audio_uri text,
  created_at timestamptz default now()
);
alter table meditation_sessions enable row level security;
create policy "allow anon insert" on meditation_sessions for insert with check (true);
```

### infrastructure/db/index.ts (new file)

```typescript
export { logSession } from './sessions';
export type { SessionLog } from './sessions';
```

### infrastructure/index.ts

Verify `infrastructure/index.ts` exists (created in step 2). Add a `./db` export if not already present:

```typescript
export * from './ai';
export * from './db';
```

## Acceptance Criteria

```bash
python3 scripts/verify.py
npm run typecheck
npm run lint
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
