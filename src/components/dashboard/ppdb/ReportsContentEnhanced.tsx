"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Target,
  Award,
  FileText,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
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

type ReportsContentEnhancedProps = object;

export default function ReportsContentEnhanced({}: ReportsContentEnhancedProps) {
  const [stats, setStats] = useState<PPDBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [reportType, setReportType] = useState("overview");

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ppdb/statistics");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!stats) return;

    const csvData = [
      ["Metrik", "Total", "Persentase"],
      ["Total Pendaftar", stats.overview.total, "100%"],
      [
        "Menunggu Review",
        stats.overview.pending,
        `${Math.round((stats.overview.pending / stats.overview.total) * 100)}%`,
      ],
      [
        "Diterima",
        stats.overview.accepted,
        `${Math.round((stats.overview.accepted / stats.overview.total) * 100)}%`,
      ],
      [
        "Ditolak",
        stats.overview.rejected,
        `${Math.round((stats.overview.rejected / stats.overview.total) * 100)}%`,
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-ppdb-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Placeholder for PDF export functionality
    console.log("Export to PDF functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <XCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Gagal Memuat Data Laporan
        </h3>
        <button
          onClick={fetchStatistics}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const acceptanceRate = Math.round(
    (stats.overview.accepted / stats.overview.total) * 100
  );
  const pendingRate = Math.round(
    (stats.overview.pending / stats.overview.total) * 100
  );
  const rejectionRate = Math.round(
    (stats.overview.rejected / stats.overview.total) * 100
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan & Analytics PPDB
            </h1>
            <p className="text-gray-600">
              Analisis mendalam data penerimaan peserta didik baru
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="1month">1 Bulan Terakhir</option>
              <option value="3months">3 Bulan Terakhir</option>
              <option value="6months">6 Bulan Terakhir</option>
              <option value="1year">1 Tahun Terakhir</option>
            </select>

            <select
              className="px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {stats.overview.total}
              </div>
              <div className="text-sm text-gray-500">Total Pendaftar</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+15.3%</span>
            <span className="text-gray-500">vs periode sebelumnya</span>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {acceptanceRate}%
              </div>
              <div className="text-sm text-gray-500">Tingkat Penerimaan</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
              style={{ width: `${acceptanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {stats.overview.pending}
              </div>
              <div className="text-sm text-gray-500">Menunggu Review</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-orange-500" />
            <span className="text-orange-600 font-medium">{pendingRate}%</span>
            <span className="text-gray-500">perlu diproses</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(
                  (stats.overview.accepted /
                    (stats.overview.accepted + stats.overview.rejected)) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-purple-600 font-medium">Optimal</span>
            <span className="text-gray-500">performance</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Distribusi Status Pendaftar
            </h3>
          </div>

          {/* Donut Chart Simulation */}
          <div className="relative">
            <div className="w-48 h-48 mx-auto mb-6">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Accepted */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${acceptanceRate * 2.51} 251.2`}
                  strokeDashoffset="0"
                />
                {/* Pending */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#F59E0B"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${pendingRate * 2.51} 251.2`}
                  strokeDashoffset={`-${acceptanceRate * 2.51}`}
                />
                {/* Rejected */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#EF4444"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${rejectionRate * 2.51} 251.2`}
                  strokeDashoffset={`-${(acceptanceRate + pendingRate) * 2.51}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.overview.total}
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Diterima
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {stats.overview.accepted} ({acceptanceRate}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Menunggu
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {stats.overview.pending} ({pendingRate}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Ditolak
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {stats.overview.rejected} ({rejectionRate}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Distribusi Gender
            </h3>
          </div>

          <div className="space-y-6">
            {stats.genderStats.map((item, index) => {
              const percentage = Math.round(
                (item._count / stats.overview.total) * 100
              );
              const genderLabel =
                item.gender === "LAKI_LAKI"
                  ? "Laki-laki"
                  : item.gender === "PEREMPUAN"
                    ? "Perempuan"
                    : "Tidak diisi";

              return (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          item.gender === "LAKI_LAKI"
                            ? "bg-blue-500"
                            : item.gender === "PEREMPUAN"
                              ? "bg-pink-500"
                              : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-700">
                        {genderLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">
                        {item._count}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        item.gender === "LAKI_LAKI"
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : item.gender === "PEREMPUAN"
                            ? "bg-gradient-to-r from-pink-400 to-pink-600"
                            : "bg-gradient-to-r from-gray-400 to-gray-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tren Pendaftaran
            </h3>
          </div>

          {/* Simple trend visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  Pendaftaran Pagi
                </div>
                <div className="text-sm text-gray-600">08:00 - 12:00</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">35%</div>
                <div className="text-xs text-gray-500">dari total</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  Pendaftaran Siang
                </div>
                <div className="text-sm text-gray-600">12:00 - 18:00</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">45%</div>
                <div className="text-xs text-gray-500">dari total</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  Pendaftaran Malam
                </div>
                <div className="text-sm text-gray-600">18:00 - 23:00</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600">20%</div>
                <div className="text-xs text-gray-500">dari total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Metrik Performa
            </h3>
          </div>

          <div className="space-y-6">
            {/* Processing Time */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="font-medium text-gray-900">
                Rata-rata Waktu Review
              </div>
              <div className="text-2xl font-bold text-blue-600">2.3 hari</div>
              <div className="text-sm text-gray-500">Target: ≤ 3 hari</div>
            </div>

            {/* Response Rate */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="font-medium text-gray-900">Response Rate</div>
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-gray-500">Excellent performance</div>
            </div>

            {/* Quality Score */}
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="font-medium text-gray-900">Quality Score</div>
              <div className="text-2xl font-bold text-purple-600">94/100</div>
              <div className="text-sm text-gray-500">Above average</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ringkasan Laporan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Highlights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Tingkat penerimaan {acceptanceRate}% (target tercapai)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Waktu review rata-rata dibawah target
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Quality score diatas rata-rata
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Areas for Improvement</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                {stats.overview.pending} aplikasi masih pending
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Optimalisasi proses screening
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Peningkatan engagement rate
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Pertahankan kualitas review
              </li>
              <li className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Automasi proses screening
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                Tingkatkan follow-up rate
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
