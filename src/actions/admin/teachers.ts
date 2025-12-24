"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { TeacherCategory } from "@prisma/client";
import { getJWTSecret, JWT_CONFIG } from "@/lib/jwt";

// Schema validation untuk teacher
const TeacherSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  position: z.string().min(1, "Jabatan wajib diisi"),
  category: z.enum(["PIMPINAN", "GURU_MAPEL", "STAFF"]),
  photo: z.string().optional(),
  subject: z.string().optional(),
  description: z.string().optional(),
  experience: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type TeacherInput = z.infer<typeof TeacherSchema>;

export interface TeacherData {
  id: string;
  name: string;
  position: string;
  category: TeacherCategory;
  photo: string | null;
  subject: string | null;
  description: string | null;
  experience: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper untuk verify admin role
async function verifyAdminRole(): Promise<{
  success: boolean;
  error?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_CONFIG.COOKIE_NAME)?.value;

  if (!token) {
    return { success: false, error: "Unauthorized: No token found" };
  }

  try {
    const { payload } = await jwtVerify(token, getJWTSecret());

    if (payload.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized: Invalid token" };
  }
}

/**
 * Get all teachers
 */
export async function getTeachers(): Promise<{
  success: boolean;
  data?: TeacherData[];
  error?: string;
}> {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return {
      success: true,
      data: teachers,
    };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return {
      success: false,
      error: "Gagal mengambil data guru",
    };
  }
}

/**
 * Get teacher by ID
 */
export async function getTeacherById(id: string): Promise<{
  success: boolean;
  data?: TeacherData;
  error?: string;
}> {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    return {
      success: true,
      data: teacher,
    };
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return {
      success: false,
      error: "Gagal mengambil data guru",
    };
  }
}

/**
 * Create new teacher
 */
export async function createTeacher(input: TeacherInput): Promise<{
  success: boolean;
  data?: TeacherData;
  message?: string;
  error?: string;
}> {
  // Verify admin access
  const authCheck = await verifyAdminRole();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  // Validate input
  const validation = TeacherSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  try {
    // Get max sortOrder for new teacher
    const maxSortOrder = await prisma.teacher.aggregate({
      _max: { sortOrder: true },
    });

    const teacher = await prisma.teacher.create({
      data: {
        name: validation.data.name,
        position: validation.data.position,
        category: validation.data.category as TeacherCategory,
        photo: validation.data.photo || null,
        subject: validation.data.subject || null,
        description: validation.data.description || null,
        experience: validation.data.experience || null,
        sortOrder:
          validation.data.sortOrder ?? (maxSortOrder._max.sortOrder || 0) + 1,
        isActive: validation.data.isActive ?? true,
      },
    });

    // Revalidate paths
    revalidatePath("/profile/guru");
    revalidatePath("/profile/struktur-organisasi");
    revalidatePath("/dashboard-admin/teachers");

    return {
      success: true,
      data: teacher,
      message: "Guru berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return {
      success: false,
      error: "Gagal menambahkan guru",
    };
  }
}

/**
 * Update teacher
 */
export async function updateTeacher(
  id: string,
  input: Partial<TeacherInput>
): Promise<{
  success: boolean;
  data?: TeacherData;
  message?: string;
  error?: string;
}> {
  // Verify admin access
  const authCheck = await verifyAdminRole();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        name: input.name ?? existingTeacher.name,
        position: input.position ?? existingTeacher.position,
        category:
          (input.category as TeacherCategory) ?? existingTeacher.category,
        photo: input.photo !== undefined ? input.photo : existingTeacher.photo,
        subject:
          input.subject !== undefined ? input.subject : existingTeacher.subject,
        description:
          input.description !== undefined
            ? input.description
            : existingTeacher.description,
        experience:
          input.experience !== undefined
            ? input.experience
            : existingTeacher.experience,
        sortOrder: input.sortOrder ?? existingTeacher.sortOrder,
        isActive: input.isActive ?? existingTeacher.isActive,
      },
    });

    // Revalidate paths
    revalidatePath("/profile/guru");
    revalidatePath("/profile/struktur-organisasi");
    revalidatePath("/dashboard-admin/teachers");

    return {
      success: true,
      data: teacher,
      message: "Data guru berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating teacher:", error);
    return {
      success: false,
      error: "Gagal memperbarui data guru",
    };
  }
}

/**
 * Delete teacher
 */
export async function deleteTeacher(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  // Verify admin access
  const authCheck = await verifyAdminRole();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    await prisma.teacher.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/profile/guru");
    revalidatePath("/profile/struktur-organisasi");
    revalidatePath("/dashboard-admin/teachers");

    return {
      success: true,
      message: "Guru berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return {
      success: false,
      error: "Gagal menghapus guru",
    };
  }
}

/**
 * Toggle teacher active status
 */
export async function toggleTeacherStatus(id: string): Promise<{
  success: boolean;
  data?: TeacherData;
  message?: string;
  error?: string;
}> {
  // Verify admin access
  const authCheck = await verifyAdminRole();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        isActive: !existingTeacher.isActive,
      },
    });

    // Revalidate paths
    revalidatePath("/profile/guru");
    revalidatePath("/profile/struktur-organisasi");
    revalidatePath("/dashboard-admin/teachers");

    return {
      success: true,
      data: teacher,
      message: teacher.isActive ? "Guru diaktifkan" : "Guru dinonaktifkan",
    };
  } catch (error) {
    console.error("Error toggling teacher status:", error);
    return {
      success: false,
      error: "Gagal mengubah status guru",
    };
  }
}

/**
 * Reorder teachers (update sortOrder)
 */
export async function reorderTeachers(reorderedIds: string[]): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  // Verify admin access
  const authCheck = await verifyAdminRole();
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Update each teacher's sortOrder based on position in array
    await Promise.all(
      reorderedIds.map((id, index) =>
        prisma.teacher.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    // Revalidate paths
    revalidatePath("/profile/guru");
    revalidatePath("/profile/struktur-organisasi");
    revalidatePath("/dashboard-admin/teachers");

    return {
      success: true,
      message: "Urutan guru berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error reordering teachers:", error);
    return {
      success: false,
      error: "Gagal mengubah urutan guru",
    };
  }
}
