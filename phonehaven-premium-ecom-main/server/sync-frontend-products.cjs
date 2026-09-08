/**
 * Synchronize all frontend Shop & Accessories products into PostgreSQL database.
 * Preserves all existing database products and does not create duplicates.
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
  { name: "Anker", slug: "anker", tagline: "Charge Fast, Live More" },
  { name: "JBL", slug: "jbl", tagline: "Dare to Listen" },
  { name: "Spigen", slug: "spigen", tagline: "Something You Want" },
  { name: "Pitaka", slug: "pitaka", tagline: "Alternative Tech Life" },
  { name: "Noise", slug: "noise", tagline: "Listen to the Noise Within" },
  { name: "Sleek", slug: "sleek", tagline: "Premium Lifestyle" },
  { name: "Premium", slug: "premium", tagline: "Crafted for Excellence" },
  { name: "House of Phones", slug: "house-of-phones", tagline: "Pune's Premium Destination" },
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

// 18 Smartphones (Shop)
const phoneNames = [
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
    console.log("🔄 Starting Product Synchronization...");

    // 1. Sync Brands
    console.log("\n📦 Syncing Brands...");
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
    console.log("\n📁 Syncing Categories...");
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

    // 4. Sync Shop Phones (p1 to p18)
    console.log("\n📱 Checking Shop Phones...");
    for (let i = 0; i < phoneNames.length; i++) {
      const [name, brandName, price, mrp] = phoneNames[i];
      const id = `p${i + 1}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      if (existingNames.has(name.toLowerCase().trim()) || existingSlugs.has(slug) || existingIds.has(id.toLowerCase())) {
        console.log(`   ⏭  Exists: ${name}`);
        continue;
      }

      const brandId = brandMap.get(brandName.toLowerCase()) || null;
      const categoryId = categoryMap.get("smartphones") || null;
      const photoUrl = img(P[i % P.length], i);

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
          stock: i % 9 === 5 ? 0 : 15,
          image: photoUrl,
          images: [photoUrl, img(P[(i + 1) % P.length], i + 100), img(P[(i + 2) % P.length], i + 200)],
          colors: ["Titanium Black", "Natural", "Desert", "White"],
          storage: ["128GB", "256GB", "512GB"],
          ram: "8GB",
          type: "Shop",
          status: "Active",
          featured: i < 6,
          badge: i === 0 ? "New" : i === 4 ? "Best Seller" : i === 7 ? "Hot Deal" : null,
          rating: Math.round((4.3 + (i % 7) * 0.1) * 10) / 10,
          reviewCount: 120 + i * 37,
          highlights: [
            "5G Ready · Dual SIM",
            "Pro-grade camera system",
            "All-day battery with fast charging",
            "1 Year manufacturer warranty",
          ],
          tags: i < 4 ? ["new-arrival"] : i < 9 ? ["best-seller"] : ["trending"],
          description: `${name} — Premium device with top-tier performance, sleek build quality and 1-year brand warranty.`,
        },
      });

      existingSlugs.add(slug);
      existingNames.add(name.toLowerCase().trim());
      existingIds.add(id.toLowerCase());
      createdCount++;
      console.log(`   ✅ Added Phone: ${name}`);
    }

    // 5. Sync Catalog Accessories (acc-1 to acc-29)
    console.log("\n🎧 Checking Catalog Accessories...");
    for (let i = 0; i < catalogAccessoriesData.length; i++) {
      const a = catalogAccessoriesData[i];
      const id = a.id;
      const slug = a.slug;

      if (existingNames.has(a.name.toLowerCase().trim()) || existingSlugs.has(slug) || existingIds.has(id.toLowerCase())) {
        console.log(`   ⏭  Exists: ${a.name}`);
        continue;
      }

      const brandId = brandMap.get(a.brand.toLowerCase()) || null;
      const categoryId = categoryMap.get(a.category.toLowerCase()) || categoryMap.get("accessories") || null;

      await prisma.product.create({
        data: {
          id,
          name: a.name,
          slug,
          brandId,
          categoryId,
          price: Number(a.price),
          mrp: Number(a.mrp),
          sku: `HOP-ACC-${i + 1}`,
          stock: a.stock,
          image: "",
          images: [],
          type: "Accessories",
          status: "Active",
          featured: false,
          rating: a.rating,
          reviewCount: a.reviews,
          highlights: [
            `Genuine ${a.brand} build`,
            "1 Year warranty & easy returns",
          ],
          tags: ["accessory"],
          description: `${a.name} — Premium quality mobile accessory designed for durability and optimal performance.`,
        },
      });

      existingSlugs.add(slug);
      existingNames.add(a.name.toLowerCase().trim());
      existingIds.add(id.toLowerCase());
      createdCount++;
      console.log(`   ✅ Added Accessory: ${a.name}`);
    }


    const totalNow = await prisma.product.count();
    console.log("\n========================================");
    console.log(`🎉 Product Sync Completed!`);
    console.log(`   New products added: ${createdCount}`);
    console.log(`   Total products in DB: ${totalNow}`);
    console.log("========================================");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

syncAllProducts();
