"use client";

import { useEffect, useState } from "react";
import { Home, Calendar as CalendarIcon, Newspaper, FileText, Heart } from "lucide-react";
import {
  Header,
  StatsCards,
  ActivitiesList,
  Calendar,
  AddActivityModal,
  // EditActivityModal, // Removed for now, reusing add form or custom edit might be better
  MenuItem,
  OsisActivity,
  Notification,
} from "@/components/dashboard/osis";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/layout";
import { getActivities, deleteActivity } from "@/actions/osis/activities";
import { getMenstruationRecords, getAdzanSchedules, getCarpetSchedules } from "@/actions/worship";
import NewsManagement from "@/components/dashboard/osis/NewsManagement";
import ReligiousDashboardClient from "@/components/dashboard/osis/worship/ReligiousDashboardClient";
import toast from "react-hot-toast";

function OSISDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState<OsisActivity[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [loading, setLoading] = useState(true);

  // Worship Data State
  const [worshipData, setWorshipData] = useState<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      menstruation: any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adzan: any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      carpet: any[]
  }>({ menstruation: [], adzan: [], carpet: [] });
  const [loadingWorship, setLoadingWorship] = useState(false);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "activities", label: "Program Kerja", icon: FileText },
    { id: "news", label: "Berita & Kegiatan", icon: Newspaper },
    { id: "schedule", label: "Jadwal Kegiatan", icon: CalendarIcon },
    { id: "ibadah", label: "Ibadah", icon: Heart },
  ];

  // Dummy notifications for now (Server Action not implemented for notifs yet)
  const notifications: Notification[] = [
    {
      id: 1,
      message: "Selamat datang di Dashboard OSIS",
      detail: "Silakan lengkapi program kerja anda.",
      time: "Baru saja",
      type: "info",
      read: false,
    },
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activeMenu === 'ibadah') {
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
    } finally {
      // setLoading(false);
    }
  }

  async function fetchWorshipData() {
    setLoadingWorship(true);
    try {
        const now = new Date();
        const [menstruation, adzan, carpet] = await Promise.all([
            getMenstruationRecords(),
            getAdzanSchedules(now),
            getCarpetSchedules(now)
        ]);
        setWorshipData({
            menstruation,
            adzan,
            carpet
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

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus kegiatan ini?")) return;
    const res = await deleteActivity(id);
    if (res.success) {
      toast.success("Kegiatan berhasil dihapus");
      fetchActivities();
    } else {
      toast.error(res.error || "Gagal menghapus");
    }
  };

  // Logic to refresh data when modal closes (if successful)
  const handleModalClose = () => {
      setShowForm(false);
      fetchActivities();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderDashboardContent = () => (
    <>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivitiesList
          activities={activities.slice(0, 5)} // Show recent 5
          onAddActivity={handleAddActivity}
          onViewActivity={() => {}}
          onEditActivity={() => {}}
          onDeleteActivity={handleDeleteActivity}
        />
        <Calendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="OSIS Center"
        subtitle="STUDENT COUNCIL"
        userRole="Pengurus OSIS"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeMenu === "dashboard" && renderDashboardContent()}

          {activeMenu === "activities" && (
             <div className="space-y-6">
                 <ActivitiesList
                    activities={activities}
                    onAddActivity={handleAddActivity}
                    onViewActivity={() => {}}
                    onEditActivity={() => {}} // TODO: Implement edit
                    onDeleteActivity={handleDeleteActivity}
                />
             </div>
          )}

          {activeMenu === "news" && <NewsManagement />}

          {activeMenu === "schedule" && (
            <Calendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          )}

          {activeMenu === "ibadah" && (
            loadingWorship ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <ReligiousDashboardClient
                    menstruationRecords={worshipData.menstruation}
                    adzanSchedules={worshipData.adzan}
                    carpetSchedules={worshipData.carpet}
                />
            )
          )}
        </main>
      </div>

      <AddActivityModal
        isOpen={showForm}
        onClose={handleModalClose}
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
