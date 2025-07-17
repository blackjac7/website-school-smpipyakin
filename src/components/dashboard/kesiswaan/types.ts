import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

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

export interface Notification {
  id: number;
  type: "success" | "pending" | "info";
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

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
