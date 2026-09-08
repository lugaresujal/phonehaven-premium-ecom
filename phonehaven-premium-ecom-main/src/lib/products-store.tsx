import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  products as initialProducts,
  type Product,
} from "./mock-data";
import {
  catalogAccessories as initialCatalogAccessories,
  coverProducts as initialCoverProducts,
} from "./accessories-catalog";

const API_BASE_URL = "http://localhost:5000/api";

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

let baselineProductMapCache: Map<string, Product> | null = null;

function getBaselineProductMap(): Map<string, Product> {
  if (!baselineProductMapCache) {
    const baselineAll: Product[] = [
      ...(initialProducts || []),
      ...(initialCatalogAccessories || []),
    ];
    baselineProductMapCache = new Map<string, Product>();
    baselineAll.forEach((p) => {
      if (p.id) baselineProductMapCache!.set(p.id.toLowerCase(), p);
      if (p.slug) baselineProductMapCache!.set(p.slug.toLowerCase(), p);
      if (p.name) baselineProductMapCache!.set(p.name.toLowerCase().trim(), p);
    });
  }
  return baselineProductMapCache;
}

function findBaselineProduct(apiP: any): Product | undefined {
  const map = getBaselineProductMap();
  if (apiP.id && map.has(String(apiP.id).toLowerCase())) {
    return map.get(String(apiP.id).toLowerCase());
  }
  if (apiP.sku && map.has(String(apiP.sku).toLowerCase())) {
    return map.get(String(apiP.sku).toLowerCase());
  }
  if (apiP.slug && map.has(String(apiP.slug).toLowerCase())) {
    return map.get(String(apiP.slug).toLowerCase());
  }
  if (apiP.name && map.has(String(apiP.name).toLowerCase().trim())) {
    return map.get(String(apiP.name).toLowerCase().trim());
  }
  return undefined;
}

// Memory cache for runtime synced state
let currentSyncedProducts: Product[] | null = null;
let currentSyncedAccessories: Product[] | null = null;
let currentSyncedCatalogAccessories: Product[] | null = null;
let currentSyncedCoverProducts: Product[] | null = null;
let currentSyncedAllProducts: Product[] | null = null;

export function getSyncedProducts(): Product[] {
  if (!currentSyncedProducts) currentSyncedProducts = [];
  return currentSyncedProducts;
}
export function getSyncedAccessories(): Product[] {
  if (!currentSyncedAccessories) currentSyncedAccessories = [...(initialCatalogAccessories || [])];
  return currentSyncedAccessories;
}
export function getSyncedCatalogAccessories(): Product[] {
  if (!currentSyncedCatalogAccessories) currentSyncedCatalogAccessories = [...(initialCatalogAccessories || [])];
  return currentSyncedCatalogAccessories;
}
export function getSyncedCoverProducts(): Product[] {
  if (!currentSyncedCoverProducts) currentSyncedCoverProducts = [...(initialCoverProducts || [])];
  return currentSyncedCoverProducts;
}
export function getSyncedAllProducts(): Product[] {
  if (!currentSyncedAllProducts) {
    currentSyncedAllProducts = [
      ...(initialProducts || []),
      ...(initialCatalogAccessories || []),
    ];
  }
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

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(getSyncedProducts);
  const [accessories, setAccessories] = useState<Product[]>(getSyncedAccessories);
  const [catalogAccessories, setCatalogAccessories] = useState<Product[]>(getSyncedCatalogAccessories);
  const [coverProducts, setCoverProducts] = useState<Product[]>(getSyncedCoverProducts);
  const [allProducts, setAllProducts] = useState<Product[]>(getSyncedAllProducts);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products from backend");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const rawProducts: any[] = data.products;

        // Filter active products, excluding dummy placeholder IDs (a1-a12, cover-1-6)
        const isDummyProduct = (p: any) => {
          const id = String(p.id || "").toLowerCase();
          if (/^a\d+$/.test(id)) return true;
          if (/^cover-\d+$/.test(id)) return true;
          return false;
        };

        const activeApiProducts = rawProducts.filter(
          (p) => (p.status === "Active" || !p.status) && !isDummyProduct(p)
        );

        const newAllProducts: Product[] = [];
        const seenIds = new Set<string>();

        activeApiProducts.forEach((apiP) => {
          const matchedBaseline = findBaselineProduct(apiP);
          const productId = String(apiP.id || apiP.sku || apiP.slug || `p-${Date.now()}`);

          if (seenIds.has(productId.toLowerCase())) return; // Prevent duplicates
          seenIds.add(productId.toLowerCase());
          if (matchedBaseline?.id) seenIds.add(matchedBaseline.id.toLowerCase());
          if (matchedBaseline?.slug) seenIds.add(matchedBaseline.slug.toLowerCase());

          const categoryName = typeof apiP.category === "object" ? apiP.category?.name : (apiP.category || matchedBaseline?.category || "smartphones");
          const brandName = typeof apiP.brand === "object" ? apiP.brand?.name : (apiP.brand || matchedBaseline?.brand || "House of Phones");

          const isUnsplashDummy = typeof apiP.image === "string" && apiP.image.includes("images.unsplash.com");
          const image = (matchedBaseline?.image && (isUnsplashDummy || !apiP.image))
            ? matchedBaseline.image
            : (apiP.image || matchedBaseline?.image || "");
          const images = (Array.isArray(apiP.images) && apiP.images.length > 0 && !isUnsplashDummy)
            ? apiP.images
            : (matchedBaseline?.images || [image]);

          const syncedProduct: Product = {
            id: matchedBaseline ? matchedBaseline.id : productId,
            slug: apiP.slug || (matchedBaseline ? matchedBaseline.slug : productId),
            name: apiP.name || matchedBaseline?.name || "Product",
            brand: brandName,
            category: categoryName,
            price: Number(apiP.price ?? matchedBaseline?.price ?? 0),
            mrp: Number(apiP.mrp ?? matchedBaseline?.mrp ?? apiP.price ?? 0),
            image,
            images,
            description: apiP.description ?? matchedBaseline?.description,
            stock: Number(apiP.stock ?? matchedBaseline?.stock ?? 0),
            colors: (apiP.colors && apiP.colors.length > 0) ? apiP.colors : matchedBaseline?.colors,
            storage: (apiP.storage && apiP.storage.length > 0) ? apiP.storage : matchedBaseline?.storage,
            ram: apiP.ram || matchedBaseline?.ram,
            rating: Number(apiP.rating ?? matchedBaseline?.rating ?? 4.5),
            reviews: Number(apiP.reviewCount ?? apiP.reviews ?? matchedBaseline?.reviews ?? 10),
            badge: apiP.badge ?? matchedBaseline?.badge,
            type: apiP.type || matchedBaseline?.type || categoryName,
            tags: (apiP.tags && apiP.tags.length > 0) ? apiP.tags : matchedBaseline?.tags,
            highlights: (apiP.highlights && apiP.highlights.length > 0) ? apiP.highlights : matchedBaseline?.highlights,
          };

          newAllProducts.push(syncedProduct);
        });

        const baselineList: Product[] = [
          ...(initialCatalogAccessories || []),
        ];

        baselineList.forEach((bp) => {
          if (bp.id && !seenIds.has(bp.id.toLowerCase())) {
            seenIds.add(bp.id.toLowerCase());
            if (bp.slug) seenIds.add(bp.slug.toLowerCase());
            newAllProducts.push(bp);
          }
        });

        // Split into category arrays while avoiding duplicates
        const syncedPhones: Product[] = [];
        const syncedAcc: Product[] = [];
        const syncedCatAcc: Product[] = [];
        const syncedCovers: Product[] = [];

        newAllProducts.forEach((p) => {
          const cat = (p.category || "").toLowerCase();
          const type = (p.type || "").toLowerCase();

          if (cat === "smartphones" || type === "smartphones") {
            syncedPhones.push(p);
          } else if (cat === "premium covers" || type === "premium covers" || type.includes("cover")) {
            syncedCovers.push(p);
            syncedCatAcc.push(p);
          } else if (cat === "accessories" || type === "accessories") {
            syncedAcc.push(p);
            syncedCatAcc.push(p);
          } else {
            syncedCatAcc.push(p);
          }
        });

        // Update module level caches
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
      console.warn("Product sync failed, using baseline data:", err);
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
    // Fallback if rendered outside provider
    return {
      products: getSyncedProducts(),
      accessories: getSyncedAccessories(),
      catalogAccessories: getSyncedCatalogAccessories(),
      coverProducts: getSyncedCoverProducts(),
      allProducts: getSyncedAllProducts(),
      loading: false,
      refreshProducts: async () => {},
      findProduct: syncFindProduct,
      findProductById: syncFindProductById,
    };
  }
  return context;
}
