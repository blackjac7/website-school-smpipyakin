import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Data Ekstrakurikuler dari file statis
const extracurricularData = [
  {
    title: "Pramuka",
    description:
      "Kegiatan kepanduan yang mengembangkan jiwa kepemimpinan, kemandirian, dan kerjasama tim.",
    schedule: "Selasa, 13:00 - 14:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1732787846/Pramuka_ocy314.webp",
  },
  {
    title: "Seni Musik",
    description:
      "Pengembangan bakat musik melalui pembelajaran alat musik dan paduan suara.",
    schedule: "Sabtu, 07:30 - 09:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732802973/Seni_Musik_qnbwpd.webp",
  },
  {
    title: "Seni Tari",
    description:
      "Mempelajari dan melestarikan berbagai tarian tradisional dan modern Indonesia.",
    schedule: "Rabu, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1732791235/seni_tari_1_cb7rgy.webp",
  },
  {
    title: "Hadroh",
    description:
      "Pengembangan seni musik islami melalui pembelajaran alat musik rebana dan vocal.",
    schedule: "Rabu, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732803309/hadroh_11_g8qlsr.webp",
  },
  {
    title: "Rohis",
    description:
      "Kegiatan pembinaan keagamaan Islam untuk meningkatkan pemahaman dan praktik keislaman.",
    schedule: "Selasa, 13:00 - 14:30 WIB & Sabtu, 09:30 - 10:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804810/rohis_dtzeef.webp",
  },
  {
    title: "Rohkris",
    description:
      "Kegiatan pembinaan keagamaan Kristen untuk meningkatkan pemahaman dan praktik kekristenan.",
    schedule: "Jumat, 11:00 - 12:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733187839/rohkris_xf2im9.webp",
  },
  {
    title: "Paskibra",
    description:
      "Kegiatan yang fokus pada latihan baris-berbaris dan upacara bendera.",
    schedule: "Jum'at, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804631/paskibra_v3htds.webp",
  },
  {
    title: "Futsal",
    description:
      "Latihan futsal untuk mengembangkan kemampuan olahraga dan sportivitas.",
    schedule: "Sabtu, 09:00 - 11:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732802973/Futsal_hghnis.webp",
  },
  {
    title: "Pencak Silat",
    description:
      "Seni bela diri tradisional Indonesia yang mengembangkan kemampuan fisik dan mental.",
    schedule: "Sabtu, 06:00 - 07:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804631/silat_a4ly8k.webp",
  },
];

// Data Fasilitas dari file statis
const facilityData = [
  {
    title: "Laboratorium Sains",
    description:
      "Laboratorium modern yang dilengkapi dengan peralatan praktikum terkini untuk mata pelajaran Fisika, Kimia, dan Biologi.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1024&auto=format&fit=crop",
  },
  {
    title: "Perpustakaan",
    description:
      "Perpustakaan dengan koleksi buku fisik, dilengkapi area membaca yang nyaman dan akses e-library.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733112505/Perpustakaan_btnhtn.jpg",
  },
  {
    title: "Lapangan Olahraga",
    description:
      "Fasilitas olahraga lengkap termasuk lapangan futsal, basket, dan area atletik dengan standar nasional.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733094531/lapangan_pxkhxa.jpg",
  },
  {
    title: "Laboratorium Komputer",
    description:
      "Lab komputer dengan perangkat terbaru untuk pembelajaran teknologi informasi dan programming.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
  },
  {
    title: "Kantin Sekolah",
    description:
      "Kantin dengan berbagai pilihan makanan dan minuman sehat untuk menunjang gizi siswa.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733095032/kantin_xhsmox.jpg",
  },
  {
    title: "Mesin Minuman Otomatis",
    description:
      "Mesin minuman otomatis yang menyediakan berbagai minuman sehat dan menyegarkan.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733095023/mesin_otomatis_gcb28n.jpg",
  },
];

// Default avatar fallback menggunakan ui-avatars.com
const getDefaultAvatar = (name: string, gender: "male" | "female") => {
  const bgColor = gender === "male" ? "1E40AF" : "9333EA";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=${bgColor}&color=fff&bold=true`;
};

// Data Guru dari file statis
const teacherData = [
  {
    name: "Muhamad Abduh, S.T.",
    position: "Kepala Sekolah",
    category: "PIMPINAN" as const,
    subject: "Informatika",
    description: "Memimpin dengan inovasi teknologi dan hati.",
    experience: "15",
    sortOrder: 1,
    gender: "male" as const,
  },
  {
    name: "Abdulloh Syapii, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Kesiswaan",
    category: "PIMPINAN" as const,
    subject: "PAI",
    description: "Membentuk karakter siswa yang berakhlak mulia.",
    sortOrder: 2,
    gender: "male" as const,
  },
  {
    name: "Megawati, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Kurikulum",
    category: "PIMPINAN" as const,
    subject: "Matematika",
    description: "Menyusun kurikulum yang adaptif dan progresif.",
    sortOrder: 3,
    gender: "female" as const,
  },
  {
    name: "Marzuki, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Pembina OSIS",
    category: "PIMPINAN" as const,
    subject: "PJOK",
    description: "Mengembangkan potensi kepemimpinan siswa.",
    sortOrder: 4,
    gender: "male" as const,
  },
  {
    name: "Edy Supandi",
    position: "Kepala Tata Usaha",
    category: "STAFF" as const,
    description: "Mengelola administrasi sekolah dengan profesional.",
    sortOrder: 5,
    gender: "male" as const,
  },
  {
    name: "Santi",
    position: "Operator Sekolah",
    category: "STAFF" as const,
    description: "Menangani pendataan dan sistem informasi sekolah.",
    sortOrder: 6,
    gender: "female" as const,
  },
  {
    name: "Reti Sibagariang, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "IPS",
    sortOrder: 10,
    gender: "female" as const,
  },
  {
    name: "Hannystira, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Bahasa Indonesia",
    sortOrder: 11,
    gender: "female" as const,
  },
  {
    name: "Ilim Hilimudin",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Prakarya / Informatika / Koding",
    sortOrder: 12,
    gender: "male" as const,
  },
  {
    name: "Arif Darmawan, M.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "IPS",
    sortOrder: 13,
    gender: "male" as const,
  },
  {
    name: "Drs. Subino",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "PKN",
    sortOrder: 14,
    gender: "male" as const,
  },
  {
    name: "Umi Sultra, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "IPA",
    sortOrder: 15,
    gender: "female" as const,
  },
  {
    name: "Eti Fitriah, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "IPA",
    sortOrder: 16,
    gender: "female" as const,
  },
  {
    name: "Wiwi Rohayati, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Matematika",
    sortOrder: 17,
    gender: "female" as const,
  },
  {
    name: "Petra",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Seni",
    sortOrder: 18,
    gender: "female" as const,
  },
  {
    name: "Mei Megawati, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Bahasa Indonesia",
    sortOrder: 19,
    gender: "female" as const,
  },
  {
    name: "Sawitri Handayani, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Bahasa Inggris",
    sortOrder: 20,
    gender: "female" as const,
  },
  {
    name: "Anita Permatasari, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "PKN",
    sortOrder: 21,
    gender: "female" as const,
  },
  {
    name: "Yumelda Listiana, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Bahasa Inggris",
    sortOrder: 22,
    gender: "female" as const,
  },
  {
    name: "Muhammad Pebrian Syah",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "PJOK",
    sortOrder: 23,
    gender: "male" as const,
  },
  {
    name: "Abdul Rahman, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Bimbingan Konseling",
    sortOrder: 24,
    gender: "male" as const,
  },
  {
    name: "Siti Humairoh, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Bahasa Indonesia",
    sortOrder: 25,
    gender: "female" as const,
  },
  {
    name: "Intan Maharani, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Matematika",
    sortOrder: 26,
    gender: "female" as const,
  },
  {
    name: "Febriansyah",
    position: "Guru Mata Pelajaran",
    category: "GURU_MAPEL" as const,
    subject: "Koding",
    sortOrder: 27,
    gender: "male" as const,
  },
];

async function seedExtracurricular() {
  console.log("🎯 Seeding Extracurricular...");

  // Delete existing data
  await prisma.extracurricular.deleteMany();

  for (const ekskul of extracurricularData) {
    await prisma.extracurricular.create({
      data: ekskul,
    });
  }

  console.log(
    `   ✅ Created ${extracurricularData.length} extracurricular activities`
  );
}

async function seedFacilities() {
  console.log("🏫 Seeding Facilities...");

  // Delete existing data
  await prisma.facility.deleteMany();

  for (const facility of facilityData) {
    await prisma.facility.create({
      data: facility,
    });
  }

  console.log(`   ✅ Created ${facilityData.length} facilities`);
}

async function seedTeachers() {
  console.log("👨‍🏫 Seeding Teachers...");

  // Delete existing data
  await prisma.teacher.deleteMany();

  for (const teacher of teacherData) {
    const { gender, ...teacherWithoutGender } = teacher;
    await prisma.teacher.create({
      data: {
        ...teacherWithoutGender,
        // Use default avatar with name and gender-based color
        photo: getDefaultAvatar(teacher.name, gender),
      },
    });
  }

  console.log(`   ✅ Created ${teacherData.length} teachers`);
}

async function seedHeroSlides() {
  console.log("🖼️ Seeding Hero Slides...");

  // Remove existing data so seed is idempotent
  await prisma.heroSlide.deleteMany();

  const heroSlidesData = [
    {
      title: "Selamat Datang di SMP IP Yakin",
      subtitle:
        "Membangun generasi cerdas berakhlak mulia melalui pendidikan yang berpusat pada karakter dan prestasi.",
      imageSmall:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
      imageMedium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1600/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
      linkPrimaryText: "PPDB",
      linkPrimaryHref: "/ppdb",
      linkSecondaryText: "Kegiatan",
      linkSecondaryHref: "/kegiatan",
      isActive: true,
      sortOrder: 0,
    },
    {
      title: "Prestasi Siswa Kami",
      subtitle:
        "Penghargaan dan prestasi terbaru siswa dalam berbagai kompetisi akademik dan non-akademik.",
      imageSmall:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
      imageMedium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1600/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
      linkPrimaryText: "Berita",
      linkPrimaryHref: "/berita",
      linkSecondaryText: "Galeri",
      linkSecondaryHref: "/galeri",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "Ekstrakurikuler yang Aktif",
      subtitle:
        "Bergabunglah dengan berbagai ekstrakurikuler untuk mengembangkan minat dan bakatmu.",
      imageSmall:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
      imageMedium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1600/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
      linkPrimaryText: "Ekstrakurikuler",
      linkPrimaryHref: "/ekstrakurikuler",
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const slide of heroSlidesData) {
    await prisma.heroSlide.create({ data: slide });
  }

  console.log(`   ✅ Created ${heroSlidesData.length} hero slides`);
}

async function seedSchoolStats() {
  console.log("📊 Seeding School Stats...");

  await prisma.schoolStat.deleteMany();

  const schoolStatsData = [
    {
      label: "Siswa Terdaftar",
      value: "1,250",
      iconName: "users",
      isActive: true,
      sortOrder: 0,
    },
    {
      label: "Guru & Staf",
      value: "75",
      iconName: "academic-cap",
      isActive: true,
      sortOrder: 1,
    },
    {
      label: "Ekstrakurikuler",
      value: "12",
      iconName: "sparkles",
      isActive: true,
      sortOrder: 2,
    },
    {
      label: "Fasilitas",
      value: "8",
      iconName: "building",
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const stat of schoolStatsData) {
    await prisma.schoolStat.create({ data: stat });
  }

  console.log(`   ✅ Created ${schoolStatsData.length} school stats`);
}

async function main() {
  console.log("🌱 Starting Content Seeding...\n");

  await seedExtracurricular();
  await seedFacilities();
  await seedTeachers();
  await seedHeroSlides();
  await seedSchoolStats();

  console.log("\n✨ Content seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
