import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Eye, Tag, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { productSchema, type ProductFormData } from "@/lib/schemas";
import { slugify, generateSKU } from "@/lib/utils";
import { CATEGORIES, MATERIALS, COLORS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./ImageUploader";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

function errMsg(error: any): string | null {
  return error?.message || null;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map?.((i: any) => (typeof i === "string" ? i : i.url)) || [],
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    initialData?.materials || [],
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.colors || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      name_ar: initialData?.name_ar || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      description_ar: initialData?.description_ar || "",
      category: initialData?.category || "",
      subcategory: initialData?.subcategory || "",
      collection: initialData?.collection || "",
      price: initialData?.price || 0,
      sale_price: initialData?.sale_price ?? null,
      cost_price: initialData?.cost_price ?? null,
      show_price: initialData?.show_price ?? true,
      stock_quantity: initialData?.stock_quantity || 0,
      alert_threshold: initialData?.alert_threshold ?? 5,
      barcode: initialData?.barcode || "",
      short_description: initialData?.short_description || "",
      short_description_ar: initialData?.short_description_ar || "",
      sku: initialData?.sku || "",
      featured: initialData?.featured || false,
      status: initialData?.status || "draft",
      visibility: initialData?.visibility || "visible",
      sort_order: initialData?.sort_order || 0,
      meta_title: initialData?.meta_title || "",
      meta_description: initialData?.meta_description || "",
      meta_keywords: initialData?.meta_keywords || [],
      canonical_url: initialData?.canonical_url || "",
      h1_alternative: initialData?.h1_alternative || "",
      og_title: initialData?.og_title || "",
      og_description: initialData?.og_description || "",
      og_image: initialData?.og_image || "",
      images: [],
      variants: [],
    },
  });

  const name = watch("name");
  const category = watch("category");
  const status = watch("status");
  const featured = watch("featured");

  const handleNameChange = (value: string) => {
    setValue("name", value);
    if (!initialData) {
      setValue("slug", slugify(value));
    }
  };

  const generateSku = () => {
    setValue("sku", generateSKU(category, name));
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m: string) => m !== mat) : [...prev, mat],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c: string) => c !== color) : [...prev, color],
    );
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      images: images.map((url, i) => ({
        url,
        alt_text: "",
        is_primary: i === 0,
        sort_order: i,
      })),
      materials: selectedMaterials,
      colors: selectedColors,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="border-white/5 text-muted-foreground"
          >
            Annuler
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {initialData ? "Mettre à jour" : "Publier"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-surface-2 border border-white/5">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground"
          >
            Général
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground"
          >
            Images
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground"
          >
            SEO
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom (FR)</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nom du produit"
                  className="bg-surface-2 border-white/5"
                />
                {errMsg(errors.name) && (
                  <p className="text-xs text-red-400 mt-1">{errMsg(errors.name)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="name_ar">Nom (AR)</Label>
                <Input
                  id="name_ar"
                  {...register("name_ar")}
                  placeholder="اسم المنتج"
                  dir="rtl"
                  className="bg-surface-2 border-white/5"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="slug-du-produit"
                  className="bg-surface-2 border-white/5 font-mono text-xs"
                />
                {errMsg(errors.slug) && (
                  <p className="text-xs text-red-400 mt-1">{errMsg(errors.slug)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger className="bg-surface-2 border-white/5">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/5">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-foreground">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errMsg(errors.category) && (
                  <p className="text-xs text-red-400 mt-1">{errMsg(errors.category)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description (FR)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={5}
                  placeholder="Description du produit..."
                  className="bg-surface-2 border-white/5"
                />
              </div>
              <div>
                <Label htmlFor="description_ar">Description (AR)</Label>
                <Textarea
                  id="description_ar"
                  {...register("description_ar")}
                  rows={5}
                  placeholder="وصف المنتج..."
                  dir="rtl"
                  className="bg-surface-2 border-white/5"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Prix (DA)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-surface-2 border-white/5"
                  />
                  {errMsg(errors.price) && (
                    <p className="text-xs text-red-400 mt-1">{errMsg(errors.price)}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sale_price">Prix promo (DA)</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    {...register("sale_price", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-surface-2 border-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stock_quantity">Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    {...register("stock_quantity", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-surface-2 border-white/5"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      {...register("sku")}
                      placeholder="SKU"
                      className="bg-surface-2 border-white/5 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSku}
                      className="border-white/5 text-muted-foreground shrink-0"
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <Input
                      type="number"
                      placeholder="Larg."
                      className="bg-surface-2 border-white/5 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Haut."
                      className="bg-surface-2 border-white/5 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Prof."
                      className="bg-surface-2 border-white/5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div>
                <Label>Matériaux</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => toggleMaterial(mat)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        selectedMaterials.includes(mat)
                          ? "bg-gold/10 text-gold border-gold/30"
                          : "bg-surface-2 text-muted-foreground border-white/5 hover:border-white/20"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <Label>Couleurs</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                        selectedColors.includes(c.name)
                          ? "bg-gold/10 text-gold border-gold/30"
                          : "bg-surface-2 text-muted-foreground border-white/5 hover:border-white/20"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ backgroundColor: c.value }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="cursor-pointer">
                    Produit vedette
                  </Label>
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={(v) => setValue("featured", v)}
                    className="data-[state=checked]:bg-gold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="status" className="cursor-pointer">
                    Statut
                  </Label>
                  <Select value={status} onValueChange={(v: any) => setValue("status", v)}>
                    <SelectTrigger className="w-32 bg-surface-2 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-white/5">
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
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <ImageUploader images={images} onChange={setImages} maxFiles={10} maxSize={5} />
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4 max-w-lg">
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              {...register("meta_title")}
              placeholder="Titre SEO"
              className="bg-surface-2 border-white/5"
            />
          </div>
          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              {...register("meta_description")}
              rows={3}
              placeholder="Description pour les moteurs de recherche"
              className="bg-surface-2 border-white/5"
            />
          </div>
          <div className="rounded-lg bg-surface-2 border border-white/5 p-4">
            <p className="text-xs text-muted-foreground mb-1">Aperçu du slug :</p>
            <p className="text-sm text-gold font-mono">
              /produits/{watch("slug") || "slug-du-produit"}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
