"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function getAdminDashboardStats() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    // Return empty stats or error if not admin
    // In a real app we might throw, but here we just return safe defaults
    return {
      success: false,
      error: "Unauthorized",
      data: {
        users: 0,
        students: 0,
        news: 0,
        announcements: 0,
        facilities: 0,
        extracurriculars: 0
      }
    };
  }

  try {
    // Run queries in parallel for performance
    const [
      usersCount,
      studentsCount,
      newsCount,
      announcementsCount,
      facilitiesCount,
      extracurricularsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.siswa.count(),
      prisma.news.count(),
      prisma.announcement.count(),
      prisma.facility.count(),
      prisma.extracurricular.count() // Note: Schema might use 'Extracurricular' or 'SchoolActivity'
    ]);

    return {
      success: true,
      data: {
        users: usersCount,
        students: studentsCount,
        news: newsCount,
        announcements: announcementsCount,
        facilities: facilitiesCount,
        extracurriculars: extracurricularsCount
      }
    };
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
      data: {
        users: 0,
        students: 0,
        news: 0,
        announcements: 0,
        facilities: 0,
        extracurriculars: 0
      }
    };
  }
}
