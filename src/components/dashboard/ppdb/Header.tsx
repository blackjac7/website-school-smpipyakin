"use client";

import { Menu, Bell, FileText, Settings2, BellOff, Users, BarChart3 } from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { FormattedNotification } from "@/utils/notificationHelpers";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  activeMenu: string;
  onToggleSidebar?: () => void;
  notifications?: FormattedNotification[];
  showNotifications?: boolean;
  setShowNotifications?: (show: boolean) => void;
  unreadCount?: number;
  markAsRead?: (id: string) => void;
}

const getHeaderInfo = (activeMenu: string) => {
  switch (activeMenu) {
    case "validation":
      return {
        title: "Validasi Pendaftar",
        subtitle: "Kelola dan validasi data calon siswa baru",
        icon: Users,
      };
    case "reports":
      return {
        title: "Laporan PPDB",
        subtitle: "Analisis data dan laporan pendaftaran",
        icon: BarChart3,
      };
    case "settings":
      return {
        title: "Pengaturan PPDB",
        subtitle: "Konfigurasi sistem penerimaan siswa baru",
        icon: Settings2,
      };
    default:
      return {
        title: "Dashboard PPDB",
        subtitle: "Sistem Penerimaan Peserta Didik Baru",
        icon: FileText,
      };
  }
};

export default function Header({
  activeMenu,
  onToggleSidebar,
  notifications = [],
  showNotifications = false,
  setShowNotifications,
  unreadCount = 0,
  markAsRead,
}: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const headerInfo = getHeaderInfo(activeMenu);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-md border-b border-amber-100 px-4 md:px-6 py-4 shadow-sm sticky top-0 z-40"
    >
      <div className="flex justify-between items-center min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-amber-50 transition-all duration-200 cursor-pointer group flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </button>
          )}
          <motion.div
            key={activeMenu}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="hidden sm:flex p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-200 flex-shrink-0">
              <headerInfo.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {headerInfo.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 hidden md:block truncate">
                {headerInfo.subtitle}
              </p>
            </div>
          </motion.div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {/* Notification Bell - Desktop Only */}
          <div className="relative hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setShowNotifications && setShowNotifications(!showNotifications)
              }
              className={`relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                showNotifications
                  ? "bg-amber-100 text-amber-600"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
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
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg"
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
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      Notifikasi
                    </h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
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
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-amber-50/50" : ""}`}
                          onClick={() =>
                            markAsRead && markAsRead(notification.id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <notification.icon
                              className={`w-4 h-4 ${notification.color} mt-1 flex-shrink-0`}
                            />
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
                              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-amber-100"></div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                      </div>
                    )}
                  </div>

                  {/* View All Notifications Button */}
                  {notifications.length > 0 && (
                    <div className="p-3 text-center border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={() => {
                          if (setShowNotifications) {
                            setShowNotifications(false);
                          }
                          router.push("/dashboard-ppdb-officer/notifications");
                        }}
                        className="text-sm text-amber-600 hover:text-orange-600 font-medium transition-colors cursor-pointer"
                      >
                        Lihat Semua Notifikasi
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "PPDB Officer"}
            userRole="Officer PPDB"
            className="flex-shrink-0"
            // Mobile notifications props
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={(notification) =>
              markAsRead && markAsRead(notification.id)
            }
            onViewAllNotifications={() => {
              router.push("/dashboard-ppdb-officer/notifications");
            }}
          />
        </div>
      </div>
    </header>
  );
}
