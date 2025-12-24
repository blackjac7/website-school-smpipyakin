"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// Validation schemas
const GetNotificationsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().min(1).default(1),
  unreadOnly: z.boolean().default(false),
});

const IdSchema = z.string().uuid("Invalid notification ID");

export type NotificationData = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: unknown;
  read: boolean;
  createdAt: string;
  time: string;
};

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "Baru saja";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} jam yang lalu`;
  } else if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} hari yang lalu`;
  } else {
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

/**
 * Get notifications for authenticated user
 */
export async function getNotifications(params?: {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}): Promise<{
  success: boolean;
  data: NotificationData[];
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, data: [], error: "Unauthorized" };
    }

    // Validate input
    const validation = GetNotificationsSchema.safeParse(params || {});
    if (!validation.success) {
      return { success: false, data: [], error: validation.error.issues[0].message };
    }

    const { limit, page, unreadOnly } = validation.data;
    const offset = (page - 1) * limit;

    const whereClause = {
      userId: user.userId,
      ...(unreadOnly && { read: false }),
    };

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const formattedNotifications: NotificationData[] = notifications.map(
      (notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        time: formatRelativeTime(notification.createdAt),
      })
    );

    return { success: true, data: formattedNotifications };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { success: false, data: [], error: "Failed to fetch notifications" };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate ID
    const idValidation = IdSchema.safeParse(notificationId);
    if (!idValidation.success) {
      return { success: false, error: idValidation.error.issues[0].message };
    }

    await prisma.notification.update({
      where: {
        id: idValidation.data,
        userId: user.userId,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.updateMany({
      where: {
        userId: user.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("markAllNotificationsAsRead error:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, count: 0, error: "Unauthorized" };
    }

    const count = await prisma.notification.count({
      where: {
        userId: user.userId,
        read: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error);
    return { success: false, count: 0, error: "Failed to get count" };
  }
}
