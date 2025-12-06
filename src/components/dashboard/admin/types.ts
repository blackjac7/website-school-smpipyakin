import { LucideIcon } from 'lucide-react';

/**
 * Interface representing a User in the admin dashboard.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  class: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  joinDate: string;
}

/**
 * Interface representing a Notification in the admin dashboard.
 */
export interface Notification {
  id: number;
  type: 'alert' | 'info' | 'success';
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

/**
 * Interface representing a recent Activity.
 */
export interface Activity {
  user: string;
  action: string;
  time: string;
  type: 'content' | 'profile' | 'calendar' | 'system';
}

/**
 * Interface representing a Content Item (News/Announcement).
 */
export interface ContentItem {
  id: number;
  title: string;
  type: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
  views: number;
}

/**
 * Interface representing a Statistics Card data.
 */
export interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'increase' | 'decrease' | 'stable';
}

/**
 * Interface representing a Menu Item in the sidebar.
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Props for the AdminDashboard component.
 */
export interface AdminDashboardProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

/**
 * Props for the UserModal component.
 */
export interface UserModalProps {
  show: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  selectedUser: User | null;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Props for the ContentModal component.
 */
export interface ContentModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
