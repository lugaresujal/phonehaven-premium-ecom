const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const all = await prisma.product.findMany({
    include: { brand: true, category: true },
    orderBy: { id: "asc" },
  });

  console.log("ALL PRODUCTS IN DATABASE:");
  console.log("========================");
  for (const p of all) {
    const brand = typeof p.brand === "object" ? p.brand?.name : p.brand;
    const cat = typeof p.category === "object" ? p.category?.name : p.category;
    console.log("[" + p.id + "] " + p.name + " | type=" + p.type + " | status=" + p.status + " | brand=" + brand + " | cat=" + cat + " | price=" + p.price);
  }

  console.log("\nTotal: " + all.length);

  const byType = {};
  for (const p of all) {
    const t = p.type || "none";
    byType[t] = (byType[t] || 0) + 1;
  }
  console.log("By type:", JSON.stringify(byType));

  const byStatus = {};
  for (const p of all) {
    const s = p.status || "none";
    byStatus[s] = (byStatus[s] || 0) + 1;
  }
  console.log("By status:", JSON.stringify(byStatus));

  await prisma.$disconnect();
  await pool.end();
}
main();
