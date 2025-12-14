
import {
  Announcement,
  News,
  SchoolActivity,
  PriorityLevel,
  SemesterType,
  BeritaKategori,
  StatusApproval
} from "@prisma/client";

// Mock Data for Announcements
export const mockAnnouncements: Partial<Announcement>[] = [
  {
    id: "1",
    title: "Pendaftaran Siswa Baru 2024/2025",
    date: new Date("2024-03-15"),
    content: "<p>Pendaftaran siswa baru untuk tahun ajaran 2024/2025 telah dibuka. Silakan kunjungi halaman PPDB untuk informasi lebih lanjut.</p>",
    priority: "HIGH" as PriorityLevel,
    location: "Kampus SMP IP Yakin",
  },
  {
    id: "2",
    title: "Jadwal Ujian Tengah Semester",
    date: new Date("2024-03-12"),
    content: "<p>Ujian Tengah Semester Genap akan dilaksanakan mulai tanggal 18 Maret 2024. Harap siswa mempersiapkan diri.</p>",
    priority: "MEDIUM" as PriorityLevel,
    location: "Ruang Kelas",
  },
  {
    id: "3",
    title: "Pekan Olahraga dan Seni",
    date: new Date("2024-03-20"),
    content: "<p>Porseni akan diadakan setelah ujian selesai. Berbagai lomba menarik menanti Anda!</p>",
    priority: "LOW" as PriorityLevel,
    location: "Lapangan Sekolah",
  },
];

// Mock Data for News (compatible with existing dummyNews in components but typed)
export const mockNews: Partial<News>[] = [
  {
    id: "1",
    title: "Juara 2 Tari Tingkat Nasional",
    date: new Date("2024-03-10"),
    content: "<p>Tim tari SMP IP Yakin berhasil meraih juara 2 dalam lomba tari kreasi tingkat nasional...</p>",
    image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
    kategori: "ACHIEVEMENT" as BeritaKategori,
    statusPersetujuan: "APPROVED" as StatusApproval,
  },
  {
    id: "2",
    title: "Perayaan Hari Guru",
    date: new Date("2024-03-08"),
    content: "<p>Perayaan hari guru berlangsung meriah dengan berbagai penampilan dari siswa...</p>",
    image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    kategori: "ACTIVITY" as BeritaKategori,
    statusPersetujuan: "APPROVED" as StatusApproval,
  },
  {
    id: "3",
    title: "Kompetisi Robotik",
    date: new Date("2024-03-05"),
    content: "<p>Siswa kelas 8 mengikuti kompetisi robotik regional dan menampilkan inovasi terbaru...</p>",
    image: "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
    kategori: "ACTIVITY" as BeritaKategori,
    statusPersetujuan: "APPROVED" as StatusApproval,
  },
];

// Mock Data for Academic Calendar
export const mockActivities: Partial<SchoolActivity>[] = [
  {
    id: "1",
    title: "KBM semester genap kembali aktif",
    date: new Date("2024-01-02"),
    information: "Kelas VII, VIII, IX",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2023/2024",
  },
  {
    id: "2",
    title: 'Projek "Kearifan Lokal"',
    date: new Date("2024-01-08"),
    information: "Kelas VII (Berlangsung sampai 13 Feb 2024)",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2023/2024",
  },
  {
    id: "3",
    title: "Pendalaman Materi",
    date: new Date("2024-01-08"),
    information: "Kelas IX (Berlangsung sampai 22 Feb 2024)",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2023/2024",
  },
  {
    id: "4",
    title: "Ujian Tengah Semester",
    date: new Date("2024-03-18"),
    information: "Seluruh Siswa",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2023/2024",
  },
  {
    id: "5",
    title: "Libur Hari Raya Idul Fitri",
    date: new Date("2024-04-10"),
    information: "Libur Nasional",
    semester: "GENAP" as SemesterType,
    tahunPelajaran: "2023/2024",
  },
];

// Helper to format date
export const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
