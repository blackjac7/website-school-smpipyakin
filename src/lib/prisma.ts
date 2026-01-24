import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection Pooling for Serverless (Vercel)
// Ensure your DATABASE_URL in .env points to the connection pool (e.g., Supabase Transaction Pooler or Neon Pooling URL)
// For Prisma, we don't need explicit pool config in the client constructor if the URL handles it,
// but using a global singleton is critical to prevent exhausting connections during hot reloads.

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
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

// NOTE: The following types have been removed as they were outdated and not synced with the actual schema:
// - NewsWithAuthor (used 'judul', 'konten', 'slug' but schema uses 'title', 'content', no slug)
// - SchoolActivityWithCreator (used 'judul', 'deskripsi' but schema uses 'title', 'information')
// - StudentAchievementWithSiswa (used 'judul', 'deskripsi', 'tingkat', 'pemberi' but schema uses 'title', 'description', 'level', no 'pemberi')
// Use Prisma generated types with include statements instead for type safety.
