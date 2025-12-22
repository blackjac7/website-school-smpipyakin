import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users with hashed passwords (matching your current auth system)
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@smpipyakin.sch.id",
      password: hashedPassword,
      role: "ADMIN",
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
      role: "KESISWAAN",
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
      email: "siswa001@smpipyakin.sch.id",
      password: hashedPassword,
      role: "SISWA",
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
      email: "ahmadrizki@gmail.com",
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
      email: "osis001@smpipyakin.sch.id",
      password: hashedPassword,
      role: "OSIS",
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
      email: "ketuaosis@gmail.com",
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
      email: "ppdb001@smpipyakin.sch.id",
      password: hashedPassword,
      role: "PPDB_STAFF",
    },
  });

  // Create sample news
  await prisma.news.createMany({
    data: [
      {
        title: "Prestasi Gemilang Siswa SMP IP Yakin",
        date: new Date("2024-12-01"),
        content:
          "Siswa SMP IP Yakin meraih juara 1 dalam olimpiade matematika tingkat Jakarta.",
        image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
        kategori: "ACHIEVEMENT",
        statusPersetujuan: "APPROVED",
        authorId: adminUser.id,
      },
      {
        title: "Kegiatan Ekstrakurikuler Robotika",
        date: new Date("2024-11-15"),
        content:
          "Ekstrakurikuler robotika mengadakan workshop pembuatan robot sederhana.",
        image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
        kategori: "ACTIVITY",
        statusPersetujuan: "APPROVED",
        authorId: kesiswaanUser.id,
      },
       {
        title: "Kunjungan Belajar ke Museum Nasional",
        date: new Date("2024-10-20"),
        content:
          "Siswa kelas VII melakukan kunjungan belajar sejarah ke Museum Nasional.",
        image: "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
        kategori: "ACTIVITY",
        statusPersetujuan: "APPROVED",
        authorId: adminUser.id,
      },
       {
        title: "Juara Harapan Lomba Pidato Bahasa Inggris",
        date: new Date("2024-09-10"),
        content:
          "Selamat kepada siswa kami yang meraih juara harapan dalam lomba pidato.",
        image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
        kategori: "ACHIEVEMENT",
        statusPersetujuan: "APPROVED",
        authorId: kesiswaanUser.id,
      },
    ],
  });

  // Create sample announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Pengumuman Jadwal UTS Semester Ganjil",
        date: new Date("2024-10-01"),
        location: "SMP IP Yakin Jakarta",
        content: "UTS akan dilaksanakan mulai tanggal 15 Oktober 2024.",
        priority: "HIGH",
      },
      {
        title: "Libur Hari Raya Idul Fitri",
        date: new Date("2024-04-01"),
        location: "SMP IP Yakin Jakarta",
        content: "Sekolah libur pada tanggal 10-15 April 2024.",
        priority: "MEDIUM",
      },
      {
        title: "Pendaftaran Ekstrakurikuler Baru",
        date: new Date("2024-07-20"),
        location: "Ruang Kesiswaan",
        content: "Pendaftaran ekstrakurikuler untuk siswa baru dibuka mulai Senin depan.",
        priority: "LOW",
      },
    ],
  });

  // Create sample school activities
  await prisma.schoolActivity.createMany({
    data: [
      {
        title: "Pekan Olahraga dan Seni",
        date: new Date("2024-11-20"),
        information:
          "Kegiatan tahunan pekan olahraga dan seni untuk seluruh siswa.",
        semester: "GANJIL",
        tahunPelajaran: "2024/2025",
        createdBy: adminUser.id,
      },
      {
        title: "Bakti Sosial OSIS",
        date: new Date("2024-12-05"),
        information: "Kegiatan bakti sosial yang diselenggarakan oleh OSIS.",
        semester: "GANJIL",
        tahunPelajaran: "2024/2025",
        createdBy: osisUser.id,
      },
       {
        title: "Seminar Anti-Bullying",
        date: new Date("2024-08-15"),
        information: "Seminar wajib bagi seluruh siswa kelas VII.",
        semester: "GANJIL",
        tahunPelajaran: "2024/2025",
        createdBy: kesiswaanUser.id,
      },
    ],
  });

  // Create sample facilities
  await prisma.facility.createMany({
    data: [
      {
        title: "Laboratorium Komputer",
        description:
          "Laboratorium komputer dengan 30 unit PC terbaru dan koneksi internet.",
        image: "/images/facilities/lab-komputer.jpg",
      },
      {
        title: "Perpustakaan",
        description:
          "Perpustakaan dengan koleksi buku yang lengkap dan ruang baca yang nyaman.",
        image: "/images/facilities/perpustakaan.jpg",
      },
      {
        title: "Lapangan Basket",
        description: "Lapangan basket indoor dengan fasilitas yang memadai.",
        image: "/images/facilities/lapangan-basket.jpg",
      },
    ],
  });

  // Create sample extracurriculars
  await prisma.extracurricular.createMany({
    data: [
      {
        title: "Robotika",
        description:
          "Ekstrakurikuler robotika untuk mengembangkan kemampuan STEM siswa.",
        image: "/images/extracurricular/robotika.jpg",
        schedule: "Setiap Jumat, 15:00-17:00",
      },
      {
        title: "Pramuka",
        description:
          "Kegiatan pramuka untuk membangun karakter dan kepemimpinan siswa.",
        image: "/images/extracurricular/pramuka.jpg",
        schedule: "Setiap Sabtu, 08:00-12:00",
      },
      {
        title: "Basket",
        description:
          "Ekstrakurikuler basket untuk mengembangkan bakat olahraga siswa.",
        image: "/images/extracurricular/basket.jpg",
        schedule: "Setiap Selasa & Kamis, 15:30-17:30",
      },
    ],
  });

  // Create sample PPDB applications
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
      {
        name: "Rizky Firmansyah",
        nisn: "1234567892",
        gender: "MALE",
        birthPlace: "Surabaya",
        birthDate: new Date("2010-07-10"),
        address: "Jl. Thamrin No. 789, Jakarta Pusat, DKI Jakarta",
        asalSekolah: "SD Islam Al-Hikmah",
        parentName: "Firman Hidayat",
        parentContact: "081234567892",
        parentEmail: "firman.hidayat@gmail.com",
        status: "REJECTED",
        feedback:
          "Dokumen ijazah tidak lengkap. Silakan lengkapi dokumen dan daftar ulang.",
      },
    ],
  });

  // Create sample student achievements
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
        statusPersetujuan: "APPROVED",
      },
      {
        siswaId: osisProfile.id,
        title: "Juara 2 Lomba Karya Tulis Ilmiah",
        description:
          "Meraih juara 2 dalam lomba karya tulis ilmiah tingkat nasional",
        category: "akademik",
        level: "nasional",
        achievementDate: new Date("2024-10-20"),
        statusPersetujuan: "APPROVED",
      },
    ],
  });

  // Create sample student works
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
        statusPersetujuan: "APPROVED",
      },
      {
        siswaId: osisProfile.id,
        title: "Puisi Cinta Tanah Air",
        description:
          "Kumpulan puisi tentang cinta tanah air dan kebanggaan menjadi anak Indonesia",
        workType: "PHOTO",
        category: "sastra",
        subject: "Bahasa Indonesia",
        statusPersetujuan: "PENDING",
      },
    ],
  });

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: siswaUser.id,
        type: "ACHIEVEMENT_APPROVED",
        title: "Prestasi Disetujui",
        message:
          "Prestasi 'Juara 1 Olimpiade Matematika' telah disetujui dan ditampilkan di profil Anda.",
        data: { achievementTitle: "Juara 1 Olimpiade Matematika" },
        read: false,
      },
      {
        userId: osisUser.id,
        type: "WORK_APPROVED",
        title: "Karya Siswa Disetujui",
        message:
          "Karya 'Robot Pembersih Otomatis' telah disetujui dan ditampilkan di galeri sekolah.",
        data: { workTitle: "Robot Pembersih Otomatis" },
        read: true,
      },
      {
        userId: adminUser.id,
        type: "GENERAL_INFO",
        title: "Sistem Berhasil Diinisialisasi",
        message:
          "Database sekolah telah berhasil diinisialisasi dengan data sampel.",
        read: false,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("👤 Default accounts:");
  console.log("   Admin: admin / admin123");
  console.log("   Kesiswaan: kesiswaan / admin123");
  console.log("   Siswa: siswa001 / admin123");
  console.log("   OSIS: osis001 / admin123");
  console.log("   PPDB: ppdb001 / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
