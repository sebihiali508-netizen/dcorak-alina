import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "supabaseUrl is required. Add NEXT_PUBLIC_SUPABASE_URL to .env.local\n" +
        "Example: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co",
    );
  }
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required. Add it to .env.local");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("supabaseUrl is required. Add NEXT_PUBLIC_SUPABASE_URL to .env.local");
  }
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required. Add it to .env.local");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
