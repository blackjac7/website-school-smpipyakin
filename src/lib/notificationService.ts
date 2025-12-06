import { prisma } from "@/lib/prisma";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationData {
  userId: string;
  type:
    | "ACHIEVEMENT_APPROVED"
    | "ACHIEVEMENT_REJECTED"
    | "WORK_APPROVED"
    | "WORK_REJECTED"
    | "GENERAL_INFO"
    | "PPDB_UPDATE"
    | "SYSTEM_ANNOUNCEMENT";
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type as NotificationType,
          title: data.title,
          message: data.message,
          data: data.data ? (JSON.parse(JSON.stringify(data.data)) as InputJsonValue) : undefined,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create notification when achievement is approved
   */
  static async createAchievementApprovedNotification(
    userId: string,
    achievementTitle: string,
    achievementId: string
  ) {
    return this.createNotification({
      userId,
      type: "ACHIEVEMENT_APPROVED",
      title: "Prestasi Disetujui",
      message: `Prestasi "${achievementTitle}" telah disetujui oleh admin`,
      data: { achievementId, type: "achievement_approved" },
    });
  }

  /**
   * Create notification when achievement is rejected
   */
  static async createAchievementRejectedNotification(
    userId: string,
    achievementTitle: string,
    achievementId: string,
    rejectionReason?: string
  ) {
    return this.createNotification({
      userId,
      type: "ACHIEVEMENT_REJECTED",
      title: "Prestasi Ditolak",
      message: `Prestasi "${achievementTitle}" ditolak. ${rejectionReason ? `Alasan: ${rejectionReason}` : ""}`,
      data: { achievementId, rejectionReason, type: "achievement_rejected" },
    });
  }

  /**
   * Create notification when work is approved
   */
  static async createWorkApprovedNotification(
    userId: string,
    workTitle: string,
    workId: string
  ) {
    return this.createNotification({
      userId,
      type: "WORK_APPROVED",
      title: "Karya Disetujui",
      message: `Karya "${workTitle}" telah disetujui oleh admin`,
      data: { workId, type: "work_approved" },
    });
  }

  /**
   * Create notification when work is rejected
   */
  static async createWorkRejectedNotification(
    userId: string,
    workTitle: string,
    workId: string,
    rejectionReason?: string
  ) {
    return this.createNotification({
      userId,
      type: "WORK_REJECTED",
      title: "Karya Ditolak",
      message: `Karya "${workTitle}" ditolak. ${rejectionReason ? `Alasan: ${rejectionReason}` : ""}`,
      data: { workId, rejectionReason, type: "work_rejected" },
    });
  }

  /**
   * Create general info notification
   */
  static async createGeneralNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) {
    return this.createNotification({
      userId,
      type: "GENERAL_INFO",
      title,
      message,
      data,
    });
  }

  /**
   * Create system announcement for all users with specific role
   */
  static async createSystemAnnouncement(
    title: string,
    message: string,
    userRole?: "SISWA" | "KESISWAAN" | "OSIS" | "PPDB_STAFF" | "ADMIN",
    data?: Record<string, unknown>
  ) {
    try {
      // Get all users with specified role (or all users if no role specified)
      const whereClause = userRole ? { role: userRole } : {};
      const users = await prisma.user.findMany({
        where: whereClause,
        select: { id: true },
      });

      // Create notifications for all users
      const notifications = users.map((user: { id: string }) => ({
        userId: user.id,
        type: "SYSTEM_ANNOUNCEMENT" as NotificationType,
        title,
        message,
        data: data ? (JSON.parse(JSON.stringify(data)) as InputJsonValue) : undefined,
      }));

      const result = await prisma.notification.createMany({
        data: notifications,
      });

      return result;
    } catch (error) {
      console.error("Error creating system announcement:", error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user can only update their own notifications
        },
        data: {
          read: true,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
}
