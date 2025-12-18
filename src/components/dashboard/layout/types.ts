import { LucideIcon } from "lucide-react";

export interface DashboardMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number; // Optional badge count
}

export interface DashboardSidebarProps {
  menuItems: DashboardMenuItem[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  userRole?: string;
}
