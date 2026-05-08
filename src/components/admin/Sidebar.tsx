import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/customers", label: "Clients", icon: Users },
  { href: "/admin/categories", label: "Catégories", icon: Layers },
  { href: "/admin/analytics", label: "Analytiques", icon: BarChart3 },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0a0a0f] border-r border-white/5">
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center gap-3 px-4 border-b border-white/5",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10">
          <Store className="h-5 w-5 text-gold" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Decorak Alina</p>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Administration
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  "hover:bg-white/5 hover:text-foreground",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-gold/10 text-gold border-l-2 border-gold"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-gold")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/5" />

      {/* Bottom actions */}
      <div className="p-2 space-y-1">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground",
            "hover:bg-white/5 hover:text-foreground transition-all",
            collapsed && "justify-center px-2",
          )}
        >
          <Store className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Voir le site</span>}
        </Link>
        <button
          onClick={() => {
            /* handle logout */
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground",
            "hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!collapsed && (
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full bg-surface-2 border border-white/5 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:block fixed left-0 top-0 z-30 h-screen transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed left-0 top-0 z-50 h-screen w-72 animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile toggle button */}
      <button
        onClick={open ? onClose : onClose}
        className="fixed left-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-white/10 text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </>
  );
}
