"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shirt,
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
  getAttributeViolations,
  getAttributeStats,
  getAttributeViolationTrend,
  getAttributeViolationsByClass,
  getMostViolatedAttributes,
  getAvailableClasses,
  getAvailableAcademicYears,
  getAttributeReportForExport,
  getAttributePointsSummary,
} from "@/actions/attributes";
import { getPeriodFilenameSlug } from "@/lib/reportPeriod";
import PeriodFilter, {
  createDefaultPeriodValue,
  toPeriodInput,
  isPeriodValueComplete,
  type PeriodFilterValue,
} from "./PeriodFilter";
import {
  exportMultiSheetExcel,
  formatExcelDate,
  type SheetSpec,
} from "@/utils/excelExport";
import toast from "react-hot-toast";

interface AttributeViolationDisplay {
  id: string;
  siswaName: string | null;
  nisn: string;
  class: string | null;
  scanTime: string;
  date: Date;
  notes: string | null;
  attributes: string[];
  recordedBy: string;
}

interface AttributePointSummary {
  siswaId: string;
  name: string | null;
  nisn: string;
  class: string | null;
  totalViolations: number;
  points: number;
}

export default function AttributeReportsContent() {
  const [records, setRecords] = useState<AttributeViolationDisplay[]>([]);
  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trendData, setTrendData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [classData, setClassData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attributeData, setAttributeData] = useState<any[]>([]);

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<number[]>([]);

  const [periodValue, setPeriodValue] = useState<PeriodFilterValue>(
    createDefaultPeriodValue,
  );

  const [classFilter, setClassFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Attribute point summary (lifetime accumulation, independent of period)
  const [pointsSummary, setPointsSummary] = useState<AttributePointSummary[]>(
    [],
  );
  const [pointsConfig, setPointsConfig] = useState({
    threshold: 3,
    pointsPerThreshold: 2,
  });
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      const result = await getAvailableClasses();
      if (result.success && result.classes) {
        setAvailableClasses(result.classes);
      }
    }
    fetchClasses();
  }, []);

  // Fetch academic years that actually have data
  useEffect(() => {
    async function fetchYears() {
      const result = await getAvailableAcademicYears();
      if (result.success && result.years.length > 0) {
        setAcademicYears(result.years);
      }
    }
    fetchYears();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      const result = await getAttributeStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // PeriodInput diteruskan utuh. Jangan hitung {start, end} di sini lalu
      // kirim sebagai custom range: server akan menjalankan toZonedTime
      // untuk kedua kalinya dan batas rentang melenceng 7 jam per konversi.
      const periodInput = toPeriodInput(periodValue);

      const recordsResult = await getAttributeViolations({
        periodInput,
        classFilter: classFilter === "all" ? undefined : classFilter,
        page,
        limit: 20,
        search: searchTerm,
      });

      if (recordsResult.success && recordsResult.records) {
        setRecords(recordsResult.records);
        setTotalPages(recordsResult.totalPages || 1);
        setTotalCount(recordsResult.totalCount || 0);
      }

      if (page === 1) {
        const [trendRes, classRes, attrRes] = await Promise.all([
          getAttributeViolationTrend({ periodInput }),
          getAttributeViolationsByClass({ periodInput }),
          getMostViolatedAttributes({ periodInput }),
        ]);

        if (trendRes.success) setTrendData(trendRes.data || []);
        if (classRes.success) setClassData(classRes.data || []);
        if (attrRes.success) setAttributeData(attrRes.data || []);
      }

      setIsLoading(false);
    }

    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [periodValue, classFilter, page, searchTerm]);

  useEffect(() => {
    async function fetchPoints() {
      setIsLoadingPoints(true);
      const result = await getAttributePointsSummary(
        classFilter === "all" ? undefined : classFilter,
        searchTerm,
      );
      if (result.success && result.data) {
        setPointsSummary(result.data);
        if (result.config) setPointsConfig(result.config);
      }
      setIsLoadingPoints(false);
    }

    const timer = setTimeout(() => {
      fetchPoints();
    }, 500);

    return () => clearTimeout(timer);
  }, [classFilter, searchTerm]);

  // Export Excel (Detail + Rekap Siswa + Ringkasan)
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const periodInput = toPeriodInput(periodValue);

      const result = await getAttributeReportForExport({
        periodInput,
        classFilter: classFilter === "all" ? undefined : classFilter,
        search: searchTerm || undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Gagal mengambil data export");
        return;
      }

      const { detail, recap, summary } = result;

      // Periode nihil tetap menghasilkan berkas: kesiswaan butuh bukti
      // bahwa periode itu memang kosong.
      if (detail.length === 0) {
        toast("Tidak ada data pada periode ini. Berkas tetap dibuat.", {
          icon: "⚠️",
        });
      }

      const headerTitle = "LAPORAN PELANGGARAN ATRIBUT SISWA";
      const headerSubtitle = `${summary.classLabel} — ${summary.periodLabel}`;
      const pointRule = `Setiap ${summary.threshold}x pelanggaran atribut = ${summary.pointsPerThreshold} poin.`;

      const sheets: SheetSpec[] = [
        {
          sheetName: "Detail",
          title: headerTitle,
          subtitle: headerSubtitle,
          data: detail,
          columns: [
            {
              header: "Tanggal",
              key: "date",
              width: 15,
              transform: (val) => formatExcelDate(val),
            },
            { header: "Nama Siswa", key: "siswaName", width: 30 },
            { header: "NISN", key: "nisn", width: 15 },
            { header: "Kelas", key: "class", width: 10 },
            {
              header: "Jam",
              key: "time",
              width: 12,
              transform: (val) => val || "-",
            },
            {
              header: "Atribut Dilanggar",
              key: "attributesLabel",
              width: 35,
              transform: (val) => val || "-",
            },
            {
              header: "Catatan",
              key: "notes",
              width: 30,
              transform: (val) => val || "-",
            },
            { header: "Dicatat Oleh", key: "recordedBy", width: 18 },
            { header: "Total Poin Siswa", key: "totalPoints", width: 16 },
          ],
          notes: [
            "Catatan: kolom Total Poin Siswa adalah poin seumur hidup siswa tersebut,",
            "melekat pada siswa dan bukan pada kejadian - kolom ini tidak boleh dijumlahkan.",
          ],
        },
        {
          sheetName: "Rekap Siswa",
          title: headerTitle,
          subtitle: `Rekap per Siswa — ${headerSubtitle}`,
          data: recap,
          columns: [
            { header: "Nama Siswa", key: "name", width: 30 },
            { header: "NISN", key: "nisn", width: 15 },
            { header: "Kelas", key: "class", width: 10 },
            { header: "Pelanggaran (Periode)", key: "periodCount", width: 20 },
            { header: "Poin (Periode)", key: "periodPoints", width: 15 },
            { header: "Total Pelanggaran", key: "totalCount", width: 18 },
            { header: "Total Poin", key: "totalPoints", width: 12 },
            { header: "Atribut Tersering", key: "topAttribute", width: 20 },
          ],
          notes: [
            pointRule,
            "Total Poin adalah angka resmi pembinaan, sama dengan yang tampil di dashboard.",
            "Poin (Periode) hanya indikator intensitas periode ini dan TIDAK dapat",
            "dijumlahkan antar periode: sisa pembagian hilang setiap kali dipotong.",
            "Atribut Tersering dihitung dari pelanggaran dalam periode terpilih saja.",
          ],
        },
        {
          sheetName: "Ringkasan",
          title: headerTitle,
          subtitle: headerSubtitle,
          data: [],
          columns: [{ header: "Keterangan", key: "k", width: 32 }],
          includeColumnHeaders: false,
          includeSummary: true,
          summaryData: {
            Periode: summary.periodLabel,
            Kelas: summary.classLabel,
            "Total Kejadian": summary.totalRecords,
            "Jumlah Siswa Terlibat": summary.totalStudents,
            "Rata-rata per Siswa": summary.averagePerStudent,
            "Kelas Terbanyak": summary.topClass,
            "Atribut Paling Sering Dilanggar": attributeData[0]?.name || "-",
            "Aturan Poin": pointRule,
          },
          notes: [
            "Poin (Periode) di sheet Rekap Siswa tidak dapat dijumlahkan antar periode.",
            "Gunakan Total Poin sebagai angka resmi pembinaan.",
          ],
        },
      ];

      const classSlug =
        classFilter === "all" ? "Semua-Kelas" : classFilter.replace(/\s+/g, "-");

      exportMultiSheetExcel({
        filename: `Laporan_Atribut_${classSlug}_${getPeriodFilenameSlug(periodInput)}`,
        sheets,
      });

      toast.success("Data berhasil diexport ke Excel!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Terjadi kesalahan saat export");
    } finally {
      // finally, bukan di akhir try: tanpa ini isExporting tersangkut true
      // selamanya kalau terjadi error di tengah jalan.
      setIsExporting(false);
    }
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
            <Shirt className="w-7 h-7 text-blue-600" />
            Laporan Pelanggaran Atribut
          </h1>
          <p className="text-gray-500">
            Monitoring & Analisis Pelanggaran Atribut Siswa
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || !isPeriodValueComplete(periodValue)}
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
          icon={Shirt}
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
        <PeriodFilter
          value={periodValue}
          onChange={(next) => {
            setPeriodValue(next);
            setPage(1);
          }}
          academicYears={academicYears}
        />

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

      {/* Attribute Point Summary (lifetime accumulation, independent of period filter) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Poin Pelanggaran Atribut Siswa
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Setiap {pointsConfig.threshold}x akumulasi pelanggaran atribut ={" "}
            {pointsConfig.pointsPerThreshold} poin. Dihitung sepanjang masa,
            tidak dipengaruhi filter periode di atas.
          </p>
        </div>

        {isLoadingPoints ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : pointsSummary.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-500">
            Belum ada siswa yang mencapai akumulasi poin pelanggaran atribut.
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {pointsSummary.map((s) => (
                <div
                  key={s.siswaId}
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {s.name || "Tanpa Nama"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {s.nisn} • {s.class || "-"} • {s.totalViolations}x
                      pelanggaran
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-red-700 bg-red-50 rounded-lg px-2.5 py-1">
                    {s.points} Poin
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Pelanggaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Poin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pointsSummary.map((s) => (
                    <tr
                      key={s.siswaId}
                      className="hover:bg-red-50/30 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {s.name || "Tanpa Nama"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {s.nisn}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {s.class || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {s.totalViolations}x
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-bold text-red-700 bg-red-50 rounded-lg px-2.5 py-1">
                          {s.points} Poin
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      {!isLoading && records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Trend Pelanggaran Atribut
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                      })
                    }
                  />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString("id-ID", {
                        dateStyle: "full",
                      })
                    }
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={40}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "8px" }}
                  />
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

          {/* Most Violated Attributes Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-red-500" />
              Atribut Paling Sering Dilanggar
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attributeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {record.siswaName || "Tanpa Nama"}
                      </p>
                      <p className="text-xs text-gray-400">{record.nisn}</p>
                    </div>
                    <span className="shrink-0 text-sm font-mono font-bold text-red-600 bg-red-50 rounded-lg px-2 py-0.5">
                      {record.scanTime}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {record.class || "-"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {record.attributes.map((attr) => (
                      <span
                        key={attr}
                        className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                  {record.notes && (
                    <p className="text-xs text-gray-500 italic wrap-break-word">
                      {record.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Dicatat oleh: {record.recordedBy}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Jam
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Atribut Dilanggar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Catatan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pencatat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {record.siswaName || "Tanpa Nama"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {record.nisn}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {record.class || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-red-600">
                        <span className="bg-red-50 w-fit rounded-lg px-2 py-0.5">
                          {record.scanTime}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {record.attributes.map((attr) => (
                            <span
                              key={attr}
                              className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full"
                            >
                              {attr}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic max-w-[200px] truncate">
                        {record.notes || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {record.recordedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {records.length === 0 && (
              <div className="text-center py-16 bg-gray-50/50">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Tidak ada data ditemukan
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Coba sesuaikan filter atau cari dengan kata kunci lain
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Menampilkan{" "}
                  <span className="font-medium">{records.length}</span> dari{" "}
                  <span className="font-medium">{totalCount}</span> data
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
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-5 text-white shadow-lg relative overflow-hidden`}
    >
      <div className="relative z-10">
        <Icon className="w-6 h-6 mb-3 opacity-90" />
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
    </motion.div>
  );
}
