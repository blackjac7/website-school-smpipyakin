"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export type DashboardActivity = {
  id: string;
  type: "USER" | "NEWS" | "ANNOUNCEMENT";
  title: string;
  description: string;
  date: Date;
  status?: string;
  user?: string;
};

export type DashboardStats = {
  counts: {
    users: number;
    admins: number;
    teachers: number;
    students: number; // Total Siswa records
    news: number;
    announcements: number;
    facilities: number;
    extracurriculars: number;
  };
  recentActivities: DashboardActivity[];
};

export async function getAdminDashboardStats(): Promise<{
  success: boolean;
  error?: string;
  data?: DashboardStats;
}> {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // 1. Fetch Counts in Parallel
    const [
      usersCount,
      adminsCount,
      teachersCount,
      studentsCount,
      newsCount,
      announcementsCount,
      facilitiesCount,
      extracurricularsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.teacher.count(), // Using Teacher model
      prisma.siswa.count(),
      prisma.news.count(),
      prisma.announcement.count(),
      prisma.facility.count(),
      prisma.extracurricular.count(),
    ]);

    // 2. Fetch Recent Items to build "Activity Feed"
    const [recentUsers, recentNews, recentAnnouncements] =
      await Promise.all([
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, username: true, role: true, createdAt: true },
        }),
        prisma.news.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            statusPersetujuan: true,
            createdAt: true,
            author: { select: { username: true } },
          },
        }),
        prisma.announcement.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, priority: true, createdAt: true },
        }),
      ]);

    // 3. Normalize and Merge Activities
    const activities: DashboardActivity[] = [
      ...recentUsers.map((u) => ({
        id: u.id,
        type: "USER" as const,
        title: "User Baru Terdaftar",
        description: `${u.username} (${u.role})`,
        date: u.createdAt,
        status: "ACTIVE",
      })),
      ...recentNews.map((n) => ({
        id: n.id,
        type: "NEWS" as const,
        title: n.title,
        description: `Oleh: ${n.author.username}`,
        date: n.createdAt,
        status: n.statusPersetujuan,
      })),
      ...recentAnnouncements.map((a) => ({
        id: a.id,
        type: "ANNOUNCEMENT" as const,
        title: "Pengumuman Baru",
        description: `${a.title} (${a.priority})`,
        date: a.createdAt,
        status: "PUBLISHED",
      })),
    ];

    // Sort by date descending and take top 10
    const sortedActivities = activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return {
      success: true,
      data: {
        counts: {
          users: usersCount,
          admins: adminsCount,
          teachers: teachersCount,
          students: studentsCount,
          news: newsCount,
          announcements: announcementsCount,
          facilities: facilitiesCount,
          extracurriculars: extracurricularsCount,
        },
        recentActivities: sortedActivities,
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
    };
  }
}
