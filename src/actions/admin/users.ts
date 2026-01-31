"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole, GenderType } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

// Helper to verify admin role
async function verifyAdminRole() {
  const user = await getAuthenticatedUser();

  // Use helper to check admin role in a centralized, normalized way
  if (!user || !isAdminRole(user.role)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Admin authorization failed. User role:",
        user?.role,
        "normalized:",
        user?.role ? String(user.role).toLowerCase() : undefined
      );
    }

    return {
      authorized: false,
      error: "Unauthorized: Admin access required",
    };
  }

  return { authorized: true, user };
  return { authorized: true, user };
}

/**
 * Get current authenticated user ID
 * Useful for client components to know who is logged in
 */
export async function getCurrentUserId() {
  const user = await getAuthenticatedUser();
  return user?.userId || null;
}

// Schema for creating/updating a user
const UserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["ADMIN", "SISWA", "KESISWAAN", "OSIS", "PPDB_ADMIN"]),

  // Specific fields
  nisn: z.string().optional(), // For Siswa
  class: z.string().optional(), // For Siswa
  angkatan: z.coerce.number().optional(), // For Siswa
  osisAccess: z.boolean().optional(), // For Siswa
  nip: z.string().optional(), // For Kesiswaan
  gender: z.enum(["MALE", "FEMALE"]).optional(),
});

export type UserFormData = z.infer<typeof UserSchema>;

// Pagination params type
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  classFilter?: string;
  angkatanFilter?: number;
}

// Response type with pagination info
export interface PaginatedUsersResponse {
  success: boolean;
  error?: string;
  data?: {
    users: Array<{
      id: string;
      username: string;
      email: string | null;
      role: string;
      name: string;
      class: string;
      status: string;
      lastLogin: string;
      nisn?: string;
      osisAccess: boolean;
      nip?: string;
      gender?: string;
      angkatan?: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export async function getUsers(
  params?: GetUsersParams
): Promise<PaginatedUsersResponse> {
  // Verify admin authorization
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const {
    page = 1,
    limit = 50,
    search = "",
    role = "",
    classFilter = "",
    angkatanFilter,
  } = params || {};

  try {
    // Build where clause for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Role filter
    if (role && role !== "all") {
      where.role = role;
    }

    // Class filter - for students
    if (classFilter && classFilter !== "all") {
      where.siswa = {
        ...where.siswa,
        class: classFilter,
      };
    }

    // Angkatan filter - for students
    if (angkatanFilter) {
      where.siswa = {
        ...where.siswa,
        angkatan: angkatanFilter,
      };
    }

    // Search filter (search in username, email, and related tables)
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { siswa: { name: { contains: search, mode: "insensitive" } } },
        { siswa: { nisn: { contains: search } } },
        { kesiswaan: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get paginated users - ordered alphabetically by related name
    const users = await prisma.user.findMany({
      where,
      orderBy: [
        { siswa: { name: "asc" } },
        { kesiswaan: { name: "asc" } },
        { username: "asc" },
      ],
      include: {
        siswa: true,
        kesiswaan: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data for the UI
    return {
      success: true,
      data: {
        users: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          // Determine display name based on role relation
          name: user.siswa?.name || user.kesiswaan?.name || user.username,
          // Specific fields
          class: user.siswa?.class || "-",
          status: "Active", // Assuming all users in DB are active for now
          lastLogin: "Never", // You might want to fetch this from LoginAttempt if needed

          // Detailed data for editing
          nisn: user.siswa?.nisn,
          osisAccess: user.siswa?.osisAccess || false,
          nip: user.kesiswaan?.nip,
          gender: user.siswa?.gender || user.kesiswaan?.gender,
          angkatan: user.siswa?.angkatan || undefined,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Gagal mengambil data pengguna" };
  }
}

/**
 * Get all users data for Excel export
 */
export async function getUsersForExport() {
  // Verify admin authorization
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        siswa: true,
        kesiswaan: true,
      },
    });

    // Transform for export
    const exportData = users.map((user) => ({
      username: user.username,
      name: user.siswa?.name || user.kesiswaan?.name || user.username,
      email: user.email,
      role: user.role,
      siswa: user.siswa
        ? {
            name: user.siswa.name,
            nisn: user.siswa.nisn,
            class: user.siswa.class,
            gender: user.siswa.gender,
            osisAccess: user.siswa.osisAccess,
            angkatan: user.siswa.angkatan,
          }
        : undefined,
      kesiswaan: user.kesiswaan
        ? {
            name: user.kesiswaan.name,
            nip: user.kesiswaan.nip,
            gender: user.kesiswaan.gender,
          }
        : undefined,
      createdAt: user.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    console.error("Failed to get users for export:", error);
    return {
      success: false,
      error: "Gagal mengambil data pengguna untuk export",
    };
  }
}

/**
 * Get available classes for filter dropdown
 */
export async function getAvailableClasses(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const classes = await prisma.siswa.findMany({
      where: {
        class: {
          not: null,
        },
      },
      select: {
        class: true,
      },
      distinct: ["class"],
      orderBy: {
        class: "asc",
      },
    });

    const uniqueClasses = classes
      .map((c) => c.class)
      .filter((c): c is string => c !== null);

    return {
      success: true,
      data: uniqueClasses,
    };
  } catch (error) {
    console.error("Failed to get available classes:", error);
    return {
      success: false,
      error: "Gagal mengambil data kelas",
    };
  }
}

/**
 * Get available angkatan for filter dropdown
 */
export async function getAvailableAngkatan(): Promise<{
  success: boolean;
  data?: number[];
  error?: string;
}> {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const angkatanList = await prisma.siswa.findMany({
      where: {
        angkatan: {
          not: null,
        },
      },
      select: {
        angkatan: true,
      },
      distinct: ["angkatan"],
      orderBy: {
        angkatan: "desc",
      },
    });

    const uniqueAngkatan = angkatanList
      .map((a) => a.angkatan)
      .filter((a): a is number => a !== null);

    return {
      success: true,
      data: uniqueAngkatan,
    };
  } catch (error) {
    console.error("Failed to get available angkatan:", error);
    return {
      success: false,
      error: "Gagal mengambil data angkatan",
    };
  }
}

export async function createUser(data: UserFormData) {
  // Verify admin authorization
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const result = UserSchema.safeParse(data);

  if (!result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error: any = result.error;
    return {
      success: false,
      error: error.errors[0]?.message || "Validasi gagal",
    };
  }

  const { username, password, role, name, email, gender } = result.data;

  if (!password) {
    return {
      success: false,
      error: "Password wajib diisi untuk pengguna baru",
    };
  }

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username sudah digunakan" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Create Base User
      const newUser = await tx.user.create({
        data: {
          username,
          email: email || null,
          password: hashedPassword,
          role: role as UserRole,
        },
      });

      // 2. Create Profile based on Role
      if (role === "SISWA") {
        if (!result.data.nisn) throw new Error("NISN wajib untuk siswa");

        await tx.siswa.create({
          data: {
            userId: newUser.id,
            name,
            nisn: result.data.nisn,
            class: result.data.class,
            angkatan: result.data.angkatan,
            gender: (gender as GenderType) || "MALE",
            osisAccess: result.data.osisAccess || false,
          },
        });
      } else if (role === "KESISWAAN") {
        if (!result.data.nip) throw new Error("NIP wajib untuk kesiswaan");

        await tx.kesiswaan.create({
          data: {
            userId: newUser.id,
            name,
            nip: result.data.nip,
            gender: (gender as GenderType) || "MALE",
          },
        });
      }
      // For ADMIN, OSIS (special role), PPDB_ADMIN, we might not have a profile table yet
      // or they are just Users.
      // Note: If 'OSIS' is selected as a distinct role (not Student+Osis),
      // we treat it as a User.
    });

    revalidatePath("/dashboard-admin/users");
    return { success: true, message: "Pengguna berhasil ditambahkan" };
  } catch (error) {
    console.error("Create user error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Gagal membuat pengguna";
    return { success: false, error: errorMessage };
  }
}

export async function updateUser(userId: string, data: UserFormData) {
  // Verify admin authorization
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { siswa: true, kesiswaan: true },
    });

    if (!existingUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // 2. Prepare update data
    const updateData: {
      username: string;
      email: string | null;
      role: UserRole;
      password?: string;
    } = {
      username: data.username,
      email: data.email || null,
      role: data.role as UserRole,
    };

    if (data.password && data.password.length > 0) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.$transaction(async (tx) => {
      // Update User Base
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Update Profile
      if (data.role === "SISWA") {
        // If user was not a siswa before, this might fail if we don't create the profile.
        // For simplicity, we assume role changing that requires profile creation is handled carefully
        // or we upsert.
        if (existingUser.siswa) {
          await tx.siswa.update({
            where: { userId: userId },
            data: {
              name: data.name,
              nisn: data.nisn,
              class: data.class,
              angkatan: data.angkatan,
              osisAccess: data.osisAccess,
              gender: data.gender as GenderType,
            },
          });
        } else {
          // Handle case where Admin changes someone to Siswa (Optional strictly speaking)
          // But valid for robustness
          if (!data.nisn)
            throw new Error("NISN required when switching to Siswa");
          await tx.siswa.create({
            data: {
              userId,
              name: data.name,
              nisn: data.nisn,
              class: data.class,
              angkatan: data.angkatan,
              osisAccess: data.osisAccess || false,
              gender: (data.gender as GenderType) || "MALE",
            },
          });
        }
      } else if (data.role === "KESISWAAN") {
        if (existingUser.kesiswaan) {
          await tx.kesiswaan.update({
            where: { userId: userId },
            data: {
              name: data.name,
              nip: data.nip,
              gender: data.gender as GenderType,
            },
          });
        } else {
          if (!data.nip)
            throw new Error("NIP required when switching to Kesiswaan");
          await tx.kesiswaan.create({
            data: {
              userId,
              name: data.name,
              nip: data.nip,
              gender: (data.gender as GenderType) || "MALE",
            },
          });
        }
      }
    });

    revalidatePath("/dashboard-admin/users");
    return { success: true, message: "Pengguna berhasil diperbarui" };
  } catch (error) {
    console.error("Update user error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Gagal memperbarui pengguna";
    return { success: false, error: errorMessage };
  }
}

export async function deleteUser(userId: string) {
  // Verify admin authorization
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    if (auth.user?.userId === userId) {
        return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/dashboard-admin/users");
    return { success: true, message: "Pengguna berhasil dihapus" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Gagal menghapus pengguna" };
  }
}

/**
 * Bulk delete multiple users
 */
export async function bulkDeleteUsers(userIds: string[]) {
  // Verify admin authorization
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  if (!userIds || userIds.length === 0) {
    return { success: false, error: "Tidak ada pengguna yang dipilih" };
  }

  try {
    // Filter out self if included
    const idsToDelete = userIds.filter(id => id !== auth.user?.userId);
    
    if (idsToDelete.length === 0) {
        return { success: false, error: "Tidak ada pengguna yang dapat dihapus (Anda tidak dapat menghapus diri sendiri)" };
    }

    // Delete users in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First delete related records (Siswa, Kesiswaan) - cascade should handle this
      // but we explicitly delete to be safe
      await tx.siswa.deleteMany({
        where: { userId: { in: idsToDelete } },
      });

      await tx.kesiswaan.deleteMany({
        where: { userId: { in: idsToDelete } },
      });

      // Then delete the users
      const deleted = await tx.user.deleteMany({
        where: { id: { in: idsToDelete } },
      });

      return deleted;
    });

    revalidatePath("/dashboard-admin/users");
    return {
      success: true,
      message: `${result.count} pengguna berhasil dihapus`,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error("Bulk delete users error:", error);
    return { success: false, error: "Gagal menghapus pengguna" };
  }
}
