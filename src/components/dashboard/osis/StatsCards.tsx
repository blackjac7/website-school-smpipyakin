"use client";

import { Calendar as CalendarIcon, Clock, Check, Banknote, ArrowUpRight } from "lucide-react";
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
      label: "Anggaran Disetujui",
      value: `Rp ${statsData.totalBudget.toLocaleString("id-ID")}`,
      icon: Banknote,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Menunggu Persetujuan",
      value: statsData.pendingProposals.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Program Disetujui",
      value: statsData.approvedCount.toString(),
      icon: Check,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Agenda 30 Hari",
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
      className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 mb-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={item}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.bg} opacity-60`} />
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 leading-tight">
                {stat.label}
              </p>
              <p className="text-lg sm:text-2xl font-black text-gray-950 truncate">
                {stat.value}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-gray-400">
            Data organisasi terkini
            <ArrowUpRight className="h-3 w-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
