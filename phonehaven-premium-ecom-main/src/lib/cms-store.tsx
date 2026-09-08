import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { brands as initialBrands, categories as initialCategories } from "./mock-data";

const API_BASE_URL = "http://localhost:5000/api";

export interface BrandItem {
  id?: string;
  name: string;
  slug: string;
  tagline?: string;
  logo?: string;
  description?: string;
  status?: string;
}

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: any;
  icon?: any;
  categoryFilter?: string;
  status?: string;
  sortOrder?: number;
}

export interface OfferItem {
  id: string | number;
  apiId?: string;
  title: string;
  description: string;
  discountType?: string;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  applicableTo?: string;
  badge?: string;
  details?: string;
  category?: string;
  icon?: any;
  color?: string;
  bgColor?: string;
}

export interface CouponItem {
  id?: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  expiryDate?: string;
  status?: string;
}

export interface BannerItem {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: any;
  buttonText?: string;
  cta?: string;
  link?: string;
  sortOrder?: number;
  status?: string;
}

export interface BlogPostItem {
  id?: string;
  t: string;
  d: string;
  i: string;
  e: string;
  title?: string;
  slug?: string;
  content?: string;
  status?: string;
}

export interface FaqItem {
  id?: string;
  q: string;
  a: string;
  question?: string;
  answer?: string;
  category?: string;
  sortOrder?: number;
  status?: string;
}

export interface StoreItem {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  closingHours?: string;
  mapLink?: string;
  status?: string;
}

// Module level synced caches
let currentBrands: BrandItem[] = [...initialBrands];
let currentCategories: CategoryItem[] = [...initialCategories];
let currentOffers: OfferItem[] = [];
let currentCoupons: CouponItem[] = [];
let currentBanners: BannerItem[] = [];
let currentBlogs: BlogPostItem[] = [];
let currentFaqs: FaqItem[] = [];
let currentStores: StoreItem[] = [];

export function getSyncedBrands(): BrandItem[] {
  return currentBrands;
}

export function getSyncedCategories(): CategoryItem[] {
  return currentCategories;
}

export function getSyncedOffers(): OfferItem[] {
  return currentOffers;
}

export function getSyncedCoupons(): CouponItem[] {
  return currentCoupons;
}

export function getSyncedBanners(): BannerItem[] {
  return currentBanners;
}

export function getSyncedBlogs(): BlogPostItem[] {
  return currentBlogs;
}

export function getSyncedFaqs(): FaqItem[] {
  return currentFaqs;
}

export function getSyncedStores(): StoreItem[] {
  return currentStores;
}

type CmsContextType = {
  brands: BrandItem[];
  categories: CategoryItem[];
  offers: OfferItem[];
  coupons: CouponItem[];
  banners: BannerItem[];
  blogs: BlogPostItem[];
  faqs: FaqItem[];
  stores: StoreItem[];
  loading: boolean;
  refreshCms: () => Promise<void>;
};

const CmsContext = createContext<CmsContextType | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<BrandItem[]>(currentBrands);
  const [categories, setCategories] = useState<CategoryItem[]>(currentCategories);
  const [offers, setOffers] = useState<OfferItem[]>(currentOffers);
  const [coupons, setCoupons] = useState<CouponItem[]>(currentCoupons);
  const [banners, setBanners] = useState<BannerItem[]>(currentBanners);
  const [blogs, setBlogs] = useState<BlogPostItem[]>(currentBlogs);
  const [faqs, setFaqs] = useState<FaqItem[]>(currentFaqs);
  const [stores, setStores] = useState<StoreItem[]>(currentStores);
  const [loading, setLoading] = useState(false);

  const fetchCmsData = useCallback(async () => {
    setLoading(true);

    // 1. BRANDS SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/brands`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.brands)) {
          const activeBrands: any[] = data.brands.filter((b: any) => b.status === "Active" || !b.status);
          const synced: BrandItem[] = [];
          const seen = new Set<string>();

          activeBrands.forEach((apiB: any) => {
            const name = apiB.name || "Brand";
            const slug = apiB.slug || name.toLowerCase().replace(/\s+/g, "-");
            const key = slug.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            const matchedBaseline = initialBrands.find(
              (b) => b.slug.toLowerCase() === key || b.name.toLowerCase() === name.toLowerCase()
            );

            synced.push({
              id: apiB.id,
              name: name,
              slug: matchedBaseline ? matchedBaseline.slug : slug,
              tagline: apiB.tagline || matchedBaseline?.tagline || "",
              description: apiB.description || "",
              logo: apiB.logo || "",
              status: apiB.status || "Active",
            });
          });

          // Always include baseline brands (e.g. Honor, Nokia) that aren't in the API response
          initialBrands.forEach((baseB) => {
            const key = baseB.slug.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              synced.push({ ...baseB, status: "Active" });
            }
          });

          if (synced.length > 0) {
            currentBrands = synced;
            setBrands(synced);
          }
        }
      }
    } catch (e) {
      console.warn("Brands sync notice:", e);
    }

    // 2. CATEGORIES SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          const activeCats: any[] = data.categories.filter((c: any) => c.status === "Active" || !c.status);
          const synced: CategoryItem[] = [];
          const seen = new Set<string>();

          activeCats.forEach((apiC: any) => {
            const name = apiC.name || "Category";
            const slug = apiC.slug || name.toLowerCase().replace(/\s+/g, "-");
            const key = slug.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            const matchedBaseline = initialCategories.find(
              (c) => c.slug.toLowerCase() === key || c.name.toLowerCase() === name.toLowerCase()
            );

            synced.push({
              id: apiC.id,
              name: name,
              slug: matchedBaseline ? matchedBaseline.slug : slug,
              description: apiC.description || "",
              icon: matchedBaseline?.icon || apiC.icon || "Tag",
              status: apiC.status || "Active",
              sortOrder: apiC.sortOrder || 0,
            });
          });

          if (synced.length > 0) {
            currentCategories = synced;
            setCategories(synced);
          }
        }
      }
    } catch (e) {
      console.warn("Categories sync notice:", e);
    }

    // 3. OFFERS SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/offers`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.offers)) {
          const activeOffers: any[] = data.offers.filter((o: any) => o.status === "Active" || !o.status);
          const synced: OfferItem[] = activeOffers.map((o: any) => ({
            id: o.id,
            apiId: o.id,
            title: o.title,
            description: o.description || "",
            discountType: o.discountType,
            discountValue: Number(o.discountValue || 0),
            minOrderValue: o.minOrderValue ? Number(o.minOrderValue) : undefined,
            maxDiscount: o.maxDiscount ? Number(o.maxDiscount) : undefined,
            startDate: o.startDate,
            endDate: o.endDate,
            status: o.status || "Active",
            applicableTo: o.applicableTo || "all",
            badge: o.discountValue
              ? `${o.discountValue}${o.discountType === "Percentage" || o.discountType === "percentage" ? "%" : " Off"}`
              : "Special Offer",
            details: o.description || "Limited time offer",
            category: (o.applicableTo || "all").toLowerCase(),
          }));

          currentOffers = synced;
          setOffers(synced);
        }
      }
    } catch (e) {
      console.warn("Offers sync notice:", e);
    }

    // 4. COUPONS SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          const activeCoupons: any[] = data.coupons.filter((c: any) => c.status === "Active" || !c.status);
          const synced: CouponItem[] = activeCoupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            discountType: c.discountType || "percentage",
            discountValue: Number(c.discountValue || 0),
            minOrder: c.minOrder ? Number(c.minOrder) : undefined,
            maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
            usageLimit: c.usageLimit ? Number(c.usageLimit) : undefined,
            usedCount: Number(c.usedCount || 0),
            expiryDate: c.expiryDate,
            status: c.status || "Active",
          }));

          currentCoupons = synced;
          setCoupons(synced);
        }
      }
    } catch (e) {
      console.warn("Coupons sync notice:", e);
    }

    // 5. BANNERS SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/banners`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.banners)) {
          const activeBanners: any[] = data.banners.filter((b: any) => b.status === "Active" || !b.status);
          const synced: BannerItem[] = activeBanners.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.description || "",
            description: b.description || "",
            image: b.image || null,
            buttonText: b.buttonText || "Shop Now",
            cta: b.buttonText || "Shop Now",
            link: b.link || "/shop",
            sortOrder: b.sortOrder || 0,
            status: b.status || "Active",
          }));

          currentBanners = synced;
          setBanners(synced);
        }
      }
    } catch (e) {
      console.warn("Banners sync notice:", e);
    }

    // 6. BLOG SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/blog`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.posts)) {
          const publishedPosts: any[] = data.posts.filter((p: any) => p.status === "Published" || p.status === "Active" || !p.status);
          const synced: BlogPostItem[] = publishedPosts.map((p: any) => ({
            id: p.id,
            t: p.title,
            title: p.title,
            slug: p.slug,
            d: p.publishDate ? new Date(p.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            publishDate: p.publishDate,
            i: p.featuredImage || "1511707171634-5f897ff02aa9",
            e: p.content ? p.content.substring(0, 100) + "..." : "Read our latest article.",
            content: p.content,
            status: p.status || "Published",
          }));

          currentBlogs = synced;
          setBlogs(synced);
        }
      }
    } catch (e) {
      console.warn("Blog sync notice:", e);
    }

    // 7. FAQS SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/faqs`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.faqs)) {
          const activeFaqs: any[] = data.faqs.filter((f: any) => f.status === "Active" || !f.status);
          const synced: FaqItem[] = activeFaqs.map((f: any) => ({
            id: f.id,
            q: f.question,
            a: f.answer,
            question: f.question,
            answer: f.answer,
            category: f.category,
            sortOrder: f.sortOrder || 0,
            status: f.status || "Active",
          }));

          currentFaqs = synced;
          setFaqs(synced);
        }
      }
    } catch (e) {
      console.warn("FAQs sync notice:", e);
    }

    // 8. STORES SYNC
    try {
      const res = await fetch(`${API_BASE_URL}/stores`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.stores)) {
          const activeStores: any[] = data.stores.filter((s: any) => s.status === "Active" || !s.status);
          const synced: StoreItem[] = activeStores.map((s: any) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            city: s.city,
            state: s.state,
            pincode: s.pincode,
            phone: s.phone,
            email: s.email,
            openingHours: s.openingHours,
            closingHours: s.closingHours,
            mapLink: s.mapLink,
            status: s.status || "Active",
          }));

          currentStores = synced;
          setStores(synced);
        }
      }
    } catch (e) {
      console.warn("Stores sync notice:", e);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  return (
    <CmsContext.Provider
      value={{
        brands,
        categories,
        offers,
        coupons,
        banners,
        blogs,
        faqs,
        stores,
        loading,
        refreshCms: fetchCmsData,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    return {
      brands: currentBrands,
      categories: currentCategories,
      offers: currentOffers,
      coupons: currentCoupons,
      banners: currentBanners,
      blogs: currentBlogs,
      faqs: currentFaqs,
      stores: currentStores,
      loading: false,
      refreshCms: async () => {},
    };
  }
  return context;
}
