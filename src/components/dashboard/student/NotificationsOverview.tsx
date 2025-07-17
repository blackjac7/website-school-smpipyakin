"use client";

import { Notification } from "./types";

interface NotificationsOverviewProps {
  notifications: Notification[];
}

export default function NotificationsOverview({
  notifications,
}: NotificationsOverviewProps) {
  return (
    <div className="space-y-4 mb-8">
      {notifications.slice(0, 2).map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-start gap-3">
            <notification.icon
              className={`w-5 h-5 ${notification.color} mt-0.5`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.detail}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
