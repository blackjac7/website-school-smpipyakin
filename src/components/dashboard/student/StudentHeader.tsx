"use client";

import { Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormattedNotification } from "@/utils/notificationHelpers";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";

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
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors cursor-pointer group"
            >
              <Menu className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </button>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Siswa
            </h2>
            <p className="text-sm text-gray-600">
              Kelola profil, prestasi, dan karya Anda
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell - Desktop Only */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[90vw] sm:w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifikasi
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-blue-50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <notification.icon
                            className={`w-4 h-4 ${notification.color} mt-1 flex-shrink-0`}
                          />
                          <div className="flex-1">
                            <p
                              className={`text-sm ${!notification.read ? "font-medium" : ""} text-gray-900`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">Tidak ada notifikasi</p>
                    </div>
                  )}
                </div>

                {/* View All Notifications Button */}
                {notifications.length > 0 && (
                  <div className="p-3 text-center border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        router.push("/dashboard-siswa/notifications");
                      }}
                      className="text-sm text-blue-600 hover:text-purple-600 font-medium transition-colors cursor-pointer"
                    >
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "Siswa"}
            userRole="Siswa"
            className="ml-2"
            onEditProfile={onEditProfile}
            // Mobile notifications props
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={(notification) => markAsRead(notification.id)}
            onViewAllNotifications={() => {
              router.push("/dashboard-siswa/notifications");
            }}
          />
        </div>
      </div>
    </header>
  );
}
