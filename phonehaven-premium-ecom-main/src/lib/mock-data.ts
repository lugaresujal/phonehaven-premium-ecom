export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  /** Selling price — GST inclusive. */
  price: number;
  mrp: number;
  image: string;
  images?: string[];
  colors?: string[];
  storage?: string[];
  ram?: string;
  rating: number;
  reviews: number;
  tags?: string[];
  highlights?: string[];
  badge?: string;
  /** Accessory sub-type used by the shop filters. */
  type?: string;
  /** Units available. 0 === out of stock. */
  stock: number;
  /** Legacy alias for mrp used by some page-local datasets. */
  originalPrice?: number;
  description?: string;
  specs?: string;
  specifications?: Record<string, string>;
};

import { catalogAccessories, coverProducts } from "./accessories-catalog";


const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=80&sig=${seed}`;

// Use curated Unsplash photo IDs for phones/accessories
const P = [
  "1592286927505-1def25115558", // iphone
  "1511707171634-5f897ff02aa9", // phone hand
  "1580910051074-3eb694886505", // phone table
  "1616348436168-de43ad0db179", // samsung
  "1598327105666-5b89351aff97", // phone
  "1567581935884-3349723552ca", // pixel
  "1585060544812-6b45742d762f", // earbuds
  "1606813907291-d86efa9b94db", // watch
  "1585386959984-a4155224a1ad", // charger
  "1512499617640-c74ae3a79d37", // case
  "1585123334904-845d60e97b29", // speaker
  "1546027658-7aa750153465",     // powerbank
  "1600298881974-0bed040f5fe3", // iphone box
  "1591713283497-0e35f537afa7", // watch wrist
  "1586953208448-b95a79798f07", // airpods
  "1583394838336-acd977736f90", // headphones
  "1616400619175-5beda3a17896", // galaxy
  "1629131726695-1cfa1b164a39", // android phone
];

export const brands = [
  { name: "Apple", slug: "apple", tagline: "Think Different" },
  { name: "Samsung", slug: "samsung", tagline: "Do What You Can't" },
  { name: "OnePlus", slug: "oneplus", tagline: "Never Settle" },
  { name: "Oppo", slug: "oppo", tagline: "Inspiration Ahead" },
  { name: "Vivo", slug: "vivo", tagline: "Camera & Music" },
  { name: "Google", slug: "google", tagline: "Pixel Perfect" },
  { name: "Nothing", slug: "nothing", tagline: "Pure Design" },
  { name: "Xiaomi", slug: "xiaomi", tagline: "Innovation for Everyone" },
  { name: "Motorola", slug: "motorola", tagline: "Hello Moto" },
  { name: "Realme", slug: "realme", tagline: "Dare to Leap" },
  { name: "Honor", slug: "honor", tagline: "Go Beyond" },
  { name: "Nokia", slug: "nokia", tagline: "Built Tough" },
];

export const categories = [
  { name: "Smartphones", slug: "smartphones", icon: "Smartphone" },
  { name: "Tablets", slug: "tablets", icon: "Tablet" },
  { name: "Laptops", slug: "laptops", icon: "Laptop" },
  { name: "Smartwatches", slug: "smartwatches", icon: "Watch" },
  { name: "Audio", slug: "audio", icon: "Headphones" },
  { name: "Accessories", slug: "accessories", icon: "Cable" },
];

export const accessoryTypes = [
  "Premium Covers", "MagSafe Covers", "Leather Covers", "Silicone Covers",
  "Transparent Covers", "Designer Covers", "Screen Guards", "Privacy Glass",
  "Tempered Glass", "Camera Lens Protector", "Chargers", "Wireless Chargers",
  "Fast Chargers", "Power Banks", "USB Cables", "Car Chargers",
  "Wireless Earbuds", "Bluetooth Speakers", "Smart Watches", "Phone Holders",
];

const phoneNames: [string, string, number, number][] = [
  ["iPhone 16 Pro Max 256GB", "Apple", 144900, 159900],
  ["iPhone 16 Pro 128GB", "Apple", 119900, 129900],
  ["iPhone 16 128GB", "Apple", 79900, 89900],
  ["iPhone 15 128GB", "Apple", 69900, 79900],
  ["Samsung Galaxy S24 Ultra 5G 256GB", "Samsung", 129999, 139999],
  ["Samsung Galaxy S24 5G", "Samsung", 74999, 84999],
  ["Samsung Galaxy Z Fold 6", "Samsung", 164999, 184999],
  ["OnePlus 12 5G 256GB", "OnePlus", 64999, 69999],
  ["OnePlus 12R 5G", "OnePlus", 42999, 45999],
  ["Google Pixel 9 Pro 128GB", "Google", 106999, 119999],
  ["Google Pixel 9", "Google", 79999, 89999],
  ["Nothing Phone (2a)", "Nothing", 25999, 27999],
  ["Nothing Phone (2)", "Nothing", 44999, 49999],
  ["Oppo Reno 12 Pro 5G", "Oppo", 36999, 39999],
  ["Vivo X100 Pro 5G", "Vivo", 89999, 99999],
  ["Xiaomi 14 Ultra", "Xiaomi", 99999, 109999],
  ["Motorola Edge 50 Ultra", "Motorola", 59999, 64999],
  ["Realme GT 6", "Realme", 39999, 42999],
];

export const products: Product[] = phoneNames.map(([name, brand, price, mrp], i) => ({
  id: `p${i + 1}`,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  brand,
  category: "smartphones",
  price,
  mrp,
  image: img(P[i % P.length], i),
  images: [img(P[i % P.length], i), img(P[(i + 1) % P.length], i + 100), img(P[(i + 2) % P.length], i + 200)],
  colors: ["Titanium Black", "Natural", "Desert", "White"],
  storage: ["128GB", "256GB", "512GB"],
  ram: "8GB",
  rating: Math.round((4.3 + (i % 7) * 0.1) * 10) / 10,
  reviews: 120 + i * 37,
  tags: i < 4 ? ["new-arrival"] : i < 9 ? ["best-seller"] : ["trending"],
  highlights: [
    "5G Ready · Dual SIM",
    "Pro-grade triple camera system",
    "All-day battery with fast charging",
    "1 Year manufacturer warranty",
  ],
  badge: i === 0 ? "New" : i === 4 ? "Best Seller" : i === 7 ? "Hot Deal" : undefined,
  // Deterministic stock so out-of-stock states are demonstrable and stable.
  stock: i % 9 === 5 ? 0 : i % 7 === 3 ? 2 : 12,
}));

export const accessories: Product[] = catalogAccessories;
export { coverProducts };

import { syncFindProduct, syncFindProductById } from "./products-store";

export const allProducts: Product[] = [...products, ...catalogAccessories];

/** Resolves a product by slug or by id, so /product/:slug works with either. */
export const findProduct = (slugOrId: string) =>
  syncFindProduct(slugOrId) ?? allProducts.find((p) => p.slug === slugOrId) ?? allProducts.find((p) => p.id === slugOrId);

export const findProductById = (id: string) =>
  syncFindProductById(id) ?? allProducts.find((p) => p.id === id) ?? allProducts.find((p) => p.slug === id);



export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

/** GST rate applied to electronics in India. */
export const GST_RATE = 0.18;

/**
 * Prices in the catalogue are GST-inclusive, so GST is *extracted*, never added.
 * Returns the tax component contained inside a gross amount.
 */
export const gstIncludedIn = (grossAmount: number) =>
  Math.round(grossAmount - grossAmount / (1 + GST_RATE));

export const FREE_SHIPPING_THRESHOLD = 499;
export const STANDARD_SHIPPING_FEE = 99;
export const EXPRESS_SHIPPING_FEE = 149;
