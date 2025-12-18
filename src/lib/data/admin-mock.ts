
import { GraduationCap, Music, User, Lock, LucideIcon } from "lucide-react";

export interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
  class: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  joinDate: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'increase' | 'decrease' | 'stable';
}

export interface ActivityType {
  user: string;
  action: string;
  time: string;
  type: 'content' | 'profile' | 'calendar' | 'system';
}

export interface ContentItem {
  id: number;
  title: string;
  type: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
  views: number;
}

export interface Notification {
  id: number;
  type: 'alert' | 'info' | 'success';
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

export const mockStats: StatCard[] = [
  {
    label: "Total Siswa",
    value: "1,247",
    icon: GraduationCap,
    change: "+12%",
    changeType: "increase",
  },
  {
    label: "Total Guru",
    value: "89",
    icon: Music,
    change: "+3%",
    changeType: "increase",
  },
  {
    label: "OSIS",
    value: "24",
    icon: User,
    change: "0%",
    changeType: "stable",
  },
  {
    label: "Konten Aktif",
    value: "156",
    icon: Lock,
    change: "+8%",
    changeType: "increase",
  },
];

export const mockUsers: UserType[] = [
  {
    id: 1,
    name: "Ahmad Rizki",
    email: "ahmad.rizki@smpipyakin.sch.id",
    role: "Siswa",
    class: "XII IPA 1",
    status: "Active",
    lastLogin: "2 jam yang lalu",
    joinDate: "2023-07-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@smpipyakin.sch.id",
    role: "Guru",
    class: "Matematika",
    status: "Active",
    lastLogin: "1 jam yang lalu",
    joinDate: "2022-01-10",
  },
  {
    id: 3,
    name: "Maya Sari",
    email: "maya.sari@smpipyakin.sch.id",
    role: "Kesiswaan",
    class: "-",
    status: "Active",
    lastLogin: "30 menit yang lalu",
    joinDate: "2021-08-20",
  },
  {
    id: 4,
    name: "Budi Santoso",
    email: "budi.santoso@smpipyakin.sch.id",
    role: "OSIS",
    class: "XI IPS 2",
    status: "Inactive",
    lastLogin: "3 hari yang lalu",
    joinDate: "2023-09-01",
  },
];

export const mockActivities: ActivityType[] = [
  {
    user: "Sarah Johnson",
    action: "menambahkan pengumuman baru",
    time: "2 jam yang lalu",
    type: "content",
  },
  {
    user: "Ahmad Rizki",
    action: "memperbarui profil siswa",
    time: "4 jam yang lalu",
    type: "profile",
    },
    {
    user: "Maya Sari",
    action: "menghapus berita lama",
    time: "6 jam yang lalu",
    type: "content",
    },
    {
    user: "Budi Santoso",
    action: "menambahkan event kalender",
    time: "8 jam yang lalu",
    type: "calendar",
    },
    {
    user: "Lisa Wijaya",
    action: "memperbarui pengaturan sistem",
    time: "1 hari yang lalu",
    type: "system",
  },
];

export const mockContentItems: ContentItem[] = [
  {
    id: 1,
    title: "Pengumuman Libur Semester",
    type: "Pengumuman",
    author: "Admin Sekolah",
    date: "2025-01-15",
    status: "Published",
    views: 1250,
  },
  {
    id: 2,
    title: "Prestasi Siswa Olimpiade Matematika",
    type: "Berita",
    author: "Sarah Johnson",
    date: "2025-01-14",
    status: "Published",
    views: 890,
  },
  {
    id: 3,
    title: "Jadwal Ujian Tengah Semester",
    type: "Pengumuman",
    author: "Maya Sari",
    date: "2025-01-13",
    status: "Draft",
    views: 0,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "alert",
    message: "Server maintenance dijadwalkan malam ini",
    detail: "Maintenance akan dilakukan pukul 23:00 - 02:00 WIB",
    time: "1 jam yang lalu",
    read: false,
  },
  {
    id: 2,
    type: "info",
    message: "Backup database berhasil",
    detail: "Backup otomatis telah selesai dilakukan",
    time: "3 jam yang lalu",
    read: false,
  },
  {
    id: 3,
    type: "success",
    message: "15 pengguna baru terdaftar hari ini",
    detail: "12 siswa dan 3 guru telah bergabung",
    time: "5 jam yang lalu",
    read: true,
  },
];
