"use client";

import { useState } from "react";
import { Home, Clock, History, Menu, Bell } from "lucide-react";
import PendingActivitiesList from "./PendingActivitiesList";
import ActivityHistoryList from "./ActivityHistoryList";
import { DashboardSidebar } from "@/components/dashboard/layout";
import { useSidebar } from "@/hooks/useSidebar";
import { motion } from "framer-motion";

interface OsisActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  budget: number;
  participants: number;
  organizer: string;
  status: string;
  author?: {
    username: string;
  };
}

interface DashboardClientProps {
  pendingActivities: OsisActivity[];
  historyActivities: OsisActivity[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

export default function DashboardClient({
  pendingActivities,
  historyActivities,
}: DashboardClientProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } =
    useSidebar(true);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    {
      id: "pending",
      label: "Menunggu Validasi",
      icon: Clock,
      badge:
        pendingActivities.length > 0 ? pendingActivities.length : undefined,
    },
    { id: "history", label: "Riwayat Validasi", icon: History },
  ];

  const pembinaAvatar =
    "https://ui-avatars.com/api/?name=Pembina+OSIS&background=f97316&color=fff&size=128&bold=true";

  // Dashboard content
  const renderDashboardContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <h3 className="tracking-tight text-sm font-medium opacity-90">
              Menunggu Validasi
            </h3>
            <Clock className="h-4 w-4 opacity-75" />
          </div>
          <div>
            <div className="text-3xl font-bold">{pendingActivities.length}</div>
            <p className="text-xs opacity-75 mt-1">Proposal baru</p>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <h3 className="tracking-tight text-sm font-medium text-gray-600">
              Total Diproses
            </h3>
            <History className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {historyActivities.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Disetujui/Ditolak</p>
          </div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-green-50 to-green-100 shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <h3 className="tracking-tight text-sm font-medium text-green-700">
              Tingkat Approval
            </h3>
            <History className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-green-700">
              {historyActivities.length > 0
                ? Math.round(
                    (historyActivities.filter((a) => a.status === "APPROVED")
                      .length /
                      historyActivities.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-green-600 mt-1">Proposal disetujui</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Terbaru Menunggu
            </h2>
          </div>
          {pendingActivities.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tidak ada proposal yang menunggu validasi
            </p>
          ) : (
            <div className="space-y-3">
              {pendingActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-sm text-gray-900">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString("id-ID")} •{" "}
                    {activity.organizer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Riwayat Terbaru
            </h2>
          </div>
          {historyActivities.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada riwayat validasi</p>
          ) : (
            <div className="space-y-3">
              {historyActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        activity.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : activity.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {activity.status === "APPROVED"
                        ? "Disetujui"
                        : activity.status === "REJECTED"
                          ? "Ditolak"
                          : activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="Pembina OSIS"
        subtitle="OSIS SUPERVISOR"
        userRole="Pembina OSIS"
        userAvatar={pembinaAvatar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-4 sticky top-0 z-40"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-orange-50 transition-all duration-200 group"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  {activeMenu === "dashboard" && (
                    <Home className="w-5 h-5 text-orange-600" />
                  )}
                  {activeMenu === "pending" && (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )}
                  {activeMenu === "history" && (
                    <History className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {activeMenu === "dashboard" && "Dashboard Pembina OSIS"}
                    {activeMenu === "pending" && "Validasi Proposal"}
                    {activeMenu === "history" && "Riwayat Validasi"}
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {activeMenu === "dashboard" &&
                      "Pantau dan kelola proposal OSIS"}
                    {activeMenu === "pending" &&
                      "Review dan approve proposal program kerja"}
                    {activeMenu === "history" &&
                      "Lihat riwayat proposal yang sudah diproses"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeMenu === "dashboard" && renderDashboardContent()}

          {activeMenu === "pending" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PendingActivitiesList activities={pendingActivities} />
            </motion.div>
          )}

          {activeMenu === "history" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ActivityHistoryList activities={historyActivities} />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
