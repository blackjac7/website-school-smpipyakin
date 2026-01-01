import {
  PrismaClient,
  BeritaKategori,
  StatusApproval,
  PriorityLevel,
  SemesterType,
  User,
  Siswa,
} from "@prisma/client";
import { NEWS_DATA, ANNOUNCEMENTS_DATA, SCHOOL_ACTIVITIES_DATA } from "./data";

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
};

function parseIndonesianDate(dateStr: string): Date {
  try {
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1];
      const year = parseInt(parts[2], 10);
      const month = MONTH_MAP[monthStr] ?? 0;
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  } catch {
    return new Date();
  }
}

interface SeedAcademicParams {
  adminUser: User;
  siswaProfile: Siswa;
  osisProfile: Siswa;
}

/**
 * Seeds academic content: news, announcements, calendar, achievements, works
 */
export async function seedAcademic(
  prisma: PrismaClient,
  { adminUser, siswaProfile, osisProfile }: SeedAcademicParams
) {
  console.log("📚 Seeding Academic Content...");

  // News
  console.log("  📰 News...");
  await prisma.news.deleteMany();
  for (const item of NEWS_DATA) {
    await prisma.news.create({
      data: {
        title: item.title,
        content: item.content,
        date: parseIndonesianDate(item.date),
        image: item.image,
        kategori:
          item.category === "achievement"
            ? BeritaKategori.ACHIEVEMENT
            : BeritaKategori.ACTIVITY,
        statusPersetujuan: StatusApproval.APPROVED,
        authorId: adminUser.id,
      },
    });
  }

  // Announcements
  console.log("  📢 Announcements...");
  await prisma.announcement.deleteMany();
  for (const item of ANNOUNCEMENTS_DATA) {
    await prisma.announcement.create({
      data: {
        title: item.title,
        content: item.content,
        date: new Date(item.date),
        location: item.location,
        priority: item.priority as PriorityLevel,
      },
    });
  }

  // School Activities (Calendar)
  console.log("  📅 Calendar Activities...");
  await prisma.schoolActivity.deleteMany();
  for (const item of SCHOOL_ACTIVITIES_DATA) {
    await prisma.schoolActivity.create({
      data: {
        title: item.title,
        date: new Date(item.date),
        information: item.information,
        semester: item.semester as SemesterType,
        tahunPelajaran: item.tahunPelajaran,
        createdBy: adminUser.id,
      },
    });
  }

  // Sample PPDB Applications
  console.log("  📝 PPDB Applications...");
  await prisma.pPDBApplication.deleteMany();
  await prisma.pPDBApplication.createMany({
    data: [
      {
        name: "Budi Santoso",
        nisn: "1234567890",
        gender: "MALE",
        birthPlace: "Jakarta",
        birthDate: new Date("2010-05-15"),
        address: "Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta",
        asalSekolah: "SD Negeri 01 Jakarta",
        parentName: "Suharto Santoso",
        parentContact: "081234567890",
        parentEmail: "suharto.santoso@gmail.com",
        status: "PENDING",
      },
      {
        name: "Siti Nurhaliza",
        nisn: "1234567891",
        gender: "FEMALE",
        birthPlace: "Bandung",
        birthDate: new Date("2010-03-20"),
        address: "Jl. Sudirman No. 456, Jakarta Selatan, DKI Jakarta",
        asalSekolah: "SD Swasta ABC",
        parentName: "Ahmad Nurdin",
        parentContact: "081234567891",
        parentEmail: "ahmad.nurdin@gmail.com",
        status: "ACCEPTED",
      },
    ],
  });

  // Student Achievements
  console.log("  🏆 Student Achievements...");
  await prisma.studentAchievement.deleteMany();
  await prisma.studentAchievement.createMany({
    data: [
      {
        siswaId: siswaProfile.id,
        title: "Juara 1 Olimpiade Matematika",
        description:
          "Meraih juara 1 dalam Olimpiade Matematika tingkat Jakarta",
        category: "akademik",
        level: "kota",
        achievementDate: new Date("2024-11-15"),
        statusPersetujuan: StatusApproval.APPROVED,
        image:
          "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
      },
      {
        siswaId: osisProfile.id,
        title: "Juara 2 Lomba Karya Tulis Ilmiah",
        description:
          "Meraih juara 2 dalam lomba karya tulis ilmiah tingkat nasional",
        category: "akademik",
        level: "nasional",
        achievementDate: new Date("2024-10-20"),
        statusPersetujuan: StatusApproval.APPROVED,
        image:
          "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
      },
    ],
  });

  // Student Works
  console.log("  🎨 Student Works...");
  await prisma.studentWork.deleteMany();
  await prisma.studentWork.createMany({
    data: [
      {
        siswaId: siswaProfile.id,
        title: "Robot Pembersih Otomatis",
        description:
          "Proyek robotika untuk membuat robot pembersih otomatis menggunakan Arduino",
        workType: "PHOTO",
        category: "teknologi",
        subject: "Prakarya",
        statusPersetujuan: StatusApproval.APPROVED,
        mediaUrl:
          "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
      },
    ],
  });

  console.log("✅ Academic content seeded");
}
