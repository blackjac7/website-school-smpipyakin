"use client";

import {
  Bell,
  Menu,
  CheckCircle,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { Notification } from "./types";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  activeMenu: string;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  unreadCount: number;
  onToggleSidebar?: () => void;
}

export default function Header({
  activeMenu,
  notifications,
  showNotifications,
  setShowNotifications,
  unreadCount,
  onToggleSidebar,
}: HeaderProps) {
  const { user } = useAuth();

  const getHeaderInfo = () => {
    switch (activeMenu) {
      case "validation":
        return {
          title: "Validasi Konten",
          description: "Review dan validasi konten dari OSIS dan siswa",
          icon: CheckCircle,
        };
      case "students":
        return {
          title: "Data Siswa",
          description: "Kelola data dan informasi siswa",
          icon: Users,
        };
      case "reports":
        return {
          title: "Laporan Validasi",
          description: "Analisis dan statistik validasi konten",
          icon: FileText,
        };
      default:
        return {
          title: "Pengaturan",
          description: "Pengaturan sistem validasi",
          icon: Settings,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-4"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-10 h-10 bg-linear-to-br from-purple-500 to-violet-600 rounded-xl items-center justify-center shadow-sm">
              <headerInfo.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {headerInfo.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 hidden md:block">
                {headerInfo.description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                relative p-2.5 rounded-full transition-all duration-200
                ${
                  showNotifications
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-500 hover:text-purple-600 hover:bg-gray-100"
                }
              `}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                />
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 ring-1 ring-black/5"
                >
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Tidak ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? "bg-purple-50/50" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                notification.type === "success"
                                  ? "bg-green-500"
                                  : notification.type === "pending"
                                    ? "bg-yellow-500"
                                    : "bg-purple-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${!notification.read ? "font-medium" : ""} text-gray-900`}
                              >
                                {notification.title || notification.type}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "Staff Kesiswaan"}
            userRole="Kesiswaan"
            className="ml-2"
          />
        </div>
      </div>
    </motion.header>
  );
}
