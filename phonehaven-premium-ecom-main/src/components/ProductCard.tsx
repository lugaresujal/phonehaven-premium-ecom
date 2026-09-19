import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Loader2, X } from "lucide-react";
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
    <div className="group relative flex flex-col h-full rounded-2xl bg-card border border-border/60 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(138,106,74,0.25)] hover:border-primary/25">
      {/* Image Area */}
      <Link
        to="/product/$slug"
        params={{ slug: productSlug }}
        className="relative block aspect-square bg-accent/30 overflow-hidden shrink-0"
      >
        {/* Badge — top-left */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-foreground text-background text-[9px] md:text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full font-medium">
            {product.badge}
          </span>
        )}

        {/* Discount — top-right */}
        {discount > 0 && (
          <span className="absolute top-2.5 right-2.5 z-10 bg-primary/10 text-primary text-[10px] md:text-[11px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
            -{discount}%
          </span>
        )}

        {/* Out of Stock overlay */}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 z-10 bg-foreground/80 text-background text-[10px] tracking-widest uppercase py-1.5 text-center font-medium">
            Out of Stock
          </span>
        )}

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist — bottom-right */}
        <button
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={`absolute bottom-2.5 right-2.5 w-8 h-8 grid place-items-center rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-md transition-all duration-200 hover:scale-110 md:opacity-0 md:group-hover:opacity-100 ${wished ? "text-primary md:opacity-100" : "text-muted-foreground hover:text-primary"}`}
        >
          {wished ? <X size={15} /> : <Heart size={15} />}
        </button>
      </Link>

      {/* Content Area */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        {/* Brand */}
        <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground font-medium min-h-[1rem]">
          {product.brand}
        </p>

        {/* Product Name — fixed height for alignment */}
        <Link
          to="/product/$slug"
          params={{ slug: productSlug }}
          className="mt-1.5 font-medium text-[13px] md:text-sm text-foreground line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] leading-snug hover:text-primary transition-colors"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif text-base md:text-lg font-semibold text-foreground">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-[11px] md:text-xs text-muted-foreground line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          disabled={adding || outOfStock}
          className="mt-2.5 md:mt-3 w-full inline-flex items-center justify-center gap-1.5 md:gap-2 text-[11px] md:text-xs tracking-wider md:tracking-widest uppercase font-semibold py-2 md:py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-primary-foreground disabled:cursor-not-allowed"
        >
          {adding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ShoppingBag size={14} />
          )}
          {outOfStock ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
