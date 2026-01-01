import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seeds default user accounts for the application
 */
export async function seedUsers(prisma: PrismaClient) {
  console.log("👤 Seeding Users...");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@smpipyakin.sch.id",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // 2. Kesiswaan Staff
  const kesiswaanUser = await prisma.user.upsert({
    where: { username: "kesiswaan" },
    update: {},
    create: {
      username: "kesiswaan",
      email: "kesiswaan@smpipyakin.sch.id",
      password: hashedPassword,
      role: UserRole.KESISWAAN,
    },
  });

  // Create Kesiswaan profile
  await prisma.kesiswaan.upsert({
    where: { userId: kesiswaanUser.id },
    update: {},
    create: {
      userId: kesiswaanUser.id,
      nip: "NIP001",
      name: "Staff Kesiswaan",
      gender: "FEMALE",
      statusActive: true,
    },
  });

  // 3. Siswa User
  const siswaUser = await prisma.user.upsert({
    where: { username: "siswa001" },
    update: {},
    create: {
      username: "siswa001",
      password: hashedPassword,
      role: UserRole.SISWA,
    },
  });

  // Create Siswa profile
  const siswaProfile = await prisma.siswa.upsert({
    where: { userId: siswaUser.id },
    update: {},
    create: {
      userId: siswaUser.id,
      nisn: "2024001",
      name: "Ahmad Rizki Pratama",
      class: "VIII A",
      year: 2024,
      gender: "MALE",
      osisAccess: false,
      phone: "081234567890",
      address: "Jl. Merdeka No. 123, Jakarta Pusat",
      birthDate: new Date("2010-05-15"),
      birthPlace: "Jakarta",
      parentName: "Budi Pratama",
      parentPhone: "081234567891",
    },
  });

  // 4. OSIS User
  const osisUser = await prisma.user.upsert({
    where: { username: "osis001" },
    update: {},
    create: {
      username: "osis001",
      password: hashedPassword,
      role: UserRole.OSIS,
    },
  });

  // Create OSIS Siswa profile
  const osisProfile = await prisma.siswa.upsert({
    where: { userId: osisUser.id },
    update: {},
    create: {
      userId: osisUser.id,
      nisn: "2023001",
      name: "Ketua OSIS",
      class: "IX A",
      year: 2023,
      gender: "FEMALE",
      osisAccess: true,
      phone: "081234567892",
      address: "Jl. Sudirman No. 456, Jakarta Selatan",
      birthDate: new Date("2009-08-20"),
      birthPlace: "Bandung",
      parentName: "Siti Aminah",
      parentPhone: "081234567893",
    },
  });

  // 5. PPDB Staff
  await prisma.user.upsert({
    where: { username: "ppdb001" },
    update: {},
    create: {
      username: "ppdb001",
      password: hashedPassword,
      role: UserRole.PPDB_ADMIN,
    },
  });

  console.log("✅ Users seeded");

  return {
    adminUser,
    kesiswaanUser,
    siswaUser,
    siswaProfile,
    osisUser,
    osisProfile,
  };
}
