"use client";

import { Calendar as CalendarIcon, Clock, Check, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { getOsisStats } from "@/actions/osis/stats";

export default function StatsCards() {
  const [statsData, setStatsData] = useState({
    totalBudget: 0,
    pendingProposals: 0,
    approvedCount: 0,
    upcomingCount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const res = await getOsisStats();
      if (res.success && res.data) {
        setStatsData(res.data);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Total Budget (Appr)",
      value: `Rp ${statsData.totalBudget.toLocaleString("id-ID")}`,
      icon: Banknote,
      color: "text-blue-600",
    },
    {
      label: "Proposal Pending",
      value: statsData.pendingProposals.toString(),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Kegiatan Disetujui",
      value: statsData.approvedCount.toString(),
      icon: Check,
      color: "text-green-600",
    },
    {
      label: "Kegiatan Mendatang",
      value: statsData.upcomingCount.toString(),
      icon: CalendarIcon,
      color: "text-purple-600",
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
