import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/logo.jpg";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/shop", label: "Catalogue" },
  { to: "/about", label: "Atelier" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${scrolled ? "glass-strong border-b border-border" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="pulse-glow grid h-10 w-10 place-items-center overflow-hidden rounded-full ring-1 ring-gold/40">
            <img src={logo} alt="Decorak Alina" className="h-full w-full object-cover" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg md:text-xl tracking-tight">Decorak Alina</div>
            <div className="text-[9px] tracking-[0.35em] text-muted-foreground">SUR MESURE</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="nav-link text-[13px] tracking-[0.2em] uppercase text-foreground/85"
              activeProps={{ className: "active" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => openCart(true)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground/85 transition hover:text-gold"
            aria-label="Panier"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-medium text-gold-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground/85 transition hover:text-gold md:hidden"
            aria-label="Menu"
          >
            <span className="relative block h-5 w-5">
              <Menu
                className={`absolute inset-0 transition-all duration-300 ${open ? "rotate-90 opacity-0" : "opacity-100"}`}
              />
              <X
                className={`absolute inset-0 transition-all duration-300 ${open ? "opacity-100" : "-rotate-90 opacity-0"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`grid overflow-hidden border-t border-border glass-strong transition-[grid-template-rows] duration-500 md:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="flex flex-col px-6 py-2">
            {nav.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`border-b border-border/40 py-4 text-base tracking-wider text-foreground/90 last:border-0 ${open ? "word-up" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
