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
];

// Expanded Mock Activities for Full Academic Calendar
export const MOCK_ACTIVITIES: SchoolActivity[] = [
  // SEMESTER GANJIL (Juli - Desember)
  {
    id: "act-ganjil-1",
    title: "Masa Pengenalan Lingkungan Sekolah (MPLS)",
    date: new Date("2024-07-15"),
    information: "Kegiatan pengenalan lingkungan sekolah bagi siswa baru kelas VII.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-2",
    title: "Upacara Hari Kemerdekaan RI",
    date: new Date("2024-08-17"),
    information: "Upacara bendera memperingati HUT Kemerdekaan RI ke-79 di lapangan sekolah.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-3",
    title: "Penilaian Tengah Semester (PTS) Ganjil",
    date: new Date("2024-09-23"),
    information: "Pelaksanaan PTS Ganjil untuk seluruh jenjang kelas.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-4",
    title: "Peringatan Bulan Bahasa",
    date: new Date("2024-10-28"),
    information: "Lomba baca puisi, pidato, dan mading dalam rangka Bulan Bahasa.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-5",
    title: "Peringatan Hari Guru Nasional",
    date: new Date("2024-11-25"),
    information: "Upacara dan apresiasi untuk guru oleh OSIS.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-osis-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-6",
    title: "Penilaian Akhir Semester (PAS) Ganjil",
    date: new Date("2024-12-02"),
    information: "Ujian akhir semester ganjil untuk menentukan nilai rapor semester 1.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-7",
    title: "Class Meeting",
    date: new Date("2024-12-16"),
    information: "Perlombaan olahraga dan seni antar kelas setelah PAS.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-osis-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-ganjil-8",
    title: "Pembagian Rapor Semester Ganjil",
    date: new Date("2024-12-20"),
    information: "Penyerahan hasil belajar siswa kepada orang tua/wali.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // SEMESTER GENAP (Januari - Juni)
  {
    id: "act-genap-1",
    title: "Hari Pertama Masuk Sekolah Semester Genap",
    date: new Date("2025-01-06"),
    information: "Awal kegiatan belajar mengajar semester genap.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-2",
    title: "Peringatan Isra Mi'raj",
    date: new Date("2025-01-27"),
    information: "Kegiatan keagamaan memperingati Isra Mi'raj Nabi Muhammad SAW.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-3",
    title: "Penilaian Tengah Semester (PTS) Genap",
    date: new Date("2025-03-10"),
    information: "Evaluasi tengah semester genap.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-4",
    title: "Pesantren Kilat Ramadhan",
    date: new Date("2025-03-15"),
    information: "Kegiatan pendalaman agama Islam selama bulan Ramadhan.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-kesiswaan-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-5",
    title: "Ujian Sekolah (Kelas IX)",
    date: new Date("2025-05-12"),
    information: "Ujian akhir kelulusan bagi siswa kelas IX.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-6",
    title: "Penilaian Akhir Tahun (PAT)",
    date: new Date("2025-06-09"),
    information: "Ujian kenaikan kelas untuk kelas VII dan VIII.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-7",
    title: "Wisuda Pelepasan Siswa Kelas IX",
    date: new Date("2025-06-21"),
    information: "Acara perpisahan dan wisuda siswa kelas IX.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "act-genap-8",
    title: "Pembagian Rapor Kenaikan Kelas",
    date: new Date("2025-06-27"),
    information: "Penyerahan rapor semester genap dan pengumuman kenaikan kelas.",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2024/2025",
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

    const result = announcements.length === 0 ? MOCK_ANNOUNCEMENTS : announcements;
    return serializeAnnouncements(result);
  } catch (error) {
    console.warn("Database connection failed, using mock data for Announcements:", error);
    return serializeAnnouncements(MOCK_ANNOUNCEMENTS);
  }
}

/**
 * Fetches upcoming school activities (events).
 */
export async function getUpcomingActivities(): Promise<SerializableActivity[]> {
  try {
    const activities = await prisma.schoolActivity.findMany({
      orderBy: {
        date: "asc",
      },
      take: 3,
    });

    const result = activities.length === 0 ? MOCK_ACTIVITIES : activities;
    return serializeActivities(result);
  } catch (error) {
    console.warn("Database connection failed, using mock data for Activities:", error);
    return serializeActivities(MOCK_ACTIVITIES);
  }
}
