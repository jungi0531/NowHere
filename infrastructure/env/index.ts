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
