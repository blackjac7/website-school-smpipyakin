"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  BarChart3,
  Calendar,
  GraduationCap,
  Target,
  Award,
  UserPlus,
  Activity,
} from "lucide-react";

interface PPDBStats {
  overview: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  monthlyStats: Array<{
    status: string;
    _count: number;
  }>;
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
  monthlyApplications: Array<{
    month: Date;
    status: string;
    count: number;
  }>;
}

export default function DashboardOverviewEnhanced() {
  const [stats, setStats] = useState<PPDBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ppdb/statistics");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError("Gagal memuat statistik");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Terjadi kesalahan saat memuat data");
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

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Section Skeleton */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <XCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Gagal Memuat Data
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchStatistics}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard PPDB 2025
            </h1>
            <p className="text-gray-600">
              Penerimaan Peserta Didik Baru SMP IT Pyakin
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {stats.overview.total}
            </div>
            <div className="text-sm text-gray-600">Total Pendaftar</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {acceptanceRate}%
            </div>
            <div className="text-sm text-gray-600">Tingkat Diterima</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRate}%
            </div>
            <div className="text-sm text-gray-600">Sedang Diproses</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.recentApplications.length}
            </div>
            <div className="text-sm text-gray-600">Pendaftar Baru</div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {stats.overview.total}
              </div>
              <div className="text-sm text-gray-500">Total Pendaftar</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500">dari bulan lalu</span>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {stats.overview.pending}
              </div>
              <div className="text-sm text-gray-500">Menunggu Review</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
              style={{ width: `${pendingRate}%` }}
            ></div>
          </div>
        </div>

        {/* Accepted Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {stats.overview.accepted}
              </div>
              <div className="text-sm text-gray-500">Diterima</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">
              {acceptanceRate}%
            </span>
            <span className="text-gray-500">tingkat penerimaan</span>
          </div>
        </div>

        {/* Rejected Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {stats.overview.rejected}
              </div>
              <div className="text-sm text-gray-500">Ditolak</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {Math.round(
                (stats.overview.rejected / stats.overview.total) * 100
              )}
              %
            </span>
            <span className="text-gray-500">dari total</span>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gender Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Distribusi Gender
            </h3>
          </div>

          <div className="space-y-4">
            {stats.genderStats.map((item, index) => {
              const percentage = stats.overview.total
                ? Math.round((item._count / stats.overview.total) * 100)
                : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {item.gender === "LAKI_LAKI"
                        ? "Laki-laki"
                        : item.gender === "PEREMPUAN"
                          ? "Perempuan"
                          : "Tidak diisi"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item._count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        item.gender === "LAKI_LAKI"
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : "bg-gradient-to-r from-pink-400 to-pink-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pendaftar Terbaru
              </h3>
            </div>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Lihat Semua
            </button>
          </div>

          <div className="space-y-4">
            {stats.recentApplications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {app.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    NISN: {app.nisn} •{" "}
                    {app.asalSekolah || "Sekolah tidak diisi"}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : app.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {app.status === "PENDING"
                      ? "Menunggu"
                      : app.status === "APPROVED"
                        ? "Diterima"
                        : "Ditolak"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(app.createdAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-colors">
            <FileText className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Review Pendaftar</div>
              <div className="text-sm text-gray-600">
                {stats.overview.pending} menunggu review
              </div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Lihat Laporan</div>
              <div className="text-sm text-gray-600">
                Export dan analisis data
              </div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-colors">
            <Calendar className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Jadwal Wawancara</div>
              <div className="text-sm text-gray-600">Atur jadwal seleksi</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
