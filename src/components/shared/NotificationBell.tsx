"use client";

import React from "react";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
  bellSize?: number;
  badgeSize?: number;
}

export default function NotificationBell({
  unreadCount,
  onClick,
  className = "relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer",
  bellSize = 5,
  badgeSize = 5,
}: NotificationBellProps) {
  return (
    <button onClick={onClick} className={className}>
      <Bell className={`w-${bellSize} h-${bellSize}`} />
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-${badgeSize} h-${badgeSize} flex items-center justify-center`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
