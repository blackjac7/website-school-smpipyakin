"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Layout,
  Activity,
  Bell,
  Newspaper,
  GraduationCap,
  Settings,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/layout/DashboardSidebar";
import { DashboardMenuItem } from "@/components/dashboard/layout/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Legacy props
  menuItems?: DashboardMenuItem[];
  activeMenu?: string;
  setActiveMenu?: (id: string) => void;
  // Optional callback to notify parent that navigation started
  onNavigateStart?: () => void;
}

export function Sidebar({ isOpen, onClose, onNavigateStart }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Map active menu based on pathname
  const getActiveMenu = () => {
    if (pathname.includes("/hero")) return "hero";
    if (pathname.includes("/stats")) return "stats";
    if (pathname.includes("/news")) return "news";
    if (pathname.includes("/announcements")) return "announcements";
    if (pathname.includes("/calendar")) return "calendar";
    if (pathname.includes("/teachers")) return "teachers";
    if (pathname.includes("/users")) return "users";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  };

  const handleMenuClick = (id: string) => {
    // Notify layout that navigation started so it can show a persistent overlay
    if (typeof onNavigateStart === "function") onNavigateStart();

    switch (id) {
      case "hero":
        router.push("/dashboard-admin/hero");
        break;
      case "stats":
        router.push("/dashboard-admin/stats");
        break;
      case "news":
        router.push("/dashboard-admin/news");
        break;
      case "announcements":
        router.push("/dashboard-admin/announcements");
        break;
      case "calendar":
        router.push("/dashboard-admin/calendar");
        break;
      case "teachers":
        router.push("/dashboard-admin/teachers");
        break;
      case "users":
        router.push("/dashboard-admin/users");
        break;
      case "settings":
        router.push("/dashboard-admin/settings");
        break;
      default:
        // router.push('/dashboard-admin');
        break;
    }
  };

  const adminMenuItems: DashboardMenuItem[] = [
    { id: "hero", label: "Hero Carousel", icon: Layout },
    { id: "stats", label: "Quick Stats", icon: Activity },
    { id: "news", label: "Berita Sekolah", icon: Newspaper },
    { id: "announcements", label: "Pengumuman", icon: Bell },
    { id: "calendar", label: "Kalender Akademik", icon: Calendar },
    { id: "teachers", label: "Profil Guru", icon: GraduationCap },
    { id: "users", label: "Manajemen Pengguna", icon: Users },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  // Professional admin avatar
  const adminAvatar =
    "https://ui-avatars.com/api/?name=Admin&background=1E3A8A&color=fff&size=128&bold=true";

  return (
    <DashboardSidebar
      menuItems={adminMenuItems}
      activeMenu={getActiveMenu()}
      setActiveMenu={handleMenuClick}
      isSidebarOpen={isOpen}
      setIsSidebarOpen={onClose}
      title="Admin Dashboard"
      subtitle="CONTENT MANAGEMENT"
      userRole="Admin"
      userAvatar={adminAvatar}
    />
  );
}
