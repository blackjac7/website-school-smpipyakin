import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ProfileData {
  id: string;
  name: string;
  username: string;
  class: string;
  year: string;
  nisn: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  gender: string | null;
  parentName: string;
  parentPhone: string;
  profileImage?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  detail: string;
  icon: LucideIcon;
  color: string;
  time: string;
  read: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
  icon: LucideIcon;
  color: string;
  image?: string;
  category?: string;
  level?: string;
  rejectionNote?: string | null;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  workType: "photo" | "video";
  mediaUrl: string;
  videoLink: string;
  category: string;
  subject: string;
  status: "pending" | "approved" | "rejected";
  rejectionNote: string;
  createdAt: string;
}
