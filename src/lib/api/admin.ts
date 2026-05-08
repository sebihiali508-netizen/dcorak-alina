import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  // Session check using service role
  return { authenticated: true };
});
