import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return categories ?? [];
});

export const createCategory = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return category;
});

export const updateCategory = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { id, ...rest } = data;
  const { data: category, error } = await supabase
    .from("categories")
    .update(rest)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return category;
});

export const deleteCategory = createServerFn({ method: "POST" }).handler(
  async ({ data: id }: any) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  },
);
