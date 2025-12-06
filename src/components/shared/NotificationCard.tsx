"use client";

import React from "react";
import { FormattedNotification } from "@/utils/notificationHelpers";

interface NotificationCardProps {
  notification: FormattedNotification;
  onClick?: (notification: FormattedNotification) => void;
  className?: string;
  showReadIndicator?: boolean;
}

export default function NotificationCard({
  notification,
  onClick,
  className,
  showReadIndicator = true,
}: NotificationCardProps) {
  const baseClassName = `bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
    !notification.read ? "bg-blue-50 border-blue-200" : ""
  }`;

  return (
    <div
      className={className || baseClassName}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            !notification.read ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          <notification.icon className={`w-5 h-5 ${notification.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`text-sm ${
                  !notification.read ? "font-semibold" : "font-medium"
                } text-gray-900`}
              >
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
            </div>
            {showReadIndicator && !notification.read && (
              <div className="w-3 h-3 bg-blue-500 rounded-full ml-4 mt-1 flex-shrink-0"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
