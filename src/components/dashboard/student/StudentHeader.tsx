"use client";

import { Bell, Menu } from "lucide-react";
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
}

export default function StudentHeader({
  notifications,
  showNotifications,
  setShowNotifications,
  unreadCount,
  onToggleSidebar,
  markAsRead,
  onEditProfile,
}: StudentHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3.5"
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="hidden md:flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Dashboard Siswa
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Selamat datang kembali, {user?.username}
            </p>
          </div>
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
                ${showNotifications
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"}
              `}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                />
              )}
            </motion.button>

            {/* Dropdown */}
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
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`
                              p-4 cursor-pointer transition-colors hover:bg-gray-50
                              ${!notification.read ? "bg-blue-50/30" : "bg-white"}
                            `}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex gap-3.5">
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                ${notification.color?.replace('text-', 'bg-').replace('600', '100') || 'bg-gray-100'}
                              `}>
                                <notification.icon className={`w-5 h-5 ${notification.color || 'text-gray-500'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm text-gray-900 leading-snug ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 px-6 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
                        <p className="text-xs text-gray-400 mt-1">Kami akan memberi tahu Anda jika ada pembaruan</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        router.push("/dashboard-siswa/notifications");
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Lihat Semua Aktivitas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Profile Dropdown (Handled by LogoutButton for now, but styled) */}
          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "Siswa"}
            userRole="Siswa"
            onEditProfile={onEditProfile}
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={(n) => markAsRead(n.id)}
            onViewAllNotifications={() => router.push("/dashboard-siswa/notifications")}
          />
        </div>
      </div>
    </motion.header>
  );
}
