
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS } from "../../src/lib/siteSettings";

export async function seedSite(prisma: PrismaClient) {
  console.log("  ⚙️ Seeding Site Settings...");

  // Calculate dates for PPDB (Open for current month)
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 1st of current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

  // Prepare custom settings for seed
  const customSettings = {
    ...DEFAULT_SETTINGS,
    "ppdb.enabled": {
      ...DEFAULT_SETTINGS["ppdb.enabled"],
      value: "true", // Enable PPDB by default for development
    },
    "ppdb.startDate": {
      ...DEFAULT_SETTINGS["ppdb.startDate"],
      value: startDate.toISOString(),
    },
    "ppdb.endDate": {
      ...DEFAULT_SETTINGS["ppdb.endDate"],
      value: endDate.toISOString(),
    },
  };

  for (const [key, config] of Object.entries(customSettings)) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: {
        value: config.value,
      },
      create: {
        key,
        value: config.value,
        type: config.type,
        category: config.category,
        description: config.description,
        isPublic: config.isPublic,
      },
    });
  }

  // Seed Hero Slides
  console.log("  🖼️ Seeding Hero Slides...");
  const slides = [
    {
      title: "Selamat Datang di SMP IP Yakin",
      subtitle: "Membangun Generasi Berakhlak Mulia dan Berprestasi",
      imageSmall: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
      imageMedium: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
      linkPrimaryText: "Tentang Kami",
      linkPrimaryHref: "/profile/sejarah",
      linkSecondaryText: "Hubungi Kami",
      linkSecondaryHref: "/contact",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Penerimaan Peserta Didik Baru",
      subtitle: "Tahun Ajaran 2025/2026 Telah Dibuka",
      imageSmall: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop",
      imageMedium: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200&auto=format&fit=crop",
      linkPrimaryText: "Daftar Sekarang",
      linkPrimaryHref: "/ppdb",
      linkSecondaryText: "Informasi PPDB",
      linkSecondaryHref: "/ppdb/informasi",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Fasilitas Pembelajaran Lengkap",
      subtitle: "Menunjang Kegiatan Belajar Mengajar yang Efektif",
      imageSmall: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop",
      imageMedium: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop",
      linkPrimaryText: "Lihat Fasilitas",
      linkPrimaryHref: "/profile/fasilitas",
      linkSecondaryText: null,
      linkSecondaryHref: null,
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const slide of slides) {
    await prisma.heroSlide.create({
      data: slide,
    });
  }

  // Seed School Stats
  console.log("  📊 Seeding School Stats...");
  const stats = [
    {
      label: "Siswa",
      value: "450+",
      iconName: "Users",
      sortOrder: 1,
      isActive: true,
    },
    {
      label: "Guru & Staff",
      value: "35",
      iconName: "GraduationCap",
      sortOrder: 2,
      isActive: true,
    },
    {
      label: "Ekstrakurikuler",
      value: "12",
      iconName: "Trophy",
      sortOrder: 3,
      isActive: true,
    },
    {
      label: "Tahun Berdiri",
      value: "1995",
      iconName: "Building2",
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const stat of stats) {
    await prisma.schoolStat.create({
      data: stat,
    });
  }
}
