// src/lib/data/homepage.ts

import { prisma } from "@/lib/prisma";
import {
  News,
  Announcement,
  SchoolActivity,
  StatusApproval,
  PriorityLevel,
  SemesterType,
  BeritaKategori
} from "@prisma/client";

// Define return types to ensure consistency even if we switch to real DB
export interface HomepageData {
  news: News[];
  announcements: Announcement[];
  activities: SchoolActivity[];
}

// MOCK DATA for when DB is unavailable
// This mirrors the data we intended to seed
export const MOCK_NEWS: News[] = [
  {
    id: "mock-news-1",
    title: "Prestasi Gemilang Siswa SMP IP Yakin",
    date: new Date("2024-12-01"),
    content: "Siswa SMP IP Yakin meraih juara 1 dalam olimpiade matematika tingkat Jakarta.",
    image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
    kategori: "ACHIEVEMENT" as BeritaKategori,
    statusPersetujuan: "APPROVED" as StatusApproval,
    authorId: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-news-2",
    title: "Kegiatan Ekstrakurikuler Robotika",
    date: new Date("2024-11-15"),
    content: "Ekstrakurikuler robotika mengadakan workshop pembuatan robot sederhana.",
    image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    kategori: "ACTIVITY" as BeritaKategori,
    statusPersetujuan: "APPROVED" as StatusApproval,
    authorId: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-news-3",
    title: "Kunjungan Belajar ke Museum Nasional",
    date: new Date("2024-10-20"),
    content: "Siswa kelas VII melakukan kunjungan belajar sejarah ke Museum Nasional.",
    image: "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
    kategori: "ACTIVITY" as BeritaKategori,
    statusPersetujuan: "APPROVED" as StatusApproval,
    authorId: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "mock-ann-1",
    title: "Pengumuman Jadwal UTS Semester Ganjil",
    date: new Date("2024-10-01"),
    location: "SMP IP Yakin Jakarta",
    content: "UTS akan dilaksanakan mulai tanggal 15 Oktober 2024.",
    priority: "HIGH" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-2",
    title: "Libur Hari Raya Idul Fitri",
    date: new Date("2024-04-01"),
    location: "SMP IP Yakin Jakarta",
    content: "Sekolah libur pada tanggal 10-15 April 2024.",
    priority: "MEDIUM" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-3",
    title: "Pendaftaran Ekstrakurikuler Baru",
    date: new Date("2024-07-20"),
    location: "Ruang Kesiswaan",
    content: "Pendaftaran ekstrakurikuler untuk siswa baru dibuka mulai Senin depan.",
    priority: "LOW" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-4",
    title: "Rapat Orang Tua Siswa Kelas VII",
    date: new Date("2024-07-15"),
    location: "Aula Sekolah",
    content: "Mengundang seluruh orang tua/wali murid kelas VII untuk hadir dalam rapat awal tahun pelajaran.",
    priority: "HIGH" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-5",
    title: "Kegiatan Porseni Antar Kelas",
    date: new Date("2024-12-10"),
    location: "Lapangan Olahraga",
    content: "Pekan Olahraga dan Seni (Porseni) akan diadakan setelah ujian akhir semester.",
    priority: "MEDIUM" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-6",
    title: "Vaksinasi COVID-19 Tahap 3",
    date: new Date("2024-02-15"),
    location: "UKS",
    content: "Jadwal vaksinasi booster untuk siswa yang belum menerima.",
    priority: "HIGH" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-7",
    title: "Lomba Kebersihan Kelas",
    date: new Date("2024-08-05"),
    location: "Lingkungan Sekolah",
    content: "Dalam rangka menyambut HUT RI, diadakan lomba kebersihan dan menghias kelas.",
    priority: "LOW" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-8",
    title: "Sosialisasi Bahaya Narkoba",
    date: new Date("2024-09-12"),
    location: "Aula Sekolah",
    content: "Bekerjasama dengan BNN, sekolah mengadakan penyuluhan anti narkoba.",
    priority: "HIGH" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-9",
    title: "Pengumpulan Zakat Fitrah",
    date: new Date("2024-03-25"),
    location: "Masjid Sekolah",
    content: "Panitia Amaliah Ramadhan menerima penyaluran zakat fitrah siswa.",
    priority: "MEDIUM" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-10",
    title: "Perubahan Jadwal Masuk Sekolah",
    date: new Date("2024-01-05"),
    location: "SMP IP Yakin Jakarta",
    content: "Mulai semester genap, jam masuk sekolah dimajukan 15 menit menjadi pukul 06.45 WIB.",
    priority: "HIGH" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-11",
    title: "Peminjaman Buku Paket Semester Genap",
    date: new Date("2024-01-08"),
    location: "Perpustakaan",
    content: "Jadwal peminjaman buku paket untuk semester genap telah ditempel di mading.",
    priority: "LOW" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-12",
    title: "Try Out Ujian Nasional Ke-1",
    date: new Date("2024-11-20"),
    location: "Ruang Kelas IX",
    content: "Try Out pertama untuk kelas IX akan dilaksanakan minggu depan.",
    priority: "HIGH" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-ann-13",
    title: "Bazar Kewirausahaan Siswa",
    date: new Date("2024-05-20"),
    location: "Halaman Sekolah",
    content: "Siswa kelas VIII akan mengadakan bazar makanan dan kerajinan tangan.",
    priority: "MEDIUM" as PriorityLevel,
    linkFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Expanded Mock Activities for Full Academic Calendar
export const MOCK_ACTIVITIES: SchoolActivity[] = [
  // SEMESTER GANJIL (Juli - Desember)
  {
    id: "act-ganjil-1",
    title: "Masa Pengenalan Lingkungan Sekolah (MPLS)",
    date: new Date("2025-07-15"),
    information: "Kegiatan pengenalan lingkungan sekolah bagi siswa baru kelas VII.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-2",
    title: "Upacara Hari Kemerdekaan RI",
    date: new Date("2025-08-17"),
    information: "Upacara bendera memperingati HUT Kemerdekaan RI ke-80 di lapangan sekolah.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-3",
    title: "Penilaian Tengah Semester (PTS) Ganjil",
    date: new Date("2025-09-23"),
    information: "Pelaksanaan PTS Ganjil untuk seluruh jenjang kelas.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-4",
    title: "Peringatan Bulan Bahasa",
    date: new Date("2025-10-28"),
    information: "Lomba baca puisi, pidato, dan mading dalam rangka Bulan Bahasa.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-5",
    title: "Peringatan Hari Guru Nasional",
    date: new Date("2025-11-25"),
    information: "Upacara dan apresiasi untuk guru oleh OSIS.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-osis-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-6",
    title: "Penilaian Akhir Semester (PAS) Ganjil",
    date: new Date("2025-12-02"),
    information: "Ujian akhir semester ganjil untuk menentukan nilai rapor semester 1.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-7",
    title: "Class Meeting",
    date: new Date("2025-12-16"),
    information: "Perlombaan olahraga dan seni antar kelas setelah PAS.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-osis-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-8",
    title: "Pembagian Rapor Semester Ganjil",
    date: new Date("2025-12-20"),
    information: "Penyerahan hasil belajar siswa kepada orang tua/wali.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // SEMESTER GENAP (Januari - Juni)
  {
    id: "act-genap-1",
    title: "Hari Pertama Masuk Sekolah Semester Genap",
    date: new Date("2026-01-06"),
    information: "Awal kegiatan belajar mengajar semester genap.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-2",
    title: "Peringatan Isra Mi'raj",
    date: new Date("2026-01-27"),
    information: "Kegiatan keagamaan memperingati Isra Mi'raj Nabi Muhammad SAW.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-3",
    title: "Penilaian Tengah Semester (PTS) Genap",
    date: new Date("2026-03-10"),
    information: "Evaluasi tengah semester genap.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-4",
    title: "Pesantren Kilat Ramadhan",
    date: new Date("2026-03-15"),
    information: "Kegiatan pendalaman agama Islam selama bulan Ramadhan.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-5",
    title: "Ujian Sekolah (Kelas IX)",
    date: new Date("2026-05-12"),
    information: "Ujian akhir kelulusan bagi siswa kelas IX.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-6",
    title: "Penilaian Akhir Tahun (PAT)",
    date: new Date("2026-06-09"),
    information: "Ujian kenaikan kelas untuk kelas VII dan VIII.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-7",
    title: "Wisuda Pelepasan Siswa Kelas IX",
    date: new Date("2026-06-21"),
    information: "Acara perpisahan dan wisuda siswa kelas IX.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-8",
    title: "Pembagian Rapor Kenaikan Kelas",
    date: new Date("2026-06-27"),
    information: "Penyerahan rapor semester genap dan pengumuman kenaikan kelas.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2025/2026",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Serialization Helper Types
export type SerializableNews = Omit<News, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializableAnnouncement = Omit<Announcement, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializableActivity = Omit<SchoolActivity, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};


export function serializeNews(news: News[]): SerializableNews[] {
  return news.map(item => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export function serializeAnnouncements(items: Announcement[]): SerializableAnnouncement[] {
  return items.map(item => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export function serializeActivities(items: SchoolActivity[]): SerializableActivity[] {
  return items.map(item => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}


/**
 * Fetches the latest 3 approved news items.
 * Falls back to mock data if database connection fails.
 */
export async function getLatestNews(): Promise<SerializableNews[]> {
  try {
    const news = await prisma.news.findMany({
      where: {
        statusPersetujuan: "APPROVED",
      },
      orderBy: {
        date: "desc",
      },
      take: 3,
    });

    const result = news.length === 0 ? MOCK_NEWS : news;
    return serializeNews(result);
  } catch (error) {
    console.warn("Database connection failed, using mock data for News:", error);
    return serializeNews(MOCK_NEWS);
  }
}

/**
 * Fetches upcoming announcements.
 */
export async function getUpcomingAnnouncements(): Promise<SerializableAnnouncement[]> {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        date: "desc", // Most recent first
      },
      take: 3,
    });

    // Ensure we only return 3 items even if falling back to mock data
    const result = announcements.length === 0
      ? MOCK_ANNOUNCEMENTS.slice(0, 3)
      : announcements;

    return serializeAnnouncements(result);
  } catch (error) {
    console.warn("Database connection failed, using mock data for Announcements:", error);
    return serializeAnnouncements(MOCK_ANNOUNCEMENTS.slice(0, 3));
  }
}

/**
 * Fetches upcoming school activities (events).
 */
export async function getUpcomingActivities(): Promise<SerializableActivity[]> {
  try {
    const today = new Date();
    // Reset time to beginning of day to include events happening today
    today.setHours(0, 0, 0, 0);

    const activities = await prisma.schoolActivity.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 3,
    });

    // Filtering logic for mock data fallback
    const result = activities.length > 0
      ? activities
      : MOCK_ACTIVITIES
          .filter(activity => activity.date >= today)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 3);

    return serializeActivities(result);
  } catch (error) {
    console.warn("Database connection failed, using mock data for Activities:", error);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = MOCK_ACTIVITIES
      .filter(activity => activity.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
    return serializeActivities(result);
  }
}
