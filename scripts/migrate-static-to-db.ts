import { PrismaClient } from "@prisma/client";
import { facilities } from "../src/lib/data/facilities";
import { activities } from "../src/lib/data/extracurricular";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting migration of static data to database...");

  // 1. Migrate Facilities
  console.log("Checking Facilities...");
  const facilityCount = await prisma.facility.count();

  if (facilityCount === 0) {
    console.log(`Found ${facilities.length} static facilities to migrate.`);

    for (const facility of facilities) {
      await prisma.facility.create({
        data: {
          title: facility.name, // Mapping 'name' to 'title'
          description: facility.description,
          image: facility.image,
        },
      });
    }
    console.log("✅ Facilities migrated successfully.");
  } else {
    console.log(`ℹ️ Facilities table already has ${facilityCount} records. Skipping migration.`);
  }

  // 2. Migrate Extracurriculars
  console.log("\nChecking Extracurriculars...");
  const extracurricularCount = await prisma.extracurricular.count();

  if (extracurricularCount === 0) {
    console.log(`Found ${activities.length} static activities to migrate.`);

    for (const activity of activities) {
      // Handle schedule: it can be string or string[]
      const scheduleString = Array.isArray(activity.schedule)
        ? activity.schedule.join(" & ")
        : activity.schedule;

      await prisma.extracurricular.create({
        data: {
          title: activity.name, // Mapping 'name' to 'title'
          description: activity.description,
          image: activity.image,
          schedule: scheduleString,
        },
      });
    }
    console.log("✅ Extracurriculars migrated successfully.");
  } else {
    console.log(`ℹ️ Extracurriculars table already has ${extracurricularCount} records. Skipping migration.`);
  }

  console.log("\n✨ Migration complete!");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
