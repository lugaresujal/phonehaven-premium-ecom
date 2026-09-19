import innerBanner from "@/assets/images/innerbanner.png";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3x3, List, ArrowLeft, X } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { brands as mockBrands, accessoryTypes } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useCms } from "@/lib/cms-store";

// Updated accessory types
const updatedAccessoryTypes = [
  "iPhone Covers",
  "Screen Guards",
  "Power Banks",
  "Fast Chargers",
  "Wireless Earbuds",
  "Smart Watches",
  "Korean Bags",
  "Wireless Keyboard and Mouse"
];

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Smartphones & Accessories — House of Phones" },
      { name: "description", content: "Browse the complete catalogue of premium smartphones and accessories with advanced filters, EMI options and exchange offers." },
      { property: "og:title", content: "Shop — House of Phones" },
      { property: "og:description", content: "The full catalogue of premium mobile devices and accessories." },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

function Shop() {
  const { products, accessories, catalogAccessories, coverProducts } = useProducts();
  const { brands: cmsBrands } = useCms();
  const brands = cmsBrands.length > 0 ? cmsBrands : mockBrands;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const matchesQuery = (p: { name: string; brand: string; category: string }) =>
    !query || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query);
  const [sort, setSort] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAccessoryTypes, setSelectedAccessoryTypes] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 200000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleBrand = (b: string) =>
    setSelectedBrands((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const toggleAccessoryType = (t: string) =>
    setSelectedAccessoryTypes((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  // Filter products (phones)
  let productList = products.filter(
    (p) =>
      matchesQuery(p) &&
      (selectedBrands.length === 0 || selectedBrands.includes(p.brand)) &&
      p.price >= price[0] && p.price <= price[1],
  );

  // Only use real catalog accessories (acc-1 to acc-29 with actual product images) and genuine CMS accessories.
  // Excludes dummy placeholder items (a1-a12, cover-1-6).
  const realCatalogAccessories = catalogAccessories.filter((p) => {
    const id = String(p.id || "").toLowerCase();
    if (/^a\d+$/.test(id) || /^cover-\d+$/.test(id)) return false;
    return true;
  });
  let accessoryList = realCatalogAccessories.filter(
    (p) =>
      matchesQuery(p) &&
      (selectedAccessoryTypes.length === 0 || selectedAccessoryTypes.includes(p.type ?? p.category)) &&
      p.price >= price[0] && p.price <= price[1],
  );

  // Check if Premium Covers is selected
  const isPremiumCoversSelected = selectedAccessoryTypes.includes("Premium Covers");

  // Handle category click - redirect to Accessories page with category filter
  const handleCategoryClick = (categoryName: string) => {
    navigate({
      to: "/accessories",
      search: {
        category: categoryName
      }
    });
  };

  // Cover images come from the shared catalog so cart/wishlist stay in sync.
  const coverImages = coverProducts;

  // If Premium Covers is selected, show only cover images
  if (isPremiumCoversSelected) {
    // Sort covers
    let sortedCovers = [...coverImages];
    if (sort === "low") {
      sortedCovers = sortedCovers.sort((a, b) => a.price - b.price);
    }
    if (sort === "high") {
      sortedCovers = sortedCovers.sort((a, b) => b.price - a.price);
    }
    if (sort === "rating") {
      sortedCovers = sortedCovers.sort((a, b) => b.rating - a.rating);
    }

    return (
      <PageLayout bare>
        {/* Banner - Reduced height */}
        <section className="relative inner-banner md:h-[280px] md:aspect-auto overflow-hidden">
          <img
            src={innerBanner}
            alt="Shop Banner"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="container-hop relative z-10 flex h-full flex-col justify-center">
            <p className="text-xs md:text-sm uppercase tracking-[4px] md:tracking-[6px] text-white/80">
              House of Phones
            </p>
            <h1 className="mt-2 md:mt-3 font-serif text-3xl sm:text-4xl md:text-6xl text-white">
              Premium Covers
            </h1>
            <p className="mt-2 md:mt-4 max-w-2xl text-sm md:text-lg text-white/90">
              Discover our curated collection of premium mobile covers
            </p>
          </div>
        </section>

        {/* Back Button */}
        <section className="container-hop py-6">
          <button
            onClick={() => {
              setSelectedAccessoryTypes(selectedAccessoryTypes.filter(t => t !== "Premium Covers"));
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:border-primary/30 hover:bg-accent transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop</span>
          </button>
        </section>

        <section className="container-hop pb-16">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Desktop Filters - Sticky */}
            <div className="hidden lg:block lg:w-[280px] lg:flex-shrink-0">
              <div className="sticky top-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                <div className="space-y-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2"><SlidersHorizontal size={14} /> Filters</p>
                    <div className="space-y-6">
                      {/* Accessory Types Filter - Vertical Layout */}
                      <div>
                        <p className="font-medium mb-3 text-sm">Accessory Types</p>
                        <div className="space-y-2">
                        {updatedAccessoryTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => handleCategoryClick(t)}
                            className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                        </div>
                      </div>

                      {/* Brand Filter */}
                      <div>
                        <p className="font-medium mb-3 text-sm">Brand</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {brands.map((b) => (
                            <label key={b.slug} htmlFor={`brand-${b.slug}-cov`} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input id={`brand-${b.slug}-cov`} type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
                              <span>{b.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <p className="font-medium mb-3 text-sm">Price Range</p>
                        <input
                          type="range"
                          min={0}
                          max={200000}
                          step={5000}
                          value={price[1]}
                          onChange={(e) => setPrice([0, Number(e.target.value)])}
                          className="w-full accent-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Up to ₹{price[1].toLocaleString("en-IN")}</p>
                      </div>

                      {/* RAM Filter */}
                      <div>
                        <p className="font-medium mb-3 text-sm">RAM</p>
                        {["4GB", "6GB", "8GB", "12GB", "16GB"].map((r) => (
                          <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                            <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                          </label>
                        ))}
                      </div>

                      {/* Storage Filter */}
                      <div>
                        <p className="font-medium mb-3 text-sm">Storage</p>
                        {["64GB", "128GB", "256GB", "512GB", "1TB"].map((r) => (
                          <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                            <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">Showing <span className="text-foreground font-medium">{sortedCovers.length}</span> products</p>
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs sm:text-sm bg-card border border-border rounded-full px-3 py-2 md:px-4">
                    <option value="featured">Featured</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <div className="hidden sm:flex gap-1 border border-border rounded-full p-1">
                    <button 
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <Grid3x3 size={14} />
                    </button>
                    <button 
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Premium Covers Grid */}
              <div className={`grid gap-4 md:gap-5 ${
                viewMode === "grid" 
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {sortedCovers.map((cover) => (
                  <ProductCard key={cover.id} product={cover} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filter Sidebar */}
        {mobileFiltersOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-[85vw] max-w-[300px] bg-background z-50 overflow-y-auto p-6 shadow-xl lg:hidden">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <SlidersHorizontal size={18} /> Filters
                </p>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                {/* Accessory Types */}
                <div>
                  <p className="font-medium mb-3 text-sm">Accessory Types</p>
                  <div className="space-y-2">
                    {updatedAccessoryTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          handleCategoryClick(t);
                          setMobileFiltersOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <p className="font-medium mb-3 text-sm">Brand</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {brands.map((b) => (
                      <label key={b.slug} htmlFor={`brand-${b.slug}-mob-cov`} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input id={`brand-${b.slug}-mob-cov`} type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <p className="font-medium mb-3 text-sm">Price Range</p>
                  <input
                    type="range"
                    min={0}
                    max={200000}
                    step={5000}
                    value={price[1]}
                    onChange={(e) => setPrice([0, Number(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Up to ₹{price[1].toLocaleString("en-IN")}</p>
                </div>

                {/* RAM Filter */}
                <div>
                  <p className="font-medium mb-3 text-sm">RAM</p>
                  {["4GB", "6GB", "8GB", "12GB", "16GB"].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                      <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                    </label>
                  ))}
                </div>

                {/* Storage Filter */}
                <div>
                  <p className="font-medium mb-3 text-sm">Storage</p>
                  {["64GB", "128GB", "256GB", "512GB", "1TB"].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                      <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}
      </PageLayout>
    );
  }

  // Sort products
  if (sort === "low") {
    productList = [...productList].sort((a, b) => a.price - b.price);
    accessoryList = [...accessoryList].sort((a, b) => a.price - b.price);
  }
  if (sort === "high") {
    productList = [...productList].sort((a, b) => b.price - a.price);
    accessoryList = [...accessoryList].sort((a, b) => b.price - a.price);
  }
  if (sort === "rating") {
    productList = [...productList].sort((a, b) => b.rating - a.rating);
    accessoryList = [...accessoryList].sort((a, b) => b.rating - a.rating);
  }

  const totalProducts = productList.length + accessoryList.length;

  return (
    <PageLayout bare>
      {/* Banner - Reduced height */}
      <section className="relative inner-banner md:h-[280px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="Shop Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container-hop relative z-10 flex h-full flex-col justify-center">
          <p className="text-xs md:text-sm uppercase tracking-[4px] md:tracking-[6px] text-white/80">
            House of Phones
          </p>
          <h1 className="mt-2 md:mt-3 font-serif text-3xl sm:text-4xl md:text-6xl text-white">
            Shop All
          </h1>
          <p className="mt-2 md:mt-4 max-w-2xl text-sm md:text-lg text-white/90">
            {query ? `Showing results for "${searchParams.get("q")}".` : "Explore every device, every accessory. Curated for the discerning buyer."}
          </p>
        </div>
      </section>

      <section className="container-hop py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Filters - Sticky */}
          <div className="hidden lg:block lg:w-[280px] lg:flex-shrink-0">
            <div className="sticky top-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2"><SlidersHorizontal size={14} /> Filters</p>
                  <div className="space-y-6">
                    {/* Accessory Types Filter - Vertical Layout */}
                    <div>
                      <p className="font-medium mb-3 text-sm">Accessory Types</p>
                      <div className="space-y-2">
                        {updatedAccessoryTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => handleCategoryClick(t)}
                            className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <p className="font-medium mb-3 text-sm">Brand</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {brands.map((b) => (
                          <label key={b.slug} htmlFor={`brand-${b.slug}`} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input id={`brand-${b.slug}`} type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
                            <span>{b.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <p className="font-medium mb-3 text-sm">Price Range</p>
                      <input
                        type="range"
                        min={0}
                        max={200000}
                        step={5000}
                        value={price[1]}
                        onChange={(e) => setPrice([0, Number(e.target.value)])}
                        className="w-full accent-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Up to ₹{price[1].toLocaleString("en-IN")}</p>
                    </div>

                    {/* RAM Filter */}
                    <div>
                      <p className="font-medium mb-3 text-sm">RAM</p>
                      {["4GB", "6GB", "8GB", "12GB", "16GB"].map((r) => (
                        <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                          <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                        </label>
                      ))}
                    </div>

                    {/* Storage Filter */}
                    <div>
                      <p className="font-medium mb-3 text-sm">Storage</p>
                      {["64GB", "128GB", "256GB", "512GB", "1TB"].map((r) => (
                        <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                          <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-sm text-muted-foreground">Showing <span className="text-foreground font-medium">{totalProducts}</span> products</p>
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:border-primary/30 hover:bg-accent transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs sm:text-sm bg-card border border-border rounded-full px-3 py-2 md:px-4">
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <div className="hidden sm:flex gap-1 border border-border rounded-full p-1">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`min-w-[32px] min-h-[32px] p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors ${
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Grid3x3 size={14} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`min-w-[32px] min-h-[32px] p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors ${
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-4 md:gap-5 ${
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {productList.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              
              {accessoryList.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalProducts === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Sidebar */}
      {mobileFiltersOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[85vw] max-w-[300px] bg-background z-50 overflow-y-auto p-6 shadow-xl lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </p>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              {/* Accessory Types */}
              <div>
                <p className="font-medium mb-3 text-sm">Accessory Types</p>
                <div className="space-y-2">
                  {updatedAccessoryTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        handleCategoryClick(t);
                        setMobileFiltersOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <p className="font-medium mb-3 text-sm">Brand</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {brands.map((b) => (
                    <label key={b.slug} htmlFor={`brand-${b.slug}-mob`} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input id={`brand-${b.slug}-mob`} type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="font-medium mb-3 text-sm">Price Range</p>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={5000}
                  value={price[1]}
                  onChange={(e) => setPrice([0, Number(e.target.value)])}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">Up to ₹{price[1].toLocaleString("en-IN")}</p>
              </div>

              {/* RAM Filter */}
              <div>
                <p className="font-medium mb-3 text-sm">RAM</p>
                {["4GB", "6GB", "8GB", "12GB", "16GB"].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                    <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                  </label>
                ))}
              </div>

              {/* Storage Filter */}
              <div>
                <p className="font-medium mb-3 text-sm">Storage</p>
                {["64GB", "128GB", "256GB", "512GB", "1TB"].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer mb-1.5">
                    <input type="checkbox" className="accent-primary" /> <span>{r}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}