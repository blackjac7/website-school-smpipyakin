"use server";

import { prisma } from "@/lib/prisma";
import { StatusApproval, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NotificationService } from "@/lib/notificationService";
import { getAuthenticatedUser } from "@/lib/auth";
import { isRoleMatch } from "@/lib/roles";

// Helper to verify kesiswaan role
async function verifyKesiswaanRole() {
  const user = await getAuthenticatedUser();
  if (!user || !isRoleMatch(user.role, ["kesiswaan", "admin"])) {
    return {
      authorized: false,
      error: "Unauthorized: Kesiswaan access required",
    };
  }
  return { authorized: true, user };
}

// =============================================
// VALIDATION & CONTENT MANAGEMENT
// =============================================

export interface ValidationItem {
  id: string;
  type: "achievement" | "work" | "news";
  title: string;
  description: string | null;
  authorName: string;
  authorClass: string | null;
  date: Date;
  status: StatusApproval;
  category: string | null;
  image?: string | null;
  videoLink?: string | null;
  rejectionNote?: string | null;
}

export interface ValidationQueueResult {
  items: ValidationItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getValidationQueue(
  statusFilter: StatusApproval | "ALL" = "PENDING",
  page: number = 1,
  limit: number = 10
): Promise<ValidationQueueResult> {
  try {
    const whereClause: Prisma.StudentAchievementWhereInput &
      Prisma.StudentWorkWhereInput &
      Prisma.NewsWhereInput = {};
    if (statusFilter !== "ALL") {
      whereClause.statusPersetujuan = statusFilter;
    }

    // Fetch counts for pagination (include news from OSIS)
    const [achievementsCount, worksCount, newsCount] = await Promise.all([
      prisma.studentAchievement.count({ where: whereClause }),
      prisma.studentWork.count({ where: whereClause }),
      prisma.news.count({ where: whereClause }),
    ]);
    const totalCount = achievementsCount + worksCount + newsCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch Achievements, Works, and OSIS News with limit
    // We fetch more than needed to ensure we get enough after combining and sorting
    const fetchLimit = limit * 2;
    const [achievements, works, osisNews] = await Promise.all([
      prisma.studentAchievement.findMany({
        where: whereClause,
        include: {
          siswa: true,
        },
        orderBy: { createdAt: "desc" },
        take: fetchLimit,
      }),
      prisma.studentWork.findMany({
        where: whereClause,
        include: {
          siswa: true,
        },
        orderBy: { createdAt: "desc" },
        take: fetchLimit,
      }),
      prisma.news.findMany({
        where: whereClause,
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
        take: fetchLimit,
      }),
    ]);

    // Normalize and merge
    const normalizedAchievements: ValidationItem[] = achievements.map((a) => ({
      id: a.id,
      type: "achievement",
      title: a.title,
      description: a.description,
      authorName: a.siswa.name || "Unknown",
      authorClass: a.siswa.class,
      date: a.createdAt,
      status: a.statusPersetujuan,
      category: a.category,
      image: a.image,
      rejectionNote: a.rejectionNote,
    }));

    const normalizedWorks: ValidationItem[] = works.map((w) => ({
      id: w.id,
      type: "work",
      title: w.title,
      description: w.description,
      authorName: w.siswa.name || "Unknown",
      authorClass: w.siswa.class,
      date: w.createdAt,
      status: w.statusPersetujuan,
      category: w.workType === "PHOTO" ? "Fotografi" : "Videografi",
      image: w.mediaUrl,
      videoLink: w.videoLink,
      rejectionNote: w.rejectionNote,
    }));

    const normalizedNews: ValidationItem[] = osisNews.map((n) => ({
      id: n.id,
      type: "news",
      title: n.title,
      description: n.content,
      authorName: n.author?.username || "OSIS",
      authorClass: null,
      date: n.createdAt,
      status: n.statusPersetujuan,
      category: n.kategori === "ACHIEVEMENT" ? "Prestasi" : "Kegiatan",
      image: n.image,
      rejectionNote: n.rejectionNote,
    }));

    // Combine, sort by date descending, and paginate
    const allItems = [
      ...normalizedAchievements,
      ...normalizedWorks,
      ...normalizedNews,
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const skip = (page - 1) * limit;
    const items = allItems.slice(skip, skip + limit);

    return {
      items,
      totalCount,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching validation queue:", error);
    return {
      items: [],
      totalCount: 0,
      page: 1,
      limit,
      totalPages: 0,
    };
  }
}

export async function validateContent(
  id: string,
  type: "achievement" | "work" | "news",
  action: "APPROVE" | "REJECT",
  note?: string,
  updatedContent?: { title?: string; description?: string }
) {
  // Verify authorization
  const auth = await verifyKesiswaanRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const status =
      action === "APPROVE" ? StatusApproval.APPROVED : StatusApproval.REJECTED;
    const rejectionNote = action === "REJECT" ? note : null;
    let userId: string | null = null;
    let contentTitle: string = "";

    if (type === "achievement") {
      // Get the achievement with student info for notification
      const achievement = await prisma.studentAchievement.findUnique({
        where: { id },
        include: {
          siswa: { select: { userId: true, name: true, class: true } },
        },
      });

      if (!achievement) {
        return { success: false, error: "Achievement not found" };
      }

      userId = achievement.siswa.userId;
      contentTitle = updatedContent?.title || achievement.title;
      const finalDescription =
        updatedContent?.description || achievement.description;

      // Update achievement with optional content changes
      await prisma.studentAchievement.update({
        where: { id },
        data: {
          statusPersetujuan: status,
          title: contentTitle,
          description: finalDescription,
          rejectionNote,
        },
      });

      // If approved, create a news entry for public display
      if (action === "APPROVE" && auth.user) {
        await prisma.news.create({
          data: {
            title: contentTitle,
            content: `<p><strong>Prestasi Siswa:</strong> ${achievement.siswa.name} (${achievement.siswa.class || "Kelas -"})</p><p>${finalDescription || ""}</p><p><em>Kategori: ${achievement.category || "Prestasi"} | Level: ${achievement.level || "-"}</em></p>`,
            image: achievement.image,
            date: achievement.achievementDate || new Date(),
            kategori: "ACHIEVEMENT",
            statusPersetujuan: StatusApproval.APPROVED,
            authorId: auth.user.userId,
          },
        });
      }

      // Send notification to student
      if (action === "APPROVE") {
        await NotificationService.createAchievementApprovedNotification(
          userId,
          contentTitle,
          id
        );
      } else {
        await NotificationService.createAchievementRejectedNotification(
          userId,
          contentTitle,
          id,
          note
        );
      }
    } else if (type === "work") {
      // Get the work with student info for notification
      const work = await prisma.studentWork.findUnique({
        where: { id },
        include: { siswa: { select: { userId: true } } },
      });

      if (!work) {
        return { success: false, error: "Work not found" };
      }

      userId = work.siswa.userId;
      contentTitle = updatedContent?.title || work.title;
      const finalDescription = updatedContent?.description || work.description;

      await prisma.studentWork.update({
        where: { id },
        data: {
          statusPersetujuan: status,
          title: contentTitle,
          description: finalDescription,
          rejectionNote: action === "REJECT" ? note : null,
        },
      });

      // Send notification to student
      if (action === "APPROVE") {
        await NotificationService.createWorkApprovedNotification(
          userId,
          contentTitle,
          id
        );
      } else {
        await NotificationService.createWorkRejectedNotification(
          userId,
          contentTitle,
          id,
          note
        );
      }
    } else if (type === "news") {
      // Handle OSIS news validation
      const news = await prisma.news.findUnique({
        where: { id },
        include: { author: { select: { id: true } } },
      });

      if (!news) {
        return { success: false, error: "News not found" };
      }

      contentTitle = updatedContent?.title || news.title;
      const finalContent = updatedContent?.description || news.content;

      await prisma.news.update({
        where: { id },
        data: {
          statusPersetujuan: status,
          title: contentTitle,
          content: finalContent,
          rejectionNote,
        },
      });

      // TODO: Send notification to OSIS user when news is approved/rejected
    }

    revalidatePath("/dashboard-kesiswaan");
    revalidatePath("/dashboard-siswa");
    revalidatePath("/dashboard-osis");
    revalidatePath("/news");
    return { success: true };
  } catch (error) {
    console.error("Error validating content:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// =============================================
// STUDENT DATA MANAGEMENT
// =============================================

export async function getStudents(search?: string) {
  try {
    const where: Prisma.SiswaWhereInput = search
      ? {
          OR: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { name: { contains: search, mode: "insensitive" } as any },
            { nisn: { contains: search } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { class: { contains: search, mode: "insensitive" } as any },
          ],
        }
      : {};

    const students = await prisma.siswa.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50, // Limit for performance
    });

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

// =============================================
// DASHBOARD STATS
// =============================================

export interface DashboardStats {
  monthly: Array<{
    month: string;
    validated: number;
    pending: number;
    rejected: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Parallel fetch for basic stats
  const [achievements, works] = await Promise.all([
    prisma.studentAchievement.findMany(),
    prisma.studentWork.findMany(),
  ]);

  const allItems = [
    ...achievements.map((a) => ({ ...a, type: "achievement" })),
    ...works.map((w) => ({ ...w, type: "work" })),
  ];

  // Calculate summary
  const pending = allItems.filter(
    (i) => i.statusPersetujuan === "PENDING"
  ).length;
  const approved = allItems.filter(
    (i) => i.statusPersetujuan === "APPROVED"
  ).length;
  const rejected = allItems.filter(
    (i) => i.statusPersetujuan === "REJECTED"
  ).length;

  // Calculate By Status
  const byStatus = [
    { status: "Disetujui", count: approved, color: "bg-green-500" },
    { status: "Pending", count: pending, color: "bg-yellow-500" },
    { status: "Ditolak", count: rejected, color: "bg-red-500" },
  ];

  // Calculate By Category (simplified)
  const achievementCount = achievements.length;
  const workCount = works.length;
  const total = allItems.length;

  const byCategory = [
    {
      category: "Prestasi Siswa",
      count: achievementCount,
      percentage: total > 0 ? (achievementCount / total) * 100 : 0,
    },
    {
      category: "Karya Siswa",
      count: workCount,
      percentage: total > 0 ? (workCount / total) * 100 : 0,
    },
  ];

  // Calculate Monthly (Mock for now or real aggregation if needed)
  // For simplicity and performance, we'll group the last 6 months in code
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const currentMonth = new Date().getMonth();
  const monthlyStats = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(currentMonth - i);
    const mIndex = d.getMonth();

    // Count items created in this month
    const itemsInMonth = allItems.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate.getMonth() === mIndex &&
        itemDate.getFullYear() === d.getFullYear()
      );
    });

    monthlyStats.push({
      month: months[mIndex],
      validated: itemsInMonth.filter((i) => i.statusPersetujuan === "APPROVED")
        .length,
      pending: itemsInMonth.filter((i) => i.statusPersetujuan === "PENDING")
        .length,
      rejected: itemsInMonth.filter((i) => i.statusPersetujuan === "REJECTED")
        .length,
    });
  }

  return {
    monthly: monthlyStats,
    byCategory,
    byStatus,
    summary: { pending, approved, rejected, total },
  };
}

// =============================================
// DIRECT CONTENT UPLOAD (BY KESISWAAN)
// =============================================

const CreateAchievementSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string(), // ISO date string
  studentId: z.string().uuid(),
  category: z.string().optional(),
  level: z.string().optional(),
});

export async function createAchievementByStaff(formData: FormData) {
  try {
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      studentId: formData.get("studentId"),
      category: formData.get("category"),
      level: formData.get("level"),
    };

    const validated = CreateAchievementSchema.parse(rawData);

    await prisma.studentAchievement.create({
      data: {
        title: validated.title,
        description: validated.description || "",
        siswaId: validated.studentId,
        achievementDate: new Date(validated.date),
        category: validated.category,
        level: validated.level,
        statusPersetujuan: StatusApproval.APPROVED, // Auto-approve since staff created it
      },
    });

    revalidatePath("/dashboard-kesiswaan");
    return { success: true };
  } catch (error) {
    console.error("Error creating achievement:", error);
    return { success: false, error: "Failed to create achievement" };
  }
}
