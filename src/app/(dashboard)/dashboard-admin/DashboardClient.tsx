"use client";

import {
  Users,
  Newspaper,
  Megaphone,
  Building2,
  Trophy,
  ArrowRight,
  TrendingUp,
  Activity,
  School,
  FileText,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DashboardStats, DashboardActivity } from "@/actions/admin/dashboard";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface DashboardClientProps {
  stats: DashboardStats;
  userName: string;
}

export default function DashboardClient({ stats, userName }: DashboardClientProps) {
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

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.counts.users,
      subValue: `${stats.counts.admins} Admin`,
      icon: Users,
      color: "blue",
      href: "/dashboard-admin/users",
    },
    {
      title: "Guru & Staff",
      value: stats.counts.teachers,
      subValue: "Terdata",
      icon: School,
      color: "indigo",
      href: "/dashboard-admin/teachers",
    },
    {
      title: "Siswa",
      value: stats.counts.students,
      subValue: "Aktif",
      icon: UserCheck,
      color: "cyan",
      href: "/dashboard-admin/users?role=SISWA", // Assuming query param support or just generic link
    },
    {
      title: "Berita",
      value: stats.counts.news,
      subValue: "Artikel",
      icon: Newspaper,
      color: "yellow",
      href: "/dashboard-admin/news",
    },
    {
      title: "Pengumuman",
      value: stats.counts.announcements,
      subValue: "Aktif",
      icon: Megaphone,
      color: "purple",
      href: "/dashboard-admin/announcements",
    },
    {
      title: "Fasilitas",
      value: stats.counts.facilities,
      subValue: "Unit",
      icon: Building2,
      color: "green",
      href: "/dashboard-admin/facilities",
    },
    {
      title: "Ekstrakurikuler",
      value: stats.counts.extracurriculars,
      subValue: "Program",
      icon: Trophy,
      color: "red",
      href: "/dashboard-admin/extracurricular",
    },
  ];

  // Colors mapping for Tailwind classes
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  const getActivityIcon = (type: DashboardActivity["type"]) => {
    switch (type) {
      case "USER":
        return <Users size={16} className="text-blue-500" />;
      case "NEWS":
        return <Newspaper size={16} className="text-yellow-500" />;
      case "ANNOUNCEMENT":
        return <Megaphone size={16} className="text-purple-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 text-white shadow-xl"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Selamat Datang, {userName}!
          </h1>
          <p className="text-blue-100 max-w-2xl mb-6">
            Dashboard overview memberikan ringkasan real-time aktivitas sekolah.
            Kelola data, pantau statistik, dan akses fitur manajemen dengan
            cepat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard-admin/news/create"
              className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
            >
              <FileText size={18} />
              Tulis Berita
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
      </motion.div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={24} />
          Statistik & Data
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((stat, index) => (
            <motion.div variants={item} key={index}>
              <Link href={stat.href} className="block h-full">
                <div className="h-full p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-100 group">
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
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
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

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Aktivitas Terbaru
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              Real-time Feed
            </span>
          </div>

          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100 group"
                >
                  <div className="mt-1 bg-white p-2 rounded-lg border border-gray-100 shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(activity.date), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {activity.type}
                      </span>
                      {activity.status && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            activity.status === "APPROVED" ||
                            activity.status === "ACCEPTED" ||
                            activity.status === "ACTIVE" ||
                            activity.status === "PUBLISHED"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : activity.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}
                        >
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Activity className="mx-auto mb-2 opacity-20" size={48} />
                <p>Belum ada aktivitas tercatat.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Tips & Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-yellow-500" />
              Prioritas Admin
            </h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3 items-start">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  Validasi <strong className="text-white">Berita</strong> atau{" "}
                  <strong className="text-white">Pengumuman</strong> terbaru
                  untuk menjaga kualitas informasi sekolah.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  Pantau data <strong className="text-white">User</strong> secara
                  berkala untuk memastikan keamanan sistem.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  Pastikan data <strong className="text-white">Guru</strong> dan{" "}
                  <strong className="text-white">Fasilitas</strong> selalu
                  up-to-date untuk halaman publik.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              Butuh Bantuan?
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Jika mengalami kendala teknis atau pertanyaan fitur, silakan hubungi
              tim developer.
            </p>
            <button className="text-xs text-blue-600 font-semibold hover:underline">
              Lihat Dokumentasi Teknis &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
