import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Hammer, Sparkles, ShieldCheck, Truck, Quote } from "lucide-react";
import hero from "@/assets/hero-office.jpg";
import about from "@/assets/about-workshop.jpg";
import { categoriesMeta } from "@/data/products";
import { useActiveProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/site/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Particles } from "@/components/site/Particles";
import { useReveal } from "@/lib/reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decorak Alina — Mobilier sur mesure" },
      {
        name: "description",
        content:
          "Bureaux, dressings, cuisines et aménagements intérieurs sur mesure. L'artisanat algérien d'exception.",
      },
      { property: "og:title", content: "Decorak Alina — Sur commande & sur mesure" },
      { property: "og:description", content: "Mobilier d'exception, fait main en Algérie." },
      { property: "og:image", content: hero },
    ],
  }),
  component: Home,
});

function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block">
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span className="word-up inline-block" style={{ animationDelay: `${delay + i * 0.08}s` }}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </span>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span>
      {n.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-2 snap-x-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[78%] shrink-0 snap-start md:w-auto">
          <div className="rounded-lg overflow-hidden">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getFeaturedImage(p: any): string {
  if (p.product_images?.length) {
    const img = p.product_images.find((i: any) => i.is_primary) || p.product_images[0];
    return img.url || "";
  }
  const url = p.images?.[0]?.url || p.images?.[0] || "";
  if (!url || url.startsWith("http")) return url;
  const su = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  return su ? `${su}/storage/v1/object/public/product-images/${url}` : url;
}

function Home() {
  useReveal();
  const { data: featuredData, isLoading: featuredLoading } = useActiveProducts();
  const featured = featuredData?.products?.slice(0, 4) ?? [];

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={hero}
            alt=""
            width={1920}
            height={1280}
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>
        <Particles density={70} />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center md:px-8">
          <div className="tracking-in mb-7 text-[11px] tracking-[0.3em] text-gold">
            SUR COMMANDE &nbsp;·&nbsp; SUR MESURE
          </div>
          <h1 className="font-display text-[44px] leading-[1.05] md:text-7xl lg:text-[88px]">
            <SplitWords text="L'art de l'intérieur," />
            <br />
            <span className="gold-text">
              <SplitWords text="fait à la main." delay={0.4} />
            </span>
          </h1>
          <p
            className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground opacity-0 md:text-lg"
            style={{ animation: "wordUp 0.9s cubic-bezier(0.2,0.8,0.2,1) 0.9s forwards" }}
          >
            Decorak Alina conçoit et fabrique vos bureaux, dressings, cuisines et aménagements
            complets — en pièce unique, livrés à Alger et au-delà.
          </p>
          <div
            className="mt-10 flex w-full flex-col items-center gap-3 opacity-0 sm:w-auto sm:flex-row"
            style={{ animation: "wordUp 0.9s cubic-bezier(0.2,0.8,0.2,1) 1.1s forwards" }}
          >
            <Link
              to="/shop"
              className="btn-gold inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-9 text-sm font-medium tracking-widest sm:w-auto"
            >
              DÉCOUVRIR LE CATALOGUE <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="btn-outline-gold inline-flex h-14 w-full items-center justify-center rounded-full px-9 text-sm font-medium tracking-widest sm:w-auto"
            >
              DEVIS SUR MESURE
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-muted-foreground md:bottom-10">
            <span className="text-[10px] tracking-[0.3em]">DÉFILER</span>
            <ChevronDown className="animate-bouncey h-4 w-4 text-gold" />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto flex max-w-7xl gap-10 overflow-x-auto px-6 py-6 text-sm snap-x-mandatory md:justify-center md:px-8">
          {[
            { I: Hammer, t: "Sur Mesure" },
            { I: Sparkles, t: "Qualité Premium" },
            { I: Truck, t: "Livraison & Pose" },
            { I: ShieldCheck, t: "Paiement Sécurisé" },
          ].map(({ I, t }, i) => (
            <div key={i} className="flex shrink-0 snap-start items-center gap-3 text-foreground/85">
              <I className="h-4 w-4 text-gold" />
              <span className="tracking-[0.2em] uppercase text-xs">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="reveal mb-12 max-w-2xl">
          <div className="label-eyebrow">Catégories</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Conçu pour <span className="gold-text">votre quotidien</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categoriesMeta.map((c, i) => (
            <Link
              key={c.name}
              to="/shop"
              className="reveal group relative aspect-[3/4] overflow-hidden rounded-xl"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="product-image h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:from-black/70" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 transition-transform duration-500 group-hover:-translate-y-1">
                <div className="text-[10px] tracking-[0.3em] text-gold">
                  {c.tagline.toUpperCase()}
                </div>
                <div className="mt-1 font-display text-2xl text-white">{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED — horizontal on mobile */}
      {featured.length > 0 && (
        <section className="bg-surface/40 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="reveal mb-10 flex items-end justify-between">
              <div>
                <div className="label-eyebrow">Sélection</div>
                <h2 className="mt-3 font-display text-4xl md:text-5xl">Nos pièces phares</h2>
              </div>
              <Link
                to="/shop"
                className="hidden items-center gap-2 text-sm tracking-widest text-foreground/70 hover:text-gold md:inline-flex"
              >
                VOIR TOUT <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {featuredLoading ? (
              <FeaturedSkeleton />
            ) : (
              <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-2 snap-x-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
                {featured.map((p: any) => (
                  <div key={p.id} className="reveal w-[78%] shrink-0 snap-start md:w-auto">
                    <ProductCard
                      product={
                        {
                          id: p.id,
                          name: p.name,
                          category: p.category,
                          price: Number(p.price),
                          oldPrice: p.sale_price ? Number(p.sale_price) : undefined,
                          image: getFeaturedImage(p),
                          tagline: p.short_description || "",
                          material: p.materials?.[0] || "",
                          color: p.colors?.[0] || "",
                          size: "" as any,
                          description: p.description || "",
                          features: [],
                        } as any
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ABOUT / Craftsmanship */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="reveal overflow-hidden rounded-2xl border border-border">
            <img
              src={about}
              alt="L'atelier Decorak Alina"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="reveal">
            <div className="label-eyebrow">L'atelier</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              L'<span className="gold-text">artisanat</span> dans chaque détail
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Depuis plus de 15 ans, notre atelier façonne le bois, le cuir et le laiton avec la
              même exigence : créer des pièces qui traversent le temps. Chaque commande est unique,
              dessinée pour votre espace et vos usages.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { v: 1200, s: "+", l: "Clients" },
                { v: 280, s: "+", l: "Pièces" },
                { v: 15, s: "", l: "Années" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-display text-3xl text-gold md:text-4xl">
                    <Counter to={s.v} suffix={s.s} />
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.25em] text-muted-foreground">
                    {s.l.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="btn-outline-gold mt-10 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm tracking-widest"
            >
              DÉCOUVRIR L'ATELIER <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <div className="reveal relative overflow-hidden rounded-2xl border border-gold/30 bg-surface px-8 py-16 md:px-16 md:py-24">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative max-w-xl">
            <div className="label-eyebrow">Studio sur mesure</div>
            <h3 className="mt-3 font-display text-4xl md:text-5xl">
              Donnez vie à votre <span className="gold-text">projet d'intérieur</span>
            </h3>
            <p className="mt-4 text-base text-muted-foreground">
              Un projet de bureau, dressing ou cuisine ? Nos designers vous accompagnent du croquis
              à la pose.
            </p>
            <Link
              to="/contact"
              className="btn-gold mt-8 inline-flex h-12 items-center gap-2 rounded-full px-8 text-sm font-medium tracking-widest"
            >
              DEMANDER UN DEVIS <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const reviews = [
  {
    q: "Notre dressing est exactement ce que j'imaginais. Finitions impeccables, accompagnement irréprochable.",
    n: "Sarah B.",
    c: "Hydra, Alger",
  },
  {
    q: "Un bureau d'exception. Les détails en laiton apportent un cachet incomparable à notre cabinet.",
    n: "Karim H.",
    c: "Oran",
  },
  {
    q: "Cuisine sur mesure livrée et posée dans les délais. Une équipe à l'écoute, des matériaux nobles.",
    n: "Yasmine D.",
    c: "Constantine",
  },
];

function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [paused]);
  return (
    <section
      className="border-y border-border bg-surface/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
        <Quote className="mx-auto h-8 w-8 text-gold" />
        <div className="mt-6 min-h-[120px]">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${idx === i ? "opacity-100" : "absolute opacity-0"}`}
              style={{ display: idx === i ? "block" : "none" }}
            >
              <p className="font-display text-2xl leading-relaxed text-foreground md:text-3xl">
                « {r.q} »
              </p>
              <div className="mt-6 text-xs tracking-[0.3em] text-muted-foreground">
                — {r.n} · {r.c.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Avis ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-gold" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
