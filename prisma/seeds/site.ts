import { PrismaClient, SettingType } from "@prisma/client";
import {
  HERO_SLIDES_DATA,
  SCHOOL_STATS_DATA,
  SITE_SETTINGS_DATA,
} from "./data/site";

/**
 * Seeds site configuration: hero slides, school stats, site settings
 */
export async function seedSite(prisma: PrismaClient) {
  console.log("🏠 Seeding Site Configuration...");

  // Hero Slides
  console.log("  🖼️ Hero Slides...");
  await prisma.heroSlide.deleteMany();
  for (const slide of HERO_SLIDES_DATA) {
    await prisma.heroSlide.create({
      data: slide,
    });
  }

  // School Stats
  console.log("  📊 School Stats...");
  await prisma.schoolStat.deleteMany();
  for (const stat of SCHOOL_STATS_DATA) {
    await prisma.schoolStat.create({
      data: stat,
    });
  }

  // Site Settings (upsert to not overwrite existing settings)
  console.log("  ⚙️ Site Settings...");
  for (const setting of SITE_SETTINGS_DATA) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {}, // Don't update if exists (preserve user changes)
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingType,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic,
      },
    });
  }

  console.log("✅ Site configuration seeded");
}
