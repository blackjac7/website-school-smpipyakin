import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  HeartPulse,
  Home,
  Newspaper,
  ScanLine,
  Settings2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardWorkspace = "osis" | "kesiswaan";

export interface DashboardNotification {
  id: string;
  type: string;
  title?: string;
  message: string;
  time: string;
  read: boolean;
}

export interface DashboardMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface DashboardPageMeta {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const DASHBOARD_COPY = {
  navigation: "Navigasi utama",
  activeWorkspace: "Workspace aktif",
  currentSchoolYear: "Tahun ajaran berjalan",
  notifications: "Notifikasi",
  noNotifications: "Belum ada notifikasi",
  notificationRead: "Semua sudah dibaca",
  automaticFilters: "Hasil diperbarui otomatis",
} as const;

export const APPROVAL_STATUS = {
  PENDING: {
    label: "Menunggu",
    longLabel: "Menunggu validasi",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  APPROVED: {
    label: "Disetujui",
    longLabel: "Sudah disetujui",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REJECTED: {
    label: "Ditolak",
    longLabel: "Sudah ditolak",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
} as const;

export type ApprovalStatus = keyof typeof APPROVAL_STATUS;

export const VALIDATION_FILTERS = {
  status: [
    { value: "Semua Status", label: "Semua status" },
    { value: "Pending", label: APPROVAL_STATUS.PENDING.label },
    { value: "Approved", label: APPROVAL_STATUS.APPROVED.label },
    { value: "Rejected", label: APPROVAL_STATUS.REJECTED.label },
  ],
  category: [
    { value: "Semua Kategori", label: "Semua kategori" },
    { value: "Akademik", label: "Akademik" },
    { value: "Olahraga", label: "Olahraga" },
    { value: "Seni", label: "Seni" },
    { value: "Fotografi", label: "Fotografi" },
    { value: "Videografi", label: "Videografi" },
    { value: "Kegiatan", label: "Kegiatan OSIS" },
    { value: "Prestasi", label: "Prestasi" },
  ],
} as const;

export const WORKSPACE_CONFIG = {
  osis: {
    title: "OSIS Center",
    eyebrow: "PUSAT KERJA SISWA",
    role: "Pengurus OSIS",
    accent: "blue",
    menu: [
      { id: "dashboard", label: "Ringkasan", icon: Home },
      { id: "activities", label: "Program Kerja", icon: FileText },
      { id: "news", label: "Berita Kegiatan", icon: Newspaper },
      { id: "schedule", label: "Jadwal Kegiatan", icon: CalendarDays },
      { id: "keterlambatan", label: "Scan Pelanggaran", icon: ScanLine },
      { id: "ibadah", label: "Ibadah", icon: HeartPulse },
    ] satisfies DashboardMenuItem[],
    pages: {
      dashboard: { title: "Ringkasan OSIS", description: "Satu pandangan untuk agenda, program, dan tugas hari ini.", icon: Home },
      activities: { title: "Program Kerja", description: "Rencanakan, kirim, dan pantau progres program OSIS.", icon: FileText },
      news: { title: "Berita Kegiatan", description: "Dokumentasikan kegiatan yang berdampak bagi sekolah.", icon: Newspaper },
      schedule: { title: "Jadwal Kegiatan", description: "Atur ritme agenda OSIS dalam kalender bersama.", icon: CalendarDays },
      keterlambatan: { title: "Scan Pelanggaran", description: "Catat keterlambatan dan atribut dengan alur yang terkontrol.", icon: ScanLine },
      ibadah: { title: "Manajemen Ibadah", description: "Koordinasikan jadwal ibadah dan tugas piket siswa.", icon: HeartPulse },
    } satisfies Record<string, DashboardPageMeta>,
  },
  kesiswaan: {
    title: "Kesiswaan",
    eyebrow: "LAYANAN KESISWAAN",
    role: "Staff Kesiswaan",
    accent: "indigo",
    menu: [
      { id: "overview", label: "Ringkasan", icon: Home },
      { id: "validation", label: "Validasi Konten", icon: CheckCircle2 },
      { id: "students", label: "Data Siswa", icon: Users },
      { id: "kartu-siswa", label: "Kartu Siswa", icon: CreditCard },
      { id: "reports", label: "Laporan", icon: BarChart3 },
      { id: "settings", label: "Pengaturan", icon: Settings2 },
    ] satisfies DashboardMenuItem[],
    pages: {
      overview: { title: "Ringkasan Hari Ini", description: "Pantau kondisi siswa dan prioritas Kesiswaan.", icon: Home },
      validation: { title: "Validasi Konten", description: "Review dan berikan keputusan pada konten sekolah.", icon: CheckCircle2 },
      students: { title: "Data Siswa", description: "Kelola data siswa dengan cepat dan aman.", icon: Users },
      "kartu-siswa": { title: "Kartu Siswa", description: "Cetak identitas siswa dengan QR terverifikasi.", icon: CreditCard },
      reports: { title: "Laporan", description: "Baca tren disiplin dan validasi untuk menentukan tindak lanjut.", icon: BarChart3 },
      settings: { title: "Pengaturan", description: "Sesuaikan preferensi kerja dashboard Kesiswaan.", icon: Settings2 },
    } satisfies Record<string, DashboardPageMeta>,
  },
} as const;

export function getWorkspacePageMeta(workspace: DashboardWorkspace, pageId?: string) {
  const pages = WORKSPACE_CONFIG[workspace].pages as Record<string, DashboardPageMeta>;
  return pages[pageId || ""] ?? Object.values(pages)[0];
}
