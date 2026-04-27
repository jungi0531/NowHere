# Step 1: env-and-packages

## Read First

- `/CLAUDE.md`
- `/infrastructure/env/index.ts`
- `/package.json`

## Goal

Extend the env layer to include `GEMINI_API_KEY`, install the two native packages needed for audio (`expo-av`, `expo-file-system`), and create `.env.example` so developers know which vars are required.

## Work

### infrastructure/env/index.ts

Replace the file entirely with the following:

```typescript
export type AppEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiApiKey: string;
};

export function requireEnv(): AppEnv {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!supabaseUrl) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (!geminiApiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');

  return { supabaseUrl, supabaseAnonKey, geminiApiKey };
}
```

- Remove the old `PublicEnv` type and `getPublicEnv` function entirely.
- `EXPO_PUBLIC_` prefix is required for Expo to expose variables to the client bundle.

### infrastructure/supabase/index.ts

Update to use the new `requireEnv`:

```typescript
import { requireEnv } from '@/infrastructure/env';

export type SupabaseClientContract = {
  url: string;
  anonKey: string;
};

export function getSupabaseClientContract(): SupabaseClientContract {
  const env = requireEnv();
  return {
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
  };
}
```

### .env.example (project root)

Create this file at the repo root:

```
# Supabase project URL — found in Supabase dashboard → Settings → API
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anon (public) key — found in Supabase dashboard → Settings → API
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google AI Studio API key — https://aistudio.google.com/apikey
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Install packages

Run these two commands (use `npx expo install` so Expo pins the correct version):

```bash
npx expo install expo-av
npx expo install expo-file-system
```

Do not add them manually to package.json. Run the commands.

## Acceptance Criteria

```bash
python3 scripts/verify.py
npm run typecheck
npm run lint
node -e "const p=require('./package.json'); if(!p.dependencies['expo-av']) process.exit(1); if(!p.dependencies['expo-file-system']) process.exit(1); console.log('packages OK')"
```

## Status Rules

- success: mark this step `completed` and add a short `summary`
- failure after retries: mark this step `error` with `error_message`
- user action needed: mark this step `blocked` with `blocked_reason`
