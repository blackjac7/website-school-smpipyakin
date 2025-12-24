"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Validation schemas
const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").optional(),
  class: z.string().optional(),
  year: z.coerce.number().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  profileImage: z.string().optional(),
});

export type ProfileData = {
  id: string;
  name: string;
  class: string;
  year: string;
  nisn: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  parentName: string;
  parentPhone: string;
  profileImage: string;
  username: string;
  gender: string | null;
};

// Helper to verify student role
async function verifyStudentRole() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "siswa") {
    return {
      authorized: false,
      error: "Unauthorized: Student access required",
    };
  }
  return { authorized: true, user };
}

/**
 * Get student profile data
 */
export async function getStudentProfile(): Promise<{
  success: boolean;
  data?: ProfileData;
  error?: string;
}> {
  try {
    const auth = await verifyStudentRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: auth.user!.userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Student profile not found" };
    }

    const profileData: ProfileData = {
      id: student.id,
      name: student.name || "",
      class: student.class || "",
      year: student.year?.toString() || "",
      nisn: student.nisn || "",
      email: student.email || student.user.email || "",
      phone: student.phone || "",
      address: student.address || "",
      birthDate: student.birthDate?.toISOString().split("T")[0] || "",
      birthPlace: student.birthPlace || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      profileImage: student.image || "",
      username: student.user.username,
      gender: student.gender,
    };

    return { success: true, data: profileData };
  } catch (error) {
    console.error("getStudentProfile error:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  data: Partial<z.infer<typeof UpdateProfileSchema>>
): Promise<{
  success: boolean;
  data?: ProfileData;
  error?: string;
}> {
  try {
    const auth = await verifyStudentRole();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    // Validate input
    const validation = UpdateProfileSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const {
      name,
      class: classValue,
      year,
      email,
      phone,
      address,
      birthDate,
      birthPlace,
      parentName,
      parentPhone,
      profileImage,
    } = validation.data;

    const updatedStudent = await prisma.siswa.update({
      where: { userId: auth.user!.userId },
      data: {
        name,
        class: classValue,
        year: year || null,
        email,
        phone,
        address,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace,
        parentName,
        parentPhone,
        image: profileImage,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    const profileData: ProfileData = {
      id: updatedStudent.id,
      name: updatedStudent.name || "",
      class: updatedStudent.class || "",
      year: updatedStudent.year?.toString() || "",
      nisn: updatedStudent.nisn || "",
      email: updatedStudent.email || updatedStudent.user.email || "",
      phone: updatedStudent.phone || "",
      address: updatedStudent.address || "",
      birthDate: updatedStudent.birthDate?.toISOString().split("T")[0] || "",
      birthPlace: updatedStudent.birthPlace || "",
      parentName: updatedStudent.parentName || "",
      parentPhone: updatedStudent.parentPhone || "",
      profileImage: updatedStudent.image || "",
      username: updatedStudent.user.username,
      gender: updatedStudent.gender,
    };

    revalidatePath("/dashboard-siswa");
    return { success: true, data: profileData };
  } catch (error) {
    console.error("updateStudentProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
