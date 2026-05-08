import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    name_ar: "",
    slug: "",
    description: "",
    parent_id: "",
    sort_order: 0,
  });

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: "", name_ar: "", slug: "", description: "", parent_id: "", sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      name_ar: cat.name_ar || "",
      slug: cat.slug,
      description: cat.description || "",
      parent_id: cat.parent_id || "",
      sort_order: cat.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const slug =
        form.slug ||
        form.name
          .toLowerCase()
          .replace(/[^a-z]+/g, "-")
          .replace(/^-|-$/g, "");
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...form, slug });
        toast.success("Catégorie mise à jour");
      } else {
        await createCategory.mutateAsync({ ...form, slug });
        toast.success("Catégorie créée");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory.mutateAsync(deleteId);
      toast.success("Catégorie supprimée");
      setDeleteId(null);
    } catch {
      toast.error("Erreur de suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Catégories</h2>
          <p className="text-sm text-muted-foreground mt-1">Organisez vos produits</p>
        </div>
        <Button onClick={openCreate} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Category list */}
      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : categories && categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-surface p-4 hover:border-gold/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{cat.name}</p>
                    {cat.name_ar && (
                      <span className="text-xs text-muted-foreground font-arabic" dir="rtl">
                        {cat.name_ar}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-white/5 text-muted-foreground"
                    >
                      {cat.product_count || 0} produits
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">/c/{cat.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(cat)}
                  className="text-muted-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(cat.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune catégorie</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-surface border-white/5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom (FR)</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editingCategory
                      ? form.slug
                      : e.target.value
                          .toLowerCase()
                          .replace(/[^a-z]+/g, "-")
                          .replace(/^-|-$/g, ""),
                  })
                }
                placeholder="Nom de la catégorie"
                className="bg-surface-2 border-white/5"
              />
            </div>
            <div>
              <Label>Nom (AR)</Label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                placeholder="اسم التصنيف"
                dir="rtl"
                className="bg-surface-2 border-white/5"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="slug-categorie"
                className="bg-surface-2 border-white/5 font-mono text-xs"
              />
            </div>
            <div>
              <Label>Ordre</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="bg-surface-2 border-white/5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-white/5 text-muted-foreground"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={createCategory.isPending || updateCategory.isPending}
              className="bg-gold text-gold-foreground"
            >
              {editingCategory ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-surface border-white/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Supprimer la catégorie ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible.
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
