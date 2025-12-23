"use client";

import {
  Bell,
  Menu,
  Home,
  Trophy,
  BookOpen,
  BellOff,
  LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormattedNotification } from "@/utils/notificationHelpers";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface StudentHeaderProps {
  notifications: FormattedNotification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  unreadCount: number;
  onToggleSidebar?: () => void;
  markAsRead: (id: string) => void;
  onEditProfile?: () => void;
  activeTab?: string;
}

// Get dynamic header info based on active tab
const getHeaderInfo = (
  activeTab?: string
): { icon: LucideIcon; title: string; subtitle: string } => {
  switch (activeTab) {
    case "achievements":
      return {
        icon: Trophy,
        title: "Prestasi Saya",
        subtitle: "Lihat dan kelola prestasi yang telah diraih",
      };
    case "works":
      return {
        icon: BookOpen,
        title: "Karya Saya",
        subtitle: "Upload dan kelola karya terbaikmu",
      };
    default:
      return {
        icon: Home,
        title: "Dashboard Siswa",
        subtitle: "Selamat datang kembali!",
      };
  }
};

export default function StudentHeader({
  notifications,
  showNotifications,
  setShowNotifications,
  unreadCount,
  onToggleSidebar,
  markAsRead,
  onEditProfile,
  activeTab,
}: StudentHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const headerInfo = getHeaderInfo(activeTab);
  const HeaderIcon = headerInfo.icon;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 md:px-6 py-4"
    >
      <div className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-3">
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
            <div className="hidden sm:flex p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <HeaderIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                {headerInfo.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {activeTab === "dashboard"
                  ? `Selamat datang, ${user?.name || user?.username || "Siswa"}!`
                  : headerInfo.subtitle}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
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
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }
              `}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
            >
              <Bell className="w-5 h-5" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-lg"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-[90vw] sm:w-80 max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
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
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`
                              w-9 h-9 rounded-full flex items-center justify-center shrink-0
                              ${notification.color?.replace("text-", "bg-").replace("600", "100") || "bg-gray-100"}
                            `}
                            >
                              <notification.icon
                                className={`w-4 h-4 ${notification.color || "text-gray-500"}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} text-gray-900 truncate`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1.5">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shrink-0 ring-4 ring-blue-100" />
                            )}
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

                  {notifications.length > 0 && (
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          router.push("/dashboard-siswa/notifications");
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Lihat Semua Notifikasi
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:block h-6 w-px bg-gray-200 mx-1" />

          {/* Profile Dropdown (Handled by LogoutButton for now, but styled) */}
          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "Siswa"}
            userRole="Siswa"
            onEditProfile={onEditProfile}
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={(n) => markAsRead(n.id)}
            onViewAllNotifications={() =>
              router.push("/dashboard-siswa/notifications")
            }
          />
        </div>
      </div>
    </motion.header>
  );
}
