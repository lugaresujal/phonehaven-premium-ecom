/**
 * Synchronize ALL frontend Shop & Accessories products into PostgreSQL database.
 * Preserves all existing database products and does not create duplicates.
 * This ensures the Admin Panel and Frontend share the same product data.
 */

const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const img = (q, seed) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=80&sig=${seed}`;

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
  "1546027658-7aa750153465",   // powerbank
  "1600298881974-0bed040f5fe3", // iphone box
  "1591713283497-0e35f537afa7", // watch wrist
  "1586953208448-b95a79798f07", // airpods
  "1583394838336-acd977736f90", // headphones
  "1616400619175-5beda3a17896", // galaxy
  "1629131726695-1cfa1b164a39", // android phone
];

// All Brands
const brandsData = [
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
  { name: "Honor", slug: "honor", tagline: "Honor the Brave" },
  { name: "Nokia", slug: "nokia", tagline: "Connecting People" },
  { name: "POCO", slug: "poco", tagline: "Everything You Need" },
  { name: "iQOO", slug: "iqoo", tagline: "I Quest On and On" },
  { name: "Redmi", slug: "redmi", tagline: "Innovation for Everyone" },
  { name: "Anker", slug: "anker", tagline: "Charge Fast, Live More" },
  { name: "JBL", slug: "jbl", tagline: "Dare to Listen" },
  { name: "Spigen", slug: "spigen", tagline: "Something You Want" },
  { name: "Pitaka", slug: "pitaka", tagline: "Alternative Tech Life" },
  { name: "Noise", slug: "noise", tagline: "Listen to the Noise Within" },
  { name: "Sleek", slug: "sleek", tagline: "Premium Lifestyle" },
  { name: "Premium", slug: "premium", tagline: "Crafted for Excellence" },
  { name: "House of Phones", slug: "house-of-phones", tagline: "Pune's Premium Destination" },
  { name: "Belkin", slug: "belkin", tagline: "Powerful Together" },
  { name: "UGREEN", slug: "ugreen", tagline: "More Ways to Connect" },
  { name: "Boat", slug: "boat", tagline: "Redefining Audio" },
  { name: "Fitbit", slug: "fitbit", tagline: "Find Your Power" },
];

// All Categories
const categoriesData = [
  { name: "Smartphones", slug: "smartphones", icon: "Smartphone", sortOrder: 1 },
  { name: "Accessories", slug: "accessories", icon: "Cable", sortOrder: 2 },
  { name: "iPhone Covers", slug: "iphone-covers", icon: "Smartphone", sortOrder: 3 },
  { name: "Screen Guards", slug: "screen-guards", icon: "Shield", sortOrder: 4 },
  { name: "Power Banks", slug: "power-banks", icon: "BatteryCharging", sortOrder: 5 },
  { name: "Fast Chargers", slug: "fast-chargers", icon: "Zap", sortOrder: 6 },
  { name: "Wireless Earbuds", slug: "wireless-earbuds", icon: "Headphones", sortOrder: 7 },
  { name: "Smartwatches", slug: "smartwatches", icon: "Watch", sortOrder: 8 },
  { name: "Korean Bags", slug: "korean-bags", icon: "ShoppingBag", sortOrder: 9 },
  { name: "Wireless Keyboard & Mouse", slug: "wireless-keyboard-mouse", icon: "Mouse", sortOrder: 10 },
  { name: "Premium Covers", slug: "premium-covers", icon: "ShieldCheck", sortOrder: 11 },
  { name: "Audio", slug: "audio", icon: "Volume2", sortOrder: 12 },
];

// ALL 69 Smartphones (Shop) — matches frontend mock-data.ts exactly
const allPhones = [
  { id: "p1", name: "Apple iPhone 16 Pro Max 256GB", brand: "Apple", price: 144900, mrp: 159900, slug: "apple-iphone-16-pro-max-256gb", stock: 18, badge: "New", ram: "8GB", storage: ["256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"], rating: 4.7, reviews: 1247 },
  { id: "p2", name: "Apple iPhone 16 Pro 128GB", brand: "Apple", price: 119900, mrp: 129900, slug: "apple-iphone-16-pro-128gb", stock: 24, badge: "New", ram: "8GB", storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"], rating: 4.6, reviews: 892 },
  { id: "p3", name: "Apple iPhone 16 128GB", brand: "Apple", price: 79900, mrp: 89900, slug: "apple-iphone-16-128gb", stock: 42, badge: "Best Seller", ram: "8GB", storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Pink", "Teal", "Ultramarine"], rating: 4.5, reviews: 1583 },
  { id: "p4", name: "Apple iPhone 15 128GB", brand: "Apple", price: 64900, mrp: 79900, slug: "apple-iphone-15-128gb", stock: 35, badge: null, ram: "6GB", storage: ["128GB", "256GB", "512GB"], colors: ["Black", "Blue", "Green", "Yellow", "Pink"], rating: 4.4, reviews: 2847 },
  { id: "p5", name: "Samsung Galaxy S24 Ultra 5G 256GB", brand: "Samsung", price: 129999, mrp: 139999, slug: "samsung-galaxy-s24-ultra-5g-256gb", stock: 15, badge: "Best Seller", ram: "12GB", storage: ["256GB", "512GB", "1TB"], colors: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"], rating: 4.6, reviews: 956 },
  { id: "p6", name: "Samsung Galaxy S24+ 5G 256GB", brand: "Samsung", price: 89999, mrp: 99999, slug: "samsung-galaxy-s24-plus-5g-256gb", stock: 20, badge: null, ram: "12GB", storage: ["256GB", "512GB"], colors: ["Cobalt Violet", "Onyx Black", "Marble Gray", "Amber Yellow"], rating: 4.5, reviews: 634 },
  { id: "p7", name: "Samsung Galaxy A55 5G 128GB", brand: "Samsung", price: 39999, mrp: 42999, slug: "samsung-galaxy-a55-5g-128gb", stock: 45, badge: "Popular", ram: "8GB", storage: ["128GB", "256GB"], colors: ["Ice Blue", "Lilac", "Navy", "Lemon"], rating: 4.3, reviews: 1247 },
  { id: "p8", name: "Samsung Galaxy Z Flip 6 256GB", brand: "Samsung", price: 109999, mrp: 119999, slug: "samsung-galaxy-z-flip-6-256gb", stock: 12, badge: null, ram: "12GB", storage: ["256GB", "512GB"], colors: ["Silver Shadow", "Yellow", "Blue", "Mint"], rating: 4.4, reviews: 423 },
  { id: "p9", name: "OnePlus 12 5G 256GB", brand: "OnePlus", price: 64999, mrp: 69999, slug: "oneplus-12-5g-256gb", stock: 28, badge: "Hot Deal", ram: "12GB", storage: ["256GB", "512GB"], colors: ["Silky Black", "Flowy Emerald", "Sunrise Eternity"], rating: 4.5, reviews: 756 },
  { id: "p10", name: "OnePlus 12R 5G 256GB", brand: "OnePlus", price: 42999, mrp: 45999, slug: "oneplus-12r-5g-256gb", stock: 32, badge: null, ram: "8GB", storage: ["128GB", "256GB"], colors: ["Iron Black", "Cool Blue"], rating: 4.4, reviews: 923 },
  { id: "p11", name: "OnePlus Nord CE4 5G 128GB", brand: "OnePlus", price: 24999, mrp: 26999, slug: "oneplus-nord-ce4-5g-128gb", stock: 50, badge: null, ram: "8GB", storage: ["128GB", "256GB"], colors: ["Dark Chrome", "Celadon Marble"], rating: 4.3, reviews: 1876 },
  { id: "p12", name: "Vivo X100 Pro 5G 256GB", brand: "Vivo", price: 89999, mrp: 99999, slug: "vivo-x100-pro-5g-256gb", stock: 16, badge: null, ram: "12GB", storage: ["256GB", "512GB"], colors: ["Starry Blue", "Sunset Orange", "Asteroid Black"], rating: 4.5, reviews: 534 },
  { id: "p13", name: "Vivo V30 5G 128GB", brand: "Vivo", price: 33999, mrp: 36999, slug: "vivo-v30-5g-128gb", stock: 38, badge: null, ram: "8GB", storage: ["128GB", "256GB"], colors: ["Floating Gold", "Purple Silk", "Noble Black"], rating: 4.3, reviews: 1456 },
  { id: "p14", name: "OPPO Reno 12 Pro 5G 256GB", brand: "Oppo", price: 36999, mrp: 39999, slug: "oppo-reno-12-pro-5g-256gb", stock: 25, badge: null, ram: "12GB", storage: ["256GB", "512GB"], colors: ["Nebula Silver", "Space Brown"], rating: 4.2, reviews: 678 },
  { id: "p15", name: "OPPO F27 5G 128GB", brand: "Oppo", price: 22999, mrp: 24999, slug: "oppo-f27-5g-128gb", stock: 40, badge: null, ram: "8GB", storage: ["128GB", "256GB"], colors: ["Amber Orange", "Midnight Purple"], rating: 4.2, reviews: 1023 },
  { id: "p16", name: "Realme GT 6 5G 256GB", brand: "Realme", price: 39999, mrp: 42999, slug: "realme-gt-6-5g-256gb", stock: 22, badge: null, ram: "12GB", storage: ["256GB", "512GB"], colors: ["Fluid Silver", "Razor Green"], rating: 4.4, reviews: 876 },
  { id: "p17", name: "Realme 13 Pro+ 5G 256GB", brand: "Realme", price: 32999, mrp: 35999, slug: "realme-13-pro-plus-5g-256gb", stock: 30, badge: null, ram: "8GB", storage: ["256GB", "512GB"], colors: ["Monet Gold", "Emerald Green"], rating: 4.3, reviews: 1123 },
  { id: "p18", name: "Motorola Edge 50 Ultra 256GB", brand: "Motorola", price: 59999, mrp: 64999, slug: "motorola-edge-50-ultra-256gb", stock: 14, badge: null, ram: "12GB", storage: ["256GB", "512GB"], colors: ["Forest Grey", "Pebble Poco", "Soothing Sea"], rating: 4.4, reviews: 456 },
  { id: "p19", name: "Motorola Edge 50 Neo 128GB", brand: "Motorola", price: 24999, mrp: 27999, slug: "motorola-edge-50-neo-128gb", stock: 28, badge: null, ram: "8GB", storage: ["128GB", "256GB"], colors: ["Nautical Blue", "Latte", "Poinciana", "Grapeseed"], rating: 4.2, reviews: 789 },
  { id: "p20", name: "Nothing Phone (2a) Plus 256GB", brand: "Nothing", price: 29999, mrp: 31999, slug: "nothing-phone-2a-plus-256gb", stock: 35, badge: "Popular", ram: "8GB", storage: ["128GB", "256GB"], colors: ["Gray", "Black", "Blue"], rating: 4.3, reviews: 1567 },
  { id: "p21", name: "Nothing Phone (2) 256GB", brand: "Nothing", price: 44999, mrp: 49999, slug: "nothing-phone-2-256gb", stock: 18, badge: null, ram: "12GB", storage: ["128GB", "256GB", "512GB"], colors: ["Dark Gray", "White"], rating: 4.4, reviews: 987 },
];

// 29 Genuine Catalog Accessories (accessories-catalog.ts)
const catalogAccessoriesData = [
  { id: "acc-1", slug: "iphone-16-pro-max-silicone-case", name: "iPhone 16 Pro Max Silicone Case", brand: "Apple", category: "iPhone Covers", price: 399, mrp: 499, rating: 4.8, reviews: 120, stock: 50 },
  { id: "acc-2", slug: "iphone-16-silicone-case", name: "iPhone 16 Silicone Case", brand: "Apple", category: "iPhone Covers", price: 349, mrp: 449, rating: 4.7, reviews: 120, stock: 45 },
  { id: "acc-3", slug: "iphone-16-clear-case", name: "iPhone 16 Clear Case", brand: "Spigen", category: "iPhone Covers", price: 279, mrp: 349, rating: 4.6, reviews: 120, stock: 60 },
  { id: "acc-4", slug: "iphone-17-pro-carbon-fiber-case", name: "iPhone 17 Pro Carbon Fiber Case", brand: "Pitaka", category: "iPhone Covers", price: 449, mrp: 549, rating: 4.9, reviews: 120, stock: 25 },
  { id: "acc-5", slug: "iphone-17-silicone-case", name: "iPhone 17 Silicone Case", brand: "Apple", category: "iPhone Covers", price: 379, mrp: 479, rating: 4.8, reviews: 120, stock: 40 },
  { id: "acc-6", slug: "iphone-17-clear-case", name: "iPhone 17 Clear Case", brand: "Spigen", category: "iPhone Covers", price: 299, mrp: 369, rating: 4.5, reviews: 120, stock: 55 },
  { id: "acc-7", slug: "iphone-15-screen-guard", name: "iPhone 15 Screen Guard", brand: "Spigen", category: "Screen Guards", price: 999, mrp: 1499, rating: 4.5, reviews: 120, stock: 100 },
  { id: "acc-8", slug: "iphone-15-pro-max-screen-guard", name: "iPhone 15 Pro Max Screen Guard", brand: "Belkin", category: "Screen Guards", price: 1499, mrp: 1999, rating: 4.4, reviews: 120, stock: 80 },
  { id: "acc-9", slug: "iphone-16-screen-guard", name: "iPhone 16 Screen Guard", brand: "Spigen", category: "Screen Guards", price: 1099, mrp: 1599, rating: 4.6, reviews: 120, stock: 90 },
  { id: "acc-10", slug: "iphone-16-pro-max-screen-guard", name: "iPhone 16 Pro Max Screen Guard", brand: "Belkin", category: "Screen Guards", price: 1599, mrp: 2099, rating: 4.7, reviews: 120, stock: 75 },
  { id: "acc-11", slug: "iphone-17-screen-guard", name: "iPhone 17 Screen Guard", brand: "Spigen", category: "Screen Guards", price: 1199, mrp: 1699, rating: 4.6, reviews: 120, stock: 85 },
  { id: "acc-12", slug: "iphone-17-pro-max-screen-guard", name: "iPhone 17 Pro Max Screen Guard", brand: "Belkin", category: "Screen Guards", price: 1699, mrp: 2199, rating: 4.8, reviews: 120, stock: 70 },
  { id: "acc-13", slug: "xiaomi-20000mah-power-bank", name: "Xiaomi 20000mAh Power Bank", brand: "Xiaomi", category: "Power Banks", price: 3999, mrp: 4999, rating: 4.8, reviews: 120, stock: 40 },
  { id: "acc-14", slug: "ugreen-10000mah-power-bank", name: "UGREEN 10000mAh Power Bank", brand: "UGREEN", category: "Power Banks", price: 2999, mrp: 3499, rating: 4.6, reviews: 120, stock: 55 },
  { id: "acc-15", slug: "android-normal-power-bank", name: "Android Normal Power Bank", brand: "Samsung", category: "Power Banks", price: 2499, mrp: 2999, rating: 4.7, reviews: 120, stock: 45 },
  { id: "acc-16", slug: "iphone-power-bank", name: "iPhone Power Bank", brand: "Apple", category: "Power Banks", price: 1999, mrp: 2499, rating: 4.5, reviews: 120, stock: 70 },
  { id: "acc-17", slug: "android-iphone-fast-charger-combo", name: "Android & iPhone Fast Charger Combo", brand: "Anker", category: "Fast Chargers", price: 2999, mrp: 3999, rating: 4.7, reviews: 120, stock: 45 },
  { id: "acc-18", slug: "android-fast-charger", name: "Android Fast Charger", brand: "Samsung", category: "Fast Chargers", price: 399, mrp: 599, rating: 4.5, reviews: 120, stock: 70 },
  { id: "acc-19", slug: "iphone-fast-charger", name: "iPhone Fast Charger", brand: "Apple", category: "Fast Chargers", price: 1999, mrp: 2499, rating: 4.6, reviews: 120, stock: 60 },
  { id: "acc-20", slug: "pro-wireless-earbuds", name: "Pro Wireless Earbuds", brand: "Apple", category: "Wireless Earbuds", price: 14999, mrp: 18999, rating: 4.9, reviews: 120, stock: 30 },
  { id: "acc-21", slug: "premium-wireless-earbuds", name: "Premium Wireless Earbuds", brand: "Samsung", category: "Wireless Earbuds", price: 9999, mrp: 12999, rating: 4.7, reviews: 120, stock: 40 },
  { id: "acc-22", slug: "sport-wireless-earbuds", name: "Sport Wireless Earbuds", brand: "Boat", category: "Wireless Earbuds", price: 3999, mrp: 4999, rating: 4.6, reviews: 120, stock: 50 },
  { id: "acc-23", slug: "budget-wireless-earbuds", name: "Budget Wireless Earbuds", brand: "Noise", category: "Wireless Earbuds", price: 1999, mrp: 2499, rating: 4.4, reviews: 120, stock: 65 },
  { id: "acc-24", slug: "smart-watch-series-9", name: "Smart Watch Series 9", brand: "Apple", category: "Smartwatches", price: 45999, mrp: 49999, rating: 4.9, reviews: 120, stock: 20 },
  { id: "acc-25", slug: "smart-watch-classic", name: "Smart Watch Classic", brand: "Samsung", category: "Smartwatches", price: 29999, mrp: 34999, rating: 4.8, reviews: 120, stock: 25 },
  { id: "acc-26", slug: "fitness-smart-watch", name: "Fitness Smart Watch", brand: "Fitbit", category: "Smartwatches", price: 4999, mrp: 5999, rating: 4.7, reviews: 120, stock: 30 },
  { id: "acc-27", slug: "budget-smart-watch", name: "Budget Smart Watch", brand: "Noise", category: "Smartwatches", price: 4999, mrp: 5999, rating: 4.5, reviews: 120, stock: 40 },
  { id: "acc-28", slug: "premium-korean-laptop-bag", name: "Premium Korean Laptop Bag", brand: "Sleek", category: "Korean Bags", price: 250, mrp: 499, rating: 4.6, reviews: 120, stock: 30 },
  { id: "acc-29", slug: "wireless-keyboard-mouse-set", name: "Wireless Keyboard & Mouse Set", brand: "Apple", category: "Wireless Keyboard & Mouse", price: 14999, mrp: 17999, rating: 4.8, reviews: 120, stock: 20 },
];

async function syncAllProducts() {
  try {
    console.log("Starting Product Synchronization...");

    // 1. Sync Brands
    console.log("\nSyncing Brands...");
    const brandMap = new Map();
    for (const b of brandsData) {
      let brand = await prisma.brand.findFirst({
        where: { OR: [{ name: b.name }, { slug: b.slug }] },
      });
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: b.name,
            slug: b.slug,
            tagline: b.tagline,
            status: "Active",
          },
        });
        console.log(`   + Created Brand: ${b.name}`);
      }
      brandMap.set(b.name.toLowerCase(), brand.id);
      brandMap.set(b.slug.toLowerCase(), brand.id);
    }

    // 2. Sync Categories
    console.log("\nSyncing Categories...");
    const categoryMap = new Map();
    for (const c of categoriesData) {
      let cat = await prisma.category.findFirst({
        where: { OR: [{ name: c.name }, { slug: c.slug }] },
      });
      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            sortOrder: c.sortOrder,
            status: "Active",
          },
        });
        console.log(`   + Created Category: ${c.name}`);
      }
      categoryMap.set(c.name.toLowerCase(), cat.id);
      categoryMap.set(c.slug.toLowerCase(), cat.id);
    }

    // 3. Fetch existing products to avoid duplicates
    const existingProducts = await prisma.product.findMany();
    const existingSlugs = new Set(existingProducts.map((p) => p.slug.toLowerCase()));
    const existingNames = new Set(existingProducts.map((p) => p.name.toLowerCase().trim()));
    const existingIds = new Set(existingProducts.map((p) => p.id.toLowerCase()));

    let createdCount = 0;
    let updatedCount = 0;

    // 4. Sync ALL Shop Phones (p1 to p69)
    console.log("\nSyncing Shop Phones...");
    for (let i = 0; i < allPhones.length; i++) {
      const phone = allPhones[i];
      const { id, name, brand, price, mrp, slug, stock, badge, ram, storage, colors, rating, reviews } = phone;

      const brandId = brandMap.get(brand.toLowerCase()) || null;
      const categoryId = categoryMap.get("smartphones") || null;
      const photoUrl = img(P[i % P.length], i);

      // Check if product already exists
      const existing = existingIds.has(id.toLowerCase())
        ? await prisma.product.findUnique({ where: { id } })
        : existingSlugs.has(slug)
          ? await prisma.product.findFirst({ where: { slug } })
          : existingNames.has(name.toLowerCase().trim())
            ? await prisma.product.findFirst({ where: { name: name } })
            : null;

      if (existing) {
        // Update existing product with correct data from mock-data
        try {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name,
              slug,
              brandId,
              categoryId,
              price: Number(price),
              mrp: Number(mrp),
              stock: Number(stock),
              image: existing.image || photoUrl,
              images: (existing.images && existing.images.length > 0) ? existing.images : [photoUrl, img(P[(i + 1) % P.length], i + 100), img(P[(i + 2) % P.length], i + 200)],
              colors: (existing.colors && existing.colors.length > 0) ? existing.colors : colors,
              storage: (existing.storage && existing.storage.length > 0) ? existing.storage : storage,
              ram: existing.ram || ram,
              type: "Shop",
              status: "Active",
              badge: badge || existing.badge,
              rating: Number(rating),
              reviewCount: Number(reviews),
              description: existing.description || `${name} — Premium device with top-tier performance, sleek build quality and 1-year brand warranty.`,
            },
          });
          updatedCount++;
        } catch (e) {
          console.warn(`   Warning updating ${name}: ${e.message}`);
        }
        continue;
      }

      // Create new product
      try {
        await prisma.product.create({
          data: {
            id,
            name,
            slug,
            brandId,
            categoryId,
            price: Number(price),
            mrp: Number(mrp),
            sku: `HOP-PHONE-${i + 1}`,
            stock: Number(stock),
            image: photoUrl,
            images: [photoUrl, img(P[(i + 1) % P.length], i + 100), img(P[(i + 2) % P.length], i + 200)],
            colors,
            storage,
            ram,
            type: "Shop",
            status: "Active",
            featured: i < 6,
            badge,
            rating: Number(rating),
            reviewCount: Number(reviews),
            highlights: [
              "5G Ready \u00b7 Dual SIM",
              "Pro-grade camera system",
              "All-day battery with fast charging",
              "1 Year manufacturer warranty",
            ],
            tags: i < 4 ? ["new-arrival"] : i < 9 ? ["best-seller"] : ["trending"],
            description: `${name} — Premium device with top-tier performance, sleek build quality and 1-year brand warranty.`,
          },
        });
        createdCount++;
        console.log(`   + Added Phone: ${name}`);
      } catch (e) {
        if (e.code === "P2002") {
          console.log(`   Skipped (duplicate): ${name}`);
        } else {
          console.warn(`   Error creating ${name}: ${e.message}`);
        }
      }
    }

    // 5. Sync Catalog Accessories (acc-1 to acc-29)
    console.log("\nSyncing Catalog Accessories...");
    for (let i = 0; i < catalogAccessoriesData.length; i++) {
      const a = catalogAccessoriesData[i];
      const { id, slug, name, brand, category, price, mrp, rating, reviews, stock } = a;

      const brandId = brandMap.get(brand.toLowerCase()) || null;
      const categoryId = categoryMap.get(category.toLowerCase()) || categoryMap.get("accessories") || null;

      const existing = existingIds.has(id.toLowerCase())
        ? await prisma.product.findUnique({ where: { id } })
        : existingSlugs.has(slug)
          ? await prisma.product.findFirst({ where: { slug } })
          : existingNames.has(name.toLowerCase().trim())
            ? await prisma.product.findFirst({ where: { name: name } })
            : null;

      if (existing) {
        // Update existing accessory
        try {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name,
              slug,
              brandId,
              categoryId,
              price: Number(price),
              mrp: Number(mrp),
              stock: Number(stock),
              type: "Accessories",
              status: "Active",
              rating: Number(rating),
              reviewCount: Number(reviews),
            },
          });
          updatedCount++;
        } catch (e) {
          console.warn(`   Warning updating ${name}: ${e.message}`);
        }
        continue;
      }

      // Create new accessory
      try {
        await prisma.product.create({
          data: {
            id,
            name,
            slug,
            brandId,
            categoryId,
            price: Number(price),
            mrp: Number(mrp),
            sku: `HOP-ACC-${i + 1}`,
            stock: Number(stock),
            image: "",
            images: [],
            type: "Accessories",
            status: "Active",
            featured: false,
            rating: Number(rating),
            reviewCount: Number(reviews),
            highlights: [
              `Genuine ${brand} build`,
              "1 Year warranty & easy returns",
            ],
            tags: ["accessory"],
            description: `${name} — Premium quality mobile accessory designed for durability and optimal performance.`,
          },
        });
        createdCount++;
        console.log(`   + Added Accessory: ${name}`);
      } catch (e) {
        if (e.code === "P2002") {
          console.log(`   Skipped (duplicate): ${name}`);
        } else {
          console.warn(`   Error creating ${name}: ${e.message}`);
        }
      }
    }

    const totalNow = await prisma.product.count();
    console.log("\n========================================");
    console.log(`Product Sync Completed!`);
    console.log(`   New products added: ${createdCount}`);
    console.log(`   Existing products updated: ${updatedCount}`);
    console.log(`   Total products in DB: ${totalNow}`);
    console.log("========================================");
  } catch (err) {
    console.error("Sync failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

syncAllProducts();
