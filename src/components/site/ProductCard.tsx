import { Link } from "@tanstack/react-router";
import { Heart, ImageIcon } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const [fav, setFav] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group lux-card block overflow-hidden rounded-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        {imgErr || !product.image ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-30" />
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="product-image h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
        <button
          onClick={(e) => {
            e.preventDefault();
            setFav((v) => !v);
          }}
          aria-label="Favori"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass text-foreground/85 transition hover:text-gold"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-gold text-gold" : ""}`} />
        </button>
        {product.oldPrice && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-medium tracking-widest text-gold-foreground">
            PROMO
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-[10px] tracking-[0.3em] text-gold">
          {product.category.toUpperCase()}
        </div>
        <h3 className="mt-2 font-display text-xl leading-snug text-foreground">{product.name}</h3>
        <div className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.tagline}</div>
        <div className="relative mt-4 flex items-baseline justify-between">
          <span className="text-base text-foreground">
            {product.price.toLocaleString("fr-FR")}{" "}
            <span className="text-xs text-muted-foreground">DA</span>
          </span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.oldPrice.toLocaleString("fr-FR")} DA
            </span>
          )}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
        </div>
      </div>
    </Link>
  );
}
