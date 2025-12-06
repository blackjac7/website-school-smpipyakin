import { LucideIcon } from "lucide-react";

/**
 * Interface representing a menu item in the OSIS sidebar.
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Interface representing an OSIS activity.
 */
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

/**
 * Interface representing a notification for the OSIS dashboard.
 */
export interface Notification {
  id: number;
  type: string;
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

/**
 * Interface representing the validation status of activities.
 */
export interface ValidationStatus {
  label: string;
  count: number;
  color: string;
}
