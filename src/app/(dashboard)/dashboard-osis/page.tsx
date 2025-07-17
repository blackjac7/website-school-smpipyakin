"use client";

import { useState } from "react";
import { Home, Plus, Calendar as CalendarIcon } from "lucide-react";
import {
  Sidebar,
  Header,
  StatsCards,
  ActivitiesList,
  Calendar,
  ValidationStatusCard,
  AddActivityModal,
  EditActivityModal,
  MenuItem,
  Activity,
  Notification,
  ValidationStatus,
} from "@/components/dashboard/osis";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function OSISDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "add-activity", label: "Tambah Kegiatan", icon: Plus },
    { id: "schedule", label: "Jadwal Kegiatan", icon: CalendarIcon },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      title: "Bakti Sosial ke Panti Asuhan",
      description:
        "Kegiatan bakti sosial yang melibatkan seluruh anggota OSIS untuk membantu anak-anak panti asuhan dengan donasi dan kegiatan mengajar.",
      date: "2024-12-20",
      time: "08:00",
      location: "Panti Asuhan Harapan",
      status: "Disetujui",
      participants: 45,
      budget: 1000000,
      organizer: "Ahmad Rizki",
    },
    {
      id: 2,
      title: "Lomba Kebersihan Antar Kelas",
      description:
        "Kompetisi kebersihan lingkungan sekolah dengan hadiah menarik untuk kelas yang paling bersih dan hijau.",
      date: "2024-12-22",
      time: "07:30",
      location: "Seluruh Area Sekolah",
      status: "Menunggu Persetujuan",
      participants: 350,
      budget: 500000,
      organizer: "Siti Nurhaliza",
    },
    {
      id: 3,
      title: "Workshop Kewirausahaan Siswa",
      description:
        "Pelatihan kewirausahaan untuk siswa dengan menghadirkan praktisi bisnis muda yang sukses sebagai pembicara.",
      date: "2024-12-25",
      time: "13:00",
      location: "Aula Sekolah",
      status: "Menunggu Persetujuan",
      participants: 100,
      budget: 2000000,
      organizer: "Budi Santoso",
    },
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      message: "Kegiatan Bakti Sosial disetujui",
      detail:
        "Proposal kegiatan bakti sosial ke panti asuhan telah mendapat persetujuan dari kesiswaan",
      time: "2 jam yang lalu",
      type: "success",
      read: false,
    },
    {
      id: 2,
      message: "Reminder: Deadline proposal",
      detail:
        "Batas waktu pengumpulan proposal kegiatan bulan depan adalah 3 hari lagi",
      time: "1 hari yang lalu",
      type: "pending",
      read: true,
    },
    {
      id: 3,
      message: "Jadwal rapat OSIS",
      detail: "Rapat evaluasi kegiatan akan diadakan hari Jumat jam 15:00",
      time: "2 hari yang lalu",
      type: "info",
      read: true,
    },
  ];

  const validationStatus: ValidationStatus[] = [
    {
      label: "Disetujui",
      count: 12,
      color: "green",
    },
    {
      label: "Menunggu",
      count: 5,
      color: "yellow",
    },
    {
      label: "Ditolak",
      count: 2,
      color: "red",
    },
  ];

  const handleAddActivity = () => {
    setActiveMenu("add-activity");
    setShowForm(true);
  };

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowEditForm(true);
  };

  const handleDeleteActivity = (activityId: number) => {
    console.log("Delete activity:", activityId);
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    // Handle form submission
  };

  const handleUpdateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditForm(false);
    // Handle update
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderDashboardContent = () => (
    <>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivitiesList
          activities={activities}
          onAddActivity={handleAddActivity}
          onViewActivity={handleViewActivity}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
        />
        <Calendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />
        <ValidationStatusCard validationStatus={validationStatus} />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
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
          {activeMenu === "add-activity" && !showForm && (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Kegiatan Baru
              </button>
            </div>
          )}
          {activeMenu === "schedule" && (
            <Calendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          )}
        </main>
      </div>

      <AddActivityModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmitActivity}
      />

      <EditActivityModal
        isOpen={showEditForm}
        activity={selectedActivity}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdateActivity}
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

// Wrap with protected route for admin, kesiswaan, and osis
export default function OSISDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["osis"]}>
      <OSISDashboard />
    </ProtectedRoute>
  );
}
