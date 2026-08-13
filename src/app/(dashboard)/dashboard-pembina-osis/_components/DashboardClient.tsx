"use client";

import { useState } from "react";
import { Home, Clock, History, Menu, ArrowRight } from "lucide-react";
import PendingActivitiesList from "./PendingActivitiesList";
import ActivityHistoryList from "./ActivityHistoryList";
import { DashboardSidebar, getWorkspaceMenu, getWorkspacePageMeta } from "@/components/dashboard/layout";
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

  const menuItems: MenuItem[] = getWorkspaceMenu("pembina-osis").map((item) =>
    item.id === "pending"
      ? { ...item, badge: pendingActivities.length || undefined }
      : { ...item },
  );

  const pembinaAvatar =
    "https://ui-avatars.com/api/?name=Pembina+OSIS&background=f97316&color=fff&size=128&bold=true";

  const pageMeta = getWorkspacePageMeta("pembina-osis", activeMenu);
  const PageIcon = pageMeta.icon;

  // Dashboard content
  const renderDashboardContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-7xl space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button type="button" onClick={() => setActiveMenu("pending")} className="group rounded-2xl bg-blue-700 p-5 text-left text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <h3 className="tracking-tight text-sm font-medium opacity-90">
              Menunggu Validasi
            </h3>
            <Clock className="h-4 w-4 opacity-75" />
          </div>
          <div>
            <div className="text-3xl font-bold">{pendingActivities.length}</div>
            <p className="mt-1 text-xs text-blue-100">Proposal baru</p>
          </div>
          <ArrowRight className="mt-4 h-4 w-4 text-blue-200 transition group-hover:translate-x-1" aria-hidden="true" />
        </button>

        <button type="button" onClick={() => setActiveMenu("history")} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
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
            <p className="mt-1 text-xs text-slate-500">Disetujui atau ditolak</p>
          </div>
          <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" aria-hidden="true" />
        </button>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
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
            <p className="mt-1 text-xs text-emerald-700">Proposal disetujui</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-labelledby="pending-preview" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 id="pending-preview" className="text-lg font-semibold text-gray-900">
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
                <button type="button" key={activity.id} onClick={() => setActiveMenu("pending")} className="w-full rounded-xl border border-transparent bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <h3 className="font-medium text-sm text-gray-900">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString("id-ID")} •{" "}
                    {activity.organizer}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="history-preview" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-600" />
            <h2 id="history-preview" className="text-lg font-semibold text-gray-900">
              Riwayat Terbaru
            </h2>
          </div>
          {historyActivities.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada riwayat validasi</p>
          ) : (
            <div className="space-y-3">
              {historyActivities.slice(0, 3).map((activity) => (
                <button type="button" key={activity.id} onClick={() => setActiveMenu("history")} className="w-full rounded-xl border border-transparent bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
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
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );

  return (
    <div className="dashboard-shell flex min-h-dvh overflow-hidden bg-slate-50">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="Pembina OSIS"
        subtitle="PENDAMPING ORGANISASI"
        userRole="Pembina OSIS"
        userAvatar={pembinaAvatar}
        workspace="pembina-osis"
      />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6"
        >
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 lg:hidden"
                aria-label={isSidebarOpen ? "Tutup navigasi" : "Buka navigasi"}
                aria-controls="pembina-osis-navigation"
                aria-expanded={isSidebarOpen}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
                <PageIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg">
                  {pageMeta.title}
                </h1>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {pageMeta.description}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <main id="main-content" className="dashboard-workspace min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7">
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
