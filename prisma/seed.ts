import {
  PrismaClient,
  TeacherCategory,
  BeritaKategori,
  StatusApproval,
  PriorityLevel,
  SemesterType,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedStudentsFromExcel } from "./importStudentsFromExcel";

const prisma = new PrismaClient();

// --- Data Constants from Mock Files ---

const FACILITIES_DATA = [
  {
    name: "Laboratorium Sains",
    description:
      "Laboratorium modern yang dilengkapi dengan peralatan praktikum terkini untuk mata pelajaran Fisika, Kimia, dan Biologi.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTUwSDE1MFYyNTBIMjUwVjE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB4PSIyNzAiIHk9IjE3MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNNS4wOTY3NCAxMS4wOTY3TDEyIDQuMTkzNDFMMTguOTAzMyAxMS4wOTY3TTEyIDQuMTkzNDFWMTkuODA2NiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPHR4dCB4PSIzMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MYWJvcmF0b3JpdW0gU2FpbnM8L3R4dD4KPC9zdmc+",
  },
  {
    name: "Perpustakaan",
    description:
      "Perpustakaan dengan koleksi buku fisik, dilengkapi area membaca yang nyaman dan akses e-library.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733112505/Perpustakaan_btnhtn.jpg",
  },
  {
    name: "Lapangan Olahraga",
    description:
      "Fasilitas olahraga lengkap termasuk lapangan futsal, basket, dan area atletik dengan standar nasional.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733094531/lapangan_pxkhxa.jpg",
  },
  {
    name: "Laboratorium Komputer",
    description:
      "Lab komputer dengan perangkat terbaru untuk pembelajaran teknologi informasi dan programming.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
  },
  {
    name: "Kantin Sekolah",
    description:
      "Kantin dengan berbagai pilihan makanan dan minuman sehat untuk menunjang gizi siswa.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733095032/kantin_xhsmox.jpg",
  },
  {
    name: "Mesin Minuman Otomatis",
    description:
      "Mesin minuman otomatis yang menyediakan berbagai minuman sehat dan menyegarkan.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733095023/mesin_otomatis_gcb28n.jpg",
  },
];

const EXTRACURRICULAR_DATA = [
  {
    name: "Pramuka",
    description:
      "Kegiatan kepanduan yang mengembangkan jiwa kepemimpinan, kemandirian, dan kerjasama tim.",
    schedule: "Selasa, 13:00 - 14:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1732787846/Pramuka_ocy314.webp",
  },
  {
    name: "Seni Musik",
    description:
      "Pengembangan bakat musik melalui pembelajaran alat musik dan paduan suara.",
    schedule: "Sabtu, 07:30 - 09:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732802973/Seni_Musik_qnbwpd.webp",
  },
  {
    name: "Seni Tari",
    description:
      "Mempelajari dan melestarikan berbagai tarian tradisional dan modern Indonesia.",
    schedule: "Rabu, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1732791235/seni_tari_1_cb7rgy.webp",
  },
  {
    name: "Hadroh",
    description:
      "Pengembangan seni musik islami melalui pembelajaran alat musik rebana dan vocal.",
    schedule: "Rabu, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732803309/hadroh_11_g8qlsr.webp",
  },
  {
    name: "Rohis",
    description:
      "Kegiatan pembinaan keagamaan Islam untuk meningkatkan pemahaman dan praktik keislaman.",
    schedule: ["Selasa, 13:00 - 14:30 WIB", "Sabtu, 09:30 - 10:30 WIB"],
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804810/rohis_dtzeef.webp",
  },
  {
    name: "Rohkris",
    description:
      "Kegiatan pembinaan keagamaan Kristen untuk meningkatkan pemahaman dan praktik kekristenan.",
    schedule: "Jumat, 11:00 - 12:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733187839/rohkris_xf2im9.webp",
  },
  {
    name: "Paskibra",
    description:
      "Kegiatan yang fokus pada latihan baris-berbaris dan upacara bendera.",
    schedule: "Jum'at, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804631/paskibra_v3htds.webp",
  },
  {
    name: "Futsal",
    description:
      "Latihan futsal untuk mengembangkan kemampuan olahraga dan sportivitas.",
    schedule: "Sabtu, 09:00 - 11:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732802973/Futsal_hghnis.webp",
  },
  {
    name: "Pencak Silat",
    description:
      "Seni bela diri tradisional Indonesia yang mengembangkan kemampuan fisik dan mental.",
    schedule: "Sabtu, 06:00 - 07:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804631/silat_a4ly8k.webp",
  },
];

const NEWS_DATA = [
  {
    title: "Juwita Meraih Juara 2 Tari Tradisional Nasional di TMII",
    date: "15 Okt 2024",
    content:
      "Selamat dan bangga! Juwita, peserta didik SMP IP YAKIN, telah meraih prestasi luar biasa dengan meraih juara kedua dalam kompetisi tari tradisional nasional yang diselenggarakan di Taman Mini Indonesia Indah (TMII). Juwita telah menunjukkan kemampuan dan dedikasi yang luar biasa dalam menampilkan tarian tradisional yang indah dan menginspirasi. Prestasi ini tidak hanya membanggakan dirinya, tetapi juga membanggakan sekolah dan semua pihak yang terlibat dalam pendidikannya. Kami selalu mendorong siswa-siswi kami untuk terus berkarya dan mencapai prestasi tertinggi di berbagai bidang. Kesuksesan Juwita adalah bukti nyata bahwa dengan kerja keras, dedikasi, dan dukungan yang tepat, semua hal mungkin tercapai. Marilah kita berterima kasih kepada Juwita atas prestasinya dan terus mendukung semua siswa SMP IP YAKIN dalam mengejar cita-cita dan mencapai kesuksesan. Jaya terus, Juwita! Jaya terus, SMP IP YAKIN!",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
    category: "achievement",
  },
  {
    title: "Perayaan Milad Sekolah ke-39",
    date: "10 Mar 2024",
    content:
      "SMP IP Yakin Jakarta merayakan hari jadi yang ke-39 dengan berbagai kegiatan menarik, termasuk pentas seni, pameran karya siswa, dan bakti sosial kepada masyarakat sekitar.",
    image:
      "https://images.unsplash.com/photo-1694174603586-ffb4f892023c?q=80&w=2233&auto=format&fit=crop&ixlib=rb-4.1.0",
    category: "activity",
  },
  {
    title: "Siswa Hafiz Quran Bertambah",
    date: "5 Mar 2024",
    content:
      "Program tahfiz Quran SMP IP Yakin Jakarta kembali mencetak prestasi dengan bertambahnya 15 siswa yang berhasil menyelesaikan hafalan 5 juz Al-Quran.",
    image:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?ixlib=rb-4.0.3",
    category: "achievement",
  },
  {
    title: "Kunjungan Edukatif ke Museum Nasional",
    date: "1 Mar 2024",
    content:
      "Siswa kelas 8 melakukan kunjungan edukatif ke Museum Nasional sebagai bagian dari pembelajaran sejarah dan budaya Indonesia.",
    image:
      "https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?ixlib=rb-4.0.3",
    category: "activity",
  },
  {
    title: "Juara Umum Olimpiade Sains",
    date: "25 Feb 2024",
    content:
      "SMP IP Yakin Jakarta berhasil meraih gelar juara umum dalam Olimpiade Sains tingkat DKI Jakarta dengan perolehan 5 medali emas, 3 perak, dan 4 perunggu.",
    image:
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3",
    category: "achievement",
  },
  {
    title: "Workshop Literasi Digital",
    date: "20 Feb 2024",
    content:
      "Sekolah mengadakan workshop literasi digital untuk meningkatkan kesadaran siswa tentang penggunaan teknologi yang aman dan bertanggung jawab.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3",
    category: "activity",
  },
];

const ANNOUNCEMENTS_DATA = [
  {
    title: "Pengumuman Jadwal UTS Semester Ganjil",
    date: "2024-10-01",
    location: "SMP IP Yakin Jakarta",
    content: "UTS akan dilaksanakan mulai tanggal 15 Oktober 2024.",
    priority: "HIGH",
  },
  {
    title: "Libur Hari Raya Idul Fitri",
    date: "2024-04-01",
    location: "SMP IP Yakin Jakarta",
    content: "Sekolah libur pada tanggal 10-15 April 2024.",
    priority: "MEDIUM",
  },
  {
    title: "Pendaftaran Ekstrakurikuler Baru",
    date: "2024-07-20",
    location: "Ruang Kesiswaan",
    content:
      "Pendaftaran ekstrakurikuler untuk siswa baru dibuka mulai Senin depan.",
    priority: "LOW",
  },
  {
    title: "Rapat Orang Tua Siswa Kelas VII",
    date: "2024-07-15",
    location: "Aula Sekolah",
    content:
      "Mengundang seluruh orang tua/wali murid kelas VII untuk hadir dalam rapat awal tahun pelajaran.",
    priority: "HIGH",
  },
  {
    title: "Kegiatan Porseni Antar Kelas",
    date: "2024-12-10",
    location: "Lapangan Olahraga",
    content:
      "Pekan Olahraga dan Seni (Porseni) akan diadakan setelah ujian akhir semester.",
    priority: "MEDIUM",
  },
];

const TEACHERS_DATA = [
  {
    name: "Muhamad Abduh, S.T.",
    position: "Kepala Sekolah",
    category: "Pimpinan",
    subject: "Informatika",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
    description: "Memimpin dengan inovasi teknologi dan hati.",
    experience: "15",
  },
  {
    name: "Edy Supandi",
    position: "Kepala Tata Usaha",
    category: "Staff",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
    description: "Mengelola administrasi sekolah dengan profesional.",
  },
  {
    name: "Santi",
    position: "Operator Sekolah",
    category: "Staff",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    description: "Menangani pendataan dan sistem informasi sekolah.",
  },
  {
    name: "Reti Sibagariang, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPS",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Abdulloh Syapii, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Kesiswaan",
    category: "Pimpinan",
    subject: "PAI",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
    description: "Membentuk karakter siswa yang berakhlak mulia.",
  },
  {
    name: "Megawati, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Kurikulum",
    category: "Pimpinan",
    subject: "Matematika",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    description: "Menyusun kurikulum yang adaptif dan progresif.",
  },
  {
    name: "Hannystira, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Indonesia",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Ilim Hilimudin",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Prakarya / Informatika / Koding",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Arif Darmawan, M.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPS",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Drs. Subino",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "PKN",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Umi Sultra, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPA",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Eti Fitriah, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPA",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Wiwi Rohayati, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Matematika",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Petra",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Seni",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Mei Megawati, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Indonesia",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Sawitri Handayani, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Inggris",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Anita Permatasari, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "PKN",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Yumelda Listiana, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Inggris",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Marzuki, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Pembina OSIS",
    category: "Pimpinan",
    subject: "PJOK",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
    description: "Mengembangkan potensi kepemimpinan siswa.",
  },
  {
    name: "Muhammad Pebrian Syah",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "PJOK",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Abdul Rahman, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bimbingan Konseling",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Siti Humairoh, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Indonesia",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Intan Maharani, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Matematika",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Febriansyah",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Koding",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
];

const SCHOOL_ACTIVITIES_DATA = [
  {
    title: "Masa Pengenalan Lingkungan Sekolah (MPLS)",
    date: "2025-07-15",
    information:
      "Kegiatan pengenalan lingkungan sekolah bagi siswa baru kelas VII.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Upacara Hari Kemerdekaan RI",
    date: "2025-08-17",
    information:
      "Upacara bendera memperingati HUT Kemerdekaan RI ke-80 di lapangan sekolah.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Penilaian Tengah Semester (PTS) Ganjil",
    date: "2025-09-23",
    information: "Pelaksanaan PTS Ganjil untuk seluruh jenjang kelas.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Peringatan Bulan Bahasa",
    date: "2025-10-28",
    information:
      "Lomba baca puisi, pidato, dan mading dalam rangka Bulan Bahasa.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Peringatan Hari Guru Nasional",
    date: "2025-11-25",
    information: "Upacara dan apresiasi untuk guru oleh OSIS.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Penilaian Akhir Semester (PAS) Ganjil",
    date: "2025-12-02",
    information:
      "Ujian akhir semester ganjil untuk menentukan nilai rapor semester 1.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Class Meeting",
    date: "2025-12-16",
    information: "Perlombaan olahraga dan seni antar kelas setelah PAS.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Pembagian Rapor Semester Ganjil",
    date: "2025-12-20",
    information: "Penyerahan hasil belajar siswa kepada orang tua/wali.",
    semester: "GANJIL",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Hari Pertama Masuk Sekolah Semester Genap",
    date: "2026-01-06",
    information: "Awal kegiatan belajar mengajar semester genap.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Peringatan Isra Mi'raj",
    date: "2026-01-27",
    information:
      "Kegiatan keagamaan memperingati Isra Mi'raj Nabi Muhammad SAW.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Penilaian Tengah Semester (PTS) Genap",
    date: "2026-03-10",
    information: "Evaluasi tengah semester genap.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Pesantren Kilat Ramadhan",
    date: "2026-03-15",
    information: "Kegiatan pendalaman agama Islam selama bulan Ramadhan.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Ujian Sekolah (Kelas IX)",
    date: "2026-05-12",
    information: "Ujian akhir kelulusan bagi siswa kelas IX.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Penilaian Akhir Tahun (PAT)",
    date: "2026-06-09",
    information: "Ujian kenaikan kelas untuk kelas VII dan VIII.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Wisuda Pelepasan Siswa Kelas IX",
    date: "2026-06-21",
    information: "Acara perpisahan dan wisuda siswa kelas IX.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
  {
    title: "Pembagian Rapor Kenaikan Kelas",
    date: "2026-06-27",
    information:
      "Penyerahan rapor semester genap dan pengumuman kenaikan kelas.",
    semester: "GENAP",
    tahunPelajaran: "2025/2026",
  },
];

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
};

function parseIndonesianDate(dateStr: string): Date {
  try {
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1];
      const year = parseInt(parts[2], 10);
      const month = MONTH_MAP[monthStr] ?? 0;
      return new Date(year, month, day);
    }
    return new Date(dateStr); // Fallback for ISO strings
  } catch {
    return new Date();
  }
}

function mapTeacherCategory(category: string): TeacherCategory {
  switch (category) {
    case "Pimpinan":
      return TeacherCategory.PIMPINAN;
    case "Staff":
      return TeacherCategory.STAFF;
    default:
      return TeacherCategory.GURU_MAPEL;
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@smpipyakin.sch.id",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  // 2. Kesiswaan Staff
  const kesiswaanUser = await prisma.user.upsert({
    where: { username: "kesiswaan" },
    update: {},
    create: {
      username: "kesiswaan",
      email: "kesiswaan@smpipyakin.sch.id",
      password: hashedPassword,
      role: UserRole.KESISWAAN,
    },
  });

  // Create Kesiswaan profile
  await prisma.kesiswaan.upsert({
    where: { userId: kesiswaanUser.id },
    update: {},
    create: {
      userId: kesiswaanUser.id,
      nip: "NIP001",
      name: "Staff Kesiswaan",
      gender: "FEMALE",
      statusActive: true,
    },
  });

  // 3. Siswa User
  const siswaUser = await prisma.user.upsert({
    where: { username: "siswa001" },
    update: {},
    create: {
      username: "siswa001",
      password: hashedPassword,
      role: UserRole.SISWA,
    },
  });

  // Create Siswa profile
  const siswaProfile = await prisma.siswa.upsert({
    where: { userId: siswaUser.id },
    update: {},
    create: {
      userId: siswaUser.id,
      nisn: "2024001",
      name: "Ahmad Rizki Pratama",
      class: "VIII A",
      year: 2024,
      gender: "MALE",
      osisAccess: false,
      phone: "081234567890",
      address: "Jl. Merdeka No. 123, Jakarta Pusat",
      birthDate: new Date("2010-05-15"),
      birthPlace: "Jakarta",
      parentName: "Budi Pratama",
      parentPhone: "081234567891",
    },
  });

  // 4. OSIS User
  const osisUser = await prisma.user.upsert({
    where: { username: "osis001" },
    update: {},
    create: {
      username: "osis001",
      password: hashedPassword,
      role: UserRole.OSIS,
    },
  });

  // Create OSIS Siswa profile
  const osisProfile = await prisma.siswa.upsert({
    where: { userId: osisUser.id },
    update: {},
    create: {
      userId: osisUser.id,
      nisn: "2023001",
      name: "Ketua OSIS",
      class: "IX A",
      year: 2023,
      gender: "FEMALE",
      osisAccess: true,
      phone: "081234567892",
      address: "Jl. Sudirman No. 456, Jakarta Selatan",
      birthDate: new Date("2009-08-20"),
      birthPlace: "Bandung",
      parentName: "Siti Aminah",
      parentPhone: "081234567893",
    },
  });

  // 5. PPDB Staff
  await prisma.user.upsert({
    where: { username: "ppdb001" },
    update: {},
    create: {
      username: "ppdb001",
      password: hashedPassword,
      role: UserRole.PPDB_ADMIN,
    },
  });

  console.log("📝 Seeding Facilities...");
  await prisma.facility.deleteMany(); // Clear existing
  for (const item of FACILITIES_DATA) {
    await prisma.facility.create({
      data: {
        title: item.name,
        description: item.description,
        image: item.image,
      },
    });
  }

  console.log("📝 Seeding Extracurriculars...");
  await prisma.extracurricular.deleteMany();
  for (const item of EXTRACURRICULAR_DATA) {
    await prisma.extracurricular.create({
      data: {
        title: item.name,
        description: item.description,
        schedule: Array.isArray(item.schedule)
          ? item.schedule.join(", ")
          : item.schedule,
        image: item.image,
      },
    });
  }

  console.log("📝 Seeding News...");
  await prisma.news.deleteMany();
  for (const item of NEWS_DATA) {
    await prisma.news.create({
      data: {
        title: item.title,
        content: item.content,
        date: parseIndonesianDate(item.date),
        image: item.image,
        kategori:
          item.category === "achievement"
            ? BeritaKategori.ACHIEVEMENT
            : BeritaKategori.ACTIVITY,
        statusPersetujuan: StatusApproval.APPROVED,
        authorId: adminUser.id,
      },
    });
  }

  console.log("📝 Seeding Announcements...");
  await prisma.announcement.deleteMany();
  for (const item of ANNOUNCEMENTS_DATA) {
    await prisma.announcement.create({
      data: {
        title: item.title,
        content: item.content,
        date: new Date(item.date),
        location: item.location,
        priority: item.priority as PriorityLevel,
      },
    });
  }

  console.log("📝 Seeding Teachers...");
  await prisma.teacher.deleteMany();
  for (const [index, item] of TEACHERS_DATA.entries()) {
    await prisma.teacher.create({
      data: {
        name: item.name,
        position: item.position,
        category: mapTeacherCategory(item.category),
        subject: item.subject,
        photo: item.photo,
        description: item.description,
        experience: item.experience,
        sortOrder: index,
      },
    });
  }

  console.log("📝 Seeding School Activities (Calendar)...");
  await prisma.schoolActivity.deleteMany();
  for (const item of SCHOOL_ACTIVITIES_DATA) {
    await prisma.schoolActivity.create({
      data: {
        title: item.title,
        date: new Date(item.date),
        information: item.information,
        semester: item.semester as SemesterType,
        tahunPelajaran: item.tahunPelajaran,
        createdBy: adminUser.id,
      },
    });
  }

  // Sample Data for PPDB and Achievements/Works
  console.log("📝 Seeding Sample PPDB & Student Content...");

  await prisma.pPDBApplication.deleteMany();
  await prisma.pPDBApplication.createMany({
    data: [
      {
        name: "Budi Santoso",
        nisn: "1234567890",
        gender: "MALE",
        birthPlace: "Jakarta",
        birthDate: new Date("2010-05-15"),
        address: "Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta",
        asalSekolah: "SD Negeri 01 Jakarta",
        parentName: "Suharto Santoso",
        parentContact: "081234567890",
        parentEmail: "suharto.santoso@gmail.com",
        status: "PENDING",
      },
      {
        name: "Siti Nurhaliza",
        nisn: "1234567891",
        gender: "FEMALE",
        birthPlace: "Bandung",
        birthDate: new Date("2010-03-20"),
        address: "Jl. Sudirman No. 456, Jakarta Selatan, DKI Jakarta",
        asalSekolah: "SD Swasta ABC",
        parentName: "Ahmad Nurdin",
        parentContact: "081234567891",
        parentEmail: "ahmad.nurdin@gmail.com",
        status: "ACCEPTED",
      },
    ],
  });

  await prisma.studentAchievement.deleteMany();
  await prisma.studentAchievement.createMany({
    data: [
      {
        siswaId: siswaProfile.id,
        title: "Juara 1 Olimpiade Matematika",
        description:
          "Meraih juara 1 dalam Olimpiade Matematika tingkat Jakarta",
        category: "akademik",
        level: "kota",
        achievementDate: new Date("2024-11-15"),
        statusPersetujuan: StatusApproval.APPROVED,
        image:
          "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
      },
      {
        siswaId: osisProfile.id,
        title: "Juara 2 Lomba Karya Tulis Ilmiah",
        description:
          "Meraih juara 2 dalam lomba karya tulis ilmiah tingkat nasional",
        category: "akademik",
        level: "nasional",
        achievementDate: new Date("2024-10-20"),
        statusPersetujuan: StatusApproval.APPROVED,
        image:
          "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
      },
    ],
  });

  await prisma.studentWork.deleteMany();
  await prisma.studentWork.createMany({
    data: [
      {
        siswaId: siswaProfile.id,
        title: "Robot Pembersih Otomatis",
        description:
          "Proyek robotika untuk membuat robot pembersih otomatis menggunakan Arduino",
        workType: "PHOTO",
        category: "teknologi",
        subject: "Prakarya",
        statusPersetujuan: StatusApproval.APPROVED,
        mediaUrl:
          "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
      },
    ],
  });

  // -------------------------------------------------------------
  // Seed Students from Excel
  // -------------------------------------------------------------
  console.log("\n📥 Importing students from Excel...");
  await seedStudentsFromExcel(prisma);

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("👤 Default accounts:");
  console.log("   Admin: admin / admin123");
  console.log("   Kesiswaan: kesiswaan / admin123");
  console.log("   Siswa: siswa001 / admin123");
  console.log("   OSIS: osis001 / admin123");
  console.log("   PPDB: ppdb001 / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
