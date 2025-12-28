import React from "react";
import {
  NOTIFICATION_CONFIG,
  formatNotifications,
  RawNotification,
  FormattedNotification,
} from "@/utils/notificationHelpers";
import {
  getNotifications as getStudentNotifications,
  markNotificationAsRead as markStudentNotificationAsRead,
  markAllNotificationsAsRead as markAllStudentNotificationsAsRead,
} from "@/actions/student/notifications";
import {
  getPPDBNotifications,
  markPPDBNotificationAsRead,
} from "@/actions/ppdb/notifications";

/**
 * Notification API Service
 * Centralized service for all notification-related API calls using Server Actions
 */
export class NotificationAPIService {
  /**
   * Fetch notifications with pagination and filtering (Student)
   */
  static async fetchNotifications({
    limit = NOTIFICATION_CONFIG.DEFAULT_LIMIT,
    page = 1,
    unreadOnly = false,
  }: {
    limit?: number;
    page?: number;
    unreadOnly?: boolean;
  } = {}): Promise<{
    success: boolean;
    data: FormattedNotification[];
    error?: string;
  }> {
    try {
      const result = await getStudentNotifications({
        limit,
        page,
        unreadOnly,
      });

      if (result.success && result.data) {
        const formattedData = formatNotifications(
          result.data as unknown as RawNotification[]
        );
        return {
          success: true,
          data: formattedData,
        };
      }

      return {
        success: false,
        data: [],
        error: result.error || "Failed to fetch notifications",
      };
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch notifications for PPDB Officer
   */
  static async fetchPPDBNotifications({
    limit = NOTIFICATION_CONFIG.DEFAULT_LIMIT,
    page = 1,
    unreadOnly = false,
  }: {
    limit?: number;
    page?: number;
    unreadOnly?: boolean;
  } = {}): Promise<{
    success: boolean;
    data: FormattedNotification[];
    error?: string;
  }> {
    try {
      const result = await getPPDBNotifications({
        limit,
        page,
        unreadOnly,
      });

      if (result.success && result.data) {
        const formattedData = formatNotifications(
          result.data as unknown as RawNotification[]
        );
        return {
          success: true,
          data: formattedData,
        };
      }

      return {
        success: false,
        data: [],
        error: result.error || "Failed to fetch PPDB notifications",
      };
    } catch (error) {
      console.error("Failed to fetch PPDB notifications:", error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark a specific notification as read (Student)
   */
  static async markNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await markStudentNotificationAsRead(notificationId);
      return {
        success: result.success || false,
        error: result.error,
      };
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark a specific PPDB notification as read
   */
  static async markPPDBNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await markPPDBNotificationAsRead(notificationId);
      return {
        success: result.success || false,
        error: result.error,
      };
    } catch (error) {
      console.error("Failed to mark PPDB notification as read:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await markAllStudentNotificationsAsRead();
      return {
        success: result.success || false,
        error: result.error,
      };
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch notifications for header dropdown (limited)
   */
  static async fetchHeaderNotifications(): Promise<{
    success: boolean;
    data: FormattedNotification[];
    error?: string;
  }> {
    return this.fetchNotifications({
      limit: NOTIFICATION_CONFIG.HEADER_DROPDOWN_LIMIT,
    });
  }

  /**
   * Fetch notifications for overview/preview (very limited)
   */
  static async fetchPreviewNotifications(): Promise<{
    success: boolean;
    data: FormattedNotification[];
    error?: string;
  }> {
    return this.fetchNotifications({
      limit: NOTIFICATION_CONFIG.PREVIEW_LIMIT,
    });
  }

  /**
   * Fetch notifications for the dedicated notifications page
   */
  static async fetchAllNotifications({
    page = 1,
    filter = "all",
    userRole,
  }: {
    page?: number;
    filter?: "all" | "unread";
    userRole?: string;
  } = {}): Promise<{
    success: boolean;
    data: FormattedNotification[];
    hasMore: boolean;
    error?: string;
  }> {
    let result;

    if (userRole === "ppdb_admin") {
      result = await this.fetchPPDBNotifications({
        limit: NOTIFICATION_CONFIG.ALL_NOTIFICATIONS_LIMIT,
        page,
        unreadOnly: filter === "unread",
      });
    } else {
      result = await this.fetchNotifications({
        limit: NOTIFICATION_CONFIG.ALL_NOTIFICATIONS_LIMIT,
        page,
        unreadOnly: filter === "unread",
      });
    }

    return {
      ...result,
      hasMore:
        result.data.length === NOTIFICATION_CONFIG.ALL_NOTIFICATIONS_LIMIT,
    };
  }

  /**
   * Mark notification as read - works for any role
   */
  static async markNotificationAsReadByRole(
    notificationId: string,
    userRole?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (userRole === "ppdb_admin") {
      return this.markPPDBNotificationAsRead(notificationId);
    } else {
      return this.markNotificationAsRead(notificationId);
    }
  }
}

/**
 * Custom Hook for Notification State Management
 */
export function useNotificationState() {
  const [notifications, setNotifications] = React.useState<
    FormattedNotification[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadNotifications = React.useCallback(
    async (
      options: Parameters<
        typeof NotificationAPIService.fetchNotifications
      >[0] = {}
    ) => {
      setLoading(true);
      setError(null);

      const result = await NotificationAPIService.fetchNotifications(options);

      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error || "Failed to load notifications");
      }

      setLoading(false);
      return result;
    },
    []
  );

  const markAsRead = React.useCallback(async (notificationId: string) => {
    const result =
      await NotificationAPIService.markNotificationAsRead(notificationId);

    if (result.success) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }

    return result;
  }, []);

  const markAllAsRead = React.useCallback(async () => {
    const result = await NotificationAPIService.markAllNotificationsAsRead();

    if (result.success) {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    }

    return result;
  }, []);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    setNotifications,
  };
}
