import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShieldCheck, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCreateOrder } from "@/hooks/useOrders";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Commander — Decorak Alina" },
      { name: "description", content: "Finalisez votre commande en toute sécurité." },
    ],
  }),
  component: Checkout,
});

const steps = ["Livraison", "Paiement", "Confirmation"];
const paymentMethods = ["CIB", "D17", "BaridiMob", "Cash à la livraison"];

function Checkout() {
  const { items, total, clear } = useCart();
  const createOrder = useCreateOrder();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash à la livraison");

  const handleConfirm = async () => {
    try {
      const result = await createOrder.mutateAsync({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || undefined,
        customer_address: { street: address, city, wilaya },
        payment_method: paymentMethod,
        total_amount: total,
        shipping_cost: 0,
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.qty,
          unit_price: i.product.price,
          total_price: i.product.price * i.qty,
        })),
      });
      setOrderNumber(result.order_number);
      clear();
      setDone(true);
    } catch {
      toast.error("Erreur lors de la création de la commande");
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-gold-foreground">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Commande reçue</h1>
        <p className="mt-2 text-sm text-gold font-mono">{orderNumber}</p>
        <p className="mt-3 text-muted-foreground">
          Merci de votre confiance. Notre équipe vous contactera pour confirmer les détails de
          fabrication et de livraison.
        </p>
        <Link
          to="/shop"
          className="btn-outline-gold mt-8 inline-flex h-11 items-center rounded-full px-6 text-sm tracking-widest"
        >
          RETOUR AU CATALOGUE
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Votre panier est vide</h1>
        <Link
          to="/shop"
          className="btn-gold mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm tracking-widest"
        >
          DÉCOUVRIR
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-8">
      <h1 className="font-display text-4xl">Finaliser la commande</h1>

      <div className="my-10 flex items-center gap-4">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-3">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-xs ${i <= step ? "bg-gold text-gold-foreground" : "bg-surface text-muted-foreground"}`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${i < step ? "bg-gold" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-surface p-8">
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
              className="space-y-5"
            >
              <h2 className="font-display text-2xl">Adresse de livraison</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="lux-input"
                  placeholder="Nom complet"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="lux-input"
                  placeholder="Téléphone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className="lux-input"
                  placeholder="Email (optionnel)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="lux-input md:col-span-2"
                  placeholder="Adresse"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <input
                  className="lux-input"
                  placeholder="Ville"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  className="lux-input"
                  placeholder="Wilaya"
                  required
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                />
              </div>
              <button className="btn-gold mt-2 h-12 rounded-full px-7 text-sm tracking-widest">
                CONTINUER
              </button>
            </form>
          )}
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-5"
            >
              <h2 className="font-display text-2xl">Paiement</h2>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`rounded-full border px-4 py-1.5 text-xs transition ${
                      paymentMethod === m
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-gold/40 text-gold/60 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" /> Paiement sécurisé SSL
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="h-12 rounded-full border border-border px-6 text-sm"
                >
                  Retour
                </button>
                <button className="btn-gold h-12 rounded-full px-7 text-sm tracking-widest">
                  VÉRIFIER
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl">Confirmer</h2>
              <p className="text-sm text-muted-foreground">
                Vérifiez votre commande et confirmez pour finaliser.
              </p>
              <div className="rounded-lg bg-surface-2 p-4 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Client :</span> {name}
                </p>
                <p>
                  <span className="text-muted-foreground">Tél :</span> {phone}
                </p>
                <p>
                  <span className="text-muted-foreground">Adresse :</span> {address}, {city},{" "}
                  {wilaya}
                </p>
                <p>
                  <span className="text-muted-foreground">Paiement :</span> {paymentMethod}
                </p>
              </div>
              {createOrder.isError && (
                <p className="text-sm text-red-400">
                  {(createOrder.error as any)?.message || "Erreur"}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 rounded-full border border-border px-6 text-sm"
                >
                  Retour
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={createOrder.isPending}
                  className="btn-gold h-12 rounded-full px-7 text-sm tracking-widest inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {createOrder.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  CONFIRMER L'ACHAT
                </button>
              </div>
            </div>
          )}
          <style>{`.lux-input{width:100%;border:1px solid var(--border);background:var(--background);color:var(--foreground);border-radius:8px;padding:14px 16px;font-size:14px;outline:none;transition:border .2s}.lux-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,175,55,0.12)}`}</style>
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-display text-xl">Récapitulatif</h3>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.product.id} className="flex justify-between gap-3 text-sm">
                <span className="line-clamp-1">
                  {i.product.name} × {i.qty}
                </span>
                <span>{(i.product.price * i.qty).toLocaleString("fr-FR")} DA</span>
              </li>
            ))}
          </ul>
          <div className="my-5 h-px bg-border" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Livraison</span>
            <span>Offerte</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl text-gold">
              {total.toLocaleString("fr-FR")} DA
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
