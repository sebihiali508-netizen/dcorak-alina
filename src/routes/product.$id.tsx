import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImageIcon, ShieldCheck, Truck } from "lucide-react";
import { getPublicProductWithRelated } from "@/lib/api/products";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/site/ProductCard";

function getProductImage(p: any): string {
  if (p.product_images?.length) {
    const img = p.product_images.find((i: any) => i.is_primary) || p.product_images[0];
    return img.url || "";
  }
  const imgs = p.images;
  if (!imgs || imgs.length === 0) return "";
  const first = imgs[0];
  const url = typeof first === "string" ? first : first.url || "";
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) return `${supabaseUrl}/storage/v1/object/public/product-images/${url}`;
  return url;
}

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const result = await getPublicProductWithRelated({ data: params.id } as any);
    if (!result.product) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const image = p ? getProductImage(p) : "";
    return {
      meta: [
        { title: p ? `${p.name} — Decorak Alina` : "Produit" },
        { name: "description", content: p?.short_description ?? "" },
        { property: "og:title", content: p?.name ?? "" },
        { property: "og:description", content: p?.short_description ?? "" },
        ...(p && image ? [{ property: "og:image", content: image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Pièce introuvable</h1>
      <Link
        to="/shop"
        className="btn-gold mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm tracking-widest"
      >
        RETOUR AU CATALOGUE
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl">Une erreur est survenue</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [ripple, setRipple] = useState<{ x: number; y: number; k: number } | null>(null);
  const [imgErr, setImgErr] = useState(false);
  const image = getProductImage(product);

  const onAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, k: Date.now() });
    add(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        oldPrice: product.sale_price ? Number(product.sale_price) : undefined,
        image,
        category: product.category,
        tagline: product.short_description || "",
        material: product.materials?.[0] || "",
        color: product.colors?.[0] || "",
        size: "" as any,
        description: product.description || "",
        features: [],
      } as Product,
      qty,
    );
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-8 md:pt-16">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> CATALOGUE
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border bg-surface-2">
            {image && !imgErr ? (
              <img
                src={image}
                alt={product.name}
                onError={() => setImgErr(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-30" />
              </div>
            )}
          </div>

          <div>
            <div className="label-eyebrow">{product.category}</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {product.short_description || product.description}
            </p>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display text-3xl text-gold">
                {Number(product.price).toLocaleString("fr-FR")}{" "}
                <span className="text-base text-muted-foreground">DA</span>
              </span>
              {product.sale_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {Number(product.sale_price).toLocaleString("fr-FR")} DA
                </span>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
              {product.materials?.[0] && <Detail label="Matière" value={product.materials[0]} />}
              {product.colors?.[0] && <Detail label="Couleur" value={product.colors[0]} />}
              {product.dimensions && (
                <Detail
                  label="Dimensions"
                  value={
                    typeof product.dimensions === "object"
                      ? `${product.dimensions.la || ""}x${product.dimensions.lo || ""}x${product.dimensions.h || ""}`
                      : ""
                  }
                />
              )}
            </div>

            <p className="mt-8 leading-relaxed text-foreground/85">{product.description}</p>

            <div className="mt-10 flex items-center gap-3">
              <div className="inline-flex h-12 items-center rounded-full border border-border bg-surface">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 text-lg">
                  −
                </button>
                <span className="w-8 text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 text-lg">
                  +
                </button>
              </div>
              <button
                onClick={onAdd}
                className="btn-gold relative h-12 flex-1 overflow-hidden rounded-full text-sm font-medium tracking-widest"
              >
                AJOUTER AU PANIER
                {ripple && (
                  <span
                    key={ripple.k}
                    className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      animation: "ripple 0.7s ease-out forwards",
                    }}
                  />
                )}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" /> Livraison & pose offertes
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Garantie jusqu'à 5 ans
              </span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 font-display text-3xl">Pièces apparentées</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={
                    {
                      id: p.id,
                      name: p.name,
                      category: p.category,
                      price: Number(p.price),
                      oldPrice: p.sale_price ? Number(p.sale_price) : undefined,
                      image: getProductImage(p),
                      tagline: p.short_description || "",
                      material: p.materials?.[0] || "",
                      color: p.colors?.[0] || "",
                      size: "" as any,
                      description: p.description || "",
                      features: [],
                    } as Product
                  }
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`@keyframes ripple { to { width: 600px; height: 600px; opacity: 0; } }`}</style>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2.5">
      <div className="text-[10px] tracking-widest text-muted-foreground uppercase">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}
