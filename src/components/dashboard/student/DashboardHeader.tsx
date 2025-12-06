"use client";

import { User, Bell } from "lucide-react";
import { Notification } from "./types";
import { LogoutButton } from "@/components/shared";

interface DashboardHeaderProps {
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  markAsRead: (id: number) => void;
  unreadCount: number;
}

/**
 * DashboardHeader component for the student dashboard.
 * Displays the dashboard title, user profile, and notifications dropdown.
 * @param {DashboardHeaderProps} props - The component props.
 * @param {Notification[]} props.notifications - List of notifications.
 * @param {boolean} props.showNotifications - Whether to show the notifications dropdown.
 * @param {function} props.setShowNotifications - Function to toggle notification dropdown visibility.
 * @param {function} props.markAsRead - Function to mark a notification as read.
 * @param {number} props.unreadCount - Number of unread notifications.
 * @returns {JSX.Element} The rendered DashboardHeader component.
 */
export default function DashboardHeader({
  notifications,
  showNotifications,
  setShowNotifications,
  markAsRead,
  unreadCount,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              Student Dashboard
            </h1>
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
                <div className="absolute right-0 mt-2 w-[90vw] sm:w-96 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifikasi
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <notification.icon
                            className={`w-5 h-5 ${notification.color} mt-0.5`}
                          />
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
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            <LogoutButton
              variant="profile"
              userName="Student Name"
              userRole="Siswa"
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
