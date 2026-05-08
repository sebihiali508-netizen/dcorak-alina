import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Bell, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { usePendingOrdersCount } from "@/hooks/useOrders";

interface TopBarProps {
  onMenuToggle: () => void;
  title?: string;
}

export function TopBar({ onMenuToggle, title }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: pendingCount = 0 } = usePendingOrdersCount();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="hidden sm:block">
        <h1 className="text-lg font-semibold text-foreground">{title || "Dashboard"}</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          className="pl-9 h-9 bg-surface-2 border-white/5 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Notifications */}
      <Link
        to="/admin/orders"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
      >
        <Bell className="h-5 w-5" />
        {pendingCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-gold-foreground">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </Link>

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gold/10 text-gold text-xs">
                {getInitials("Admin")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">Admin</p>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Administrateur
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-surface border-white/5">
          <DropdownMenuLabel className="text-foreground">Mon compte</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            asChild
            className="text-muted-foreground hover:text-foreground focus:text-foreground"
          >
            <Link to="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem className="text-destructive hover:text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
