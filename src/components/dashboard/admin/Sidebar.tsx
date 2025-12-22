"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Layout,
  Activity,
  Bell,
  Newspaper
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
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Map active menu based on pathname
  const getActiveMenu = () => {
    if (pathname.includes('/hero')) return 'hero';
    if (pathname.includes('/stats')) return 'stats';
    if (pathname.includes('/news')) return 'news';
    if (pathname.includes('/announcements')) return 'announcements';
    if (pathname.includes('/calendar')) return 'calendar';
    if (pathname.includes('/users')) return 'users';
    return 'dashboard';
  };

  const handleMenuClick = (id: string) => {
    switch (id) {
      case 'hero':
        router.push('/dashboard-admin/hero');
        break;
      case 'stats':
        router.push('/dashboard-admin/stats');
        break;
      case 'news':
        router.push('/dashboard-admin/news');
        break;
      case 'announcements':
        router.push('/dashboard-admin/announcements');
        break;
      case 'calendar':
        router.push('/dashboard-admin/calendar');
        break;
      case 'users':
        router.push('/dashboard-admin/users'); // Assuming this exists or will exist
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
    { id: "users", label: "Manajemen Pengguna", icon: Users },
  ];

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
    />
  );
}
