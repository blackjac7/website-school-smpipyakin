"use client";

import { Sidebar } from "@/components/dashboard/admin/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";
import Header from "@/components/dashboard/admin/Header";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NotificationAPIService } from "@/hooks/useNotifications";
import { FormattedNotification } from "@/utils/notificationHelpers";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebar(true);
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<FormattedNotification[]>(
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
      // Use existing fetchAllNotifications which handles different roles
      // For admin, we might need a specific role or endpoint,
      // but for now we reuse the student/generic one as per current codebase structure
      // or if there is no admin-specific logic yet, we might get student notifs or empty
      // In a real app, we would have AdminNotificationService
      const result = await NotificationAPIService.fetchAllNotifications({
        page: 1,
      });

      if (result.success) {
        // Take only first 5 notifications for header
        setNotifications(result.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Determine if header should be shown
  // Hide header on notifications page because it has its own custom header
  const showHeader = !pathname.includes("/notifications");

  // Show loading overlay when navigation starts; the Sidebar will call onNavigateStart
  const [isNavigating, setIsNavigating] = useState(false);

  // Stop navigating overlay when pathname changes (navigation finished)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(!isOpen)}
        onNavigateStart={() => setIsNavigating(true)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {showHeader && (
          <Header
            activeTab={activeTab}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            onToggleSidebar={() => setIsOpen(!isOpen)}
          />
        )}

        {/* Content area - keep stable layout and show overlay during navigation to avoid flicker */}
        <div className="flex-1 relative">
          {isNavigating && (
            <div className="absolute inset-0 z-50 bg-white/60 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
