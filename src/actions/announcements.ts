"use server";

import { prisma } from "@/lib/prisma";
import { Announcement, PriorityLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";

// Helper to verify admin role
async function verifyAdminRole() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return { authorized: false, error: "Unauthorized: Admin access required" };
  }
  return { authorized: true, user };
}

export async function getAllAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: "desc" },
    });
    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function getPublishedAnnouncements(limit?: number) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: "desc" },
      take: limit,
    });
    return announcements;
  } catch (error) {
    console.error("Error fetching published announcements:", error);
    return [];
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  date: Date;
  priority: PriorityLevel;
  author?: string; // Optional since schema doesn't use it
}) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { title, content, date, priority } = data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        date,
        priority,
      },
    });
    revalidatePath("/announcements");
    revalidatePath("/");
    revalidatePath("/dashboard-admin/announcements");
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data,
    });
    revalidatePath("/announcements");
    revalidatePath("/");
    revalidatePath("/dashboard-admin/announcements");
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { success: false, error: "Failed to update announcement" };
  }
}

export async function deleteAnnouncement(id: string) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    await prisma.announcement.delete({
      where: { id },
    });
    revalidatePath("/announcements");
    revalidatePath("/");
    revalidatePath("/dashboard-admin/announcements");
    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}
