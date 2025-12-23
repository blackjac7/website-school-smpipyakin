"use server";

import { prisma } from "@/lib/prisma";
import { SchoolActivity, SemesterType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";

// Helper to verify admin/kesiswaan role for calendar management
async function verifyCalendarAccess() {
  const user = await getAuthenticatedUser();
  if (!user || !["admin", "kesiswaan"].includes(user.role)) {
    return { authorized: false, error: "Unauthorized: Admin or Kesiswaan access required" };
  }
  return { authorized: true, user };
}

export async function getAllActivities() {
  try {
    const events = await prisma.schoolActivity.findMany({
      orderBy: { date: "asc" },
    });
    return events;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

export async function getUpcomingEvents(limit?: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await prisma.schoolActivity.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
      take: limit,
    });
    return events;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
}

// Function to map mismatching fields if needed or handle the error properly
export async function createCalendarEvent(data: {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  location?: string;
  category: string;
  semester: SemesterType;
  tahunPelajaran: string;
  isHoliday: boolean;
  createdBy?: string;
}) {
  const auth = await verifyCalendarAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    // Use authenticated user's ID if not provided
    const createdById = data.createdBy || auth.user!.userId;

    const event = await prisma.schoolActivity.create({
      data: {
        title: data.title,
        date: data.date,
        information: data.description || "", // Map description to information
        semester: data.semester,
        tahunPelajaran: data.tahunPelajaran,
        createdBy: createdById, // Required field
      },
    });
    revalidatePath("/academic-calendar");
    revalidatePath("/dashboard-admin/calendar");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function updateCalendarEvent(id: string, data: Partial<SchoolActivity>) {
  const auth = await verifyCalendarAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const event = await prisma.schoolActivity.update({
      where: { id },
      data,
    });
    revalidatePath("/academic-calendar");
    revalidatePath("/dashboard-admin/calendar");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function deleteCalendarEvent(id: string) {
  const auth = await verifyCalendarAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    await prisma.schoolActivity.delete({
      where: { id },
    });
    revalidatePath("/academic-calendar");
    revalidatePath("/dashboard-admin/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
}
