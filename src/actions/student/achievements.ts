"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { isSiswaRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";

// Validation schemas
const CreateAchievementSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .default(""),
  category: z.string().min(1, "Kategori wajib dipilih"),
  level: z.string().min(1, "Tingkat wajib dipilih"),
  achievementDate: z.string().optional(),
  image: z.string().optional(),
});

const UpdateAchievementSchema = CreateAchievementSchema.extend({
  id: z.string().uuid("Invalid achievement ID"),
});

const IdSchema = z.string().uuid("Invalid achievement ID");

export type AchievementData = {
  id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  category: string;
  level: string;
  date: string;
  createdAt: string;
};

export type AchievementInput = z.infer<typeof CreateAchievementSchema>;

// Helper to verify student role
async function verifyStudentRole() {
  const user = await getAuthenticatedUser();
  if (!user || !isSiswaRole(user.role)) {
    return {
      authorized: false,
      error: "Unauthorized: Student access required",
    };
  }
  return { authorized: true, user };
}

// Format date for display
function formatAchievementDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get student achievements
 */
export async function getStudentAchievements(): Promise<{
  success: boolean;
  data: AchievementData[];
  error?: string;
}> {
  try {
    const auth = await verifyStudentRole();
    if (!auth.authorized) {
      return { success: false, data: [], error: auth.error };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, data: [], error: "Student not found" };
    }

    const achievements = await prisma.studentAchievement.findMany({
      where: { siswaId: student.id },
      orderBy: { createdAt: "desc" },
    });

    const formattedAchievements: AchievementData[] = achievements.map(
      (achievement) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description || "",
        image: achievement.image || "",
        status: achievement.statusPersetujuan.toLowerCase(),
        category: achievement.category || "",
        level: achievement.level || "",
        date: formatAchievementDate(achievement.achievementDate),
        createdAt: achievement.createdAt.toISOString(),
      })
    );

    return { success: true, data: formattedAchievements };
  } catch (error) {
    console.error("getStudentAchievements error:", error);
    return { success: false, data: [], error: "Failed to fetch achievements" };
  }
}

/**
 * Create new achievement
 */
export async function createAchievement(data: AchievementInput): Promise<{
  success: boolean;
  data?: AchievementData;
  error?: string;
  message?: string;
}> {
  try {
    const auth = await verifyStudentRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    // Validate input
    const validation = CreateAchievementSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Check pending limit
    const pendingAchievements = await prisma.studentAchievement.count({
      where: {
        siswaId: student.id,
        statusPersetujuan: "PENDING",
      },
    });

    if (pendingAchievements >= 2) {
      return {
        success: false,
        error: "Limit reached",
        message:
          "Anda sudah memiliki 2 prestasi yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah prestasi baru.",
      };
    }

    const { title, description, category, level, achievementDate, image } =
      validation.data;

    const achievement = await prisma.studentAchievement.create({
      data: {
        siswaId: student.id,
        title,
        description,
        category,
        level,
        achievementDate: achievementDate ? new Date(achievementDate) : null,
        image,
        statusPersetujuan: "PENDING",
      },
    });

    const formattedAchievement: AchievementData = {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description || "",
      image: achievement.image || "",
      status: achievement.statusPersetujuan.toLowerCase(),
      category: achievement.category || "",
      level: achievement.level || "",
      date: formatAchievementDate(achievement.achievementDate),
      createdAt: achievement.createdAt.toISOString(),
    };

    revalidatePath("/dashboard-siswa");
    return { success: true, data: formattedAchievement };
  } catch (error) {
    console.error("createAchievement error:", error);
    return { success: false, error: "Failed to create achievement" };
  }
}

/**
 * Update achievement
 */
export async function updateAchievement(
  data: z.infer<typeof UpdateAchievementSchema>
): Promise<{
  success: boolean;
  data?: AchievementData;
  error?: string;
}> {
  try {
    const auth = await verifyStudentRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    // Validate input
    const validation = UpdateAchievementSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Check if achievement belongs to student
    const existingAchievement = await prisma.studentAchievement.findFirst({
      where: {
        id: validation.data.id,
        siswaId: student.id,
      },
    });

    if (!existingAchievement) {
      return { success: false, error: "Achievement not found" };
    }

    if (existingAchievement.statusPersetujuan === "APPROVED") {
      return { success: false, error: "Cannot modify approved achievements" };
    }

    const { id, title, description, category, level, achievementDate, image } =
      validation.data;

    const updatedAchievement = await prisma.studentAchievement.update({
      where: { id },
      data: {
        title,
        description,
        category,
        level,
        achievementDate: achievementDate ? new Date(achievementDate) : null,
        image,
        statusPersetujuan: "PENDING",
      },
    });

    const formattedAchievement: AchievementData = {
      id: updatedAchievement.id,
      title: updatedAchievement.title,
      description: updatedAchievement.description || "",
      image: updatedAchievement.image || "",
      status: updatedAchievement.statusPersetujuan.toLowerCase(),
      category: updatedAchievement.category || "",
      level: updatedAchievement.level || "",
      date: formatAchievementDate(updatedAchievement.achievementDate),
      createdAt: updatedAchievement.createdAt.toISOString(),
    };

    revalidatePath("/dashboard-siswa");
    return { success: true, data: formattedAchievement };
  } catch (error) {
    console.error("updateAchievement error:", error);
    return { success: false, error: "Failed to update achievement" };
  }
}

/**
 * Delete achievement
 */
export async function deleteAchievement(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await verifyStudentRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    // Validate ID
    const idValidation = IdSchema.safeParse(id);
    if (!idValidation.success) {
      return { success: false, error: idValidation.error.issues[0].message };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const existingAchievement = await prisma.studentAchievement.findFirst({
      where: { id: idValidation.data, siswaId: student.id },
    });

    if (!existingAchievement) {
      return { success: false, error: "Achievement not found" };
    }

    if (existingAchievement.statusPersetujuan === "APPROVED") {
      return { success: false, error: "Cannot delete approved achievement" };
    }

    await prisma.studentAchievement.delete({
      where: { id: idValidation.data },
    });

    revalidatePath("/dashboard-siswa");
    return { success: true };
  } catch (error) {
    console.error("deleteAchievement error:", error);
    return { success: false, error: "Failed to delete achievement" };
  }
}
