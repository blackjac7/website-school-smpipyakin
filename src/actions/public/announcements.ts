"use server";

import { prisma } from "@/lib/prisma";
import { MOCK_ANNOUNCEMENTS } from "@/lib/data/homepage";

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
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

    if (announcements.length === 0) {
      // Fallback to mock data if no announcements in database
      return MOCK_ANNOUNCEMENTS.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        date: item.date.toISOString(),
        location: item.location,
        priority: item.priority as "HIGH" | "MEDIUM" | "LOW",
      }));
    }

    return announcements.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.date.toISOString(),
      location: item.location,
      priority: item.priority as "HIGH" | "MEDIUM" | "LOW",
    }));
  } catch (error) {
    console.error("Error fetching public announcements:", error);
    // Fallback to mock data on error
    return MOCK_ANNOUNCEMENTS.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.date.toISOString(),
      location: item.location,
      priority: item.priority as "HIGH" | "MEDIUM" | "LOW",
    }));
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
      // Try mock data
      const mockAnnouncement = MOCK_ANNOUNCEMENTS.find(
        (item) => item.id === id
      );
      if (mockAnnouncement) {
        return {
          id: mockAnnouncement.id,
          title: mockAnnouncement.title,
          content: mockAnnouncement.content,
          date: mockAnnouncement.date.toISOString(),
          location: mockAnnouncement.location,
          priority: mockAnnouncement.priority as "HIGH" | "MEDIUM" | "LOW",
        };
      }
      return null;
    }

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date.toISOString(),
      location: announcement.location,
      priority: announcement.priority as "HIGH" | "MEDIUM" | "LOW",
    };
  } catch (error) {
    console.error("Error fetching announcement by ID:", error);
    return null;
  }
}
