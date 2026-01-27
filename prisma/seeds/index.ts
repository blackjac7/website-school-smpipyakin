import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./users";
import { seedContent } from "./content";
import { seedAcademic } from "./academic";
import { seedSite } from "./site";
import { seedNotifications } from "./notifications";
import { seedStudentsFromExcel } from "../importStudentsFromExcel";

export interface SeedOptions {
  /** Seed user accounts (default: true) */
  users?: boolean;
  /** Seed site config: hero slides, stats, settings (default: true) */
  site?: boolean;
  /** Seed school content: facilities, extracurriculars, teachers (default: true) */
  content?: boolean;
  /** Seed academic data: news, announcements, calendar, achievements, works (default: true) */
  academic?: boolean;
  /** Seed sample notifications (default: false - only for development) */
  notifications?: boolean;
  /** Import students from Excel file (default: true) */
  students?: boolean;
}

const defaultOptions: SeedOptions = {
  users: true,
  site: true,
  content: true,
  academic: true,
  notifications: false,
  students: true,
};

/**
 * Main seed orchestrator - runs all seed modules
 */
export async function runAllSeeds(
  prisma: PrismaClient,
  options: SeedOptions = {}
) {
  const opts = { ...defaultOptions, ...options };

  console.log("🌱 Starting database seeding...");
  console.log("   Options:", opts);
  console.log("");

  let adminUser, siswaProfile, osisProfile;

  // 1. Users (required for other seeds)
  if (opts.users) {
    const users = await seedUsers(prisma);
    adminUser = users.adminUser;
    siswaProfile = users.siswaProfile;
    osisProfile = users.osisProfile;
  } else {
    // Fetch existing users for dependencies
    adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const siswa = await prisma.siswa.findFirst({
      where: { user: { role: "SISWA" } },
    });
    const osis = await prisma.siswa.findFirst({
      where: { user: { role: "OSIS" } },
    });
    siswaProfile = siswa;
    osisProfile = osis;
  }

  // 2. Site Configuration (hero, stats, settings)
  if (opts.site) {
    await seedSite(prisma);
  }

  // 3. School Content
  if (opts.content) {
    await seedContent(prisma);
  }

  // 4. Academic Data
  if (opts.academic && adminUser && siswaProfile && osisProfile) {
    await seedAcademic(prisma, { adminUser, siswaProfile, osisProfile });
  }

  // 5. Import Students from Excel
  if (opts.students) {
    console.log("\n📥 Importing students from Excel...");
    await seedStudentsFromExcel(prisma);
  }

  // 6. Sample Notifications (development only)
  if (opts.notifications) {
    await seedNotifications(prisma);
  }

  console.log("");
  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("👤 Default accounts:");
  console.log("   Admin: admin / smpipyakinIDJKT705");
  console.log("   Kesiswaan: kesiswaan / smpipyakinIDJKT705");
  console.log("   Siswa: siswa001 / smpipyakinIDJKT705");
  console.log("   OSIS: osis001 / smpipyakinIDJKT705");
  console.log("   PPDB: ppdb001 / smpipyakinIDJKT705");
}

// Re-export individual seeders for selective use
export { seedUsers } from "./users";
export { seedSite } from "./site";
export { seedContent } from "./content";
export { seedAcademic } from "./academic";
export { seedNotifications } from "./notifications";
