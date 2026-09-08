import innerBanner from "@/assets/images/innerbanner.png";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3x3, List, ArrowLeft, Heart, Star, ShoppingBag, Eye, X } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { brands as mockBrands, accessoryTypes } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useCms } from "@/lib/cms-store";
import { toast } from "sonner";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useProtectedAction } from "@/lib/store/protected";

// Placeholder image for products without images
const placeholderImage = "https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Product";

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
  
  // Cart and Wishlist hooks
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const guard = useProtectedAction();

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

  // Handle Add to Cart for covers
  const handleAddToCart = (cover: any) => {
    guard({ type: "none" }, () => {
      const ok = add({ product: cover, qty: 1 });
      if (ok) toast.success(`${cover.name} added to cart`);
    }, "Please create an account or log in first to add products to your cart.");
  };

  // Handle Wishlist toggle for covers
  const handleWishlistToggle = (cover: any) => {
    guard({ type: "wishlist", productId: cover.id }, () => {
      toggle(cover.id);
      toast.success(ids.includes(cover.id) ? "Removed from wishlist" : "Added to wishlist");
    }, "Please create an account or log in first to add products to your wishlist.");
  };

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
        <section className="relative aspect-[21/9] md:h-[280px] md:aspect-auto overflow-hidden">
          <img
            src={innerBanner}
            alt="Shop Banner"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="container-hop relative z-10 flex h-full flex-col justify-center">
            <p className="text-sm uppercase tracking-[6px] text-white/80">
              House of Phones
            </p>
            <h1 className="mt-3 font-serif text-5xl md:text-6xl text-white">
              Premium Covers
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/90">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/30 hover:bg-accent transition-all duration-300 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Shop</span>
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
                              className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors"
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
                            <label key={b.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
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
                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm hover:border-primary/30 transition-colors"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs sm:text-sm bg-card border border-border rounded-full px-4 py-2">
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
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {sortedCovers.map((cover) => {
                  const isInWishlist = ids.includes(cover.id);
                  return (
                    <div 
                      key={cover.id} 
                      className="group h-full cursor-pointer"
                      onClick={() => navigate({ to: `/product/${cover.slug || cover.id}` })}
                    >
                      <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 h-full flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10 shrink-0">
                          <img
                            src={cover.image}
                            alt={cover.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Discount Badge */}
                          {cover.originalPrice && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-lg shadow-red-500/30">
                                -{Math.round(((cover.originalPrice - cover.price) / cover.originalPrice) * 100)}%
                              </span>
                            </div>
                          )}
                          
                          {/* Wishlist Heart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlistToggle(cover);
                            }}
                            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                            aria-label="Add to wishlist"
                          >
                            <Heart 
                              size={18} 
                              className={`transition-colors duration-300 ${
                                isInWishlist 
                                  ? "fill-red-500 text-red-500" 
                                  : "text-gray-400 hover:text-red-500"
                              }`}
                            />
                          </button>
                          
                          {/* Action Buttons Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <button className="bg-white/90 backdrop-blur-md text-foreground px-5 py-2.5 rounded-full text-xs font-medium tracking-widest uppercase shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-white hover:shadow-2xl flex items-center gap-2">
                              <Eye size={14} />
                              Quick View
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 md:p-6 flex flex-col flex-grow">
                          {/* Category Badge */}
                          <div className="inline-flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-medium tracking-wider text-primary/80 uppercase bg-primary/5 px-2.5 py-0.5 rounded-full">
                              {cover.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{cover.rating}</span>
                            </div>
                          </div>

                          <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {cover.name}
                          </h3>
                          
                          {/* Price Section */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                            <div className="flex flex-col">
                              <span className="text-lg md:text-xl font-serif font-bold text-foreground">
                                ₹{cover.price.toLocaleString("en-IN")}
                              </span>
                              {cover.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{cover.originalPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-semibold">{cover.rating}</span>
                            </div>
                          </div>
                          
                          {/* Add to Cart button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(cover);
                            }}
                            className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase hover:shadow-lg hover:shadow-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                          >
                            <ShoppingBag size={14} className="group-hover/btn:scale-110 transition-transform" />
                            Add to Cart
                          </button>
                        </div>

                        {/* Border Glow Effect */}
                        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      </div>
                    </div>
                  );
                })}
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
                        className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors"
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
                      <label key={b.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
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
      <section className="relative aspect-[21/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="Shop Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container-hop relative z-10 flex h-full flex-col justify-center">
          <p className="text-sm uppercase tracking-[6px] text-white/80">
            House of Phones
          </p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl text-white">
            Shop All
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
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
                            className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors"
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
                          <label key={b.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
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
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm hover:border-primary/30 transition-colors"
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

            {/* Products Grid */}
            <div className={`grid gap-4 md:gap-5 ${
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {productList.map((p) => {
                const isInWishlist = ids.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    className="group h-full cursor-pointer"
                    onClick={() => navigate({ to: `/product/${p.slug || p.id}` })}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 h-full flex flex-col">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10 shrink-0">
                        <img
                          src={p.image || placeholderImage}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Discount Badge */}
                        {p.originalPrice && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-lg shadow-red-500/30">
                              -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(p.id);
                          }}
                          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                          aria-label="Add to wishlist"
                        >
                          <Heart 
                            size={18} 
                            className={`transition-colors duration-300 ${
                              isInWishlist 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          />
                        </button>
                        
                        {/* Quick View Action */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <button className="bg-white/90 backdrop-blur-md text-foreground px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-medium tracking-widest uppercase shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-white hover:shadow-2xl flex items-center gap-2">
                            <Eye size={14} />
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 md:p-5 flex flex-col flex-grow">
                        {/* Brand & Category */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] md:text-[10px] font-medium tracking-wider text-primary/80 uppercase bg-primary/5 px-2 py-0.5 rounded-full">
                            {p.brand || "Premium"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] md:text-xs font-medium">{p.rating || 4.5}</span>
                          </div>
                        </div>

                        <h3 className="text-xs md:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                        
                        {/* Specifications */}
                        {p.specs && (
                          <p className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-1">
                            {p.specs}
                          </p>
                        )}
                        
                        {/* Price & Action */}
                        <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border/50">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-serif font-bold text-foreground">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            {p.originalPrice && (
                              <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                                ₹{p.originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              guard({ type: "none" }, () => {
                                add({
                                  product: p,
                                  qty: 1,
                                });
                                toast.success(`${p.name} added to cart`);
                              }, "Please create an account or log in first to add products to your cart.");
                            }}
                            className="px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-[8px] md:text-[10px] font-semibold tracking-widest uppercase hover:shadow-lg hover:shadow-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 flex items-center gap-1 md:gap-1.5 group/btn"
                          >
                            <ShoppingBag size={12} className="group-hover/btn:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Border Glow */}
                      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </div>
                );
              })}
              
              {accessoryList.map((p) => {
                const isInWishlist = ids.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    className="group h-full cursor-pointer"
                    onClick={() => navigate({ to: `/product/${p.slug || p.id}` })}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 h-full flex flex-col">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10 shrink-0">
                        <img
                          src={p.image || placeholderImage}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Discount Badge */}
                        {p.originalPrice && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-lg shadow-red-500/30">
                              -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(p.id);
                          }}
                          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                          aria-label="Add to wishlist"
                        >
                          <Heart 
                            size={18} 
                            className={`transition-colors duration-300 ${
                              isInWishlist 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          />
                        </button>
                        
                        {/* Quick View Action */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <button className="bg-white/90 backdrop-blur-md text-foreground px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-medium tracking-widest uppercase shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-white hover:shadow-2xl flex items-center gap-2">
                            <Eye size={14} />
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 md:p-5 flex flex-col flex-grow">
                        {/* Category */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] md:text-[10px] font-medium tracking-wider text-primary/80 uppercase bg-primary/5 px-2 py-0.5 rounded-full">
                            {p.category || "Accessory"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] md:text-xs font-medium">{p.rating || 4.5}</span>
                          </div>
                        </div>

                        <h3 className="text-xs md:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                        
                        {/* Price & Action */}
                        <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border/50">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-serif font-bold text-foreground">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            {p.originalPrice && (
                              <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                                ₹{p.originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              guard({ type: "none" }, () => {
                                add({
                                  product: p,
                                  qty: 1,
                                });
                                toast.success(`${p.name} added to cart`);
                              }, "Please create an account or log in first to add products to your cart.");
                            }}
                            className="px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-[8px] md:text-[10px] font-semibold tracking-widest uppercase hover:shadow-lg hover:shadow-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 flex items-center gap-1 md:gap-1.5 group/btn"
                          >
                            <ShoppingBag size={12} className="group-hover/btn:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Border Glow */}
                      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </div>
                );
              })}
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
                      className="w-full text-left px-4 py-2 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors"
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
                    <label key={b.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="accent-primary" />
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