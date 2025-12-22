import { LucideIcon } from "lucide-react";
import { ValidationItem, DashboardStats } from "@/actions/kesiswaan";
import { Siswa } from "@prisma/client";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

// Re-export ValidationItem for use in components
export type ContentItem = ValidationItem;

export interface Notification {
  id: number;
  type: "success" | "pending" | "info";
  title?: string;
  icon?: unknown;
  color?: string;
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

export type ReportStats = DashboardStats;

export type StudentItem = Siswa;
