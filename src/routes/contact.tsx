import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useReveal } from "@/lib/reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Decorak Alina" },
      {
        name: "description",
        content: "Parlons de votre projet sur mesure. L'équipe Decorak Alina vous répond sous 24h.",
      },
      { property: "og:title", content: "Contact — Decorak Alina" },
      {
        property: "og:description",
        content: "Devis, consultation et accompagnement personnalisé.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  useReveal();
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-24">
      <div className="reveal max-w-2xl">
        <div className="label-eyebrow">Parlons-en</div>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          Donnez vie à votre <span className="gold-text">projet</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Envoyez-nous les détails de votre projet. Nous revenons vers vous sous 24h ouvrées.
        </p>
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-[1fr_360px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="reveal space-y-5 rounded-2xl border border-border bg-surface p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nom complet">
              <input required className="lux-input" placeholder="Votre nom" />
            </Field>
            <Field label="Email">
              <input required type="email" className="lux-input" placeholder="vous@email.com" />
            </Field>
          </div>
          <Field label="Type de projet">
            <input className="lux-input" placeholder="Bureau, dressing, cuisine…" />
          </Field>
          <Field label="Votre message">
            <textarea
              required
              rows={5}
              className="lux-input resize-none"
              placeholder="Décrivez votre besoin, dimensions, matières souhaitées…"
            />
          </Field>
          <button className="btn-gold inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-medium tracking-widest">
            ENVOYER <Send className="h-4 w-4" />
          </button>
          {sent && (
            <div className="text-sm text-gold">
              Message bien reçu — merci. Notre équipe vous recontactera très bientôt.
            </div>
          )}
          <style>{`.lux-input{width:100%;border:1px solid var(--border);background:var(--background);color:var(--foreground);border-radius:8px;padding:14px 16px;font-size:14px;outline:none;transition:border .2s}.lux-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,175,55,0.12)}`}</style>
        </form>

        <aside className="reveal space-y-4">
          <Info I={Phone} t="Téléphone" v="+213 555 00 00 00" />
          <Info I={Mail} t="Email" v="hello@decorakalina.com" />
          <Info I={MapPin} t="Atelier" v="Alger, Algérie" />
          <div className="aspect-square overflow-hidden rounded-2xl border border-border">
            <iframe
              title="map"
              className="h-full w-full grayscale"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.95%2C36.69%2C3.15%2C36.79&layer=mapnik"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
        {label}
      </div>
      {children}
    </label>
  );
}
function Info({ I, t, v }: { I: any; t: string; v: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
        <I className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">{t}</div>
        <div className="mt-1">{v}</div>
      </div>
    </div>
  );
}
