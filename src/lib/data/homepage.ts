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

export const MOCK_ACTIVITIES: SchoolActivity[] = [
  {
    id: "mock-act-1",
    title: "Pekan Olahraga dan Seni",
    date: new Date("2024-11-20"),
    information: "Kegiatan tahunan pekan olahraga dan seni untuk seluruh siswa.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-admin-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-act-2",
    title: "Bakti Sosial OSIS",
    date: new Date("2024-12-05"),
    information: "Kegiatan bakti sosial yang diselenggarakan oleh OSIS.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-osis-id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-act-3",
    title: "Seminar Anti-Bullying",
    date: new Date("2024-08-15"),
    information: "Seminar wajib bagi seluruh siswa kelas VII.",
    semester: "GANJIL" as SemesterType,
    tahunPelajaran: "2024/2025",
    createdBy: "mock-kesiswaan-id",
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
