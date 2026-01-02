"use client";

import { useEffect, useState } from "react";
import { CheckCircle, FileText, Settings, Users } from "lucide-react";
import {
  Header,
  AlertCard,
  ContentList,
  ReportsContent,
  SettingsContent,
  PreviewModal,
  ValidationModal,
  MenuItem,
  ContentItem,
  StudentItem,
} from "@/components/dashboard/kesiswaan";
import StudentList from "@/components/dashboard/kesiswaan/StudentList";
import { DashboardSidebar } from "@/components/dashboard/layout";
import LoadingEffect from "@/components/shared/LoadingEffect";
import {
  validateContent,
  getValidationQueue,
  ValidationItem,
  DashboardStats,
  ValidationQueueResult,
} from "@/actions/kesiswaan";
import {
  getKesiswaanNotifications,
  markKesiswaanNotificationAsRead,
  KesiswaanNotificationData,
} from "@/actions/kesiswaan/notifications";
import toast from "react-hot-toast";
import { useSidebar } from "@/hooks/useSidebar";

interface DashboardClientProps {
  initialQueueResult: ValidationQueueResult;
  initialStudents: StudentItem[];
  initialStats: DashboardStats;
}

export default function DashboardClient({
  initialQueueResult,
  initialStudents,
  initialStats,
}: DashboardClientProps) {
  const [activeMenu, setActiveMenu] = useState("validation");
  const [notifications, setNotifications] = useState<
    KesiswaanNotificationData[]
  >([]);
  const [validationQueue, setValidationQueue] = useState<ValidationItem[]>(
    initialQueueResult.items
  );
  const [pagination, setPagination] = useState({
    page: initialQueueResult.page,
    totalPages: initialQueueResult.totalPages,
    totalCount: initialQueueResult.totalCount,
    limit: initialQueueResult.limit,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [validationAction, setValidationAction] = useState<
    "approve" | "reject"
  >("approve");
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } =
    useSidebar(true);

  // Sync initial queue if updated
  useEffect(() => {
    setValidationQueue(initialQueueResult.items);
    setPagination({
      page: initialQueueResult.page,
      totalPages: initialQueueResult.totalPages,
      totalCount: initialQueueResult.totalCount,
      limit: initialQueueResult.limit,
    });
  }, [initialQueueResult]);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await getKesiswaanNotifications({ limit: 10 });
        if (result.success) {
          setNotifications(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const result = await markKesiswaanNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Fetch data when status filter changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      setIsLoading(true);
      try {
        const status =
          statusFilter === "Semua Status"
            ? "ALL"
            : (statusFilter.toUpperCase() as import("@prisma/client").StatusApproval);
        const result = await getValidationQueue(status, 1, pagination.limit);
        setValidationQueue(result.items);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          limit: result.limit,
        });
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setIsLoading(true);
    try {
      const status =
        statusFilter === "Semua Status"
          ? "ALL"
          : (statusFilter.toUpperCase() as import("@prisma/client").StatusApproval);
      const result = await getValidationQueue(
        status,
        newPage,
        pagination.limit
      );
      setValidationQueue(result.items);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
      });
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: "validation",
      label: "Validasi Konten",
      icon: CheckCircle,
      badge:
        validationQueue.filter((i) => i.status === "PENDING").length ||
        undefined,
    },
    { id: "students", label: "Data Siswa", icon: Users },
    { id: "reports", label: "Laporan", icon: FileText },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleApprove = (content: ContentItem) => {
    setSelectedContent(content);
    setValidationAction("approve");
    setShowValidationModal(true);
  };

  const handleReject = (content: ContentItem) => {
    setSelectedContent(content);
    setValidationAction("reject");
    setShowValidationModal(true);
  };

  const handlePreview = (content: ContentItem) => {
    setSelectedContent(content);
    setShowPreviewModal(true);
  };

  const handleValidationSubmit = async (note: string) => {
    if (!selectedContent) return;

    try {
      const result = await validateContent(
        selectedContent.id,
        selectedContent.type,
        validationAction === "approve" ? "APPROVE" : "REJECT",
        note
      );

      if (result.success) {
        toast.success(
          `Konten berhasil ${
            validationAction === "approve" ? "disetujui" : "ditolak"
          }`
        );
        setShowValidationModal(false);
        setShowPreviewModal(false);
        // Refresh the list immediately with current page
        const status =
          statusFilter === "Semua Status"
            ? "ALL"
            : (statusFilter.toUpperCase() as import("@prisma/client").StatusApproval);
        const result = await getValidationQueue(
          status,
          pagination.page,
          pagination.limit
        );
        setValidationQueue(result.items);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          limit: result.limit,
        });
      } else {
        toast.error("Gagal memproses validasi");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    }
  };

  // Kesiswaan avatar - Blue/Yellow theme for student affairs
  const kesiswaanAvatar =
    "https://ui-avatars.com/api/?name=Kesiswaan&background=1E3A8A&color=F59E0B&size=128&bold=true";

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        title="Kesiswaan"
        subtitle="MANAGEMENT AREA"
        userRole="Kesiswaan"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userAvatar={kesiswaanAvatar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header
          activeMenu={activeMenu}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onMarkAsRead={handleMarkNotificationAsRead}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeMenu === "validation" && (
            <div className="space-y-6">
              <AlertCard count={pagination.totalCount} />
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingEffect showMessage={false} size="sm" />
                </div>
              ) : (
                <ContentList
                  contentItems={validationQueue}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onPreview={handlePreview}
                  // Server-side pagination
                  serverPagination={{
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    totalCount: pagination.totalCount,
                    onPageChange: handlePageChange,
                  }}
                />
              )}
            </div>
          )}
          {activeMenu === "students" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Data Siswa</h2>
              <StudentList students={initialStudents} />
            </div>
          )}
          {activeMenu === "reports" && (
            <ReportsContent reportStats={initialStats} />
          )}
          {activeMenu === "settings" && <SettingsContent />}
        </main>
      </div>

      {/* Modals */}
      {showPreviewModal && selectedContent && (
        <PreviewModal
          isOpen={showPreviewModal}
          content={selectedContent}
          onClose={() => setShowPreviewModal(false)}
          onApprove={() => handleApprove(selectedContent)}
          onReject={() => handleReject(selectedContent)}
        />
      )}

      {showValidationModal && selectedContent && (
        <ValidationModal
          isOpen={showValidationModal}
          content={selectedContent}
          validationAction={validationAction}
          onClose={() => setShowValidationModal(false)}
          onSubmit={handleValidationSubmit}
        />
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
}
