import { Bell, Menu } from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { Notification } from "./types";

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: Notification[];
  onToggleSidebar?: () => void;
}

/**
 * Header component for the admin dashboard.
 * Contains the dashboard title, notification bell with dropdown, and user profile/logout section.
 * @param {HeaderProps} props - The component props.
 * @param {boolean} props.showNotifications - Whether to show the notifications dropdown.
 * @param {function} props.setShowNotifications - Function to toggle notification dropdown visibility.
 * @param {Notification[]} props.notifications - List of notification objects.
 * @param {function} props.onToggleSidebar - Function to toggle the sidebar (for mobile).
 * @returns {JSX.Element} The rendered Header component.
 */
export default function Header({
  showNotifications,
  setShowNotifications,
  notifications,
  onToggleSidebar,
}: HeaderProps) {
  const { user } = useAuth();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Dashboard Admin
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
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
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "alert"
                              ? "bg-red-500"
                              : notification.type === "success"
                                ? "bg-green-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${!notification.read ? "font-medium" : ""} text-gray-900`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.detail}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <LogoutButton
            variant="profile"
            userName={user?.name || user?.username || "Admin System"}
            userRole={user?.role || "Administrator"}
            className="ml-2"
          />
        </div>
      </div>
    </header>
  );
}
