import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Heart, Phone } from "lucide-react";

const tabs = [
  { to: "/", I: Home, label: "Accueil" },
  { to: "/shop", I: LayoutGrid, label: "Catalogue" },
  { to: "/journal", I: Heart, label: "Inspiration" },
  { to: "/contact", I: Phone, label: "Contact" },
] as const;

export function BottomTabs() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border glass-strong md:hidden"
      aria-label="Navigation principale"
    >
      {tabs.map(({ to, I, label }) => (
        <Link
          key={to}
          to={to}
          className="flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[10px] tracking-widest text-muted-foreground transition-colors"
          activeProps={{ className: "text-gold" }}
        >
          <I className="h-5 w-5" />
          {label.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
