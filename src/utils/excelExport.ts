"use client";

import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface ExcelExportConfig {
  filename: string;
  sheetName: string;
  title?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: ExcelColumn[];
  includeHeader?: boolean;
  includeSummary?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summaryData?: Record<string, any>;
}

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: (value: any, row: any) => string | number;
}

/**
 * Professional Excel Export Utility
 * Creates well-formatted Excel files with headers, styling, and auto-width columns
 */
export function exportToExcel(config: ExcelExportConfig): void {
  const {
    filename,
    sheetName,
    title,
    subtitle,
    data,
    columns,
    includeHeader = true,
    includeSummary = false,
    summaryData,
  } = config;

  // Transform data according to column configuration
  const transformedData = data.map((row, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedRow: Record<string, any> = {
      No: index + 1,
    };

    columns.forEach((col) => {
      const value = getNestedValue(row, col.key);
      transformedRow[col.header] = col.transform
        ? col.transform(value, row)
        : (value ?? "-");
    });

    return transformedRow;
  });

  // Build worksheet data array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsData: any[][] = [];

  // Add title row if provided
  if (includeHeader && title) {
    wsData.push([title]);
    if (subtitle) {
      wsData.push([subtitle]);
    }
    wsData.push([
      `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
    ]);
    wsData.push([]); // Empty row for spacing
  }

  // Add column headers
  const headers = ["No", ...columns.map((col) => col.header)];
  wsData.push(headers);

  // Add data rows
  transformedData.forEach((row) => {
    wsData.push(headers.map((header) => row[header] ?? "-"));
  });

  // Add summary section if provided
  if (includeSummary && summaryData) {
    wsData.push([]); // Empty row
    wsData.push(["RINGKASAN"]);
    Object.entries(summaryData).forEach(([key, value]) => {
      wsData.push([key, value]);
    });
  }

  // Create worksheet from array
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const columnWidths = [
    { wch: 5 }, // No column
    ...columns.map((col) => ({ wch: col.width || 20 })),
  ];
  worksheet["!cols"] = columnWidths;

  // Merge title cells if title exists
  if (includeHeader && title) {
    const mergeEnd = columns.length; // Merge across all columns
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: mergeEnd } }, // Title
    ];
    if (subtitle) {
      worksheet["!merges"].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: mergeEnd },
      });
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with date
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  const fullFilename = `${filename}_${dateStr}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, fullFilename);
}

/**
 * Helper function to get nested object values using dot notation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Format date for Excel display
 */
export function formatExcelDate(
  date: Date | string | null | undefined,
  formatStr: string = "dd/MM/yyyy"
): string {
  if (!date) return "-";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: id });
  } catch {
    return "-";
  }
}

/**
 * Format currency for Excel display
 */
export function formatExcelCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for Excel display
 */
export function formatExcelPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// PRE-BUILT EXPORT CONFIGURATIONS
// ============================================

/**
 * Export Users data to Excel
 */
export interface UserExportData {
  username: string;
  name?: string;
  email?: string | null;
  role: string;
  siswa?: {
    name: string;
    nisn?: string;
    class?: string;
    gender?: string;
    osisAccess?: boolean;
  };
  kesiswaan?: {
    name: string;
    nip?: string;
    gender?: string;
  };
  createdAt: Date | string;
}

export function exportUsersToExcel(users: UserExportData[]): void {
  exportToExcel({
    filename: "Data_Pengguna_SMP_IP_YAKIN",
    sheetName: "Pengguna",
    title: "DAFTAR PENGGUNA SISTEM",
    subtitle: "SMP IP YAKIN",
    data: users,
    columns: [
      { header: "Username", key: "username", width: 15 },
      {
        header: "Nama Lengkap",
        key: "name",
        width: 25,
        transform: (_, row) =>
          row.siswa?.name || row.kesiswaan?.name || row.username,
      },
      { header: "Email", key: "email", width: 30 },
      {
        header: "Role",
        key: "role",
        width: 15,
        transform: (value) => {
          const roleMap: Record<string, string> = {
            ADMIN: "Administrator",
            SISWA: "Siswa",
            KESISWAAN: "Kesiswaan",
            OSIS: "OSIS",
            PPDB_ADMIN: "Admin PPDB",
          };
          return roleMap[value] || value;
        },
      },
      {
        header: "NISN",
        key: "siswa.nisn",
        width: 15,
        transform: (value) => value || "-",
      },
      {
        header: "Kelas",
        key: "siswa.class",
        width: 10,
        transform: (value) => value || "-",
      },
      {
        header: "NIP",
        key: "kesiswaan.nip",
        width: 20,
        transform: (value) => value || "-",
      },
      {
        header: "Jenis Kelamin",
        key: "gender",
        width: 15,
        transform: (_, row) => {
          const gender = row.siswa?.gender || row.kesiswaan?.gender;
          return gender === "MALE"
            ? "Laki-laki"
            : gender === "FEMALE"
              ? "Perempuan"
              : "-";
        },
      },
      {
        header: "Akses OSIS",
        key: "siswa.osisAccess",
        width: 12,
        transform: (value) => (value ? "Ya" : "Tidak"),
      },
      {
        header: "Tanggal Dibuat",
        key: "createdAt",
        width: 15,
        transform: (value) => formatExcelDate(value),
      },
    ],
  });
}

/**
 * Export PPDB Applications to Excel
 */
export interface PPDBExportData {
  id: string;
  name: string;
  nisn: string;
  gender?: string | null;
  birthPlace?: string | null;
  birthDate?: Date | string | null;
  address?: string | null;
  asalSekolah?: string | null;
  parentName?: string | null;
  parentContact?: string | null;
  parentEmail?: string | null;
  status: string;
  feedback?: string | null;
  createdAt: Date | string;
}

export function exportPPDBToExcel(applications: PPDBExportData[]): void {
  const statusCount = {
    pending: applications.filter((a) => a.status === "PENDING").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  exportToExcel({
    filename: "Data_Pendaftar_PPDB",
    sheetName: "Pendaftar PPDB",
    title: "DATA PENDAFTAR PPDB",
    subtitle: "SMP IP YAKIN - Tahun Ajaran 2025/2026",
    data: applications,
    columns: [
      { header: "NISN", key: "nisn", width: 15 },
      { header: "Nama Lengkap", key: "name", width: 30 },
      {
        header: "Jenis Kelamin",
        key: "gender",
        width: 15,
        transform: (value) =>
          value === "MALE"
            ? "Laki-laki"
            : value === "FEMALE"
              ? "Perempuan"
              : "-",
      },
      { header: "Tempat Lahir", key: "birthPlace", width: 20 },
      {
        header: "Tanggal Lahir",
        key: "birthDate",
        width: 15,
        transform: (value) => formatExcelDate(value),
      },
      { header: "Alamat", key: "address", width: 40 },
      { header: "Asal Sekolah", key: "asalSekolah", width: 30 },
      { header: "Nama Orang Tua", key: "parentName", width: 25 },
      { header: "Kontak Orang Tua", key: "parentContact", width: 18 },
      { header: "Email Orang Tua", key: "parentEmail", width: 30 },
      {
        header: "Status",
        key: "status",
        width: 15,
        transform: (value) => {
          const statusMap: Record<string, string> = {
            PENDING: "Menunggu",
            ACCEPTED: "Diterima",
            REJECTED: "Ditolak",
          };
          return statusMap[value] || value;
        },
      },
      { header: "Catatan", key: "feedback", width: 30 },
      {
        header: "Tanggal Daftar",
        key: "createdAt",
        width: 15,
        transform: (value) => formatExcelDate(value),
      },
    ],
    includeSummary: true,
    summaryData: {
      "Total Pendaftar": applications.length,
      "Menunggu Review": statusCount.pending,
      Diterima: statusCount.accepted,
      Ditolak: statusCount.rejected,
      "Tingkat Penerimaan":
        applications.length > 0
          ? `${((statusCount.accepted / applications.length) * 100).toFixed(1)}%`
          : "0%",
    },
  });
}

/**
 * Export Teachers data to Excel
 */
export interface TeacherExportData {
  id: string;
  name: string;
  position: string;
  category: string;
  subject?: string | null;
  description?: string | null;
  experience?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date | string;
}

export function exportTeachersToExcel(teachers: TeacherExportData[]): void {
  const categoryCount: Record<string, number> = {};
  teachers.forEach((t) => {
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });

  const activeCount = teachers.filter((t) => t.isActive).length;
  const inactiveCount = teachers.length - activeCount;

  exportToExcel({
    filename: "Data_Guru_Tenaga_Pendidik",
    sheetName: "Guru & Staff",
    title: "DAFTAR GURU DAN TENAGA PENDIDIK",
    subtitle: "SMP IP YAKIN",
    data: teachers,
    columns: [
      { header: "Nama Lengkap", key: "name", width: 30 },
      { header: "Jabatan", key: "position", width: 25 },
      {
        header: "Kategori",
        key: "category",
        width: 20,
        transform: (value) => {
          const catMap: Record<string, string> = {
            PIMPINAN: "Pimpinan",
            GURU_MAPEL: "Guru Mata Pelajaran",
            STAFF: "Staff",
          };
          return catMap[value] || value;
        },
      },
      { header: "Mata Pelajaran", key: "subject", width: 25 },
      {
        header: "Status",
        key: "isActive",
        width: 15,
        transform: (value) => (value ? "Aktif" : "Nonaktif"),
      },
      { header: "Urutan", key: "sortOrder", width: 10 },
    ],
    includeSummary: true,
    summaryData: {
      "Total Guru & Staff": teachers.length,
      "Status Aktif": activeCount,
      "Status Nonaktif": inactiveCount,
      ...categoryCount,
    },
  });
}

/**
 * Export Calendar Events to Excel
 */
export interface CalendarExportData {
  id: string;
  title: string;
  information?: string | null;
  date: Date | string;
  semester: string;
  tahunPelajaran: string;
}

export function exportCalendarToExcel(events: CalendarExportData[]): void {
  const semesterCount: Record<string, number> = {};
  events.forEach((e) => {
    const key = e.semester === "GANJIL" ? "Semester Ganjil" : "Semester Genap";
    semesterCount[key] = (semesterCount[key] || 0) + 1;
  });

  exportToExcel({
    filename: "Kalender_Akademik",
    sheetName: "Kegiatan",
    title: "KALENDER AKADEMIK",
    subtitle: "SMP IP YAKIN",
    data: events,
    columns: [
      { header: "Nama Kegiatan", key: "title", width: 35 },
      {
        header: "Tanggal",
        key: "date",
        width: 18,
        transform: (value) => formatExcelDate(value),
      },
      { header: "Keterangan", key: "information", width: 40 },
      {
        header: "Semester",
        key: "semester",
        width: 15,
        transform: (value) => (value === "GANJIL" ? "Ganjil" : "Genap"),
      },
      { header: "Tahun Pelajaran", key: "tahunPelajaran", width: 18 },
    ],
    includeSummary: true,
    summaryData: {
      "Total Kegiatan": events.length,
      ...semesterCount,
    },
  });
}

/**
 * Export OSIS Activities to Excel
 */
export interface OsisActivityExportData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  date?: Date | string | null;
  location?: string | null;
  budget?: number | null;
  participants?: number | null;
  createdAt: Date | string;
}

export function exportOsisActivitiesToExcel(
  activities: OsisActivityExportData[]
): void {
  const statusCount: Record<string, number> = {};
  activities.forEach((a) => {
    statusCount[a.status] = (statusCount[a.status] || 0) + 1;
  });

  const totalBudget = activities.reduce((sum, a) => sum + (a.budget || 0), 0);

  exportToExcel({
    filename: "Kegiatan_OSIS",
    sheetName: "Kegiatan OSIS",
    title: "DAFTAR KEGIATAN OSIS",
    subtitle: "SMP IP YAKIN",
    data: activities,
    columns: [
      { header: "Nama Kegiatan", key: "title", width: 35 },
      { header: "Deskripsi", key: "description", width: 40 },
      {
        header: "Tanggal",
        key: "date",
        width: 15,
        transform: (value) => formatExcelDate(value),
      },
      { header: "Lokasi", key: "location", width: 25 },
      {
        header: "Status",
        key: "status",
        width: 15,
        transform: (value) => {
          const statusMap: Record<string, string> = {
            PENDING: "Menunggu",
            APPROVED: "Disetujui",
            REJECTED: "Ditolak",
            COMPLETED: "Selesai",
          };
          return statusMap[value] || value;
        },
      },
      {
        header: "Anggaran",
        key: "budget",
        width: 18,
        transform: (value) => formatExcelCurrency(value),
      },
      { header: "Peserta", key: "participants", width: 12 },
      {
        header: "Tanggal Dibuat",
        key: "createdAt",
        width: 15,
        transform: (value) => formatExcelDate(value),
      },
    ],
    includeSummary: true,
    summaryData: {
      "Total Kegiatan": activities.length,
      ...Object.fromEntries(
        Object.entries(statusCount).map(([k, v]) => [
          k === "PENDING"
            ? "Menunggu"
            : k === "APPROVED"
              ? "Disetujui"
              : k === "REJECTED"
                ? "Ditolak"
                : k === "COMPLETED"
                  ? "Selesai"
                  : k,
          v,
        ])
      ),
      "Total Anggaran": formatExcelCurrency(totalBudget),
    },
  });
}

/**
 * Export Kesiswaan Report to Excel
 */
export interface KesiswaanReportData {
  summary: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  monthly: Array<{
    month: string;
    validated: number;
    pending: number;
    rejected: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export function exportKesiswaanReportToExcel(
  report: KesiswaanReportData
): void {
  // Build combined data for report
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsData: any[][] = [];

  // Title
  wsData.push(["LAPORAN VALIDASI KONTEN KESISWAAN"]);
  wsData.push(["SMP IP YAKIN"]);
  wsData.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  wsData.push([]);

  // Summary Section
  wsData.push(["RINGKASAN STATUS"]);
  wsData.push(["Status", "Jumlah", "Persentase"]);
  const total = report.summary.total || 1;
  wsData.push([
    "Disetujui",
    report.summary.approved,
    `${((report.summary.approved / total) * 100).toFixed(1)}%`,
  ]);
  wsData.push([
    "Pending",
    report.summary.pending,
    `${((report.summary.pending / total) * 100).toFixed(1)}%`,
  ]);
  wsData.push([
    "Ditolak",
    report.summary.rejected,
    `${((report.summary.rejected / total) * 100).toFixed(1)}%`,
  ]);
  wsData.push(["TOTAL", report.summary.total, "100%"]);
  wsData.push([]);

  // Monthly Section
  wsData.push(["VALIDASI BULANAN"]);
  wsData.push(["Bulan", "Disetujui", "Pending", "Ditolak", "Total"]);
  report.monthly.forEach((m) => {
    wsData.push([
      m.month,
      m.validated,
      m.pending,
      m.rejected,
      m.validated + m.pending + m.rejected,
    ]);
  });
  wsData.push([]);

  // Category Section
  wsData.push(["DISTRIBUSI KATEGORI"]);
  wsData.push(["Kategori", "Jumlah", "Persentase"]);
  report.byCategory.forEach((c) => {
    wsData.push([c.category, c.count, `${c.percentage.toFixed(1)}%`]);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kesiswaan");

  // Download
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `Laporan_Kesiswaan_${dateStr}.xlsx`);
}

/**
 * Export PPDB Statistics Report to Excel
 */
export interface PPDBStatsData {
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

export function exportPPDBStatsToExcel(stats: PPDBStatsData): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsData: any[][] = [];

  // Title
  wsData.push(["LAPORAN STATISTIK PPDB"]);
  wsData.push(["SMP IP YAKIN - Tahun Ajaran 2025/2026"]);
  wsData.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  wsData.push([]);

  // Overview Section
  wsData.push(["RINGKASAN PENDAFTARAN"]);
  wsData.push(["Metrik", "Jumlah", "Persentase"]);
  const total = stats.overview.total || 1;
  wsData.push(["Total Pendaftar", stats.overview.total, "100%"]);
  wsData.push([
    "Menunggu Review",
    stats.overview.pending,
    `${((stats.overview.pending / total) * 100).toFixed(1)}%`,
  ]);
  wsData.push([
    "Diterima",
    stats.overview.accepted,
    `${((stats.overview.accepted / total) * 100).toFixed(1)}%`,
  ]);
  wsData.push([
    "Ditolak",
    stats.overview.rejected,
    `${((stats.overview.rejected / total) * 100).toFixed(1)}%`,
  ]);
  wsData.push([]);

  // Monthly Section
  wsData.push(["STATISTIK BULANAN"]);
  wsData.push(["Bulan", "Total", "Diterima", "Pending", "Ditolak"]);
  stats.monthlyStats.forEach((m) => {
    wsData.push([m.name, m.Total, m.Diterima, m.Pending, m.Ditolak]);
  });
  wsData.push([]);

  // Gender Section
  wsData.push(["DISTRIBUSI JENIS KELAMIN"]);
  wsData.push(["Jenis Kelamin", "Jumlah"]);
  stats.genderStats.forEach((g) => {
    const label =
      g.gender === "MALE"
        ? "Laki-laki"
        : g.gender === "FEMALE"
          ? "Perempuan"
          : "Tidak Diketahui";
    wsData.push([label, g._count]);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik PPDB");

  // Download
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `Statistik_PPDB_${dateStr}.xlsx`);
}
