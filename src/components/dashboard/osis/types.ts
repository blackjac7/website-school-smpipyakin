import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number; // Added badge support
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OsisActivity {
  id: string; // Changed from number to string (UUID)
  title: string;
  description: string;
  date: Date | string; // Handle both serialization types
  time: string;
  status: ApprovalStatus;
  location: string;
  participants: number;
  budget: number;
  organizer: string;
  proposalUrl?: string | null;
  rejectionNote?: string | null;
  authorId?: string;
  createdAt?: Date | string;
}

export interface OsisNews {
  id: string;
  title: string;
  content: string;
  image: string | null;
  statusPersetujuan: ApprovalStatus;
  date: Date | string;
}

export interface Notification {
  id: string;
  type: string;
  title?: string;
  icon?: unknown;
  color?: string;
  message: string;
  detail?: string;
  time: string;
  read: boolean;
}

export interface ValidationStatus {
  label: string;
  count: number;
  color: string;
}
