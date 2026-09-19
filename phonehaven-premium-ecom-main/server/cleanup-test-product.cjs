const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("=== Cleaning up test product 'iphone18' ===\n");

  const testProduct = await prisma.product.findUnique({
    where: { id: "cmtgr41wc0000cgvcn1wgyr6b" },
  });

  if (testProduct) {
    console.log("Found test product:");
    console.log("  ID: " + testProduct.id);
    console.log("  Name: " + testProduct.name);
    console.log("  Type: " + testProduct.type);
    console.log("  Status: " + testProduct.status);
    console.log("  Price: " + testProduct.price);

    await prisma.colorVariant.deleteMany({ where: { productId: testProduct.id } });
    await prisma.product.delete({ where: { id: testProduct.id } });
    console.log("\n  DELETED: test product 'iphone18'");
  } else {
    console.log("Test product not found (already deleted).");
  }

  // Also check for the "one plus nord 3r earbuds" test accessory
  const testAcc = await prisma.product.findUnique({
    where: { id: "cmtgtcxbj0001cgvcsmnynclz" },
  });

  if (testAcc) {
    console.log("\nFound test accessory:");
    console.log("  ID: " + testAcc.id);
    console.log("  Name: " + testAcc.name);
    console.log("  Type: " + testAcc.type);
    console.log("  Status: " + testAcc.status);
    console.log("  Price: " + testAcc.price);
    console.log("  (Not deleting — user said do not touch accessories)");
  }

  // Final count
  const total = await prisma.product.count();
  const phones = await prisma.product.count({ where: { type: "Shop" } });
  const acc = await prisma.product.count({ where: { type: "Accessories" } });
  console.log("\n=== Final Database State ===");
  console.log("  Total products: " + total);
  console.log("  Phone products (Shop): " + phones);
  console.log("  Accessories: " + acc);

  await prisma.$disconnect();
  await pool.end();
}
main();
