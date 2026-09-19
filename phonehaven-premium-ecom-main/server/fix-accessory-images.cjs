/**
 * fix-accessory-images.cjs
 *
 * Copies the real imported accessory PNG images from src/assets/images/
 * into server/uploads/ with stable filenames, then updates each accessory
 * product's `image` and `images` fields in the database so the frontend
 * can serve the correct images via /api/uploads/<filename>.
 *
 * USAGE:
 *   node fix-accessory-images.cjs          → Dry run (shows what would change)
 *   node fix-accessory-images.cjs --apply  → Actually copies files and updates DB
 */

const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const DRY_RUN = !process.argv.includes("--apply");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Paths
const ASSETS_DIR = path.join(__dirname, "..", "src", "assets", "images");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Map: accessory product ID → source filename in src/assets/images/
// These map exactly to the imported images in accessories-catalog.ts
const ACC_IMAGE_MAP = {
  // iPhone Covers
  "acc-1":  "iphone16promax-cover.png",
  "acc-2":  "iphone16-cover.png",
  "acc-3":  "iphone16-cover1.png",
  "acc-4":  "iphone17pro-cover.png",
  "acc-5":  "iphone17-cover.png",
  "acc-6":  "iphone17-cover2.png",
  // Screen Guards
  "acc-7":  "iphone15screenguard.png",
  "acc-8":  "iphone15promaxscreenguard.png",
  "acc-9":  "iphone16screenguard.png",
  "acc-10": "iphone16promaxscreenguard.png",
  "acc-11": "iphone17screenguard.png",
  "acc-12": "iphone17promaxscreenguard.png",
  // Power Banks
  "acc-13": "xiaomi powerbank.png",
  "acc-14": "ugreen powerbank.png",
  "acc-15": "androidnormalpowerbank.png",
  "acc-16": "iphone powerbank.png",
  // Fast Chargers
  "acc-17": "androidandiphonefastchargercombo.png",
  "acc-18": "androidfastcharger.png",
  "acc-19": "iphonefastcharger.png",
  // Wireless Earbuds
  "acc-20": "wirelessearbuds.png",
  "acc-21": "wirelessearbuds1.png",
  "acc-22": "wirelessearbuds2.png",
  "acc-23": "wirelessearbuds3.png",
  // Smartwatches
  "acc-24": "smartwatches1.png",
  "acc-25": "smartwatches2.png",
  "acc-26": "smartwatches3.png",
  "acc-27": "smartwatches4.png",
  // Korean Bags
  "acc-28": "koreanbag.png",
  // Wireless Keyboard & Mouse
  "acc-29": "wirelessmouseandkeyboard.png",
};

// Stable upload filename for each accessory (no spaces, consistent name)
function getUploadFilename(accId) {
  return `acc-img-${accId}.png`;
}

async function main() {
  console.log("========================================");
  console.log("  Accessory Image Fix Script");
  console.log("  Mode:", DRY_RUN ? "DRY RUN (no changes)" : "APPLY (copy + update DB)");
  console.log("========================================\n");

  // Ensure uploads dir exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    if (!DRY_RUN) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    else console.log("[DRY] Would create uploads directory:", UPLOADS_DIR);
  }

  // Load all accessories from DB
  const dbProducts = await prisma.product.findMany({
    where: { type: "Accessories" },
    select: { id: true, name: true, image: true, images: true },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${dbProducts.length} Accessories in database.\n`);
  console.log("--- PLAN ---\n");

  let copyCount = 0;
  let updateCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  const updates = [];

  for (const product of dbProducts) {
    const srcFilename = ACC_IMAGE_MAP[product.id];

    if (!srcFilename) {
      console.log(`  [SKIP] ${product.id} (${product.name}) — no image mapping defined`);
      skipCount++;
      continue;
    }

    const srcPath = path.join(ASSETS_DIR, srcFilename);
    const destFilename = getUploadFilename(product.id);
    const destPath = path.join(UPLOADS_DIR, destFilename);
    const newImageUrl = `/api/uploads/${destFilename}`;

    // Check source file exists
    if (!fs.existsSync(srcPath)) {
      console.error(`  [ERROR] Source not found: ${srcPath}`);
      errorCount++;
      continue;
    }

    const alreadyCopied = fs.existsSync(destPath);
    const imageAlreadyCorrect = product.image === newImageUrl;

    console.log(`  ${product.id}: ${product.name}`);
    console.log(`    Source:  ${srcFilename} (${Math.round(fs.statSync(srcPath).size / 1024)}KB)`);
    console.log(`    DB image: ${product.image}`);
    console.log(`    → New URL: ${newImageUrl}`);

    if (alreadyCopied && imageAlreadyCorrect) {
      console.log(`    Status: ✅ Already correct — skip`);
      skipCount++;
    } else {
      if (!alreadyCopied) {
        console.log(`    File: will copy to uploads/`);
        copyCount++;
      } else {
        console.log(`    File: already in uploads/ ✓`);
      }
      if (!imageAlreadyCorrect) {
        console.log(`    DB: will update image URL`);
        updateCount++;
      }
      updates.push({ product, srcPath, destPath, destFilename, newImageUrl });
    }
    console.log("");
  }

  console.log(`\n--- SUMMARY ---`);
  console.log(`  To copy: ${copyCount} files`);
  console.log(`  To update in DB: ${updateCount} products`);
  console.log(`  Already correct: ${skipCount} products`);
  console.log(`  Errors: ${errorCount}\n`);

  if (DRY_RUN) {
    console.log("========================================");
    console.log("  DRY RUN COMPLETE — No changes made.");
    console.log("  Run with --apply to copy files & update DB:");
    console.log("  node fix-accessory-images.cjs --apply");
    console.log("========================================");
    return;
  }

  if (updates.length === 0) {
    console.log("Nothing to do. All accessory images are already correct!");
    return;
  }

  // Perform actual copy + DB update
  console.log("--- APPLYING CHANGES ---\n");
  let applied = 0;

  for (const { product, srcPath, destPath, newImageUrl } of updates) {
    try {
      // 1. Copy file to uploads/
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Copied: ${path.basename(srcPath)} → uploads/${path.basename(destPath)}`);
      } else {
        console.log(`  ✓ File already in uploads/: ${path.basename(destPath)}`);
      }

      // 2. Update DB
      await prisma.product.update({
        where: { id: product.id },
        data: {
          image: newImageUrl,
          images: [newImageUrl],
        },
      });
      console.log(`  ✓ Updated DB: ${product.id} → ${newImageUrl}`);
      applied++;
    } catch (err) {
      console.error(`  ✗ Error for ${product.id}: ${err.message}`);
      errorCount++;
    }
  }

  // Final verification
  console.log("\n--- VERIFICATION ---");
  const verifyProducts = await prisma.product.findMany({
    where: { type: "Accessories", id: { in: Object.keys(ACC_IMAGE_MAP) } },
    select: { id: true, name: true, image: true },
    orderBy: { id: "asc" },
  });

  let allCorrect = true;
  for (const p of verifyProducts) {
    const expected = `/api/uploads/acc-img-${p.id}.png`;
    if (p.image !== expected) {
      console.log(`  ✗ ${p.id}: image = ${p.image} (expected ${expected})`);
      allCorrect = false;
    } else {
      console.log(`  ✓ ${p.id}: ${p.image}`);
    }
  }

  console.log("\n========================================");
  console.log("  COMPLETE");
  console.log(`  Applied: ${applied} updates`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  DB verification: ${allCorrect ? "✅ All correct" : "⚠ Some mismatches"}`);
  console.log("========================================");
}

main()
  .catch((err) => { console.error("Script failed:", err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
