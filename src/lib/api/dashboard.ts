import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();

  const { count: total_products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { data: products_by_category } = await supabase.from("products").select("category");
  const categoryCount: Record<string, number> = {};
  products_by_category?.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at")
    .order("created_at", { ascending: false });

  const active_orders =
    orders?.filter((o) => !["delivered", "cancelled"].includes(o.status)).length ?? 0;
  const total_revenue =
    orders
      ?.filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  const statusCount: Record<string, number> = {};
  orders?.forEach((o) => {
    statusCount[o.status] = (statusCount[o.status] || 0) + 1;
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders =
    orders?.filter((o) => new Date(o.created_at) >= thirtyDaysAgo && o.status === "delivered") ??
    [];

  const revenueByDay: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueByDay[d.toISOString().split("T")[0]] = 0;
  }
  recentOrders.forEach((o) => {
    const key = new Date(o.created_at).toISOString().split("T")[0];
    if (revenueByDay[key] !== undefined) revenueByDay[key] += Number(o.total_amount);
  });

  const { count: total_customers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  const { data: low_stock_products } = await supabase
    .from("products")
    .select("*")
    .lt("stock_quantity", 5)
    .eq("status", "active")
    .order("stock_quantity", { ascending: true })
    .limit(10);

  const { data: last10Orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    total_products: total_products ?? 0,
    active_orders,
    total_customers: total_customers ?? 0,
    total_revenue,
    revenue_growth: 0,
    orders_growth: 0,
    customers_growth: 0,
    products_growth: 0,
    orders_by_status: Object.entries(statusCount).map(([status, count]) => ({ status, count })),
    products_by_category: Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    })),
    revenue_by_day: Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount })),
    low_stock_products: low_stock_products ?? [],
    recent_orders: last10Orders ?? [],
  };
});
