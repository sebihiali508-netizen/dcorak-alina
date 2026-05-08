import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
  remember: z.boolean().optional(),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  alt_text: z.string().optional().or(z.literal("")),
  is_primary: z.boolean(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  sort_order: z.number(),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().optional(),
  name: z.string().min(1, "Nom de variante requis"),
  length: z.coerce.number().min(0).optional().nullable(),
  width: z.coerce.number().min(0).optional().nullable(),
  height: z.coerce.number().min(0).optional().nullable(),
  depth: z.coerce.number().min(0).optional().nullable(),
  is_custom_dimensions: z.boolean(),
  material: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  color_hex: z.string().optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  use_product_price: z.boolean(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
  use_product_stock: z.boolean(),
  sku: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  sort_order: z.number(),
});

export const productSchema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    name_ar: z.string().optional().or(z.literal("")),
    slug: z.string().min(1, "Slug requis"),
    sku: z.string().optional().or(z.literal("")),
    category: z.string().min(1, "Catégorie requise"),
    subcategory: z.string().optional().or(z.literal("")),
    collection: z.string().optional().or(z.literal("")),
    price: z.coerce.number().min(0, "Prix requis"),
    sale_price: z.coerce.number().min(0).optional().nullable(),
    cost_price: z.coerce.number().min(0).optional().nullable(),
    show_price: z.boolean(),
    stock_quantity: z.coerce.number().int().min(0, "Stock requis"),
    alert_threshold: z.coerce.number().int().min(0),
    barcode: z.string().optional().or(z.literal("")),
    short_description: z.string().max(160).optional().or(z.literal("")),
    short_description_ar: z.string().max(160).optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    description_ar: z.string().optional().or(z.literal("")),
    featured: z.boolean(),
    status: z.enum(["active", "draft", "archived"]),
    visibility: z.enum(["visible", "hidden", "scheduled"]),
    meta_title: z.string().max(60).optional().or(z.literal("")),
    meta_description: z.string().max(160).optional().or(z.literal("")),
    meta_keywords: z.array(z.string()).optional(),
    canonical_url: z.string().optional().or(z.literal("")),
    h1_alternative: z.string().optional().or(z.literal("")),
    og_title: z.string().optional().or(z.literal("")),
    og_description: z.string().optional().or(z.literal("")),
    og_image: z.string().optional().or(z.literal("")),
    images: z.array(productImageSchema),
    variants: z.array(productVariantSchema),
  })
  .refine(
    (data) => {
      if (data.sale_price && data.price) {
        return data.sale_price < data.price;
      }
      return true;
    },
    { message: "Le prix promo doit être inférieur au prix régulier", path: ["sale_price"] },
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductImageData = z.infer<typeof productImageSchema>;
export type ProductVariantData = z.infer<typeof productVariantSchema>;
