import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { type Product } from "./mock-data";

const API_BASE_URL = "/api";

type ProductsContextType = {
  products: Product[];
  accessories: Product[];
  catalogAccessories: Product[];
  coverProducts: Product[];
  allProducts: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  findProduct: (slugOrId: string) => Product | undefined;
  findProductById: (id: string) => Product | undefined;
};

const ProductsContext = createContext<ProductsContextType | null>(null);

// Module-level caches — initially empty; populated from API
let currentSyncedProducts: Product[] = [];
let currentSyncedAccessories: Product[] = [];
let currentSyncedCatalogAccessories: Product[] = [];
let currentSyncedCoverProducts: Product[] = [];
let currentSyncedAllProducts: Product[] = [];

export function getSyncedProducts(): Product[] {
  return currentSyncedProducts;
}
export function getSyncedAccessories(): Product[] {
  return currentSyncedAccessories;
}
export function getSyncedCatalogAccessories(): Product[] {
  return currentSyncedCatalogAccessories;
}
export function getSyncedCoverProducts(): Product[] {
  return currentSyncedCoverProducts;
}
export function getSyncedAllProducts(): Product[] {
  return currentSyncedAllProducts;
}

export function syncFindProduct(slugOrId: string): Product | undefined {
  if (!slugOrId) return undefined;
  const raw = String(slugOrId).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim();
  } catch {
    /* fallback to raw */
  }
  const target = raw.toLowerCase();
  const targetDecoded = decoded.toLowerCase();
  const all = getSyncedAllProducts();

  // 1. Direct slug or id match
  const directMatch = all.find(
    (p) =>
      (p.slug && (p.slug.toLowerCase() === target || p.slug.toLowerCase() === targetDecoded)) ||
      (p.id && (p.id.toLowerCase() === target || p.id.toLowerCase() === targetDecoded)) ||
      (p.name && (p.name.toLowerCase().trim() === target || p.name.toLowerCase().trim() === targetDecoded))
  );
  if (directMatch) return directMatch;

  // 2. Normalized alias match (e.g. "iphone-16-pro-max" vs "iphone-16-pro-max-256gb")
  const normTarget = target.replace(/[^a-z0-9]/g, "");
  const aliasMatch = all.find((p) => {
    const pSlugNorm = (p.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const pNameNorm = (p.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      (pSlugNorm && (pSlugNorm.includes(normTarget) || normTarget.includes(pSlugNorm))) ||
      (pNameNorm && (pNameNorm.includes(normTarget) || normTarget.includes(pNameNorm)))
    );
  });

  return aliasMatch;
}

export function syncFindProductById(id: string): Product | undefined {
  if (!id) return undefined;
  return syncFindProduct(id);
}

const PRODUCT_NAME_CORRECTIONS: Record<string, string> = {
  "one plus nord 3r earbuds": "OnePlus Nord 3R Earbuds",
};

// Convert a raw API product (Prisma) into the frontend Product type
function mapApiProductToProduct(apiP: any): Product {
  const categoryName = typeof apiP.category === "object" ? apiP.category?.name : (apiP.category || "smartphones");
  const brandName = typeof apiP.brand === "object" ? apiP.brand?.name : (apiP.brand || "House of Phones");
  const image = apiP.image || "";
  const images = (Array.isArray(apiP.images) && apiP.images.length > 0) ? apiP.images : (image ? [image] : []);

  const rawName = apiP.name || "Product";
  const correctedName = PRODUCT_NAME_CORRECTIONS[rawName.toLowerCase()] || rawName;

  return {
    id: apiP.id,
    dbId: String(apiP.id),
    slug: apiP.slug || apiP.id,
    name: correctedName,
    brand: brandName,
    category: categoryName,
    price: Number(apiP.price ?? 0),
    mrp: Number(apiP.mrp ?? apiP.price ?? 0),
    image,
    images,
    description: apiP.description ?? undefined,
    shortDescription: apiP.shortDescription ?? undefined,
    stock: Number(apiP.stock ?? 0),
    colors: apiP.colors || [],
    colorVariants: Array.isArray(apiP.colorVariants)
      ? apiP.colorVariants.map((cv: any) => ({
          id: cv.id,
          productId: cv.productId,
          colorName: cv.colorName,
          colorCode: cv.colorCode || null,
          images: cv.images || [],
          stock: Number(cv.stock || 0),
          sortOrder: cv.sortOrder ?? 0,
        }))
      : undefined,
    variants: Array.isArray(apiP.variants) ? apiP.variants : [],
    storage: apiP.storage || [],
    ram: apiP.ram || undefined,
    rating: Number(apiP.rating ?? 4.5),
    reviews: Number(apiP.reviewCount ?? apiP.reviews ?? 10),
    badge: apiP.badge ?? undefined,
    type: apiP.type || categoryName,
    tags: apiP.tags || [],
    highlights: apiP.highlights || [],
  };
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [catalogAccessories, setCatalogAccessories] = useState<Product[]>([]);
  const [coverProducts, setCoverProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products from backend");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const rawProducts: any[] = data.products;

        // Only include active products from the database
        const activeApiProducts = rawProducts.filter(
          (p) => p.status === "Active" || !p.status
        );

        const newAllProducts: Product[] = [];
        const seenIds = new Set<string>();

        activeApiProducts.forEach((apiP: any) => {
          const productId = String(apiP.id || apiP.sku || apiP.slug);
          if (seenIds.has(productId.toLowerCase())) return;
          seenIds.add(productId.toLowerCase());
          newAllProducts.push(mapApiProductToProduct(apiP));
        });

        // Split into category arrays based on product type from database
        const syncedPhones: Product[] = [];
        const syncedAcc: Product[] = [];
        const syncedCatAcc: Product[] = [];
        const syncedCovers: Product[] = [];

        newAllProducts.forEach((p) => {
          const type = (p.type || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();

          if (type === "shop" || cat === "smartphones") {
            syncedPhones.push(p);
          } else if (
            type === "accessories" ||
            cat === "accessories" ||
            cat.includes("cover") ||
            cat.includes("guard") ||
            cat.includes("bank") ||
            cat.includes("charger") ||
            cat.includes("earbud") ||
            cat.includes("watch") ||
            cat.includes("bag") ||
            cat.includes("keyboard") ||
            cat.includes("audio")
          ) {
            syncedAcc.push(p);
            syncedCatAcc.push(p);
            if (cat.includes("cover")) {
              syncedCovers.push(p);
            }
          } else {
            syncedCatAcc.push(p);
          }
        });

        // Update module-level caches
        currentSyncedAllProducts = newAllProducts;
        currentSyncedProducts = syncedPhones;
        currentSyncedAccessories = syncedAcc;
        currentSyncedCatalogAccessories = syncedCatAcc;
        currentSyncedCoverProducts = syncedCovers;

        setAllProducts(currentSyncedAllProducts);
        setProducts(currentSyncedProducts);
        setAccessories(currentSyncedAccessories);
        setCatalogAccessories(currentSyncedCatalogAccessories);
        setCoverProducts(currentSyncedCoverProducts);
      }
    } catch (err) {
      console.warn("Product sync failed, clearing product lists:", err);
      // On API failure, show empty lists (no dummy fallback products)
      currentSyncedAllProducts = [];
      currentSyncedProducts = [];
      currentSyncedAccessories = [];
      currentSyncedCatalogAccessories = [];
      currentSyncedCoverProducts = [];

      setAllProducts([]);
      setProducts([]);
      setAccessories([]);
      setCatalogAccessories([]);
      setCoverProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const findProduct = useCallback((slugOrId: string) => {
    return syncFindProduct(slugOrId);
  }, []);

  const findProductById = useCallback((id: string) => {
    return syncFindProductById(id);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        accessories,
        catalogAccessories,
        coverProducts,
        allProducts,
        loading,
        refreshProducts: fetchProducts,
        findProduct,
        findProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    // Fallback if rendered outside provider — empty, no dummy products
    return {
      products: [],
      accessories: [],
      catalogAccessories: [],
      coverProducts: [],
      allProducts: [],
      loading: false,
      refreshProducts: async () => {},
      findProduct: syncFindProduct,
      findProductById: syncFindProductById,
    };
  }
  return context;
}
