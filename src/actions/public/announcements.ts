"use server";

import { prisma } from "@/lib/prisma";

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  linkFile: string | null;
}

/**
 * Get all announcements for public display
 */
export async function getPublicAnnouncements(): Promise<PublicAnnouncement[]> {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return announcements.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.date.toISOString(),
      location: item.location,
      priority: item.priority as "HIGH" | "MEDIUM" | "LOW",
      linkFile: item.linkFile,
    }));
  } catch (error) {
    console.error("Error fetching public announcements:", error);
    return [];
  }
}

/**
 * Get single announcement by ID
 */
export async function getAnnouncementById(
  id: string
): Promise<PublicAnnouncement | null> {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return null;
    }

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date.toISOString(),
      location: announcement.location,
      priority: announcement.priority as "HIGH" | "MEDIUM" | "LOW",
      linkFile: announcement.linkFile,
    };
  } catch (error) {
    console.error("Error fetching announcement by ID:", error);
    return null;
  }
}
