"use client";

import { Menu, Bell, FileText, Settings2 } from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { FormattedNotification } from "@/utils/notificationHelpers";
import { useRouter } from "next/navigation";

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
        icon: FileText,
      };
    case "reports":
      return {
        title: "Laporan PPDB",
        subtitle: "Analisis data dan laporan pendaftaran",
        icon: FileText,
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
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-amber-500 hover:text-white transition-colors cursor-pointer group flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </button>
          )}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <headerInfo.icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent truncate">
                {headerInfo.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block truncate">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {/* Notification Bell - Desktop Only */}
          <div className="relative hidden md:block">
            <button
              onClick={() =>
                setShowNotifications && setShowNotifications(!showNotifications)
              }
              className="relative p-2 text-gray-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
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
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-amber-50" : ""}`}
                        onClick={() =>
                          markAsRead && markAsRead(notification.id)
                        }
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
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
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
              </div>
            )}
          </div>

          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "PPDB Officer"}
            userRole="Officer PPDB"
            className="flex-shrink-0" // Removed ml-2 to save space and added flex-shrink-0
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
