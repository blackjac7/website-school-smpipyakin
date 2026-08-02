import { PrismaClient } from "@prisma/client";

const DEFAULT_ATTRIBUTE_ITEMS = [
  { name: "Topi", order: 1 },
  { name: "Dasi", order: 2 },
  { name: "Ikat Pinggang", order: 3 },
  { name: "Sepatu Hitam", order: 4 },
  { name: "Kaos Kaki", order: 5 },
  { name: "Seragam Sesuai Jadwal", order: 6 },
  { name: "Kartu Pelajar", order: 7 },
  { name: "Badge/Lokasi", order: 8 },
];

/**
 * Seeds default uniform attribute items (idempotent, preserves existing rows)
 */
export async function seedAttributes(prisma: PrismaClient) {
  console.log("👔 Seeding Attribute Items...");

  for (const item of DEFAULT_ATTRIBUTE_ITEMS) {
    await prisma.attributeItem.upsert({
      where: { name: item.name },
      update: {}, // Don't overwrite if kesiswaan already edited it
      create: item,
    });
  }

  console.log("✅ Attribute items seeded");
}
