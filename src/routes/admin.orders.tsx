import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, AlertCircle, RefreshCw } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { DataTable } from "@/components/admin/DataTable";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusTabs = [
  { value: "", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "processing", label: "En cours" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <h2 className="text-xl font-semibold text-foreground">Erreur de chargement</h2>
      <p className="text-sm text-muted-foreground">
        {(error as any)?.message || "Impossible de charger les commandes."}
      </p>
      <Button onClick={() => window.location.reload()} className="bg-gold text-gold-foreground">
        <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
      </Button>
    </div>
  ),
});

function OrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useOrders({
    status: statusFilter,
    search,
    page,
    pageSize: 20,
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Erreur de chargement</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {(error as any)?.message || "Impossible de charger les commandes."}
        </p>
        <Button onClick={() => refetch()} className="bg-gold text-gold-foreground">
          <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
        </Button>
      </div>
    );
  }

  const orders = data?.orders ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  const columns = [
    {
      key: "order_number",
      label: "Commande",
      render: (item: any) => (
        <div>
          <p className="text-sm font-medium text-gold">{item.order_number}</p>
          <p className="text-[10px] text-muted-foreground">{formatDate(item.created_at)}</p>
        </div>
      ),
    },
    {
      key: "customer_name",
      label: "Client",
      render: (item: any) => (
        <div>
          <p className="text-sm text-foreground">{item.customer_name}</p>
          {item.customer_phone && (
            <p className="text-[10px] text-muted-foreground">{item.customer_phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "total_amount",
      label: "Total",
      sortable: true,
      className: "text-right",
      render: (item: any) => (
        <p className="text-sm text-foreground font-medium">{formatPrice(item.total_amount)}</p>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (item: any) => <OrderStatusBadge status={item.status} />,
    },
    {
      key: "payment_status",
      label: "Paiement",
      hideOnMobile: true,
      render: (item: any) => <PaymentStatusBadge status={item.payment_status} />,
    },
    {
      key: "payment_method",
      label: "Méthode",
      hideOnMobile: true,
      render: (item: any) => (
        <span className="text-xs text-muted-foreground capitalize">
          {item.payment_method?.replace(/_/g, " ") || "-"}
        </span>
      ),
    },
  ];

  const filters = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 border-white/5 text-muted-foreground text-xs"
      >
        <Download className="h-3 w-3 mr-1" /> Exporter
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-display">Commandes</h2>
        <p className="text-sm text-muted-foreground mt-1">Gérez les commandes clients</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              statusFilter === tab.value
                ? "bg-gold/10 text-gold border-gold/30"
                : "bg-surface-2 text-muted-foreground border-white/5 hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher par client ou commande..."
        filters={filters}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        onRowClick={(item) => navigate({ to: `/admin/orders/${item.id}` })}
        emptyMessage="Aucune commande trouvée"
      />
    </div>
  );
}
