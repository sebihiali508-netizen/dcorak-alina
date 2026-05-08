import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { ProductForm } from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ProductFormData } from "@/lib/schemas";

export const Route = createFileRoute("/admin/products/$id")({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct.mutateAsync({ id, data });
      toast.success("Produit mis à jour");
      navigate({ to: "/admin/products" });
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Produit introuvable</p>
      </div>
    );
  }

  const prod = product as any;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-display">Modifier le produit</h2>
        <p className="text-sm text-muted-foreground mt-1">{prod.name}</p>
      </div>
      <ProductForm initialData={prod} onSubmit={handleSubmit} isLoading={updateProduct.isPending} />
    </div>
  );
}
