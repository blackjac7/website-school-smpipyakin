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

export type KesiswaanNotificationData = {
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

// Helper to verify kesiswaan role
async function verifyKesiswaanRole() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "kesiswaan") {
    return {
      authorized: false,
      error: "Unauthorized: Kesiswaan access required",
    };
  }
  return { authorized: true, user };
}

/**
 * Get notifications for kesiswaan user
 */
export async function getKesiswaanNotifications(params?: {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}): Promise<{
  success: boolean;
  data: KesiswaanNotificationData[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized || !auth.user) {
      return { success: false, data: [], error: auth.error };
    }

    // Validate input
    const validation = GetNotificationsSchema.safeParse(params || {});
    if (!validation.success) {
      return {
        success: false,
        data: [],
        error: validation.error.issues[0].message,
      };
    }

    const { limit, page, unreadOnly } = validation.data;
    const offset = (page - 1) * limit;

    const whereClause = {
      userId: auth.user.userId,
      ...(unreadOnly && { read: false }),
    };

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: whereClause,
      }),
    ]);

    const formattedNotifications: KesiswaanNotificationData[] =
      notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        time: formatRelativeTime(notification.createdAt),
      }));

    return {
      success: true,
      data: formattedNotifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("getKesiswaanNotifications error:", error);
    return { success: false, data: [], error: "Failed to fetch notifications" };
  }
}

/**
 * Mark kesiswaan notification as read
 */
export async function markKesiswaanNotificationAsRead(
  notificationId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.error };
    }

    // Validate ID
    const idValidation = IdSchema.safeParse(notificationId);
    if (!idValidation.success) {
      return { success: false, error: idValidation.error.issues[0].message };
    }

    await prisma.notification.update({
      where: {
        id: idValidation.data,
        userId: auth.user.userId,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("markKesiswaanNotificationAsRead error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Mark all kesiswaan notifications as read
 */
export async function markAllKesiswaanNotificationsAsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.error };
    }

    await prisma.notification.updateMany({
      where: {
        userId: auth.user.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("markAllKesiswaanNotificationsAsRead error:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

/**
 * Get unread notification count for kesiswaan
 */
export async function getKesiswaanUnreadNotificationCount(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized || !auth.user) {
      return { success: false, count: 0, error: auth.error };
    }

    const count = await prisma.notification.count({
      where: {
        userId: auth.user.userId,
        read: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("getKesiswaanUnreadNotificationCount error:", error);
    return { success: false, count: 0, error: "Failed to get unread count" };
  }
}
