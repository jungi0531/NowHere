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
