"use client";

import { useState, useEffect } from "react";
import { Users, FileText, LayoutDashboard } from "lucide-react";
import { Header, MenuItem, ApplicantDetailModal } from "@/components/dashboard/ppdb";
import { DashboardSidebar } from "@/components/dashboard/layout";
import DashboardOverviewEnhanced from "@/components/dashboard/ppdb/DashboardOverviewEnhanced";
import ValidationContentEnhanced from "@/components/dashboard/ppdb/ValidationContentEnhanced";
import ReportsContentEnhanced from "@/components/dashboard/ppdb/ReportsContentEnhanced";
import { updateApplicantStatus, PPDBStatus } from "@/actions/ppdb";
import { NotificationAPIService } from "@/hooks/useNotifications";
import { FormattedNotification } from "@/utils/notificationHelpers";
import toast from "react-hot-toast";
import { useSidebar } from "@/hooks/useSidebar";

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

interface PPDBDashboardClientProps {
  initialNotifications?: FormattedNotification[];
}

export default function PPDBDashboardClient({ initialNotifications = [] }: PPDBDashboardClientProps) {
  // Use "dashboard" as default, but ideally this could be from URL
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } = useSidebar(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<FormattedNotification[]>(initialNotifications);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<EnhancedApplicant | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "validation", label: "Validasi Pendaftar", icon: Users },
    { id: "reports", label: "Laporan", icon: FileText },
    // { id: "settings", label: "Pengaturan", icon: Settings }, // Disabled
  ];

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      const result = await NotificationAPIService.fetchAllNotifications({
        page: 1,
        userRole: "ppdb-officer",
      });

      if (result.success) {
        setNotifications(result.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const result = await NotificationAPIService.markNotificationAsReadByRole(
      notificationId,
      "ppdb-officer"
    );

    if (result.success) {
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
    loadNotifications();
  }, []);

  const handleViewDetail = (applicant: unknown) => {
    setSelectedApplicant(applicant as EnhancedApplicant);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (
    id: string,
    status: string,
    feedback: string
  ) => {
    try {
      const result = await updateApplicantStatus(
        id,
        status as PPDBStatus,
        feedback
      );

      if (result.success) {
        toast.success(
          `Status berhasil diperbarui menjadi ${status.toLowerCase()}`
        );
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
    toast.success("Data berhasil diexport");
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add hidden button listener for "Lihat Semua" in overview
  useEffect(() => {
    const btn = document.getElementById("tab-validation");
    if (btn) {
      const clickHandler = () => setActiveMenu("validation");
      btn.addEventListener("click", clickHandler);
      return () => btn.removeEventListener("click", clickHandler);
    }
  }, []);

  const ppdbAvatar = "https://ui-avatars.com/api/?name=PPDB&background=F59E0B&color=fff&size=128&bold=true";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="PPDB Center"
        subtitle="OFFICER AREA"
        userRole="PPDB Staff"
        userAvatar={ppdbAvatar}
      />

      {/* Main Content Shell - Matches Admin Dashboard structure */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header
          activeMenu={activeMenu}
          onToggleSidebar={handleToggleSidebar}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={notifications.filter((n) => !n.read).length}
          markAsRead={markAsRead}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
           <div className="p-6 pb-20 max-w-7xl mx-auto w-full">
            {activeMenu === "dashboard" && <DashboardOverviewEnhanced />}

            {activeMenu === "validation" && (
              <ValidationContentEnhanced
                onViewDetail={handleViewDetail}
                onExportData={handleExportData}
                refreshTrigger={refreshTrigger}
              />
            )}

            {activeMenu === "reports" && <ReportsContentEnhanced />}
          </div>
        </main>
      </div>

       {/* Hidden trigger for navigation from other components */}
       <button id="tab-validation" className="hidden" onClick={() => setActiveMenu("validation")} />

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
