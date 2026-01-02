"use client";

import { Sidebar } from "@/components/dashboard/admin/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";
import Header from "@/components/dashboard/admin/Header";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  AdminNotificationData,
} from "@/actions/admin/notifications";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebar(true);
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationData[]>(
    []
  );

  // Map active menu based on pathname
  const getActiveTab = () => {
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

  const activeTab = getActiveTab();

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      const result = await getAdminNotifications({ limit: 3 });

      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markAdminNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Determine if header should be shown
  // Hide header on notifications page because it has its own custom header
  const showHeader = !pathname.includes("/notifications");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {showHeader && (
          <Header
            activeTab={activeTab}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            onToggleSidebar={() => setIsOpen(!isOpen)}
            onMarkAsRead={handleMarkAsRead}
          />
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 pb-20">{children}</div>
        </div>
      </div>
    </div>
  );
}
