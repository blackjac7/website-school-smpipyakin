"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Validation schemas
const WorkInputSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100, "Judul maksimal 100 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional().default(""),
  workType: z.enum(["photo", "video", "PHOTO", "VIDEO"]).transform(v => v.toLowerCase()),
  mediaUrl: z.string().optional().default(""),
  videoLink: z.string().optional().default(""),
  category: z.string().min(1, "Kategori wajib dipilih"),
  subject: z.string().optional().default(""),
}).refine((data) => {
  const workType = data.workType.toLowerCase();
  if (workType === "photo" && !data.mediaUrl) {
    return false;
  }
  if (workType === "video" && !data.videoLink) {
    return false;
  }
  return true;
}, {
  message: "Foto diperlukan untuk tipe foto, atau link video untuk tipe video",
});

const IdSchema = z.string().uuid("Invalid work ID");

export type WorkInput = {
  title: string;
  description: string;
  workType: string;
  mediaUrl: string;
  videoLink: string;
  category: string;
  subject: string;
};

export async function getStudentWorks() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "siswa") {
      return { success: false, error: "Unauthorized" };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const works = await prisma.studentWork.findMany({
      where: { siswaId: student.id },
      orderBy: { createdAt: "desc" },
    });

    // Transform dates to strings to avoid serialization issues
    const formattedWorks = works.map((work) => ({
      ...work,
      workType: work.workType.toLowerCase(),
      status: work.statusPersetujuan.toLowerCase(),
      createdAt: work.createdAt.toISOString(),
      updatedAt: work.updatedAt.toISOString(),
      // Ensure nulls are handled (though standard prisma return usually handles this,
      // explicitly mapping helps Client Components)
      description: work.description || "",
      mediaUrl: work.mediaUrl || "",
      videoLink: work.videoLink || "",
      category: work.category || "",
      subject: work.subject || "",
      rejectionNote: work.rejectionNote || "",
    }));

    return { success: true, data: formattedWorks };
  } catch (error) {
    console.error("getStudentWorks error:", error);
    return { success: false, error: "Failed to fetch works" };
  }
}

export async function createWork(data: WorkInput) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "siswa") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input with Zod
    const validation = WorkInputSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { title, description, workType, mediaUrl, videoLink, category, subject } = validation.data;

    const student = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Check limit
    const pendingWorks = await prisma.studentWork.count({
      where: {
        siswaId: student.id,
        statusPersetujuan: "PENDING",
      },
    });

    if (pendingWorks >= 2) {
      return { success: false, error: "Limit reached", message: "Maksimal 2 karya pending." };
    }

    await prisma.studentWork.create({
      data: {
        siswaId: student.id,
        title,
        description,
        workType: workType.toUpperCase() as "PHOTO" | "VIDEO",
        mediaUrl: workType === "photo" ? mediaUrl : null,
        videoLink: workType === "video" ? videoLink : null,
        category,
        subject,
        statusPersetujuan: "PENDING",
      },
    });

    revalidatePath("/dashboard-siswa");
    return { success: true };
  } catch (error) {
    console.error("createWork error:", error);
    return { success: false, error: "Failed to create work" };
  }
}

export async function updateWork(id: string, data: Partial<WorkInput>) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "siswa") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate ID
    const idValidation = IdSchema.safeParse(id);
    if (!idValidation.success) {
      return { success: false, error: idValidation.error.issues[0].message };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const existingWork = await prisma.studentWork.findFirst({
      where: { id: idValidation.data, siswaId: student.id },
    });

    if (!existingWork) {
      return { success: false, error: "Work not found" };
    }

    if (existingWork.statusPersetujuan === "APPROVED") {
      return { success: false, error: "Cannot edit approved work" };
    }

    const normalizedWorkType = data.workType?.toLowerCase();

    await prisma.studentWork.update({
      where: { id: idValidation.data },
      data: {
        title: data.title,
        description: data.description,
        workType: normalizedWorkType ? (normalizedWorkType.toUpperCase() as "PHOTO" | "VIDEO") : undefined,
        mediaUrl: normalizedWorkType === "photo" ? data.mediaUrl : (data.workType ? null : undefined),
        videoLink: normalizedWorkType === "video" ? data.videoLink : (data.workType ? null : undefined),
        category: data.category,
        subject: data.subject,
        statusPersetujuan: "PENDING",
      },
    });

    revalidatePath("/dashboard-siswa");
    return { success: true };
  } catch (error) {
    console.error("updateWork error:", error);
    return { success: false, error: "Failed to update work" };
  }
}

export async function deleteWork(id: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "siswa") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate ID
    const idValidation = IdSchema.safeParse(id);
    if (!idValidation.success) {
      return { success: false, error: idValidation.error.issues[0].message };
    }

    const student = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const existingWork = await prisma.studentWork.findFirst({
      where: { id: idValidation.data, siswaId: student.id },
    });

    if (!existingWork) {
      return { success: false, error: "Work not found" };
    }

    if (existingWork.statusPersetujuan === "APPROVED") {
      return { success: false, error: "Cannot delete approved work" };
    }

    await prisma.studentWork.delete({
      where: { id: idValidation.data },
    });

    revalidatePath("/dashboard-siswa");
    return { success: true };
  } catch (error) {
    console.error("deleteWork error:", error);
    return { success: false, error: "Failed to delete work" };
  }
}
