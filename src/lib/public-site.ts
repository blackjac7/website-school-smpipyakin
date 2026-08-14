import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  History,
  Images,
  Landmark,
  Palette,
  School,
  Target,
  Users,
} from "lucide-react";

export interface PublicNavChild {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

export interface PublicNavItem {
  label: string;
  href: string;
  matchPrefixes?: string[];
  children?: PublicNavChild[];
}

export const publicNavigation: PublicNavItem[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Tentang Sekolah",
    href: "/profile/visi-misi",
    matchPrefixes: ["/profile"],
    children: [
      {
        label: "Visi & Misi",
        href: "/profile/visi-misi",
        description: "Arah pendidikan dan nilai utama sekolah.",
        icon: Target,
      },
      {
        label: "Sejarah Sekolah",
        href: "/profile/sejarah",
        description: "Perjalanan SMP IP Yakin dari masa ke masa.",
        icon: History,
      },
      {
        label: "Sambutan Kepala Sekolah",
        href: "/profile/sambutan",
        description: "Pesan dan komitmen pimpinan sekolah.",
        icon: School,
      },
      {
        label: "Struktur Organisasi",
        href: "/profile/struktur",
        description: "Susunan kepemimpinan dan pengelola sekolah.",
        icon: Landmark,
      },
      {
        label: "Guru & Tenaga Pendidik",
        href: "/profile/guru",
        description: "Kenali tim pendidik SMP IP Yakin.",
        icon: Users,
      },
    ],
  },
  {
    label: "Kehidupan Sekolah",
    href: "/academic-calendar",
    matchPrefixes: [
      "/academic-calendar",
      "/extracurricular",
      "/facilities",
      "/karya-siswa",
    ],
    children: [
      {
        label: "Kalender Akademik",
        href: "/academic-calendar",
        description: "Agenda akademik dan kegiatan sekolah.",
        icon: CalendarDays,
      },
      {
        label: "Ekstrakurikuler",
        href: "/extracurricular",
        description: "Pilihan kegiatan untuk mengembangkan potensi.",
        icon: Award,
      },
      {
        label: "Fasilitas",
        href: "/facilities",
        description: "Sarana belajar dan lingkungan sekolah.",
        icon: Building2,
      },
      {
        label: "Karya Siswa",
        href: "/karya-siswa",
        description: "Galeri kreativitas dan hasil belajar siswa.",
        icon: Palette,
      },
    ],
  },
  {
    label: "Informasi",
    href: "/news",
    matchPrefixes: ["/news", "/announcements"],
    children: [
      {
        label: "Berita & Prestasi",
        href: "/news",
        description: "Kabar terbaru, kegiatan, dan prestasi sekolah.",
        icon: Images,
      },
      {
        label: "Pengumuman",
        href: "/announcements",
        description: "Informasi resmi yang perlu diketahui.",
        icon: BookOpen,
      },
    ],
  },
  { label: "Kontak", href: "/contact" },
];

export const schoolIdentity = {
  shortName: "SMP IP YAKIN",
  name: "SMP IP YAKIN",
  location: "Cengkareng Timur, Jakarta Barat",
  description:
    "Sekolah menengah pertama yang menumbuhkan karakter, potensi, dan prestasi siswa.",
  address:
    "Jl. Bangun Nusa Raya No. 10, Cengkareng Timur, Jakarta Barat 11730",
  phoneDisplay: "+62 21 6194 381",
  phoneHref: "tel:+62216194381",
  email: "info@smpipyakin.sch.id",
  mapsHref:
    "https://maps.google.com/?q=Jl.+Bangun+Nusa+Raya+No.+10,+Cengkareng+Timur,+Jakarta+Barat+11730",
  instagramHandle: "@smpyakinku",
  instagramHref: "https://www.instagram.com/smpyakinku",
} as const;

export const operationalHours = [
  { day: "Senin–Jumat", time: "07.00–15.00" },
  { day: "Sabtu", time: "07.00–12.00" },
] as const;

export function normalizePublicSchoolName(value: string) {
  return value
    .replace(/SMP IP Yakin Jakarta/gi, schoolIdentity.name)
    .replace(/SMP IP Yakin/gi, schoolIdentity.name);
}

export function isPublicNavItemActive(
  pathname: string,
  item: PublicNavItem,
) {
  if (item.href === "/") return pathname === "/";
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
