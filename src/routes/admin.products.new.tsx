import { useState, useRef, useCallback, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  Eye,
  Sparkles,
  Upload,
  X,
  GripVertical,
  Star,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Hash,
  Ruler,
  Palette,
  DollarSign,
  Package,
  Search,
  RefreshCw,
  ArrowLeft,
  Settings,
  Globe,
  Tags,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateFullProduct, useGenerateSku } from "@/hooks/useProducts";
import { uploadProductImage } from "@/lib/upload";
import {
  productSchema,
  type ProductFormData,
  type ProductImageData,
  type ProductVariantData,
} from "@/lib/schemas";
import { slugify, generateSKU, cn } from "@/lib/utils";
import { CATEGORIES, SUBCATEGORIES, MATERIALS, COLORS, formatPrice } from "@/types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Control } from "react-hook-form";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProductPage,
});

const VARIANTS_STORAGE_KEY = "decorak_product_draft";

function NewProductPage() {
  const navigate = useNavigate();
  const createFullProduct = useCreateFullProduct();
  const generateSku = useGenerateSku();
  const [activeTab, setActiveTab] = useState("general");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteVariantIndex, setDeleteVariantIndex] = useState<number | null>(null);
  const [skusGenerated, setSkusGenerated] = useState<Record<number, string>>({});

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      name_ar: "",
      slug: "",
      sku: "",
      category: "",
      subcategory: "",
      collection: "",
      price: 0,
      sale_price: undefined,
      cost_price: undefined,
      show_price: true,
      stock_quantity: 0,
      alert_threshold: 5,
      barcode: "",
      short_description: "",
      short_description_ar: "",
      description: "",
      description_ar: "",
      featured: false,
      status: "draft",
      visibility: "visible",
      meta_title: "",
      meta_description: "",
      meta_keywords: [],
      canonical_url: "",
      h1_alternative: "",
      og_title: "",
      og_description: "",
      og_image: "",
      images: [],
      variants: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    formState: { errors, isDirty },
  } = form;

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "variants",
  });

  const name = watch("name");
  const category = watch("category");
  const price = watch("price");
  const status = watch("status");
  const featured = watch("featured");
  const showPrice = watch("show_price");
  const visibility = watch("visibility");
  const images = watch("images");
  const variants = watch("variants");
  const metaTitle = watch("meta_title");
  const metaDesc = watch("meta_description");
  const shortDesc = watch("short_description") || "";
  const shortDescAr = watch("short_description_ar") || "";
  const metaKeywords = watch("meta_keywords") || [];

  useEffect(() => {
    if (name && !getValues("slug")) {
      setValue("slug", slugify(name));
    }
  }, [name, setValue, getValues]);

  useEffect(() => {
    if (category && !getValues("sku")) {
      generateSku.mutate(
        { category },
        {
          onSuccess: (sku) => setValue("sku", sku as string),
        },
      );
    }
  }, [category, setValue, getValues, generateSku]);

  useEffect(() => {
    if (name) setValue("canonical_url", `/produits/${slugify(name)}`);
  }, [name, setValue]);

  useEffect(() => {
    const saved = localStorage.getItem(VARIANTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const timer = Date.now() - parsed.timestamp;
        if (timer < 3600000 && parsed.data) return;
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const values = getValues();
      localStorage.setItem(
        VARIANTS_STORAGE_KEY,
        JSON.stringify({
          data: values,
          timestamp: Date.now(),
        }),
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [getValues]);

  const handleNameChange = (value: string) => {
    setValue("name", value);
    setValue("slug", slugify(value));
    setValue("canonical_url", `/produits/${slugify(value)}`);
  };

  const addVariant = () => {
    append({
      name: "",
      length: null,
      width: null,
      height: null,
      depth: null,
      is_custom_dimensions: false,
      material: null,
      color: null,
      color_hex: null,
      price: null,
      use_product_price: true,
      stock: null,
      use_product_stock: true,
      sku: "",
      image_url: null,
      sort_order: fields.length,
    });
  };

  const duplicateVariant = (index: number) => {
    const v = variants[index];
    append({ ...v, name: `${v.name} (copie)`, sort_order: fields.length });
  };

  const bulkSetPrice = () => {
    const val = prompt("Prix à appliquer à toutes les variantes (DZD):");
    if (val !== null && !isNaN(Number(val))) {
      fields.forEach((_, i) => {
        update(i, { ...variants[i], price: Number(val), use_product_price: false });
      });
    }
  };

  const bulkSetStock = () => {
    const val = prompt("Stock à appliquer à toutes les variantes:");
    if (val !== null && !isNaN(Number(val))) {
      fields.forEach((_, i) => {
        update(i, { ...variants[i], stock: Number(val), use_product_stock: false });
      });
    }
  };

  const handleImageUpload = useCallback(
    async (files: FileList) => {
      const currentImages = getValues("images");
      const remaining = 10 - currentImages.length;
      const toUpload = Array.from(files).slice(0, remaining);

      for (const file of toUpload) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 5MB`);
          continue;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          toast.error(`${file.name} format non supporté`);
          continue;
        }

        try {
          const result = await uploadProductImage(file);
          const newImg: ProductImageData = {
            url: result.url,
            alt_text: "",
            is_primary: currentImages.length === 0 && getValues("images").length === 0,
            file_name: file.name,
            file_size: file.size,
            sort_order: getValues("images").length,
          };
          const updated = [...getValues("images"), newImg];
          setValue("images", updated);
        } catch (err) {
          const message = err instanceof Error ? err.message : `Erreur upload: ${file.name}`;
          toast.error(message);
          console.error("Upload failed:", file.name, err);
        }
      }
    },
    [setValue, getValues],
  );

  const removeImage = (index: number) => {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({
        ...img,
        sort_order: i,
        is_primary: i === 0 && images.length > 1 ? true : img.is_primary,
      }));
    if (updated.length > 0 && !updated.some((i) => i.is_primary)) {
      updated[0].is_primary = true;
    }
    setValue("images", updated);
  };

  const setPrimaryImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    setValue("images", updated);
  };

  const moveImage = (from: number, to: number) => {
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setValue(
      "images",
      updated.map((img, i) => ({ ...img, sort_order: i })),
    );
  };

  const addKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    const current = getValues("meta_keywords") || [];
    if (!current.includes(keyword.trim())) {
      setValue("meta_keywords", [...current, keyword.trim()]);
    }
  };

  const removeKeyword = (index: number) => {
    const current = getValues("meta_keywords") || [];
    setValue(
      "meta_keywords",
      current.filter((_, i) => i !== index),
    );
  };

  const beforePublish = () => {
    const values = getValues();
    const checks = {
      "Informations de base complètes": !!values.name && !!values.category && !!values.slug,
      "Prix défini": values.price > 0,
      "Stock défini": values.stock_quantity >= 0,
      "Au moins une image ajoutée": values.images.length > 0,
      "Variantes optionnelles": true,
    };
    return checks;
  };

  const handlePublish = async () => {
    const checks = beforePublish();
    const allPass = Object.values(checks).every(Boolean);
    if (!allPass) {
      setShowChecklist(true);
      return;
    }
    setIsPublishing(true);
    try {
      const data = { ...getValues(), status: "active", visibility: "visible" };
      await createFullProduct.mutateAsync(data);
      localStorage.removeItem(VARIANTS_STORAGE_KEY);
      toast.success("Produit publié avec succès");
      navigate({ to: "/admin/products" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la publication");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    toast.success("Brouillon sauvegardé");
  };

  const generateVariantSku = (index: number) => {
    const baseSku = getValues("sku") || "DA";
    const variant = variants[index];
    const code = variant.name ? variant.name.slice(0, 3).toUpperCase() : `VAR${index + 1}`;
    const newSku = `${baseSku}-${code}`;
    update(index, { ...variant, sku: newSku });
    setSkusGenerated((prev) => ({ ...prev, [index]: newSku }));
  };

  const checklist = beforePublish();

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-strong border-b border-white/5">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: "/admin/products" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          to="/admin/dashboard"
                          className="text-xs text-muted-foreground hover:text-gold"
                        >
                          Dashboard
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          to="/admin/products"
                          className="text-xs text-muted-foreground hover:text-gold"
                        >
                          Produits
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs text-foreground">
                        Ajouter un produit
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-lg font-display font-bold text-foreground mt-0.5">
                  Nouveau produit
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(handlePublish)}
        className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6"
      >
        {/* Section tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-surface border border-white/5 rounded-lg p-1 h-auto overflow-x-auto">
            <TabsTrigger
              value="general"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground data-[state=active]:shadow-gold text-xs lg:text-sm py-2.5"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              GÉNÉRAL
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground data-[state=active]:shadow-gold text-xs lg:text-sm py-2.5"
            >
              <ImageIcon className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              IMAGES
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground data-[state=active]:shadow-gold text-xs lg:text-sm py-2.5"
            >
              <Package className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              VARIANTES
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground data-[state=active]:shadow-gold text-xs lg:text-sm py-2.5"
            >
              <Globe className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GENERAL */}
          <TabsContent
            value="general"
            className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left + Center */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gold" />
                    Informations générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Nom du produit (FR) <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        {...register("name")}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Bureau moderne en bois"
                        className={cn(
                          "h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15",
                          errors.name && "border-red-400/50 shake",
                        )}
                      />
                      {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Nom du produit (AR)</Label>
                      <Input
                        {...register("name_ar")}
                        placeholder="مكتب عصري خشبي"
                        dir="rtl"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 font-arabic"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Slug</Label>
                      <Input
                        {...register("slug")}
                        placeholder="bureau-moderne-bois"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 font-mono text-xs"
                      />
                      {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Référence (SKU)</Label>
                      <Input
                        {...register("sku")}
                        placeholder="DA-001"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Categorization */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tags className="h-4 w-4 text-gold" />
                    Catégorisation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Catégorie <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(v) => {
                          setValue("category", v);
                          setValue("subcategory", "");
                        }}
                      >
                        <SelectTrigger className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121a] border-white/10">
                          {CATEGORIES.map((cat) => (
                            <SelectItem
                              key={cat.value}
                              value={cat.value}
                              className="text-foreground focus:bg-gold/10"
                            >
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-xs text-red-400">{errors.category.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Sous-catégorie</Label>
                      <Select
                        value={watch("subcategory")}
                        onValueChange={(v) => setValue("subcategory", v)}
                      >
                        <SelectTrigger className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121a] border-white/10">
                          {(SUBCATEGORIES[category] || []).map((sub) => (
                            <SelectItem
                              key={sub.value}
                              value={sub.value}
                              className="text-foreground"
                            >
                              {sub.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Collection</Label>
                      <Input
                        {...register("collection")}
                        placeholder="Collection été 2025"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gold" />
                    Prix
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Prix régulier (DZD) <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          {...register("price", { valueAsNumber: true })}
                          placeholder="0"
                          className={cn(
                            "h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 pl-4 pr-16",
                            errors.price && "border-red-400/50",
                          )}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          DZD
                        </span>
                      </div>
                      {errors.price && (
                        <p className="text-xs text-red-400">{errors.price.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Prix promo (DZD)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          {...register("sale_price", { valueAsNumber: true })}
                          placeholder="0"
                          className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 pl-4 pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          DZD
                        </span>
                      </div>
                      {errors.sale_price && (
                        <p className="text-xs text-red-400">{errors.sale_price.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Coût de fabrication (DZD)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          {...register("cost_price", { valueAsNumber: true })}
                          placeholder="0"
                          className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 pl-4 pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          DZD
                        </span>
                      </div>
                      {price > 0 && watch("cost_price") ? (
                        <p className="text-xs text-emerald-400 mt-1">
                          Marge: {(((price - (watch("cost_price") || 0)) / price) * 100).toFixed(0)}
                          %
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Label className="text-xs text-muted-foreground cursor-pointer">
                      Afficher le prix sur la fiche produit
                    </Label>
                    <Switch
                      checked={showPrice}
                      onCheckedChange={(v) => setValue("show_price", v)}
                      className="data-[state=checked]:bg-gold"
                    />
                  </div>
                </div>

                {/* Inventory */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-4 w-4 text-gold" />
                    Inventaire
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Quantité en stock <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        type="number"
                        {...register("stock_quantity", { valueAsNumber: true })}
                        placeholder="0"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15"
                      />
                      {errors.stock_quantity && (
                        <p className="text-xs text-red-400">{errors.stock_quantity.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Seuil d'alerte</Label>
                      <Input
                        type="number"
                        {...register("alert_threshold", { valueAsNumber: true })}
                        placeholder="5"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">SKU</Label>
                      <Input
                        {...register("sku")}
                        placeholder="DA-001"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Code-barres (EAN/UPC)</Label>
                      <Input
                        {...register("barcode")}
                        placeholder="123456789012"
                        className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Status */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Statut</h3>
                  <RadioGroup
                    value={status}
                    onValueChange={(v: string) =>
                      setValue("status", v as "active" | "draft" | "archived")
                    }
                    className="gap-2"
                  >
                    {[
                      {
                        value: "draft",
                        label: "Brouillon",
                        desc: "Visible uniquement par vous",
                        color: "text-yellow-400",
                      },
                      {
                        value: "active",
                        label: "Actif",
                        desc: "Visible sur la boutique",
                        color: "text-emerald-400",
                      },
                      {
                        value: "archived",
                        label: "Archivé",
                        desc: "Caché de la boutique",
                        color: "text-muted-foreground",
                      },
                    ].map((s) => (
                      <label
                        key={s.value}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          status === s.value
                            ? "border-gold/30 bg-gold/5"
                            : "border-white/5 hover:border-white/10",
                        )}
                      >
                        <RadioGroupItem
                          value={s.value}
                          className="mt-0.5 data-[state=checked]:border-gold data-[state=checked]:text-gold"
                        />
                        <div>
                          <p className={cn("text-sm font-medium", s.color)}>{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Visibility */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Visibilité</h3>
                  <RadioGroup
                    value={visibility}
                    onValueChange={(v: string) =>
                      setValue("visibility", v as "visible" | "hidden" | "scheduled")
                    }
                    className="gap-2"
                  >
                    {[
                      { value: "visible", label: "Visible", desc: "Visible sur la boutique" },
                      { value: "hidden", label: "Caché", desc: "Masqué de la boutique" },
                      { value: "scheduled", label: "Planifié", desc: "Programmer la publication" },
                    ].map((s) => (
                      <label
                        key={s.value}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          visibility === s.value
                            ? "border-gold/30 bg-gold/5"
                            : "border-white/5 hover:border-white/10",
                        )}
                      >
                        <RadioGroupItem
                          value={s.value}
                          className="mt-0.5 data-[state=checked]:border-gold data-[state=checked]:text-gold"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Featured toggle */}
                <div className="bg-surface border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-foreground cursor-pointer">
                        Produit vedette
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Afficher sur la page d'accueil
                      </p>
                    </div>
                    <Switch
                      checked={featured}
                      onCheckedChange={(v) => setValue("featured", v)}
                      className="data-[state=checked]:bg-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Description</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description courte (FR)</Label>
                  <Textarea
                    {...register("short_description")}
                    rows={3}
                    maxLength={160}
                    placeholder="Brève description du produit..."
                    className="bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 resize-none"
                  />
                  <p className="text-xs text-right text-muted-foreground">{shortDesc.length}/160</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description courte (AR)</Label>
                  <Textarea
                    {...register("short_description_ar")}
                    rows={3}
                    maxLength={160}
                    placeholder="وصف قصير للمنتج..."
                    dir="rtl"
                    className="bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 resize-none font-arabic"
                  />
                  <p className="text-xs text-left text-muted-foreground" dir="rtl">
                    {shortDescAr.length}/160
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description longue (FR)</Label>
                  <Textarea
                    {...register("description")}
                    rows={8}
                    placeholder="Description complète du produit..."
                    className="bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 resize-y min-h-[160px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description longue (AR)</Label>
                  <Textarea
                    {...register("description_ar")}
                    rows={8}
                    placeholder="الوصف الكامل للمنتج..."
                    dir="rtl"
                    className="bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 resize-y min-h-[160px] font-arabic"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: IMAGES */}
          <TabsContent
            value="images"
            className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <ImageUploadTab
              images={images}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              onSetPrimary={setPrimaryImage}
              onMove={moveImage}
              onAltChange={(index, alt) => {
                const updated = [...images];
                updated[index] = { ...updated[index], alt_text: alt };
                setValue("images", updated);
              }}
            />
          </TabsContent>

          {/* TAB 3: VARIANTS */}
          <TabsContent
            value="variants"
            className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-gold" />
                  Variantes ({fields.length})
                </h3>
                <div className="flex items-center gap-2">
                  {fields.length > 1 && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={bulkSetPrice}
                        className="border-white/10 text-muted-foreground hover:text-foreground text-xs h-8"
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Prix
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={bulkSetStock}
                        className="border-white/10 text-muted-foreground hover:text-foreground text-xs h-8"
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Stock
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={addVariant}
                    className="bg-gold text-gold-foreground hover:bg-gold/90 text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ajouter une variante
                  </Button>
                </div>
              </div>

              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-gold/5 flex items-center justify-center">
                    <Package className="h-7 w-7 text-gold/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Aucune variante pour le moment</p>
                  <p className="text-xs text-muted-foreground/60">
                    Ajoutez des variantes pour décliner ce produit (tailles, couleurs, matériaux)
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addVariant}
                    className="border-gold/30 text-gold hover:bg-gold/10 mt-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ajouter une variante
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <VariantCard
                      key={field.id}
                      index={index}
                      control={control}
                      register={register}
                      setValue={setValue}
                      watch={watch}
                      update={update}
                      remove={remove}
                      duplicateVariant={duplicateVariant}
                      onDelete={() => setDeleteVariantIndex(index)}
                      generateVariantSku={generateVariantSku}
                      skusGenerated={skusGenerated}
                    />
                  ))}
                </div>
              )}

              {/* Variant summary table */}
              {fields.length > 0 && (
                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2">
                          Variante
                        </th>
                        <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2 hidden md:table-cell">
                          Dimensions
                        </th>
                        <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2 hidden lg:table-cell">
                          Matériau
                        </th>
                        <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2 hidden lg:table-cell">
                          Couleur
                        </th>
                        <th className="text-right text-xs text-muted-foreground font-medium py-2 px-2">
                          Prix
                        </th>
                        <th className="text-right text-xs text-muted-foreground font-medium py-2 px-2">
                          Stock
                        </th>
                        <th className="text-right text-xs text-muted-foreground font-medium py-2 px-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-2.5 px-2">
                            <p className="text-sm text-foreground font-medium">
                              {v.name || `Variante #${i + 1}`}
                            </p>
                            {v.sku && (
                              <p className="text-[10px] text-muted-foreground font-mono">{v.sku}</p>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-muted-foreground hidden md:table-cell">
                            {v.length || v.width || v.height || v.depth
                              ? `${v.length || "-"}×${v.width || "-"}×${v.height || "-"}×${v.depth || "-"} cm`
                              : "-"}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-muted-foreground hidden lg:table-cell">
                            {v.material || "-"}
                          </td>
                          <td className="py-2.5 px-2 hidden lg:table-cell">
                            {v.color_hex ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-3 w-3 rounded-full border border-white/10"
                                  style={{ backgroundColor: v.color_hex }}
                                />
                                <span className="text-xs text-muted-foreground">{v.color}</span>
                              </div>
                            ) : (
                              v.color || "-"
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-right text-sm text-foreground">
                            {v.use_product_price
                              ? formatPrice(price)
                              : v.price
                                ? formatPrice(v.price)
                                : "-"}
                          </td>
                          <td className="py-2.5 px-2 text-right text-sm text-foreground">
                            {v.use_product_stock ? watch("stock_quantity") : (v.stock ?? "-")}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateVariant(i)}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteVariantIndex(i)}
                                className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 4: SEO */}
          <TabsContent
            value="seo"
            className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SEO fields */}
              <div className="space-y-6">
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Search className="h-4 w-4 text-gold" />
                    SEO - Google
                  </h3>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Meta titre</Label>
                    <Input
                      {...register("meta_title")}
                      placeholder="Titre SEO (max 60 caractères)"
                      maxLength={60}
                      className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15"
                    />
                    <p className="text-xs text-right text-muted-foreground">
                      {(metaTitle || "").length}/60
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Meta description</Label>
                    <Textarea
                      {...register("meta_description")}
                      rows={3}
                      maxLength={160}
                      placeholder="Description pour les moteurs de recherche"
                      className="bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 resize-none"
                    />
                    <p className="text-xs text-right text-muted-foreground">
                      {(metaDesc || "").length}/160
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Mots-clés</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(metaKeywords || []).map((kw, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gold/10 text-gold border border-gold/20"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(i)}
                            className="hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un mot-clé..."
                        className="h-10 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-muted-foreground shrink-0 h-10"
                        onClick={() => {
                          const input = document.querySelector<HTMLInputElement>(
                            '[placeholder="Ajouter un mot-clé..."]',
                          );
                          if (input) {
                            addKeyword(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">URL canonique</Label>
                    <Input
                      {...register("canonical_url")}
                      placeholder="/produits/bureau-moderne-bois"
                      className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Balise H1 alternative</Label>
                    <Input
                      {...register("h1_alternative")}
                      placeholder="Titre H1 personnalisé"
                      className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15"
                    />
                  </div>
                </div>

                {/* Google preview */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Aperçu Google</h3>
                  <div className="bg-white rounded-lg p-4 space-y-1">
                    <p className="text-sm text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
                      {metaTitle || name || "Titre du produit"} | Decorak Alina
                    </p>
                    <p className="text-xs text-[#006d21] truncate">
                      https://decorak-alina.dz
                      {watch("canonical_url") || `/produits/${slugify(name) || "slug-du-produit"}`}
                    </p>
                    <p className="text-xs text-[#545454] line-clamp-2">
                      {metaDesc ||
                        watch("short_description") ||
                        "Découvrez ce produit exceptionnel sur Decorak Alina — mobilier de luxe et décoration haut de gamme."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div className="space-y-6">
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-gold" />
                    Open Graph (Réseaux sociaux)
                  </h3>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Titre OG</Label>
                    <Input
                      {...register("og_title")}
                      placeholder="Titre pour le partage social"
                      className="h-12 bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Description OG</Label>
                    <Textarea
                      {...register("og_description")}
                      rows={3}
                      placeholder="Description pour le partage social"
                      className="bg-[#12121a] border-white/10 focus:border-gold focus:ring-3 focus:ring-gold/15 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Image OG</Label>
                    {images.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setValue("og_image", img.url)}
                            className={cn(
                              "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                              watch("og_image") === img.url
                                ? "border-gold"
                                : "border-white/5 hover:border-white/20",
                            )}
                          >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Ajoutez des images dans l'onglet Images pour sélectionner une image OG
                      </p>
                    )}
                  </div>
                </div>

                {/* Social preview */}
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Aperçu Facebook / LinkedIn
                  </h3>
                  <div className="bg-[#1a1a24] rounded-lg overflow-hidden border border-white/5">
                    <div className="aspect-[1.91/1] bg-[#12121a] flex items-center justify-center">
                      {watch("og_image") ? (
                        <img
                          src={watch("og_image")}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : images[0] ? (
                        <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        decorak-alina.dz
                      </p>
                      <p className="text-sm text-foreground font-medium leading-tight">
                        {watch("og_title") || metaTitle || name || "Titre du produit"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {watch("og_description") ||
                          metaDesc ||
                          "Découvrez ce produit exceptionnel sur Decorak Alina."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/admin/products" })}
              className="border-white/10 text-muted-foreground h-10 text-xs"
            >
              Annuler
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="border-white/10 text-muted-foreground hover:text-foreground h-10 text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Brouillon
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="border-white/10 text-muted-foreground hover:text-foreground h-10 text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Aperçu
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-gold text-gold-foreground hover:bg-gold/90 h-10 text-xs"
            >
              {isPublishing ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              {status === "draft" ? "Publier le produit" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>

      {/* Publish checklist dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="bg-[#12121a] border-white/5 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Avant de publier</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Vérifiez que tous les éléments requis sont complétés
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {Object.entries(checklist).map(([key, pass]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  pass
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-400/20 bg-red-400/5",
                )}
              >
                {pass ? (
                  <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <span className={cn("text-sm", pass ? "text-emerald-400" : "text-red-400")}>
                  {key}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChecklist(false)}
              className="border-white/10 text-muted-foreground"
            >
              Continuer l'édition
            </Button>
            {Object.values(checklist).every(Boolean) && (
              <Button onClick={handlePublish} className="bg-gold text-gold-foreground">
                <Sparkles className="h-4 w-4 mr-2" /> Publier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#12121a] border-white/5 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Aperçu du produit</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 p-1">
              {images[0] && (
                <div className="aspect-video rounded-xl overflow-hidden bg-[#0a0a0f]">
                  <img src={images[0].url} alt={name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {name || "Nom du produit"}
                </h2>
                {watch("name_ar") && (
                  <p className="text-lg font-arabic text-muted-foreground mt-1" dir="rtl">
                    {watch("name_ar")}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-bold text-gold">{formatPrice(price)}</span>
                  {watch("sale_price") ? (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(watch("sale_price") || 0)}
                    </span>
                  ) : null}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {watch("short_description") || "Description courte..."}
                </p>
              </div>
              {variants.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Variantes</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-foreground"
                      >
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete variant confirmation */}
      <AlertDialog
        open={deleteVariantIndex !== null}
        onOpenChange={() => setDeleteVariantIndex(null)}
      >
        <AlertDialogContent className="bg-[#12121a] border-white/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Supprimer la variante</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible. La variante sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-muted-foreground">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteVariantIndex !== null) remove(deleteVariantIndex);
                setDeleteVariantIndex(null);
              }}
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

/* IMAGE UPLOAD TAB COMPONENT */
function ImageUploadTab({
  images,
  onUpload,
  onRemove,
  onSetPrimary,
  onMove,
  onAltChange,
}: {
  images: ProductImageData[];
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
  onSetPrimary: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onAltChange: (index: number, alt: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) onUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        ref={dragRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-300",
          dragOver
            ? "border-gold bg-gold/5 shadow-gold scale-[1.01]"
            : "border-white/10 hover:border-gold/40 hover:bg-gold/5",
        )}
      >
        <div className="h-16 w-16 rounded-2xl bg-gold/5 flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-gold/40" />
        </div>
        <p className="text-base font-medium text-foreground">
          Glissez-déposez vos images ici, ou cliquez pour parcourir
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Jusqu'à 10 images • JPG, PNG, WEBP • 5MB max chacune
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
        >
          <Upload className="h-4 w-4 mr-2" />
          Sélectionner des images
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className={cn(
                "group relative bg-[#0a0a0f] rounded-xl overflow-hidden border transition-all",
                img.is_primary ? "border-gold/50 ring-1 ring-gold/30" : "border-white/5",
              )}
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={img.url}
                  alt={img.alt_text || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onSetPrimary(index)}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      img.is_primary
                        ? "bg-gold text-gold-foreground"
                        : "bg-white/20 text-white hover:bg-gold",
                    )}
                    title="Image principale"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => onMove(index, index - 1)}
                      className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                      title="Déplacer à gauche"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onMove(index, index + 1)}
                      className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                      title="Déplacer à droite"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-semibold rounded-md bg-gold text-gold-foreground shadow-lg">
                    PRINCIPALE
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {img.file_name || `Image ${index + 1}`}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {img.file_size ? `${(img.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Texte alternatif (SEO)"
                  value={img.alt_text || ""}
                  onChange={(e) => onAltChange(index, e.target.value)}
                  className="h-8 text-xs bg-[#12121a] border-white/5"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gold/5 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gold/30" />
          </div>
          <p className="text-sm text-muted-foreground">Ajoutez des images pour votre produit</p>
          <p className="text-xs text-muted-foreground/60">
            Les images aident à vendre — ajoutez au moins une image de qualité
          </p>
        </div>
      )}
    </div>
  );
}

/* VARIANT CARD COMPONENT */
function VariantCard({
  index,
  control,
  register,
  setValue,
  watch,
  update,
  remove,
  duplicateVariant,
  onDelete,
  generateVariantSku,
  skusGenerated,
}: {
  index: number;
  control: Control<ProductFormData>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: (name: any, options?: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (name: any, value: any) => void;
  watch: (name?: string) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: any;
  remove: (index: number) => void;
  duplicateVariant: (index: number) => void;
  onDelete: () => void;
  generateVariantSku: (index: number) => void;
  skusGenerated: Record<number, string>;
}) {
  const [expanded, setExpanded] = useState(true);
  const variant = watch(`variants.${index}`) as ProductVariantData | undefined;

  return (
    <div className="bg-[#12121a] border border-white/5 rounded-xl overflow-hidden transition-all">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.02]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
          <span className="text-sm font-medium text-foreground">
            {variant?.name || `Variante #${index + 1}`}
          </span>
          {variant?.sku && (
            <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
              {variant.sku}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateVariant(index);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1.5 text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-white/5">
          {/* Name */}
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground">
              Nom de la variante <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register(`variants.${index}.name`)}
              placeholder="Bureau 120cm - Chêne"
              className="h-10 bg-[#0a0a0f] border-white/10 focus:border-gold text-sm mt-1"
            />
          </div>

          {/* Dimensions */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3" /> Dimensions (cm)
            </Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {[
                { key: "length", label: "L" },
                { key: "width", label: "l" },
                { key: "height", label: "H" },
                { key: "depth", label: "P" },
              ].map((dim) => (
                <div key={dim.key}>
                  <Input
                    type="number"
                    {...register(`variants.${index}.${dim.key}`, { valueAsNumber: true })}
                    placeholder={dim.label}
                    className="h-10 bg-[#0a0a0f] border-white/10 text-xs text-center"
                  />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                {...register(`variants.${index}.is_custom_dimensions`)}
                className="accent-gold h-4 w-4"
              />
              <span className="text-xs text-muted-foreground">Dimensions sur mesure</span>
            </label>
          </div>

          {/* Material & Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Matériau</Label>
              <Select
                value={variant?.material || ""}
                onValueChange={(v) => setValue(`variants.${index}.material`, v)}
              >
                <SelectTrigger className="h-10 bg-[#0a0a0f] border-white/10 mt-1">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-[#12121a] border-white/10">
                  {MATERIALS.map((mat) => (
                    <SelectItem key={mat} value={mat} className="text-foreground">
                      {mat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Couleur</Label>
              <ColorSelect
                value={variant?.color || ""}
                colorHex={variant?.color_hex || ""}
                onColorChange={(color, hex) => {
                  setValue(`variants.${index}.color`, color);
                  setValue(`variants.${index}.color_hex`, hex);
                }}
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Prix spécifique (DZD)</Label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`variants.${index}.use_product_price`)}
                    className="accent-gold h-3.5 w-3.5"
                  />
                  <span className="text-[10px] text-muted-foreground">Prix produit</span>
                </label>
              </div>
              <Input
                type="number"
                {...register(`variants.${index}.price`, { valueAsNumber: true })}
                placeholder={variant?.use_product_price ? "Utilise le prix produit" : "0"}
                disabled={variant?.use_product_price}
                className="h-10 bg-[#0a0a0f] border-white/10 text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Stock spécifique</Label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`variants.${index}.use_product_stock`)}
                    className="accent-gold h-3.5 w-3.5"
                  />
                  <span className="text-[10px] text-muted-foreground">Stock produit</span>
                </label>
              </div>
              <Input
                type="number"
                {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                placeholder={variant?.use_product_stock ? "Utilise le stock produit" : "0"}
                disabled={variant?.use_product_stock}
                className="h-10 bg-[#0a0a0f] border-white/10 text-sm"
              />
            </div>
          </div>

          {/* SKU */}
          <div>
            <Label className="text-xs text-muted-foreground">SKU variante</Label>
            <div className="flex gap-2 mt-1">
              <Input
                {...register(`variants.${index}.sku`)}
                placeholder="DA-001-120-CHE"
                className="h-10 bg-[#0a0a0f] border-white/10 text-xs font-mono flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateVariantSku(index)}
                className="border-white/10 text-muted-foreground h-10 text-xs"
              >
                <Hash className="h-3 w-3 mr-1" />
                Générer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COLOR SELECT COMPONENT */
function ColorSelect({
  value,
  colorHex,
  onColorChange,
}: {
  value: string;
  colorHex: string;
  onColorChange: (color: string, hex: string) => void;
}) {
  const [customHex, setCustomHex] = useState(colorHex || "#d4af37");

  return (
    <div className="space-y-2 mt-1">
      <Select
        value={value}
        onValueChange={(v) => {
          const found = COLORS.find((c) => c.name === v);
          onColorChange(v, found?.value || "#ffffff");
        }}
      >
        <SelectTrigger className="h-10 bg-[#0a0a0f] border-white/10">
          <SelectValue placeholder="Choisir une couleur" />
        </SelectTrigger>
        <SelectContent className="bg-[#12121a] border-white/10">
          {COLORS.map((c) => (
            <SelectItem key={c.name} value={c.name} className="text-foreground">
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/10"
                  style={{ backgroundColor: c.value }}
                />
                {c.name}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="custom" className="text-foreground text-gold">
            Personnalisée...
          </SelectItem>
        </SelectContent>
      </Select>

      {value === "custom" && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="color"
            value={customHex}
            onChange={(e) => {
              setCustomHex(e.target.value);
              onColorChange("Personnalisée", e.target.value);
            }}
            className="h-8 w-8 rounded cursor-pointer border border-white/10 bg-transparent"
          />
          <Input
            type="text"
            value={customHex}
            onChange={(e) => {
              setCustomHex(e.target.value);
              onColorChange("Personnalisée", e.target.value);
            }}
            className="h-8 bg-[#0a0a0f] border-white/10 text-xs font-mono max-w-[100px]"
            placeholder="#hex"
          />
          <div
            className="h-6 w-6 rounded-full border border-white/10"
            style={{ backgroundColor: customHex }}
          />
        </div>
      )}

      {value && value !== "custom" && (
        <div className="flex items-center gap-2 pt-1">
          <div
            className="h-5 w-5 rounded-full border border-white/10"
            style={{ backgroundColor: colorHex }}
          />
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
      )}
    </div>
  );
}
