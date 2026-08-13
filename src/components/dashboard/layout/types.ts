import type { DashboardMenuItem } from "./dashboard-config";

export type { DashboardMenuItem } from "./dashboard-config";

export interface DashboardSidebarProps {
  menuItems: DashboardMenuItem[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  userRole?: string;
  userAvatar?: string; // URL for user avatar image
  workspace?: "osis" | "kesiswaan";
}
