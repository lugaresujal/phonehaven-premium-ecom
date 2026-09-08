import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Zap,
  Sparkles,
  Award,
  ArrowRight,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { formatINR, type Product } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useCart, MAX_QTY_PER_LINE } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useProtectedAction } from "@/lib/store/protected";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product?.name || "Product"} — House of Phones` },
      {
        name: "description",
        content: `Buy ${loaderData?.product?.name || "premium devices"} at ${formatINR(
          loaderData?.product?.price ?? 0,
        )} with official warranty, easy EMI, exchange offer and free delivery from House of Phones.`,
      },
      { property: "og:title", content: loaderData?.product?.name },
      { property: "og:description", content: `Premium ${loaderData?.product?.brand || "gadgets"} available at House of Phones.` },
      { property: "og:type", content: "product" },
      { property: "og:image", content: loaderData?.product?.image },
      { name: "twitter:image", content: loaderData?.product?.image },
      { property: "og:url", content: `/product/${loaderData?.product?.slug || ""}` },
    ],
    links: [{ rel: "canonical", href: `/product/${loaderData?.product?.slug || ""}` }],
  }),
});

function ProductPage() {
  const params = useParams<{ slug: string }>();
  const { findProduct, allProducts, loading } = useProducts();
  const rawSlug = params?.slug || "";
  const product: Product | undefined = findProduct(rawSlug);

  const [color, setColor] = useState<string | undefined>(undefined);
  const [storage, setStorage] = useState<string | undefined>(undefined);
  const [img, setImg] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const { add } = useCart();
  const wishlist = useWishlist();
  const guard = useProtectedAction();
  const navigate = useNavigate();

  const userSelectedImg = useRef(false);
  const prevProductId = useRef<string | number | undefined>(undefined);

  // Synchronize variant selections and main image whenever active product changes
  useEffect(() => {
    if (product) {
      if (prevProductId.current !== product.id) {
        prevProductId.current = product.id;
        userSelectedImg.current = false;
        setColor(product.colors?.[0]);
        setStorage(product.storage?.[0]);
        setImg(product.image || product.images?.[0] || "");
      }
      setQty(1);
    }
  }, [product?.id, product?.slug]);

  if (!product) {
    if (loading) {
      return (
        <PageLayout bare>
          <div className="container-hop py-16">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="aspect-square rounded-3xl bg-muted animate-pulse" />
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
                <div className="h-10 w-3/4 bg-muted rounded-2xl animate-pulse" />
                <div className="h-8 w-40 bg-muted rounded-full animate-pulse" />
                <div className="h-32 w-full bg-muted rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </PageLayout>
      );
    }

    return (
      <PageLayout bare>
        <div className="container-hop py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ShoppingBag size={28} />
            </div>
            <h1 className="font-serif text-3xl mb-3">Product Not Found</h1>
            <p className="text-muted-foreground text-sm mb-8">
              The product you are looking for might have been moved, renamed, or is temporarily unavailable.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Browse All Products <ArrowRight size={14} />
              </Link>
              <Link
                to="/accessories"
                className="px-6 py-3 rounded-full border border-border text-foreground text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-colors"
              >
                View Accessories
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const mrp = product.mrp || product.originalPrice || product.price;
  const price = product.price;
  const savings = Math.max(0, mrp - price);
  const discount = mrp > price ? Math.round((savings / mrp) * 100) : 0;
  const outOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const wished = wishlist.has(product.id);
  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_LINE, product.stock || MAX_QTY_PER_LINE));

  // Related products
  const sameCategory = allProducts.filter((p) => p.category?.toLowerCase() === product.category?.toLowerCase() && p.id !== product.id);
  const sameBrand = allProducts.filter((p) => p.brand?.toLowerCase() === product.brand?.toLowerCase() && p.id !== product.id);
  const related = Array.from(new Map([...sameBrand, ...sameCategory].map((p) => [p.id, p])).values()).slice(0, 4);

  // Gallery images
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    if (outOfStock || adding) return;
    guard(
      { type: "none" },
      () => {
        setAdding(true);
        const ok = add({ product, qty, color, storage });
        if (ok) toast.success(`${product.name} added to your cart!`);
        setTimeout(() => setAdding(false), 400);
      },
      "Please create an account or log in first to add products to your cart.",
    );
  };

  const handleBuyNow = () => {
    if (outOfStock || buyingNow) return;
    guard(
      { type: "checkout" },
      () => {
        setBuyingNow(true);
        const ok = add({ product, qty, color, storage });
        if (ok) {
          toast.success(`Proceeding to checkout with ${product.name}`);
          navigate({ to: "/checkout" });
        }
        setTimeout(() => setBuyingNow(false), 400);
      },
      "Please sign in to proceed directly to checkout.",
    );
  };

  const handleWishlist = () => {
    guard(
      { type: "wishlist", productId: product.id },
      () => {
        const added = wishlist.toggle(product.id);
        toast.success(added ? `${product.name} saved to wishlist` : `${product.name} removed from wishlist`);
      },
      "Please sign in to save items to your wishlist.",
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at House of Phones!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const emiPerMonth = Math.round(product.price / 12);

  return (
    <PageLayout bare>
      {/* Breadcrumbs */}
      <div className="container-hop pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-primary transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link
            to={product.category?.toLowerCase() === "smartphones" ? "/shop" : "/accessories"}
            className="hover:text-primary transition-colors shrink-0 capitalize"
          >
            {product.category || "Shop"}
          </Link>
          {product.brand && (
            <>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-muted-foreground shrink-0">{product.brand}</span>
            </>
          )}
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-[350px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Main Product Presentation */}
      <section className="container-hop py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-accent/40 via-card to-accent/20 border border-border/80 shadow-lg group">
              {/* Product Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase font-semibold px-3 py-1.5 rounded-full shadow-md">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] tracking-wider font-bold px-3 py-1.5 rounded-full shadow-md">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Share & Wishlist quick actions */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={handleWishlist}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-md ${
                    wished
                      ? "bg-red-50 text-red-500 border border-red-200"
                      : "bg-white/80 dark:bg-black/60 text-muted-foreground hover:text-red-500 border border-border hover:scale-110"
                  }`}
                >
                  <Heart size={18} fill={wished ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 text-muted-foreground hover:text-foreground border border-border flex items-center justify-center hover:scale-110 transition-all duration-300 backdrop-blur-md shadow-md"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Main Image */}
              <img
                src={img || product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {outOfStock && (
                <div className="absolute inset-x-0 bottom-0 z-10 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold tracking-widest uppercase py-2.5 text-center">
                  Currently Out of Stock
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      userSelectedImg.current = true;
                      setImg(image);
                    }}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-card ${
                      img === image ? "border-primary ring-2 ring-primary/20 shadow-md scale-105" : "border-border/70 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header / Brand & Rating */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-primary">
                  {product.brand || "House of Phones"}
                </span>
                <span className="text-[11px] text-muted-foreground bg-accent/60 px-2.5 py-0.5 rounded-full capitalize">
                  {product.type || product.category}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  <span>{product.rating || 4.8}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews || 42} verified reviews)
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck size={14} /> 100% Authentic
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                  {formatINR(product.price)}
                </span>
                {savings > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatINR(mrp)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-green-500/10 text-green-600 font-semibold text-xs">
                      Save {formatINR(savings)} ({discount}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Inclusive of all taxes & GST. Free shipping available on this order.
              </p>

              {/* EMI Callout */}
              {product.price > 2000 && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap size={14} className="text-amber-500 shrink-0" />
                  <span>
                    No Cost EMI starting from <strong className="text-foreground">{formatINR(emiPerMonth)}/month</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Colors Option Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground uppercase tracking-wider">
                    Select Color: <span className="text-primary font-semibold">{color || product.colors[0]}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c, i) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        if (product.images && product.images[i]) {
                          userSelectedImg.current = true;
                          setImg(product.images[i]);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                        color === c
                          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                          : "border-border bg-card text-foreground hover:border-primary/60"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Option Selection */}
            {product.storage && product.storage.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground uppercase tracking-wider">
                    Select Storage: <span className="text-primary font-semibold">{storage || product.storage[0]}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.storage.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStorage(s)}
                      className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                        storage === s
                          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                          : "border-border bg-card text-foreground hover:border-primary/60"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Status */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-border rounded-xl bg-card p-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1 || outOfStock}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(maxQty, qty + 1))}
                    disabled={qty >= maxQty || outOfStock}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Stock Status Indicator */}
              <div className="text-right">
                {outOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-500/10 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    In Stock (Ready to Ship)
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
                className="flex-1 py-4 px-6 rounded-full bg-foreground text-background font-semibold text-xs tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl inline-flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                {outOfStock ? "Out of Stock" : adding ? "Adding to Cart..." : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={outOfStock || buyingNow}
                className="flex-1 py-4 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl inline-flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {buyingNow ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                Buy Now
              </button>
            </div>

            {/* Value Props & Assurances */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-accent/40 border border-border/50 text-center">
                <Truck size={20} className="text-primary" />
                <span className="text-[11px] font-semibold text-foreground">Free Delivery</span>
                <span className="text-[10px] text-muted-foreground">Pune in 24-48 hrs</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-accent/40 border border-border/50 text-center">
                <ShieldCheck size={20} className="text-primary" />
                <span className="text-[11px] font-semibold text-foreground">1 Yr Warranty</span>
                <span className="text-[10px] text-muted-foreground">Official brand warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-accent/40 border border-border/50 text-center">
                <RotateCcw size={20} className="text-primary" />
                <span className="text-[11px] font-semibold text-foreground">7 Days Return</span>
                <span className="text-[10px] text-muted-foreground">Hassle-free policy</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-accent/40 border border-border/50 text-center">
                <Award size={20} className="text-primary" />
                <span className="text-[11px] font-semibold text-foreground">100% Genuine</span>
                <span className="text-[10px] text-muted-foreground">Sealed pack retail</span>
              </div>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  Key Highlights
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check size={14} className="mt-0.5 text-primary shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground">
                  Product Overview
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications Table */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground">
                Technical Specifications
              </h3>
              <div className="rounded-2xl border border-border/70 overflow-hidden bg-card text-xs">
                <div className="grid grid-cols-2 p-3 border-b border-border/40 bg-accent/20">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium text-foreground">{product.brand}</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-border/40">
                  <span className="text-muted-foreground">Model / Name</span>
                  <span className="font-medium text-foreground">{product.name}</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-border/40 bg-accent/20">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground capitalize">{product.category}</span>
                </div>
                {product.ram && (
                  <div className="grid grid-cols-2 p-3 border-b border-border/40">
                    <span className="text-muted-foreground">RAM</span>
                    <span className="font-medium text-foreground">{product.ram}</span>
                  </div>
                )}
                {product.storage && product.storage.length > 0 && (
                  <div className="grid grid-cols-2 p-3 border-b border-border/40 bg-accent/20">
                    <span className="text-muted-foreground">Storage Variants</span>
                    <span className="font-medium text-foreground">{product.storage.join(", ")}</span>
                  </div>
                )}
                {product.colors && product.colors.length > 0 && (
                  <div className="grid grid-cols-2 p-3 border-b border-border/40">
                    <span className="text-muted-foreground">Available Colors</span>
                    <span className="font-medium text-foreground">{product.colors.join(", ")}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 p-3 border-b border-border/40 bg-accent/20">
                  <span className="text-muted-foreground">Warranty</span>
                  <span className="font-medium text-foreground">1 Year Brand Warranty</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-muted-foreground">In The Box</span>
                  <span className="font-medium text-foreground">Device, Cable, Quick Start Guide, Warranty Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="container-hop py-12 border-t border-border/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-primary mb-1">
                Recommendations
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground">You May Also Like</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold tracking-wider uppercase text-primary hover:underline inline-flex items-center gap-1"
            >
              View Catalogue <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
