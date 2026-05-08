import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "En attente",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  confirmed: { label: "Confirmée", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  processing: {
    label: "En cours",
    className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  shipped: {
    label: "Expédiée",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  delivered: {
    label: "Livrée",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  cancelled: { label: "Annulée", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400" },
  paid: { label: "Payé", className: "bg-emerald-500/10 text-emerald-400" },
  failed: { label: "Échoué", className: "bg-red-500/10 text-red-400" },
  refunded: { label: "Remboursé", className: "bg-orange-500/10 text-orange-400" },
};

export function OrderStatusBadge({
  status,
  size = "sm",
}: {
  status: OrderStatus;
  size?: "sm" | "md";
}) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  size = "sm",
}: {
  status: PaymentStatus;
  size?: "sm" | "md";
}) {
  const config = paymentConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
