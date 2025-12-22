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
  Notification,
  StudentItem,
} from "@/components/dashboard/kesiswaan";
import StudentList from "@/components/dashboard/kesiswaan/StudentList";
import { DashboardSidebar } from "@/components/dashboard/layout";
import {
  validateContent,
  getValidationQueue,
  ValidationItem,
  DashboardStats,
} from "@/actions/kesiswaan";
import toast from "react-hot-toast";

interface DashboardClientProps {
  initialQueue: ValidationItem[];
  initialStudents: StudentItem[];
  initialStats: DashboardStats;
}

export default function DashboardClient({
  initialQueue,
  initialStudents,
  initialStats,
}: DashboardClientProps) {
  const [activeMenu, setActiveMenu] = useState("validation");
  const [validationQueue, setValidationQueue] = useState<ValidationItem[]>(initialQueue);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [validationAction, setValidationAction] = useState<"approve" | "reject">("approve");
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial queue if updated
  useEffect(() => {
    setValidationQueue(initialQueue);
  }, [initialQueue]);

  // Fetch data when status filter changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      setIsLoading(true);
      try {
        const status = statusFilter === "Semua Status" ? "ALL" : (statusFilter.toUpperCase() as import("@prisma/client").StatusApproval);
        const data = await getValidationQueue(status);
        setValidationQueue(data);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredData();
  }, [statusFilter]);

  const menuItems: MenuItem[] = [
    {
      id: "validation",
      label: "Validasi Konten",
      icon: CheckCircle,
      badge: validationQueue.filter((i) => i.status === "PENDING").length || undefined,
    },
    { id: "students", label: "Data Siswa", icon: Users },
    { id: "reports", label: "Laporan", icon: FileText },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      type: "pending",
      message: "Konten menunggu validasi",
      detail: "Silahkan cek menu validasi",
      time: "Baru saja",
      read: false,
    },
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
        // Refresh the list immediately
        const status = statusFilter === "Semua Status" ? "ALL" : (statusFilter.toUpperCase() as import("@prisma/client").StatusApproval);
        const updatedData = await getValidationQueue(status);
        setValidationQueue(updatedData);
      } else {
        toast.error("Gagal memproses validasi");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        title="Kesiswaan"
        subtitle="MANAGEMENT AREA"
        userRole="Kesiswaan"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header
          activeMenu={activeMenu}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeMenu === "validation" && (
            <div className="space-y-6">
              <AlertCard
                count={validationQueue.filter((i) => i.status === "PENDING").length}
              />
              {isLoading ? (
                <div className="flex justify-center py-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
