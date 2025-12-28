"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define schema for validation
const FacilitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Valid image URL is required").nullable().optional().or(z.literal("")),
});

export async function getFacilities() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: facilities };
  } catch (error) {
    console.error("Failed to fetch facilities:", error);
    return { success: false, error: "Failed to fetch facilities" };
  }
}

export async function createFacility(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image: (formData.get("image") as string) || null,
  };

  const validation = FacilitySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Validation failed" };
  }

  try {
    await prisma.facility.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        image: validation.data.image || null,
      },
    });
    revalidatePath("/dashboard-admin/facilities");
    revalidatePath("/facilities"); // Revalidate public page
    return { success: true };
  } catch (error) {
    console.error("Failed to create facility:", error);
    return { success: false, error: "Failed to create facility" };
  }
}

export async function updateFacility(id: string, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image: (formData.get("image") as string) || null,
  };

  const validation = FacilitySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Validation failed" };
  }

  try {
    await prisma.facility.update({
      where: { id },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        image: validation.data.image || null,
      },
    });
    revalidatePath("/dashboard-admin/facilities");
    revalidatePath("/facilities");
    return { success: true };
  } catch (error) {
    console.error("Failed to update facility:", error);
    return { success: false, error: "Failed to update facility" };
  }
}

export async function deleteFacility(id: string) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.facility.delete({
      where: { id },
    });
    revalidatePath("/dashboard-admin/facilities");
    revalidatePath("/facilities");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete facility:", error);
    return { success: false, error: "Failed to delete facility" };
  }
}
