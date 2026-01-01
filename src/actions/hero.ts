"use server";

import { prisma } from "@/lib/prisma";
import { HeroSlide } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

// Helper to verify admin role
async function verifyAdminRole() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdminRole(user.role)) {
    return { authorized: false, error: "Unauthorized: Admin access required" };
  }
  return { authorized: true, user };
}

export async function getHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return slides;
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
}

export async function createHeroSlide(
  data: Omit<HeroSlide, "id" | "createdAt" | "updatedAt">
) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const slide = await prisma.heroSlide.create({
      data,
    });
    revalidatePath("/");
    revalidatePath("/dashboard-admin/hero");
    return { success: true, data: slide };
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return { success: false, error: "Failed to create slide" };
  }
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlide>) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    revalidatePath("/dashboard-admin/hero");
    return { success: true, data: slide };
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return { success: false, error: "Failed to update slide" };
  }
}

export async function deleteHeroSlide(id: string) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    await prisma.heroSlide.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/dashboard-admin/hero");
    return { success: true };
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return { success: false, error: "Failed to delete slide" };
  }
}
