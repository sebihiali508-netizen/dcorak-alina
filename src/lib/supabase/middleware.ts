import { createClient } from "./server";

export async function requireAdmin() {
  const supabase = createClient();

  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();
  if (error) throw new Error("Unauthorized");

  return { supabase };
}
