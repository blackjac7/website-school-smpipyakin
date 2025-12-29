"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Announcement, PriorityLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";

// Validation schemas
const CreateAnnouncementSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  content: z.string().min(10, "Konten minimal 10 karakter"),
  date: z.coerce.date(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  author: z.string().optional(),
});

const IdSchema = z.string().uuid("Invalid announcement ID");

// Helper to verify admin role
async function verifyAdminRole() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
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
  author?: string;
}) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  // Validate input
  const validation = CreateAnnouncementSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const { title, content, date, priority } = validation.data;

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

export async function updateAnnouncement(
  id: string,
  data: Partial<Announcement>
) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  // Validate ID
  const idValidation = IdSchema.safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: idValidation.error.issues[0].message };
  }

  try {
    const announcement = await prisma.announcement.update({
      where: { id: idValidation.data },
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

  // Validate ID
  const idValidation = IdSchema.safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: idValidation.error.issues[0].message };
  }

  try {
    await prisma.announcement.delete({
      where: { id: idValidation.data },
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
