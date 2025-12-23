"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Users, Palette, FolderOpen } from "lucide-react";

interface KaryaStatsProps {
  stats: {
    totalWorks: number;
    totalPhotos: number;
    totalStudents: number;
    categories: { name: string; count: number }[];
  } | null;
}

export default function KaryaStats({ stats }: KaryaStatsProps) {
  if (!stats) return null;

  const statItems = [
    {
      icon: FolderOpen,
      value: stats.totalWorks,
      label: "Total Karya",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: ImageIcon,
      value: stats.totalPhotos,
      label: "Foto & Gambar",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Users,
      value: stats.totalStudents,
      label: "Siswa Kontributor",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Palette,
      value: stats.categories.length,
      label: "Kategori",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${item.bgColor} rounded-2xl p-5 text-center group hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all duration-300`}
        >
          <div
            className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <item.icon className="w-6 h-6 text-white" />
          </div>
          <div className={`text-3xl font-bold ${item.textColor}`}>
            {item.value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
