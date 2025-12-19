export interface Teacher {
  id: string;
  name: string;
  position: string;
  category: "Pimpinan" | "Guru Mata Pelajaran" | "Staff";
  photo: string;
  subject?: string;
  description?: string;
  experience?: string;
}

const MAN_AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop";
const WOMAN_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop";

export const teachers: Teacher[] = [
  {
    id: "1",
    name: "Muhamad Abduh, S.T.",
    position: "Kepala Sekolah",
    category: "Pimpinan",
    subject: "Informatika",
    photo: MAN_AVATAR,
    description: "Memimpin dengan inovasi teknologi dan hati.",
    experience: "15"
  },
  {
    id: "23",
    name: "Edy Supandi",
    position: "Kepala Tata Usaha",
    category: "Staff",
    photo: MAN_AVATAR,
    description: "Mengelola administrasi sekolah dengan profesional."
  },
  {
    id: "24",
    name: "Santi",
    position: "Operator Sekolah",
    category: "Staff",
    photo: WOMAN_AVATAR,
    description: "Menangani pendataan dan sistem informasi sekolah."
  },
  {
    id: "2",
    name: "Reti Sibagariang, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPS",
    photo: WOMAN_AVATAR
  },
  {
    id: "3",
    name: "Abdulloh Syapii, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Kesiswaan",
    category: "Pimpinan",
    subject: "PAI",
    photo: MAN_AVATAR,
    description: "Membentuk karakter siswa yang berakhlak mulia."
  },
  {
    id: "4",
    name: "Megawati, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Kurikulum",
    category: "Pimpinan",
    subject: "Matematika",
    photo: WOMAN_AVATAR,
    description: "Menyusun kurikulum yang adaptif dan progresif."
  },
  {
    id: "5",
    name: "Hannystira, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Indonesia",
    photo: WOMAN_AVATAR
  },
  {
    id: "6",
    name: "Ilim Hilimudin",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Prakarya / Informatika / Koding",
    photo: MAN_AVATAR
  },
  {
    id: "7",
    name: "Arif Darmawan, M.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPS",
    photo: MAN_AVATAR
  },
  {
    id: "8",
    name: "Drs. Subino",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "PKN",
    photo: MAN_AVATAR
  },
  {
    id: "9",
    name: "Umi Sultra, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPA",
    photo: WOMAN_AVATAR
  },
  {
    id: "10",
    name: "Eti Fitriah, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "IPA",
    photo: WOMAN_AVATAR
  },
  {
    id: "11",
    name: "Wiwi Rohayati, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Matematika",
    photo: WOMAN_AVATAR
  },
  {
    id: "12",
    name: "Petra",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Seni",
    photo: WOMAN_AVATAR
  },
  {
    id: "13",
    name: "Mei Megawati, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Indonesia",
    photo: WOMAN_AVATAR
  },
  {
    id: "14",
    name: "Sawitri Handayani, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Inggris",
    photo: WOMAN_AVATAR
  },
  {
    id: "15",
    name: "Anita Permatasari, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "PKN",
    photo: WOMAN_AVATAR
  },
  {
    id: "16",
    name: "Yumelda Listiana, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Inggris",
    photo: WOMAN_AVATAR
  },
  {
    id: "17",
    name: "Marzuki, S.Pd.",
    position: "Wakil Kepala Sekolah Bidang Pembina OSIS",
    category: "Pimpinan",
    subject: "PJOK",
    photo: MAN_AVATAR,
    description: "Mengembangkan potensi kepemimpinan siswa."
  },
  {
    id: "18",
    name: "Muhammad Pebrian Syah",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "PJOK",
    photo: MAN_AVATAR
  },
  {
    id: "19",
    name: "Abdul Rahman, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bimbingan Konseling",
    photo: MAN_AVATAR
  },
  {
    id: "20",
    name: "Siti Humairoh, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Bahasa Indonesia",
    photo: WOMAN_AVATAR
  },
  {
    id: "21",
    name: "Intan Maharani, S.Pd.",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Matematika",
    photo: WOMAN_AVATAR
  },
  {
    id: "22",
    name: "Febriansyah",
    position: "Guru Mata Pelajaran",
    category: "Guru Mata Pelajaran",
    subject: "Koding",
    photo: MAN_AVATAR
  }
];
