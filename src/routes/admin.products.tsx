import { useState } from "react";
import { createFileRoute, useNavigate, Outlet, useLocation } from "@tanstack/react-router";
import {
  Plus,
  MoreHorizontal,
  Copy,
  Archive,
  Trash2,
  AlertCircle,
  RefreshCw,
  Package,
} from "lucide-react";
import {
  useProducts,
  useDeleteProduct,
  useBulkDeleteProducts,
  useBulkUpdateProductStatus,
} from "@/hooks/useProducts";
import { DataTable } from "@/components/admin/DataTable";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
  errorComponent: ({ error }) => {
    const navigate = useNavigate();
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Erreur de chargement</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {(error as any)?.message || "Une erreur est survenue lors du chargement des produits."}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/admin/dashboard" })}
            className="border-white/5"
          >
            Retour au tableau de bord
          </Button>
          <Button onClick={() => window.location.reload()} className="bg-gold text-gold-foreground">
            <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
          </Button>
        </div>
      </div>
    );
  },
});

function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Aucun produit</h2>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        Votre catalogue est vide. Commencez par ajouter votre premier produit.
      </p>
      <Button onClick={onCreate} className="bg-gold text-gold-foreground hover:bg-gold/90">
        <Plus className="h-4 w-4 mr-2" /> Ajouter un produit
      </Button>
    </div>
  );
}

function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isChildRoute = location.pathname !== "/admin/products";

  if (isChildRoute) return <Outlet />;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useProducts({
    search,
    category,
    status,
    page,
    pageSize: 20,
  });
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();
  const bulkStatus = useBulkUpdateProductStatus();

  const products = data?.products ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  if (isLoading) return <ProductsSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Erreur de chargement</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {(error as any)?.message || "Impossible de charger les produits."}
        </p>
        <Button onClick={() => refetch()} className="bg-gold text-gold-foreground">
          <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
        </Button>
      </div>
    );
  }

  if (!isLoading && products.length === 0 && !search && category === "all" && status === "all") {
    return <EmptyState onCreate={() => navigate({ to: "/admin/products/new" })} />;
  }

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success("Produit supprimé");
      setDeleteId(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedIds);
      toast.success(`${selectedIds.length} produits supprimés`);
      setSelectedIds([]);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkStatus = async (newStatus: "active" | "draft" | "archived") => {
    try {
      await bulkStatus.mutateAsync({ ids: selectedIds, status: newStatus });
      toast.success(`Statut mis à jour pour ${selectedIds.length} produits`);
      setSelectedIds([]);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filters = (
    <>
      <Select
        value={category}
        onValueChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-32 h-9 bg-surface-2 border-white/5 text-xs">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent className="bg-surface border-white/5">
          <SelectItem value="all" className="text-muted-foreground">
            Toutes
          </SelectItem>
          <SelectItem value="bureau" className="text-foreground">
            Bureau
          </SelectItem>
          <SelectItem value="dressing" className="text-foreground">
            Dressing
          </SelectItem>
          <SelectItem value="cuisine" className="text-foreground">
            Cuisine
          </SelectItem>
          <SelectItem value="rangement" className="text-foreground">
            Rangement
          </SelectItem>
          <SelectItem value="salon" className="text-foreground">
            Salon
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={status}
        onValueChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-28 h-9 bg-surface-2 border-white/5 text-xs">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent className="bg-surface border-white/5">
          <SelectItem value="all" className="text-muted-foreground">
            Tous
          </SelectItem>
          <SelectItem value="active" className="text-emerald-400">
            Actif
          </SelectItem>
          <SelectItem value="draft" className="text-yellow-400">
            Brouillon
          </SelectItem>
          <SelectItem value="archived" className="text-muted-foreground">
            Archivé
          </SelectItem>
        </SelectContent>
      </Select>
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1">
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {selectedIds.length}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs border-white/5">
                Statut
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-surface border-white/5">
              <DropdownMenuItem
                onClick={() => handleBulkStatus("active")}
                className="text-emerald-400"
              >
                Actif
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkStatus("draft")}
                className="text-yellow-400"
              >
                Brouillon
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkStatus("archived")}
                className="text-muted-foreground"
              >
                Archivé
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );

  const columns = [
    {
      key: "name",
      label: "Produit",
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-surface-2 overflow-hidden shrink-0">
            {item.images?.[0] ? (
              <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                N/A
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {item.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{item.sku || "Pas de SKU"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      sortable: true,
      render: (item: any) => (
        <Badge
          variant="outline"
          className="text-[10px] capitalize border-white/5 text-muted-foreground"
        >
          {item.category}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Prix",
      sortable: true,
      className: "text-right",
      render: (item: any) => (
        <div className="text-right">
          <p className="text-sm text-foreground font-medium">{formatPrice(item.price)}</p>
          {item.sale_price && (
            <p className="text-[10px] text-emerald-400 line-through">
              {formatPrice(item.sale_price)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "stock_quantity",
      label: "Stock",
      sortable: true,
      className: "text-right",
      render: (item: any) => (
        <span
          className={`text-sm font-medium ${item.stock_quantity < 5 ? "text-red-400" : "text-foreground"}`}
        >
          {item.stock_quantity}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (item: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
            item.status === "active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : item.status === "draft"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
          }`}
        >
          {item.status === "active" ? "Actif" : item.status === "draft" ? "Brouillon" : "Archivé"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      hideOnMobile: true,
      render: (item: any) => (
        <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e: any) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-surface border-white/5 w-36">
            <DropdownMenuItem
              onClick={() => navigate({ to: "/admin/products/$id", params: { id: item.id } })}
              className="text-foreground"
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground">
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuItem className="text-yellow-400">
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Produits</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez votre catalogue</p>
        </div>
        <Button
          onClick={() => navigate({ to: "/admin/products/new" })}
          className="bg-gold text-gold-foreground hover:bg-gold/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={false}
        searchValue={search}
        onSearch={setSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        filters={filters}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        onRowClick={(item) => navigate({ to: "/admin/products/$id", params: { id: item.id } })}
        selectedIds={selectedIds}
        onSelectChange={(id) => {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
          );
        }}
        emptyMessage="Aucun produit trouvé"
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-surface border-white/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/5 text-muted-foreground">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
