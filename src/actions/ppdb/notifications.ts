"use server";

import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============ Schemas ============
const GetNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
  unreadOnly: z.boolean().default(false),
});

// ============ Types ============
interface FormattedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: unknown;
  read: boolean;
  createdAt: string;
}

// ============ Get PPDB Notifications ============
export async function getPPDBNotifications(params?: {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    if (auth.role !== "ppdb-officer") {
      return { success: false, error: "Akses ditolak" };
    }

    const validation = GetNotificationsSchema.safeParse({
      limit: params?.limit ?? 10,
      page: params?.page ?? 1,
      unreadOnly: params?.unreadOnly ?? false,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Parameter tidak valid",
      };
    }

    const { limit, page, unreadOnly } = validation.data;
    const offset = (page - 1) * limit;

    const whereClause = {
      userId: auth.userId,
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

    const formattedNotifications: FormattedNotification[] = notifications.map(
      (notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      })
    );

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
    console.error("Error fetching PPDB notifications:", error);
    return { success: false, error: "Gagal memuat notifikasi" };
  }
}

// ============ Mark PPDB Notification as Read ============
export async function markPPDBNotificationAsRead(notificationId: string) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    if (auth.role !== "ppdb-officer") {
      return { success: false, error: "Akses ditolak" };
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: auth.userId,
      },
    });

    if (!notification) {
      return { success: false, error: "Notifikasi tidak ditemukan" };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Gagal menandai notifikasi" };
  }
}

// ============ Get Unread Count ============
export async function getPPDBUnreadNotificationCount() {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return { success: false, error: "Unauthorized", count: 0 };
    }

    if (auth.role !== "ppdb-officer") {
      return { success: false, error: "Akses ditolak", count: 0 };
    }

    const count = await prisma.notification.count({
      where: {
        userId: auth.userId,
        read: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, error: "Gagal menghitung notifikasi", count: 0 };
  }
}
