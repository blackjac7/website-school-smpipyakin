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
  const baseClassName = `group w-full rounded-2xl border p-4 text-left transition sm:p-5 ${
    !notification.read
      ? "border-blue-200 bg-blue-50/70 shadow-sm hover:border-blue-300 hover:bg-blue-50"
      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
  } ${onClick ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2" : ""}`;

  const content = (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!notification.read ? "bg-blue-100" : "bg-slate-100"}`}>
        <notification.icon className={`h-5 w-5 ${notification.color}`} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className={`text-sm text-slate-950 ${!notification.read ? "font-bold" : "font-semibold"}`}>{notification.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">{notification.time}</p>
          </div>
          {showReadIndicator && !notification.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" aria-label="Belum dibaca" />}
        </div>
      </div>
    </div>
  );

  return onClick ? (
    <button type="button" className={className || baseClassName} onClick={() => onClick(notification)}>{content}</button>
  ) : (
    <article className={className || baseClassName}>{content}</article>
  );
}
