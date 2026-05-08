-- ═══════════════════════════════════════════════════════════════
-- Decorak Alina - Configuration Supabase
-- Exécutez CE FICHIER EN ENTIER dans l'éditeur SQL Supabase.
-- Si vous avez déjà exécuté une version précédente, la migration
-- est automatique grâce à IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. TABLE PRODUITS (avec toutes les colonnes du formulaire)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  collection VARCHAR(100),
  short_description VARCHAR(160),
  short_description_ar VARCHAR(160),
  description TEXT,
  description_ar TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  show_price BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  alert_threshold INTEGER DEFAULT 5,
  dimensions JSONB,
  materials TEXT[],
  colors TEXT[],
  images JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft',
  visibility VARCHAR(20) DEFAULT 'visible',
  sort_order INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url VARCHAR(255),
  h1_alternative VARCHAR(255),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration : ajoute les colonnes manquantes si la table existait déjà
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description VARCHAR(160);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description_ar VARCHAR(160);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'visible';
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS h1_alternative VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images_jsonb JSONB DEFAULT '[]'::jsonb;

-- ═══════════════════════════════════════════════════════════════
-- 2. TABLE VARIANTES PRODUIT
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  length INTEGER,
  width INTEGER,
  height INTEGER,
  depth INTEGER,
  is_custom_dimensions BOOLEAN DEFAULT false,
  material VARCHAR(100),
  color VARCHAR(100),
  color_hex VARCHAR(7),
  price DECIMAL(12,2),
  use_product_price BOOLEAN DEFAULT true,
  stock INTEGER,
  use_product_stock BOOLEAN DEFAULT true,
  sku VARCHAR(100),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. TABLE IMAGES PRODUIT
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  file_name VARCHAR(255),
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. TABLE CATÉGORIES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. TABLE COMMANDES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 6. TABLE LIGNES DE COMMANDE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL
);

-- ═══════════════════════════════════════════════════════════════
-- 7. TABLE CLIENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address JSONB,
  city VARCHAR(100),
  wilaya VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. TABLE PARAMÈTRES DU SITE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) DEFAULT 'Decorak Alina',
  site_logo TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  whatsapp_number VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'DZD',
  delivery_wilayas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (id, site_name, currency)
VALUES (1, 'Decorak Alina', 'DZD')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 9. SÉCURITÉ (ROW LEVEL SECURITY)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Supprime les anciennes politiques avant de les recréer
DROP POLICY IF EXISTS "Admin full access on products" ON products;
DROP POLICY IF EXISTS "Admin full access on categories" ON categories;
DROP POLICY IF EXISTS "Admin full access on orders" ON orders;
DROP POLICY IF EXISTS "Admin full access on order_items" ON order_items;
DROP POLICY IF EXISTS "Admin full access on customers" ON customers;
DROP POLICY IF EXISTS "Admin full access on site_settings" ON site_settings;

-- Politiques pour les administrateurs authentifiés
CREATE POLICY "Admin full access on products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on product_variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on product_images"
  ON product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on customers"
  ON customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 10. STOCKAGE SUPABASE (product-images bucket)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Public read access to product images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'product-images');

-- ═══════════════════════════════════════════════════════════════
-- 11. FONCTIONS UTILITAIRES
-- ═══════════════════════════════════════════════════════════════

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprime et recrée les triggers (évite les doublons)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
