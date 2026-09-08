import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { formatINR } from "@/lib/mock-data";
import { useCart } from "@/lib/store/cart";
import { useSettings } from "@/lib/store/settings-store";
import { computeTotals } from "@/lib/checkout";
import innerbanner from "@/assets/images/innerbanner.png";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — House of Phones" },
      { name: "description", content: "Review your selected devices and accessories before checkout." },
      { property: "og:url", content: "/cart" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: Cart,
});

function Cart() {
  const { items, loading, subtotal, increment, decrement, remove } = useCart();
  const { settings } = useSettings();
  const threshold = Number(settings.freeShippingThreshold) || 999;
  const stdFee = Number(settings.standardShippingFee) || 49;
  const shippingFee = subtotal >= threshold || subtotal === 0 ? 0 : stdFee;
  const { shipping, total } = computeTotals(subtotal, shippingFee);

  return (
    <PageLayout title="" subtitle="" crumbs={[]}>
      <section
        className="relative h-[220px] sm:h-[280px] md:h-[320px] flex items-center overflow-hidden -mt-[100px] sm:-mt-[120px] md:-mt-[150px]"
        style={{
          backgroundImage: `url(${innerbanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="container-hop relative z-10 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-5">
            <span>Home</span>
            <span>›</span>
            <span>Cart</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl mb-4">
            Shopping Cart
          </h1>

          <p className="text-lg md:text-2xl text-white/90">
            {!loading && items.length === 0
              ? "Your cart is currently empty."
              : "Review your selected devices and accessories before checkout."}
          </p>
        </div>
      </section>

      <section className="container-hop py-10 grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-10">
        {loading ? (
          <div className="col-span-full space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <h3 className="text-2xl font-serif mb-3">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Start adding some devices to your cart!</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors"
            >
              Browse Products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 min-w-0">
              {items.map((i) => (
                <div key={i.key} className="flex gap-4 bg-card border border-border rounded-2xl p-4">
                  <Link to={`/product/${i.product.slug || i.product.id}`} className="block w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                    <img src={i.product.image} alt={i.product.name} className="w-full h-full rounded-xl object-cover hover:opacity-90 transition-opacity" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{i.product.brand}</p>
                    <Link to={`/product/${i.product.slug || i.product.id}`} className="block mt-1 font-medium truncate hover:text-primary transition-colors">
                      {i.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[i.color, i.storage].filter(Boolean).join(" · ") || "Standard"}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1 border border-border rounded-full">
                        <button 
                          className="w-8 h-8 grid place-items-center hover:bg-muted rounded-full transition-colors"
                          onClick={() => decrement(i.key)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{i.qty}</span>
                        <button 
                          className="w-8 h-8 grid place-items-center hover:bg-muted rounded-full transition-colors"
                          onClick={() => increment(i.key)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-serif text-lg">{formatINR(i.product.price * i.qty)}</span>
                    </div>
                  </div>
                  <button 
                    className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => remove(i.key)}
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="flex gap-3">
                <input 
                  placeholder="Coupon code" 
                  className="flex-1 min-w-0 px-4 py-3 rounded-full bg-card border border-border text-sm focus:outline-none focus:border-primary" 
                />
                <button className="px-6 py-3 rounded-full bg-foreground text-background text-sm tracking-widest uppercase hover:bg-primary transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <aside className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-28">
              <p className="font-serif text-xl mb-4">Order Summary</p>
              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
                <Row label="GST" value="Included" />
              </div>
              <div className="border-t border-border my-4" />
              <Row label={<span className="text-base font-medium">Total</span>} value={<span className="font-serif text-2xl">{formatINR(total)}</span>} />
              <Link to="/checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors">
                Checkout <ArrowRight size={14} />
              </Link>
              <Link to="/shop" className="mt-3 w-full inline-flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </aside>
          </>
        )}
      </section>
    </PageLayout>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
