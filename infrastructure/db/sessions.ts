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
