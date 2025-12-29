"use server";

import { prisma } from "@/lib/prisma";
import { SchoolStat } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";

// Helper to verify admin role
async function verifyAdminRole() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return { authorized: false, error: "Unauthorized: Admin access required" };
  }
  return { authorized: true, user };
}

export async function getSchoolStats() {
  try {
    const stats = await prisma.schoolStat.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return [];
  }
}

export async function createSchoolStat(
  data: Omit<SchoolStat, "id" | "createdAt" | "updatedAt">
) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const stat = await prisma.schoolStat.create({
      data,
    });
    revalidatePath("/");
    revalidatePath("/dashboard-admin/stats");
    return { success: true, data: stat };
  } catch (error) {
    console.error("Error creating stat:", error);
    return { success: false, error: "Failed to create stat" };
  }
}

export async function updateSchoolStat(id: string, data: Partial<SchoolStat>) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const stat = await prisma.schoolStat.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    revalidatePath("/dashboard-admin/stats");
    return { success: true, data: stat };
  } catch (error) {
    console.error("Error updating stat:", error);
    return { success: false, error: "Failed to update stat" };
  }
}

export async function deleteSchoolStat(id: string) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    await prisma.schoolStat.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/dashboard-admin/stats");
    return { success: true };
  } catch (error) {
    console.error("Error deleting stat:", error);
    return { success: false, error: "Failed to delete stat" };
  }
}
