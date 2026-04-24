export type PublicEnv = {
  expoPublicSupabaseUrl?: string;
  expoPublicSupabaseAnonKey?: string;
};

export function getPublicEnv(): PublicEnv {
  return {
    expoPublicSupabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    expoPublicSupabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  };
}
