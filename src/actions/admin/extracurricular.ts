"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define schema for validation
const ExtracurricularSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  schedule: z.string().min(1, "Schedule is required"), // e.g., "Senin, 15:00"
  imageUrl: z.string().url("Valid image URL is required").nullable().optional().or(z.literal("")),
  categoryId: z.string().optional(), // If you have categories
});

export async function getExtracurriculars() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const extracurriculars = await prisma.extracurricular.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: extracurriculars };
  } catch (error) {
    console.error("Failed to fetch extracurriculars:", error);
    return { success: false, error: "Failed to fetch extracurriculars" };
  }
}

export async function createExtracurricular(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    schedule: formData.get("schedule") as string,
    imageUrl: (formData.get("imageUrl") as string) || null,
  };

  const validation = ExtracurricularSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    await prisma.extracurricular.create({
      data: {
        name: validation.data.name,
        description: validation.data.description,
        schedule: validation.data.schedule,
        imageUrl: validation.data.imageUrl || null,
      },
    });
    revalidatePath("/dashboard-admin/extracurricular");
    revalidatePath("/extracurricular"); // Revalidate public page
    return { success: true };
  } catch (error) {
    console.error("Failed to create extracurricular:", error);
    return { success: false, error: "Failed to create extracurricular" };
  }
}

export async function updateExtracurricular(id: string, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    schedule: formData.get("schedule") as string,
    imageUrl: (formData.get("imageUrl") as string) || null,
  };

  const validation = ExtracurricularSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    await prisma.extracurricular.update({
      where: { id },
      data: {
        name: validation.data.name,
        description: validation.data.description,
        schedule: validation.data.schedule,
        imageUrl: validation.data.imageUrl || null,
      },
    });
    revalidatePath("/dashboard-admin/extracurricular");
    revalidatePath("/extracurricular");
    return { success: true };
  } catch (error) {
    console.error("Failed to update extracurricular:", error);
    return { success: false, error: "Failed to update extracurricular" };
  }
}

export async function deleteExtracurricular(id: string) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.extracurricular.delete({
      where: { id },
    });
    revalidatePath("/dashboard-admin/extracurricular");
    revalidatePath("/extracurricular");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete extracurricular:", error);
    return { success: false, error: "Failed to delete extracurricular" };
  }
}
