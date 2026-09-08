import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { Heart, ArrowRight } from "lucide-react";
import innerbanner from "@/assets/images/innerbanner.png";
import { useWishlist } from "@/lib/store/wishlist";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — House of Phones" },
      { name: "description", content: "The devices you've saved for later at House of Phones." },
      { property: "og:url", content: "/wishlist" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),

  component: WishlistPage,
});

function WishlistPage() {
  const { items, loading } = useWishlist();

  return (
    <PageLayout>
      {/* Banner */}
      <section
        className="relative h-[260px] md:h-[320px] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${innerbanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="container-hop relative z-10 text-white">
          <div className="flex items-center gap-2 text-sm mb-5 text-white/80">
            <span>Home</span>
            <span>›</span>
            <span>Wishlist</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-4">
            Your Wishlist
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-white/90">
            {loading
              ? "Loading your saved devices…"
              : items.length === 0
                ? "You haven't saved any devices yet."
                : `The devices you've saved for later.`}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="container-hop py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/70 overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <Heart size={48} className="mx-auto text-muted-foreground mb-5" />
            <h2 className="font-serif text-2xl mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">Start adding your favourite devices!</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors"
            >
              Browse Products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
