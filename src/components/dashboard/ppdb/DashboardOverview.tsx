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
    _count: { id: number };
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
    _count: { id: number };
  }>;
}

export default function DashboardOverview() {
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

  if (loading) {
    return (
      <div className="space-y-6">
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

  const { overview, recentApplications, genderStats } = stats;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Dashboard PPDB Officer
            </h2>
            <p className="text-gray-600">
              Kelola dan monitor proses penerimaan peserta didik baru
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pendaftar"
          value={overview.total}
          icon={Users}
          color="blue"
          description="Total keseluruhan"
        />
        <StatCard
          title="Menunggu Validasi"
          value={overview.pending}
          icon={Clock}
          color="yellow"
          description="Perlu ditindaklanjuti"
        />
        <StatCard
          title="Diterima"
          value={overview.accepted}
          icon={CheckCircle}
          color="green"
          description="Sudah diterima"
        />
        <StatCard
          title="Ditolak"
          value={overview.rejected}
          icon={XCircle}
          color="red"
          description="Tidak memenuhi syarat"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pendaftar Terbaru
              </h3>
            </div>
            <span className="text-sm text-gray-500">10 terbaru</span>
          </div>

          <div className="space-y-4">
            {recentApplications.map((applicant) => (
              <div
                key={applicant.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {applicant.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    NISN: {applicant.nisn} •{" "}
                    {applicant.asalSekolah || "Tidak diketahui"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(applicant.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="ml-4">
                  <StatusBadge status={applicant.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Gender Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Distribusi Gender
              </h3>
            </div>

            <div className="space-y-4">
              {genderStats.map((stat) => {
                const genderLabel =
                  stat.gender === "MALE"
                    ? "Laki-laki"
                    : stat.gender === "FEMALE"
                      ? "Perempuan"
                      : "Tidak diketahui";
                const percentage =
                  overview.total > 0
                    ? Math.round((stat._count.id / overview.total) * 100)
                    : 0;

                return (
                  <div key={stat.gender || "unknown"} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{genderLabel}</span>
                      <span className="font-medium">
                        {stat._count.id} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    Validasi Pending ({overview.pending})
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Lihat Semua Pendaftar
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Export Laporan
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "yellow" | "green" | "red";
  description: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-400 to-blue-600 bg-blue-50 text-blue-700",
    yellow: "from-yellow-400 to-yellow-600 bg-yellow-50 text-yellow-700",
    green: "from-green-400 to-green-600 bg-green-50 text-green-700",
    red: "from-red-400 to-red-600 bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color].split(" ")[0]} ${colorClasses[color].split(" ")[1]} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
    ACCEPTED: { label: "Diterima", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Ditolak", color: "bg-red-100 text-red-700" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
