import { LucideIcon } from "lucide-react";

/**
 * Interface representing a menu item in the sidebar.
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

/**
 * Interface representing a content item (e.g., student achievement, activity proposal).
 */
export interface ContentItem {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  status: "Prestasi" | "Kegiatan" | "Pengumuman";
  type: "Pending" | "Approved" | "Rejected";
  timeAgo: string;
  priority: "high" | "medium" | "low";
  attachments: string[];
  content: string;
}

/**
 * Interface representing a notification in the dashboard.
 */
export interface Notification {
  id: number;
  type: "success" | "pending" | "info";
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

/**
 * Interface representing statistics for reports.
 */
export interface ReportStats {
  monthly: Array<{
    month: string;
    validated: number;
    pending: number;
    rejected: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}
