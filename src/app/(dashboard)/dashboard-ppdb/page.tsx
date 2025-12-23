"use client";

import { useState, useEffect } from "react";
import { Users, FileText } from "lucide-react";
import {
  Header,
  // SettingsContent, // Disabled untuk pengembangan selanjutnya
  MenuItem,
  ApplicantDetailModal,
} from "@/components/dashboard/ppdb";
import { DashboardSidebar } from "@/components/dashboard/layout";
import DashboardOverviewEnhanced from "@/components/dashboard/ppdb/DashboardOverviewEnhanced";
import ValidationContentEnhanced from "@/components/dashboard/ppdb/ValidationContentEnhanced";
import ReportsContentEnhanced from "@/components/dashboard/ppdb/ReportsContentEnhanced";

// Enhanced Applicant type for validation content - Updated to match database schema
interface EnhancedApplicant {
  id: string;
  name: string;
  nisn: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: Date | null | string;
  address: string | null;
  asalSekolah: string | null;
  parentContact: string | null;
  parentName: string | null;
  parentEmail: string | null;
  status: string;
  statusColor?: string;
  feedback: string | null;
  documents?: unknown;
  documentUrls?: unknown;
  createdAt: string;
  updatedAt: string;
}
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificationAPIService } from "@/hooks/useNotifications";
import { FormattedNotification } from "@/utils/notificationHelpers";
import toast from "react-hot-toast";
import { useSidebar } from "@/hooks/useSidebar";

function PPDBDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } = useSidebar(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<FormattedNotification[]>(
    []
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<EnhancedApplicant | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Users },
    { id: "validation", label: "Validasi Pendaftar", icon: Users },
    { id: "reports", label: "Laporan", icon: FileText },
    // { id: "settings", label: "Pengaturan", icon: Settings }, // Disabled untuk pengembangan selanjutnya
  ];

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      // Only load 5 notifications for header dropdown
      const result = await NotificationAPIService.fetchAllNotifications({
        page: 1,
        userRole: "ppdb-officer",
      });

      if (result.success) {
        // Take only first 5 notifications for header
        setNotifications(result.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    const result = await NotificationAPIService.markNotificationAsReadByRole(
      notificationId,
      "ppdb-officer"
    );

    if (result.success) {
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      toast.success("Notifikasi ditandai sudah dibaca");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await loadNotifications();
    };

    initializeData();
  }, []);

  const handleViewDetail = (applicant: unknown) => {
    // Cast to EnhancedApplicant as we know it comes from ValidationContentEnhanced
    setSelectedApplicant(applicant as EnhancedApplicant);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (
    id: string,
    status: string,
    feedback: string
  ) => {
    try {
      const response = await fetch(`/api/ppdb/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, feedback }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Status berhasil diperbarui menjadi ${status.toLowerCase()}`
        );
        // Trigger refresh pada ValidationContentEnhanced
        setRefreshTrigger((prev) => prev + 1);
        setShowDetailModal(false);
        setSelectedApplicant(null);
      } else {
        toast.error(result.error || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Terjadi kesalahan saat memperbarui status");
    }
  };

  const handleExportData = () => {
    console.log("Export data");
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-amber-50">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="PPDB Center"
        subtitle="OFFICER AREA"
        userRole="PPDB Staff"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header
          activeMenu={activeMenu}
          onToggleSidebar={handleToggleSidebar}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={notifications.filter((n) => !n.read).length}
          markAsRead={markAsRead}
        />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeMenu === "dashboard" && <DashboardOverviewEnhanced />}

          {activeMenu === "validation" && (
            <ValidationContentEnhanced
              onViewDetail={handleViewDetail}
              onExportData={handleExportData}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeMenu === "reports" && <ReportsContentEnhanced />}

          {/* Settings disabled untuk pengembangan selanjutnya */}
          {/* {activeMenu === "settings" && <SettingsContent />} */}
        </main>
      </div>

      {/* Modals */}
      <ApplicantDetailModal
        isOpen={showDetailModal}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applicant={selectedApplicant as any}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApplicant(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

// Wrap with protected route for admin and ppdb-officer only
export default function PPDBDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["ppdb-officer"]}>
      <PPDBDashboard />
    </ProtectedRoute>
  );
}
