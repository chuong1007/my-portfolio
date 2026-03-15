import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables on client! Please check Vercel Environment Variables settings.");
  }

  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );
}
