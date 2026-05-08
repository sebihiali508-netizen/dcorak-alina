import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";

export const getCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const mapped =
    customers?.map((c) => ({
      ...c,
      orders_count: 0,
      total_spent: 0,
    })) ?? [];

  return { customers: mapped, count: mapped.length };
});
