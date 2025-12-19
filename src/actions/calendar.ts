"use server";

import { prisma } from "@/lib/prisma";
import { SchoolActivity, SemesterType } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
}) {
  try {
    const event = await prisma.schoolActivity.create({
      data,
    });
    revalidatePath("/academic-calendar");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function updateCalendarEvent(id: string, data: Partial<SchoolActivity>) {
  try {
    const event = await prisma.schoolActivity.update({
      where: { id },
      data,
    });
    revalidatePath("/academic-calendar");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    await prisma.schoolActivity.delete({
      where: { id },
    });
    revalidatePath("/academic-calendar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
