import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import innerBanner from "@/assets/images/innerbanner.png";
import { accessoryCategories } from "@/lib/accessories-catalog";
import { useProducts } from "@/lib/products-store";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Premium Mobile Accessories — House of Phones" },
      {
        name: "description",
        content:
          "Power Banks, Fast Chargers, Wireless Earbuds, iPhone Covers, Screen Guards, Smartwatches, Korean Bags, and Wireless Keyboard & Mouse.",
      },
      { property: "og:url", content: "/accessories" },
    ],
    links: [{ rel: "canonical", href: "/accessories" }],
  }),

  component: Accessories,
});

function Accessories() {
  const { catalogAccessories } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => new URLSearchParams(location.search).get("category"),
  );

  // Keep the active filter in sync with the URL (deep links from the home page).
  useEffect(() => {
    setSelectedCategory(new URLSearchParams(location.search).get("category"));
  }, [location.search]);

  // Clean accessories list:
  // Excludes dummy placeholder items (a1-a12, cover-1-6, or dummy unsplash placeholders)
  // Keeps all genuine imported catalog accessories (acc-1 to acc-29) and any real CMS accessory products.
  const realCatalogAccessories = catalogAccessories.filter((p) => {
    const id = String(p.id || "").toLowerCase();
    if (/^a\d+$/.test(id) || /^cover-\d+$/.test(id)) return false;
    return true;
  });

  const filteredAccessories = selectedCategory
    ? realCatalogAccessories.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.type?.toLowerCase() === selectedCategory.toLowerCase(),
      )
    : realCatalogAccessories;

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    navigate(category ? `/accessories?category=${encodeURIComponent(category)}` : "/accessories");
  };

  const getCategoryDisplayName = () => selectedCategory ?? "All Accessories";

  return (
    <PageLayout bare>
      {/* Hero Banner */}
      <section className="relative aspect-[16/9] md:h-[320px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="Accessories Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/80">Premium Collection</p>
          <h1 className="mt-2 md:mt-3 font-serif text-3xl sm:text-4xl md:text-6xl">{getCategoryDisplayName()}</h1>
          <p className="mt-2 md:mt-4 max-w-2xl text-sm md:text-lg text-white/90">
            {selectedCategory
              ? `Explore our premium collection of ${selectedCategory.toLowerCase()}`
              : "Everything you need to elevate your device."}
          </p>
        </div>
      </section>

      {/* Accessories Section */}
      <section className="container-hop py-8 md:py-10">
        {/* Category Filter Tabs */}
        <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:overflow-x-visible scrollbar-hide">
          <span
            onClick={() => handleCategorySelect(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full border text-xs uppercase tracking-widest cursor-pointer transition-colors ${
              selectedCategory === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            Shop All
          </span>
          {accessoryCategories.map((t) => (
            <span
              key={t}
              onClick={() => handleCategorySelect(t)}
              className={`shrink-0 px-4 py-1.5 rounded-full border text-xs uppercase tracking-widest cursor-pointer transition-colors ${
                selectedCategory === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filteredAccessories.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filteredAccessories.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
            <button
              onClick={() => handleCategorySelect(null)}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View All Accessories
            </button>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
