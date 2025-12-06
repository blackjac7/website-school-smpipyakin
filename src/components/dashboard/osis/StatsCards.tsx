"use client";

import { Calendar as CalendarIcon, Clock, Check, X } from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      label: "Total Kegiatan",
      value: "8",
      icon: CalendarIcon,
      color: "text-blue-600",
    },
    {
      label: "Menunggu Approval",
      value: "2",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Disetujui",
      value: "5",
      icon: Check,
      color: "text-green-600",
    },
    {
      label: "Ditolak",
      value: "1",
      icon: X,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
