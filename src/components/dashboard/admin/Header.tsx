"use client";

import {
  Bell,
  Menu,
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Users,
  Image,
  BarChart3,
  Settings,
  BellOff,
} from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { Notification } from "./types";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: Notification[];
  onToggleSidebar?: () => void;
  activeTab?: string;
}

// Get dynamic header info based on active tab
const getHeaderInfo = (activeTab?: string) => {
  switch (activeTab) {
    case "news":
      return {
        icon: Newspaper,
        title: "Manajemen Berita",
        subtitle: "Kelola berita dan artikel sekolah",
      };
    case "announcements":
      return {
        icon: Newspaper,
        title: "Manajemen Pengumuman",
        subtitle: "Kelola pengumuman sekolah",
      };
    case "calendar":
      return {
        icon: CalendarDays,
        title: "Kalender Akademik",
        subtitle: "Kelola jadwal dan kegiatan sekolah",
      };
    case "users":
      return {
        icon: Users,
        title: "Manajemen Pengguna",
        subtitle: "Kelola akun pengguna sistem",
      };
    case "hero":
      return {
        icon: Image,
        title: "Hero & Banner",
        subtitle: "Kelola tampilan hero section website",
      };
    case "stats":
      return {
        icon: BarChart3,
        title: "Statistik Sekolah",
        subtitle: "Kelola data statistik sekolah",
      };
    case "settings":
      return {
        icon: Settings,
        title: "Pengaturan",
        subtitle: "Konfigurasi sistem dashboard",
      };
    default:
      return {
        icon: LayoutDashboard,
        title: "Dashboard Admin",
        subtitle: "Kelola dan pantau sistem website sekolah",
      };
  }
};

export default function Header({
  showNotifications,
  setShowNotifications,
  notifications,
  onToggleSidebar,
  activeTab,
}: HeaderProps) {
  const { user } = useAuth();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const headerInfo = getHeaderInfo(activeTab);
  const HeaderIcon = headerInfo.icon;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 md:px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
          )}
          <motion.div
            key={activeTab}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="hidden sm:flex p-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <HeaderIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                {headerInfo.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {headerInfo.subtitle}
              </p>
            </div>
          </motion.div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                showNotifications
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
            >
              <Bell className="w-5 h-5" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-lg"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-[90vw] sm:w-80 max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      Notifikasi
                    </h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        {unreadCount} notifikasi belum dibaca
                      </p>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-4 ring-opacity-20 ${
                                notification.type === "alert"
                                  ? "bg-red-500 ring-red-500"
                                  : notification.type === "success"
                                    ? "bg-green-500 ring-green-500"
                                    : "bg-blue-500 ring-blue-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} text-gray-900 truncate`}
                              >
                                {notification.title || notification.type}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1.5">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          Belum ada notifikasi
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "Admin System"}
            userRole={user?.role || "Administrator"}
            className="ml-1 md:ml-2"
          />
        </div>
      </div>
    </motion.header>
  );
}
