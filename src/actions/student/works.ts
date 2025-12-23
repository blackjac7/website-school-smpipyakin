"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    const { title, description, workType, mediaUrl, videoLink, category, subject } = data;

    // Validation
    if (!title || !workType || !category) {
      return { success: false, error: "Missing required fields" };
    }

    const normalizedWorkType = workType.toLowerCase();
    if (!["photo", "video"].includes(normalizedWorkType)) {
      return { success: false, error: "Invalid workType" };
    }

    if (normalizedWorkType === "photo" && !mediaUrl) {
      return { success: false, error: "Image is required for photo works" };
    }

    if (normalizedWorkType === "video" && !videoLink) {
      return { success: false, error: "Video link is required for video works" };
    }

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
        workType: normalizedWorkType.toUpperCase() as "PHOTO" | "VIDEO",
        mediaUrl: normalizedWorkType === "photo" ? mediaUrl : null,
        videoLink: normalizedWorkType === "video" ? videoLink : null,
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

    if (!id) return { success: false, error: "ID required" };

    const student = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const existingWork = await prisma.studentWork.findFirst({
      where: { id, siswaId: student.id },
    });

    if (!existingWork) {
      return { success: false, error: "Work not found" };
    }

    if (existingWork.statusPersetujuan === "APPROVED") {
      return { success: false, error: "Cannot edit approved work" };
    }

    const normalizedWorkType = data.workType?.toLowerCase();

    await prisma.studentWork.update({
      where: { id },
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

    const student = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const existingWork = await prisma.studentWork.findFirst({
      where: { id, siswaId: student.id },
    });

    if (!existingWork) {
      return { success: false, error: "Work not found" };
    }

    if (existingWork.statusPersetujuan === "APPROVED") {
      return { success: false, error: "Cannot delete approved work" };
    }

    await prisma.studentWork.delete({
      where: { id },
    });

    revalidatePath("/dashboard-siswa");
    return { success: true };
  } catch (error) {
    console.error("deleteWork error:", error);
    return { success: false, error: "Failed to delete work" };
  }
}
