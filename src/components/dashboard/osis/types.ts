import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  status: string;
  location: string;
  participants: number;
  budget: number;
  organizer: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

export interface ValidationStatus {
  label: string;
  count: number;
  color: string;
}
