"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Calendar as CalendarIcon,
  Newspaper,
  FileText,
  Heart,
  Clock,
} from "lucide-react";
import {
  Header,
  StatsCards,
  ActivitiesList,
  Calendar,
  AddActivityModal,
  EditActivityModal,
  MenuItem,
  OsisActivity,
} from "@/components/dashboard/osis";
import {
  getOsisNotifications,
  markOsisNotificationAsRead,
  OsisNotificationData,
} from "@/actions/osis/notifications";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/layout";
import { getActivities, deleteActivity } from "@/actions/osis/activities";
import {
  getMenstruationRecords,
  getAdzanSchedules,
  getCarpetSchedules,
} from "@/actions/worship";
import NewsManagement from "@/components/dashboard/osis/NewsManagement";
import ReligiousDashboardClient from "@/components/dashboard/osis/worship/ReligiousDashboardClient";
import toast from "react-hot-toast";
import { useSidebar } from "@/hooks/useSidebar";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import { motion } from "framer-motion";
import LatnessScannerContent from "@/components/dashboard/osis/LatnessScannerContent";

function OSISDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<OsisActivity | null>(
    null,
  );
  const [activities, setActivities] = useState<OsisActivity[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<OsisNotificationData[]>(
    [],
  );
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } =
    useSidebar(true);
  const confirmModal = useToastConfirm();

  // Worship Data State
  const [worshipData, setWorshipData] = useState<{
    menstruation: Array<{
      id: string;
      siswaId: string;
      startDate: Date;
      endDate: Date | null;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
      warning: string | null;
      siswa: { name: string | null; class: string | null };
    }>;
    adzan: Array<{
      id: string;
      siswaId: string;
      date: Date;
      prayerTime: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      siswa: { name: string | null; class: string | null };
    }>;
    carpet: Array<{
      id: string;
      date: Date;
      zone: string;
      status: string;
      className: string | null;
      assignments: Array<{
        id: string;
        scheduleId: string;
        siswaId: string;
        siswa: { name: string | null; class: string | null };
      }>;
    }>;
  }>({ menstruation: [], adzan: [], carpet: [] });
  const [loadingWorship, setLoadingWorship] = useState(false);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "activities", label: "Program Kerja (Proker)", icon: FileText },
    { id: "news", label: "Berita Kegiatan", icon: Newspaper },
    { id: "schedule", label: "Jadwal Kegiatan", icon: CalendarIcon },
    { id: "keterlambatan", label: "Scan Keterlambatan", icon: Clock },
    { id: "ibadah", label: "Ibadah", icon: Heart },
  ];

  useEffect(() => {
    fetchActivities();
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const result = await getOsisNotifications({ limit: 3 });
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const result = await markOsisNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    if (activeMenu === "ibadah") {
      fetchWorshipData();
    }
  }, [activeMenu]);

  async function fetchActivities() {
    try {
      const res = await getActivities();
      if (res.success && res.data) {
        setActivities(res.data as unknown as OsisActivity[]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat kegiatan");
    }
  }

  async function fetchWorshipData() {
    setLoadingWorship(true);
    try {
      const now = new Date();
      const [menstruation, adzan, carpet] = await Promise.all([
        getMenstruationRecords(),
        getAdzanSchedules(now),
        getCarpetSchedules(now),
      ]);
      setWorshipData({
        menstruation,
        adzan,
        carpet,
      });
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data ibadah");
    } finally {
      setLoadingWorship(false);
    }
  }

  const handleAddActivity = () => {
    setShowForm(true);
  };

  const handleEditActivity = (activity: OsisActivity) => {
    setEditingActivity(activity);
  };

  const handleDeleteActivity = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Program Kerja",
        message: "Apakah Anda yakin ingin menghapus program kerja ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        const res = await deleteActivity(id);
        if (res.success) {
          toast.success("Program kerja berhasil dihapus");
          fetchActivities();
        } else {
          toast.error(res.error || "Gagal menghapus");
        }
      },
    );
  };

  // Logic to refresh data when modal closes (if successful)
  const handleModalClose = () => {
    setShowForm(false);
    setEditingActivity(null);
    fetchActivities();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderDashboardContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivitiesList
          activities={activities.slice(0, 5)} // Show recent 5
          onAddActivity={handleAddActivity}
          onViewActivity={() => {}}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
        />
        <Calendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />
      </div>
    </motion.div>
  );

  // OSIS avatar - School Blue/Yellow theme
  const osisAvatar =
    "https://ui-avatars.com/api/?name=OSIS&background=1E3A8A&color=fff&size=128&bold=true";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="OSIS Center"
        subtitle="STUDENT COUNCIL"
        userRole="Pengurus OSIS"
        userAvatar={osisAvatar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={activeMenu}
          onMarkAsRead={handleMarkNotificationAsRead}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeMenu === "dashboard" && renderDashboardContent()}

          {activeMenu === "activities" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <ActivitiesList
                activities={activities}
                onAddActivity={handleAddActivity}
                onViewActivity={() => {}}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            </motion.div>
          )}

          {activeMenu === "news" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <NewsManagement />
            </motion.div>
          )}

          {activeMenu === "schedule" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Calendar
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
            </motion.div>
          )}

          {activeMenu === "keterlambatan" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LatnessScannerContent />
            </motion.div>
          )}

          {activeMenu === "ibadah" &&
            (loadingWorship ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ReligiousDashboardClient
                  menstruationRecords={worshipData.menstruation}
                  adzanSchedules={worshipData.adzan}
                  carpetSchedules={worshipData.carpet}
                  onRefresh={fetchWorshipData}
                />
              </motion.div>
            ))}
        </main>
      </div>

      <AddActivityModal isOpen={showForm} onClose={handleModalClose} />

      <EditActivityModal
        isOpen={!!editingActivity}
        onClose={handleModalClose}
        activity={editingActivity}
      />

      <ToastConfirmModal
        isOpen={confirmModal.isOpen}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        {...confirmModal.options}
      />

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

export default function OSISDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["osis"]}>
      <OSISDashboard />
    </ProtectedRoute>
  );
}
