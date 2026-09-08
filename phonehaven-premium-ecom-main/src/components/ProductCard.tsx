import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatINR, type Product } from "@/lib/mock-data";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useProtectedAction } from "@/lib/store/protected";

export function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const { add } = useCart();
  const wishlist = useWishlist();
  const guard = useProtectedAction();
  const [adding, setAdding] = useState(false);
  const outOfStock = product.stock <= 0;
  const wished = wishlist.has(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || outOfStock) return;
    guard({ type: "none" }, () => {
      setAdding(true);
      const ok = add({ product, qty: 1, color: product.colors?.[0], storage: product.storage?.[0] });
      if (ok) toast.success(`${product.name} added to cart`);
      setTimeout(() => setAdding(false), 400);
    }, "Please create an account or log in first to add products to your cart.");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    guard({ type: "wishlist", productId: product.id }, () => {
      const added = wishlist.toggle(product.id);
      toast.success(added ? "Added to wishlist" : "Removed from wishlist");
    }, "Please create an account or log in first to add products to your wishlist.");
  };


  const productSlug = product.slug || product.id;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-card border border-border/70 overflow-hidden hover:shadow-[0_20px_60px_-30px_rgba(138,106,74,0.35)] transition-all">
      <Link to="/product/$slug" params={{ slug: productSlug }} className="relative block aspect-square bg-accent/40 overflow-hidden">
        {product.badge && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-foreground text-background text-[9px] md:text-[10px] tracking-widest uppercase px-2 md:px-2.5 py-0.5 md:py-1 rounded-full">{product.badge}</span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-primary/10 text-primary text-[10px] md:text-[11px] font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">-{discount}%</span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 z-10 bg-foreground/80 text-background text-[10px] tracking-widest uppercase py-1.5 text-center">
            Out of Stock
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <button
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 w-8 h-8 md:w-9 md:h-9 grid place-items-center rounded-full bg-background/90 backdrop-blur-sm border border-border transition-opacity hover:text-primary md:opacity-0 md:group-hover:opacity-100 ${wished ? "text-primary md:opacity-100" : ""}`}
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
      </Link>
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <Link to="/product/$slug" params={{ slug: productSlug }} className="mt-1 font-medium text-[13px] md:text-sm text-foreground line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] hover:text-primary transition-colors">
          {product.name}
        </Link>
        <div className="mt-2 md:mt-3 flex items-baseline gap-2">
          <span className="font-serif text-base md:text-lg text-foreground">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-[11px] md:text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || outOfStock}
          className="mt-3 md:mt-4 inline-flex items-center justify-center gap-2 text-[11px] md:text-xs tracking-widest uppercase font-medium py-2.5 md:py-2.5 border border-foreground/90 rounded-full hover:bg-foreground hover:text-background transition-colors disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-foreground disabled:cursor-not-allowed"
        >
          {adding ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} />}
          {outOfStock ? "Out of Stock" : adding ? "Adding" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
