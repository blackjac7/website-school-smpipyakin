import { Bell, CheckCircle, X, Info } from "lucide-react";
import { LucideIcon } from "lucide-react";

/**
 * Notification Type Configuration
 */
export const NOTIFICATION_TYPES = {
  ACHIEVEMENT_APPROVED: "ACHIEVEMENT_APPROVED",
  ACHIEVEMENT_REJECTED: "ACHIEVEMENT_REJECTED",
  WORK_APPROVED: "WORK_APPROVED",
  WORK_REJECTED: "WORK_REJECTED",
  GENERAL_INFO: "GENERAL_INFO",
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
  PPDB_UPDATE: "PPDB_UPDATE",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/**
 * Notification Icon Mapping
 */
export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  [NOTIFICATION_TYPES.ACHIEVEMENT_APPROVED]: CheckCircle,
  [NOTIFICATION_TYPES.ACHIEVEMENT_REJECTED]: X,
  [NOTIFICATION_TYPES.WORK_APPROVED]: CheckCircle,
  [NOTIFICATION_TYPES.WORK_REJECTED]: X,
  [NOTIFICATION_TYPES.GENERAL_INFO]: Info,
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: Info,
  [NOTIFICATION_TYPES.PPDB_UPDATE]: Bell,
};

/**
 * Notification Color Mapping
 */
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  [NOTIFICATION_TYPES.ACHIEVEMENT_APPROVED]: "text-green-600",
  [NOTIFICATION_TYPES.ACHIEVEMENT_REJECTED]: "text-red-600",
  [NOTIFICATION_TYPES.WORK_APPROVED]: "text-green-600",
  [NOTIFICATION_TYPES.WORK_REJECTED]: "text-red-600",
  [NOTIFICATION_TYPES.GENERAL_INFO]: "text-blue-600",
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: "text-blue-600",
  [NOTIFICATION_TYPES.PPDB_UPDATE]: "text-orange-600",
};

/**
 * Notification Badge Color Mapping (for dropdowns)
 */
export const NOTIFICATION_BADGE_COLORS: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

/**
 * Get notification icon by type
 */
export function getNotificationIcon(type: string): LucideIcon {
  return NOTIFICATION_ICONS[type as NotificationType] || Bell;
}

/**
 * Get notification color by type
 */
export function getNotificationColor(type: string): string {
  return NOTIFICATION_COLORS[type as NotificationType] || "text-blue-600";
}

/**
 * Get notification badge color
 */
export function getNotificationBadgeColor(type: string): string {
  return NOTIFICATION_BADGE_COLORS[type] || "bg-blue-500";
}

/**
 * Format notification for UI consumption
 */
export interface RawNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface FormattedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: LucideIcon;
  color: string;
  time: string;
  read: boolean;
}

export function formatNotification(
  notification: RawNotification
): FormattedNotification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    icon: getNotificationIcon(notification.type),
    color: getNotificationColor(notification.type),
    time: notification.time,
    read: notification.read,
  };
}

/**
 * Format multiple notifications
 */
export function formatNotifications(
  notifications: RawNotification[]
): FormattedNotification[] {
  return notifications.map(formatNotification);
}

/**
 * Get unread count from notifications array
 */
export function getUnreadCount(notifications: { read: boolean }[]): number {
  return notifications.filter((n) => !n.read).length;
}

/**
 * Filter notifications by read status
 */
export function filterNotificationsByReadStatus(
  notifications: FormattedNotification[],
  filter: "all" | "unread"
): FormattedNotification[] {
  if (filter === "unread") {
    return notifications.filter((n) => !n.read);
  }
  return notifications;
}

/**
 * Default notification pagination settings
 */
export const NOTIFICATION_CONFIG = {
  DEFAULT_LIMIT: 10,
  HEADER_DROPDOWN_LIMIT: 5,
  ALL_NOTIFICATIONS_LIMIT: 20,
  PREVIEW_LIMIT: 2,
} as const;
