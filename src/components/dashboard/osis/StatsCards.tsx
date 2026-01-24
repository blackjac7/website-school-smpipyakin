"use client";

import { Calendar as CalendarIcon, Clock, Check, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { getOsisStats } from "@/actions/osis/stats";
import { motion } from "framer-motion";

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
      bg: "bg-blue-50",
    },
    {
      label: "Proposal Pending",
      value: statsData.pendingProposals.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Proker Disetujui",
      value: statsData.approvedCount.toString(),
      icon: Check,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Proker Mendatang",
      value: statsData.upcomingCount.toString(),
      icon: CalendarIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={item}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
