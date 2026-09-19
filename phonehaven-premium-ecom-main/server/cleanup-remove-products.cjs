/**
 * SAFE Cleanup Script: Remove newly added mobile products from the database.
 *
 * HOW IT WORKS:
 * 1. Queries ALL products from PostgreSQL
 * 2. Skips accessories entirely (type or category based)
 * 3. Skips original products (p1-p21 IDs, or names matching original mock-data)
 * 4. Matches remaining products against the removal list by name similarity
 * 5. Shows what will be deleted BEFORE deleting (dry-run mode first)
 * 6. Deletes matched products and their color variants
 *
 * USAGE:
 *   node cleanup-remove-products.cjs          → Dry run (shows what would be deleted)
 *   node cleanup-remove-products.cjs --delete  → Actually performs deletion
 */

const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const DRY_RUN = !process.argv.includes("--delete");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// REMOVAL LIST: The 29 products the user wants removed.
// Each entry is { search: string, exactMatch: boolean }
//   search = the substring to search for in product name (case-insensitive)
//   exactMatch = if true, name must EQUAL the search; if false, name can CONTAIN it
// ============================================================================
const REMOVAL_RULES = [
  // 1. Samsung Galaxy A27 5G
  { search: "Samsung Galaxy A27 5G", exactMatch: false },
  // 2. Samsung Galaxy F70 Pro 5G
  { search: "Samsung Galaxy F70 Pro 5G", exactMatch: false },
  // 3. Samsung Galaxy M36 5G
  { search: "Samsung Galaxy M36 5G", exactMatch: false },
  // 4. Samsung Galaxy A56 5G
  { search: "Samsung Galaxy A56 5G", exactMatch: false },
  // 5. Apple iPhone 16 — ONLY match "Apple iPhone 16" followed by storage, NOT Pro/Pro Max/Air
  //    We use a special handler for this (see matchesRemoval below)
  { search: "Apple iPhone 16", exactMatch: false, special: "iphone16-base" },
  // 6. Apple iPhone 16 Plus
  { search: "Apple iPhone 16 Plus", exactMatch: false },
  // 7. OnePlus 13 — NOT 13S, NOT 12/12R
  { search: "OnePlus 13 ", exactMatch: false, special: "oneplus13-only" },
  // 8. OnePlus 13R
  { search: "OnePlus 13R", exactMatch: false },
  // 9. OnePlus 13S
  { search: "OnePlus 13S", exactMatch: false },
  // 10. OnePlus Nord CE 6 Lite
  { search: "OnePlus Nord CE 6 Lite", exactMatch: false },
  // 11. OnePlus N6x
  { search: "OnePlus N6x", exactMatch: false },
  // 12. Vivo T5 Lite 5G
  { search: "Vivo T5 Lite 5G", exactMatch: false },
  // 13. Vivo T5x 5G
  { search: "Vivo T5x 5G", exactMatch: false },
  // 14. Vivo T5 Pro 5G — only "T5 Pro", not just "T5"
  { search: "Vivo T5 Pro 5G", exactMatch: false },
  // 15. Vivo T5e
  { search: "Vivo T5e", exactMatch: false },
  // 16. Vivo V70 — only exact "Vivo V70" (not V70 Elite / V70 FE)
  { search: "Vivo V70", exactMatch: false, special: "vivo-v70-only" },
  // 17. Vivo V70 FE
  { search: "Vivo V70 FE", exactMatch: false },
  // 18. Vivo X200T
  { search: "Vivo X200T", exactMatch: false },
  // 19. OPPO Find X8 — NOT Find X8 Pro (different from X9)
  { search: "OPPO Find X8", exactMatch: false },
  // 20. OPPO Reno 16c
  { search: "OPPO Reno 16c", exactMatch: false },
  // 21. Realme P3 — NOT P3 Power, NOT P4
  { search: "Realme P3", exactMatch: false, special: "realme-p3-only" },
  // 22. Realme Narzo 60x 5G
  { search: "Realme Narzo 60x 5G", exactMatch: false },
  // 23. Motorola Edge 70 Fusion
  { search: "Motorola Edge 70 Fusion", exactMatch: false },
  // 24. Motorola Edge 60 Fusion
  { search: "Motorola Edge 60 Fusion", exactMatch: false },
  // 25. Xiaomi Redmi Note 17 5G (may appear as just "Redmi Note 17 5G")
  { search: "Redmi Note 17 5G", exactMatch: false },
  // 26. POCO M8 Power
  { search: "POCO M8 Power", exactMatch: false },
  // 27. iQOO Z11 — NOT Z11x
  { search: "iQOO Z11", exactMatch: false, special: "iqoo-z11-only" },
  // 28. Google Pixel — any Google Pixel product
  { search: "Google Pixel", exactMatch: false },
  // 29. Nothing newly added (NOT Phone (2) or Phone (2a) Plus which are original)
  { search: "Nothing Phone (3a)", exactMatch: false },
  { search: "Nothing Phone (4a)", exactMatch: false },
  { search: "Nothing Phone (3a) Lite", exactMatch: false },
];

// ============================================================================
// ORIGINAL PRODUCTS: Must NEVER be deleted.
// These are p1-p21 from the original mock-data.ts
// ============================================================================
const ORIGINAL_PRODUCT_IDS = new Set([
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10",
  "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20", "p21",
]);

// Original product names (fuzzy match to protect them)
const ORIGINAL_PRODUCT_NAMES = [
  "iphone 16 pro max",
  "iphone 16 pro",
  "iphone 15",
  "galaxy s24 ultra",
  "galaxy s24+",
  "galaxy a55",
  "galaxy z flip 6",
  "oneplus 12 5g",
  "oneplus 12r",
  "oneplus nord ce4",
  "vivo x100 pro",
  "vivo v30",
  "oppo reno 12 pro",
  "oppo f27",
  "realme gt 6",
  "realme 13 pro+",
  "motorola edge 50 ultra",
  "motorola edge 50 neo",
  "nothing phone (2a) plus",
  "nothing phone (2)",
  "apple iphone 16 128gb",  // p3 — the ORIGINAL iPhone 16 listing
];

/**
 * Special matching logic for tricky product names.
 * Returns true if the product should be DELETED.
 */
function matchesSpecialRule(productName, special) {
  const name = productName.toLowerCase().trim();

  switch (special) {
    case "iphone16-base": {
      // Match "Apple iPhone 16" + storage (e.g. "Apple iPhone 16 128GB")
      // but NOT "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16 Plus"
      if (!name.includes("iphone 16")) return false;
      if (name.includes("pro")) return false;
      if (name.includes("plus")) return false;
      if (name.includes("max")) return false;
      if (name.includes("air")) return false;
      // Must be a standalone "iPhone 16" with storage
      return name.includes("iphone 16") && !name.includes("iphone 16 pro");
    }
    case "oneplus13-only": {
      // Match "OnePlus 13" but NOT "OnePlus 13S", "OnePlus 13R", "OnePlus 12", "OnePlus 12R"
      if (!name.includes("oneplus 13")) return false;
      if (name.includes("oneplus 13s")) return false;
      if (name.includes("oneplus 13r")) return false;
      if (name.includes("oneplus 12")) return false;
      return true;
    }
    case "vivo-v70-only": {
      // Match "Vivo V70" but NOT "Vivo V70 Elite", "Vivo V70 FE", "Vivo V70 Pro"
      if (!name.includes("vivo v70")) return false;
      if (name.includes("elite")) return false;
      if (name.includes(" fe")) return false;
      if (name.includes("pro")) return false;
      return true;
    }
    case "realme-p3-only": {
      // Match "Realme P3" but NOT "Realme P3 Power", "Realme P4"
      if (!name.includes("realme p3")) return false;
      if (name.includes("power")) return false;
      if (name.includes("realme p4")) return false;
      return true;
    }
    case "iqoo-z11-only": {
      // Match "iQOO Z11" but NOT "iQOO Z11x"
      if (!name.includes("iqoo z11")) return false;
      if (name.includes("z11x")) return false;
      return true;
    }
    default:
      return false;
  }
}

/**
 * Check if a product matches any removal rule.
 * Returns the matched rule or null.
 */
function matchesRemoval(product) {
  const name = product.name || "";
  const slug = (product.slug || "").toLowerCase();

  for (const rule of REMOVAL_RULES) {
    if (rule.special) {
      // Use special matching logic
      if (matchesSpecialRule(name, rule.special)) {
        return rule;
      }
    } else {
      const searchLower = rule.search.toLowerCase();
      if (rule.exactMatch) {
        if (name.toLowerCase().trim() === searchLower) return rule;
      } else {
        if (name.toLowerCase().includes(searchLower)) return rule;
        // Also check slug
        if (slug.includes(searchLower.replace(/\s+/g, "-"))) return rule;
      }
    }
  }
  return null;
}

/**
 * Check if a product is an accessory (should never be deleted).
 */
function isAccessory(product) {
  const typeName = (product.type || "").toLowerCase();
  const catName = typeof product.category === "object"
    ? (product.category?.name || "").toLowerCase()
    : (product.category || "").toLowerCase();

  return (
    typeName === "accessories" ||
    catName === "accessories" ||
    catName.includes("cover") ||
    catName.includes("guard") ||
    catName.includes("bank") ||
    catName.includes("charger") ||
    catName.includes("earbud") ||
    catName.includes("watch") ||
    catName.includes("bag") ||
    catName.includes("keyboard") ||
    catName.includes("audio")
  );
}

/**
 * Check if a product is an original (should never be deleted).
 */
function isOriginal(product) {
  // Check by ID
  if (ORIGINAL_PRODUCT_IDS.has(product.id)) return true;

  // Check by name similarity
  const nameLower = (product.name || "").toLowerCase().trim();
  for (const origName of ORIGINAL_PRODUCT_NAMES) {
    if (nameLower.includes(origName)) return true;
  }
  return false;
}

async function main() {
  try {
    console.log("========================================");
    console.log("  Product Cleanup Script");
    console.log("  Mode:", DRY_RUN ? "DRY RUN (no changes)" : "LIVE DELETION");
    console.log("========================================\n");

    // Fetch ALL products from database
    const allProducts = await prisma.product.findMany({
      include: { brand: true, category: true, colorVariants: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total products in database: ${allProducts.length}\n`);

    // Categorize products
    const accessories = [];
    const originals = [];
    const toDelete = [];
    const noMatch = [];

    for (const product of allProducts) {
      if (isAccessory(product)) {
        accessories.push(product);
        continue;
      }

      if (isOriginal(product)) {
        originals.push(product);
        continue;
      }

      const matchedRule = matchesRemoval(product);
      if (matchedRule) {
        toDelete.push({ product, matchedRule });
      } else {
        noMatch.push(product);
      }
    }

    // Report
    console.log("--- SUMMARY ---");
    console.log(`  Accessories (SKIPPED): ${accessories.length}`);
    console.log(`  Original products (SKIPPED): ${originals.length}`);
    console.log(`  Products TO DELETE: ${toDelete.length}`);
    console.log(`  Other products (no match): ${noMatch.length}`);
    console.log("");

    if (toDelete.length === 0) {
      console.log("No products matched the removal list.");
      console.log("Nothing to delete. Database is clean.");
      return;
    }

    // List products to delete
    console.log("--- PRODUCTS TO BE DELETED ---\n");
    for (let i = 0; i < toDelete.length; i++) {
      const { product, matchedRule } = toDelete[i];
      const brandName = typeof product.brand === "object" ? product.brand?.name : product.brand;
      const catName = typeof product.category === "object" ? product.category?.name : product.category;
      console.log(`  ${i + 1}. ID: ${product.id}`);
      console.log(`     Name: ${product.name}`);
      console.log(`     Slug: ${product.slug}`);
      console.log(`     Brand: ${brandName}`);
      console.log(`     Category: ${catName}`);
      console.log(`     Type: ${product.type}`);
      console.log(`     Price: ₹${product.price}`);
      console.log(`     Matched rule: "${matchedRule.search}"`);
      console.log("");
    }

    // List products that are NOT being deleted (for audit)
    console.log("--- PRODUCTS NOT DELETED (no match) ---\n");
    for (const product of noMatch) {
      const brandName = typeof product.brand === "object" ? product.brand?.name : product.brand;
      console.log(`  ${product.id}: ${product.name} (${brandName})`);
    }

    if (DRY_RUN) {
      console.log("\n========================================");
      console.log("  DRY RUN COMPLETE — No changes made.");
      console.log("  Run with --delete to actually delete:");
      console.log("  node cleanup-remove-products.cjs --delete");
      console.log("========================================");
      return;
    }

    // Perform actual deletion
    console.log("\n--- PERFORMING DELETION ---\n");
    let deletedCount = 0;
    let errorCount = 0;

    for (const { product } of toDelete) {
      try {
        // Delete color variants first (foreign key constraint)
        const cvCount = await prisma.colorVariant.deleteMany({
          where: { productId: product.id },
        });
        if (cvCount.count > 0) {
          console.log(`  Deleted ${cvCount.count} color variants for ${product.id}`);
        }

        // Delete the product
        await prisma.product.delete({ where: { id: product.id } });
        console.log(`  DELETED: ${product.id} — ${product.name}`);
        deletedCount++;
      } catch (e) {
        console.error(`  ERROR deleting ${product.id} (${product.name}): ${e.message}`);
        errorCount++;
      }
    }

    // Final count
    const totalAfter = await prisma.product.count();
    const accAfter = await prisma.product.count({
      where: { type: "Accessories" },
    });

    console.log("\n========================================");
    console.log("  CLEANUP COMPLETE");
    console.log(`  Products deleted: ${deletedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Total products remaining: ${totalAfter}`);
    console.log(`  Accessories remaining: ${accAfter}`);
    console.log("========================================");
  } catch (err) {
    console.error("Cleanup script failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
