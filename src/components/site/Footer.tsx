import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border" style={{ background: "#050508" }}>
      <div className="mx-auto max-w-7xl px-6 pt-20 md:px-8">
        {/* Newsletter */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="label-eyebrow">Newsletter</div>
          <h3 className="mt-3 font-display text-3xl md:text-4xl">Inspirations & nouveautés</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Recevez nos collections en avant-première.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              required
              placeholder="votre@email.com"
              className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm outline-none transition focus:border-gold"
            />
            <button className="btn-gold h-12 rounded-full px-6 text-sm font-medium">
              S'abonner
            </button>
          </form>
        </div>

        <div className="my-16 grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/40"
              />
              <div>
                <div className="font-display text-xl">Decorak Alina</div>
                <div className="text-[10px] tracking-[0.3em] text-muted-foreground">
                  SUR COMMANDE & SUR MESURE
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Mobilier sur mesure conçu et fabriqué en Algérie. Bureaux, dressings, cuisines et
              aménagements complets — l'artisanat dans chaque détail.
            </p>
            <div className="mt-6 flex gap-3 font-arabic text-sm text-muted-foreground" dir="rtl">
              <span>ديكورك علينا — أثاث بأناقة حسب الطلب</span>
            </div>
          </div>

          <div>
            <div className="mb-4 label-eyebrow !text-muted-foreground">Explorer</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/shop" className="text-foreground/80 hover:text-gold">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-foreground/80 hover:text-gold">
                  L'atelier
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-foreground/80 hover:text-gold">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-foreground/80 hover:text-gold">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 label-eyebrow !text-muted-foreground">Contact</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-foreground/80">
                <Phone className="h-4 w-4 text-gold" /> +213 555 00 00 00
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <Mail className="h-4 w-4 text-gold" /> hello@decorakalina.com
              </li>
              <li className="mt-4 flex gap-3">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="grid h-9 w-9 place-items-center rounded-full bg-surface transition hover:bg-gold hover:text-gold-foreground"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="grid h-9 w-9 place-items-center rounded-full bg-surface transition hover:bg-gold hover:text-gold-foreground"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="WhatsApp"
                  className="grid h-9 w-9 place-items-center rounded-full bg-surface transition hover:bg-gold hover:text-gold-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
            <div>© {new Date().getFullYear()} Decorak Alina. Tous droits réservés.</div>
            <div>Fait avec soin à Alger</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
