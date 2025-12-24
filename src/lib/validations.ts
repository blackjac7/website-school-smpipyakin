/**
 * Centralized Zod Validation Schemas
 * Reusable schemas for API validation across the application
 */

import { z } from "zod";

// ==========================================
// Common Schemas
// ==========================================

export const idSchema = z.string().cuid();
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  ...paginationSchema.shape,
});

// ==========================================
// User & Auth Schemas
// ==========================================

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh berisi huruf, angka, dan underscore"
    ),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
  captcha: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung huruf besar")
      .regex(/[a-z]/, "Password harus mengandung huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung angka")
      .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter khusus"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sesuai",
    path: ["confirmPassword"],
  });

export const userCreateSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh berisi huruf, angka, dan underscore"
    ),
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  role: z.enum(["admin", "kesiswaan", "osis", "siswa", "ppdb"]),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  id: idSchema,
});

// ==========================================
// Content Schemas (News, Announcements, etc.)
// ==========================================

export const newsCreateSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .min(20, "Konten minimal 20 karakter")
    .max(50000, "Konten maksimal 50000 karakter"),
  excerpt: z.string().max(500, "Ringkasan maksimal 500 karakter").optional(),
  image: z.string().url("URL gambar tidak valid").optional(),
  category: z.string().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.coerce.date().optional(),
});

export const newsUpdateSchema = newsCreateSchema.partial().extend({
  id: idSchema,
});

export const announcementCreateSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .min(10, "Konten minimal 10 karakter")
    .max(10000, "Konten maksimal 10000 karakter"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export const announcementUpdateSchema = announcementCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

// ==========================================
// Academic Schemas
// ==========================================

export const calendarEventSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  allDay: z.boolean().default(false),
  category: z
    .enum(["academic", "holiday", "exam", "event", "meeting"])
    .default("event"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna tidak valid")
    .optional(),
});

// ==========================================
// Teacher Schema
// ==========================================

export const teacherSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  nip: z.string().max(30, "NIP maksimal 30 karakter").optional(),
  position: z.string().max(100, "Jabatan maksimal 100 karakter").optional(),
  subject: z
    .string()
    .max(100, "Mata pelajaran maksimal 100 karakter")
    .optional(),
  photo: z.string().url("URL foto tidak valid").optional(),
  email: z.string().email("Email tidak valid").optional(),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid")
    .optional(),
  bio: z.string().max(1000, "Bio maksimal 1000 karakter").optional(),
  isActive: z.boolean().default(true),
});

// ==========================================
// PPDB Schemas
// ==========================================

export const ppdbRegistrationSchema = z.object({
  // Data Pribadi
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter").max(100),
  birthPlace: z.string().min(2, "Tempat lahir minimal 2 karakter").max(100),
  birthDate: z.coerce.date(),
  gender: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih" }),
  religion: z.string().min(1, "Agama wajib diisi"),
  nisn: z
    .string()
    .length(10, "NISN harus 10 digit")
    .regex(/^[0-9]+$/, "NISN hanya boleh berisi angka"),

  // Alamat
  address: z.string().min(10, "Alamat minimal 10 karakter").max(500),
  province: z.string().min(1, "Provinsi wajib diisi"),
  city: z.string().min(1, "Kota/Kabupaten wajib diisi"),
  district: z.string().min(1, "Kecamatan wajib diisi"),
  postalCode: z
    .string()
    .length(5, "Kode pos harus 5 digit")
    .regex(/^[0-9]+$/, "Kode pos hanya boleh berisi angka"),

  // Data Orang Tua/Wali
  fatherName: z.string().min(3, "Nama ayah minimal 3 karakter").max(100),
  fatherPhone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon ayah tidak valid"),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(3, "Nama ibu minimal 3 karakter").max(100),
  motherPhone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon ibu tidak valid"),
  motherOccupation: z.string().optional(),

  // Asal Sekolah
  previousSchool: z
    .string()
    .min(3, "Nama sekolah asal minimal 3 karakter")
    .max(200),
  previousSchoolAddress: z.string().max(500).optional(),

  // Kontak
  email: z.string().email("Email tidak valid"),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid"),
});

// ==========================================
// Contact Form Schema
// ==========================================

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid")
    .optional(),
  subject: z
    .string()
    .min(5, "Subjek minimal 5 karakter")
    .max(200, "Subjek maksimal 200 karakter"),
  message: z
    .string()
    .min(20, "Pesan minimal 20 karakter")
    .max(5000, "Pesan maksimal 5000 karakter"),
});

// ==========================================
// Student Work Schema
// ==========================================

export const studentWorkSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  description: z
    .string()
    .max(2000, "Deskripsi maksimal 2000 karakter")
    .optional(),
  category: z
    .enum(["art", "writing", "science", "technology", "other"])
    .default("other"),
  image: z.string().url("URL gambar tidak valid").optional(),
  videoUrl: z.string().url("URL video tidak valid").optional(),
  studentName: z.string().min(2, "Nama siswa minimal 2 karakter").max(100),
  class: z.string().max(20, "Kelas maksimal 20 karakter").optional(),
  isApproved: z.boolean().default(false),
});

// ==========================================
// File Upload Schema
// ==========================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    "Ukuran file maksimal 5MB"
  ),
  folder: z.string().optional(),
});

export const imageUploadSchema = fileUploadSchema.extend({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Ukuran gambar maksimal 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        ),
      "Format gambar harus JPEG, PNG, WebP, atau GIF"
    ),
});

// ==========================================
// API Response Schema
// ==========================================

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    meta: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
      })
      .optional(),
  });

// ==========================================
// Type Exports
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type PPDBRegistrationInput = z.infer<typeof ppdbRegistrationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type StudentWorkInput = z.infer<typeof studentWorkSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
