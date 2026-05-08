import { createBrowserClient } from "@supabase/ssr";

function getEnvVars() {
  const isBrowser = typeof window !== "undefined";

  const url = isBrowser
    ? (window as any).__ENV?.NEXT_PUBLIC_SUPABASE_URL ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;

  const key = isBrowser
    ? (window as any).__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  return { url, key };
}

export const createClient = () => {
  const { url, key } = getEnvVars();

  if (!url) {
    throw new Error(
      "supabaseUrl is required. Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file.\n" +
        "Example: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co",
    );
  }
  if (!key) {
    throw new Error(
      "supabaseKey is required. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    );
  }

  return createBrowserClient(url, key);
};
