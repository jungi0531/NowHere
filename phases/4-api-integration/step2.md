# Step 2: gemini-script-service

## Read First

- `/CLAUDE.md`
- `/infrastructure/env/index.ts`
- `/shared/store/session-draft.ts`

## Goal

Create a Gemini meditation script service that takes the user's mood, energy, note, and duration, and returns a Korean meditation guide script string via the Gemini REST API.

## Work

### infrastructure/ai/gemini.ts (new file)

Create `infrastructure/ai/gemini.ts`:

```typescript
import { requireEnv } from '@/infrastructure/env';
import type { SessionDuration, SessionMood } from '@/shared/store/session-draft';

export type ScriptInput = {
  mood: SessionMood;
  energy: number;
  note: string;
  duration: SessionDuration;
};

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function buildPrompt(input: ScriptInput): string {
  return `당신은 한국어 명상 가이드 전문가입니다.
사용자 정보:
- 현재 감정: ${input.mood}
- 에너지 수준: ${input.energy}/10
- 오늘의 메모: ${input.note || '(없음)'}
- 원하는 명상 시간: ${input.duration}분

위 정보를 바탕으로 ${input.duration}분 분량의 한국어 명상 가이드 스크립트를 작성해 주세요.
- 부드럽고 차분한 어조로 작성하세요.
- 호흡 유도 구문을 포함하세요.
- 스크립트만 반환하고 다른 설명은 쓰지 마세요.`;
}

export async function generateMeditationScript(input: ScriptInput): Promise<string> {
  const { geminiApiKey } = requireEnv();
  const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.8 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini script API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini script API returned empty content');

  return text.trim();
}
```

### infrastructure/ai/index.ts (new file)

Create barrel export:

```typescript
export { generateMeditationScript } from './gemini';
export type { ScriptInput } from './gemini';
```

### infrastructure/index.ts

Check if `infrastructure/index.ts` exists. If it does, add an export for `./ai`. If it doesn't exist, create it with:

```typescript
export * from './ai';
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
