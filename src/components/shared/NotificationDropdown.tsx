"use client";

import React from "react";
import { Bell } from "lucide-react";
import { FormattedNotification } from "@/utils/notificationHelpers";

interface NotificationDropdownProps {
  notifications: FormattedNotification[];
  showNotifications: boolean;
  onNotificationClick?: (notification: FormattedNotification) => void;
  onViewAllClick?: () => void;
  className?: string;
  maxHeight?: string;
}

export default function NotificationDropdown({
  notifications,
  showNotifications,
  onNotificationClick,
  onViewAllClick,
  className = "absolute right-0 mt-2 w-[90vw] sm:w-96 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-50",
  maxHeight = "max-h-96",
}: NotificationDropdownProps) {
  if (!showNotifications) return null;

  return (
    <div className={className}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
      </div>

      <div className={`${maxHeight} overflow-y-auto`}>
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => onNotificationClick?.(notification)}
            >
              <div className="flex items-start gap-3">
                <notification.icon
                  className={`w-5 h-5 ${notification.color} mt-0.5 flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notification.read ? "font-medium" : ""
                    } text-gray-900 truncate`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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
        )}
      </div>

      {onViewAllClick && notifications.length > 0 && (
        <div className="p-3 text-center border-t border-gray-200">
          <button
            onClick={onViewAllClick}
            className="text-sm text-blue-600 hover:text-orange-500 cursor-pointer transition-colors"
          >
            Lihat Semua Notifikasi
          </button>
        </div>
      )}
    </div>
  );
}
