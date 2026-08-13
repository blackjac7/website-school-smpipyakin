"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import {
  AlertCard,
  ContentList,
  PreviewModal,
  ValidationModal,
  ContentItem,
  OverviewDashboard,
} from "@/components/dashboard/kesiswaan";
import { DashboardSidebar, DashboardTopbar, WORKSPACE_CONFIG } from "@/components/dashboard/layout";
import {
  validateContent,
  getValidationQueue,
  ValidationItem,
  DashboardStats,
  ValidationQueueResult,
  KesiswaanOperationalOverview,
} from "@/actions/kesiswaan";
import {
  getKesiswaanNotifications,
  markKesiswaanNotificationAsRead,
  KesiswaanNotificationData,
} from "@/actions/kesiswaan/notifications";
import toast from "react-hot-toast";
import { useSidebar } from "@/hooks/useSidebar";
import "@/components/dashboard/kesiswaan/StudentCard/studentCard.styles.css";

const FeatureLoading = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20" role="status">
    <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden="true" />
    <span className="text-sm font-semibold text-slate-600">{label}</span>
  </div>
);

const StudentManagement = dynamic(
  () => import("@/components/dashboard/kesiswaan/StudentManagement"),
  { loading: () => <FeatureLoading label="Memuat data siswa..." /> },
);
const StudentCardSystem = dynamic(
  () => import("@/components/dashboard/kesiswaan/StudentCard/StudentCardSystem"),
  { loading: () => <FeatureLoading label="Memuat sistem kartu siswa..." /> },
);
const ReportsWrapper = dynamic(
  () => import("@/components/dashboard/kesiswaan/ReportsWrapper"),
  { loading: () => <FeatureLoading label="Memuat laporan..." /> },
);
const SettingsContent = dynamic(
  () => import("@/components/dashboard/kesiswaan/SettingsContent"),
  { loading: () => <FeatureLoading label="Memuat pengaturan..." /> },
);

interface DashboardClientProps {
  initialQueueResult: ValidationQueueResult;
  initialStats: DashboardStats;
  initialOperationalOverview: KesiswaanOperationalOverview;
}

export default function DashboardClient({
  initialQueueResult,
  initialStats,
  initialOperationalOverview,
}: DashboardClientProps) {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [notifications, setNotifications] = useState<
    KesiswaanNotificationData[]
  >([]);
  const [validationQueue, setValidationQueue] = useState<ValidationItem[]>(
    initialQueueResult.items,
  );
  const [pagination, setPagination] = useState({
    page: initialQueueResult.page,
    totalPages: initialQueueResult.totalPages,
    totalCount: initialQueueResult.totalCount,
    limit: initialQueueResult.limit,
  });
  // Tracks the actual count of PENDING items, independent of the currently
  // selected status filter (which drives `pagination.totalCount` above).
  const [pendingCount, setPendingCount] = useState(
    initialStats.summary.pending,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null,
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
        const result = await getKesiswaanNotifications({ limit: 3 });
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
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
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
        pagination.limit,
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

  const menuItems = WORKSPACE_CONFIG.kesiswaan.menu.map((item) =>
    item.id === "validation" ? { ...item, badge: pendingCount || undefined } : item,
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // State for updated content from preview modal editing
  const [pendingUpdatedContent, setPendingUpdatedContent] = useState<
    | {
        title: string;
        description: string;
      }
    | undefined
  >(undefined);

  const handleApprove = (
    content: ContentItem,
    updatedContent?: { title: string; description: string },
  ) => {
    setSelectedContent(content);
    setPendingUpdatedContent(updatedContent);
    setValidationAction("approve");
    setShowValidationModal(true);
  };

  const handleReject = (content: ContentItem) => {
    setSelectedContent(content);
    setPendingUpdatedContent(undefined);
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
        note,
        pendingUpdatedContent,
      );

      if (result.success) {
        toast.success(
          `Konten berhasil ${
            validationAction === "approve" ? "disetujui" : "ditolak"
          }`,
        );
        setShowValidationModal(false);
        setShowPreviewModal(false);
        setPendingUpdatedContent(undefined);
        // The approved/rejected item was PENDING, so the pending count drops by one
        setPendingCount((prev) => Math.max(0, prev - 1));
        // Refresh the list immediately with current page
        const status =
          statusFilter === "Semua Status"
            ? "ALL"
            : (statusFilter.toUpperCase() as import("@prisma/client").StatusApproval);
        const refreshResult = await getValidationQueue(
          status,
          pagination.page,
          pagination.limit,
        );
        setValidationQueue(refreshResult.items);
        setPagination({
          page: refreshResult.page,
          totalPages: refreshResult.totalPages,
          totalCount: refreshResult.totalCount,
          limit: refreshResult.limit,
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
    <div className="flex h-dvh overflow-hidden bg-slate-100">
      <DashboardSidebar
        workspace="kesiswaan"
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        title={WORKSPACE_CONFIG.kesiswaan.title}
        subtitle={WORKSPACE_CONFIG.kesiswaan.eyebrow}
        userRole={WORKSPACE_CONFIG.kesiswaan.role}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userAvatar={kesiswaanAvatar}
      />

      {/* Main Content */}
      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar
          workspace="kesiswaan"
          activePage={activeMenu}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onMarkAsRead={handleMarkNotificationAsRead}
        />

        {/* Content */}
        <main id="main-content" tabIndex={-1} className="dashboard-workspace min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
          <div className="mx-auto w-full max-w-[1600px]">
          {activeMenu === "overview" && (
            <OverviewDashboard
              overview={initialOperationalOverview}
              validationStats={initialStats}
              onNavigate={setActiveMenu}
            />
          )}
          {activeMenu === "validation" && (
            <div className="space-y-6">
              <AlertCard count={pendingCount} />
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-20" role="status" aria-live="polite">
                  <Loader2 className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-600">Memuat antrean validasi...</span>
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
          {activeMenu === "students" && <StudentManagement />}
          {activeMenu === "kartu-siswa" && <StudentCardSystem />}
          {activeMenu === "reports" && (
            <ReportsWrapper reportStats={initialStats} />
          )}
          {activeMenu === "settings" && <SettingsContent />}
          </div>
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
