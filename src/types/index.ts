export interface Product {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  short_description?: string | null;
  short_description_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  category: string;
  subcategory?: string | null;
  collection?: string | null;
  price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  show_price: boolean;
  stock_quantity: number;
  alert_threshold: number;
  sku?: string | null;
  barcode?: string | null;
  dimensions?: ProductDimensions | null;
  materials?: string[] | null;
  colors?: string[] | null;
  images?: ProductImage[] | null;
  featured: boolean;
  status: "active" | "draft" | "archived";
  visibility: "visible" | "hidden" | "scheduled";
  sort_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  canonical_url?: string | null;
  h1_alternative?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  depth: number;
  unit: "cm";
}

export interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  file_name?: string;
  file_size?: number;
  sort_order: number;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  is_custom_dimensions: boolean;
  material?: string | null;
  color?: string | null;
  color_hex?: string | null;
  price?: number | null;
  use_product_price: boolean;
  stock?: number | null;
  use_product_stock: boolean;
  sku?: string | null;
  image_url?: string | null;
  sort_order: number;
}

export interface ProductFormData {
  name: string;
  name_ar?: string;
  slug: string;
  sku?: string;
  category: string;
  subcategory?: string;
  collection?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  show_price: boolean;
  stock_quantity: number;
  alert_threshold: number;
  barcode?: string;
  short_description?: string;
  short_description_ar?: string;
  description?: string;
  description_ar?: string;
  featured: boolean;
  status: "active" | "draft" | "archived";
  visibility: "visible" | "hidden" | "scheduled";
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  h1_alternative?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
  created_at: string;
  product_count?: number;
}

export interface Category {
  id: string;
  name: string;
  name_ar?: string | null;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
  created_at: string;
  product_count?: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_address?: Address | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  total_amount: number;
  shipping_cost: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Address {
  street?: string;
  city?: string;
  wilaya?: string;
  zip_code?: string;
}

export interface Customer {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  address?: Address | null;
  city?: string | null;
  wilaya?: string | null;
  created_at: string;
  email?: string | null;
  orders_count?: number;
  total_spent?: number;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_logo?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  whatsapp_number?: string | null;
  currency: string;
  delivery_wilayas?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_products: number;
  active_orders: number;
  total_customers: number;
  total_revenue: number;
  revenue_growth: number;
  orders_growth: number;
  customers_growth: number;
  products_growth: number;
  orders_by_status: { status: string; count: number }[];
  products_by_category: { category: string; count: number }[];
  revenue_by_day: { date: string; amount: number }[];
  low_stock_products: Product[];
  recent_orders: Order[];
}

export const WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Meniaa",
] as const;

export const CATEGORIES = [
  { value: "bureau", label: "Bureau", label_ar: "مكتب" },
  { value: "dressing", label: "Dressing", label_ar: "خزانة ملابس" },
  { value: "cuisine", label: "Cuisine", label_ar: "مطبخ" },
  { value: "rangement", label: "Rangement", label_ar: "تخزين" },
  { value: "salon", label: "Salon", label_ar: "صالون" },
  { value: "autre", label: "Autre", label_ar: "آخر" },
] as const;

export const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  bureau: [
    { value: "bureau-assis-debout", label: "Bureau assis-debout" },
    { value: "bureau-angle", label: "Bureau d'angle" },
    { value: "bureau-droit", label: "Bureau droit" },
    { value: "table-conference", label: "Table de conférence" },
    { value: "caisson", label: "Caisson" },
  ],
  dressing: [
    { value: "dressing-ouvert", label: "Dressing ouvert" },
    { value: "dressing-ferme", label: "Dressing fermé" },
    { value: "commode", label: "Commode" },
    { value: "armoire", label: "Armoire" },
  ],
  cuisine: [
    { value: "cuisine-lineaire", label: "Cuisine linéaire" },
    { value: "cuisine-angle", label: "Cuisine d'angle" },
    { value: "ilot-central", label: "Îlot central" },
    { value: "table-repas", label: "Table de repas" },
  ],
  rangement: [
    { value: "bibliotheque", label: "Bibliothèque" },
    { value: "etagere", label: "Étagère" },
    { value: "buffet", label: "Buffet" },
    { value: "meuble-tv", label: "Meuble TV" },
  ],
  salon: [
    { value: "canape", label: "Canapé" },
    { value: "table-basse", label: "Table basse" },
    { value: "fauteuil", label: "Fauteuil" },
    { value: "meuble-salon", label: "Meuble salon" },
  ],
  autre: [],
};

export const MATERIALS = [
  "Bois massif",
  "MDF",
  "Mélaminé",
  "Métal",
  "Verre",
  "Marbre",
  "Cuir",
  "Tissu",
] as const;

export const COLORS = [
  { name: "Blanc", value: "#ffffff" },
  { name: "Noir", value: "#000000" },
  { name: "Chêne", value: "#c49a6c" },
  { name: "Noyer", value: "#5c3a1e" },
  { name: "Wengé", value: "#3a1f0d" },
  { name: "Gris", value: "#808080" },
  { name: "Beige", value: "#f5f5dc" },
  { name: "Or", value: "#d4af37" },
  { name: "Argent", value: "#c0c0c0" },
  { name: "Rouge", value: "#dc2626" },
  { name: "Bleu", value: "#2563eb" },
  { name: "Vert", value: "#16a34a" },
] as const;

export const CURRENCY = "DZD";

export function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("DZD", "")
      .trim() + " DA"
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
