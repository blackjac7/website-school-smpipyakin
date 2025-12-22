"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole, GenderType } from "@prisma/client";

// Schema for creating/updating a user
const UserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["ADMIN", "SISWA", "KESISWAAN", "OSIS", "PPDB_STAFF"]),

  // Specific fields
  nisn: z.string().optional(), // For Siswa
  class: z.string().optional(), // For Siswa
  osisAccess: z.boolean().optional(), // For Siswa
  nip: z.string().optional(), // For Kesiswaan
  gender: z.enum(["MALE", "FEMALE"]).optional(),
});

export type UserFormData = z.infer<typeof UserSchema>;

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        siswa: true,
        kesiswaan: true,
      },
    });

    // Transform data for the UI
    return {
      success: true,
      data: users.map((user) => ({
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
      })),
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Gagal mengambil data pengguna" };
  }
}

export async function createUser(data: UserFormData) {
  const result = UserSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const { username, password, role, name, email, gender } = result.data;

  if (!password) {
    return { success: false, error: "Password wajib diisi untuk pengguna baru" };
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
      // For ADMIN, OSIS (special role), PPDB_STAFF, we might not have a profile table yet
      // or they are just Users.
      // Note: If 'OSIS' is selected as a distinct role (not Student+Osis),
      // we treat it as a User.
    });

    revalidatePath("/dashboard-admin/users");
    return { success: true, message: "Pengguna berhasil ditambahkan" };
  } catch (error) {
    console.error("Create user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal membuat pengguna";
    return { success: false, error: errorMessage };
  }
}

export async function updateUser(userId: string, data: UserFormData) {
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
              osisAccess: data.osisAccess,
              gender: data.gender as GenderType,
            },
          });
        } else {
             // Handle case where Admin changes someone to Siswa (Optional strictly speaking)
             // But valid for robustness
             if (!data.nisn) throw new Error("NISN required when switching to Siswa");
             await tx.siswa.create({
                 data: {
                     userId,
                     name: data.name,
                     nisn: data.nisn,
                     class: data.class,
                     osisAccess: data.osisAccess || false,
                     gender: (data.gender as GenderType) || "MALE",
                 }
             })
        }

      } else if (data.role === "KESISWAAN") {
          if (existingUser.kesiswaan) {
               await tx.kesiswaan.update({
                where: { userId: userId },
                data: {
                    name: data.name,
                    nip: data.nip,
                    gender: data.gender as GenderType,
                }
               })
          } else {
              if (!data.nip) throw new Error("NIP required when switching to Kesiswaan");
              await tx.kesiswaan.create({
                  data: {
                      userId,
                      name: data.name,
                      nip: data.nip,
                      gender: (data.gender as GenderType) || "MALE",
                  }
              })
          }
      }
    });

    revalidatePath("/dashboard-admin/users");
    return { success: true, message: "Pengguna berhasil diperbarui" };
  } catch (error) {
    console.error("Update user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal memperbarui pengguna";
    return { success: false, error: errorMessage };
  }
}

export async function deleteUser(userId: string) {
  try {
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
