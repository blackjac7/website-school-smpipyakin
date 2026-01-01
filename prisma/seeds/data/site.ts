export const HERO_SLIDES_DATA = [
  {
    title: "Selamat Datang di SMP IP Yakin Jakarta",
    subtitle: "Membentuk Generasi Unggul, Berakhlak, dan Berprestasi",
    imageSmall:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
    imageMedium:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
    linkPrimaryText: "Pelajari Lebih Lanjut",
    linkPrimaryHref: "/profile",
    linkSecondaryText: "Pendaftaran PPDB",
    linkSecondaryHref: "/ppdb",
    isActive: true,
    sortOrder: 0,
  },
  {
    title: "Fasilitas Pembelajaran Modern",
    subtitle: "Mendukung Pengembangan Potensi Siswa",
    imageSmall:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
    imageMedium:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
    linkPrimaryText: "Lihat Fasilitas",
    linkPrimaryHref: "/facilities",
    linkSecondaryText: "Hubungi Kami",
    linkSecondaryHref: "/contact",
    isActive: true,
    sortOrder: 1,
  },
  {
    title: "Prestasi Membanggakan",
    subtitle: "Raih Masa Depan Cemerlang Bersama Kami",
    imageSmall:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    imageMedium:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    linkPrimaryText: "Berita & Prestasi",
    linkPrimaryHref: "/news",
    linkSecondaryText: "Ekstrakurikuler",
    linkSecondaryHref: "/extracurricular",
    isActive: true,
    sortOrder: 2,
  },
];

export const SCHOOL_STATS_DATA = [
  {
    label: "Siswa Aktif",
    value: "450+",
    iconName: "Users",
    isActive: true,
    sortOrder: 0,
  },
  {
    label: "Guru & Staff",
    value: "35+",
    iconName: "GraduationCap",
    isActive: true,
    sortOrder: 1,
  },
  {
    label: "Tahun Berdiri",
    value: "1986",
    iconName: "Calendar",
    isActive: true,
    sortOrder: 2,
  },
  {
    label: "Prestasi",
    value: "100+",
    iconName: "Trophy",
    isActive: true,
    sortOrder: 3,
  },
];

export const SITE_SETTINGS_DATA = [
  // Maintenance Mode
  {
    key: "maintenance.enabled",
    value: "false",
    type: "BOOLEAN",
    category: "maintenance",
    description: "Enable/disable maintenance mode for the entire site",
    isPublic: false,
  },
  {
    key: "maintenance.message",
    value:
      "Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.",
    type: "STRING",
    category: "maintenance",
    description: "Message to display during maintenance",
    isPublic: true,
  },
  // PPDB Settings
  {
    key: "ppdb.enabled",
    value: "false",
    type: "BOOLEAN",
    category: "ppdb",
    description: "Enable/disable PPDB registration",
    isPublic: true,
  },
  {
    key: "ppdb.academicYear",
    value: "2025/2026",
    type: "STRING",
    category: "ppdb",
    description: "Academic year for PPDB",
    isPublic: true,
  },
  {
    key: "ppdb.quota",
    value: "100",
    type: "NUMBER",
    category: "ppdb",
    description: "Maximum number of PPDB registrations",
    isPublic: true,
  },
  {
    key: "ppdb.closedMessage",
    value:
      "Pendaftaran PPDB belum dibuka. Silakan kembali pada periode pendaftaran.",
    type: "STRING",
    category: "ppdb",
    description: "Message when PPDB is closed",
    isPublic: true,
  },
  // General Site Settings
  {
    key: "site.name",
    value: "SMP IP Yakin Jakarta",
    type: "STRING",
    category: "general",
    description: "Site name",
    isPublic: true,
  },
  {
    key: "site.description",
    value: "Sekolah Menengah Pertama dengan pendidikan berkualitas",
    type: "STRING",
    category: "general",
    description: "Site description",
    isPublic: true,
  },
  {
    key: "site.contactEmail",
    value: "info@smpipyakin.sch.id",
    type: "STRING",
    category: "general",
    description: "Contact email",
    isPublic: true,
  },
  {
    key: "site.contactPhone",
    value: "(021) 8091234",
    type: "STRING",
    category: "general",
    description: "Contact phone",
    isPublic: true,
  },
];
