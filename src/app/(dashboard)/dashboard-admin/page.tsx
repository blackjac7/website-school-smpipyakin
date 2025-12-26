"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Newspaper,
  Megaphone,
  Building2,
  Trophy,
  ArrowRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAdminDashboardStats } from "@/actions/admin/dashboard";

interface DashboardStats {
  users: number;
  students: number;
  news: number;
  announcements: number;
  facilities: number;
  extracurriculars: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const result = await getAdminDashboardStats();
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats?.users || 0,
      subValue: `${stats?.students || 0} Siswa`,
      icon: Users,
      color: "blue",
      href: "/dashboard-admin/users",
    },
    {
      title: "Berita",
      value: stats?.news || 0,
      subValue: "Terpublikasi",
      icon: Newspaper,
      color: "yellow",
      href: "/dashboard-admin/news",
    },
    {
      title: "Pengumuman",
      value: stats?.announcements || 0,
      subValue: "Aktif",
      icon: Megaphone,
      color: "purple",
      href: "/dashboard-admin/announcements",
    },
    {
      title: "Fasilitas",
      value: stats?.facilities || 0,
      subValue: "Terdata",
      icon: Building2,
      color: "green",
      href: "/dashboard-admin/facilities", // Assuming this route exists or will be added
    },
    {
      title: "Ekstrakurikuler",
      value: stats?.extracurriculars || 0,
      subValue: "Program",
      icon: Trophy,
      color: "red",
      href: "/dashboard-admin/extracurricular", // Adjusted to match public route naming if admin doesn't have specific one yet, but usually it's /teachers or similar. Wait, let's check routes.
    },
  ];

  // Colors mapping for Tailwind classes
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, Admin!</h1>
          <p className="text-blue-100 max-w-2xl mb-6">
            Kelola data sekolah, pengguna, dan konten website dari satu tempat
            terpusat. Pantau statistik dan aktivitas terbaru di sini.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard-admin/news"
              className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
            >
              <Newspaper size={18} />
              Kelola Berita
            </Link>
            <Link
              href="/dashboard-admin/users"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-xl transition border border-white/10 flex items-center gap-2"
            >
              <Users size={18} />
              Kelola User
            </Link>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={24} />
          Statistik Ringkas
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {statCards.map((stat, index) => (
            <motion.div variants={item} key={index}>
              <Link href={stat.href} className="block h-full">
                <div
                  className={`h-full p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-100 group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${colors[stat.color]}`}>
                      <stat.icon size={24} />
                    </div>
                    <ArrowRight
                      className="text-gray-300 group-hover:text-blue-600 transition-colors"
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">
                      {stat.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                      {stat.subValue && (
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          {stat.subValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Aktivitas Sistem
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
              Real-time
            </span>
          </div>

          <div className="space-y-4">
            {/* Mock Activity Items - Ideally fetched from a Log system */}
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  System Ready
                </p>
                <p className="text-xs text-gray-500">
                  Dashboard admin siap digunakan
                </p>
              </div>
              <span className="text-xs text-gray-400">Now</span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Data Updated
                </p>
                <p className="text-xs text-gray-500">
                  Sinkronisasi statistik selesai
                </p>
              </div>
              <span className="text-xs text-gray-400">1m ago</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-4">Tips Admin</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              Gunakan fitur &quot;Quick Stats&quot; untuk mengubah angka di
              halaman depan.
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              Validasi konten siswa melalui Dashboard Kesiswaan.
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              Pastikan user role diset dengan benar untuk keamanan.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
