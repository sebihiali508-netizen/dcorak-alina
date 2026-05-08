import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { DataTable } from "@/components/admin/DataTable";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomers({ search, page, pageSize: 20 });
  const customers = data?.customers ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  const columns = [
    {
      key: "full_name",
      label: "Client",
      render: (item: any) => (
        <div>
          <p className="text-sm font-medium text-foreground">{item.full_name || "Anonyme"}</p>
          <p className="text-[10px] text-muted-foreground">{item.email || "-"}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Téléphone",
      render: (item: any) => <span className="text-sm text-foreground">{item.phone || "-"}</span>,
    },
    {
      key: "city",
      label: "Wilaya",
      hideOnMobile: true,
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">{item.wilaya || item.city || "-"}</span>
      ),
    },
    {
      key: "orders_count",
      label: "Commandes",
      className: "text-right",
      render: (item: any) => (
        <span className="text-sm text-foreground font-medium">{item.orders_count || 0}</span>
      ),
    },
    {
      key: "total_spent",
      label: "Total dépensé",
      sortable: true,
      className: "text-right",
      render: (item: any) => (
        <span className="text-sm text-foreground font-medium">
          {formatPrice(item.total_spent || 0)}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Inscrit le",
      hideOnMobile: true,
      render: (item: any) => (
        <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
      ),
    },
  ];

  const filters = (
    <Button
      variant="outline"
      size="sm"
      className="h-8 border-white/5 text-muted-foreground text-xs"
    >
      <Download className="h-3 w-3 mr-1" /> Exporter
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-display">Clients</h2>
        <p className="text-sm text-muted-foreground mt-1">Gérez votre base clients</p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un client..."
        filters={filters}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        emptyMessage="Aucun client trouvé"
      />
    </div>
  );
}
