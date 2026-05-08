import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue =
    typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;
  const isCurrency = typeof value === "string" && value.includes("DA");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1000;
          const startTime = performance.now();

          function animate(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.round(numericValue * eased);
            setDisplayValue(start);
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue]);

  const formattedValue = isCurrency
    ? new Intl.NumberFormat("fr-DZ").format(displayValue) + " DA"
    : displayValue.toLocaleString();

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/5 bg-surface p-5 transition-all duration-300",
        "hover:border-gold/20 hover:shadow-gold",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{formattedValue}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 text-gold">
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          <span
            className={cn("text-xs font-medium", trend >= 0 ? "text-emerald-400" : "text-red-400")}
          >
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
