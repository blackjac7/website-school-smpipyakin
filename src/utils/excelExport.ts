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

export interface SheetSpec {
  sheetName: string;
  title?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: ExcelColumn[];
  includeHeader?: boolean;
  /** false untuk sheet ringkasan yang tidak punya tabel. Default true. */
  includeColumnHeaders?: boolean;
  includeSummary?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summaryData?: Record<string, any>;
  /** Baris catatan kaki di bawah tabel, satu baris per string. */
  notes?: string[];
}

/**
 * Bangun isi sheet sebagai array-of-arrays. Dipisah dari pembuatan
 * worksheet supaya bisa diverifikasi tanpa menyentuh berkas.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSheetRows(spec: SheetSpec): any[][] {
  const {
    title,
    subtitle,
    data,
    columns,
    includeHeader = true,
    includeColumnHeaders = true,
    includeSummary = false,
    summaryData,
    notes,
  } = spec;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsData: any[][] = [];

  if (includeHeader && title) {
    wsData.push([title]);
    if (subtitle) {
      wsData.push([subtitle]);
    }
    wsData.push([
      `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
    ]);
    wsData.push([]);
  }

  if (includeColumnHeaders) {
    wsData.push(["No", ...columns.map((col) => col.header)]);
  }

  data.forEach((row, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells: any[] = [index + 1];
    columns.forEach((col) => {
      const value = getNestedValue(row, col.key);
      const cell = col.transform ? col.transform(value, row) : value;
      // "-" diterapkan setelah transform, sama seperti implementasi lama:
      // transform yang mengembalikan null/undefined tetap jadi "-".
      cells.push(cell ?? "-");
    });
    wsData.push(cells);
  });

  if (includeSummary && summaryData) {
    wsData.push([]);
    wsData.push(["RINGKASAN"]);
    Object.entries(summaryData).forEach(([key, value]) => {
      wsData.push([key, value]);
    });
  }

  if (notes && notes.length > 0) {
    wsData.push([]);
    notes.forEach((note) => wsData.push([note]));
  }

  return wsData;
}

function buildWorksheet(spec: SheetSpec): XLSX.WorkSheet {
  const worksheet = XLSX.utils.aoa_to_sheet(buildSheetRows(spec));

  worksheet["!cols"] = [
    { wch: 5 },
    ...spec.columns.map((col) => ({ wch: col.width || 20 })),
  ];

  if ((spec.includeHeader ?? true) && spec.title) {
    const mergeEnd = spec.columns.length;
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: mergeEnd } }];
    if (spec.subtitle) {
      worksheet["!merges"].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: mergeEnd },
      });
      worksheet["!merges"].push({
        s: { r: 2, c: 0 },
        e: { r: 2, c: mergeEnd },
      });
    } else {
      worksheet["!merges"].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: mergeEnd },
      });
    }
  }

  applyPrintSettings(worksheet, spec);

  return worksheet;
}

function applyPrintSettings(worksheet: XLSX.WorkSheet, spec: SheetSpec): void {
  const headerRowCount = (spec.includeHeader ?? true) ? (spec.subtitle ? 4 : 3) : 0;
  const dataStartRow = headerRowCount + (spec.includeColumnHeaders !== false ? 1 : 0);

  worksheet["!autofilter"] = spec.includeColumnHeaders !== false && spec.data.length > 0
    ? { ref: XLSX.utils.encode_range({
        s: { r: headerRowCount, c: 0 },
        e: { r: headerRowCount, c: spec.columns.length }
      })}
    : undefined;

  if (headerRowCount > 0 && spec.includeColumnHeaders !== false) {
    worksheet["!freeze"] = {
      xSplit: 1,
      ySplit: dataStartRow,
      activePane: "bottomRight"
    };
  }

  worksheet["!margins"] = {
    left: 0.5,
    right: 0.5,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3
  };

  worksheet["!pageSetup"] = {
    paperSize: 9,
    orientation: "landscape",
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
    firstPageNumber: 1
  };

  worksheet["!printOptions"] = {
    headings: false,
    gridLines: false,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false
  };
}

/**
 * Professional Excel Export Utility
 * Creates well-formatted Excel files with headers, styling, and auto-width columns
 */
export function exportToExcel(config: ExcelExportConfig): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    buildWorksheet(config),
    config.sheetName,
  );

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${config.filename}_${dateStr}.xlsx`);
}

/**
 * Export beberapa sheet dalam satu workbook. Dipakai laporan keterlambatan
 * dan atribut yang butuh Detail + Rekap Siswa + Ringkasan sekaligus.
 */
export function exportMultiSheetExcel(config: {
  filename: string;
  sheets: SheetSpec[];
}): void {
  const workbook = XLSX.utils.book_new();

  config.sheets.forEach((sheet) => {
    // Nama sheet Excel dibatasi 31 karakter.
    XLSX.utils.book_append_sheet(
      workbook,
      buildWorksheet(sheet),
      sheet.sheetName.slice(0, 31),
    );
  });

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${config.filename}_${dateStr}.xlsx`);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsData: any[][] = [];

  wsData.push(["LAPORAN VALIDASI KONTEN KESISWAAN"]);
  wsData.push(["SMP IP YAKIN"]);
  wsData.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  wsData.push([]);

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

  wsData.push(["DISTRIBUSI KATEGORI"]);
  wsData.push(["Kategori", "Jumlah", "Persentase"]);
  report.byCategory.forEach((c) => {
    wsData.push([c.category, c.count, `${c.percentage.toFixed(1)}%`]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } },
    { s: { r: 11, c: 0 }, e: { r: 11, c: 4 } },
    { s: { r: 11 + report.monthly.length + 2, c: 0 }, e: { r: 11 + report.monthly.length + 2, c: 2 } },
  ];

  worksheet["!margins"] = {
    left: 0.5,
    right: 0.5,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3
  };

  worksheet["!pageSetup"] = {
    paperSize: 9,
    orientation: "landscape",
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
    firstPageNumber: 1
  };

  worksheet["!printOptions"] = {
    headings: false,
    gridLines: true,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false
  };

  worksheet["!autofilter"] = { ref: "A6:C6" };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kesiswaan");

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

  wsData.push(["LAPORAN STATISTIK PPDB"]);
  wsData.push(["SMP IP YAKIN - Tahun Ajaran 2025/2026"]);
  wsData.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  wsData.push([]);

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

  const monthlyStartRow = wsData.length;
  wsData.push(["STATISTIK BULANAN"]);
  wsData.push(["Bulan", "Total", "Diterima", "Pending", "Ditolak"]);
  stats.monthlyStats.forEach((m) => {
    wsData.push([m.name, m.Total, m.Diterima, m.Pending, m.Ditolak]);
  });
  wsData.push([]);

  const genderStartRow = wsData.length;
  wsData.push(["DISTRIBUSI JENIS KELAMIN"]);
  wsData.push(["Jenis Kelamin", "Jumlah", "", "", ""]);
  stats.genderStats.forEach((g) => {
    const label =
      g.gender === "MALE"
        ? "Laki-laki"
        : g.gender === "FEMALE"
          ? "Perempuan"
          : "Tidak Diketahui";
    wsData.push([label, g._count, "", "", ""]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } },
    { s: { r: monthlyStartRow, c: 0 }, e: { r: monthlyStartRow, c: 4 } },
    { s: { r: genderStartRow, c: 0 }, e: { r: genderStartRow, c: 1 } },
  ];

  worksheet["!autofilter"] = { ref: "A6:C6" };

  worksheet["!margins"] = {
    left: 0.5,
    right: 0.5,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  };

  worksheet["!pageSetup"] = {
    paperSize: 9,
    orientation: "portrait",
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
    firstPageNumber: 1,
  };

  worksheet["!printOptions"] = {
    headings: false,
    gridLines: true,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false,
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik PPDB");

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `Statistik_PPDB_${dateStr}.xlsx`);
}
