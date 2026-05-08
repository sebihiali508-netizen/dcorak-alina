import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/lib/reveal";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Decorak Alina" },
      {
        name: "description",
        content: "Inspirations, tendances et conseils déco signés Decorak Alina.",
      },
      { property: "og:title", content: "Journal — Decorak Alina" },
      { property: "og:description", content: "Inspirations & savoir-faire." },
    ],
  }),
  component: Journal,
});

const posts = [
  {
    t: "Choisir son bureau de direction",
    e: "Un guide pratique pour conjuguer élégance et ergonomie.",
    d: "5 min de lecture",
  },
  {
    t: "Trois palettes pour un bureau apaisé",
    e: "Comment composer une harmonie chromatique propice à la concentration.",
    d: "4 min de lecture",
  },
  {
    t: "L'éclairage des espaces premium",
    e: "Les couches de lumière qui transforment vraiment une pièce.",
    d: "6 min de lecture",
  },
];

function Journal() {
  useReveal();
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
      <div className="reveal max-w-2xl">
        <div className="label-eyebrow">Journal</div>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          Inspirations <span className="gold-text">d'intérieur</span>
        </h1>
      </div>
      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {posts.map((p, i) => (
          <article key={i} className="reveal group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface-2 via-surface to-surface-2" />
            <div className="mt-5 text-[11px] tracking-[0.3em] text-muted-foreground">
              {p.d.toUpperCase()}
            </div>
            <h3 className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-gold">
              {p.t}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.e}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
