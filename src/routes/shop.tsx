import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useActiveProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useReveal } from "@/lib/reveal";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Catalogue — Decorak Alina" },
      { name: "description", content: "Bureaux, dressings, cuisines et aménagements sur mesure." },
      { property: "og:title", content: "Catalogue — Decorak Alina" },
      { property: "og:description", content: "Pièces faites pour durer." },
    ],
  }),
  component: Shop,
});

const CATS = ["Tout", "Bureaux", "Dressings", "Cuisines", "Rangement", "Salon"] as const;

const categoryMap: Record<string, string> = {
  Bureaux: "bureau",
  Dressings: "dressing",
  Cuisines: "cuisine",
  Rangement: "rangement",
  Salon: "salon",
};

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

function formatPrice(price: number) {
  return price.toLocaleString("fr-FR");
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Shop() {
  const { data, isLoading } = useActiveProducts();
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATS)[number]>("Tout");
  const [maxPrice, setMaxPrice] = useState(200000);

  const filteredProducts = useMemo(() => {
    const allProducts = Array.isArray(data) ? data : (data?.products ?? []);
    return allProducts
      .filter((p: any) => {
        if (selectedCategory === 'Tout') return true;
        const dbCategory = categoryMap[selectedCategory];
        return p.category === dbCategory;
      })
      .filter((p: any) => p.price <= maxPrice);
  }, [data, selectedCategory, maxPrice]);

  useReveal([filteredProducts]);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pb-32 pt-16 md:px-8 md:pt-24">
        <div className="reveal mb-12 max-w-2xl">
          <div className="label-eyebrow">Catalogue</div>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">
            Pièces faites <span className="gold-text">pour durer</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Une sélection façonnée à la main : bureaux, dressings, cuisines et aménagements
            complets.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          <aside className="space-y-8 rounded-lg border border-border bg-surface p-6 md:sticky md:top-28 md:self-start">
            <div>
              <div className="mb-3 text-xs tracking-[0.25em] text-muted-foreground">Catégorie</div>
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`rounded-full border px-4 py-1.5 text-xs transition ${
                      selectedCategory === c
                        ? "border-gold bg-gold text-gold-foreground"
                        : "border-border text-foreground/80 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between text-xs tracking-[0.25em] text-muted-foreground">
                <span>Prix max</span>
                <span className="text-foreground">{formatPrice(maxPrice)} DA</span>
              </div>
              <input
                type="range"
                min={20000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[--gold]"
              />
            </div>
          </aside>

          <div>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground">{filteredProducts.length} pièce(s)</div>
                {filteredProducts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-16 text-center space-y-2">
                    <p className="text-muted-foreground">Aucun produit dans cette catégorie</p>
                    <p className="text-xs text-muted-foreground/60">Revenez bientôt pour découvrir nos nouvelles pièces</p>
                  </div>
                ) : (
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((p: any) => (
                      <div key={p.id} className="reveal">
                        <ProductCard
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
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
