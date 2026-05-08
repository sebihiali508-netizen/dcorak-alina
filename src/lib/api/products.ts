import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { products, count: products?.length ?? 0 };
});

export const getProduct = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("id", data)
    .single();
  if (error) return null;
  return product;
});

export const getActiveProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("status", "active")
    .eq("visibility", "visible")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { products: products ?? [], count: products?.length ?? 0 };
});

export const getPublicProductWithRelated = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", data)
      .eq("status", "active")
      .eq("visibility", "visible")
      .single();

    if (error || !product) return { product: null, related: [] };

    const { data: related } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("category", product.category)
      .eq("status", "active")
      .eq("visibility", "visible")
      .neq("id", product.id)
      .limit(3);

    return { product, related: related ?? [] };
  },
);

export const createProduct = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { data: product, error } = await supabase.from("products").insert(data).select().single();
  if (error) throw new Error(error.message);
  return product;
});

export const createFullProduct = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { variants, images, ...productData } = data;

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        ...productData,
        images:
          images?.map((img: any) => ({
            url: img.url,
            alt_text: img.alt_text || "",
            is_primary: img.is_primary || false,
            sort_order: img.sort_order || 0,
          })) || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (productError) throw new Error(productError.message);

    if (variants && variants.length > 0) {
      const variantRows = variants.map((v: any, i: number) => ({
        product_id: product.id,
        name: v.name,
        length: v.length || null,
        width: v.width || null,
        height: v.height || null,
        depth: v.depth || null,
        is_custom_dimensions: v.is_custom_dimensions || false,
        material: v.material || null,
        color: v.color || null,
        color_hex: v.color_hex || null,
        price: v.price || null,
        use_product_price: v.use_product_price ?? true,
        stock: v.stock || null,
        use_product_stock: v.use_product_stock ?? true,
        sku: v.sku || null,
        image_url: v.image_url || null,
        sort_order: i,
      }));

      const { error: variantError } = await supabase.from("product_variants").insert(variantRows);

      if (variantError) throw new Error(variantError.message);
    }

    if (images && images.length > 0) {
      const imageRows = images.map((img: any, i: number) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.alt_text || "",
        is_primary: img.is_primary || i === 0,
        file_name: img.file_name || null,
        file_size: img.file_size || null,
        sort_order: img.sort_order ?? i,
      }));

      const { error: imageError } = await supabase.from("product_images").insert(imageRows);

      if (imageError) throw new Error(imageError.message);
    }

    return product;
  },
);

export const updateProduct = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { id, variants, images, ...productData } = data;
  const { data: product, error } = await supabase
    .from("products")
    .update({ ...productData, images: images || [], updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (variants && variants.length > 0) {
    await supabase.from("product_variants").delete().eq("product_id", id);
    const variantRows = variants.map((v: any, i: number) => ({
      product_id: id,
      name: v.name,
      length: v.length || null,
      width: v.width || null,
      height: v.height || null,
      depth: v.depth || null,
      is_custom_dimensions: v.is_custom_dimensions ?? false,
      material: v.material || null,
      color: v.color || null,
      color_hex: v.color_hex || null,
      price: v.price || null,
      use_product_price: v.use_product_price ?? true,
      stock: v.stock || null,
      use_product_stock: v.use_product_stock ?? true,
      sku: v.sku || null,
      image_url: v.image_url || null,
      sort_order: i,
    }));
    const { error: ve } = await supabase.from("product_variants").insert(variantRows);
    if (ve) throw new Error(ve.message);
  }

  if (images && images.length > 0) {
    await supabase.from("product_images").delete().eq("product_id", id);
    const imageRows = images.map((img: any, i: number) => ({
      product_id: id,
      url: img.url,
      alt_text: img.alt_text || "",
      is_primary: img.is_primary || i === 0,
      file_name: img.file_name || null,
      file_size: img.file_size || null,
      sort_order: img.sort_order ?? i,
    }));
    const { error: ie } = await supabase.from("product_images").insert(imageRows);
    if (ie) throw new Error(ie.message);
  }

  return product;
});

export const deleteProduct = createServerFn({ method: "POST" }).handler(
  async ({ data: id }: any) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  },
);

export const bulkDeleteProducts = createServerFn({ method: "POST" }).handler(
  async ({ data: ids }: any) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) throw new Error(error.message);
    return { success: true };
  },
);

export const bulkUpdateProductStatus = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { ids, status } = data;
    const { error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) throw new Error(error.message);
    return { success: true };
  },
);

export const saveProductImage = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { productId, url, altText, isPrimary, sortOrder, fileName, fileSize } = data;
    if (!productId || !url) throw new Error("productId and url required");
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      url,
      alt_text: altText || "",
      is_primary: isPrimary ?? false,
      file_name: fileName || null,
      file_size: fileSize || null,
      sort_order: sortOrder ?? 0,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },
);

export const generateSlug = createServerFn({ method: "POST" }).handler(
  async ({ data: name }: any) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug;
  },
);

export const uploadFileBase64 = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { base64, fileName, contentType } = data;
    if (!base64 || !fileName) throw new Error("Missing file data");

    const buffer = Buffer.from(base64, "base64");
    const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${fileName}`;

    const { data: uploadData, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        contentType: contentType || "image/jpeg",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);

    return { url: publicUrl, path: uploadData.path };
  },
);

export const generateSkuFn = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const { category } = data;
  const cat = category?.slice(0, 3).toUpperCase() || "PRO";
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  const count = Math.floor(Math.random() * 100)
    .toString()
    .padStart(3, "0");
  return `${cat}-${count}-${rand}`;
});
