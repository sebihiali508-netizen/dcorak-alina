import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, isOpen, setOpen, remove, setQty, total, count } = useCart();

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-elegant transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <div className="font-display text-xl">Votre panier</div>
            <div className="text-xs text-muted-foreground">{count} article(s)</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="font-display text-xl">Panier vide</div>
                <p className="mt-2 text-sm text-muted-foreground">Découvrez notre collection.</p>
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm text-primary-foreground transition hover:bg-foreground"
                >
                  Voir le catalogue
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((i) => (
                <li key={i.product.id} className="flex gap-4">
                  <img src={i.product.image} alt="" className="h-24 w-24 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-display text-base leading-snug">{i.product.name}</div>
                      <button
                        onClick={() => remove(i.product.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground">{i.product.category}</div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQty(i.product.id, i.qty - 1)}
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{i.qty}</span>
                        <button
                          onClick={() => setQty(i.product.id, i.qty + 1)}
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-sm">
                        {(i.product.price * i.qty).toLocaleString("fr-FR")} DA
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-secondary/40 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-2xl">{total.toLocaleString("fr-FR")} DA</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm text-primary-foreground transition hover:bg-foreground"
            >
              Commander
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
