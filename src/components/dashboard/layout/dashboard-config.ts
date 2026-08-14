import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  HeartPulse,
  Home,
  Image,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  QrCode,
  ScanLine,
  Settings2,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardWorkspace =
  | "admin"
  | "kesiswaan"
  | "osis"
  | "siswa"
  | "ppdb"
  | "pembina-osis";

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
  section?: string;
  href?: string;
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
  schoolYear: "Tahun ajaran aktif",
  actions: "Aksi",
  search: "Cari data",
  resetFilters: "Atur ulang filter",
  loadMore: "Muat lebih banyak",
  emptyTitle: "Belum ada data",
  emptyDescription: "Data akan tampil di sini setelah tersedia.",
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
  admin: {
    title: "Pusat Admin",
    eyebrow: "MANAJEMEN SEKOLAH",
    role: "Administrator",
    menu: [
      { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard, href: "/dashboard-admin", section: "Utama" },
      { id: "hero", label: "Banner Utama", icon: Image, href: "/dashboard-admin/hero", section: "Konten Publik" },
      { id: "stats", label: "Statistik Singkat", icon: Activity, href: "/dashboard-admin/stats", section: "Konten Publik" },
      { id: "news", label: "Berita Sekolah", icon: Newspaper, href: "/dashboard-admin/news", section: "Konten Publik" },
      { id: "announcements", label: "Pengumuman", icon: Megaphone, href: "/dashboard-admin/announcements", section: "Konten Publik" },
      { id: "facilities", label: "Fasilitas", icon: Building2, href: "/dashboard-admin/facilities", section: "Data Sekolah" },
      { id: "extracurricular", label: "Ekstrakurikuler", icon: Trophy, href: "/dashboard-admin/extracurricular", section: "Data Sekolah" },
      { id: "calendar", label: "Kalender Akademik", icon: CalendarDays, href: "/dashboard-admin/calendar", section: "Data Sekolah" },
      { id: "teachers", label: "Guru & Staf", icon: GraduationCap, href: "/dashboard-admin/teachers", section: "Data Sekolah" },
      { id: "users", label: "Pengguna", icon: Users, href: "/dashboard-admin/users", section: "Sistem" },
      { id: "settings", label: "Pengaturan", icon: Settings2, href: "/dashboard-admin/settings", section: "Sistem" },
    ] satisfies DashboardMenuItem[],
    pages: {
      dashboard: { title: "Ringkasan Admin", description: "Pantau kesehatan konten, data sekolah, dan aktivitas sistem.", icon: LayoutDashboard },
      hero: { title: "Banner Utama", description: "Atur pesan dan gambar pertama yang dilihat pengunjung website.", icon: Image },
      stats: { title: "Statistik Singkat", description: "Kelola angka utama yang ditampilkan pada halaman publik.", icon: Activity },
      news: { title: "Berita Sekolah", description: "Terbitkan dan kelola informasi kegiatan sekolah.", icon: Newspaper },
      announcements: { title: "Pengumuman", description: "Sampaikan informasi penting secara ringkas dan tepat waktu.", icon: Megaphone },
      facilities: { title: "Fasilitas", description: "Kelola informasi sarana dan prasarana sekolah.", icon: Building2 },
      extracurricular: { title: "Ekstrakurikuler", description: "Kelola program, pembina, jadwal, dan dokumentasi kegiatan.", icon: Trophy },
      calendar: { title: "Kalender Akademik", description: "Atur agenda sekolah dalam satu kalender bersama.", icon: CalendarDays },
      teachers: { title: "Guru & Staf", description: "Kelola profil tenaga pendidik dan kependidikan.", icon: GraduationCap },
      users: { title: "Manajemen Pengguna", description: "Kelola akun dan hak akses dengan aman.", icon: Users },
      settings: { title: "Pengaturan Sistem", description: "Kelola konfigurasi website, PPDB, dan mode pemeliharaan.", icon: Settings2 },
    } satisfies Record<string, DashboardPageMeta>,
  },
  osis: {
    title: "OSIS Center",
    eyebrow: "PUSAT KERJA SISWA",
    role: "Pengurus OSIS",
    menu: [
      { id: "dashboard", label: "Ringkasan", icon: Home, section: "Utama" },
      { id: "activities", label: "Program Kerja", icon: FileText, section: "Publikasi" },
      { id: "news", label: "Berita Kegiatan", icon: Newspaper, section: "Publikasi" },
      { id: "schedule", label: "Jadwal Kegiatan", icon: CalendarDays, section: "Operasional" },
      { id: "keterlambatan", label: "Catat Pelanggaran", icon: ScanLine, section: "Operasional" },
      { id: "ibadah", label: "Tugas Ibadah", icon: HeartPulse, section: "Operasional" },
    ] satisfies DashboardMenuItem[],
    pages: {
      dashboard: { title: "Ringkasan OSIS", description: "Satu pandangan untuk agenda, program, dan tugas hari ini.", icon: Home },
      activities: { title: "Program Kerja", description: "Rencanakan, kirim, dan pantau progres program OSIS.", icon: FileText },
      news: { title: "Berita Kegiatan", description: "Dokumentasikan kegiatan yang berdampak bagi sekolah.", icon: Newspaper },
      schedule: { title: "Jadwal Kegiatan", description: "Atur ritme agenda OSIS dalam kalender bersama.", icon: CalendarDays },
      keterlambatan: { title: "Catat Pelanggaran", description: "Catat keterlambatan dan atribut dengan alur yang terkontrol.", icon: ScanLine },
      ibadah: { title: "Tugas Ibadah", description: "Koordinasikan jadwal ibadah dan tugas piket siswa.", icon: HeartPulse },
    } satisfies Record<string, DashboardPageMeta>,
  },
  kesiswaan: {
    title: "Kesiswaan",
    eyebrow: "LAYANAN KESISWAAN",
    role: "Staff Kesiswaan",
    menu: [
      { id: "overview", label: "Ringkasan", icon: Home, section: "Utama" },
      { id: "validation", label: "Validasi Konten", icon: CheckCircle2, section: "Tindak Lanjut" },
      { id: "students", label: "Data Siswa", icon: Users, section: "Data Siswa" },
      { id: "kartu-siswa", label: "Kartu Siswa", icon: CreditCard, section: "Data Siswa" },
      { id: "reports", label: "Laporan", icon: BarChart3, section: "Analisis" },
      { id: "settings", label: "Pengaturan", icon: Settings2, section: "Sistem" },
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
  siswa: {
    title: "Portal Siswa",
    eyebrow: "RUANG SISWA",
    role: "Siswa",
    menu: [
      { id: "dashboard", label: "Ringkasan", icon: Home, section: "Utama" },
      { id: "achievements", label: "Prestasi", icon: Award, section: "Portofolio" },
      { id: "works", label: "Karya", icon: BookOpen, section: "Portofolio" },
      { id: "qrcode", label: "QR Saya", icon: QrCode, section: "Identitas" },
    ] satisfies DashboardMenuItem[],
    pages: {
      dashboard: { title: "Ringkasan Siswa", description: "Lihat profil, portofolio, dan tindakan penting dalam satu tempat.", icon: Home },
      achievements: { title: "Prestasi Saya", description: "Dokumentasikan prestasi dan pantau proses validasinya.", icon: Award },
      works: { title: "Karya Saya", description: "Kelola karya foto atau video untuk portofolio sekolah.", icon: BookOpen },
      qrcode: { title: "QR Siswa", description: "Gunakan kode ini sebagai identitas pada layanan sekolah.", icon: QrCode },
    } satisfies Record<string, DashboardPageMeta>,
  },
  ppdb: {
    title: "Pusat PPDB",
    eyebrow: "PENERIMAAN SISWA",
    role: "Petugas PPDB",
    menu: [
      { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard, section: "Utama" },
      { id: "validation", label: "Validasi Pendaftar", icon: ShieldCheck, section: "Pendaftaran" },
      { id: "reports", label: "Laporan", icon: BarChart3, section: "Analisis" },
    ] satisfies DashboardMenuItem[],
    pages: {
      dashboard: { title: "Ringkasan PPDB", description: "Pantau pendaftar, status validasi, dan prioritas hari ini.", icon: LayoutDashboard },
      validation: { title: "Validasi Pendaftar", description: "Periksa data dan dokumen sebelum memberikan keputusan.", icon: ShieldCheck },
      reports: { title: "Laporan PPDB", description: "Analisis perkembangan dan komposisi pendaftaran.", icon: BarChart3 },
    } satisfies Record<string, DashboardPageMeta>,
  },
  "pembina-osis": {
    title: "Pembina OSIS",
    eyebrow: "PENDAMPING ORGANISASI",
    role: "Pembina OSIS",
    menu: [
      { id: "dashboard", label: "Ringkasan", icon: Home, section: "Utama" },
      { id: "pending", label: "Menunggu Validasi", icon: Clock3, section: "Keputusan" },
      { id: "history", label: "Riwayat Validasi", icon: Bell, section: "Keputusan" },
    ] satisfies DashboardMenuItem[],
    pages: {
      dashboard: { title: "Ringkasan Pembina OSIS", description: "Pantau proposal yang perlu ditinjau dan hasil keputusan terbaru.", icon: Home },
      pending: { title: "Validasi Proposal", description: "Tinjau kelayakan, jadwal, peserta, dan anggaran sebelum memutuskan.", icon: Clock3 },
      history: { title: "Riwayat Validasi", description: "Lihat kembali proposal yang sudah diproses.", icon: Bell },
    } satisfies Record<string, DashboardPageMeta>,
  },
} as const;

export function getWorkspacePageMeta(workspace: DashboardWorkspace, pageId?: string) {
  const pages = WORKSPACE_CONFIG[workspace].pages as Record<string, DashboardPageMeta>;
  return pages[pageId || ""] ?? Object.values(pages)[0];
}

export function getWorkspaceMenu(workspace: DashboardWorkspace) {
  return WORKSPACE_CONFIG[workspace].menu as readonly DashboardMenuItem[];
}
