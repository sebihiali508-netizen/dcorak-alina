import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  ChevronDown,
  Check,
  Truck,
  Package,
  Clock,
  XCircle,
  Building,
} from "lucide-react";
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateOrderNotes,
} from "@/hooks/useOrders";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetailPage,
});

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <Check className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <Building className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

function OrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const updateNotes = useUpdateOrderNotes();
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12 text-muted-foreground">Commande introuvable</div>;
  }

  const ord = order as any;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const handlePaymentChange = async (newStatus: string) => {
    try {
      await updatePayment.mutateAsync({ id, payment_status: newStatus });
      toast.success("Statut de paiement mis à jour");
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes.mutateAsync({ id, notes });
      toast.success("Notes enregistrées");
    } catch {
      toast.error("Erreur");
    }
  };

  const currentStatusIndex = orderStatuses.indexOf(ord.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/admin/orders" })}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display">{ord.order_number}</h2>
            <p className="text-sm text-muted-foreground">{formatDateTime(ord.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/5 text-muted-foreground">
            <Printer className="h-4 w-4 mr-2" /> Facture
          </Button>
          {ord.customer_phone && (
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() =>
                window.open(`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, "")}`, "_blank")
              }
            >
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="rounded-xl border border-white/5 bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Suivi de commande</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
              <div className="space-y-6">
                {orderStatuses
                  .filter((s) => s !== "cancelled")
                  .map((status, i) => {
                    const isCompleted = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    return (
                      <div key={status} className="relative flex items-start gap-4">
                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                            isCompleted
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 bg-surface text-muted-foreground"
                          }`}
                        >
                          {statusIcons[status]}
                        </div>
                        <div className="pt-1">
                          <p
                            className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {status === "pending" && "En attente"}
                            {status === "confirmed" && "Confirmée"}
                            {status === "processing" && "En cours de préparation"}
                            {status === "shipped" && "Expédiée"}
                            {status === "delivered" && "Livrée"}
                          </p>
                          {isCurrent && (
                            <p className="text-[10px] text-gold mt-0.5">Statut actuel</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-white/5 bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Articles</h3>
            <div className="space-y-3">
              {ord.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-surface-2 p-3"
                >
                  <div>
                    <p className="text-sm text-foreground font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} x {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {formatPrice(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
            <Separator className="my-3 bg-white/5" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="text-foreground">
                {formatPrice(ord.total_amount - ord.shipping_cost)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Livraison</span>
              <span className="text-foreground">{formatPrice(ord.shipping_cost)}</span>
            </div>
            <Separator className="my-3 bg-white/5" />
            <div className="flex justify-between text-base font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-gold">{formatPrice(ord.total_amount)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-white/5 bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Notes internes</h3>
            <Textarea
              value={notes || ord.notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter une note..."
              rows={3}
              className="bg-surface-2 border-white/5"
            />
            <Button
              size="sm"
              onClick={handleSaveNotes}
              className="mt-2 bg-gold text-gold-foreground hover:bg-gold/90"
              disabled={updateNotes.isPending}
            >
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status actions */}
          <div className="rounded-xl border border-white/5 bg-surface p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Actions</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Statut</label>
              <Select value={ord.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-surface-2 border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {orderStatuses.map((s) => (
                    <SelectItem key={s} value={s} className="text-foreground">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Paiement</label>
              <Select value={ord.payment_status} onValueChange={handlePaymentChange}>
                <SelectTrigger className="bg-surface-2 border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {paymentStatuses.map((s) => (
                    <SelectItem key={s} value={s} className="text-foreground">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-xl border border-white/5 bg-surface p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Client</h3>
            <div>
              <p className="text-xs text-muted-foreground">Nom</p>
              <p className="text-sm text-foreground">{ord.customer_name}</p>
            </div>
            {ord.customer_email && (
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{ord.customer_email}</p>
              </div>
            )}
            {ord.customer_phone && (
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="text-sm text-foreground">{ord.customer_phone}</p>
              </div>
            )}
            {ord.customer_address && (
              <div>
                <p className="text-xs text-muted-foreground">Adresse</p>
                <p className="text-sm text-foreground">
                  {(ord.customer_address as any)?.street || ""}
                  {(ord.customer_address as any)?.wilaya
                    ? `, ${(ord.customer_address as any).wilaya}`
                    : ""}
                </p>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="rounded-xl border border-white/5 bg-surface p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Paiement</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Statut</span>
              <PaymentStatusBadge status={ord.payment_status} size="md" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Méthode</span>
              <span className="text-sm text-foreground capitalize">
                {ord.payment_method?.replace(/_/g, " ") || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm text-gold font-semibold">
                {formatPrice(ord.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
