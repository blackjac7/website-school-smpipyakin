// src/lib/data/homepage.ts

import { prisma } from "@/lib/prisma";
import {
  News,
  Announcement,
  SchoolActivity,
} from "@prisma/client";

// Define return types to ensure consistency even if we switch to real DB
export interface HomepageData {
  news: News[];
  announcements: Announcement[];
  activities: SchoolActivity[];
}

// Serialization Helper Types
export type SerializableNews = Omit<News, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializableAnnouncement = Omit<Announcement, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializableActivity = Omit<SchoolActivity, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};


export function serializeNews(news: News[]): SerializableNews[] {
  return news.map(item => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export function serializeAnnouncements(items: Announcement[]): SerializableAnnouncement[] {
  return items.map(item => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export function serializeActivities(items: SchoolActivity[]): SerializableActivity[] {
  return items.map(item => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}


/**
 * Fetches the latest 3 approved news items.
 */
export async function getLatestNews(): Promise<SerializableNews[]> {
  try {
    const news = await prisma.news.findMany({
      where: {
        statusPersetujuan: "APPROVED",
      },
      orderBy: {
        date: "desc",
      },
      take: 3,
    });

    return serializeNews(news);
  } catch (error) {
    console.warn("Database connection failed for News:", error);
    return [];
  }
}

/**
 * Fetches upcoming announcements.
 */
export async function getUpcomingAnnouncements(): Promise<SerializableAnnouncement[]> {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        date: "desc", // Most recent first
      },
      take: 3,
    });

    return serializeAnnouncements(announcements);
  } catch (error) {
    console.warn("Database connection failed for Announcements:", error);
    return [];
  }
}

/**
 * Fetches upcoming school activities (events).
 */
export async function getUpcomingActivities(): Promise<SerializableActivity[]> {
  try {
    const today = new Date();
    // Reset time to beginning of day to include events happening today
    today.setHours(0, 0, 0, 0);

    const activities = await prisma.schoolActivity.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 3,
    });

    return serializeActivities(activities);
  } catch (error) {
    console.warn("Database connection failed for Activities:", error);
    return [];
  }
}
