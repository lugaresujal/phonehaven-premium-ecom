/**
 * Seed Script — Syncs existing frontend hardcoded data into the database.
 * Uses Prisma Client so cuid IDs and relations are generated properly.
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

// ============================================================
// FRONTEND DATA — Blog Posts (from blog.tsx defaultPosts)
// ============================================================
const blogPosts = [
  {
    title: "iPhone 16 Pro Review: The Titanium Refinement",
    slug: "iphone-16-pro-review-titanium-refinement",
    content:
      "Six weeks in with Apple's latest — and it just keeps getting better. The iPhone 16 Pro refines everything we loved about its predecessor while introducing meaningful upgrades to camera, display, and performance. The titanium design feels premium without adding weight, and the A18 Pro chip handles everything we throw at it with ease.",
    featuredImage: "1511707171634-5f897ff02aa9",
    author: "House of Phones Team",
    status: "Published",
    publishDate: new Date("2026-06-22T00:00:00.000Z"),
  },
  {
    title: "Best Cases for Galaxy S24 Ultra",
    slug: "best-cases-galaxy-s24-ultra",
    content:
      "From MagSafe leather to military-grade — our top picks tested. The Samsung Galaxy S24 Ultra deserves protection that matches its premium build. We tested over 15 cases to find the ones that offer the best balance of style, protection, and functionality.",
    featuredImage: "1585123334904-845d60e97b29",
    author: "House of Phones Team",
    status: "Published",
    publishDate: new Date("2026-06-15T00:00:00.000Z"),
  },
  {
    title: "Buying a Phone on GST: A Corporate Guide",
    slug: "buying-phone-gst-corporate-guide",
    content:
      "Everything CFOs need to know before scaling device procurement. Understanding GST implications on corporate phone purchases can save your business significant amounts. This guide covers input tax credit, invoice requirements, and best practices for bulk procurement.",
    featuredImage: "1546027658-7aa750153465",
    author: "House of Phones Team",
    status: "Published",
    publishDate: new Date("2026-05-30T00:00:00.000Z"),
  },
  {
    title: "OnePlus 12R vs Pixel 9: Which one wins?",
    slug: "oneplus-12r-vs-pixel-9-comparison",
    content:
      "A head-to-head at ₹40k — camera, battery and everyday feel. Both phones offer incredible value in the premium segment, but they cater to different priorities. We compare camera quality, battery life, software experience, and build quality to help you decide.",
    featuredImage: "1592286927505-1def25115558",
    author: "House of Phones Team",
    status: "Published",
    publishDate: new Date("2026-05-12T00:00:00.000Z"),
  },
  {
    title: "Why We Recommend Tempered Glass on Day One",
    slug: "why-tempered-glass-day-one",
    content:
      "The maths of avoiding a screen replacement. A ₹300 tempered glass can save you ₹15,000+ in screen replacement costs. We break down the numbers and explain why we recommend installing screen protection before you even leave the store.",
    featuredImage: "1580910051074-3eb694886505",
    author: "House of Phones Team",
    status: "Published",
    publishDate: new Date("2026-04-28T00:00:00.000Z"),
  },
  {
    title: "5G in Pune: Which Bands, Which Phones",
    slug: "5g-pune-bands-phones-guide",
    content:
      "The definitive local guide to 5G connectivity in Pune. We cover which 5G bands are active in Pune, which phones support them, and what speeds you can realistically expect in different parts of the city.",
    featuredImage: "1616348436168-de43ad0db179",
    author: "House of Phones Team",
    status: "Published",
    publishDate: new Date("2026-04-12T00:00:00.000Z"),
  },
];

// ============================================================
// FRONTEND DATA — FAQs (from faqs.tsx defaultFaqs)
// ============================================================
const faqs = [
  {
    question: "Do you sell 100% original products?",
    answer:
      "Yes. Every device and accessory we sell is sourced directly from authorized distributors and brand-authorized channels.",
    category: "General",
    sortOrder: 1,
    status: "Active",
  },
  {
    question: "What is your return policy?",
    answer:
      "You have 7 days from delivery for a full refund on unopened, unused products in original condition.",
    category: "Returns",
    sortOrder: 2,
    status: "Active",
  },
  {
    question: "Do you offer EMI?",
    answer:
      "Yes, we support No-Cost EMI on all major credit and debit cards, along with cardless EMI options.",
    category: "Payments",
    sortOrder: 3,
    status: "Active",
  },
  {
    question: "Is exchange available on all phones?",
    answer:
      "Exchange is available on most smartphones. Add your device on the exchange page to see instant value.",
    category: "Exchange",
    sortOrder: 4,
    status: "Active",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery in 2-4 business days across India. Same-day dispatch for orders before 2 PM in Pune.",
    category: "Delivery",
    sortOrder: 5,
    status: "Active",
  },
  {
    question: "Do you provide GST invoices?",
    answer:
      "Absolutely. We provide GST-compliant B2B invoices for corporate purchases.",
    category: "Corporate",
    sortOrder: 6,
    status: "Active",
  },
];

// ============================================================
// FRONTEND DATA — Stores (from store-locator.tsx hardcoded store)
// ============================================================
const stores = [
  {
    name: "Flagship — Bibwewadi, Pune",
    address:
      "Shop No. 8 & 9, Saraswati Mini Market, Near Bibwewadi Police Station",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411037",
    phone: "+91 98765 43210",
    email: "store@houseofphones.in",
    openingHours: "10:30 AM",
    closingHours: "9:00 PM",
    mapLink: "https://www.google.com/maps?q=Bibwewadi+Pune&output=embed",
    status: "Active",
  },
];

// ============================================================
// FRONTEND DATA — Banners (homepage promotional banners)
// ============================================================
const banners = [
  {
    title: "iPhone 16 Pro Max",
    description: "Titanium. So robust. So light. So Pro. Camera Control. 4K 120 fps Dolby Vision.",
    image: "/banner-iphone16promax.png",
    buttonText: "Shop Now",
    link: "/product/iphone-16-pro-max",
    sortOrder: 1,
    status: "Active",
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    description: "The Ultimate AI Experience. Galaxy AI. S Pen. 200MP camera.",
    image: "/banner-samsungs24.png",
    buttonText: "Shop Now",
    link: "/product/galaxy-s24-ultra",
    sortOrder: 2,
    status: "Active",
  },
  {
    title: "OnePlus 12",
    description: "Flagship Killer Evolved. Snapdragon 8 Gen 3. Hasselblad camera. 100W charging.",
    image: "/banner-oneplus12.png",
    buttonText: "Shop Now",
    link: "/product/oneplus-12",
    sortOrder: 3,
    status: "Active",
  },
];

// ============================================================
// FRONTEND DATA — Coupons (available promotional coupons)
// ============================================================
const coupons = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 5000,
    maxDiscount: 2000,
    usageLimit: 100,
    perUserLimit: 1,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    expiryDate: new Date("2026-12-31T23:59:59.000Z"),
    status: "Active",
  },
  {
    code: "FLAT500",
    discountType: "fixed",
    discountValue: 500,
    minOrder: 10000,
    maxDiscount: 500,
    usageLimit: 50,
    perUserLimit: 1,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    expiryDate: new Date("2026-12-31T23:59:59.000Z"),
    status: "Active",
  },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seed() {
  let seeded = { blog: 0, faqs: 0, stores: 0, banners: 0, coupons: 0, staff: 0, logs: 0, reviews: 0 };

  try {
    console.log("🚀 Starting CMS data seed with Prisma...\n");

    // --- 1. Blog Posts ---
    console.log("📝 Seeding Blog posts...");
    for (const post of blogPosts) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
      if (existing) {
        console.log(`   ⏭  Skipped (exists): "${post.title}"`);
        continue;
      }
      await prisma.blogPost.create({ data: post });
      console.log(`   ✅ Inserted: "${post.title}"`);
      seeded.blog++;
    }

    // --- 2. FAQs ---
    console.log("\n❓ Seeding FAQs...");
    for (const faq of faqs) {
      const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
      if (existing) {
        console.log(`   ⏭  Skipped (exists): "${faq.question}"`);
        continue;
      }
      await prisma.fAQ.create({ data: faq });
      console.log(`   ✅ Inserted: "${faq.question}"`);
      seeded.faqs++;
    }

    // --- 3. Stores ---
    console.log("\n🏪 Seeding Stores...");
    for (const store of stores) {
      const existing = await prisma.store.findFirst({ where: { name: store.name } });
      if (existing) {
        console.log(`   ⏭  Skipped (exists): "${store.name}"`);
        continue;
      }
      await prisma.store.create({ data: store });
      console.log(`   ✅ Inserted: "${store.name}"`);
      seeded.stores++;
    }

    // --- 4. Banners ---
    console.log("\n🖼️  Seeding Banners...");
    for (const banner of banners) {
      const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
      if (existing) {
        if (!existing.image && banner.image) {
          await prisma.banner.update({ where: { id: existing.id }, data: { image: banner.image } });
          console.log(`   ✅ Updated image: "${banner.title}"`);
        } else {
          console.log(`   ⏭  Skipped (exists): "${banner.title}"`);
        }
        continue;
      }
      await prisma.banner.create({ data: banner });
      console.log(`   ✅ Inserted: "${banner.title}"`);
      seeded.banners++;
    }

    // --- 5. Coupons ---
    console.log("\n🎫 Seeding Coupons...");
    for (const coupon of coupons) {
      const existing = await prisma.coupon.findUnique({ where: { code: coupon.code } });
      if (existing) {
        console.log(`   ⏭  Skipped (exists): "${coupon.code}"`);
        continue;
      }
      await prisma.coupon.create({ data: coupon });
      console.log(`   ✅ Inserted: "${coupon.code}"`);
      seeded.coupons++;
    }

    // --- 6. Staff ---
    console.log("\n👥 Checking Staff...");
    const existingStaff = await prisma.staff.findFirst({ where: { email: "admin@houseofphones.in" } });
    if (!existingStaff) {
      const crypto = require("crypto");
      const hashedPassword = crypto.createHash("sha256").update("admin123").digest("hex");
      await prisma.staff.create({
        data: {
          name: "Sujal K",
          email: "admin@houseofphones.in",
          phone: "+91 96376 71118",
          role: "Super Admin",
          password: hashedPassword,
          status: "Active",
        },
      });
      console.log(`   ✅ Created Admin staff: "admin@houseofphones.in"`);
      seeded.staff++;
    } else {
      console.log(`   ⏭  Admin staff already exists`);
    }

    // --- 7. Activity Logs ---
    console.log("\n📋 Checking Activity Logs...");
    const logCount = await prisma.activityLog.count();
    if (logCount === 0) {
      await prisma.activityLog.create({
        data: {
          staffName: "System",
          action: "Initialize",
          module: "System",
          description: "CMS data synchronization initialized successfully.",
        },
      });
      console.log(`   ✅ Created initial Activity Log`);
      seeded.logs++;
    }

    // --- 8. Reviews ---
    console.log("\n⭐ Checking Reviews...");
    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      const products = await prisma.product.findMany({ take: 3 });
      if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
          await prisma.review.create({
            data: {
              productId: products[i].id,
              customerName: ["Rahul Sharma", "Priya Patel", "Amit Deshmukh"][i] || "Verified Buyer",
              rating: 5,
              title: "Outstanding experience & genuine product",
              body: `Purchased the ${products[i].name} from House of Phones. Super fast delivery and 100% genuine sealed box. Highly recommended!`,
              status: "Approved",
              featured: true,
            },
          });
          seeded.reviews++;
        }
        console.log(`   ✅ Seeded ${seeded.reviews} product reviews`);
      }
    }

    // --- Summary ---
    console.log("\n========================================");
    console.log("📊 SEED SUMMARY");
    console.log("========================================");
    console.log(`   Blog posts:    ${seeded.blog} inserted`);
    console.log(`   FAQs:          ${seeded.faqs} inserted`);
    console.log(`   Stores:        ${seeded.stores} inserted`);
    console.log(`   Banners:       ${seeded.banners} inserted`);
    console.log(`   Coupons:       ${seeded.coupons} inserted`);
    console.log(`   Staff:         ${seeded.staff} inserted`);
    console.log(`   Activity Logs: ${seeded.logs} inserted`);
    console.log(`   Reviews:       ${seeded.reviews} inserted`);
    console.log("========================================");
    console.log("✅ Seed completed successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed();

