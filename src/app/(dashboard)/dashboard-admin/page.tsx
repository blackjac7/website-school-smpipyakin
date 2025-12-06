"use client";

import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Calendar,
  Activity,
  Settings,
  GraduationCap,
  Music,
  User,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  Header,
  DashboardContent,
  UsersTable,
  ContentTable,
  UserModal,
  ContentModal,
  type MenuItem,
  type StatCard,
  type User as UserType,
  type Notification,
  type Activity as ActivityType,
  type ContentItem,
} from "@/components/dashboard/admin";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userModalMode, setUserModalMode] = useState<"add" | "edit">("add");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const confirmModal = useToastConfirm();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard Home", icon: Home },
    { id: "users", label: "Manajemen Pengguna", icon: Users },
    { id: "content", label: "Konten Berita & Pengumuman", icon: FileText },
    { id: "calendar", label: "Kalender Kegiatan", icon: Calendar },
    { id: "monitoring", label: "Monitoring Aktivitas", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats: StatCard[] = [
    {
      label: "Total Siswa",
      value: "1,247",
      icon: GraduationCap,
      change: "+12%",
      changeType: "increase",
    },
    {
      label: "Total Guru",
      value: "89",
      icon: Music,
      change: "+3%",
      changeType: "increase",
    },
    {
      label: "OSIS",
      value: "24",
      icon: User,
      change: "0%",
      changeType: "stable",
    },
    {
      label: "Konten Aktif",
      value: "156",
      icon: Lock,
      change: "+8%",
      changeType: "increase",
    },
  ];

  const users: UserType[] = [
    {
      id: 1,
      name: "Ahmad Rizki",
      email: "ahmad.rizki@smpipyakin.sch.id",
      role: "Siswa",
      class: "XII IPA 1",
      status: "Active",
      lastLogin: "2 jam yang lalu",
      joinDate: "2023-07-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@smpipyakin.sch.id",
      role: "Guru",
      class: "Matematika",
      status: "Active",
      lastLogin: "1 jam yang lalu",
      joinDate: "2022-01-10",
    },
    {
      id: 3,
      name: "Maya Sari",
      email: "maya.sari@smpipyakin.sch.id",
      role: "Kesiswaan",
      class: "-",
      status: "Active",
      lastLogin: "30 menit yang lalu",
      joinDate: "2021-08-20",
    },
    {
      id: 4,
      name: "Budi Santoso",
      email: "budi.santoso@smpipyakin.sch.id",
      role: "OSIS",
      class: "XI IPS 2",
      status: "Inactive",
      lastLogin: "3 hari yang lalu",
      joinDate: "2023-09-01",
    },
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      type: "alert",
      message: "Server maintenance dijadwalkan malam ini",
      detail: "Maintenance akan dilakukan pukul 23:00 - 02:00 WIB",
      time: "1 jam yang lalu",
      read: false,
    },
    {
      id: 2,
      type: "info",
      message: "Backup database berhasil",
      detail: "Backup otomatis telah selesai dilakukan",
      time: "3 jam yang lalu",
      read: false,
    },
    {
      id: 3,
      type: "success",
      message: "15 pengguna baru terdaftar hari ini",
      detail: "12 siswa dan 3 guru telah bergabung",
      time: "5 jam yang lalu",
      read: true,
    },
  ];

  const activities: ActivityType[] = [
    {
      user: "Sarah Johnson",
      action: "menambahkan pengumuman baru",
      time: "2 jam yang lalu",
      type: "content",
    },
    {
      user: "Ahmad Rizki",
      action: "memperbarui profil siswa",
      time: "4 jam yang lalu",
      type: "profile",
    },
    {
      user: "Maya Sari",
      action: "menghapus berita lama",
      time: "6 jam yang lalu",
      type: "content",
    },
    {
      user: "Budi Santoso",
      action: "menambahkan event kalender",
      time: "8 jam yang lalu",
      type: "calendar",
    },
    {
      user: "Lisa Wijaya",
      action: "memperbarui pengaturan sistem",
      time: "1 hari yang lalu",
      type: "system",
    },
  ];

  const contentItems: ContentItem[] = [
    {
      id: 1,
      title: "Pengumuman Libur Semester",
      type: "Pengumuman",
      author: "Admin Sekolah",
      date: "2025-01-15",
      status: "Published",
      views: 1250,
    },
    {
      id: 2,
      title: "Prestasi Siswa Olimpiade Matematika",
      type: "Berita",
      author: "Sarah Johnson",
      date: "2025-01-14",
      status: "Published",
      views: 890,
    },
    {
      id: 3,
      title: "Jadwal Ujian Tengah Semester",
      type: "Pengumuman",
      author: "Maya Sari",
      date: "2025-01-13",
      status: "Draft",
      views: 0,
    },
  ];

  const handleAddUser = () => {
    setUserModalMode("add");
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setUserModalMode("edit");
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (id: number) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Pengguna",
        message: "Apakah Anda yakin ingin menghapus pengguna ini?",
        description:
          "Tindakan ini tidak dapat dibatalkan dan semua data pengguna akan dihapus secara permanen.",
        type: "danger",
        confirmText: "Ya, Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          // TODO: Implement actual delete API call
          console.log("Delete user:", id);
          // Example API call:
          // const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
          // if (response.ok) {
          //   toast.success("Pengguna berhasil dihapus!");
          //   // Reload users list
          // }
        } catch (error) {
          console.error("Failed to delete user:", error);
          // toast.error("Gagal menghapus pengguna.");
        }
      }
    );
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUserModal(false);
    console.log("User submitted");
  };

  const handleAddContent = () => {
    setShowContentModal(true);
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowContentModal(false);
    console.log("Content submitted");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <Header
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={notifications}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeMenu === "dashboard" && (
            <DashboardContent
              stats={stats}
              activities={activities}
              onAddUser={handleAddUser}
              onAddContent={handleAddContent}
            />
          )}
          {activeMenu === "users" && (
            <UsersTable
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {activeMenu === "content" && (
            <ContentTable
              contentItems={contentItems}
              onAddContent={handleAddContent}
            />
          )}
          {activeMenu === "calendar" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kalender Kegiatan
              </h3>
              <p className="text-gray-600">
                Fitur kalender akan segera tersedia.
              </p>
            </div>
          )}
          {activeMenu === "monitoring" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monitoring Aktivitas
              </h3>
              <p className="text-gray-600">
                Fitur monitoring akan segera tersedia.
              </p>
            </div>
          )}
          {activeMenu === "settings" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pengaturan Sistem
              </h3>
              <p className="text-gray-600">
                Fitur pengaturan akan segera tersedia.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <UserModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        mode={userModalMode}
        selectedUser={selectedUser}
        onSubmit={handleUserSubmit}
      />

      <ContentModal
        show={showContentModal}
        onClose={() => setShowContentModal(false)}
        onSubmit={handleContentSubmit}
      />

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}

      {/* Toast Confirm Modal */}
      <ToastConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.options.title}
        message={confirmModal.options.message}
        description={confirmModal.options.description}
        type={confirmModal.options.type}
        confirmText={confirmModal.options.confirmText}
        cancelText={confirmModal.options.cancelText}
        isLoading={confirmModal.isLoading}
        showCloseButton={confirmModal.options.showCloseButton}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </div>
  );
}

// Wrap with protected route for admin only
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
