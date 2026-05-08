import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { useDashboardStats } from "@/hooks/useDashboard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

const CHART_COLORS = ["#d4af37", "#a87f25", "#e7c769", "#8a6a1a", "#c5a028"];
const PIE_COLORS = ["#d4af37", "#a87f25", "#e7c769", "#8a6a1a", "#c5a028", "#6b4f10"];

function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-display">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Aperçu de votre activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Produits"
          value={stats?.total_products ?? 0}
          icon={<Package className="h-6 w-6" />}
          trend={stats?.products_growth}
          trendLabel="vs mois dernier"
        />
        <StatCard
          title="Commandes actives"
          value={stats?.active_orders ?? 0}
          icon={<ShoppingBag className="h-6 w-6" />}
          trend={stats?.orders_growth}
          trendLabel="vs mois dernier"
        />
        <StatCard
          title="Clients"
          value={stats?.total_customers ?? 0}
          icon={<Users className="h-6 w-6" />}
          trend={stats?.customers_growth}
          trendLabel="vs mois dernier"
        />
        <StatCard
          title="Revenu total"
          value={formatPrice(stats?.total_revenue ?? 0)}
          icon={<DollarSign className="h-6 w-6" />}
          trend={stats?.revenue_growth}
          trendLabel="vs mois dernier"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <ChartCard title="Revenus (30 jours)" subtitle="Évolution quotidienne">
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenue_by_day ?? []}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#888", fontSize: 11 }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#888", fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value: number) => [formatPrice(value), "Revenu"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#d4af37"
                    fill="url(#revenueGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Orders by status */}
        <ChartCard title="Commandes par statut" subtitle="Répartition actuelle">
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.orders_by_status ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="status" tick={{ fill: "#888", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(stats?.orders_by_status ?? []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products by category */}
        <ChartCard title="Produits par catégorie">
          <div className="h-48">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.products_by_category ?? []}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                  >
                    {(stats?.products_by_category ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {(stats?.products_by_category ?? []).map((item) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{item.category}</span>
                <span className="text-foreground font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Low stock alerts */}
        <ChartCard title="Alertes de stock" subtitle="Produits avec stock &lt; 5">
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : stats?.low_stock_products?.length ? (
              stats.low_stock_products.slice(0, 6).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg bg-surface-2 p-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => navigate({ to: `/admin/products/${product.id}` })}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Stock: {product.stock_quantity}
                    </p>
                  </div>
                  <Badge variant="destructive" className="shrink-0 text-[10px]">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {product.stock_quantity}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun stock faible</p>
            )}
          </div>
        </ChartCard>

        {/* Recent orders */}
        <ChartCard title="Dernières commandes" subtitle="Les 10 plus récentes">
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : stats?.recent_orders?.length ? (
              stats.recent_orders.slice(0, 6).map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-surface-2 p-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => navigate({ to: `/admin/orders/${order.id}` })}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium truncate">
                      {order.customer_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(order.created_at)} • {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune commande</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
