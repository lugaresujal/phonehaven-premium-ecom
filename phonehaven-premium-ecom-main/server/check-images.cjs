const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const prods = await prisma.product.findMany({ select: { id: true, name: true, image: true, images: true } });
  const bad = [];
  prods.forEach(pr => {
    [pr.image, ...(pr.images || [])].filter(Boolean).forEach(url => {
      if (url && !url.startsWith("http")) bad.push({ id: pr.id, name: pr.name, field: "image", url: url.substring(0, 150) });
      if (url && (url.includes("encrypted") || url.includes("ogw"))) bad.push({ id: pr.id, name: pr.name, field: "image", url: url.substring(0, 150) });
    });
  });
  console.log("Total products:", prods.length);
  console.log("Products with bad image URLs:", bad.length);
  if (bad.length > 0) console.log(JSON.stringify(bad, null, 2));

  await prisma.$disconnect();
  await pool.end();
})();
