"use client";

import { useState } from "react";
import { CheckCircle, FileText, Settings } from "lucide-react";
import {
  Sidebar,
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
  ReportStats,
} from "@/components/dashboard/kesiswaan";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * KesiswaanDashboard component.
 * Provides the main interface for the student affairs dashboard, including content validation, reports, and settings.
 * @returns {JSX.Element} The rendered KesiswaanDashboard component.
 */
function KesiswaanDashboard() {
  const [activeMenu, setActiveMenu] = useState("validation");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
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

  // ... (Data definitions for menuItems, notifications, contentItems, reportStats remain the same)
  const menuItems: MenuItem[] = [
    {
      id: "validation",
      label: "Validasi Konten",
      icon: CheckCircle,
      badge: 12,
    },
    { id: "reports", label: "Laporan", icon: FileText },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      type: "pending",
      message: "Ada 3 konten baru menunggu validasi",
      detail: "2 prestasi siswa dan 1 kegiatan OSIS",
      time: "5 menit yang lalu",
      read: false,
    },
    {
      id: 2,
      type: "info",
      message: "Laporan bulanan siap diunduh",
      detail: "Laporan validasi konten bulan Januari 2025",
      time: "2 jam yang lalu",
      read: false,
    },
    {
      id: 3,
      type: "success",
      message: "Backup data berhasil",
      detail: "Data validasi telah dibackup otomatis",
      time: "1 hari yang lalu",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const contentItems: ContentItem[] = [
    {
      id: 1,
      title: "Juara 1 Olimpiade Matematika Tingkat Provinsi",
      description:
        "Siswa atas nama Ahmad Fauzi berhasil meraih juara 1 dalam Olimpiade Matematika tingkat provinsi yang diselenggarakan...",
      author: "Ahmad Fauzi - XII IPA 1",
      date: "15 Januari 2025",
      status: "Prestasi",
      type: "Pending",
      timeAgo: "2 jam yang lalu",
      priority: "high",
      attachments: ["sertifikat.pdf", "foto_kegiatan.jpg"],
      content:
        "Siswa atas nama Ahmad Fauzi berhasil meraih juara 1 dalam Olimpiade Matematika tingkat provinsi yang diselenggarakan oleh Dinas Pendidikan Provinsi DKI Jakarta. Kompetisi ini diikuti oleh 150 siswa terbaik dari seluruh sekolah di Jakarta. Ahmad menunjukkan kemampuan luar biasa dalam menyelesaikan soal-soal matematika tingkat tinggi dan berhasil meraih skor tertinggi.",
    },
    {
      id: 2,
      title: "Bakti Sosial OSIS - Bantuan Bencana Alam",
      description:
        "OSIS mengadakan kegiatan bakti sosial untuk membantu korban bencana alam di wilayah sekitar sekolah. Kegiatan ini melibatkan...",
      author: "Sari Dewi - Ketua OSIS",
      date: "14 Januari 2025",
      status: "Kegiatan",
      type: "Pending",
      timeAgo: "5 jam yang lalu",
      priority: "medium",
      attachments: ["proposal.pdf", "dokumentasi.jpg"],
      content:
        "OSIS mengadakan kegiatan bakti sosial untuk membantu korban bencana alam di wilayah sekitar sekolah. Kegiatan ini melibatkan seluruh siswa kelas X, XI, dan XII untuk mengumpulkan donasi berupa makanan, pakaian, dan kebutuhan pokok lainnya. Total donasi yang terkumpul mencapai Rp 15.000.000 dan telah disalurkan kepada 50 keluarga korban bencana.",
    },
    {
      id: 3,
      title: "Lomba Karya Tulis Ilmiah Nasional",
      description:
        'Siswa berhasil meraih juara 3 dalam Lomba Karya Tulis Ilmiah tingkat nasional dengan tema "Inovasi Teknologi untuk Pendidikan"...',
      author: "Budi Santoso - XI IPS 2",
      date: "13 Januari 2025",
      status: "Prestasi",
      type: "Pending",
      timeAgo: "1 hari yang lalu",
      priority: "high",
      attachments: ["karya_tulis.pdf", "sertifikat.jpg"],
      content:
        'Siswa berhasil meraih juara 3 dalam Lomba Karya Tulis Ilmiah tingkat nasional dengan tema "Inovasi Teknologi untuk Pendidikan". Karya tulis yang berjudul "Implementasi AI dalam Pembelajaran Adaptif" ini mendapat apresiasi tinggi dari dewan juri karena inovasi dan relevansinya dengan perkembangan teknologi pendidikan saat ini.',
    },
  ];

  const reportStats: ReportStats = {
    monthly: [
      { month: "Jan", validated: 45, pending: 12, rejected: 3 },
      { month: "Feb", validated: 38, pending: 8, rejected: 2 },
      { month: "Mar", validated: 52, pending: 15, rejected: 5 },
      { month: "Apr", validated: 41, pending: 9, rejected: 1 },
      { month: "Mei", validated: 47, pending: 11, rejected: 4 },
      { month: "Jun", validated: 55, pending: 13, rejected: 2 },
    ],
    byCategory: [
      { category: "Prestasi Siswa", count: 156, percentage: 45.2 },
      { category: "Kegiatan OSIS", count: 98, percentage: 28.4 },
      { category: "Pengumuman", count: 67, percentage: 19.4 },
      { category: "Berita Sekolah", count: 24, percentage: 7.0 },
    ],
    byStatus: [
      { status: "Disetujui", count: 278, color: "bg-green-500" },
      { status: "Pending", count: 68, color: "bg-yellow-500" },
      { status: "Ditolak", count: 17, color: "bg-red-500" },
    ],
  };

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

  const handleValidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationModal(false);
    setShowPreviewModal(false);
    console.log(`${validationAction} content:`, selectedContent?.id);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
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
              <AlertCard />
              <ContentList
                contentItems={contentItems}
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
            </div>
          )}
          {activeMenu === "reports" && (
            <ReportsContent reportStats={reportStats} />
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

/**
 * KesiswaanDashboardPage component.
 * Main entry point for the student affairs dashboard.
 * Protects the route to ensure only users with the 'kesiswaan' role can access it.
 * @returns {JSX.Element} The rendered KesiswaanDashboardPage component.
 */
export default function KesiswaanDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["kesiswaan"]}>
      <KesiswaanDashboard />
    </ProtectedRoute>
  );
}
