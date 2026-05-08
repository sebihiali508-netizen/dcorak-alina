import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data ?? null;
});

export const updateSettings = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { data: settings, error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...data, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return settings;
});
