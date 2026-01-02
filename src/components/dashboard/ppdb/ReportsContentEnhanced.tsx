"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Users,
  Target,
  Award,
  FileText,
  PieChart,
  Clock,
  LucideIcon,
} from "lucide-react";
import { getPPDBStats } from "@/actions/ppdb";
import { exportPPDBStatsToExcel, PPDBStatsData } from "@/utils/excelExport";
import toast from "react-hot-toast";

interface PPDBStats {
  overview: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  monthlyStats: Array<{
    name: string;
    Total: number;
    Diterima: number;
    Pending: number;
    Ditolak: number;
  }>;
  genderStats: Array<{
    gender: string | null;
    _count: number;
  }>;
}

export default function ReportsContentEnhanced() {
  const [stats, setStats] = useState<PPDBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [reportType, setReportType] = useState("overview");

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await getPPDBStats();
      if (result.success && result.data) {
        setStats(result.data as unknown as PPDBStats);
      } else {
        toast.error("Gagal memuat data laporan");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!stats) return;

    try {
      exportPPDBStatsToExcel(stats as PPDBStatsData);
      toast.success("Laporan statistik berhasil diexport ke Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengexport laporan");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const acceptanceRate = stats.overview.total
    ? Math.round((stats.overview.accepted / stats.overview.total) * 100)
    : 0;

  const pendingRate = stats.overview.total
    ? Math.round((stats.overview.pending / stats.overview.total) * 100)
    : 0;

  const rejectionRate = stats.overview.total
    ? Math.round((stats.overview.rejected / stats.overview.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Laporan & Analytics</h1>
            <p className="text-purple-100 opacity-90 text-lg">
              Analisis mendalam performa PPDB
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:bg-white/20 focus:outline-none transition-colors backdrop-blur-sm cursor-pointer [&>option]:text-gray-900"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="1month">1 Bulan Terakhir</option>
              <option value="3months">3 Bulan Terakhir</option>
              <option value="6months">6 Bulan Terakhir</option>
              <option value="1year">1 Tahun Terakhir</option>
            </select>

            <select
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:bg-white/20 focus:outline-none transition-colors backdrop-blur-sm cursor-pointer [&>option]:text-gray-900"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detail</option>
              <option value="trends">Tren</option>
              <option value="comparision">Perbandingan</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <MetricCard
          title="Total Pendaftar"
          value={stats.overview.total}
          icon={Users}
          color="blue"
          trend="+15.3%"
          trendUp={true}
        />
        <MetricCard
          title="Tingkat Penerimaan"
          value={`${acceptanceRate}%`}
          icon={Award}
          color="green"
          progress={acceptanceRate}
        />
        <MetricCard
          title="Menunggu Review"
          value={stats.overview.pending}
          icon={Clock}
          color="orange"
          subtext={`${pendingRate}% perlu diproses`}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${Math.round((stats.overview.accepted / (stats.overview.accepted + stats.overview.rejected || 1)) * 100)}%`}
          icon={Target}
          color="purple"
          trend="Optimal"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Distribusi Status
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-48 h-48">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${acceptanceRate * 2.51} 251.2`}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#F59E0B"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${pendingRate * 2.51} 251.2`}
                  strokeDashoffset={`-${acceptanceRate * 2.51}`}
                  strokeLinecap="round"
                />
                {rejectionRate > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EF4444"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${rejectionRate * 2.51} 251.2`}
                    strokeDashoffset={`-${(acceptanceRate + pendingRate) * 2.51}`}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.overview.total}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Total
                </span>
              </div>
            </div>

            <div className="space-y-4 w-full md:w-auto">
              <LegendItem
                color="bg-green-500"
                label="Diterima"
                count={stats.overview.accepted}
                percentage={acceptanceRate}
              />
              <LegendItem
                color="bg-yellow-500"
                label="Menunggu"
                count={stats.overview.pending}
                percentage={pendingRate}
              />
              <LegendItem
                color="bg-red-500"
                label="Ditolak"
                count={stats.overview.rejected}
                percentage={rejectionRate}
              />
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Demografi Gender
            </h3>
          </div>

          <div className="space-y-6">
            {stats.genderStats.map((item, index) => {
              const percentage = Math.round(
                (item._count / (stats.overview.total || 1)) * 100
              );
              const label =
                item.gender === "MALE"
                  ? "Laki-laki"
                  : item.gender === "FEMALE"
                    ? "Perempuan"
                    : "Tidak diketahui";
              const gradient =
                item.gender === "MALE"
                  ? "bg-gradient-to-r from-blue-400 to-blue-600"
                  : "bg-gradient-to-r from-pink-400 to-pink-600";

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-900">
                      {item._count}{" "}
                      <span className="text-gray-400">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${gradient} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "purple";
  trend?: string;
  trendUp?: boolean;
  progress?: number;
  subtext?: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
  progress,
  subtext,
}: MetricCardProps) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      {subtext && <p className="text-xs text-gray-400 mt-3">{subtext}</p>}
    </div>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  count: number;
  percentage: number;
}

function LegendItem({ color, label, count, percentage }: LegendItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 ${color} rounded-full shadow-sm`}></div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-gray-900 block">{count}</span>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
    </div>
  );
}
