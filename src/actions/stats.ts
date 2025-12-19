"use server";

import { prisma } from "@/lib/prisma";
import { SchoolStat } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getSchoolStats() {
  try {
    const stats = await prisma.schoolStat.findMany({
      orderBy: { order: "asc" },
    });
    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return [];
  }
}

export async function createStat(data: Omit<SchoolStat, "id" | "createdAt" | "updatedAt">) {
  try {
    const stat = await prisma.schoolStat.create({
      data,
    });
    revalidatePath("/");
    return { success: true, data: stat };
  } catch (error) {
    console.error("Error creating stat:", error);
    return { success: false, error: "Failed to create stat" };
  }
}

export async function updateStat(id: string, data: Partial<SchoolStat>) {
  try {
    const stat = await prisma.schoolStat.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return { success: true, data: stat };
  } catch (error) {
    console.error("Error updating stat:", error);
    return { success: false, error: "Failed to update stat" };
  }
}

export async function deleteStat(id: string) {
  try {
    await prisma.schoolStat.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting stat:", error);
    return { success: false, error: "Failed to delete stat" };
  }
}
