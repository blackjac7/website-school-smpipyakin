import { LucideIcon } from 'lucide-react';

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

export interface Notification {
  id: number | string;
  type: string;
  title?: string; // Made optional to fit existing data
  icon?: unknown; // Made optional
  color?: string; // Made optional
  message: string;
  detail?: string;
  time: string;
  read: boolean;
}

export interface Activity {
  user: string;
  action: string;
  time: string;
  type: 'content' | 'profile' | 'calendar' | 'system';
}

export interface ContentItem {
  id: number;
  title: string;
  type: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
  views: number;
}

export interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'increase' | 'decrease' | 'stable';
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminDashboardProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export interface UserModalProps {
  show: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  selectedUser: User | null;
  onSubmit: (e: React.FormEvent) => void;
}

export interface ContentModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
