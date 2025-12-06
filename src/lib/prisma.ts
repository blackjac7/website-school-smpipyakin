import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// Utility types for better type safety
export type UserWithRelations = {
  id: string;
  username: string;
  email?: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  siswa?: {
    id: string;
    nis: string;
    nama: string;
    kelas: string;
    jurusan: string;
    tahunMasuk: number;
    gender: string;
    tempatLahir: string;
    tanggalLahir: Date;
    alamat: string;
    telepon?: string | null;
    email?: string | null;
    namaWali: string;
    pekerjaanWali: string;
    teleponWali: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  kesiswaan?: {
    id: string;
    nama: string;
    jabatan: string;
    telepon?: string | null;
    email?: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

export type SiswaWithUser = {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jurusan: string;
  tahunMasuk: number;
  gender: string;
  tempatLahir: string;
  tanggalLahir: Date;
  alamat: string;
  telepon?: string | null;
  email?: string | null;
  namaWali: string;
  pekerjaanWali: string;
  teleponWali: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    email?: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  achievements?: {
    id: string;
    judul: string;
    deskripsi?: string | null;
    tingkat: string;
    tanggal: Date;
    pemberi: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export type NewsWithAuthor = {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt?: string | null;
  gambar?: string | null;
  kategori: string;
  status: string;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    email?: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type SchoolActivityWithCreator = {
  id: string;
  judul: string;
  deskripsi?: string | null;
  tanggal: Date;
  waktu?: string | null;
  lokasi?: string | null;
  gambar?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    username: string;
    email?: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type StudentAchievementWithSiswa = {
  id: string;
  judul: string;
  deskripsi?: string | null;
  tingkat: string;
  tanggal: Date;
  pemberi: string;
  createdAt: Date;
  updatedAt: Date;
  siswa: {
    id: string;
    nis: string;
    nama: string;
    kelas: string;
    jurusan: string;
    tahunMasuk: number;
    gender: string;
    tempatLahir: string;
    tanggalLahir: Date;
    alamat: string;
    telepon?: string | null;
    email?: string | null;
    namaWali: string;
    pekerjaanWali: string;
    teleponWali: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      username: string;
      email?: string | null;
      role: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  };
};
