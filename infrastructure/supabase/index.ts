import { getPublicEnv } from '@/infrastructure/env';

export type SupabaseClientContract = {
  url?: string;
  anonKey?: string;
};

export function getSupabaseClientContract(): SupabaseClientContract {
  const env = getPublicEnv();

  return {
    url: env.expoPublicSupabaseUrl,
    anonKey: env.expoPublicSupabaseAnonKey,
  };
}
