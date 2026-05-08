import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

const PIE_COLORS = ["#d4af37", "#a87f25", "#e7c769", "#8a6a1a", "#c5a028", "#6b4f10"];

function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Analytiques</h2>
          <p className="text-sm text-muted-foreground mt-1">Rapports et statistiques</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/5 text-muted-foreground">
          <Download className="h-4 w-4 mr-2" /> Exporter le rapport
        </Button>
      </div>

      {/* Revenue overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Évolution du revenu"
          subtitle="30 derniers jours"
          className="lg:col-span-2"
        >
          <div className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenue_by_day ?? []}>
                  <defs>
                    <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [formatPrice(value), "Revenu"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#d4af37"
                    fill="url(#analyticsRev)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <ChartCard title="Commandes par statut">
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
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(stats?.orders_by_status ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Products by category */}
        <ChartCard title="Produits par catégorie">
          <div className="h-64">
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
                    outerRadius={80}
                    innerRadius={50}
                    label={({ category, count }) => `${category} (${count})`}
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
        </ChartCard>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Revenu total</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {formatPrice(stats?.total_revenue ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Produits</p>
          <p className="text-xl font-bold text-foreground mt-1">{stats?.total_products ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Commandes actives</p>
          <p className="text-xl font-bold text-foreground mt-1">{stats?.active_orders ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Croissance revenu</p>
          <p
            className={`text-xl font-bold mt-1 ${(stats?.revenue_growth ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {stats?.revenue_growth ?? 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
