"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  getLatenessRecords,
  getLatenessStats,
  getLatenesTrend,
  getLatenessByClass,
  getAvailableClasses,
  getLatenessForExport,
  Period,
} from "@/actions/lateness";
import { exportToExcel, formatExcelDate } from "@/utils/excelExport";
import toast from "react-hot-toast";

interface LatenessRecordDisplay {
  id: string;
  siswaName: string | null;
  nisn: string;
  class: string | null;
  arrivalTime: string;
  date: Date;
  reason: string | null;
  recordedBy: string;
}

export default function LatenessReportsContent() {
  const [records, setRecords] = useState<LatenessRecordDisplay[]>([]);
  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  
  // Charts Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trendData, setTrendData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [classData, setClassData] = useState<any[]>([]);

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const [period, setPeriod] = useState<Period>("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  
  const [classFilter, setClassFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      const result = await getAvailableClasses();
      if (result.success && result.classes) {
        setAvailableClasses(result.classes);
      }
    }
    fetchClasses();
  }, []);

  // Fetch global stats (Overview)
  useEffect(() => {
    async function fetchStats() {
      const result = await getLatenessStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    }
    fetchStats();
  }, []);

  // Fetch records & charts based on filters
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      const start = period === "custom" && customStart ? new Date(customStart) : undefined;
      const end = period === "custom" && customEnd ? new Date(customEnd) : undefined;

      // 1. Fetch Records
      const recordsResult = await getLatenessRecords(
        period,
        classFilter === "all" ? undefined : classFilter,
        page,
        20,
        start,
        end,
        searchTerm
      );

      if (recordsResult.success && recordsResult.records) {
        setRecords(recordsResult.records);
        setTotalPages(recordsResult.totalPages || 1);
        setTotalCount(recordsResult.totalCount || 0);
      }

      // 2. Fetch Charts (Only if not paging, to avoid excessive re-fetching, or simple check)
      // We can fetch chart data independently if we want, but for now sync with period
      if (page === 1) {
          const [trendRes, classRes] = await Promise.all([
              getLatenesTrend(period, start, end),
              getLatenessByClass(period, start, end)
          ]);

          if (trendRes.success) setTrendData(trendRes.data || []);
          if (classRes.success) setClassData(classRes.data || []);
      }

      setIsLoading(false);
    }
    
    // Debounce search
    const timer = setTimeout(() => {
        fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [period, classFilter, page, customStart, customEnd, searchTerm]);

  // Export Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const start =
        period === "custom" && customStart ? new Date(customStart) : undefined;
      const end =
        period === "custom" && customEnd ? new Date(customEnd) : undefined;

      const result = await getLatenessForExport(
        period,
        classFilter === "all" ? undefined : classFilter,
        start,
        end
      );

      if (result.success && result.data) {
        exportToExcel({
          filename: "Laporan_Keterlambatan_Siswa",
          sheetName: "Keterlambatan",
          title: "LAPORAN KETERLAMBATAN SISWA",
          subtitle: `Periode: ${period.toUpperCase()} ${
            period === "custom"
              ? `(${start?.toLocaleDateString()} - ${end?.toLocaleDateString()})`
              : ""
          }`,
          data: result.data,
          columns: [
            {
              header: "Tanggal",
              key: "date",
              width: 15,
              transform: (val) => formatExcelDate(val),
            },
            {
              header: "Nama Siswa",
              key: "siswa.name",
              width: 30,
            },
            {
              header: "NISN",
              key: "siswa.nisn",
              width: 15,
            },
            {
              header: "Kelas",
              key: "siswa.class",
              width: 10,
            },
            {
              header: "Jam Tiba",
              key: "arrivalTime",
              width: 12,
              transform: (val) => val || "-",
            },
            {
              header: "Alasan",
              key: "reason",
              width: 35,
              transform: (val) => val || "-",
            },
            {
              header: "Dicatat Oleh",
              key: "recorder.username",
              width: 15,
            },
          ],
          includeSummary: true,
          summaryData: {
            "Total Data": result.data.length,
            "Kelas Terbanyak": Object.entries(
              result.data.reduce((acc: Record<string, number>, curr: { siswa: { class: string | null } }) => {
                const cls = curr.siswa.class || "Unknown";
                acc[cls] = (acc[cls] || 0) + 1;
                return acc;
              }, {})
            ).sort(([, a], [, b]) => b - a)[0]?.[0] || "-",
          },
        });
        toast.success("Data berhasil diexport ke Excel!");
      } else {
        toast.error(result.error || "Gagal mengambil data export");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Terjadi kesalahan saat export");
    }
    setIsExporting(false);
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-blue-600" />
            Laporan Keterlambatan
          </h1>
          <p className="text-gray-500">Monitoring & Analisis Keterlambatan Siswa</p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || records.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Export Excel
        </button>
      </div>

      {/* Stats Cards (Overview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Hari Ini"
          value={stats.day} 
          icon={Clock}
          color="from-red-500 to-red-600"
        />
        <StatsCard 
          title="Minggu Ini"
          value={stats.week} 
          icon={Calendar}
          color="from-orange-500 to-orange-600"
        />
        <StatsCard 
          title="Bulan Ini"
          value={stats.month} 
          icon={TrendingUp}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard 
          title="Total Tahun Ini"
          value={stats.year} 
          icon={Users}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as Period);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Range Tanggal</option>
            </select>
          </div>
          
          {/* Custom Date Inputs */}
          {period === "custom" && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                <input 
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>
          )}
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kelas</option>
            {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                    {cls}
                </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts Section */}
      {!isLoading && records.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Trend Keterlambatan
                  </h3>
                  <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="date" 
                                fontSize={12} 
                                tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                              />
                              <YAxis allowDecimals={false} fontSize={12} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                              />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Class Distribution Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      Distribusi Per Kelas
                  </h3>
                  <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                              <XAxis type="number" fontSize={12} allowDecimals={false} />
                              <YAxis dataKey="name" type="category" width={40} fontSize={12} />
                              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px' }} />
                              <Bar 
                                dataKey="value" 
                                fill="#8b5cf6" 
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                              />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Siswa</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jam Tiba</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alasan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(record.date)}</td>
                      <td className="px-6 py-4">
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">{record.siswaName || "Tanpa Nama"}</span>
                              <span className="text-xs text-gray-400">{record.nisn}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {record.class || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-red-600 bg-red-50 w-fit rounded-lg px-2">
                        {record.arrivalTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic max-w-[200px] truncate">{record.reason || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{record.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {records.length === 0 && (
              <div className="text-center py-16 bg-gray-50/50">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Tidak ada data ditemukan</h3>
                <p className="text-gray-500 text-sm mt-1">
                    Coba sesuaikan filter atau cari dengan kata kunci lain
                </p>
              </div>
            )}
            
             {/* Pagination */}
             {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                     <p className="text-sm text-gray-500">
                        Menampilkan <span className="font-medium">{records.length}</span> dari <span className="font-medium">{totalCount}</span> data
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-2">
                            Halaman {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Stats Card Component for reusability
function StatsCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: LucideIcon, color: string }) {
    return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${color} rounded-xl p-5 text-white shadow-lg relative overflow-hidden`}
        >
          <div className="relative z-10">
              <Icon className="w-6 h-6 mb-3 opacity-90" />
              <p className="text-3xl font-bold mb-1">{value}</p>
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{title}</p>
          </div>
          {/* Decorataive BG shape */}
          <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
        </motion.div>
    )
}
