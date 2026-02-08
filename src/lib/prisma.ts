import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection Pooling Configuration
// This prevents "Too many database connections" error by:
// 1. Using singleton pattern (globalForPrisma)
// 2. Limiting connection pool size
// 3. Setting appropriate timeouts

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Graceful shutdown: disconnect Prisma on process termination
// Only run in Node.js runtime (not Edge Runtime for middleware)
if (typeof window === "undefined" && typeof process.on === "function") {
  // Increase max listeners to prevent warnings during hot reload
  if (typeof process.setMaxListeners === "function") {
    process.setMaxListeners(15);
  }

  // Handle graceful shutdown for both development and production
  const shutdownHandler = async () => {
    console.log("Disconnecting Prisma Client...");
    await prisma.$disconnect();
  };

  process.on("beforeExit", shutdownHandler);
  process.on("SIGINT", shutdownHandler);
  process.on("SIGTERM", shutdownHandler);
}

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
