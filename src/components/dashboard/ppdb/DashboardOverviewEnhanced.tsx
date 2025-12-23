"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  Calendar,
  GraduationCap,
  Activity,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { getPPDBStats } from "@/actions/ppdb";
import dynamic from "next/dynamic";

const RegistrationChart = dynamic(() => import("./RegistrationChart"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl" />
});

interface PPDBStats {
  overview: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  recentApplications: Array<{
    id: string;
    name: string;
    nisn: string;
    status: string;
    createdAt: string;
    asalSekolah: string | null;
  }>;
  genderStats: Array<{
    gender: string | null;
    _count: number;
  }>;
  monthlyStats: Array<{
    name: string;
    Total: number;
    Diterima: number;
    Pending: number;
    Ditolak: number;
  }>;
}

export default function DashboardOverviewEnhanced() {
  const [stats, setStats] = useState<PPDBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await getPPDBStats();
      if (result.success && result.data) {
        setStats(result.data as PPDBStats);
      } else {
        setError(result.error || "Gagal memuat statistik");
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  // Calculate acceptance rate
  const acceptanceRate = stats?.overview.total
    ? Math.round((stats.overview.accepted / stats.overview.total) * 100)
    : 0;

  // Calculate pending percentage
  const pendingRate = stats?.overview.total
    ? Math.round((stats.overview.pending / stats.overview.total) * 100)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Gagal Memuat Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <GraduationCap className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Dashboard PPDB 2025
              </h1>
              <p className="text-blue-100 text-lg">
                Penerimaan Peserta Didik Baru SMP IT Pyakin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-bold text-[#F59E0B]">{stats.overview.total}</div>
              <div className="text-sm text-blue-100">Total Pendaftar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-bold text-green-400">{acceptanceRate}%</div>
              <div className="text-sm text-blue-100">Tingkat Diterima</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-bold text-yellow-400">{pendingRate}%</div>
              <div className="text-sm text-blue-100">Sedang Diproses</div>
            </div>
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-3xl font-bold text-purple-400">{stats.recentApplications.length}</div>
              <div className="text-sm text-blue-100">Pendaftar Baru</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Pendaftar"
          value={stats.overview.total}
          icon={Users}
          color="blue"
          trend="+12%"
        />
        <StatsCard
          title="Menunggu Review"
          value={stats.overview.pending}
          icon={Clock}
          color="yellow"
          progress={pendingRate}
        />
        <StatsCard
          title="Diterima"
          value={stats.overview.accepted}
          icon={CheckCircle}
          color="green"
          subtext={`${acceptanceRate}% dari total`}
        />
        <StatsCard
          title="Ditolak"
          value={stats.overview.rejected}
          icon={XCircle}
          color="red"
          subtext="Tidak memenuhi syarat"
        />
      </motion.div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Tren Pendaftaran
              </h3>
            </div>
          </div>
          <RegistrationChart data={stats.monthlyStats} />
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Terbaru
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {stats.recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada pendaftar</p>
            ) : (
              stats.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-orange-500 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">
                      {app.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {app.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{app.asalSekolah || "Umum"}</span>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-[#1E3A8A] font-semibold bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 group">
            Lihat Semua
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
                icon={FileText}
                title="Validasi Pendaftar"
                desc={`${stats.overview.pending} pendaftar menunggu`}
                color="amber"
                onClick={() => {
                  document.getElementById('tab-validation')?.click();
                }}
            />
            <QuickActionCard
                icon={BarChart3}
                title="Laporan Lengkap"
                desc="Download data XLS/PDF"
                color="blue"
            />
             <QuickActionCard
                icon={Calendar}
                title="Jadwal Seleksi"
                desc="Atur jadwal tes masuk"
                color="green"
            />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Sub-components

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'yellow' | 'green' | 'red';
  trend?: string;
  subtext?: string;
  progress?: number;
}

function StatsCard({ title, value, icon: Icon, color, trend, subtext, progress }: StatsCardProps) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    const iconColors = {
        blue: "bg-blue-600",
        yellow: "bg-[#F59E0B]",
        green: "bg-green-600",
        red: "bg-red-600",
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${iconColors[color]} rounded-xl flex items-center justify-center shadow-lg shadow-${color}-200`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
            </div>
            {progress !== undefined && (
                <div className="mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div
                            className={`h-2 rounded-full ${iconColors[color]}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500">{progress}% dari total pendaftar</p>
                </div>
            )}
            {subtext && (
                <p className="text-xs text-gray-400 mt-2">{subtext}</p>
            )}
        </div>
    );
}

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: 'amber' | 'blue' | 'green';
  onClick?: () => void;
}

function QuickActionCard({ icon: Icon, title, desc, color, onClick }: QuickActionCardProps) {
    const colors = {
        amber: "hover:border-amber-300 hover:bg-amber-50 group-hover:text-amber-600",
        blue: "hover:border-blue-300 hover:bg-blue-50 group-hover:text-blue-600",
        green: "hover:border-green-300 hover:bg-green-50 group-hover:text-green-600",
    };

    return (
        <button
            onClick={onClick}
            className={`group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl transition-all hover:shadow-md text-left ${colors[color]}`}
        >
            <div className={`w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
                <div className="font-bold text-gray-900">{title}</div>
                <div className="text-sm text-gray-500">{desc}</div>
            </div>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        ACCEPTED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}
