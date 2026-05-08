import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/lib/reveal";
import about from "@/assets/about-workshop.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "L'atelier — Decorak Alina" },
      {
        name: "description",
        content: "Plus de 15 ans d'artisanat algérien, au service du mobilier sur mesure.",
      },
      { property: "og:title", content: "L'atelier — Decorak Alina" },
      { property: "og:description", content: "Matières nobles, gestes précis, design intemporel." },
      { property: "og:image", content: about },
    ],
  }),
  component: About,
});

function About() {
  useReveal();
  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:px-8">
        <div className="reveal max-w-2xl">
          <div className="label-eyebrow">Notre histoire</div>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">
            L'<span className="gold-text">atelier</span> Decorak Alina
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Decorak Alina est née d'une conviction : le mobilier raconte une histoire. Depuis plus
            de 15 ans, notre atelier algérien sélectionne avec exigence chacune de ses matières —
            bois massif, cuir italien, laiton brossé — et façonne des pièces uniques pour celles et
            ceux qui aiment les beaux gestes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="reveal overflow-hidden rounded-2xl border border-border">
          <img
            src={about}
            alt="L'atelier Decorak Alina"
            loading="lazy"
            className="h-[60vh] w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3 md:px-8">
        {[
          { t: "Matières nobles", d: "Bois massif, cuir italien, laiton mat. Aucun compromis." },
          {
            t: "Design intemporel",
            d: "Des lignes calmes, des proportions justes, qui résistent aux modes.",
          },
          {
            t: "Geste précis",
            d: "Chaque pièce est fabriquée et contrôlée à la main avant livraison.",
          },
        ].map((v, i) => (
          <div key={i} className="reveal">
            <div className="label-eyebrow">{(i + 1).toString().padStart(2, "0")}</div>
            <h3 className="mt-3 font-display text-2xl">{v.t}</h3>
            <p className="mt-2 text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
